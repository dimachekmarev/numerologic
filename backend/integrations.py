"""Verified inbound callbacks, transactional outgoing webhooks and payment recovery."""

import asyncio
import hashlib
import hmac
import json
import logging
import os
import time
from contextlib import asynccontextmanager
from datetime import timedelta

import httpx
import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy import String, Text, select
from sqlalchemy.orm import Mapped, Session, mapped_column

log = logging.getLogger("numerologic.integrations")


def register_integrations(m):
    class Outbox(m.Base):
        __tablename__ = "webhook_outbox"
        key: Mapped[str] = mapped_column(String(128), primary_key=True)
        payload: Mapped[str] = mapped_column(Text)
        attempts: Mapped[int] = mapped_column(default=0)
        delivered: Mapped[bool] = mapped_column(default=False)
        next_try: Mapped[object] = mapped_column(m.DateTime, default=m.now)

    m.Base.metadata.create_all(m.engine)

    def enqueue(db, event, key, properties):
        if not os.getenv("FUNNEL_WEBHOOK_URL"):
            return
        if not db.get(Outbox, key):
            db.add(
                Outbox(
                    key=key,
                    payload=json.dumps(
                        dict(
                            id=key,
                            event=event,
                            created_at=m.now().isoformat(),
                            properties=properties,
                        ),
                        ensure_ascii=False,
                    ),
                )
            )

    m.enqueue = enqueue
    jwks_cache = {"time": 0, "keys": []}

    def verify_yandex(token):
        try:
            head = jwt.get_unverified_header(token)
            if head.get("alg") != "ES256" or head.get("typ") != "JWT":
                raise ValueError()
            # Yandex puts validity timestamps in the JOSE header.
            if int(head.get("exp", 0)) < time.time() or int(head.get("iat", 0)) > time.time() + 60:
                raise ValueError()
            host = (
                "https://sandbox.pay.yandex.ru"
                if os.getenv("YANDEX_PAY_SANDBOX", "true") == "true"
                else "https://pay.yandex.ru"
            )
            if jwks_cache["time"] < time.time() - 3600 or not any(
                k["kid"] == head.get("kid") for k in jwks_cache["keys"]
            ):
                r = httpx.get(host + "/api/jwks", timeout=10)
                r.raise_for_status()
                jwks_cache.update(time=time.time(), keys=r.json()["keys"])
            key = next(k for k in jwks_cache["keys"] if k["kid"] == head["kid"])
            payload = jwt.decode(
                token,
                jwt.PyJWK.from_dict(key).key,
                algorithms=["ES256"],
                options={"verify_aud": False},
            )
            if payload.get("merchantId") != os.getenv("YANDEX_PAY_MERCHANT_ID"):
                raise ValueError()
            return payload
        except (jwt.PyJWTError, ValueError, KeyError, StopIteration, httpx.HTTPError):
            raise HTTPException(401, "Invalid Yandex Pay signature")

    m.verify_yandex = verify_yandex

    @m.app.post("/api/payments/yandex/v1/webhook")
    async def yandex_webhook(request: Request, db: Session = Depends(m.db_session)):
        if m.PROVIDER != "yandex":
            raise HTTPException(404)
        raw = await request.body()
        if len(raw) > 100000:
            raise HTTPException(413)
        try:
            token = raw.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(401, "Invalid callback encoding")
        payload = await asyncio.to_thread(verify_yandex, token)
        pid = payload.get("order", {}).get("orderId") or payload.get("operation", {}).get("orderId")
        order = (
            db.scalar(select(m.Order).where(m.Order.payment_id == pid))
            if isinstance(pid, str)
            else None
        )
        # Trust only the authenticated provider's current status, never callback status alone.
        if order:
            await asyncio.to_thread(m.reconcile, order, db, True)
        return {"status": "success", "code": 200, "data": {}}

    def process_pending():
        if m.PROVIDER not in ("yandex", "yookassa"):
            return
        with m.Sessions() as db:
            orders = db.scalars(
                select(m.Order)
                .where(m.Order.status == "pending", m.Order.payment_id.is_not(None))
                .order_by(m.Order.id)
                .limit(100)
            ).all()
            for order in orders:
                try:
                    m.reconcile(order, db)
                except Exception:
                    db.rollback()
                    log.warning("Payment reconciliation failed for order %s", order.id)

    def deliver():
        target = os.getenv("FUNNEL_WEBHOOK_URL", "")
        secret = os.getenv("FUNNEL_WEBHOOK_SECRET", "")
        if not target or not secret:
            return
        if not target.startswith("https://"):
            log.error("Funnel destination must use HTTPS")
            return
        with m.Sessions() as db:
            events = db.scalars(
                select(Outbox)
                .where(
                    Outbox.delivered.is_(False),
                    Outbox.next_try <= m.now(),
                    Outbox.attempts < 8,
                )
                .limit(50)
            ).all()
            for e in events:
                signature = hmac.new(
                    secret.encode(), e.payload.encode(), hashlib.sha256
                ).hexdigest()
                try:
                    r = httpx.post(
                        target,
                        content=e.payload.encode(),
                        headers={
                            "Content-Type": "application/json",
                            "X-Numerologic-Signature": "sha256=" + signature,
                            "X-Numerologic-Event-ID": e.key,
                        },
                        timeout=10,
                        follow_redirects=False,
                    )
                    r.raise_for_status()
                    e.delivered = True
                except httpx.HTTPError:
                    e.attempts += 1
                    e.next_try = m.now() + timedelta(seconds=min(3600, 30 * 2**e.attempts))
                db.commit()

    async def worker():
        while True:
            try:
                await asyncio.to_thread(process_pending)
                await asyncio.to_thread(deliver)
            except Exception:
                log.exception("Integration worker will retry on the next cycle")
            await asyncio.sleep(60)

    @asynccontextmanager
    async def lifespan(app):
        task = asyncio.create_task(worker())
        yield
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    m.app.router.lifespan_context = lifespan
    m.deliver_outbox = deliver
