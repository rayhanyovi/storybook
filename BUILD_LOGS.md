# BUILD_LOGS.md

---

## 2026-06-07 · TASK-006

**Files changed:**
- `docker-compose.yml` — filled with postgres:16-alpine db + api services
- `.env.example` — added DATABASE_URL, JWT_SECRET, PORT, NODE_ENV, VITE_API_URL
- `apps/api/Dockerfile` — multi-stage Node 20 Alpine build

**What was implemented:**
Docker Compose setup with PostgreSQL DB and API services, env example with all required vars, and Dockerfile for the API service.

**How to test:**
```bash
cp .env.example .env
docker compose up -d
# db should be accessible on localhost:5432
```

**Known issues:**
- Prisma schema added (TASK-010); api service in Docker will work once DATABASE_URL is set and migration runs.
- `pnpm-lock.yaml` inside Docker context uses root lockfile; build context may need adjusting once monorepo workspace is mounted correctly.

---

## 2026-06-07 · TASK-010 + TASK-011

**Files changed:**
- `apps/api/prisma/schema.prisma` — full schema: User, Book, Category, Subscription, Purchase, Payment
- `apps/api/prisma/seed.ts` — seeds 2 users, 4 categories, 8 books, 1 purchase (parent owns Sleepy Moon Bear)
- `apps/api/src/lib/prisma.ts` — PrismaClient singleton
- `apps/api/src/config/env.ts` — added DATABASE_URL validation
- `apps/api/package.json` — added bcryptjs, db:migrate / db:seed / db:generate scripts, prisma seed config
- `pnpm-workspace.yaml` — approved build scripts for @prisma/client, @prisma/engines, prisma
- Downgraded `prisma` CLI and `@prisma/client` to `^5` (Prisma 7 dropped `url = env()` in schema)

**How to test:**
```bash
cp .env.example .env
# fill DATABASE_URL
docker compose up -d db
cd apps/api && pnpm db:migrate && pnpm db:seed
# login with parent@demo / password or admin@demo / password
```

**Known issues:**
- None. Seed is idempotent (upsert). Run `prisma migrate reset` to wipe + re-seed.

---

## 2026-06-07 · TASK-014 through TASK-019

**Files changed:**
- `apps/api/src/config/env.ts` — added JWT_SECRET, CORS_ORIGIN
- `apps/api/src/app.ts` — added cors middleware, registered `/api/auth` router
- `apps/api/src/middleware/auth.ts` — JWT verify → req.user, Express Request augment
- `apps/api/src/middleware/requireRole.ts` — role guard middleware
- `apps/api/src/middleware/validate.ts` — Zod body validator middleware
- `apps/api/src/modules/auth/auth.schema.ts` — login body Zod schema
- `apps/api/src/modules/auth/auth.service.ts` — login, getMe, completeOnboarding, signToken, toUserDTO
- `apps/api/src/modules/auth/auth.controller.ts` — loginHandler, meHandler, onboardingCompleteHandler
- `apps/api/src/modules/auth/auth.routes.ts` — POST /login, GET /me, POST /onboarding/complete
- `apps/api/src/modules/access/access.service.ts` — resolveAccess (ADMIN > FREE > OWNED > SUBSCRIPTION > LOCKED)
- `apps/api/tests/access.service.test.ts` — 8 edge-case tests (all pass)
- `apps/api/package.json` — added @storybook/shared workspace dep
- `packages/shared/package.json` — added exports field for TS resolution
- `apps/api/tsconfig.json` — overrode paths to {} so node_modules resolution avoids rootDir conflict

**How to test:**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"parent@demo","password":"password"}'

# Get me (use token from login)
curl http://localhost:3000/api/auth/me -H 'Authorization: Bearer <token>'

# Run unit tests
cd apps/api && pnpm test
```

**Known issues:**
- None. 8/8 access service tests pass. TypeScript compiles clean.

---

## 2026-06-07 · TASK-020 through TASK-027

**Files changed:**
- `apps/api/src/modules/books/books.schema.ts` — list query, create, update schemas
- `apps/api/src/modules/books/books.repository.ts` — findBooks (visibility + filters), findBookById, create/update/archive
- `apps/api/src/modules/books/books.service.ts` — listBooks, getBook, getBookContent (dynamic page gen), admin CRUD
- `apps/api/src/modules/books/books.controller.ts` — all book handlers
- `apps/api/src/modules/books/books.routes.ts` — GET /books, GET /books/:id, GET /books/:id/content, POST/PATCH/DELETE admin
- `apps/api/src/modules/payments/payments.schema.ts` — subscribe, purchase schemas
- `apps/api/src/modules/payments/payments.service.ts` — subscribe (+30d, atomic), purchase (idempotent, buy-to-keep), simulate fail
- `apps/api/src/modules/payments/payments.routes.ts` — POST /payments/subscribe, POST /payments/purchase
- `apps/api/src/modules/library/library.routes.ts` — GET /me/library (sub + owned books)
- `apps/api/src/modules/categories/categories.routes.ts` — GET /categories, POST /categories (admin)
- `apps/api/src/app.ts` — registered all new routers

**How to test:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"parent@demo","password":"password"}' | jq -r .token)

curl http://localhost:3000/api/books -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/api/categories -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/api/me/library -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:3000/api/payments/subscribe \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{}'
```

**Known issues:**
- None. TypeScript compiles clean. 8/8 tests still pass.

---

## 2026-06-07 · TASK-029 through TASK-032

**Files changed:**
- `apps/web/vite.config.ts` — added @tailwindcss/vite plugin + `@/` path alias
- `apps/web/tsconfig.app.json` — added strict, baseUrl, paths (@/* → src/*, @storybook/shared)
- `apps/web/src/index.css` — full Tailwind v4 setup with DESIGN.md §2 tokens (@theme + :root shadcn vars), Fredoka + Nunito font imports
- `apps/web/components.json` — shadcn config
- `apps/web/src/lib/utils.ts` — cn() helper (clsx + tailwind-merge)
- `apps/web/src/lib/api.ts` — typed fetch client with JWT auth header, error parsing, setToken/clearToken
- `apps/web/src/lib/queryKeys.ts` — TanStack Query key factories
- `apps/web/src/providers/AuthProvider.tsx` — user + token state, login/logout/setUser
- `apps/web/src/providers/ModeProvider.tsx` — kid/parent mode toggle
- `apps/web/src/providers/PinProvider.tsx` — localStorage PIN (DEMO-only, clearly commented)
- `apps/web/src/components/ui/*.tsx` — 20 shadcn components (button, card, dialog, sheet, input, label, select, switch, tabs, badge, avatar, skeleton, separator, scroll-area, alert-dialog, tooltip, progress, input-otp, sonner, form)
- `apps/web/src/App.tsx` — QueryClient + all providers + BrowserRouter skeleton
- Installed deps: @tailwindcss/vite, react-router-dom, @tanstack/react-query, zod, react-hook-form, @hookform/resolvers, sonner, all @radix-ui/*, input-otp, vaul

**How to test:**
```bash
cd apps/web && pnpm dev
# → http://localhost:5173 should load (cream background, Fredoka/Nunito fonts)
```

**Known issues:**
- None. Vite production build succeeds (294kb JS, 50kb CSS).

---

## 2026-06-07 · TASK-033 through TASK-040

**Files changed:**
- `src/components/PlaceholderImage.tsx` — muted grey box with label (§9 DESIGN.md)
- `src/components/ChunkyButton.tsx` — 3D press button (primary/secondary/ghost, press-down animation)
- `src/components/AccessBadge.tsx` — FREE/OWNED/SUBSCRIPTION/LOCKED/ADMIN with icon + color
- `src/components/Mascot.tsx` — Oyen placeholder with pose + speech bubble
- `src/components/BookCard.tsx` — cover + title + AccessBadge + locked overlay
- `src/components/ParentGate.tsx` — full-screen PIN gate with framer-motion shake on wrong PIN
- `src/hooks/useAuth.ts` — useMe TanStack Query hook
- `src/hooks/useBooks.ts` — useBooks, useBook, useBookContent, useCategories, useLibrary + mutations
- `src/pages/LoginPage.tsx` — Oyen waving, profile chips, email/password form, demo creds shown
- `src/pages/OnboardingPage.tsx` — 4-step (Welcome → How it works → PIN setup → Who's reading?)
- `src/pages/KidHomePage.tsx` — 2-3 col grid, category filter, bottom nav, ParentGate integration
- `src/pages/BookDetailPage.tsx` — cover, badges, read/locked CTAs, parent gate trigger
- `src/pages/ReaderPage.tsx` — react-pageflip, dynamic pages from API, confetti reward on last page
- `src/pages/ParentPage.tsx` — subscription status, subscribe button, owned books grid
- `src/pages/AdminPage.tsx` — book table, create dialog, archive with AlertDialog
- `src/App.tsx` — full routing with RequireAuth guard + role-based redirect (admin → /admin)

**How to test:**
```bash
cd apps/web && pnpm dev
# → http://localhost:5173
# 1. Click "Kid" chip → lands in kid mode
# 2. Tap a locked book → PIN gate → enter 1234 → parent mode
# 3. Subscribe → entire catalog unlocks
# 4. Click "Admin" chip → admin book table
```

**Known issues:**
- Chunk size warning (653kb JS): expected for demo with framer-motion + radix. Not an error.
- react-pageflip ref typing skipped (typed as any internally); flip still works via events.

---

## 2026-06-07 · TASK-041/TASK-042 Polish Overhaul

**Files changed:**
- `apps/web/src/index.css` — added missing token aliases, focus states, root sizing, and selection polish
- `apps/web/src/lib/imageRegistry.ts` — aligned demo image registry with labeled placeholder-art convention
- `apps/web/src/components/PlaceholderImage.tsx` — upgraded placeholder styling while preserving labels
- `apps/web/src/components/ChunkyButton.tsx` — kept chunky press style and moved edge colors to design tokens
- `apps/web/src/components/AccessBadge.tsx` — tightened labels, icon sizing, and locked-state copy
- `apps/web/src/components/BookCard.tsx` — changed covers to 3:4, hid prices in kid mode, improved locked/metadata layout
- `apps/web/src/components/ProfileSheet.tsx` — cleaned mode switching and subscription copy
- `apps/web/src/components/ParentGate.tsx` — polished PIN gate and removed emoji-only cues
- `apps/web/src/components/ErrorBoundary.tsx` — improved error state copy/actions
- `apps/web/src/providers/PinProvider.tsx` — restored DEMO-only localStorage PIN behavior with `1234` fallback
- `apps/web/src/hooks/useBooks.ts` — invalidated book-detail queries after subscribe/purchase mutations
- `apps/web/src/App.tsx` — added `/parent` PIN guard, `/admin` role guard, and `/auth/me` hydration on refresh
- `apps/web/src/pages/LoginPage.tsx` — rebuilt first impression, profile chips, and route-after-login behavior
- `apps/web/src/pages/OnboardingPage.tsx` — rebuilt 4-step onboarding with real PIN validation
- `apps/web/src/pages/KidHomePage.tsx` — rebuilt kid catalog with hero, category/age filters, stats, and safe locked flow
- `apps/web/src/pages/BookDetailPage.tsx` — rebuilt detail and monetization states, including buy-to-keep while subscribed
- `apps/web/src/pages/LibraryPage.tsx` — rebuilt accessible shelf with free/owned/included tabs
- `apps/web/src/pages/ParentPage.tsx` — rebuilt parent dashboard for subscription, ownership, and trust model
- `apps/web/src/pages/AdminPage.tsx` — rebuilt admin catalog and added edit support through PATCH
- `apps/web/src/pages/ReaderPage.tsx` and `apps/web/src/pages/NotFoundPage.tsx` — cleaned supporting states
- `README.md` — corrected demo credentials/pricing and added assignment submission write-up

**What was implemented:**
Polished the MVP end-to-end without adding dependencies or changing shared contracts. The UI now better demonstrates the buyer/reader split, kid-mode purchase safety, subscription versus buy-to-keep access, accessible versus locked content, and admin CRUD. Parent/admin surfaces are now guarded on the frontend in addition to backend enforcement.

**How to test it:**
```bash
pnpm --filter @storybook/web build
pnpm --filter @storybook/web dev
# Open http://localhost:5173
# Login with parent@demo.com / password, PIN 1234
# Verify kid locked flow -> PIN -> parent book detail
# Subscribe or buy, then confirm badges/library update
# Login admin@demo.com / password and create/edit/archive a book
```

**Known issues:**
- Vite still reports a large bundle warning because the demo ships React, Radix, framer-motion, react-pageflip, and reader dependencies in one bundle. It is not a build failure.
- Placeholder art remains intentionally labeled per `docs/DESIGN.md`; real generated illustration assets are roadmap work.

---

## 2026-06-07 · TASK-041/TASK-042 Featured Card Layout Fix

**Files changed:**
- `apps/web/src/pages/KidHomePage.tsx` — changed featured cards from narrow split layout to stable vertical cards

**What was implemented:**
Fixed the messy featured-card layout where the cover column consumed most of each 3-column card, causing badge/title/metadata text to clip and overlap. Featured cards now use a 16:9 image area above the text content, with badge and lock overlay contained inside the image area.

**How to test it:**
```bash
pnpm --filter @storybook/web build
# Open http://localhost:5173 and check the Featured cards on Kid Home.
```

**Known issues:**
- Vite still reports the existing large bundle warning; not related to this layout fix.

---

## 2026-06-07 · TASK-041/TASK-042 Browse Stories Simplification

**Files changed:**
- `apps/web/src/pages/KidHomePage.tsx` — removed duplicated Featured/Catalog split and kept one Browse stories section

**What was implemented:**
Simplified the Kid Home catalog area so filters and the full book grid live under a single "Browse stories" heading. Removed the separate featured preview and "Catalog" section because they represented overlapping concepts and made the page feel repetitive.

**How to test it:**
```bash
pnpm --filter @storybook/web build
# Open http://localhost:5173 and confirm Kid Home shows only Browse stories with filters and the book grid.
```

**Known issues:**
- Vite still reports the existing large bundle warning; not related to this content/layout simplification.

---

## 2026-06-07 · TASK-041/TASK-042 FeaturedBook Hero

**Files changed:**
- `apps/web/src/pages/KidHomePage.tsx` — replaced the generic hero split with a real `FeaturedBook` highlight component

**What was implemented:**
Added a featured book area with story title, description, access badge, category labels, age label, page count, and a `Read Now` button that routes to the book detail page. Added Prev/Next arrow controls that swap the highlighted book entry without using a slider interaction.

**How to test it:**
```bash
pnpm --filter @storybook/web build
# Open http://localhost:5173 and use Prev/Next in the Featured book section.
```

**Known issues:**
- Vite still reports the existing large bundle warning; not related to this feature.

---

## 2026-06-07 · TASK-041/TASK-042 Mode Toggle Access Flow

**Files changed:**
- `apps/web/src/pages/KidHomePage.tsx` — added visible Kid/Parent access toggle in the header
- `apps/web/src/components/ProfileSheet.tsx` — changed mode switching to stay on the current surface after PIN

**What was implemented:**
Made Kid Mode and Parent Mode behave like access states rather than separate visual experiences. Turning Kid Mode on requires no PIN. Turning Kid Mode off by switching to Parent requires the existing PIN gate. The header now exposes a right-side Kid/Parent toggle, and ProfileSheet switching no longer redirects to the parent account page.

**How to test it:**
```bash
pnpm --filter @storybook/web build
# Open http://localhost:5173
# Click Parent in the header toggle -> PIN gate appears.
# Enter 1234 -> Parent access turns on without changing the page.
# Click Kid -> Kid Mode turns on immediately.
```

**Known issues:**
- Vite still reports the existing large bundle warning; not related to this access-flow change.

---

## 2026-06-07 · TASK-041/TASK-042 FeaturedBook Compact Navigation

**Files changed:**
- `apps/web/src/pages/KidHomePage.tsx` — compacted the FeaturedBook card and moved navigation arrows to floating side controls

**What was implemented:**
Reduced the FeaturedBook card height and spacing slightly so it feels tighter. Moved Prev/Next controls out of the content row and made them floating buttons on the left and right side of the featured component.

**How to test it:**
```bash
pnpm --filter @storybook/web build
# Open http://localhost:5173 and confirm FeaturedBook is shorter with floating side arrows.
```

**Known issues:**
- Vite still reports the existing large bundle warning; not related to this layout adjustment.

---

## 2026-06-07 · TASK-041/TASK-042 Responsive Profile Menu

**Files changed:**
- `apps/web/src/components/ProfileSheet.tsx` — desktop profile dropdown, tablet/mobile animated sheet, footer credit
- `apps/web/src/pages/KidHomePage.tsx` — removed stale FeaturedBook props/imports found during build verification

**What was implemented:**
Changed the profile menu behavior so desktop opens a compact dropdown menu from the top-right instead of a side sheet. Tablet and mobile keep the side sheet with enter/exit slide animation timing. Added the footer text: "Developed by Muhammad Rayhan Yovi for Technical Test Purpose."

**How to test it:**
```bash
pnpm --filter @storybook/web build
# Desktop: click profile icon and confirm a dropdown opens.
# Tablet/mobile: click profile icon and confirm the side sheet slides in/out.
```

**Known issues:**
- Vite still reports the existing large bundle warning; not related to this responsive menu change.

---

## 2026-06-07 · TASK-041/TASK-042 Profile Mode Toggle UI

**Files changed:**
- `apps/web/src/components/ProfileSheet.tsx` — replaced the mode `Switch` button with a segmented toggle control

**What was implemented:**
Updated the profile menu mode control from a text button to a pill-style Kid/Parent toggle with a moving indicator. Behavior is unchanged: switching from Kid to Parent still opens the PIN gate, while switching back to Kid is immediate.

**How to test it:**
```bash
pnpm --filter @storybook/web build
# Open the profile menu and click the Kid/Parent toggle.
```

**Known issues:**
- Vite still reports the existing large bundle warning; not related to this UI change.

---

## 2026-06-07 · TASK-041/TASK-042 Admin Content Wizard

**Files changed:**
- `packages/shared/src/index.ts` — added page text and admin content DTOs
- `apps/api/prisma/schema.prisma` — added `BookPage`
- `apps/api/prisma/migrations/20260607090000_add_book_pages/migration.sql` — persists page text/image slots
- `apps/api/src/modules/books/*` — added admin content read/update endpoints and stored content fallback logic
- `apps/web/src/lib/api.ts`, `apps/web/src/lib/queryKeys.ts`, `apps/web/src/hooks/useBooks.ts` — added `PUT` support and admin content queries/mutations
- `apps/web/src/pages/AdminBookContentPage.tsx` — new admin wizard for book image + page text
- `apps/web/src/pages/AdminPage.tsx` — added Pages action for each book
- `apps/web/src/pages/ReaderPage.tsx` — renders stored page text in the reader
- `docs/PRODUCT.md`, `docs/TECH.md`, `docs/DESIGN.md` — synced product, technical, and design specs

**What was implemented:**
Added an admin-only content page at `/admin/books/:id/content`. Admins can enter a book image slot/URL, adjust page count, add text page-by-page, and use Prev/Next/Finish actions that save progress. Reader content now uses stored `BookPage` rows for page text while keeping generated placeholder image slots as fallback.

**How to test it:**
```bash
pnpm --filter @storybook/api exec prisma migrate dev --skip-seed
pnpm --filter @storybook/api db:generate
pnpm --filter @storybook/api build
pnpm --filter @storybook/api test
pnpm --filter @storybook/web build
# Log in as admin@demo.com, open Admin catalog, click Pages on a book.
# Add a cover image slot/URL and page text, click Next through the pages, then Finish.
# Open the same book in the reader and confirm the page text appears.
```

**Known issues:**
- Vite still reports the existing large bundle warning; not related to the content wizard.

---

## 2026-06-07 · TASK-044 Vercel Monorepo Deploy Prep

**Files changed:**
- `vercel.json` — added root Vercel config for monorepo deploys
- `api/index.ts` — added Vercel Express function entrypoint
- `package.json` — added `build:vercel`
- `apps/api/src/app.ts` — exported the Express app as default for Vercel
- `apps/web/src/lib/api.ts` — default production API base now uses same-origin `/api`
- `apps/web/vercel.json` — removed stale placeholder API env
- `.env.example` — added `CORS_ORIGIN`
- `README.md` — replaced split Render/Railway deploy notes with Vercel monorepo notes
- `docs/TECH.md` — aligned deployment notes with the Vercel monorepo target

**What was implemented:**
Prepared the repo to deploy from the monorepo root on Vercel. Vercel now installs from the root, generates Prisma Client, type-checks the API, builds the Vite app, serves static output from `apps/web/dist`, and routes `/api/*` to the existing Express app through a Vercel Function.

**How to test it:**
```bash
pnpm --filter @storybook/api build
pnpm --filter @storybook/api test
pnpm build:vercel
```

In Vercel, import the repo with root directory set to the repository root, set `DATABASE_URL`, `JWT_SECRET`, and optionally `CORS_ORIGIN`, then deploy.

**Known issues:**
- Database migrations and seed data still need to be run once against the hosted Neon/Supabase database.
- Vite still reports the existing large bundle warning; it is not a deployment failure.
