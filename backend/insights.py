"""AI reflection and report discussion: cached, private and subject to club quota."""

from fastapi import Depends, HTTPException
from sqlalchemy import ForeignKey, String, Text, select
from sqlalchemy.orm import Mapped, Session, mapped_column


def register_insights(m):
    class Insight(m.Base):
        __tablename__ = "ai_insights"
        key: Mapped[str] = mapped_column(String(128), primary_key=True)
        user_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
        reply: Mapped[str] = mapped_column(Text)

    m.Base.metadata.create_all(m.engine)
    m.workspace_models.append(Insight)
    m.insights_export = lambda user, db: [
        dict(key=i.key, reply=i.reply)
        for i in db.scalars(select(Insight).where(Insight.user_id == user.id))
    ]

    @m.app.post("/api/insight")
    def today_insight(user=Depends(m.current), db: Session = Depends(m.db_session)):
        if not m.paid_member(db, user):
            raise HTTPException(403, "AI-размышление доступно в клубе")
        if not user.birth_date:
            raise HTTPException(422, "Сначала заполните профиль")
        key = f"{user.id}:daily:{m.today_local()}"
        cached = db.get(Insight, key)
        if cached:
            return dict(reply=cached.reply, cached=True)
        d = m.daily(user.name, user.birth_date, user.id)
        result = m.assistant(
            m.ChatIn(
                message=f"Подготовь персональный вопрос дня и упражнение на пять минут. Символическая тема — {d['theme']}, карта — {d['tarot']['name']}. Опирайся на записи дневника, не приписывай мне черты по числам. До 180 слов."
            ),
            user,
            db,
        )
        db.add(Insight(key=key, user_id=user.id, reply=result["reply"]))
        db.commit()
        return result

    @m.app.post("/api/reports/{report_id}/discuss")
    def discuss(report_id: int, user=Depends(m.current), db: Session = Depends(m.db_session)):
        report = m.reading(report_id, user, db)
        key = f"{user.id}:report:{report_id}"
        cached = db.get(Insight, key)
        if cached:
            if not m.paid_member(db, user):
                raise HTTPException(403, "AI доступен в клубе")
            return dict(reply=cached.reply, cached=True)
        result = m.assistant(
            m.ChatIn(
                message="Помоги применить этот материал к моему контексту из дневника. Не меняй арифметику и не предсказывай события. Предложи один вопрос и один шаг. Материал: "
                + report["content"][:1600]
            ),
            user,
            db,
        )
        db.add(Insight(key=key, user_id=user.id, reply=result["reply"]))
        db.commit()
        return result
