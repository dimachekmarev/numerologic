"""
NUMEROLOGIC SaaS Backend
FastAPI + SQLAlchemy + JWT + Telegram Login
"""
import json
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Text, create_engine, ForeignKey,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

# ── Config ──────────────────────────────────────────────

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////root/web-projects/numerologic/backend/numerologic.db")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "numerologic-dev-secret-change-in-production-1234567890")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
TELEGRAM_BOT_TOKEN = os.getenv("NUMEROLOGIC_TELEGRAM_BOT_TOKEN", "")
TELEGRAM_BOT_USERNAME = os.getenv("NUMEROLOGIC_BOT_USERNAME", "NumerologicHelper_bot")
PAYMENT_PROVIDER = os.getenv("PAYMENT_PROVIDER", "mock")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
DEFAULT_CURRENCY = os.getenv("PAYMENT_CURRENCY", "RUB")

# ── Database ────────────────────────────────────────────

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tg_id: Mapped[Optional[int]] = mapped_column(Integer, unique=True, index=True)
    tg_username: Mapped[Optional[str]] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(128))
    birth_date: Mapped[Optional[str]] = mapped_column(String(10))
    email: Mapped[Optional[str]] = mapped_column(String(128), unique=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(256))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    plan: Mapped[str] = mapped_column(String(32), default="free")

    # numerology profile (cached)
    life_path: Mapped[Optional[int]] = mapped_column(Integer)
    destiny: Mapped[Optional[int]] = mapped_column(Integer)
    soul: Mapped[Optional[int]] = mapped_column(Integer)
    personality: Mapped[Optional[int]] = mapped_column(Integer)

    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="user")
    reports: Mapped[list["Report"]] = relationship(back_populates="user")
    orders: Mapped[list["Order"]] = relationship(back_populates="user")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    plan: Mapped[str] = mapped_column(String(32))
    amount_rub: Mapped[int] = mapped_column(Integer)
    payment_method: Mapped[Optional[str]] = mapped_column(String(32))
    payment_id: Mapped[Optional[str]] = mapped_column(String(128))
    started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(32), default="active")

    user: Mapped["User"] = relationship(back_populates="subscriptions")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    report_type: Mapped[str] = mapped_column(String(32), default="monthly")
    title: Mapped[str] = mapped_column(String(256))
    content: Mapped[str] = mapped_column(String)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    sent_to_tg: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="reports")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(128), index=True, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    total_amount: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(8), default="RUB")
    payment_provider: Mapped[str] = mapped_column(String(32), default="mock")
    payment_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    items_json: Mapped[str] = mapped_column(Text, default="[]")
    customer_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped[Optional["User"]] = relationship(back_populates="orders")

Base.metadata.create_all(bind=engine)

# ── Auth ────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401)
    return user


# ── App ─────────────────────────────────────────────────

app = FastAPI(title="NUMEROLOGIC API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ─────────────────────────────────────────────

class TelegramAuth(BaseModel):
    """Telegram Login Widget data."""
    id: int
    first_name: str
    last_name: Optional[str] = ""
    username: Optional[str] = ""
    photo_url: Optional[str] = ""
    auth_date: int
    hash: str


class UserProfile(BaseModel):
    id: int
    tg_id: Optional[int]
    tg_username: Optional[str]
    name: str
    birth_date: Optional[str]
    plan: str
    life_path: Optional[int]
    destiny: Optional[int]
    soul: Optional[int]
    personality: Optional[int]

    class Config:
        from_attributes = True


class UpdateProfile(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[str] = None
    email: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    report_type: str
    title: str
    content: str
    generated_at: datetime

    class Config:
        from_attributes = True


class SubscriptionOut(BaseModel):
    id: int
    plan: str
    amount_rub: int
    started_at: datetime
    expires_at: datetime
    status: str

    class Config:
        from_attributes = True


class DashboardOut(BaseModel):
    user: UserProfile
    subscriptions: list[SubscriptionOut]
    reports: list[ReportOut]
    current_month: int
    current_month_label: str
    strong_dates: list[str]
    month_focus: str


class QuizCompleteIn(BaseModel):
    session_id: Optional[str] = None
    name: str
    birth_date: str
    focus: Optional[str] = "Ясность"
    relationship_status: Optional[str] = None
    question: Optional[str] = None
    email: Optional[EmailStr] = None


class ReportPreviewIn(BaseModel):
    session_id: Optional[str] = None
    name: str
    birth_date: str
    product_slug: Optional[str] = "personal-reading"
    focus: Optional[str] = "Ясность"


class CheckoutCreateIn(BaseModel):
    session_id: Optional[str] = None
    product_slug: str
    addons: list[str] = []
    customer: dict = {}
    redirect_path: Optional[str] = None


class MockSuccessIn(BaseModel):
    order_id: int
    session_id: Optional[str] = None


class SubscriptionCreateIn(BaseModel):
    session_id: Optional[str] = None
    plan: str = "club"
    customer: dict = {}


class CompatibilityPreviewIn(BaseModel):
    session_id: Optional[str] = None
    name_a: str
    birth_date_a: str
    name_b: str
    birth_date_b: str


# ── Numerology Engine ───────────────────────────────────

MEANINGS = {
    1: 'инициатива, лидерство, личный выбор',
    2: 'партнёрство, тонкие договорённости, эмпатия',
    3: 'общение, творчество, публичность',
    4: 'структура, дисциплина, опора',
    5: 'движение, продажи, перемены',
    6: 'отношения, забота, эстетика, ответственность',
    7: 'анализ, знания, глубина, интуиция',
    8: 'деньги, управление, статус, результат',
    9: 'завершение, масштаб, наставничество, польза',
    11: 'мастер-число: усиленная интуиция, вдохновение, миссия',
    22: 'мастер-число: архитектор, масштабные проекты, строительство',
    33: 'мастер-число: служение, безусловная поддержка, духовное наставничество',
}

MONTH_FOCUS = {
    1: 'Начинайте новое. Месяц инициатив и первых шагов.',
    2: 'Договаривайтесь, а не продавливайте. Эмпатия и партнёрство.',
    3: 'Говорите, пишите, публикуйте. Ваше слово весомее обычного.',
    4: 'Структура и дисциплина. Порядок важнее скорости.',
    5: 'Движение, продажи, перемены. Не сидите на месте.',
    6: 'Забота, отношения, дом. Укрепляйте тыл.',
    7: 'Пауза для анализа. Учитесь, копайте глубже.',
    8: 'Деньги и результат. Управляйте ресурсами.',
    9: 'Завершайте начатое. Масштабируйте то, что работает.',
}


def reduce_number(n: int) -> int:
    while n > 9 and n not in (11, 22, 33):
        n = sum(int(d) for d in str(n))
    return n or 1


def name_number(name: str, mode: str = "all") -> int:
    vowels = set('аеёиоуыэюяaeiouy')
    mapping = {c: (i % 9) + 1 for i, c in enumerate(
        'абвгдежзийклмнопрстуфхцчшщъыьэюяabcdefghijklmnopqrstuvwxyz')}
    chars = [c.lower() for c in name if c.lower() in mapping]
    if mode == 'vowels':
        chars = [c for c in chars if c in vowels]
    elif mode == 'consonants':
        chars = [c for c in chars if c not in vowels]
    total = sum(mapping[c] for c in chars) if chars else 1
    return reduce_number(total)


def calc_profile(name: str, birth_date: str) -> dict:
    digits = ''.join(c for c in birth_date if c.isdigit())
    lp = reduce_number(int(digits)) if digits else 0
    parts = birth_date.split('-')
    py = pm = 0
    if len(parts) == 3:
        day, month = int(parts[2]), int(parts[1])
        now = datetime.now()
        py = reduce_number(day + month + now.year)
        pm = reduce_number(py + now.month)
    return {
        'life_path': lp,
        'destiny': name_number(name),
        'soul': name_number(name, 'vowels'),
        'personality': name_number(name, 'consonants'),
        'year': py,
        'month': pm,
    }


def strong_dates(seed: int, n: int = 3) -> list[str]:
    from datetime import date, timedelta
    today = date.today()
    out = []
    for i in range(n):
        d = today + timedelta(days=(seed * (i + 2) + (i * 7)) % 28 + 2)
        out.append(d.strftime('%d %B'))
    return out


def generate_report(user: User) -> str:
    p = calc_profile(user.name, user.birth_date or '')
    if not p['month']:
        return ''

    dates = strong_dates(p['life_path'] + p['month'])
    focus = MONTH_FOCUS.get(p['month'], 'Следуйте внутреннему ритму месяца.')
    plan = user.plan or 'free'

    body = f"""NUMEROLOGIC — Ваш прогноз на месяц

{user.name}, ваш личный месяц: {p['month']} — {MEANINGS.get(p['month'], '')}.

{focus}

🔢 Ваши числа:
• Жизненный путь: {p['life_path']} — {MEANINGS.get(p['life_path'], '')}
• Предназначение: {p['destiny']} — {MEANINGS.get(p['destiny'], '')}
• Внутренний мотив: {p['soul']} — {MEANINGS.get(p['soul'], '')}

📅 Сильные даты месяца:
• {dates[0]} — день переговоров и денег
• {dates[1]} — день отношений и личных разговоров
• {dates[2]} — день завершения и подведения итогов"""

    if plan in ('personal', 'premium'):
        body += f"""

💼 Карьера и деньги:
{'Усиливает финансовый фокус' if p['month'] in (4,8) else 'Требует гибкости в переговорах' if p['month'] in (2,6) else 'Поддерживает смелые инициативы'}.
Рекомендация: {'запускайте, тестируйте, продавайте' if p['month'] in (1,5,8) else 'укрепляйте базу, стройте систему' if p['month'] in (4,6,7) else 'завершайте проекты, освобождайте ресурсы'}.

❤️ Отношения:
{'Говорите прямо, не ждите догадок от партнёра.' if p['soul'] % 2 else 'Спокойные правила и понятные договорённости.'}"""

    if plan == 'premium':
        body += f"""

🎯 Персональная стратегия:
Главный риск: {'разброс фокуса' if p['month'] in (1,3,5) else 'чрезмерная осторожность' if p['month'] in (2,4,7) else 'эмоциональное выгорание'}.
Ритуал: {'утренний приоритет' if p['month'] in (1,5,8) else 'вечерний дневник' if p['month'] in (4,7,9) else '10 минут тишины'}."""

    body += "\n\nNUMEROLOGIC — ваш навигатор месяца."
    return body


PRODUCTS = [
    {
        "slug": "personal-reading",
        "title": "Личный разбор",
        "subtitle": "Базовая карта чисел и мягкие рекомендации на ближайший период.",
        "price": 990,
        "currency": "RUB",
        "badge": "Старт",
        "category": "personal",
        "features": ["жизненный путь", "внутренний мотив", "3 фокуса периода", "рекомендации"],
    },
    {
        "slug": "deep-reading",
        "title": "Глубокий разбор",
        "subtitle": "Расширенный отчёт про сценарии, отношения, деньги и внутреннюю опору.",
        "price": 2490,
        "currency": "RUB",
        "badge": "Популярно",
        "category": "personal",
        "features": ["полная карта", "сильные стороны", "повторяющиеся ситуации", "план на месяц"],
    },
    {
        "slug": "compatibility",
        "title": "Совместимость пары",
        "subtitle": "Бережный взгляд на динамику пары, точки притяжения и договорённости.",
        "price": 1490,
        "currency": "RUB",
        "badge": "Отношения",
        "category": "relationship",
        "features": ["числа пары", "точки совпадения", "зоны диалога", "мягкие рекомендации"],
    },
    {
        "slug": "life-period",
        "title": "Период жизни",
        "subtitle": "Фокус текущего этапа: где ускоряться, где беречь ресурс.",
        "price": 1290,
        "currency": "RUB",
        "badge": "Период",
        "category": "forecast",
        "features": ["личный год", "личный месяц", "сильные даты", "решения"],
    },
    {
        "slug": "money-realization",
        "title": "Деньги и реализация",
        "subtitle": "Как проявлять себя в работе, проектах и финансовых решениях.",
        "price": 1790,
        "currency": "RUB",
        "badge": "Деньги",
        "category": "work",
        "features": ["денежный код", "формат действий", "риски распыления", "точки роста"],
    },
    {
        "slug": "love-scenario",
        "title": "Любовный сценарий",
        "subtitle": "Повторяющиеся ситуации в отношениях и бережные опоры для выбора.",
        "price": 1590,
        "currency": "RUB",
        "badge": "Любовь",
        "category": "relationship",
        "features": ["эмоциональный ритм", "потребности", "границы", "диалог"],
    },
    {
        "slug": "year-forecast",
        "title": "Годовой прогноз",
        "subtitle": "12 месяцев в одном отчёте: ритм, темы и ключевые решения.",
        "price": 2990,
        "currency": "RUB",
        "badge": "12 месяцев",
        "category": "forecast",
        "features": ["личный год", "темы месяцев", "сильные периоды", "календарь"],
    },
    {
        "slug": "club",
        "title": "Numerologic Club",
        "subtitle": "Подписка с ежемесячными разборами, практиками и мини-прогнозами.",
        "price": 690,
        "currency": "RUB",
        "badge": "Подписка",
        "category": "club",
        "features": ["ежемесячный отчёт", "закрытые материалы", "скидки", "архив"],
    },
]

ADDONS = [
    {"slug": "pdf", "title": "PDF-версия отчёта", "price": 290},
    {"slug": "partner", "title": "Разбор партнёра", "price": 690},
    {"slug": "love", "title": "Любовный сценарий", "price": 590},
    {"slug": "money", "title": "Денежный код", "price": 590},
    {"slug": "year", "title": "Годовой период", "price": 990},
    {"slug": "question", "title": "Вопрос к текущей ситуации", "price": 390},
    {"slug": "gift", "title": "Подарочная версия", "price": 290},
    {"slug": "audio", "title": "Аудио-выжимка", "price": 490},
    {"slug": "club-discount", "title": "Numerologic Club со скидкой", "price": 390},
]


def product_by_slug(slug: str) -> Optional[dict]:
    return next((p for p in PRODUCTS if p["slug"] == slug), None)


def addon_by_slug(slug: str) -> Optional[dict]:
    return next((a for a in ADDONS if a["slug"] == slug), None)


def report_content_for(name: str, birth_date: str, report_type: str = "personal-reading", focus: str = "ясность") -> str:
    p = calc_profile(name, birth_date)
    focus_text = MONTH_FOCUS.get(p.get("month"), "Следуйте своему ритму и выбирайте понятные шаги.")
    dates = strong_dates((p.get("life_path") or 1) + (p.get("month") or 1))
    product = product_by_slug(report_type) or product_by_slug("personal-reading")
    return f"""{product['title']} — полный отчёт NUMEROLOGIC

{name}, ваш жизненный путь: {p['life_path']} — {MEANINGS.get(p['life_path'], '')}.
Ваш внутренний мотив: {p['soul']} — {MEANINGS.get(p['soul'], '')}.
Фокус запроса: {focus}.

Ключевая тема периода:
{focus_text}

Мягкие рекомендации:
• опирайтесь на числа как на язык самонаблюдения, а не жёсткий сценарий;
• выбирайте 1–2 главных действия на неделю;
• замечайте повторяющиеся ситуации и фиксируйте, что помогает вам сохранять ясность;
• в отношениях делайте ставку на понятные договорённости.

Сильные даты:
• {dates[0]} — день для разговора и выбора направления;
• {dates[1]} — день для практичных решений;
• {dates[2]} — день для завершения лишнего.

Закрытые секции отчёта разблокированы после mock-оплаты. Реальный платёжный провайдер подключается отдельно через PAYMENT_PROVIDER."""


def get_or_create_guest_user(db: Session, customer: dict, session_id: Optional[str]) -> User:
    email = customer.get("email") or (f"guest-{session_id}@numerologic.local" if session_id else f"guest-{uuid.uuid4().hex}@numerologic.local")
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    name = customer.get("name") or "Гость Numerologic"
    birth_date = customer.get("birth_date") or "1990-01-01"
    p = calc_profile(name, birth_date)
    user = User(
        name=name,
        email=email,
        birth_date=birth_date,
        plan="free",
        life_path=p["life_path"],
        destiny=p["destiny"],
        soul=p["soul"],
        personality=p["personality"],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def mock_payment_url(order_id: int, redirect_path: Optional[str] = None) -> str:
    target = redirect_path or f"/checkout/success?order_id={order_id}"
    joiner = "&" if "?" in target else "?"
    return f"{FRONTEND_BASE_URL}{target}{joiner}mock=1"


# ── Routes ──────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "numerologic-api"}


@app.post("/api/auth/telegram")
def auth_telegram(data: TelegramAuth, db: Session = Depends(get_db)):
    """Login or register via Telegram Login Widget."""
    import hashlib, hmac

    # In dev mode without bot token, skip hash verification
    if TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_TOKEN != "dev":
        check_data = {k: v for k, v in data.model_dump().items() if k != 'hash' and v is not None}
        check_data = {k: str(v) for k, v in check_data.items()}
        data_check = sorted(check_data.items())
        check_string = "\n".join(f"{k}={v}" for k, v in data_check)
        secret = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
        expected_hash = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()

        if expected_hash != data.hash:
            raise HTTPException(status_code=403, detail="Invalid Telegram hash")

    user = db.query(User).filter(User.tg_id == data.id).first()
    if not user:
        user = User(
            tg_id=data.id,
            tg_username=data.username,
            name=data.first_name + (f" {data.last_name}" if data.last_name else ""),
            plan="free",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": UserProfile.model_validate(user)}


@app.get("/api/me", response_model=UserProfile)
def get_me(user: User = Depends(get_current_user)):
    return UserProfile.model_validate(user)


@app.put("/api/me", response_model=UserProfile)
def update_me(data: UpdateProfile, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.name is not None:
        user.name = data.name
    if data.birth_date is not None:
        user.birth_date = data.birth_date
        # Recalculate numerology profile
        p = calc_profile(user.name, user.birth_date)
        user.life_path = p['life_path']
        user.destiny = p['destiny']
        user.soul = p['soul']
        user.personality = p['personality']
    db.commit()
    db.refresh(user)
    return UserProfile.model_validate(user)


@app.get("/api/dashboard", response_model=DashboardOut)
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Personal dashboard with current month data."""
    if not user.birth_date:
        # Return empty dashboard
        return DashboardOut(
            user=UserProfile.model_validate(user),
            subscriptions=[],
            reports=[],
            current_month=0,
            current_month_label="",
            strong_dates=[],
            month_focus="Введите дату рождения в профиле",
        )

    p = calc_profile(user.name, user.birth_date)
    subs = db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.status == "active"
    ).all()
    reports = db.query(Report).filter(
        Report.user_id == user.id
    ).order_by(Report.generated_at.desc()).limit(12).all()

    return DashboardOut(
        user=UserProfile.model_validate(user),
        subscriptions=[SubscriptionOut.model_validate(s) for s in subs],
        reports=[ReportOut.model_validate(r) for r in reports],
        current_month=p['month'],
        current_month_label=MEANINGS.get(p['month'], ''),
        strong_dates=strong_dates(p['life_path'] + p['month']),
        month_focus=MONTH_FOCUS.get(p['month'], ''),
    )


@app.get("/api/reports", response_model=list[ReportOut])
def get_reports(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        ReportOut.model_validate(r)
        for r in db.query(Report).filter(Report.user_id == user.id)
        .order_by(Report.generated_at.desc()).limit(24).all()
    ]


@app.post("/api/reports/generate", response_model=ReportOut)
def generate_new_report(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate a fresh monthly report for the current user."""
    if not user.birth_date:
        raise HTTPException(status_code=400, detail="Birth date not set")

    content = generate_report(user)
    if not content:
        raise HTTPException(status_code=400, detail="Could not generate report")

    report = Report(
        user_id=user.id,
        report_type="monthly",
        title=f"Прогноз на месяц — {datetime.now().strftime('%B %Y')}",
        content=content,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return ReportOut.model_validate(report)


@app.get("/api/subscriptions", response_model=list[SubscriptionOut])
def get_subscriptions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        SubscriptionOut.model_validate(s)
        for s in db.query(Subscription).filter(Subscription.user_id == user.id)
        .order_by(Subscription.started_at.desc()).all()
    ]


@app.get("/api/calculate")
def calculate(name: str, birth_date: str):
    """Public numerology calculator — no auth required."""
    p = calc_profile(name, birth_date)
    return {
        "name": name,
        "birth_date": birth_date,
        **p,
        "meanings": {
            "life_path": MEANINGS.get(p.get('life_path', 0), ''),
            "destiny": MEANINGS.get(p.get('destiny', 0), ''),
            "soul": MEANINGS.get(p.get('soul', 0), ''),
            "personality": MEANINGS.get(p.get('personality', 0), ''),
            "month": MEANINGS.get(p.get('month', 0), ''),
        },
    }


@app.get("/api/products")
def list_products():
    return {"products": PRODUCTS, "addons": ADDONS, "payment_provider": PAYMENT_PROVIDER}


@app.get("/api/products/{slug}")
def get_product(slug: str):
    product = product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"product": product, "addons": ADDONS}


@app.post("/api/quiz/complete")
def complete_quiz(data: QuizCompleteIn):
    session_id = data.session_id or uuid.uuid4().hex
    p = calc_profile(data.name, data.birth_date)
    recommended = "compatibility" if (data.focus or "").lower().startswith("отнош") else "deep-reading"
    return {
        "session_id": session_id,
        "profile": {"name": data.name, "birth_date": data.birth_date, **p},
        "mini_result": {
            "headline": f"{data.name}, ваш базовый код — {p['life_path']}",
            "summary": MEANINGS.get(p["life_path"], "Ваши числа помогают увидеть текущий ритм."),
            "focus": data.focus,
            "locked_sections": ["отношения", "деньги и реализация", "период жизни"],
            "recommended_product": product_by_slug(recommended),
        },
    }


@app.post("/api/reports/preview")
def report_preview(data: ReportPreviewIn):
    p = calc_profile(data.name, data.birth_date)
    product = product_by_slug(data.product_slug or "personal-reading") or product_by_slug("personal-reading")
    return {
        "session_id": data.session_id or uuid.uuid4().hex,
        "product": product,
        "profile": {"name": data.name, "birth_date": data.birth_date, **p},
        "preview": {
            "title": f"Мини-разбор: число {p['life_path']}",
            "summary": MEANINGS.get(p["life_path"], "Мягкие рекомендации для ясности."),
            "unlocked": ["базовые числа", "главная тема"],
            "locked": ["сценарии отношений", "денежный код", "план на период", "PDF/аудио"],
        },
    }


@app.post("/api/checkout/create")
def create_checkout(data: CheckoutCreateIn, db: Session = Depends(get_db)):
    product = product_by_slug(data.product_slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    selected_addons = [a for slug in data.addons if (a := addon_by_slug(slug))]
    total = int(product["price"]) + sum(int(a["price"]) for a in selected_addons)
    session_id = data.session_id or uuid.uuid4().hex
    items = [{"type": "product", **product}, *[{"type": "addon", **a} for a in selected_addons]]
    order = Order(
        session_id=session_id,
        status="pending",
        total_amount=total,
        currency=DEFAULT_CURRENCY,
        payment_provider=PAYMENT_PROVIDER,
        payment_id=f"mock_{uuid.uuid4().hex[:12]}",
        items_json=json.dumps(items, ensure_ascii=False),
        customer_json=json.dumps(data.customer or {}, ensure_ascii=False),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {
        "order_id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "currency": order.currency,
        "provider": order.payment_provider,
        "payment_id": order.payment_id,
        "checkout_url": mock_payment_url(order.id, data.redirect_path),
        "mock": order.payment_provider == "mock",
    }


@app.post("/api/checkout/mock-success")
def checkout_mock_success(data: MockSuccessIn, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if data.session_id and order.session_id and data.session_id != order.session_id:
        raise HTTPException(status_code=403, detail="Session mismatch")
    if order.status != "paid":
        order.status = "paid"
        order.paid_at = datetime.now(timezone.utc)
    customer = json.loads(order.customer_json or "{}")
    items = json.loads(order.items_json or "[]")
    product_item = next((item for item in items if item.get("type") == "product"), {})
    user = get_or_create_guest_user(db, customer, order.session_id)
    order.user_id = user.id
    db.commit()

    if product_item.get("slug") == "club":
        user.plan = "club"
        sub = Subscription(
            user_id=user.id,
            plan="club",
            amount_rub=order.total_amount,
            payment_method=PAYMENT_PROVIDER,
            payment_id=order.payment_id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
            status="active",
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return {"status": "paid", "order_id": order.id, "subscription_id": sub.id, "redirect_url": "/dashboard"}

    content = report_content_for(
        user.name,
        user.birth_date or customer.get("birth_date") or "1990-01-01",
        product_item.get("slug", "personal-reading"),
        customer.get("focus") or "ясность",
    )
    report = Report(
        user_id=user.id,
        report_type=product_item.get("slug", "personal-reading"),
        title=f"{product_item.get('title', 'Личный разбор')} — {datetime.now().strftime('%d.%m.%Y')}",
        content=content,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return {"status": "paid", "order_id": order.id, "report_id": report.id, "redirect_url": f"/report/{report.id}"}


@app.post("/api/subscriptions/create")
def create_subscription_checkout(data: SubscriptionCreateIn, db: Session = Depends(get_db)):
    payload = CheckoutCreateIn(session_id=data.session_id, product_slug="club", addons=[], customer=data.customer, redirect_path="/checkout/success")
    return create_checkout(payload, db)


@app.post("/api/compatibility/preview")
def compatibility_preview(data: CompatibilityPreviewIn):
    a = calc_profile(data.name_a, data.birth_date_a)
    b = calc_profile(data.name_b, data.birth_date_b)
    resonance = reduce_number((a["life_path"] or 1) + (b["life_path"] or 1))
    return {
        "session_id": data.session_id or uuid.uuid4().hex,
        "profile_a": {"name": data.name_a, **a},
        "profile_b": {"name": data.name_b, **b},
        "resonance": resonance,
        "summary": f"Общий ритм пары — {resonance}: {MEANINGS.get(resonance, 'важны ясные договорённости')}.",
        "locked": ["полная динамика пары", "триггеры диалога", "практики сближения"],
        "recommended_product": product_by_slug("compatibility"),
    }


@app.post("/api/payments/webhook")
def payment_webhook(payload: dict):
    # TODO: verify YooKassa/CloudPayments signatures when PAYMENT_PROVIDER is not mock.
    return {"status": "accepted", "provider": PAYMENT_PROVIDER, "mock": PAYMENT_PROVIDER == "mock"}


@app.get("/api/reports/{report_id}", response_model=ReportOut)
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportOut.model_validate(report)


# ── Main ────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
