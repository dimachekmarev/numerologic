import json
import os
import sys
import tempfile
import uuid
from datetime import date, timedelta
from pathlib import Path

import pytest

os.environ["DATABASE_URL"] = "sqlite:///" + tempfile.mktemp(suffix=".sqlite3")
os.environ["PAYMENT_PROVIDER"] = "mock"
os.environ["APP_ENV"] = "test"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main as m
from fastapi.testclient import TestClient
from sqlalchemy import func, select

H = {"X-Numerologic-Client": "web"}


@pytest.fixture(autouse=True)
def reset_request_limits():
    m.limits.clear()


@pytest.fixture
def client():
    c = TestClient(m.app, headers=H)
    assert c.post("/api/auth/session").status_code == 200
    assert (
        c.post(
            "/api/auth/register",
            json={
                "email": uuid.uuid4().hex + "@example.com",
                "password": "correct-horse-battery",
            },
        ).status_code
        == 200
    )
    assert (
        c.post(
            "/api/quiz/complete",
            json={"name": "Анна", "birth_date": "1995-05-02", "focus": "Ясность"},
        ).status_code
        == 200
    )
    return c


def purchase(client, slug="deep-reading"):
    return client.post(
        "/api/checkout/create",
        json={
            "product_slug": slug,
            "customer": {"name": "Анна", "birth_date": "1995-05-02"},
            "consent": True,
            "request_key": uuid.uuid4().hex,
        },
    )


def paid(client, slug="deep-reading"):
    r = purchase(client, slug)
    assert r.status_code == 200, r.text
    r = client.post("/api/checkout/mock-success", json={"order_id": r.json()["order_id"]})
    assert r.status_code == 200, r.text
    return r.json()


def test_reduces_each_digit_and_matches_user_master_rule():
    assert m.calc_profile("Дмитрий", "1984-05-02", date(2026, 10, 5))["life_path"] == 11
    assert m.reduce_number(11) == 2 and m.reduce_number(22) == 4 and m.reduce_number(33) == 6
    assert m.calc_profile("Анна", "1995-05-02", date(2026, 10, 5))["life_path"] == 4


@pytest.mark.parametrize("birth", ["2026-02-30", "1899-01-01", "2099-01-01", "not-a-date"])
def test_invalid_dates_never_get_default_reading(client, birth):
    r = client.post("/api/quiz/complete", json={"name": "Анна", "birth_date": birth})
    assert r.status_code == 422


def test_session_cookie_not_readable_by_scripts(client):
    r = client.post(
        "/api/auth/login",
        json={"email": "not@existing.com", "password": "incorrect-password"},
    )
    assert r.status_code == 401
    c = TestClient(m.app, headers=H)
    r = c.post("/api/auth/session")
    assert "HttpOnly" in r.headers["set-cookie"] and "SameSite=lax" in r.headers["set-cookie"]


def test_order_report_and_pdf_are_owner_only(client):
    result = paid(client)
    other = TestClient(m.app, headers=H)
    other.post("/api/auth/session")
    assert other.get(f"/api/orders/{result['order_id']}").status_code == 404
    assert other.get(f"/api/reports/{result['report_id']}").status_code == 404
    assert other.get(f"/api/reports/{result['report_id']}/pdf").status_code == 404
    assert (
        other.post("/api/checkout/mock-success", json={"order_id": result["order_id"]}).status_code
        == 404
    )
    assert client.get(f"/api/reports/{result['report_id']}/pdf").content.startswith(b"%PDF")


def test_paid_callback_is_idempotent(client):
    result = paid(client, "club")
    for _ in range(3):
        r = client.post("/api/checkout/mock-success", json={"order_id": result["order_id"]})
        assert r.json() == result
    with m.Sessions() as db:
        assert (
            db.scalar(
                select(func.count())
                .select_from(m.Report)
                .where(m.Report.order_id == result["order_id"])
            )
            == 1
        )
        assert (
            db.scalar(
                select(func.count())
                .select_from(m.Membership)
                .where(m.Membership.order_id == result["order_id"])
            )
            == 1
        )


def test_price_is_from_server_and_no_unimplemented_addons(client):
    body = {
        "product_slug": "club",
        "customer": {"name": "Анна", "birth_date": "1995-05-02"},
        "consent": True,
        "request_key": uuid.uuid4().hex,
        "amount": 1,
    }
    r = client.post("/api/checkout/create", json=body)
    assert r.json()["total_amount"] == 1000
    body["addons"] = ["audio"]
    r = client.post("/api/checkout/create", json=body)
    assert r.status_code == 422


def test_checkout_request_retry_reuses_order(client):
    body = {
        "product_slug": "club",
        "customer": {"name": "Анна", "birth_date": "1995-05-02"},
        "consent": True,
        "request_key": uuid.uuid4().hex,
    }
    a = client.post("/api/checkout/create", json=body).json()
    b = client.post("/api/checkout/create", json=body).json()
    assert a["order_id"] == b["order_id"]
    body["product_slug"] = "deep-reading"
    assert client.post("/api/checkout/create", json=body).status_code == 409


def test_guest_cannot_buy_and_missing_consent_rejected():
    c = TestClient(m.app, headers=H)
    c.post("/api/auth/session")
    assert purchase(c).status_code == 403


def test_compatibility_purchase_requires_partner(client):
    assert purchase(client, "compatibility").status_code == 422


def test_no_paid_privileges_when_service_disabled(client, monkeypatch):
    monkeypatch.setattr(m, "PROVIDER", "disabled")
    assert purchase(client).status_code == 503
    assert client.post("/api/checkout/mock-success", json={"order_id": 1}).status_code == 404


def test_journal_replaces_same_day_and_is_private(client):
    body = {
        "day": date.today().isoformat(),
        "mood": 4,
        "text": "Личная запись",
        "done": True,
    }
    for text in ["Первый вариант", "Личная запись"]:
        body["text"] = text
        assert client.post("/api/journal", json=body).status_code == 200
    assert len(client.get("/api/dashboard").json()["entries"]) == 1
    other = TestClient(m.app, headers=H)
    other.post("/api/auth/session")
    assert other.get("/api/dashboard").json()["entries"] == []


def test_paid_practice_unlock_progress_and_expiry(client):
    a = client.get("/api/practices/boundaries").json()
    assert len(a["days"]) == 1 and not a["unlocked"]
    assert (
        client.post(
            "/api/progress", json={"slug": "boundaries", "index": 1, "done": True}
        ).status_code
        == 403
    )
    paid(client, "club")
    a = client.get("/api/practices/boundaries").json()
    assert len(a["days"]) == 7 and a["unlocked"]
    assert (
        client.post(
            "/api/progress", json={"slug": "boundaries", "index": 1, "done": True}
        ).status_code
        == 200
    )
    user = client.get("/api/me").json()["id"]
    with m.Sessions() as db:
        for sub in db.scalars(select(m.Membership).where(m.Membership.user_id == user)):
            sub.expires = m.now() - timedelta(days=1)
        db.commit()
    assert not client.get("/api/practices/boundaries").json()["unlocked"]
    paid(client, "boundaries")
    assert client.get("/api/practices/boundaries").json()["unlocked"]


def test_goal_ownership_and_calendar(client):
    r = client.post("/api/goals", json={"title": "Первый шаг", "due": "2026-10-06", "done": False})
    assert r.status_code == 200
    other = TestClient(m.app, headers=H)
    other.post("/api/auth/session")
    g = r.json()
    g["done"] = True
    assert other.post("/api/goals", json=g).status_code == 404
    assert other.delete("/api/goals/" + str(g["id"])).status_code == 404
    calendar = client.get("/api/calendar?month=2026-10").json()
    assert len(calendar["days"]) == 31
    assert calendar["days"][5]["goals"][0]["title"] == "Первый шаг"


def test_csrf_and_analytics_do_not_receive_private_fields(client):
    assert TestClient(m.app).post("/api/auth/session").status_code == 403
    assert (
        client.post("/api/auth/session", headers={"Origin": "https://evil.example"}).status_code
        == 403
    )
    assert (
        client.post(
            "/api/events",
            json={
                "event": "quiz_completed",
                "properties": {
                    "name": "secret",
                    "birth_date": "2000-01-01",
                    "product": "club",
                },
            },
        ).status_code
        == 200
    )
    assert client.get("/api/admin/metrics").status_code == 403


def test_ai_requires_membership_and_config(client, monkeypatch):
    assert client.post("/api/assistant", json={"message": "Помоги"}).status_code == 403
    paid(client, "club")
    monkeypatch.delenv("AI_API_KEY", raising=False)
    assert client.post("/api/assistant", json={"message": "Помоги"}).status_code == 503


def test_provider_success_checks_amount_and_current_status(client, monkeypatch):
    r = purchase(client)
    oid = r.json()["order_id"]
    monkeypatch.setattr(m, "PROVIDER", "yookassa")
    monkeypatch.setattr(
        m,
        "provider_request",
        lambda *a, **k: {
            "id": f"test-{oid}",
            "metadata": {"order_id": str(oid)},
            "amount": {"value": "1.00", "currency": "RUB"},
            "status": "succeeded",
            "paid": True,
        },
    )
    assert client.get(f"/api/orders/{oid}").status_code == 400
    monkeypatch.setattr(
        m,
        "provider_request",
        lambda *a, **k: {
            "id": f"test-{oid}",
            "metadata": {"order_id": str(oid)},
            "amount": {"value": "2490.00", "currency": "RUB"},
            "status": "pending",
            "paid": False,
        },
    )
    assert client.get(f"/api/orders/{oid}").json()["status"] == "pending"
    monkeypatch.setattr(
        m,
        "provider_request",
        lambda *a, **k: {
            "id": f"test-{oid}",
            "metadata": {"order_id": str(oid)},
            "amount": {"value": "2490.00", "currency": "RUB"},
            "status": "succeeded",
            "paid": True,
        },
    )
    assert client.get(f"/api/orders/{oid}").json()["status"] == "paid"


def test_delete_account_revokes_session_and_private_data(client):
    assert client.delete("/api/me").status_code == 200
    assert client.get("/api/me").status_code == 401


def test_yandex_captured_is_bound_to_merchant_and_amount(client, monkeypatch):
    order = purchase(client)
    oid = order.json()["order_id"]
    monkeypatch.setattr(m, "PROVIDER", "yandex")
    monkeypatch.setenv("YANDEX_PAY_MERCHANT_ID", "shop-1")
    response = {
        "orderId": f"test-{oid}",
        "merchantId": "shop-1",
        "orderAmount": "2490.00",
        "currencyCode": "RUB",
        "paymentStatus": "AUTHORIZED",
    }
    monkeypatch.setattr(m, "yandex_request", lambda *a, **k: {"order": response})
    assert client.get(f"/api/orders/{oid}").json()["status"] == "pending"
    response["orderAmount"] = "1.00"
    response["paymentStatus"] = "CAPTURED"
    assert client.get(f"/api/orders/{oid}").status_code == 400
    response["orderAmount"] = "2490.00"
    response["merchantId"] = "other"
    assert client.get(f"/api/orders/{oid}").status_code == 400
    response["merchantId"] = "shop-1"
    assert client.get(f"/api/orders/{oid}").json()["status"] == "paid"


def test_yandex_webhook_verifies_es256_and_expiry(monkeypatch):
    import time

    import jwt
    from cryptography.hazmat.primitives.asymmetric import ec
    from jwt.algorithms import ECAlgorithm

    private = ec.generate_private_key(ec.SECP256R1())
    key = json.loads(ECAlgorithm.to_jwk(private.public_key()))
    key["kid"] = "unit-test-key"

    class Keys:
        def raise_for_status(self):
            pass

        def json(self):
            return {"keys": [key]}

    monkeypatch.setenv("YANDEX_PAY_MERCHANT_ID", "unit-shop")
    monkeypatch.setattr(m.httpx, "get", lambda *a, **k: Keys())
    token = jwt.encode(
        {"merchantId": "unit-shop"},
        private,
        algorithm="ES256",
        headers={
            "kid": "unit-test-key",
            "iat": int(time.time()),
            "exp": int(time.time() + 60),
            "typ": "JWT",
        },
    )
    assert m.verify_yandex(token)["merchantId"] == "unit-shop"
    bad = jwt.encode(
        {"merchantId": "unit-shop"},
        private,
        algorithm="ES256",
        headers={
            "kid": "unit-test-key",
            "iat": int(time.time() - 120),
            "exp": int(time.time() - 60),
            "typ": "JWT",
        },
    )
    with pytest.raises(m.HTTPException):
        m.verify_yandex(bad)
    wrong = jwt.encode(
        {"merchantId": "other"},
        private,
        algorithm="ES256",
        headers={
            "kid": "unit-test-key",
            "iat": int(time.time()),
            "exp": int(time.time() + 60),
            "typ": "JWT",
        },
    )
    with pytest.raises(m.HTTPException):
        m.verify_yandex(wrong)


def test_ai_quota_is_enforced_and_failed_request_releases_slot(client, monkeypatch):
    paid(client, "club")
    monkeypatch.setenv("AI_API_KEY", "unit-key")

    class Answer:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "choices": [{"message": {"content": "Попробуйте записать один небольшой шаг."}}]
            }

    monkeypatch.setattr(m.httpx, "post", lambda *a, **k: Answer())
    for i in range(10):
        r = client.post("/api/assistant", json={"message": "Помоги найти первый шаг"})
        assert r.status_code == 200
    assert client.post("/api/assistant", json={"message": "Ещё"}).status_code == 429


def test_outgoing_hook_is_signed_and_contains_no_private_data(client, monkeypatch):
    import hashlib
    import hmac

    monkeypatch.setenv("FUNNEL_WEBHOOK_URL", "https://automation.example.com/webhook/numerologic")
    monkeypatch.setenv("FUNNEL_WEBHOOK_SECRET", "unit-secret")
    calls = []

    class Response:
        def raise_for_status(self):
            pass

    def send(url, **kwargs):
        calls.append(kwargs)
        return Response()

    monkeypatch.setattr(m.httpx, "post", send)
    result = paid(client, "boundaries")
    m.deliver_outbox()
    assert calls
    body = calls[-1]["content"]
    expected = "sha256=" + hmac.new(b"unit-secret", body, hashlib.sha256).hexdigest()
    assert calls[-1]["headers"]["X-Numerologic-Signature"] == expected
    payload = json.loads(body)
    assert payload["id"] == f"order-paid-{result['order_id']}"
    assert "Анна" not in body.decode() and "1995" not in body.decode()
    m.deliver_outbox()
    assert len(calls) == 1


def test_full_refund_revokes_paid_report_and_membership(client):
    result = paid(client, "club")
    with m.Sessions() as db:
        order = db.get(m.Order, result["order_id"])
        assert m.revoke_order(order, db)["status"] == "refunded"
        assert m.revoke_order(order, db)["status"] == "refunded"
    assert not client.get("/api/dashboard").json()["club"]
    assert client.get(f"/api/reports/{result['report_id']}").status_code == 404


def test_export_includes_older_than_sixty_entries(client):
    user_id = client.get("/api/me").json()["id"]
    with m.Sessions() as db:
        for index in range(65):
            db.add(
                m.Entry(
                    user_id=user_id,
                    day=(date.today() - timedelta(days=index)).isoformat(),
                    text=f"Запись {index}",
                    mood=3,
                    done=False,
                )
            )
        db.commit()
    assert len(client.get("/api/dashboard").json()["entries"]) == 60
    assert len(client.get("/api/export").json()["entries"]) == 65


def test_ai_history_survives_reload_and_is_private(client, monkeypatch):
    paid(client, "club")
    monkeypatch.setenv("AI_API_KEY", "test-key")
    calls = []

    class Answer:
        def raise_for_status(self):
            pass

        def json(self):
            return {"choices": [{"message": {"content": "Попробуйте начать с одного вопроса."}}]}

    def respond(*args, **kwargs):
        calls.append(kwargs["json"]["messages"])
        return Answer()

    monkeypatch.setattr(m.httpx, "post", respond)
    assert client.post("/api/assistant", json={"message": "Помоги с разговором"}).status_code == 200
    assert client.post("/api/assistant", json={"message": "Как начать?"}).status_code == 200
    assert any(v["content"] == "Помоги с разговором" for v in calls[-1])
    assert len(client.get("/api/assistant/history").json()) == 4
    other = TestClient(m.app, headers=H)
    other.post("/api/auth/session")
    assert other.get("/api/assistant/history").json() == []
    assert len(client.get("/api/export").json()["chat"]) == 4


def test_checkout_retry_cannot_replace_partner(client):
    payload = dict(
        product_slug="compatibility",
        customer=dict(name="Анна", birth_date="1995-05-02"),
        partner=dict(name="Иван", birth_date="1993-04-12"),
        consent=True,
        request_key=uuid.uuid4().hex,
    )
    first = client.post("/api/checkout/create", json=payload)
    assert first.status_code == 200
    payload["partner"]["name"] = "Другой партнёр"
    assert client.post("/api/checkout/create", json=payload).status_code == 409
