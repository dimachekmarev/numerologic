# NUMEROLOGIC App — Complete Design Prompt for Google Stitch

## Overview
A premium, mystical-yet-minimal numerology subscription PWA for the Russian market. Target audience: women 25–45, self-employed, entrepreneurs. The app turns birth dates into monthly personal navigation — not cheesy esoteric predictions, but structured self-reflection with a luxury feel.

## Design System

### Color Palette
- **Background**: Deep cosmic void `#06040a` — almost-black purple
- **Surface cards**: `#0d0814` with `rgba(255,255,255,0.04)` glass overlay
- **Primary accent**: Warm gold `#D4A853` — used for CTAs, key numbers, highlights
- **Secondary accent**: Soft rose `#C75B7A` — hover states, gradient accents
- **Tertiary**: Cosmic violet `#7B5EA7` — subtle backgrounds, depth
- **Text**: `#E8E0F0` (primary), `#8A7F9A` (secondary/muted)
- **Success/trust**: Mint green `#6DB58A` — badges, confirmations
- **Borders**: `rgba(255,255,255,0.08)` — subtle, refined

### Typography
- **Display/Headings**: Cormorant Garamond (serif, elegant, literary feel)
  - H1: 48-96px, weight 700, letter-spacing -0.04em
  - H2: 32-56px, weight 700, letter-spacing -0.03em
  - H3: 20-24px, weight 700
- **Body/UI**: Inter (sans-serif, clean, modern)
  - Body: 13-16px, weight 400
  - Labels: 11-12px, weight 500, uppercase, letter-spacing 0.06em
  - Buttons: 14px, weight 600

### Visual Atmosphere
- Dark cosmic theme with subtle grain/noise texture overlay
- Radial gradient glows in rose, gold, and violet — positioned at edges of the viewport
- Glass-morphism cards with subtle border glow
- Smooth 300ms cubic-bezier transitions on all interactive elements
- The hero section should have a premium phone mockup on the right showing a golden moon-like orb with a glowing number

## Screen Layout (Single Page PWA)

### Screen 1: Hero Section (above fold)
- **Top**: Sticky header with minimal logo "N" in conic-gradient circle (gold→rose→violet), brand name "NUMEROLOGIC", and 4 nav links (Суть, Расчёт, Тарифы, Заявка)
- **Left column**: 
  - Small eyebrow label "персональная нумерология · подписка" in gold, uppercase, 11px, letter-spaced
  - Massive gradient headline: "Ваш код — ваш навигатор" with gold-to-white gradient text fill
  - Subtitle: "NUMEROLOGIC превращает дату рождения в практический компас" in muted text, Inter, 20px, weight 300
  - Two CTA buttons: primary gold gradient "Бесплатный расчёт" + ghost "Демо кабинета"
  - Three trust pills below: "5 минут до результата", "490 ₽/мес вход", "PWA как приложение"
- **Right column**: 
  - Phone mockup (340px wide, dark, rounded 40px, subtle border)
  - Inside: app header "NUMEROLOGIC • Сегодня", large moon-like golden orb with number "8" glowing
  - Below orb: 2×2 grid of mini cards showing dates, focus %, and metrics
- **Background**: Void with radial gradient glows at top-left (rose), top-right (gold), bottom-center (violet)

### Screen 2: Pain Points / Why It Works
- Centered section header: eyebrow "почему это работает" + H2 "Люди покупают не цифры — они покупают ясность"
- 4-column grid of cards (collapses to 2 on tablet, 1 on mobile):
  1. "Куда двигаться" — too many options, no focus
  2. "Знак без давления" — need guidance without fear
  3. "Повтор сценариев" — same conflicts repeating
  4. "Регулярность" — one-off reading forgotten, subscription brings them back
- Cards: dark glass, subtle top radial gold gradient, hover lift effect

### Screen 3: Free Calculator
- Two-column layout: text left, form right
- **Left**: Eyebrow "бесплатный вход", H2 "Мини-разбор, который продаёт подписку", description text
- **Right**: Glass card form with:
  - "Имя и фамилия" text input
  - Row: "Дата рождения" date picker + "Запрос" dropdown (Деньги/Отношения/Предназначение/Месяц/Совместимость)
  - Full-width gold CTA button "Показать мой код"
  - Below: 5-number grid showing calculated profile (Путь, Предназначение, Душа, Личность, Месяц) — each in a mini card with large gold number + small label
  - Result text box with personalized interpretation and subscription upsell

### Screen 4: Subscriber Dashboard Demo
- Section header: eyebrow "личный кабинет" + H2 "Что получает подписчик каждый месяц"
- 2×2 dashboard grid:
  - **Top-left**: "Энергия месяца" card — focus label, progress bar (gold-rose gradient), insight text
  - **Top-right**: "Сильные даты" card — 3 date items showing type + date in gold
  - **Bottom-left**: "Отношения" card — relationship advice text
  - **Bottom-right**: "Доступ по подписке" card — feature list + CTA button

### Screen 5: Pricing
- Section header: eyebrow "тарифы" + H2 "Модель, которую можно продавать сразу"
- 3-column pricing cards (stack on mobile):
  - **Лайт 490 ₽/мес**: basic features, outline button
  - **Личный 1490 ₽/мес** (featured, gold border, mint badge "главный продукт"): best value, solid gold CTA
  - **Премиум 7900 ₽/мес**: all features, outline button
- Cards: glass background, hover lift, featured card has extra gold glow

### Screen 6: Lead Form
- Two-column: value prop left, form right
- **Left**: Eyebrow "заявка", H2 "Оформить подписку", funnel description
- **Right**: Glass card form with name, contact, plan selector, request textarea, submit button
- Result box shows generated Telegram message text

### Footer
- Logo + links: Конфиденциальность, Условия, Telegram

## Technical Specs for Stitch
- **Type**: Single-page PWA landing page
- **Target device**: Mobile-first (390px wide), responsive to desktop (1200px max)
- **Style**: Premium mystical, dark luxury, cosmic elegance — NOT cheap esoteric with starry clipart, not generic SaaS
- **Key differentiator**: The wordmark "NUMEROLOGIC" in elegant serif, the gold moon orb in the phone mockup, the gradient hero headline — these are the memorable anchors

## What to AVOID
- No starry backgrounds, zodiac clipart, or fortune-teller aesthetics
- No purple-on-white generic SaaS look
- No Arial/Inter/Roboto as display fonts — use Cormorant Garamond for headings
- No generic gradient hero sections — use the specific radial glow composition described
- No boring flat cards — use glass morphism with subtle depth

## Reference Mood
Think: luxury astrological calendar meets premium fintech dashboard. Dark, warm, refined, mystical without being cheesy. Gold as the signal color against deep void backgrounds. Serif typography for soul, sans-serif for precision.
