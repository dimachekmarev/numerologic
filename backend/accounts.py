"""Password recovery: random, hashed, expiring, single-use tokens; SMTP is optional."""

import hashlib
import os
import secrets
import smtplib
from datetime import timedelta
from email.message import EmailMessage
from urllib.parse import urlencode

from fastapi import Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import DateTime, ForeignKey, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column


def register_accounts(m):
    class Reset(m.Base):
        __tablename__ = "password_resets"
        key: Mapped[str] = mapped_column(String(64), primary_key=True)
        user_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))
        expires: Mapped[object] = mapped_column(DateTime)

    m.Base.metadata.create_all(m.engine)
    m.workspace_models.append(Reset)

    class ResetIn(BaseModel):
        email: EmailStr

    class NewPassword(BaseModel):
        token: str = Field(min_length=20, max_length=100)
        password: str = Field(min_length=10, max_length=128)

    @m.app.post("/api/auth/request-reset")
    def request_reset(data: ResetIn, db: Session = Depends(m.db_session)):
        host = os.getenv("SMTP_HOST")
        if not host:
            raise HTTPException(
                503, "Восстановление пароля пока не подключено. Обратитесь в поддержку."
            )
        user = db.scalar(select(m.Account).where(m.Account.email == str(data.email).lower()))
        if user and user.password:
            token = secrets.token_urlsafe(40)
            hashed = hashlib.sha256(token.encode()).hexdigest()
            # Invalidate older outstanding resets.
            for old in db.scalars(select(Reset).where(Reset.user_id == user.id)):
                db.delete(old)
            db.add(Reset(key=hashed, user_id=user.id, expires=m.now() + timedelta(minutes=30)))
            db.commit()
            msg = EmailMessage()
            msg["From"] = os.getenv("SMTP_FROM")
            msg["To"] = user.email
            msg["Subject"] = "Восстановление доступа Numerologic"
            msg.set_content(
                "Установите новый пароль по ссылке. Она действует 30 минут.\n"
                + m.FRONTEND
                + "/reset-password?"
                + urlencode({"token": token})
                + "\nЕсли вы не запрашивали восстановление, не переходите по ссылке."
            )
            try:
                with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587")), timeout=15) as smtp:
                    smtp.starttls()
                    smtp.login(os.getenv("SMTP_USER", ""), os.getenv("SMTP_PASSWORD", ""))
                    smtp.send_message(msg)
            except (smtplib.SMTPException, OSError):
                raise HTTPException(502, "Не удалось отправить письмо. Попробуйте позже.")
        return {
            "message": "Если аккаунт с этим email существует, отправлена ссылка для восстановления."
        }

    @m.app.post("/api/auth/reset-password")
    def reset(data: NewPassword, db: Session = Depends(m.db_session)):
        key = hashlib.sha256(data.token.encode()).hexdigest()
        token = db.get(Reset, key)
        if not token or token.expires < m.now():
            raise HTTPException(400, "Ссылка недействительна или устарела")
        user = db.get(m.Account, token.user_id)
        user.password = m.hash_password(data.password)
        for s in db.scalars(select(m.LoginSession).where(m.LoginSession.user_id == user.id)):
            db.delete(s)
        db.delete(token)
        db.commit()
        return {"message": "Пароль обновлён. Войдите с новым паролем."}
