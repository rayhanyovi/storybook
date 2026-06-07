# Storybook — Product & Engineering Submission
> **Muhammad Rayhan Yovi** · Technical Test Submission

---

## SLIDE 1 — Cover

**Storybook**
_A paid digital library for kids — safe browsing, flexible monetization, full admin control._

- Paid Kids' Storybook Library MVP
- Full-stack: React 19 + Node.js/Express + PostgreSQL (Prisma)
- Dual-entitlement: Subscription + Buy-to-Keep
- Three user surfaces: Kid · Parent · Admin

---

## SLIDE 2 — The Problem & Product Vision

### Problem Statement
Parents want to give kids access to curated digital books, but existing solutions either:
- Expose kids to purchase UI, ads, and adult content
- Lock everything behind one subscription model with no ownership
- Give no admin tooling for catalog operators

### Vision
A **child-safe digital library** where:
- Kids browse freely in a simple, distraction-free surface
- Parents control access and purchases behind a PIN gate
- Catalog operators manage content lifecycle from a dedicated admin panel
- Readers can "own" books permanently OR access the full catalog by subscription

---

## SLIDE 3 — Target Users & Key Assumptions

### Target Users

| User | Who They Are | Core Need |
|------|-------------|-----------|
| **Kid** | Ages 3–12, reads independently or with parent | Safe, simple reading experience — no distractions |
| **Parent** | Account holder, manages subscriptions & purchases | Control what kids see and buy; permanent ownership of favorites |
| **Admin / Operator** | Content team or catalog manager | Create, publish, and archive books without engineering support |

### Key Assumptions
1. **One account = one family.** Parent holds the account; kids share the same session but in "kid mode."
2. **Mocked payment is acceptable for MVP.** No real PSP integration — failure path is testable via a `simulate: 'fail'` toggle.
3. **Catalog is curated, not user-generated.** Only ADMIN-role users can create/publish books.
4. **Subscription is monthly, flat-fee.** Price: Rp 49.000/month, 30-day rolling window.
5. **Ownership survives archival.** If a parent bought a book that later gets archived, they still keep reading access.
6. **PIN is 4-digit, stored client-side for demo.** In production this would be a hashed server-side PIN on the User model.

---

## SLIDE 4 — Core Feature Set

### Kid Surface
- Discover page with featured book carousel + filtered catalog grid
- Book detail page showing age range, category, price/subscription badge
- Page-flip reader (react-pageflip) with immersive full-screen layout
- Age filter chips (2–4, 4–6, 6–8, 8+)
- Free books accessible immediately; paid books show "Ask a grown-up"

### Parent Surface (PIN-gated)
- Toggle between Kid Mode ↔ Parent Mode via 4-digit PIN gate
- Subscription management panel — Active / Inactive status, expiry date
- One-time purchase ("Buy to keep") for individual books
- Owned books list — permanent, survives subscription cancellation
- Renew subscription CTA

### Checkout (Mock Stripe-style)
- Pre-filled demo card details (4242 4242 4242 4242)
- "Simulate declined card" toggle to exercise failure path
- Confetti + toast on success
- Clear error toast + stay on page on failure
- Supports both `purchase` and `subscription` payment types via URL params

### Admin Surface
- Full book catalog CRUD (create, edit metadata, archive)
- Slide-based content editor: Cover Slide → Page Slides → Add Page
- Per-page story text editor with character counter
- Book lifecycle: DRAFT → PUBLISHED → ARCHIVED
- Category management

---

## SLIDE 5 — Access Control Design

### The Access Hierarchy (Priority Order)

```
ADMIN   → Always full access (no purchase/sub check)
FREE    → priceCents === 0 → always readable
OWNED   → User has a Purchase record for this book
SUBSCRIPTION → User has an active, non-expired Subscription
LOCKED  → None of the above
```

### Backend Implementation (`access.service.ts`)

```typescript
export async function resolveAccess(user: JwtPayload, book: BookLike): Promise<AccessResult> {
  if (user.role === 'ADMIN')          return { canAccess: true, reason: 'ADMIN' };
  if (book.priceCents === 0)          return { canAccess: true, reason: 'FREE' };
  if (await ownsBook(user.sub, book.id))  return { canAccess: true, reason: 'OWNED' };
  if (await hasActiveSub(user.sub))   return { canAccess: true, reason: 'SUBSCRIPTION' };
  return { canAccess: false, reason: 'LOCKED' };
}
```

OWNED is always checked before SUBSCRIPTION — confirmed by unit tests.

### Frontend Access Control (Two Layers)

**Layer 1 — Route Guard**
- `RequireAuth` → redirect to `/login` if no JWT
- `RequireAdmin` → redirect to `/` if not ADMIN role
- `RequireParentMode` → show PIN gate if in kid mode

**Layer 2 — Component Guard**
- Kid mode: "locked" books show "Ask a grown-up" → ParentGate PIN dialog
- On PIN success: parent mode activated, checkout opens
- Mode stored in React context (ModeProvider), never persisted to JWT

### Edge Cases Handled

| Edge Case | How It's Handled |
|-----------|-----------------|
| Subscription expires mid-session | `hasActiveSub` checks `expiresAt > NOW()` on every API call |
| Book archived after purchase | Owned books remain readable; Library page labels them "Archived, still owned" |
| Duplicate purchase attempt | `purchase()` is idempotent — checks for existing record, returns it |
| Admin bypasses payment UI | Admin role gets `reason: 'ADMIN'` before any DB check |
| Kid tries to navigate to `/parent` | `RequireParentMode` intercepts and renders ParentGate |
| JWT expired | `useMe` query fails → `useEffect` triggers logout + redirect to `/login` |
| Payment declined (simulate) | Failure record written to `Payment` table with `status: FAILED`; UI stays on checkout |

---

## SLIDE 6 — System Architecture

```
┌─────────────────────────────────────────────┐
│              pnpm Monorepo                  │
│                                             │
│  ┌─────────────┐    ┌─────────────────┐     │
│  │  apps/web   │    │   apps/api      │     │
│  │  React 19   │    │   Express 5     │     │
│  │  Vite 8     │◄──►│   Prisma ORM    │     │
│  │  TailwindV4 │    │   PostgreSQL    │     │
│  └─────────────┘    └────────┬────────┘     │
│                              │              │
│  ┌─────────────────────────┐ │              │
│  │  packages/shared        │◄┘              │
│  │  TypeScript DTOs        │                │
│  │  Shared types/contracts │                │
│  └─────────────────────────┘                │
└─────────────────────────────────────────────┘
```

### Frontend Stack
- **React 19** + **React Router DOM v7** (client-side routing, nested routes)
- **TanStack Query v5** — server state, caching (staleTime 30s), auto-refetch
- **TailwindCSS v4** — `@theme` tokens + `:root` shadcn vars, Fredoka (display) + Nunito (body)
- **shadcn/ui** + **Radix UI** primitives — Switch, Sheet, Dialog, InputOTP, Select
- **Framer Motion** — page transitions (AnimatePresence)
- **Sonner** — toast notifications (richColors)
- **canvas-confetti** — payment success celebration

### Backend Stack
- **Express 5** + **TypeScript** (strict mode)
- **Prisma 5** ORM → **PostgreSQL**
- **JWT** (jsonwebtoken, 7-day expiry) + **bcryptjs** password hashing
- **Zod** schema validation on all incoming request bodies
- **Vitest** unit testing (access service, coverage of all access reasons)

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Email/password login → JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/auth/onboarding/complete` | JWT | Mark onboarding done |
| GET | `/api/books` | JWT | List books (with access resolved) |
| GET | `/api/books/:id` | JWT | Single book + access |
| GET | `/api/books/:id/content` | JWT | Page content (access-gated) |
| POST | `/api/books` | ADMIN | Create book |
| PATCH | `/api/books/:id` | ADMIN | Update book metadata |
| DELETE | `/api/books/:id` | ADMIN | Archive book |
| GET | `/api/books/:id/admin-content` | ADMIN | Full content for editor |
| PUT | `/api/books/:id/admin-content` | ADMIN | Upsert pages + cover slot |
| POST | `/api/payments/subscribe` | JWT | Create subscription |
| POST | `/api/payments/purchase` | JWT | Purchase a book |
| GET | `/api/me/library` | JWT | Owned books + subscription status |
| GET | `/api/categories` | JWT | List all categories |

---

## SLIDE 7 — Data Model

### Entity Relationship Overview

```
User ──────────── Subscription  (1:many, latest ACTIVE checked)
User ──────────── Purchase      (1:many, @@unique userId+bookId)
User ──────────── Payment       (1:many, audit log for all transactions)
Book ──────────── Purchase      (1:many)
Book ──────────── BookPage      (1:many, @@unique bookId+index)
Book ◄──M:M────── Category      (via BookCategories relation)
```

### Core Models

**User**
```
id, email, passwordHash, role (ADMIN|USER),
onboardingCompletedAt, createdAt, updatedAt
```

**Book**
```
id, slug (unique), title, author, description,
coverSlot (image key), priceCents, currency,
ageMin, ageMax, pageCount,
status (DRAFT|PUBLISHED|ARCHIVED),
categories[], pages[]
```

**BookPage**
```
id, bookId, index (1-based), imageSlot, text,
@@unique([bookId, index])
```

**Subscription**
```
id, userId, status (ACTIVE|EXPIRED|CANCELED),
plan ("MONTHLY"), startedAt, expiresAt
```

**Purchase**
```
id, userId, bookId, pricePaidCents, purchasedAt
@@unique([userId, bookId])  ← idempotency
```

**Payment**
```
id, userId, type (SUBSCRIPTION|BOOK_PURCHASE),
amountCents, currency, status (SUCCEEDED|FAILED|PENDING),
referenceId, idempotencyKey (unique ← dedup)
```

### Design Decisions
- `pricePaidCents` on Purchase preserves the price paid at time of purchase (price may change later)
- `idempotencyKey` on Payment prevents double-charging from retries
- `expiresAt > NOW()` check on Subscription — server never trusts client-side subscription state
- Soft delete on books via `ARCHIVED` status, not physical delete (preserves ownership history)

---

## SLIDE 8 — High-Level Roadmap

### Phase 0 — MVP (Current, ✅ Done)
- [x] Auth: email/password login, JWT, role-based middleware
- [x] Book catalog: CRUD, lifecycle, category tagging
- [x] Access engine: ADMIN / FREE / OWNED / SUBSCRIPTION / LOCKED
- [x] Two entitlements: monthly subscription + one-time purchase
- [x] Page-flip reader with content gating
- [x] Kid mode / Parent mode (PIN gate)
- [x] Admin panel: full catalog management, slide-based content editor
- [x] Mock Stripe checkout with failure simulation
- [x] Onboarding flow
- [x] Unit tests: access service (7 cases)

### Phase 1 — Production Readiness
- [ ] Real payment gateway (Midtrans or Stripe)
- [ ] Subscription renewal & cancellation flows
- [ ] Email verification & password reset
- [ ] Hashed server-side PIN (currently client-demo only)
- [ ] CDN-hosted images (replace PlaceholderImage slots with real URLs)
- [ ] Rate limiting & brute-force protection on login
- [ ] Refresh token rotation (currently 7-day JWT only)

### Phase 2 — Growth Features
- [ ] Multiple child profiles per parent account
- [ ] Reading progress tracking (bookmarks, last page)
- [ ] Parental reading history & activity reports
- [ ] Push notifications for new book releases
- [ ] Offline reading support (service workers + IndexedDB)
- [ ] Gift cards / family plans

### Phase 3 — Content Scale
- [ ] Creator portal (author uploads own content)
- [ ] Audio narration per page
- [ ] Multi-language support (UI + book content)
- [ ] Recommendation engine (by age, category, reading history)
- [ ] Content moderation & review workflow

---

## SLIDE 9 — Success Metrics

### Acquisition
| Metric | Target (Month 3) | How to Measure |
|--------|-----------------|----------------|
| Registered parents | 500 | `COUNT(User WHERE role=USER)` |
| Books in catalog | 30 | `COUNT(Book WHERE status=PUBLISHED)` |
| Organic signups / month | 100 | Auth logs, UTM tracking |

### Engagement
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Reading sessions / DAU | ≥ 2 | Track `GET /books/:id/content` per user per day |
| Books read per session | ≥ 1.5 | Reader open + close events |
| Return rate (D7) | ≥ 40% | Cohort analysis on login events |

### Monetization
| Metric | Target (Month 3) | How to Measure |
|--------|-----------------|----------------|
| Paying families | 50 | `COUNT(User WITH active sub OR purchase)` |
| Subscription conversion | ≥ 15% of registered | `COUNT(active Subscription) / COUNT(User)` |
| MRR | Rp 2.450.000 | 50 subs × Rp 49.000 |
| Buy-to-keep revenue | Rp 500.000 | `SUM(Purchase.pricePaidCents)` |
| Payment failure rate | < 5% | `COUNT(Payment WHERE FAILED) / COUNT(Payment)` |

### Content & Admin
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Books published / month | ≥ 5 | `status` transitions in audit log |
| Avg time to publish | < 2 days | `createdAt → status=PUBLISHED` delta |

---

## SLIDE 10 — Clean Architecture Highlights

### Separation of Concerns

```
apps/api/src/
├── modules/
│   ├── access/       ← pure business logic (resolveAccess)
│   ├── auth/         ← controller / service / schema / routes
│   ├── books/        ← controller / service / repository / schema / routes
│   ├── payments/     ← service / schema / routes
│   ├── library/      ← routes
│   └── categories/   ← routes
├── middleware/        ← auth, requireRole, validate (Zod), errorHandler
├── lib/               ← prisma singleton, AppError hierarchy
└── config/            ← env validation (Zod)
```

- **Controller** — HTTP in/out only, no business logic
- **Service** — pure business rules, calls prisma directly
- **Repository** (books) — complex queries isolated from service logic
- **Middleware** — `validate(schema)` wraps any Zod schema for request body validation
- **Error hierarchy** — `AppError → NotFoundError / ForbiddenError / ConflictError / PaymentFailedError`; centralized `errorHandler` middleware

### Frontend Architecture
```
src/
├── providers/    ← AuthProvider (JWT), ModeProvider (kid/parent), PinProvider
├── hooks/        ← useBooks, useAuth (TanStack Query wrappers)
├── pages/        ← one file per route
├── components/   ← shared UI (AppHeader, ChunkyButton, ParentGate, Mascot…)
└── lib/          ← api client, queryKeys, imageRegistry, utils
```

### Shared Package
- `packages/shared` exports all DTOs and types used by both frontend and backend
- Zero duplication — `BookWithAccess`, `AccessResult`, `UserDTO` etc. defined once
- TypeScript strict mode across all packages

---

## SLIDE 11 — Trade-offs & Design Rationale

| Decision | Chosen Approach | Alternative | Why |
|----------|----------------|-------------|-----|
| Auth | JWT in localStorage | httpOnly cookie | Simpler for demo; comment in code flags prod recommendation |
| PIN | Client-side (PinProvider) | Hashed server PIN | Scope: demo MVP; would be server-side in production |
| Images | PlaceholderImage slot system | Real CDN URLs | No CDN budget/setup for demo; slots are forward-compatible |
| Payments | Mocked with simulate flag | Real Midtrans/Stripe | Avoids payment provider onboarding for a technical test |
| Subscription check | DB query per API call | Cached in JWT claims | Accuracy over speed — sub status can change at any time |
| Mode switching | React context (not URL) | URL param / cookie | Kid/parent mode is ephemeral per-session, not persisted |
| Page content | JSON pages in DB (BookPage) | MDX / S3 files | Simpler CRUD, good enough for text + image slot per page |

---

## SLIDE 12 — How AI Tools Were Used

### Role of AI in This Project

AI (Claude via Cursor/Claude Code) was used as a **pair programmer and design reviewer** — not as a code generator that runs unsupervised.

### Workflow
1. **Architecture first** — Designed data model and API surface manually, then used AI to validate edge cases and spot gaps (e.g., idempotency on Purchase, expiry check on Subscription).

2. **Component scaffolding** — Used Claude to generate initial boilerplate for shadcn-integrated components (ChunkyButton variants, ParentGate OTP dialog), then iterated on exact styling, states, and accessibility.

3. **Access control logic review** — Prompted Claude to enumerate all access edge cases ("what happens if a sub expires while a user is reading?", "what if the book is archived after purchase?") and validated the resolveAccess priority order against those cases.

4. **UI polish iterations** — Described design intent in natural language ("a Stripe-style checkout with a test mode badge, a decline-simulation switch, and confetti on success") and iterated on the output, adjusting spacing, color tokens, and responsive layout.

5. **Test coverage** — Asked Claude to generate the Vitest test cases for `resolveAccess`, then reviewed each case for correctness and added the "OWNED is checked before SUBSCRIPTION" short-circuit test manually.

### Specific Prompts & Iterations
- *"Write a resolveAccess function that checks: admin bypass, free book, owned, active subscription, in that priority order — return `{canAccess: boolean, reason: AccessReason}`"* → got the core function, then added the idempotency logic manually.
- *"Design a kid/parent mode system that survives page refresh, has a PIN gate, and doesn't expose purchase UI to kids"* → ModeProvider + PinProvider pattern emerged; refined the ParentGate component across 3 iterations.
- *"Rework the admin book editor into a slide-based interface: slide 0 = cover, slide N = page N, with Prev/Next/Add Page navigation"* → initial structure generated, then refined the `isLastSlide` logic, the Add Page + Finish co-location, and the progress bar semantics.

### Where Human Judgment Overrode AI Output
- Moved subscription check to server (AI initially suggested caching in JWT claims for performance)
- Kept `pricePaidCents` on Purchase separate from `Book.priceCents` (AI initially stored only bookId)
- Chose soft-delete (ARCHIVED status) over physical delete after considering ownership implications

---

## SLIDE 13 — Summary & What to Highlight in Demo

### 🎯 Key Highlights

1. **Dual entitlement model** — Subscription + Buy-to-keep coexist cleanly; ownership survives subscription churn and book archival
2. **Access control engine** — Single `resolveAccess()` function, strict priority order, fully unit-tested (7 cases)
3. **Two-surface UX** — Kid mode is genuinely safe (no purchase UI); Parent mode is PIN-gated throughout
4. **Full admin lifecycle** — DRAFT → PUBLISHED → ARCHIVED, slide-based content editor, category management
5. **Mock checkout with failure path** — Simulates real payment flows including decline + confetti success
6. **Shared type safety** — One `packages/shared` package, zero DTO duplication across frontend and backend
7. **Clean architecture** — Controller/Service/Repository pattern, centralized error handling, Zod validation at boundaries
8. **No shortcuts on edge cases** — Idempotent purchases, server-side expiry checks, JWT invalidation on error

### 🔗 Deliverables
- Backend repo: `apps/api/`
- Frontend: `apps/web/`
- Shared types: `packages/shared/`
- API: Express 5 + PostgreSQL (Prisma) — deployable via `pnpm start:prod`
- Frontend: Vite SPA — deployable to any static host

---

*Storybook v1.0 · Muhammad Rayhan Yovi · Technical Test Submission*
