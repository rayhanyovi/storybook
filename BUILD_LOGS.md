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

---

## 2026-06-07 · Feature: Bookmarks, Reading Stats, Search, Responsive Profile

**Files changed:**
- `apps/api/prisma/schema.prisma` and migration SQL — added bookmarks and reading progress
- `apps/api/src/modules/books/*` — added bookmark toggle and read tracking endpoints
- `apps/api/src/modules/library/library.routes.ts` — returns bookmarks, read history, and favorite books
- `apps/web/src/hooks/useBooks.ts` and `apps/web/src/lib/queryKeys.ts` — added tracking types and mutations
- `apps/web/src/components/BookCard.tsx` — bookmark control and read-count metadata
- `apps/web/src/components/AppHeader.tsx` and `BottomTabBar.tsx` — mobile profile route and search navigation
- `apps/web/src/components/ProfileSheet.tsx` and `apps/web/src/pages/ProfilePage.tsx` — shared profile content for sheet/page rendering
- `apps/web/src/pages/SearchPage.tsx` — new search page without featured book
- `apps/web/src/pages/LibraryPage.tsx`, `BookDetailPage.tsx`, `ReaderPage.tsx`, `ParentPage.tsx`, `KidHomePage.tsx`, `App.tsx` — integrated bookmark, search, and read-count flows

**What was implemented:**
Added per-user bookmark tracking, per-book read counters, parent-visible favorite reads, and a dedicated `/search` catalog page. On mobile, `/library` hides the large shelf hero, the header profile button is hidden, and the profile experience now opens as `/profile`; tablet/desktop still use the reusable profile content inside sheet/dropdown surfaces.

**How to test it:**
```bash
pnpm --filter @storybook/api db:generate
pnpm --filter @storybook/api build
pnpm --filter @storybook/api test
pnpm build:vercel
```

Run the new Prisma migration before using the feature against a live database:
```bash
pnpm --filter @storybook/api exec prisma migrate deploy
```

**Known issues:**
- Local login still requires a reachable Postgres database and seeded demo users.
- Vite still reports the existing large bundle warning; it is not a build failure.

---

## 2026-06-07 · Bottom Bar Persistent Render Fix

**Files changed:**
- `apps/web/src/App.tsx` — moved `BottomTabBar` into persistent app chrome outside animated routes
- `apps/web/src/components/AppHeader.tsx` — removed per-page bottom bar rendering

**What was implemented:**
Stopped the mobile bottom bar from being owned by every page header. It now mounts once at the router shell level for authenticated, non-admin app surfaces and only updates its active route state when navigation changes.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

**Known issues:**
- Vite still reports the existing large bundle warning; it is not related to this render fix.

---

## 2026-06-09 · USER-AUTH-ROUTES

**Files changed:**
- `apps/web/src/pages/LoginPage.tsx` — removed the inline register form and added a link to `/register`
- `apps/web/src/pages/RegisterPage.tsx` — added a dedicated register page using the existing demo signup behavior
- `apps/web/src/App.tsx` — registered the `/register` route with the same logged-in redirect behavior as `/login`

**What was implemented:**
Separated the login and register surfaces. `/login` now focuses on sign-in and demo profile entry, while `/register` contains the parent account creation form and a clear link back to login.

**How to test it:**
```bash
pnpm --filter @storybook/web build
pnpm --filter @storybook/web dev
# Open /login and /register, then use the links between them.
```

**Known issues:**
- Register remains demo-only and does not call a backend signup endpoint because the current API contract only defines `/api/auth/login`.
- Vite still reports the existing large bundle warning; it is not related to this route split.

---

## 2026-06-09 · Bookmark Means Reading Progress

**Files changed:**
- `apps/api/prisma/schema.prisma` and `apps/api/prisma/migrations/20260609020500_replace_bookmarks_with_page_progress/migration.sql` — replaced saved-book bookmarks with `ReadingProgress.currentPage`
- `apps/api/src/modules/books/*` — replaced `/books/:id/bookmark` and `/books/:id/read` with `/books/:id/progress`
- `apps/api/src/modules/library/library.routes.ts` — returns reading progress and favorite reads with `currentPage`
- `apps/web/src/hooks/useBooks.ts` — added `useUpdateReadingProgress`
- `apps/web/src/pages/ReaderPage.tsx` — tracks the last page reached and increments reads on completion
- `apps/web/src/components/BookCard.tsx`, `apps/web/src/pages/BookDetailPage.tsx`, `LibraryPage.tsx`, `ParentPage.tsx`, `ProfileSheet.tsx`, `KidHomePage.tsx`, `SearchPage.tsx` — removed saved-book affordances and surfaced page progress instead

**What was implemented:**
Corrected the bookmark feature semantics. Bookmark now means "where the child left off" through `currentPage`, not a saved-for-later/favorite toggle. Read counts now represent completed reader sessions rather than simply opening the reader.

**How to test it:**
```bash
pnpm --filter @storybook/api db:migrate
pnpm --filter @storybook/api build
pnpm --filter @storybook/api test -- --run
pnpm --filter @storybook/web build
```

In the app, open a readable book, flip to page 2 or later, exit, and verify the book detail/card shows the page to continue from. Finish the book and verify the parent "Favorite reads" count increases.

**Known issues:**
- Vite still reports the existing large bundle warning; it is not related to this progress correction.

---

## 2026-06-09 · Parent Reading Stats And Logs

**Files changed:**
- `apps/web/src/pages/ParentPage.tsx` — added child reading stats, top favorite book, and recent reading log cards

**What was implemented:**
Expanded parent mode with a dedicated reading overview. Parents can now see how many books were opened, how many are in progress, total finished reads, the top finished book, and a recent reading log with page position, read count, and last-read date.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open parent mode after reading a book, then verify the reading stats and log update from the tracked page progress.

**Known issues:**
- Vite still reports the existing large bundle warning; it is not related to this dashboard update.

---

## 2026-06-09 · Child Progress Parent Menu

**Files changed:**
- `apps/web/src/pages/ChildProgressPage.tsx` — moved child reading stats, favorite reads, and reading logs into a dedicated parent page
- `apps/web/src/pages/ParentPage.tsx` — removed child progress panels from account/subscription and changed the header action to Back to home without switching mode
- `apps/web/src/components/ProfileSheet.tsx` — added the For Parent menu group with Account and Subscription plus Child Progress
- `apps/web/src/App.tsx` — registered `/parent/child-progress`

**What was implemented:**
Separated parent account management from child reading analytics. The profile menu now exposes parent-specific navigation under "For Parent", and child reading stats live at `/parent/child-progress`.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open the profile menu in parent mode, then use For Parent → Child Progress.

**Known issues:**
- Vite still reports the existing large bundle warning; it is not related to this menu split.

---

## 2026-06-09 · Kid Screen Time Limit

**Files changed:**
- `apps/web/src/providers/ScreenTimeProvider.tsx` — added DEMO-only local screen-time session state and countdown handling
- `apps/web/src/components/ScreenTimeSetup.tsx` — added parent setup dialog for choosing kid-mode time limits
- `apps/web/src/components/ScreenTimeExpiredGate.tsx` — added full-screen expired timer gate requiring parent PIN
- `apps/web/src/components/ParentGate.tsx` — made title, description, and mascot speech configurable
- `apps/web/src/components/ProfileSheet.tsx` — parent-to-kid mode switch now asks for a screen-time limit before entering kid mode
- `apps/web/src/components/AppHeader.tsx` and `apps/web/src/components/BottomTabBar.tsx` — show remaining kid-mode time
- `apps/web/src/App.tsx` — registered global screen-time provider and expired gate

**What was implemented:**
Parents can set a screen-time limit before entering kid mode. While kid mode is active, the remaining time is visible. When the timer expires, the app shows a dedicated lock screen; closing it requires the parent PIN and returns to parent mode.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open the profile menu in parent mode, switch to kid mode, choose a short limit, wait for expiry, then enter the demo PIN `1234`.

**Known issues:**
- Screen-time state is DEMO-only and stored in localStorage. A production version should enforce it server-side or with platform controls.
- Vite still reports the existing large bundle warning; it is not related to this feature.

---

## 2026-06-09 · Illustration Asset Mapping

**Files changed:**
- `apps/web/src/lib/imageRegistry.ts` — mapped real illustration files to mascot, hero, avatar, cover, and page slots
- `apps/web/src/components/PlaceholderImage.tsx` — renders mapped assets with `object-contain` so landscape covers/pages are not cropped inside portrait UI frames

**What was implemented:**
Connected the filled `apps/web/public/illustration` assets to the existing placeholder slot system. Contextual mappings include lock/PIN screens to the cat-with-lock art, reward screens to the confetti art, errors to the tangled-yarn art, 404 to the curious/question art, subscription to the treasure chest, and exact/near-exact book assets for Goodnight Little Star, Counting with Oyen, The Brave Little Boat, and Jungle Friends.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Also validated that every mapped public asset path exists.

**Known issues:**
- Books without a matching asset set, such as The Lost Balloon, ABC Garden, Ocean Splash, and Sleepy Moon Bear, still fall back to the labeled placeholder instead of using mismatched artwork.
- Brave Boat and Jungle Friends have six page images available; extra seeded pages beyond page 6 still fall back to placeholders.
- Vite still reports the existing large bundle warning; it is not related to this asset mapping.

---

## 2026-06-09 · Book Image Ratio Alignment

**Files changed:**
- `apps/web/src/components/BookCard.tsx` — book cards now render covers as 4:3
- `apps/web/src/pages/KidHomePage.tsx` — featured book image now uses a natural 4:3 frame
- `apps/web/src/pages/ReaderPage.tsx` — reader page sizing now assumes 4:3 landscape pages
- `apps/web/src/pages/BookDetailPage.tsx`, `CheckoutPage.tsx`, `ParentPage.tsx`, `ChildProgressPage.tsx`, `AdminPage.tsx`, `AdminBookContentPage.tsx`, `ProfileSheet.tsx` — all book thumbnails/previews now use 4:3 frames

**What was implemented:**
Aligned the UI with the generated book artwork ratio. Book covers and story pages now use landscape 4:3 containers instead of portrait 3:4, preventing the large top/bottom letterboxing shown in featured book and preview surfaces.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open the kid home featured book, book cards, book detail, reader, and admin content preview to verify the artwork sits in a matching 4:3 frame.

**Known issues:**
- Some source images are close to, but not perfectly, 4:3; `object-contain` is still used to avoid cropping title text or characters.
- Vite still reports the existing large bundle warning; it is not related to this ratio correction.

---

## 2026-06-09 · Library Illustration Correction

**Files changed:**
- `apps/web/src/lib/imageRegistry.ts` — mapped `mascot.empty-library` to `7.png`
- `apps/web/src/components/Mascot.tsx` — added the `emptyLibrary` pose
- `apps/web/src/pages/LibraryPage.tsx` — uses `emptyLibrary` for the library hero and empty shelf state

**What was implemented:**
Adjusted the library illustration to use the cat peeking from the bookshelf (`7.png`), which better matches the library/shelf context.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

**Known issues:**
- Vite still reports the existing large bundle warning; it is not related to this illustration correction.

---

## 2026-06-09 · Shared Auth Shell

**Files changed:**
- `apps/web/src/pages/AuthPage.tsx` — added one shared auth shell that switches only the form area by mode
- `apps/web/src/pages/LoginPage.tsx` — renders `AuthPage` in login mode
- `apps/web/src/pages/RegisterPage.tsx` — renders `AuthPage` in register mode
- `apps/web/src/App.tsx` — added `/auth/login` and `/auth/register`, with `/login` and `/register` redirecting to the new routes
- `apps/web/src/components/ProfileSheet.tsx` — logout now returns to `/auth/login`
- `apps/web/src/pages/AdminPage.tsx` — auth redirects now use `/auth/login`

**What was implemented:**
Login and register now share the same `/auth` page shell. `/auth/login` shows the login form and demo profile shortcuts, while `/auth/register` shows the register form in the same surrounding layout. Legacy `/login` and `/register` paths still work as redirects.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open `/auth/login`, `/auth/register`, `/login`, and `/register` to confirm the shell stays consistent and only the form state changes.

**Known issues:**
- Register remains demo-only and shows an informational toast instead of creating a backend account.
- Vite still reports the existing large bundle warning; it is not related to this auth routing change.

---

## 2026-06-09 · Reader Read Aloud Button

**Files changed:**
- `apps/web/src/pages/ReaderPage.tsx` — added a `Bacakan` control to read the current visible story text aloud

**What was implemented:**
The reader header now includes a `Bacakan` button. It uses the saved `BookPage.text` content filled by admin, reads the currently visible page spread through the browser Web Speech API, switches to `Stop` while narration is active, and cancels narration when the child flips pages or exits the reader.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open any accessible book that has page text, enter read mode, tap `Bacakan`, then flip the page to confirm narration stops before starting another page.

**Known issues:**
- Voice availability and quality depend on the browser/device Web Speech implementation.
- Pages without admin-entered text show an informational toast instead of playing narration.
- Vite still reports the existing large bundle warning; it is not related to this read-aloud feature.

---

## 2026-06-09 · Admin Delete Story Page

**Files changed:**
- `apps/web/src/pages/AdminBookContentPage.tsx` — added a confirmable delete action for the currently edited story page

**What was implemented:**
Admins can now delete a story page from the book content editor. The action is available on page slides, not the cover slide, and is disabled when a book only has one page left. Deleting removes the page locally, shifts following pages forward, and persists through the existing Save or Finish flow.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open Admin → a book's Pages editor, navigate to a story page, choose Delete page, confirm it, then Save. Reopen the editor and confirm the page count and ordering are updated.

**Known issues:**
- Deleting a page is not persisted until Save or Finish is clicked, matching the existing content editor edit flow.
- Vite still reports the existing large bundle warning; it is not related to this admin page delete feature.

---

## 2026-06-09 · Auth Shell Vertical Alignment

**Files changed:**
- `apps/web/src/pages/AuthPage.tsx` — centered the shared auth shell within the viewport

**What was implemented:**
Adjusted the auth page wrapper from a top-flow layout to a viewport-centered grid so `/auth/login` and `/auth/register` no longer sit too close to the top of the screen.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open `/auth/register` and `/auth/login` on desktop to confirm the shared shell is vertically centered.

**Known issues:**
- Vite still reports the existing large bundle warning; it is not related to this alignment fix.

---

## 2026-06-09 · PPT-Aligned Screen Time

**Files changed:**
- `apps/web/src/components/ScreenTimeSetup.tsx` — changed presets to 15, 30, and 60 minutes
- `apps/web/src/components/AppHeader.tsx` and `apps/web/src/components/BottomTabBar.tsx` — removed child-facing countdown numbers
- `apps/web/src/components/ScreenTimeExpiredGate.tsx` — defers the global lock screen while the reader is open and uses sleepy Oyen copy/art
- `apps/web/src/pages/ReaderPage.tsx` — lets the child finish the current reader page before showing the screen-time PIN gate
- `apps/web/src/components/Mascot.tsx` and `apps/web/src/components/ParentGate.tsx` — allow parent gate screens to choose a mascot pose

**What was implemented:**
Aligned screen-time behavior with the PPT narrative. Parents now choose 15, 30, or 60 minutes; kid mode no longer shows numeric countdowns; and when time expires during reading, the current page is not interrupted. The screen-time lock appears after the child turns away from that page or after leaving the reader, with sleepy Oyen and parent PIN unlock.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Start kid mode with a short custom duration, enter a book, wait for the timer to expire, then turn the page. The PIN gate should appear after the page turn, not while the child is still on the same page.

**Known issues:**
- Screen-time remains DEMO-only and localStorage-backed; production should integrate server/platform controls.
- Vite still reports the existing large bundle warning; it is not related to this screen-time alignment.

---

## 2026-06-09 · Public Image Compression and Icon Update

**Files changed:**
- `apps/web/public/**/*.png` — compressed public PNG assets in place
- `apps/web/index.html` — changed the favicon from `favicon.svg` to `logo2.png`

**What was implemented:**
Compressed the public image assets while keeping the existing file names and PNG paths intact, so the image registry and UI references do not need changes. The public asset folder was reduced from about 100 MB to about 30 MB. The app icon now points to `/logo2.png`.

**How to test it:**
```bash
pnpm --filter @storybook/web build
```

Open the app in a browser and confirm the tab icon uses `logo2.png`, then browse library/reader screens to verify illustrations still render.

**Known issues:**
- PNGs were palette-compressed, so very subtle gradients may be slightly simplified.
- Vite still reports the existing large bundle warning; it is not related to image compression.

---

## 2026-06-09 · Public Landing Page

**Files changed:**
- `apps/web/src/pages/LandingPage.tsx` — added a public marketing landing page for Storybook
- `apps/web/src/App.tsx` — routes unauthenticated `/` visitors to the landing page while keeping logged-in users in the app

**What was implemented:**
Added a visual landing page with the Storybook brand, book artwork hero, product positioning, CTAs to register/login, and a compact feature overview for kid mode, parent control, read-aloud, screen-time, and progress insights.

**How to test it:**
```bash
pnpm --filter @storybook/web build
pnpm --filter @storybook/web dev -- --host 127.0.0.1
```

Open `/` while logged out to see the landing page. Log in and revisit `/` to confirm authenticated users still enter the app.

**Known issues:**
- Browser automation CLI was not available in this environment, so verification used Vite build plus HTTP checks for `/`, `/logo2.png`, and the hero image asset.
- Vite still reports the existing large bundle warning; it is not related to the landing page.

---

## 2026-06-09 · Supabase and Vercel Connection Audit

**Files changed:**
- `.env` — sanitized old commented production secret examples from the local env file
- `BUILD_LOGS.md` — recorded the audit result

**What was implemented:**
Audited the current Supabase/Postgres and Vercel connection state. Local API health, local login, Prisma migration status, API build, web build, and the Vercel production build command all pass. Supabase MCP is reachable, but the local env files currently point to local Postgres rather than a Supabase database. The checked production Vercel URL returns `DEPLOYMENT_NOT_FOUND`, there is no local `.vercel/project.json`, and the connected Vercel account does not expose a Storybook project.

**How to test it:**
```bash
pnpm --filter @storybook/api build
pnpm --filter @storybook/api test -- --run
pnpm --filter @storybook/web build
pnpm build:vercel
```

Also verified:
- `prisma migrate status` from `apps/api` reports the local database schema is up to date.
- `GET http://localhost:3000/api/health` returns `200`.
- `POST http://localhost:3000/api/auth/login` with the demo parent succeeds locally.

**Known issues:**
- Supabase production DB is not wired into local env files yet; all checked env files use `localhost:5432`.
- Vercel project is not linked locally, and the expected production URL is currently not found on Vercel.
- Vercel CLI and Supabase CLI are not installed in this environment; live Vercel inspection used the connected Vercel app.

---

## 2026-06-09 · Supabase and Vercel Deployment Setup

**Files changed:**
- `apps/api/prisma/schema.prisma` — added Prisma `directUrl` for migration/direct database connections
- `.env.example` — documented local and Supabase/Vercel database URL usage
- `README.md` — tightened Vercel and Supabase deployment instructions
- `docs/TECH.md` — updated the source-of-truth schema/env examples
- `BUILD_LOGS.md` — recorded this setup pass

**What was implemented:**
Prepared the Prisma database configuration for Supabase on Vercel by separating runtime pooled access (`DATABASE_URL`) from direct/session migration access (`DIRECT_URL`). The deployment docs now explain the required Vercel env vars and the one-time Prisma migration/seed commands for Supabase.

**How to test it:**
```bash
pnpm --filter @storybook/api db:generate
pnpm --filter @storybook/api build
pnpm --filter @storybook/api test -- --run
pnpm --filter @storybook/web build
pnpm build:vercel
```

**Known issues:**
- Live Supabase deployment still needs real Supabase connection strings and database password from the dashboard.
- Live Vercel deployment still needs the Storybook project to be imported/linked and env vars set in Vercel.
- Vite still reports the existing large bundle warning; it is not related to the deployment setup.

---

## 2026-06-09 · Supabase Migration and Seed

**Files changed:**
- `BUILD_LOGS.md` — recorded Supabase migration and seed verification

**What was implemented:**
Ran the existing Prisma migrations against the connected Supabase Postgres database, then seeded the demo users, catalog categories, books, and the archived owned-book purchase.

**How to test it:**
```bash
pnpm --dir apps/api exec prisma migrate deploy
pnpm --dir apps/api db:seed
```

Verified against Supabase:
- Demo parent login succeeds for `parent@demo.com`
- Database contains 2 users, 8 books, 4 categories, and 1 purchase
- Published/archived demo catalog split is 7 published books and 1 archived owned book

**Known issues:**
- Supabase page text was added in the later "Demo Reset and Narration Seed Text" task.
- Rotate the Supabase database password because a temporary credential was shared during setup.

---

## 2026-06-09 · Demo Reset and Narration Seed Text

**Files changed:**
- `apps/api/prisma/seed.ts` — added seeded page text for every demo book page
- `apps/api/src/modules/auth/auth.service.ts` — added current-user demo reset transaction
- `apps/api/src/modules/auth/auth.controller.ts` — added demo reset handler
- `apps/api/src/modules/auth/auth.routes.ts` — exposed `POST /api/auth/demo/reset` for parent users
- `apps/web/src/hooks/useBooks.ts` — added reset-demo mutation and cache invalidation
- `apps/web/src/pages/ParentPage.tsx` — added parent-mode reset button with confirmation
- `apps/web/src/pages/LandingPage.tsx` — routed landing CTAs to sign in/demo profiles instead of sign up
- `apps/web/src/components/ProfileSheet.tsx` — removed the most-read card from the profile menu
- `BUILD_LOGS.md` — recorded this task

**What was implemented:**
Seeded story text now exists for all 54 demo book pages so read-aloud has content immediately after seeding. Parent mode now has a reset action that removes the signed-in user's subscription, purchases, payment history, and reading progress while leaving catalog/book/page data intact. Landing page demo CTAs now go to `/auth/login`.

**How to test it:**
```bash
pnpm --dir apps/api db:seed
pnpm --filter @storybook/api build
pnpm --filter @storybook/api test -- --run
pnpm --filter @storybook/web build
pnpm build:vercel
```

Verified against Supabase:
- `BookPage` count is 54 and seeded pages have narration text
- Demo parent state was reset to 0 subscriptions, 0 purchases, 0 reading progress, and 0 payments

**Known issues:**
- Running `pnpm --dir apps/api db:seed` again will restore the seed script's demo purchase for the parent account; use the Parent mode reset button afterward for a fresh user state.
- Rotate the Supabase database password because a temporary credential was shared during setup.
