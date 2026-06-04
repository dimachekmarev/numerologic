# NUMEROLOGIC

Рабочий MVP/PWA для продажи нумерологических digital-разборов: бесплатный мини-разбор, каталог продуктов, совместимость, Numerologic Club, mock checkout, отчёты и личный кабинет.

## Статус

Проект внедряется в существующий репозиторий `/root/web-projects/numerologic`.

Старые статические файлы сохранены в `legacy-static/`. Новый рабочий frontend находится в `frontend/`, backend — в `backend/`.

## Архитектура

- `frontend/` — Vite + React + React Router, светлый Stitch-inspired UI.
- `backend/` — FastAPI + SQLAlchemy + SQLite, API продуктов, quiz, reports, orders, mock payment.
- `docs/plans/2026-06-03-stitch-integration-agent-task.md` — ТЗ агенту на внедрение.
- `legacy-static/` — резерв старой статической PWA-версии.

## Основные маршруты frontend

- `/` — лендинг
- `/quiz` — мини-опрос
- `/result` — бесплатный мини-разбор
- `/dashboard` — личный кабинет
- `/products` — каталог продуктов
- `/products/:slug` — страница продукта
- `/club` — Numerologic Club
- `/compatibility` — совместимость пары
- `/report/:id` — полный отчёт
- `/checkout` — оформление заказа
- `/checkout/success` — mock-success
- `/checkout/cancel` — cancel
- `/faq` — доверие/FAQ
- `/privacy` — приватность
- `/terms` — условия

## Продукты

Редактируются во frontend:

`frontend/src/data/products.js`

И в backend-каталоге:

`backend/main.py` → `PRODUCT_CATALOG`, `ADDON_CATALOG`

Текущие продукты:

- Личный разбор
- Глубокий разбор
- Совместимость пары
- Период жизни
- Деньги и реализация
- Любовный сценарий
- Годовой прогноз
- Numerologic Club

Допы:

- PDF-версия отчёта
- Разбор партнёра
- Любовный сценарий
- Денежный код
- Годовой период
- Вопрос к текущей ситуации
- Подарочная версия
- Аудио-выжимка
- Numerologic Club со скидкой

## Backend env

Скопировать:

```bash
cp backend/.env.example backend/.env
```

Ключевые переменные:

```env
DATABASE_URL=sqlite:////root/web-projects/numerologic/backend/numerologic.db
JWT_SECRET_KEY=change-me-in-production
PAYMENT_PROVIDER=mock
PAYMENT_CURRENCY=RUB
FRONTEND_BASE_URL=http://localhost:5173
```

Для реальной оплаты позже заполнить placeholders YooKassa/CloudPayments в `backend/.env.example` и реализовать provider/webhook.

## Frontend env

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Локальный запуск

Backend:

```bash
cd /root/web-projects/numerologic/backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8080
```

Frontend:

```bash
cd /root/web-projects/numerologic/frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Открыть:

`http://127.0.0.1:5173`

## Production build

```bash
cd /root/web-projects/numerologic/frontend
npm run build
npm run preview -- --host 127.0.0.1 --port 5173
```

Проверка backend:

```bash
curl http://127.0.0.1:8080/api/health
curl http://127.0.0.1:8080/api/products
```

## Mock payment flow

1. Пользователь проходит `/quiz`.
2. Получает `/result`.
3. Выбирает продукт в `/products` или `/club`.
4. Переходит в `/checkout`.
5. Backend создаёт `Order` со статусом `pending`.
6. `/checkout/success` вызывает `/api/checkout/mock-success`.
7. Backend помечает заказ `paid`.
8. Для paid order создаётся report или subscription.
9. Пользователь открывает `/report/:id` или `/dashboard`.

## API

Основные endpoints:

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/{slug}`
- `POST /api/quiz/complete`
- `POST /api/reports/preview`
- `GET /api/reports/{id}`
- `POST /api/checkout/create`
- `POST /api/checkout/mock-success`
- `POST /api/subscriptions/create`
- `POST /api/compatibility/preview`
- `POST /api/payments/webhook`

## Юридическая подача

Numerologic подаётся как инструмент саморефлексии, развлечения и мягкого планирования. Нельзя обещать гарантированный доход, лечение, судьбоносные предсказания или замену врача, психолога, юриста или финансового консультанта.

## Что осталось для продаж в интернете

- Подключить реальную оплату: YooKassa / CloudPayments / Prodamus.
- Настроить production env.
- Развернуть backend на VPS/Render/Fly/другом сервере.
- Развернуть frontend на Vercel/Netlify/Cloudflare Pages или на том же VPS.
- Подключить домен.
- Добавить Яндекс.Метрику/GA4 и цели checkout.
