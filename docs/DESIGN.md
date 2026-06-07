# DESIGN.md — Design DNA

> Expands the **Design baseline** in `BASELINE.md`. Anchored decisions: Duolingo-inspired *qualities* (lots of illustration, friendly flat style, playful color combos) with **original assets**; **not** mascot-driven but **one cat mascot**; palette **direction A** (warm/cream base + playful pops); cream background (never stark white); **Fredoka** (display) + **Nunito** (body); no dark mode; reader = swipe + paper-flip; tablet-first (Tablet > Mobile > Desktop). Stack: React + Tailwind + shadcn/ui + framer-motion.
>
> **Demo note:** all illustrations ship as **labeled grey placeholder boxes** (§9). The Image Registry (§10) is the spec for generating real images later in a separate AI session.

---

## 1. Design principles

1. **Warm, not clinical.** Cream over white, espresso over black, rounded over sharp. Nothing feels like an enterprise dashboard — even the admin panel stays friendly.
2. **Illustration-led.** Screens lean on imagery, not text walls. Every empty state, milestone, and key screen has art.
3. **Chunky & tactile.** Big rounded shapes, thick "3D" buttons that physically press down. Designed for small fingers on a tablet.
4. **Playful but legible.** Bright multicolor accents over a calm cream base; color is fun but never fights readability.
5. **One friendly guide.** The cat mascot is the emotional thread — it greets, celebrates, and softens locked/empty/error moments. It is a *presence*, not the navigation system.
6. **Two audiences, one brand.** Kid mode is bigger, brighter, wordless-er. Parent/admin are denser and more textual — same palette and roundness, more information.
7. **Motion restraint is a child safety decision, not a style preference.** Toddlers (ages 2–4) have immature sensory processing systems. Excessive visual motion — looping animations, rapid cuts, multiple moving elements — causes overstimulation, reduced story comprehension, and distress. This is the same science behind why Bluey, Peppa Pig, and Dora use deliberately slow pacing and frequent still frames: *the pause is the content*. In our UI: animations are purposeful and user-initiated, never looping decoratively, and the reading view is a motion-free zone. When in doubt, don't animate.

## 2. Color system (direction A)

Warm cream base + playful pops. Text/ink is warm espresso, never pure black. Hex values below; in code these become the shadcn CSS variables in `globals.css` and the Tailwind theme.

### Neutrals (the calm base)
| Token | Hex | Use |
|---|---|---|
| `--background` (cream) | `#FBF3E7` | App background — the signature cream |
| `--card` / surface | `#FFFDF9` | Cards, sheets (near-white, pops gently off cream) |
| `--muted` | `#F3E9D8` | Subtle fills, disabled, placeholder base |
| `--ink` (foreground) | `#3A2E28` | Primary text (warm espresso) |
| `--ink-soft` (muted-fg) | `#8A7A6D` | Secondary text, captions |
| `--line` (border) | `#ECE0CE` | Borders, dividers |

### Brand (warm leads)
| Token | Hex | Press/Hover | Use |
|---|---|---|---|
| `--primary` (coral-orange) | `#FF7B54` | `#F2603A` | Primary actions, CTAs, brand |
| `--primary-foreground` | `#FFFFFF` | | Text on primary |
| `--secondary` (sunny yellow) | `#FFC93C` | `#F0B523` | Secondary actions, highlights |
| `--peach` | `#FFB084` | | Soft warm fills, badges |

### Playful pops (Duolingo-style multicolor accents)
| Token | Hex | Use |
|---|---|---|
| `--accent-teal` | `#2EC4B6` | Category tags, variety |
| `--accent-blue` | `#4CB9E7` | Category tags, info-ish |
| `--accent-purple` | `#A78BFA` | Category tags, "premium" feel |
| `--accent-green` | `#7BC950` | Category tags, "owned" vibe |
| `--accent-pink` | `#FF8FB1` | Category tags, fun |

### Semantic (feedback)
| Token | Hex | Use |
|---|---|---|
| `--success` | `#58CC02` | Owned, success toast, completion |
| `--warning` | `#FFB020` | Subscription expiring, caution |
| `--destructive` | `#FF4B4B` | Errors, delete, payment failed |
| `--info` | `#1CB0F6` | Info, "included in subscription" |

### Access-state color mapping (used by `AccessBadge`)
- `FREE` → teal · `OWNED` → green (`--success`) · `SUBSCRIPTION` → blue (`--info`) · `LOCKED` → muted grey + lock icon · `ADMIN` → purple.
- **Never rely on color alone** — always pair with an icon + label (a11y + kids).

### `globals.css` (illustrative `:root`)
```css
:root {
  --background: #FBF3E7;  --foreground: #3A2E28;
  --card: #FFFDF9;        --card-foreground: #3A2E28;
  --muted: #F3E9D8;       --muted-foreground: #8A7A6D;
  --border: #ECE0CE;      --input: #ECE0CE;  --ring: #FF7B54;
  --primary: #FF7B54;     --primary-foreground: #FFFFFF;
  --secondary: #FFC93C;   --secondary-foreground: #3A2E28;
  --accent: #2EC4B6;      --accent-foreground: #FFFFFF;
  --destructive: #FF4B4B; --destructive-foreground: #FFFFFF;
  --radius: 1rem; /* chunky base */
}
```

## 3. Typography

Two rounded Google fonts, loaded via `@fontsource` or Google Fonts.

- **Fredoka** (weights 400–600) → display, headings, buttons, numbers, mascot speech. Rounded, geometric, playful.
- **Nunito** (weights 400–800) → body, descriptions, labels, longer reading UI. Highly legible, friendly.

| Role | Font / size (tablet) / weight | Notes |
|---|---|---|
| Display / H1 | Fredoka · 44px · 600 | Onboarding, big moments |
| H2 | Fredoka · 32px · 600 | Section headers |
| H3 | Fredoka · 24px · 500 | Card titles, dialogs |
| Title | Fredoka · 20px · 500 | Book titles |
| Button | Fredoka · 18px · 500–600 | All buttons |
| Body L | Nunito · 18px · 400–600 | Descriptions |
| Body | Nunito · 16px · 400 | Default text |
| Caption | Nunito · 14px · 600 | Meta, badges, prices |

**Kid mode bumps up one step** (e.g., Body L → 20–22px) and uses fewer words.

## 4. Shape, depth & the chunky button

- **Radius:** base `16px`. Buttons `14–16px`, cards `20–24px`, pills/chips fully rounded, mascot bubbles `20px`.
- **Tap targets (kid mode):** minimum **64px**, preferred **72px** for primary actions. WCAG minimum (44px) is designed for adults — toddlers have significantly less motor precision. Standard targets designed for adults cause frustration and failed taps. Opting for over-sized targets in kid mode is a deliberate child development decision, not over-engineering.
  - Card ambient: `0 8px 24px rgba(58,46,40,0.08)`
  - Chunky button solid edge: a darker shade as `border-bottom: 4px solid` (the "3D" base).
- **Chunky button (signature interaction):** thick bottom edge in a darker tint; on `:active` the button translates down `2px` and the bottom edge shrinks to `2px` — a satisfying physical press. Implemented as a `ChunkyButton` wrapper over shadcn `Button`.
  ```
  rest:    translateY(0)   border-bottom: 4px (#F2603A)
  active:  translateY(2px) border-bottom: 2px
  ```

## 5. Component inventory

**shadcn/ui base used:** Button, Card, Dialog, Sheet, Input, Label, Form, Select, Switch, Tabs, Badge, Avatar, Skeleton, Sonner (toast), Separator, ScrollArea, AlertDialog, Tooltip, Progress, **InputOTP** (for the PIN).

**Custom composed components** (live in `apps/web/src/components`, styling/tokens shared so there's **one** source per pattern — DRY):

| Component | Purpose |
|---|---|
| `ChunkyButton` | 3D press button (variants: primary/secondary/ghost) |
| `PlaceholderImage` | **The** reusable grey labeled image box (§9). Every image renders through this. |
| `BookCard` | Cover (`PlaceholderImage`) + title + `AccessBadge` + price/lock |
| `AccessBadge` | Shows FREE / OWNED / SUBSCRIPTION / LOCKED (icon + label + color) |
| `Mascot` | Renders cat placeholder + optional speech bubble; pose prop |
| `EmptyState` | `Mascot` + message + optional CTA |
| `RewardOverlay` | Confetti + celebrating mascot (book finished / unlocked) |
| `ParentGate` | PIN entry (InputOTP) + mascot "Ask a grown-up" |
| `PinSetup` | First-time 4-digit PIN creation |
| `ModeBadge` / `ModeSwitcher` | Indicates & switches Kid ↔ Parent |
| `CategoryChip` | Colored category pill (uses accent pops) |
| `BookReader` | Wraps `react-pageflip`; swipe + paper-flip |
| `PriceTag`, `SubscribeCard`, `PurchaseSheet` | Monetization UI |

## 6. Motion language (framer-motion)

### General rules
Snappy and bouncy for parent/admin surfaces; **deliberately restrained** for kid mode. Respect `prefers-reduced-motion` at all times.

- **Buttons:** tactile press (translate + scale 0.98) on all surfaces — satisfying for kids, confirms the tap was registered.
- **Route transitions:** gentle slide + fade (200ms parent/admin, **400ms kid mode** — toddlers need extra processing time between state changes).
- **Lists/grids:** staggered fade-up on mount (40ms stagger parent; **80ms stagger kid mode**, slower = calmer).
- **Reward:** `canvas-confetti` burst + Oyen celebrate pose on finishing/unlocking a book. **Plays once, then stops.** No loop — variable-reward loops are the mechanic behind slot machines and are deliberately avoided.
- **Locked tap:** single gentle shake + Oyen "ask a grown-up" nudge — communicates meaning without alarm.

### Toddler motion rules (non-negotiable in kid mode)
These rules exist because of documented pediatric sensory development research, not aesthetic preference:

- **🚫 No looping/idle animations during or before reading.** The reading view is a calm zone — no Oyen bobbing, no floating particles, nothing moving in the background. This mirrors the "still frame" principle in toddler media (Bluey, Peppa Pig, Dora the Explorer deliberately hold frames and pause — the stillness is intentional, not cheap production).
- **🚫 Max 2 animated elements simultaneously** on screen in kid mode. More than 2 competing animations fragment a toddler's attention and can cause frustration.
- **🚫 No auto-advance, no auto-play** in the reader. Every page turn is user-initiated. Toddlers need to feel in control of pacing.
- **🚫 Pinch-to-zoom disabled in reader.** Toddlers accidentally pinch-to-zoom, causing disorientation ("why is everything giant?"). Set `touch-action: pan-y` on the reader container and `user-scalable=no` in the viewport meta.
- **✅ User-initiated only:** all motion in kid mode should be a response to a deliberate action.
- **✅ Finite rewards:** Oyen's celebration is a moment, not a loop. Animations that reward completion communicate meaning; animations that loop indefinitely are noise.

## 7. The cat mascot

A single, original brand character — a friendly **reading companion**, not a navigational cast. Warm, curious, gentle, encouraging.

- **Visual direction:** flat vector, rounded bold shapes, orange/cream **tabby** (ties to warm palette), big friendly eyes, often holding/near a book; optional small scarf for personality. Limited palette = brand colors.
- **Where it appears:** login welcome, onboarding, empty library, loading, reward/celebration, locked content ("Ask a grown-up"), 404, generic error, the PIN gate.
- **Poses needed (drives the registry):** waving, reading, sleeping (bedtime), celebrating, peeking/curious, holding a lock.
- **Name: Oyen** (locked) — the Indonesian-beloved name for an orange tabby; warm, memorable, on-brand. The full visual character sheet (fur, proportions, signature teal scarf, pose set) lives in `illustration-style.yaml` and is the source of truth for every mascot image.

## 8. Surface-specific design

### Kid mode (default, brightest)
Big book covers in a 2–3 col grid, large icon bottom-nav, minimal words, mascot present. **No prices or buy buttons** — locked books show a lock + "Ask a grown-up" that triggers the PIN gate. Tap targets ≥ 56px.

### Parent mode (behind PIN)
Same warmth, more density: prices, manage subscription, purchase history, library, account. Persistent subtle `ModeBadge: Parent`. Checkout and entering parent mode both require the PIN.

### Admin (separate `ADMIN` account)
Most utilitarian but still on-brand: data table of books, create/edit forms (Form + Input + Select for categories, status, price), a content wizard for book image + page text, and soft-delete (archive) with confirm `AlertDialog`. Draft/Published/Archived states clearly tagged. The content wizard should show a direct cover preview, page number controls, one focused text area, and Prev/Next actions that save progress.

### PIN parent-gate (design)
Full-screen friendly overlay: mascot (holding a lock) + "Ask a grown-up 🐾", `InputOTP` 4 digits, big number pad feel. Wrong PIN → gentle shake + mascot reaction, no scary red. First run → `PinSetup` to choose a 4-digit PIN.
> **Demo:** PIN is client-side only. **Real:** server-stored hashed PIN + biometric fallback (per BASELINE §6).

## 9. Placeholder image convention (DEMO)

No real art ships. Every image is the **`PlaceholderImage`** component: a rounded grey box, on-theme, with centered label text.

```tsx
<PlaceholderImage slot="mascot.empty-library" label="maskot kucing - empty library" ratio="1/1" />
```
- Visual: `--muted` (#F3E9D8) fill, dashed `--line` border, centered `--ink-soft` label in Nunito, optional tiny "image" glyph.
- The `label` shown = the registry's **On-screen label**.
- `ratio` controls the box aspect. This single component guarantees consistency + DRY.

## 10. Image Registry

The spec for generating real images later. Use the **style preamble** on every prompt for consistency.

> **Machine-readable source:** the authoritative, AI-consumable version of this registry — global style baseline, the full **Oyen character sheet**, per-asset rules, a prompt template, every asset, and all 8×6 reader-page subjects — lives in **`illustration-style.yaml`**. The tables below are the human-readable reference; the YAML is what the image-gen AI consumes.

### Style preamble (prefix to every generation prompt)
> *"Flat vector children's-book illustration, rounded bold shapes, thick soft forms, warm cream (#FBF3E7) background, gentle soft shadows, friendly and cozy mood, bright playful palette (coral #FF7B54, sunny yellow #FFC93C, teal #2EC4B6, blue #4CB9E7), warm espresso linework, no text in image, high quality, centered composition."*

### A. Mascot (the cat)
| Slot ID | Where used | On-screen label | Ratio | Generation prompt (append to preamble) |
|---|---|---|---|---|
| `mascot.login-welcome` | Login screen | `maskot kucing - login welcome` | 1/1 | orange-cream tabby cat waving happily, holding a small book |
| `mascot.onboarding` | Onboarding | `maskot kucing - onboarding #1` | 4/3 | tabby cat sitting on a stack of colorful books, inviting gesture |
| `mascot.empty-library` | Empty library | `maskot kucing - empty library` | 1/1 | tabby cat looking curiously at an empty bookshelf, hopeful |
| `mascot.loading` | Loading states | `maskot kucing - loading` | 1/1 | tabby cat reading a book, cozy, mid-page |
| `mascot.reward` | Book finished / unlocked | `maskot kucing - reward celebrate` | 1/1 | tabby cat cheering with paws up, confetti, joyful |
| `mascot.locked` | Locked content / "Ask a grown-up" | `maskot kucing - ask a grown-up` | 1/1 | tabby cat gently holding a golden padlock, friendly not sad |
| `mascot.404` | Not-found page | `maskot kucing - page not found` | 4/3 | tabby cat looking under a book with a question mark, puzzled but cute |
| `mascot.error` | Generic error | `maskot kucing - error` | 4/3 | tabby cat with a tangled ball of yarn, "oops" expression |
| `mascot.bedtime` | Bedtime category / night | `maskot kucing - sleepy` | 1/1 | tabby cat yawning in pajamas under a crescent moon |

### B. Brand & hero
| Slot ID | Where used | On-screen label | Ratio | Prompt |
|---|---|---|---|---|
| `logo.app` | App header / login | `logo - app wordmark` | auto | rounded playful wordmark lockup with a small cat-and-book icon |
| `hero.home` | Kid home banner | `ilustrasi - home hero` | 16/9 | cozy reading nook with floating books, warm light, tabby cat |
| `hero.subscribe` | Subscription upsell | `ilustrasi - subscribe hero` | 16/9 | open treasure chest overflowing with colorful storybooks |

### C. Categories (use accent-pop color per tile)
| Slot ID | Where used | On-screen label | Ratio | Prompt |
|---|---|---|---|---|
| `category.bedtime` | Category tile | `ilustrasi - category bedtime` | 1/1 | crescent moon, stars, cozy blanket and pillow (teal-leaning) |
| `category.adventure` | Category tile | `ilustrasi - category adventure` | 1/1 | paper boat, compass, little map (blue-leaning) |
| `category.learning` | Category tile | `ilustrasi - category learning` | 1/1 | alphabet blocks and numbers, pencil (purple-leaning) |
| `category.animals` | Category tile | `ilustrasi - category animals` | 1/1 | friendly jungle animals cluster (green-leaning) |

### D. Book covers (8 seed books)
Ratio for all covers: **3/4**. Append to preamble: *"book cover composition, title area left blank (no text)."*

| Slot ID | Book (category · tier) | On-screen label | Prompt |
|---|---|---|---|
| `book.cover.goodnight-star` | Goodnight Little Star · Bedtime · **free** | `cover - Goodnight Little Star` | sleepy star with a nightcap in a dark-teal sky |
| `book.cover.brave-boat` | The Brave Little Boat · Adventure · paid | `cover - The Brave Little Boat` | cheerful red paper boat on gentle blue waves |
| `book.cover.counting-oyen` | Counting with Oyen · Learning · **free** | `cover - Counting with Oyen` | Oyen surrounded by big friendly numbers 1–5 |
| `book.cover.jungle-friends` | Jungle Friends · Animals · paid | `cover - Jungle Friends` | smiling lion, parrot and monkey peeking through leaves |
| `book.cover.lost-balloon` | The Lost Balloon · Adventure · paid | `cover - The Lost Balloon` | a single coral balloon drifting over rooftops |
| `book.cover.abc-garden` | ABC Garden · Learning · paid | `cover - ABC Garden` | letters growing as flowers in a sunny garden |
| `book.cover.sleepy-moon-bear` | Sleepy Moon Bear · Bedtime · paid · **archived** | `cover - Sleepy Moon Bear` | round bear napping on a crescent moon |
| `book.cover.ocean-splash` | Ocean Splash · Animals · paid | `cover - Ocean Splash` | happy whale and fish splashing, teal water |

### E. Reader pages (pattern + worked example)
Each book has **6 placeholder pages**. Pattern label: `page - <Book> #<n>`, ratio matches reader (`3/4` single, spread = two `3/4`). Prompt pattern: *"storybook interior spread, single focal scene, lots of negative space, no text."*

Worked example — **Goodnight Little Star** (`book.page.goodnight-star.{1..6}`):
| Slot ID | On-screen label | Prompt |
|---|---|---|
| `…goodnight-star.1` | `page - Goodnight Little Star #1` | a little star waking up in the evening sky |
| `…goodnight-star.2` | `page - Goodnight Little Star #2` | the star saying goodnight to the moon |
| `…goodnight-star.3` | `page - Goodnight Little Star #3` | the star floating past sleepy clouds |
| `…goodnight-star.4` | `page - Goodnight Little Star #4` | the star tucking small stars into bed |
| `…goodnight-star.5` | `page - Goodnight Little Star #5` | the star yawning, sky deepening to indigo |
| `…goodnight-star.6` | `page - Goodnight Little Star #6` | the star asleep, "the end" scene, calm night |

> The remaining 7 books follow the same 6-page pattern; their prompts get generated in the separate AI session using each cover's theme. The build only needs the labeled placeholders, keyed by these slot IDs.

### F. Profile avatars (login profile picker)
| Slot ID | Where used | On-screen label | Ratio | Prompt |
|---|---|---|---|---|
| `avatar.parent` | Login profile chip | `avatar - parent` | 1/1 | simple round friendly adult avatar, warm tones |
| `avatar.kid` | Login profile chip | `avatar - kid` | 1/1 | simple round friendly child avatar, warm tones |
| `avatar.admin` | Login profile chip | `avatar - admin` | 1/1 | simple round avatar with a small gear, warm tones |

---

## Resolved
- **Mascot name:** Oyen (locked). Book #3 = "Counting with Oyen".
- **8 seed book titles:** confirmed (used by PRODUCT.md seed + TECH.md seed script).
- **Image generation:** fully specified in `illustration-style.yaml` for the separate AI session.
