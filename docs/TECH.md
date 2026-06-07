# TECH.md — Technical Specification

> Expands the **Tech baseline** in `BASELINE.md`. Written to be executed step-by-step by a coding AI: explicit structure, dependencies, schema, and API contracts. Stack (locked): pnpm monorepo · **Express + TS + Prisma + PostgreSQL (Docker)** · JWT mock auth · Zod · **Vite + React + TS + Tailwind + shadcn/ui + TanStack Query + React Router** · `react-pageflip` · framer-motion. AI-first: 100% generated; nothing hand-coded. Images come from `illustration-style.yaml`; rendered as labeled `PlaceholderImage` boxes until real assets exist.

---

## 1. Monorepo structure

```
storybook/
├── package.json                 # pnpm workspaces root
├── pnpm-workspace.yaml
├── docker-compose.yml           # db + api
├── .env.example
├── packages/
│   └── shared/                  # types/DTOs shared FE+BE (the DRY core)
│       ├── package.json
│       └── src/index.ts         # Role, BookStatus, AccessReason, DTOs…
└── apps/
    ├── api/
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── seed.ts
    │   ├── tests/
    │   │   └── access.service.test.ts
    │   └── src/
    │       ├── server.ts        # listen()
    │       ├── app.ts           # express app (no listen) — testable
    │       ├── config/env.ts    # zod-validated env
    │       ├── lib/
    │       │   ├── prisma.ts     # singleton
    │       │   └── errors.ts     # AppError + NotFound/Forbidden/Conflict/PaymentFailed
    │       ├── middleware/
    │       │   ├── auth.ts       # JWT verify -> req.user
    │       │   ├── requireRole.ts
    │       │   ├── validate.ts   # zod runner
    │       │   └── errorHandler.ts
    │       └── modules/
    │           ├── auth/         routes·controller·service·schema
    │           ├── books/        routes·controller·service·repository·schema
    │           ├── access/       access.service.ts  (resolveAccess)
    │           ├── categories/   routes·controller·service
    │           ├── payments/     routes·controller·service·schema
    │           └── library/      routes·service
    └── web/
        ├── package.json
        ├── vite.config.ts
        ├── tailwind.config.ts
        ├── index.html
        └── src/
            ├── main.tsx
            ├── App.tsx           # router + providers
            ├── index.css         # tokens (globals from DESIGN.md §2)
            ├── lib/
            │   ├── api.ts        # typed fetch client (JWT, error shape)
            │   └── queryKeys.ts
            ├── providers/
            │   ├── AuthProvider.tsx
            │   ├── ModeProvider.tsx   # kid/parent
            │   └── PinProvider.tsx    # demo PIN gate
            ├── hooks/             useBooks, useBook, useLibrary, useAuth, useAccess
            ├── components/        (see DESIGN.md §5 — ChunkyButton, PlaceholderImage, BookCard, AccessBadge, Mascot, ParentGate, BookReader…)
            └── pages/            login, onboarding, kid/*, parent/*, admin/*, NotFound
```

## 2. Dependencies

**`apps/api`:** express, @prisma/client, prisma (dev), zod, jsonwebtoken, bcryptjs, cors, dotenv; dev: typescript, tsx, vitest, supertest, @types/*.
**`apps/web`:** react, react-dom, react-router-dom, @tanstack/react-query, tailwindcss, class-variance-authority, tailwind-merge, lucide-react, framer-motion, react-pageflip, react-hook-form, zod, @hookform/resolvers, sonner, canvas-confetti, shadcn/ui components (generated via CLI).
**`packages/shared`:** zero runtime deps (types only).

## 3. Data model (final Prisma schema)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role          { ADMIN  USER }
enum BookStatus    { DRAFT  PUBLISHED  ARCHIVED }
enum SubStatus     { ACTIVE EXPIRED    CANCELED }
enum PaymentType   { SUBSCRIPTION      BOOK_PURCHASE }
enum PaymentStatus { SUCCEEDED FAILED  PENDING }

model User {
  id                     String         @id @default(uuid())
  email                  String         @unique
  passwordHash           String
  role                   Role           @default(USER)
  onboardingCompletedAt  DateTime?                          // null = onboarding not yet done
  subscriptions          Subscription[]
  purchases              Purchase[]
  payments               Payment[]
  createdAt              DateTime       @default(now())
  updatedAt              DateTime       @updatedAt
}

model Book {
  id          String     @id @default(uuid())
  slug        String     @unique                    // used for page slot generation (e.g. "goodnight-star")
  title       String
  author      String
  description String     @default("")
  coverSlot   String?                               // image registry slot id (e.g. "book.cover.goodnight-star")
  priceCents  Int        @default(0)                // integer minor units; 0 = free. IDR => whole rupiah
  currency    String     @default("IDR")
  ageMin      Int        @default(0)
  ageMax      Int        @default(12)
  pageCount   Int        @default(6)                // number of placeholder pages to generate
  status      BookStatus @default(DRAFT)
  categories  Category[] @relation("BookCategories")
  purchases   Purchase[]
  pages       BookPage[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  @@index([status])
}

model BookPage {
  id        String   @id @default(uuid())
  bookId    String
  book      Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  index     Int
  imageSlot String?
  text      String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([bookId, index])
  @@index([bookId])
}

model Category {
  id    String @id @default(uuid())
  name  String @unique
  slug  String @unique
  books Book[] @relation("BookCategories")
}

model Subscription {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  status    SubStatus @default(ACTIVE)
  plan      String    @default("MONTHLY")
  startedAt DateTime  @default(now())
  expiresAt DateTime
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  @@index([userId, status])
}

model Purchase {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  bookId         String
  book           Book     @relation(fields: [bookId], references: [id])
  pricePaidCents Int
  purchasedAt    DateTime @default(now())
  @@unique([userId, bookId])                  // permanent + idempotent
}

model Payment {
  id             String        @id @default(uuid())
  userId         String
  user           User          @relation(fields: [userId], references: [id])
  type           PaymentType
  amountCents    Int
  currency       String        @default("IDR")
  status         PaymentStatus @default(SUCCEEDED)
  referenceId    String?
  idempotencyKey String?       @unique
  createdAt      DateTime      @default(now())
}
```

## 4. Shared types (`packages/shared/src/index.ts`)

Single source for enums/DTOs imported by both apps (no drift):

```ts
export type Role = 'ADMIN' | 'USER';
export type BookStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AccessReason = 'ADMIN' | 'FREE' | 'OWNED' | 'SUBSCRIPTION' | 'LOCKED';
export interface AccessResult { canAccess: boolean; reason: AccessReason; }
export interface CategoryDTO { id: string; name: string; slug: string; }
export interface BookDTO {
  id: string; slug: string; title: string; author: string; description: string;
  coverSlot: string | null; priceCents: number; currency: string;
  ageMin: number; ageMax: number; pageCount: number; status: BookStatus;
  categories: CategoryDTO[];
}
export interface BookWithAccess extends BookDTO { access: AccessResult; }
export interface BookPage { index: number; imageSlot: string; label: string; text: string; }
export interface BookContent { bookId: string; pages: BookPage[]; }
export interface AdminBookPageInput { index: number; imageSlot?: string | null; text: string; }
export interface AdminBookContentDTO {
  bookId: string; coverSlot: string | null; pageCount: number; pages: BookPage[];
}
export interface UserDTO { id: string; email: string; role: Role; onboardingCompletedAt: string | null; }
export interface ApiError { error: { code: string; message: string; details?: unknown }; }
```

## 5. Access control

```ts
// modules/access/access.service.ts
import type { AccessReason, AccessResult } from '@storybook/shared';

export async function resolveAccess(user, book): Promise<AccessResult> {
  if (user.role === 'ADMIN')             return { canAccess: true,  reason: 'ADMIN' };
  if (book.priceCents === 0)             return { canAccess: true,  reason: 'FREE' };
  if (await ownsBook(user.id, book.id))  return { canAccess: true,  reason: 'OWNED' };       // before SUBSCRIPTION
  if (await hasActiveSub(user.id))       return { canAccess: true,  reason: 'SUBSCRIPTION' };
  return { canAccess: false, reason: 'LOCKED' };
}
const ownsBook   = (userId, bookId) =>
  prisma.purchase.findUnique({ where: { userId_bookId: { userId, bookId } } }).then(Boolean);
const hasActiveSub = (userId) =>
  prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } } }).then(Boolean);
```

- **Soft enforcement (browse):** list/detail attach `access{}` per book so UI shows lock state.
- **Hard enforcement (content):** `GET /books/:id/content` returns `403` if `!canAccess`.
- **Lazy expiry:** active = `status=ACTIVE AND expiresAt > now`, evaluated per request. No cron.
- **Visibility:** non-admins see `PUBLISHED` books + any book they own (incl. `ARCHIVED`). Admins see all.

### Edge-case matrix (with status codes)
| Scenario | Result |
|---|---|
| No/invalid token | `401` |
| Authed, paid book, no sub, not owned → browse | visible, `access.reason=LOCKED` |
| Authed, locked → `GET /content` | `403` |
| Active sub → any published `/content` | `200` (`SUBSCRIPTION`) |
| Expired sub, not owned | `LOCKED` / `403` |
| Owned, no sub | `200` (`OWNED`) |
| Buy → subscribe → cancel | still `200` (`OWNED`) |
| Buy-to-keep while subscribed | `200/201`, creates Purchase, reason→`OWNED` |
| Double purchase | idempotent: existing Purchase, no 2nd Payment |
| Purchase missing book | `404` |
| Purchase archived/draft book | `409` |
| Admin reads draft | `200` (`ADMIN`) |
| Owned book archived later | owner `200`; others `404` |
| Free book | `200` (`FREE`) |
| Non-admin CRUD | `403` |
| Payment forced fail (`simulate:"fail"`) | `402`, `Payment.status=FAILED`, no entitlement |

## 6. API contracts

Base path `/api`. Auth = `Authorization: Bearer <jwt>`. All errors → `ApiError` shape via central handler.

**Auth**
- `POST /api/auth/login` `{ email, password }` → `200 { token, user: UserDTO }` · `401`
- `GET /api/auth/me` *(auth)* → `200 UserDTO`
- `POST /api/auth/onboarding/complete` *(auth, USER only)* → `200 { onboardingCompletedAt: string }` — sets `onboardingCompletedAt = now()` on user record.
  > **DEMO-only reason:** onboarding state lives in the DB so it persists across devices and sessions without relying on client storage. A real product would use the same approach. This is the correct solution.

**Books**
- `GET /api/books?category&ageMin&ageMax&q&page&limit` *(auth)* → `200 { data: BookWithAccess[], page, limit, total }`
- `GET /api/books/:id` *(auth)* → `200 BookWithAccess` · `404`
- `GET /api/books/:id/content` *(auth)* → `200 BookContent` · `403` if locked
  ```
  // Implementation: page rows store admin-authored text and optional image slots.
  // Missing image slots still fall back to generated placeholder registry slots.
  const pages = Array.from({ length: book.pageCount }, (_, i) => ({
    index:     i + 1,
    imageSlot: storedPage?.imageSlot ?? `book.page.${book.slug}.${i + 1}`,
    label:     `page - ${book.title} #${i + 1}`,
    text:      storedPage?.text ?? '',
  }));
  ```
- `POST /api/books` *(admin)* `{ slug, title, author, description, coverSlot, priceCents, ageMin, ageMax, pageCount, categoryIds[], status }` → `201 BookDTO`
- `GET /api/books/:id/admin-content` *(admin)* → `200 AdminBookContentDTO`
- `PUT /api/books/:id/admin-content` *(admin)* `{ coverSlot, pageCount, pages:[{index,imageSlot?,text}] }` → `200 AdminBookContentDTO`
- `PATCH /api/books/:id` *(admin)* partial → `200 BookDTO`
- `DELETE /api/books/:id` *(admin)* → `200 { id, status:"ARCHIVED" }` (soft-delete)

**Categories**
- `GET /api/categories` *(auth)* → `200 CategoryDTO[]`
- `POST /api/categories` *(admin)* `{ name, slug }` → `201 CategoryDTO`

**Payments** *(auth)*
- `POST /api/payments/subscribe` `{ idempotencyKey?, simulate? }` → `200 { subscription:{status,expiresAt}, payment }`; renews `+30d`; `402` on `simulate:"fail"`
- `POST /api/payments/purchase` `{ bookId, idempotencyKey?, simulate? }` → `201 { purchase, payment }`; idempotent; buy-to-keep; `404`/`409`/`402`

**Library / Meta**
- `GET /api/me/library` *(auth)* → `200 { subscription:{status,expiresAt}|null, owned: BookDTO[], hasActiveSub: boolean }`
- `GET /health` → `200 { status:"ok", time }`

Payment endpoints are atomic (`prisma.$transaction`: write `Payment` + entitlement together).

## 7. Frontend

### Routing (React Router)
| Path | Surface | Guard |
|---|---|---|
| `/login` | — | redirect to app if token |
| `/onboarding` | — | first run only (4 steps, PRODUCT.md §7.2) |
| `/` (home), `/category/:slug`, `/book/:id` | Kid | auth |
| `/read/:id` | Kid (reader) | auth + `canAccess` (else redirect to detail) |
| `/parent`, `/parent/library`, `/parent/account` | Parent | auth + **PIN** |
| `/admin`, `/admin/books`, `/admin/books/:id`, `/admin/books/:id/content` | Admin | auth + role ADMIN |
| `*` | NotFound (Oyen 404) | — |

### State & data
- **TanStack Query** for all server state; keys in `queryKeys.ts` (`books`, `book(id)`, `bookContent(id)`, `adminBookContent(id)`, `library`, `categories`). Mutations (subscribe/purchase/CRUD/content) invalidate affected book/content/library keys.
- **Typed API client** (`lib/api.ts`): attaches JWT, parses `ApiError`, throws typed errors → toast via sonner.
- **AuthProvider:** token + `UserDTO` (incl. `onboardingCompletedAt`). **ModeProvider:** kid/parent. **PinProvider:** demo PIN gate.
- **Onboarding guard:** on app load, if `user.role === 'USER' && !user.onboardingCompletedAt` → redirect to `/onboarding`. After step 4, call `POST /api/auth/onboarding/complete` → query-invalidate `me` → redirect to `/`.
- **PIN — demo implementation:**
  ```ts
  // PinProvider.tsx
  // DEMO-only: PIN stored in localStorage as plain string. This is a demo
  // shortcut — no security claim is made. REAL: hashed server-side + biometric.
  const PIN_KEY = 'storybook_pin';
  const getStoredPin = () => localStorage.getItem(PIN_KEY) ?? '';
  const savePin = (pin: string) => localStorage.setItem(PIN_KEY, pin);
  const verifyPin = (input: string) => input === getStoredPin();
  ```
  Set during onboarding step 3 (`PinSetup`). Read by `ParentGate` on every parent-mode entry. Persists across refresh so the demo experience is smooth.
- Reader uses **`react-pageflip`** (single page narrow / two-page spread wide); each page renders `PlaceholderImage` with the `imageSlot`/`label` from `GET /books/:id/content`, plus the stored page text.
- **Reader: disable pinch-to-zoom.** Set `touch-action: pan-y` on the reader container + `<meta name="viewport" content="user-scalable=no">`. Toddlers accidentally pinch-to-zoom causing disorientation — this is a documented child UX problem, not an edge case.
- **Kid mode: oversized tap targets.** All interactive elements in kid mode: `min-h-[64px] min-w-[64px]`, primary actions `min-h-[72px]`. Enforced via Tailwind utility classes, not ad-hoc.
- **Animation gates.** Kid mode route transitions use 400ms (vs 200ms parent). All `framer-motion` `AnimatePresence` wrappers check `mode context` and apply the correct duration. The `RewardOverlay` auto-dismisses after 3s and does not loop.

> **DEMO shortcuts (clearly marked):** JWT in `localStorage`; PIN in `localStorage` as plain string. **REAL:** httpOnly secure cookie for JWT; hashed server-side PIN + biometric.

## 8. Docker

`docker-compose.yml`:
```yaml
services:
  db:
    image: postgres:16-alpine
    environment: { POSTGRES_USER: storybook, POSTGRES_PASSWORD: storybook, POSTGRES_DB: storybook }
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
  api:
    build: ./apps/api
    env_file: .env
    depends_on: [db]
    ports: ["3000:3000"]
volumes: { pgdata: {} }
```
`.env.example`:
```
DATABASE_URL=postgresql://storybook:storybook@localhost:5432/storybook
JWT_SECRET=change-me
PORT=3000
NODE_ENV=development
VITE_API_URL=http://localhost:3000/api
```

## 9. Seed data (`prisma/seed.ts`) — every edge case demoable

**Users** (password `password`, bcrypt 10 rounds):
- `parent@demo` (USER) — `onboardingCompletedAt: null` (triggers onboarding on first login), **owns "Sleepy Moon Bear"** (archived), **no active subscription**.
- `admin@demo` (ADMIN) — `onboardingCompletedAt: new Date()` (skip onboarding; goes straight to admin panel).

**Categories:** Bedtime (`bedtime`), Adventure (`adventure`), Learning (`learning`), Animals (`animals`).

**Books** (currency IDR; price = whole rupiah):
| Slug | Title | Category | Price | Status | Notes |
|---|---|---|---|---|---|
| `goodnight-star` | Goodnight Little Star | Bedtime | 0 | PUBLISHED | FREE |
| `counting-oyen` | Counting with Oyen | Learning | 0 | PUBLISHED | FREE |
| `brave-boat` | The Brave Little Boat | Adventure | 15000 | PUBLISHED | LOCKED |
| `jungle-friends` | Jungle Friends | Animals | 20000 | PUBLISHED | LOCKED |
| `lost-balloon` | The Lost Balloon | Adventure | 18000 | PUBLISHED | LOCKED |
| `abc-garden` | ABC Garden | Learning | 22000 | PUBLISHED | LOCKED |
| `ocean-splash` | Ocean Splash | Animals | 20000 | PUBLISHED | LOCKED |
| `sleepy-moon-bear` | Sleepy Moon Bear | Bedtime | 25000 | **ARCHIVED** | OWNED by parent |

`coverSlot` for each book = `book.cover.{slug}` (e.g. `book.cover.goodnight-star`).

**Subscription plan:** monthly, `Rp 49.000`, +30d.

This seeds: FREE, LOCKED, OWNED, OWNED+ARCHIVED out of the box; live-subscribe demonstrates SUBSCRIPTION; buying a paid book while subscribed demonstrates buy-to-keep (→ OWNED).

## 10. DEMO vs REAL (technical)

| Area | DEMO (built) | REAL (PPT vision) |
|---|---|---|
| Auth | JWT + seeded users, `localStorage` token | OAuth2 + httpOnly cookies, sessions |
| Parent PIN | Plain string in `localStorage` — **DEMO only, zero security claim** | Hashed server-side (bcrypt) + biometric fallback (Face ID / fingerprint) |
| Onboarding state | `onboardingCompletedAt` field in DB — **this is actually the correct real-world approach too** | Same DB field; additionally synced across devices |
| Book pages | `BookPage` rows store page text and optional image slots; missing images fall back to generated placeholder slots | CDN-backed page art, audio narration, word timing, and localization |
| Payments | Mock, `$transaction`, forced-fail flag | Stripe/Midtrans + webhooks + idempotency |
| Sub expiry | Lazy check at read time | Cron/renewal webhook |
| Search | Prisma `WHERE`/`contains` | Postgres FTS / Algolia |
| Caching | None | Redis (catalog + sub status) |
| Monitoring | `console.log` | Sentry + structured logs |
| CI/CD | Manual deploy | GitHub Actions: lint→test→build→deploy |
| Tests | `resolveAccess` matrix + key integration | Full unit/integration/e2e |
| i18n | EN only | EN + ID |

## 11. Technical micro-decisions (implementation-ready)

All decisions a coding AI needs to avoid ambiguity:

```
JWT:         payload = { sub: userId, role, email } · expiry = 7d · secret = JWT_SECRET env
bcrypt:      10 rounds
CORS:        origin = CORS_ORIGIN env (default: http://localhost:5173)
pnpm-workspace.yaml:  packages: ['apps/*', 'packages/*']
tsconfig:    root tsconfig.json with "paths": { "@storybook/shared": ["packages/shared/src/index.ts"] }
             each app extends root tsconfig + has own tsconfig.json
React Router: react-router-dom v6 (BrowserRouter)
Tailwind:    v3 (shadcn stable; v4 still transitioning)
Fonts:       @fontsource/fredoka + @fontsource/nunito (npm — no external request)
             import '@fontsource/fredoka/400.css'; import '@fontsource/fredoka/600.css';
             import '@fontsource/nunito/400.css';  import '@fontsource/nunito/600.css';
             import '@fontsource/nunito/800.css';
shadcn init: npx shadcn@latest init (choose: TypeScript, default style, CSS variables, Tailwind)
shadcn add:  npx shadcn@latest add button card dialog sheet input label form select switch
             tabs badge avatar skeleton sonner separator scroll-area alert-dialog tooltip
             progress input-otp
```

## 12. Build order (each step runnable)

1. **Monorepo init:** `pnpm-workspace.yaml`, `packages/shared` (types only), `apps/api` + `apps/web` skeletons, root `tsconfig.json` with `@storybook/shared` path alias.
2. **API scaffold:** Express + TS, `app.ts`/`server.ts`, env (zod), prisma singleton, errors, central handler, `/health`. `docker compose up -d` → `prisma migrate dev` → `seed`.
3. **Auth:** login (JWT `{sub,role,email}`, 7d) + middleware + `/auth/me` + `/auth/onboarding/complete`.
4. **Access core:** `resolveAccess` + `access.service.test.ts` (the full edge-case matrix as tests). Pass before any endpoint uses it.
5. **Books read:** list (filter/pagination + per-book `access{}`), detail, `/content` (stored page text + placeholder fallback, hard `403` gate), visibility rules.
6. **Books admin:** CRUD + `requireRole('ADMIN')`, soft-delete → ARCHIVED, admin content wizard endpoints.
7. **Payments:** subscribe (renew +30d) + purchase (atomic `$transaction`, idempotent, buy-to-keep, `simulate` forced-fail).
8. **Library + categories** endpoints.
9. **Web scaffold:** Vite + Tailwind v3 + shadcn init + `shadcn add <component-list>` + token CSS vars (DESIGN §2) + Fredoka/Nunito via `@fontsource` + providers + typed API client + `PlaceholderImage` + `ChunkyButton`.
10. **Auth + onboarding:** login form + profile chips + 4-step onboarding (PIN setup writes `localStorage.storybook_pin` + calls `/auth/onboarding/complete`) + guard redirect.
11. **Kid mode:** home grid, category filter, book detail, `AccessBadge`, locked → `ParentGate` (PIN `1234`), `Mascot` / `EmptyState`.
12. **Reader:** `react-pageflip` + `BookContent` pages from API + `RewardOverlay` (confetti, 3s auto-dismiss).
13. **Parent mode:** subscribe, purchase (buy-to-keep), library, account/PIN management.
14. **Admin:** book table + create/edit (slug required) + archive form with `AlertDialog` + content wizard for cover image and page text.
15. **Polish:** framer-motion (kid 400ms / parent 200ms), all empty/error/404 Oyen states, Swagger, README + demo script.
16. **Deploy:** DB → Neon/Supabase; API → Render/Railway (Docker); web → Vercel (`VITE_API_URL` = deployed API URL).

## 13. Deployment & submission
- **Backend repo + deployed API:** monorepo; API on Render/Railway, DB on Neon/Supabase.
- **Project link:** web on Vercel.
- **README must include:** `docker compose up -d`, `prisma migrate dev`, `seed` command, seeded creds (`parent@demo` / `admin@demo`, password `password`, PIN `1234`), full demo walkthrough script aligned to PRODUCT.md §7 flows, and DEMO vs REAL note for reviewers.

## 14. Open items
- None. All gaps resolved. Ready to build.
