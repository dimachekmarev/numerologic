"""Workspace API registered on the main FastAPI instance."""

import calendar
import json
import os
from datetime import date, datetime
from pathlib import Path

from fastapi import Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import ForeignKey, String, Text, func, select, update
from sqlalchemy.orm import Mapped, Session, mapped_column


def register_workspace(m):
    Base = m.Base
    app = m.app
    current = m.current
    db_session = m.db_session
    library = json.loads((Path(__file__).parent / "library.json").read_text())

    class Goal(Base):
        __tablename__ = "goals"
        id: Mapped[int] = mapped_column(primary_key=True)
        user_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
        title: Mapped[str] = mapped_column(String(200))
        due: Mapped[str] = mapped_column(String(10))
        done: Mapped[bool] = mapped_column(default=False)

    class Progress(Base):
        __tablename__ = "practice_progress"
        key: Mapped[str] = mapped_column(String(128), primary_key=True)
        user_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
        slug: Mapped[str] = mapped_column(String(64))
        index: Mapped[int] = mapped_column()

    class Event(Base):
        __tablename__ = "funnel_events"
        id: Mapped[int] = mapped_column(primary_key=True)
        user_id: Mapped[int] = mapped_column(index=True)
        event: Mapped[str] = mapped_column(String(64), index=True)
        properties: Mapped[str] = mapped_column(Text)
        created: Mapped[datetime] = mapped_column(default=m.now)

    Base.metadata.create_all(m.engine)

    def unlocked(db, user, slug):
        return (
            m.paid_member(db, user)
            or db.scalar(
                select(m.Order).where(
                    m.Order.user_id == user.id,
                    m.Order.product == slug,
                    m.Order.status == "paid",
                )
            )
            is not None
        )

    def info(db, user, slug):
        p = m.product(slug)
        completed = db.scalars(
            select(Progress.index).where(Progress.user_id == user.id, Progress.slug == slug)
        ).all()
        return dict(
            **p,
            total=len(library[slug]),
            unlocked=unlocked(db, user, slug),
            progress=len(completed),
            completed=completed,
        )

    @app.get("/api/practices")
    def practices(user=Depends(current), db: Session = Depends(db_session)):
        return [info(db, user, slug) for slug in library]

    @app.get("/api/practices/{slug}")
    def practice(slug: str, user=Depends(current), db: Session = Depends(db_session)):
        if slug not in library:
            raise HTTPException(404, "Практикум не найден")
        p = info(db, user, slug)
        return dict(
            **p,
            days=[
                dict(index=i, title=v[0], exercise=v[1], question=v[2])
                for i, v in enumerate(library[slug])
                if p["unlocked"] or i == 0
            ],
        )

    class MarkIn(BaseModel):
        slug: str
        index: int = Field(ge=0, le=30)
        done: bool

    @app.post("/api/progress")
    def mark(data: MarkIn, user=Depends(current), db: Session = Depends(db_session)):
        if data.slug not in library or data.index >= len(library[data.slug]):
            raise HTTPException(422, "Некорректный день")
        if not unlocked(db, user, data.slug):
            raise HTTPException(403, "Откройте практикум или клуб")
        db.execute(update(m.Account).where(m.Account.id == user.id).values(focus=m.Account.focus))
        key = f"{user.id}:{data.slug}:{data.index}"
        progress = db.get(Progress, key)
        if data.done and not progress:
            db.add(Progress(key=key, user_id=user.id, slug=data.slug, index=data.index))
        if not data.done and progress:
            db.delete(progress)
        db.commit()
        return {"ok": True}

    class GoalIn(BaseModel):
        id: int | None = None
        title: str = Field(min_length=1, max_length=200)
        due: str
        done: bool = False

    def goal_out(g):
        return dict(id=g.id, title=g.title, due=g.due, done=g.done)

    @app.get("/api/goals")
    def goals(user=Depends(current), db: Session = Depends(db_session)):
        return [
            goal_out(g)
            for g in db.scalars(select(Goal).where(Goal.user_id == user.id).order_by(Goal.due))
        ]

    @app.post("/api/goals")
    def save_goal(data: GoalIn, user=Depends(current), db: Session = Depends(db_session)):
        try:
            date.fromisoformat(data.due)
        except ValueError:
            raise HTTPException(422, "Некорректная дата")
        if data.id:
            g = db.get(Goal, data.id)
            if not g or g.user_id != user.id:
                raise HTTPException(404, "Цель не найдена")
            g.title = data.title
            g.due = data.due
            g.done = data.done
        else:
            count = db.scalar(select(func.count()).select_from(Goal).where(Goal.user_id == user.id))
            if count >= 200:
                raise HTTPException(422, "Лимит 200 целей; удалите завершённые")
            g = Goal(user_id=user.id, title=data.title, due=data.due, done=data.done)
            db.add(g)
        db.commit()
        return goal_out(g)

    @app.delete("/api/goals/{goal_id}")
    def delete_goal(goal_id: int, user=Depends(current), db: Session = Depends(db_session)):
        g = db.get(Goal, goal_id)
        if not g or g.user_id != user.id:
            raise HTTPException(404, "Цель не найдена")
        db.delete(g)
        db.commit()
        return {"ok": True}

    @app.get("/api/calendar")
    def month_calendar(month: str, user=Depends(current), db: Session = Depends(db_session)):
        if not user.birth_date:
            raise HTTPException(422, "Сначала заполните профиль")
        try:
            year, month_num = map(int, month.split("-"))
            total = calendar.monthrange(year, month_num)[1]
            if not 1900 <= year <= 2100:
                raise ValueError()
        except (ValueError, TypeError):
            raise HTTPException(422, "Некорректный месяц")
        gs = goals(user, db)
        entries = db.scalars(select(m.Entry.day).where(m.Entry.user_id == user.id)).all()
        days = []
        for i in range(1, total + 1):
            d = date(year, month_num, i)
            theme = m.daily(user.name, user.birth_date, user.id, d)["theme"]
            days.append(
                dict(
                    date=d.isoformat(),
                    theme=theme,
                    goals=[g for g in gs if g["due"] == d.isoformat()],
                    journal=d.isoformat() in entries,
                )
            )
        return dict(days=days)

    class EventIn(BaseModel):
        event: str
        properties: dict = Field(default_factory=dict)

    allowed = {
        "quiz_started",
        "quiz_completed",
        "practice_preview",
        "checkout_started",
        "checkout_created",
        "club_viewed",
        "share_daily",
        "assistant_used",
        "account_registered",
    }

    @app.post("/api/events")
    def event(data: EventIn, user=Depends(current), db: Session = Depends(db_session)):
        if data.event not in allowed:
            raise HTTPException(422, "Unknown event")
        # Never send names, birth dates, journal or questions to analytics.
        props = {
            k: str(v)[:100]
            for k, v in data.properties.items()
            if k in ("product", "source", "campaign")
        }
        e = Event(
            user_id=user.id,
            event=data.event,
            properties=json.dumps(props),
            created=m.now(),
        )
        db.add(e)
        db.flush()
        m.enqueue(db, data.event, f"event-{e.id}", props)
        db.commit()
        return {"ok": True}

    @app.get("/api/admin/metrics")
    def metrics(user=Depends(current), db: Session = Depends(db_session)):
        if not user.email or user.email not in os.getenv("ADMIN_EMAILS", "").lower().split(","):
            raise HTTPException(403, "Нет доступа")
        events = dict(db.execute(select(Event.event, func.count()).group_by(Event.event)).all())
        revenue = db.scalar(select(func.sum(m.Order.amount)).where(m.Order.status == "paid")) or 0
        return dict(
            events=events,
            paid_orders=db.scalar(
                select(func.count()).select_from(m.Order).where(m.Order.status == "paid")
            ),
            revenue_rub=revenue,
            accounts=db.scalar(select(func.count()).select_from(m.Account)),
        )

    m.workspace_models = [Goal, Progress, Event]
    m.workspace_export = lambda user, db: dict(
        goals=goals(user, db),
        practice_progress=[
            dict(slug=p.slug, index=p.index)
            for p in db.scalars(select(Progress).where(Progress.user_id == user.id))
        ],
    )
