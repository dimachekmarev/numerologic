# NUMEROLOGIC Commercial Product Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Turn NUMEROLOGIC from a static MVP into a sellable digital product for paid numerology consultations.

**Architecture:** Keep the current static PWA as the public landing/calculator. Add backend only when needed for leads, payments, PDF reports, and admin. Prioritize revenue flow before complex SaaS features.

**Tech Stack:** Vanilla HTML/CSS/JS PWA now; recommended next layer: Supabase or lightweight Node/FastAPI backend, Stripe/ЮKassa/CloudPayments, PDF generation, analytics.

---

## Current State

- Static PWA landing and calculator are implemented.
- Lead form stores local draft and prepares Telegram handoff.
- README, privacy, terms, manifest, service worker, icon, robots, sitemap are present.
- No backend, online payments, admin dashboard, analytics, or generated PDF reports yet.

## Commercial Acceptance Criteria

1. Visitor can calculate a mini-profile in under 60 seconds.
2. Visitor sees a clear paid offer immediately after the mini-profile.
3. Lead/contact can be captured reliably.
4. Owner can process leads manually on day one.
5. Product can evolve into automated paid reports without redesigning the landing.

---

### Task 1: Add production lead capture backend

**Objective:** Replace local-only lead capture with persistent server storage.

**Files:**
- Modify: `main.js`
- Create: backend endpoint or Supabase table `leads`
- Modify: `README.md`

**Steps:**
1. Create `leads` table with fields: name, contact, request, profile_json, source, created_at.
2. Add POST handler or Supabase insert call.
3. Keep localStorage fallback if network fails.
4. Verify by submitting a real lead and reading it from storage.

### Task 2: Add payment-first paid offer

**Objective:** Let users pay for Mini, Deep, or Premium package.

**Files:**
- Modify: `index.html`
- Modify: `main.js`
- Create: payment config docs

**Steps:**
1. Choose payment provider.
2. Add payment links/buttons per tariff.
3. Pass selected profile/request into payment metadata if provider supports it.
4. Verify each button opens correct checkout.

### Task 3: Generate PDF mini-report

**Objective:** Create a downloadable report after lead/payment.

**Files:**
- Create: report template
- Modify: `main.js` or backend service

**Steps:**
1. Define report sections.
2. Generate client-side PDF for MVP or backend PDF for production.
3. Include disclaimer and CTA.
4. Verify PDF is readable on mobile.

### Task 4: Add analytics and conversion tracking

**Objective:** Measure calculator starts, completed calculations, lead submissions, and payment clicks.

**Files:**
- Modify: `index.html`
- Modify: `main.js`

**Steps:**
1. Add analytics provider.
2. Track events: calc_start, calc_complete, lead_submit, pricing_click.
3. Verify events in analytics dashboard.

### Task 5: Improve content quality and authorial voice

**Objective:** Replace generic interpretations with branded, high-converting texts.

**Files:**
- Modify: `main.js`
- Create: content matrix/reference file

**Steps:**
1. Write interpretation matrix for numbers 1–9 and master numbers.
2. Add separate copy for money, relationships, purpose, personal year.
3. Add stronger CTA per scenario.
4. Verify no repeated/cliche text blocks dominate the result.

### Task 6: Deploy and package

**Objective:** Publish the MVP under a real domain and make it shareable.

**Files:**
- Modify: `README.md`
- Create: deployment notes

**Steps:**
1. Choose hosting: GitHub Pages, Cloudflare Pages, Netlify, or Vercel.
2. Configure domain and HTTPS.
3. Verify PWA install and mobile Lighthouse basics.
4. Push release tag `v0.1.0`.

---

## Immediate Next Step

Deploy the static MVP and connect a real lead destination. Do not add complex SaaS features until at least 10 real leads or 1 paid order validates demand.
