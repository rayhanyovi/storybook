# Storybook

A cozy paid digital children's book library demo. Kids browse and read in a safe interface; parents manage subscriptions, purchases, reading progress, and screen time behind a PIN gate; admins manage catalog metadata and page narration text.

## Stack

- **API** — Express v5 · TypeScript · Prisma v5 · PostgreSQL
- **Web** — Vite · React · Tailwind v4 · shadcn/ui · TanStack Query · framer-motion
- **Auth** — JWT (7-day), bcryptjs (10 rounds)
- **Monorepo** — pnpm workspaces (`apps/api`, `apps/web`, `packages/shared`)

---

## Quick Start (Docker)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env — set a real JWT_SECRET at minimum

# 2. Start database + API
docker compose up -d

# 3. Run migrations and seed
pnpm --dir apps/api db:migrate
pnpm --dir apps/api db:seed

# 4. Start the web dev server
pnpm --dir apps/web dev
# http://localhost:5173
```

---

## Demo Script

### Seeded credentials

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Parent | `parent@demo.com` | `password` | USER |
| Admin | `admin@demo.com` | `password` | ADMIN |
| Demo PIN | — | `1234` | — |

### 1. First-time login (Parent flow)

1. Open `http://localhost:5173`
2. Click **Start demo** to open sign in, then click the **Parent** chip — it auto-fills credentials and logs you in.
3. **Onboarding** starts automatically (4 steps):
   - Welcome -> How it works -> Set your PIN (`1234`) -> Who's reading? (enter a child name)
4. You land on the **Kid home screen** — catalog of books.

### 2. Kid Mode — reading a free book

1. The default view is Kid Mode — the catalog shows all published books.
2. Tap any book marked **FREE** -> Book Detail -> **Read now** -> Page-flip reader opens.
3. Tap **Bacakan** to hear the stored page narration, then flip through all pages — a confetti burst fires on the last page.
4. Hit **Back to library** to return.

### 3. Parent Gate — unlocking a paid book

1. Tap a book with a **LOCKED** badge.
2. The **Parent Gate** overlay appears — enter PIN `1234`.
3. Wrong PIN triggers a gentle shake animation.
4. Correct PIN navigates to the Book Detail.

### 4. Parent Mode — subscribe & buy

1. From the Kid home, open **Profile** and switch to **Parent mode**, or use the **Parent** quick profile on login.
2. Enter PIN `1234`.
3. On the **Parent mode** page:
   - Tap **Subscribe (Rp 49.000 / 30 days)** -> subscription activates, all catalog books unlock.
   - Or tap **Buy** on individual books to own them permanently.
   - Tap **Reset demo data** to remove the current user's subscriptions, purchases, payments, and reading progress for a fresh demo run.
4. Open **Child Progress** from the profile menu to view reading stats and recent reading logs.

### 5. Admin Mode — book management

1. Log out, then click the **Admin** chip on the login screen.
2. You land directly on `/admin` — a catalog table of all books.
3. Click **+ New Book** to open the Create dialog — fill title, slug, category, price.
4. Use **Edit** for updates and **Archive** to soft-delete a book. Archived books disappear from the public catalog but remain readable for owners.
5. Use **Content** to edit cover/page image slots, page text for read-aloud narration, add pages, or delete pages.

---

## Submission Write-up

### Key product decisions and assumptions

The target buyer is a parent or guardian, while the target reader is a young child. This split drives the product: kids should never see checkout, while parents need fast, trustworthy controls for payment and library access. The MVP supports two monetization paths: subscription for temporary access to the live catalog, and one-time buy-to-keep purchases for permanent ownership. Admin CRUD is separated into an admin role so catalog management does not leak into the family-facing surfaces.

Key assumptions:

- Mock auth and payments are acceptable for proving the access-control model.
- A small curated catalog is enough for the MVP because toddlers repeat stories.
- English-only and tablet-first keep scope controlled.
- PIN gating is the core trust mechanism for accidental-purchase prevention.

### High-level roadmap

- Now: mocked auth/payments, book CRUD, subscription, buy-to-keep, kid/parent/admin surfaces, PIN gate, reader, read-aloud narration, screen-time limit, child progress logs, demo reset, illustrated assets, and deployment.
- Next: word highlighting, search refinements, analytics events, and multi-child profiles.
- Later: Stripe/Midtrans webhooks, refunds, grace periods, COPPA/GDPR-K review, offline downloads, localization, and richer parental controls.

### Success metrics

- Activation: new users who open at least one book in week one.
- Free-to-paid conversion: first subscription or book purchase per user.
- Monetization mix: subscription revenue versus one-time purchase revenue.
- Retention/churn: renewed subscriptions versus expired subscriptions.
- Engagement: books read per child per week.
- Trust: refund or accidental-purchase support requests.

### Access control design

The backend resolves access in a single order: admin, free, owned, active subscription, locked. Browse endpoints attach access metadata so the UI can show badges, while content endpoints enforce access with hard `403` responses. Ownership is checked before subscription so a subscribed user who buys a book sees it as owned. Archived books are hidden from non-owners but remain readable for owners. Mock payment failure records a failed payment and does not create an entitlement.

### System design

The monorepo has `apps/api`, `apps/web`, and `packages/shared`. Shared DTOs prevent frontend/backend type drift. The API is Express + TypeScript + Prisma + PostgreSQL with modules for auth, books, access, payments, categories, and library. The web app is Vite + React + Tailwind + TanStack Query + React Router. TanStack Query owns server state and invalidates books, book details, and library data after purchase/subscription mutations.

### How AI tools were used

AI was used as the implementation pair for planning, scaffolding, UI iteration, and verification. Prompts focused on the assignment constraints: "digital library MVP with subscription and one-time purchase access rules", "three surfaces: kid, parent behind PIN, admin", and "tablet-first children's book design with restrained motion". Iterations improved the initial MVP by tightening access-state UI, removing kid-mode checkout cues, adding admin edit, correcting stale query invalidation, and aligning the README with the actual demo.

---

## Manual API testing

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"parent@demo.com","password":"password"}' | jq -r .token)

# Browse books
curl http://localhost:3000/api/books -H "Authorization: Bearer $TOKEN" | jq .

# Subscribe
curl -X POST http://localhost:3000/api/payments/subscribe \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{}'

# My library
curl http://localhost:3000/api/me/library -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Development

```bash
# Install all workspace deps
pnpm install

# API: type-check
pnpm --filter @storybook/api build

# API: run tests (8 access-service tests)
pnpm --filter @storybook/api test -- --run

# Web: type-check + build
pnpm --filter @storybook/web build

# Reset and re-seed database
pnpm --dir apps/api exec prisma migrate reset --force
pnpm --dir apps/api db:seed

# Reset only the signed-in demo user's entitlements/progress
# Parent mode -> Account snapshot -> Reset demo data
```

---

## Project structure

```
storybook/
├── apps/
│   ├── api/          Express API (src/, prisma/, tests/)
│   └── web/          Vite React app (src/)
├── packages/
│   └── shared/       Shared TypeScript types
├── docs/             DESIGN.md · PRODUCT.md · TECH.md
├── docker-compose.yml
└── .env.example
```

---

## Deployment

### Vercel monorepo

1. Import the repository into Vercel.
2. Keep **Root Directory** as the repository root. Do not set it to `apps/web`.
3. Vercel uses root `vercel.json`:
   - **Install:** `pnpm install`
   - **Build:** `pnpm build:vercel`
   - **Output:** `apps/web/dist`
   - **API:** Express is mounted through `api/index.ts` and served under `/api/*`.
4. Set env vars in Vercel:
   - `DATABASE_URL` — Supabase Supavisor transaction pooler URL for serverless runtime, usually port `6543`
   - `DIRECT_URL` — Supabase direct database URL or session pooler URL for Prisma migrations, usually port `5432`
   - `JWT_SECRET` — a long random string
   - `CORS_ORIGIN` — your Vercel URL, or leave same-origin browser calls on `/api`
5. Leave `VITE_API_URL` unset for monorepo deploys. The web app defaults to `/api` in production.

### Database → Neon / Supabase

```bash
# Get DATABASE_URL and DIRECT_URL from Supabase, then run once from the repo root:
DATABASE_URL=postgresql://... DIRECT_URL=postgresql://... pnpm --dir apps/api exec prisma migrate deploy
DATABASE_URL=postgresql://... DIRECT_URL=postgresql://... pnpm --dir apps/api db:seed
```

You can also run the shorter commands from inside `apps/api`: `pnpm exec prisma migrate deploy` and `pnpm db:seed`.

For Supabase:

- Runtime on Vercel should use the Supavisor **transaction** pooler connection string for `DATABASE_URL`.
- Prisma migrations should use a direct database connection or Supavisor **session** connection string for `DIRECT_URL`.
- If the transaction pooler reports prepared statement errors, add `pgbouncer=true` to the `DATABASE_URL` query string.
- Create or choose a database role with enough privileges for Prisma before running `migrate deploy`.

---

## Known demo shortcuts

- JWT stored in `localStorage` (DEMO-only — use httpOnly cookies in production)
- Parent PIN stored as plaintext in `localStorage` (DEMO-only — hash in production)
- Book page text is seeded and editable by admins; page art uses local demo assets or slot fallbacks. A real app would move media to CDN/storage.
- Reset demo data is an authenticated DEMO-only endpoint for repeatable presentations.
- Payment flows are simulated (no real Stripe/FPX integration)
