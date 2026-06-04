# Numerologic Stitch Integration — Agent Implementation Task

## Решение по проекту

Внедрять новый Stitch-дизайн и рабочую систему в существующий проект:

`/root/web-projects/numerologic`

Не удалять старый проект и не создавать отдельный новый репозиторий без необходимости.

Причина:
- В проекте уже есть Git remote `origin/main`.
- Уже есть PWA-файлы: `index.html`, `main.js`, `manifest.json`, `sw.js`, legal pages.
- Уже есть backend на FastAPI: `backend/main.py`, `backend/numerologic.db`, `backend/requirements.txt`.
- Уже есть frontend на Vite/React: `frontend/`, но он пока является Vite-заглушкой.
- Поэтому правильная стратегия: сохранить старую статическую версию как backup, а полноценный app UI внедрить в `frontend/` и связать с `backend/`.

## Исходный Stitch-дизайн

Архив:

`/root/.hermes/cache/documents/doc_ffeba2be8670_stitch_numerologic_brand_identity_ui.zip`

Распакованная папка:

`/root/.hermes/cache/documents/unpacked_stitch_numerologic_brand_identity_ui/stitch_numerologic_brand_identity_ui/`

Экраны:
- `numerologic/` — лендинг
- `_5/` — quiz/onboarding
- `_7/` — бесплатный mini-result
- `_6/` — dashboard
- `_4/` — products catalog
- `numerologic_club/` — subscription/club
- `_3/` — compatibility flow
- `_1/` — full report preview
- `_2/` — checkout
- `faq/` — trust/FAQ
- `radiant_guidance/DESIGN.md` — design tokens

## Коммерческий референс

Ссылка от пользователя:

`https://nana-banana.org/ru`

Использовать не как визуальное копирование, а как референс коммерческой структуры SaaS-лендинга.

Что взять для Numerologic:
- сильный hero с формулировкой “всё-в-одном”;
- понятный бесплатный старт: “Начать бесплатно / мини-разбор без карты”;
- витрину возможностей в карточках;
- демонстрацию сценариев использования через готовые примеры;
- блок “как это работает” в 3–4 шага;
- блок “для кого продукт”;
- простые тарифы/пакеты;
- бесплатные кредиты/первый бесплатный результат как триггер входа;
- FAQ про приватность, оплату, что входит в продукт, чем отличается подписка;
- финальный CTA внизу страницы.

Адаптация под Numerologic:
- вместо “AI Images / Video / Music / Voice” использовать “Личный разбор / Совместимость / Период жизни / Numerologic Club”;
- вместо “10 бесплатных кредитов” использовать “бесплатный мини-разбор”;
- вместо кредитов можно предусмотреть “инсайты” или “разборы”, но не усложнять MVP;
- добавить пакеты: “Попробовать”, “Самый популярный”, “Максимум ясности”;
- в каталоге продуктов показывать не только названия, а сценарии: отношения, деньги, период, повторяющийся сценарий, важное решение;
- добавить сравнение “одна подписка вместо разовых покупок” для Numerologic Club;
- FAQ должен снимать страх: это не гадание, не обещание будущего, данные приватны, можно начать бесплатно.

Что НЕ брать:
- тёмную тему Nana Banana;
- технологический AI-тон;
- перегруженность множеством моделей;
- английские/машинные формулировки;
- мужской SaaS-визуал.

Numerologic должен оставаться светлым, женственным, friendly, эмоционально безопасным приложением.

## Что нельзя делать

- Не удалять `.git`.
- Не удалять старый `index.html`, `main.js`, `manifest.json`, `sw.js`, `privacy.html`, `terms.html` без backup.
- Не стирать `backend/numerologic.db`.
- Не коммитить secrets/env/tokens.
- Не оставлять фронтенд Vite-заглушкой.
- Не заканчивать на плане — нужен рабочий MVP.

## Что сделать с текущими файлами

### 1. Backup старой статики

Создать папку:

`legacy-static/`

Переместить или скопировать туда:
- `index.html`
- `main.js`
- `design-v2.html`
- `index-v1-backup.html`
- `privacy.html`
- `terms.html`
- `manifest.json`
- `sw.js`
- `robots.txt`
- `sitemap.xml`
- `icons/`
- `NUMEROLOGIC_FULL_PWA.zip`

Если перенос ломает текущий GitHub Pages — вместо переноса сделать копию в `legacy-static/`, а новые deploy docs должны объяснять, что рабочее приложение теперь в `frontend/`.

### 2. Frontend

Использовать существующую папку:

`frontend/`

Текущий `frontend/src/App.jsx` — Vite-заглушка. Заменить её полноценным React-приложением на основе Stitch-дизайна.

Реализовать routes через `react-router-dom`:
- `/`
- `/quiz`
- `/result`
- `/dashboard`
- `/products`
- `/products/:slug`
- `/club`
- `/compatibility`
- `/report/:id`
- `/checkout`
- `/checkout/success`
- `/checkout/cancel`
- `/faq`
- `/privacy`
- `/terms`

Если `react-router-dom` не установлен — добавить.

### 3. Backend

Использовать существующий FastAPI backend:

`backend/main.py`

Он уже содержит:
- users
- subscriptions
- reports
- JWT
- Telegram auth
- dashboard
- report generation
- public calculate endpoint

Расширить backend, а не переписывать с нуля.

Добавить/доработать:
- products config/endpoint;
- quiz complete endpoint;
- mini result endpoint;
- checkout create endpoint;
- mock payment success endpoint;
- orders model/table;
- report by id endpoint;
- compatibility preview/full flow;
- subscription mock checkout;
- env-based payment provider abstraction.

## MVP функционал

Пользовательский путь:

1. Открывает лендинг.
2. Нажимает “Пройти мини-разбор”.
3. Проходит quiz 5 шагов.
4. Получает бесплатный mini-result.
5. Видит locked sections и recommended product.
6. Выбирает продукт.
7. Добавляет допы.
8. Проходит checkout в mock mode.
9. После mock payment получает полный report.
10. Report сохраняется в dashboard.
11. Может открыть products/club/compatibility.
12. Может оформить mock subscription Numerologic Club.

## Frontend pages/components

Создать структуру:

`frontend/src/`
- `App.jsx`
- `main.jsx`
- `styles.css` или `App.css`
- `api.js`
- `data/products.js`
- `data/reportTemplates.js`
- `utils/numerology.js`
- `components/Layout.jsx`
- `components/BottomNav.jsx`
- `components/Header.jsx`
- `components/ProductCard.jsx`
- `components/ReportCard.jsx`
- `components/StickyCTA.jsx`
- `pages/Home.jsx`
- `pages/Quiz.jsx`
- `pages/Result.jsx`
- `pages/Dashboard.jsx`
- `pages/Products.jsx`
- `pages/ProductDetail.jsx`
- `pages/Club.jsx`
- `pages/Compatibility.jsx`
- `pages/Report.jsx`
- `pages/Checkout.jsx`
- `pages/CheckoutSuccess.jsx`
- `pages/Faq.jsx`
- `pages/Privacy.jsx`
- `pages/Terms.jsx`

## Product catalog

Products:
- `personal-reading` — Личный разбор
- `deep-reading` — Глубокий разбор
- `compatibility` — Совместимость пары
- `life-period` — Период жизни
- `money-realization` — Деньги и реализация
- `love-scenario` — Любовный сценарий
- `year-forecast` — Годовой прогноз
- `club` — Numerologic Club

Add-ons:
- PDF-версия отчёта
- Разбор партнёра
- Любовный сценарий
- Денежный код
- Годовой период
- Вопрос к текущей ситуации
- Подарочная версия
- Аудио-выжимка
- Numerologic Club со скидкой

Prices must live in config/data, not hardcoded across components.

## Backend models to add

Add Order model:
- id
- user_id nullable
- session_id nullable
- status: pending/paid/cancelled/refunded
- total_amount
- currency
- payment_provider
- payment_id
- items_json
- created_at
- paid_at nullable

Optionally add product config in Python list/dict or database seed.

## API endpoints to add

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

Keep existing endpoints working:
- `/api/health`
- `/api/calculate`
- `/api/dashboard`
- `/api/reports`
- `/api/reports/generate`

## Payment

Do not require real payment keys for MVP.

Implement:
- `PAYMENT_PROVIDER=mock` by default.
- mock checkout flow working locally.
- `.env.example` with placeholders.
- provider abstraction file/module.
- documented TODO for YooKassa/CloudPayments.

After mock success:
- mark order paid;
- create report or subscription;
- redirect to `/report/:id` or `/dashboard`.

## Copy rules

Remove heavy/cheap-esoteric phrases:
- “тайны судьбы”
- “вся правда”
- “фатальный прогноз”
- “магия”
- “кармические задачи”

Use:
- “личный разбор”
- “мягкие рекомендации”
- “сценарии”
- “период жизни”
- “внутренняя опора”
- “ясность”
- “отношения”
- “повторяющиеся ситуации”

## Design direction

Use Stitch UI as visual source:
- light, warm, feminine app;
- cream/blush/lavender/coral palette;
- rounded cards;
- mobile-first;
- bottom nav;
- sticky CTA;
- product cards;
- soft dashboard widgets.

No dark mystical redesign.

## Verification

Run:

```bash
cd /root/web-projects/numerologic/frontend
npm install
npm run build
```

Run backend:

```bash
cd /root/web-projects/numerologic/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8080
```

Verify:
- `GET /api/health` returns ok.
- frontend opens locally.
- routes work.
- quiz works.
- result works.
- checkout mock works.
- report opens.
- dashboard shows saved report.
- club mock subscription works.

## Final delivery

Agent final response must include:
- what was changed;
- exact project path;
- frontend run command;
- backend run command;
- build command;
- env variables;
- where products/prices are edited;
- how mock payment works;
- what remains to connect real payment;
- deploy instructions.

## Acceptance criteria

Done only when:
- frontend is no longer Vite placeholder;
- backend still starts;
- MVP flow works end-to-end in mock mode;
- build passes;
- no secrets committed;
- old project is preserved/backed up;
- final system is ready for internet deployment after env/payment setup.
