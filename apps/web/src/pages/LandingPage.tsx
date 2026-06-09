import { Link, useNavigate } from 'react-router-dom';
import { Baby, BarChart3, BookOpen, Clock3, LockKeyhole, ShieldCheck, Volume2 } from 'lucide-react';
import { ChunkyButton } from '@/components/ChunkyButton';

const features = [
  {
    title: 'Kid mode',
    copy: 'A joyful catalog with big covers, gentle locks, and zero checkout UI — by design, not by permission.',
    icon: Baby,
    chipBg: 'bg-[var(--accent-blue)]/15',
    chipColor: 'text-[var(--accent-blue)]',
    bar: '#4CB9E7',
  },
  {
    title: 'Parent control',
    copy: 'PIN-gated access for subscriptions, buy-to-keep purchases, child progress, and screen-time limits.',
    icon: LockKeyhole,
    chipBg: 'bg-[var(--primary)]/12',
    chipColor: 'text-[var(--primary)]',
    bar: '#FF7B54',
  },
  {
    title: 'Read aloud',
    copy: 'The app voices every page. Narration text is authored by admin — one source of truth, no drift.',
    icon: Volume2,
    chipBg: 'bg-[var(--accent-teal)]/15',
    chipColor: 'text-[var(--accent-teal)]',
    bar: '#2EC4B6',
  },
];

const trustItems = [
  { label: 'No buy buttons in kid mode — ever', icon: ShieldCheck, color: 'text-[var(--accent-teal)]' },
  { label: 'Gentle screen-time wind-down with Oyen', icon: Clock3, color: 'text-[var(--secondary)]' },
  { label: 'Favorite-book insights surfaced for parents', icon: BarChart3, color: 'text-[#A78BFA]' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--ink)]">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">

        {/* Decorative blobs — pure ambience */}
        <div aria-hidden className="pointer-events-none select-none">
          <div className="absolute -right-52 -top-52 h-[640px] w-[640px] rounded-full bg-[var(--secondary)]/20" />
          <div className="absolute -left-36 bottom-0 h-80 w-80 rounded-full bg-[var(--accent-teal)]/10" />
          <div className="absolute right-[32%] top-10 h-5 w-5 rounded-full bg-[var(--primary)]/22" />
          <div className="absolute right-[22%] top-36 h-3 w-3 rounded-full bg-[#A78BFA]/30" />
          <div className="absolute left-[44%] bottom-20 h-4 w-4 rounded-full bg-[var(--secondary)]/45" />
        </div>

        <div className="relative mx-auto flex min-h-[92svh] w-full max-w-6xl flex-col px-5 md:px-8 lg:px-10">

          {/* Nav */}
          <header className="flex items-center justify-between gap-4 py-5">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo2.png"
                alt="Storybook logo"
                className="h-12 w-12 rounded-2xl object-cover shadow-[0_8px_18px_rgba(58,46,40,0.18)]"
              />
              <span className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-none">
                Storybook
              </span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="hidden rounded-2xl px-4 py-3 text-sm font-extrabold text-[var(--ink-soft)] transition hover:bg-[var(--card)] sm:inline-flex"
              >
                Sign in
              </Link>
              <ChunkyButton size="sm" onClick={() => navigate('/auth/login')}>
                Start demo
              </ChunkyButton>
            </nav>
          </header>

          {/* Hero body */}
          <div className="flex flex-1 items-center py-8">
            <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-8">

              {/* ── Left: copy ──────────────────── */}
              <div>
                {/* Pill */}
                {/* <div className="inline-flex items-center gap-2 rounded-full bg-[var(--card)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--ink-soft)] shadow-sm ring-1 ring-[var(--line)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  Kid safe · Parent first · Admin ready
                </div> */}

                <h1 className="mt-6 font-[family-name:var(--font-display)] text-6xl font-semibold leading-[0.92] sm:text-7xl lg:text-8xl">
                  Stories for<br />
                  <span className="text-[var(--primary)]">little</span> readers.
                </h1>

                <p className="mt-5 max-w-lg text-lg font-semibold leading-8 text-[var(--ink-soft)] sm:text-xl sm:leading-9">
                  A paid digital library where children roam freely — and parents stay in control.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <ChunkyButton size="lg" onClick={() => navigate('/auth/login')}>
                    <BookOpen className="h-5 w-5" />
                    Start demo
                  </ChunkyButton>
                  <ChunkyButton variant="ghost" size="lg" onClick={() => navigate('/auth/login')}>
                    Try demo profiles
                  </ChunkyButton>
                </div>

              </div>

              {/* ── Right: visual ───────────────── */}
              <div className="relative hidden h-[520px] select-none lg:block" aria-hidden>

                {/* Warm gold glow disc */}
                <div className="absolute left-1/2 top-4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[var(--secondary)]/24" />

                {/* Accent dots */}
                <div className="absolute right-10 top-8 h-8 w-8 rounded-full bg-[var(--primary)]/16" />
                <div className="absolute left-6 top-28 h-14 w-14 rounded-full bg-[var(--accent-teal)]/13" />
                <div className="absolute right-20 bottom-36 h-5 w-5 rounded-full bg-[#A78BFA]/22" />

                {/* Oyen hero illustration */}
                <img
                  src="/illustration/15.png"
                  alt="Oyen — Storybook's reading cat mascot"
                  className="absolute inset-x-0 top-0 mx-auto h-[430px] w-auto object-contain drop-shadow-lg"
                  draggable={false}
                />

                {/* Book covers fanned at the bottom */}
                <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 items-end">
                  <img
                    src="/illustration/books/goodnight_little_star_cover.png"
                    alt=""
                    className="h-[6.5rem] w-auto origin-bottom -rotate-[13deg] rounded-xl shadow-xl"
                    draggable={false}
                  />
                  <img
                    src="/illustration/books/oyen_counting_cover.png"
                    alt=""
                    className="relative z-10 -mx-2 h-[7.5rem] w-auto origin-bottom -rotate-[1deg] rounded-xl shadow-2xl"
                    draggable={false}
                  />
                  <img
                    src="/illustration/books/jungle_adventure_cover.png"
                    alt=""
                    className="h-[6.5rem] w-auto origin-bottom rotate-[11deg] rounded-xl shadow-xl"
                    draggable={false}
                  />
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="px-5 py-16 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">

          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--primary)]">
              What's inside
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--ink)] sm:text-5xl">
              Built for the reader.{' '}
              <span className="text-[var(--ink-soft)]">Controlled by the parent.</span>
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map(f => (
              <article
                key={f.title}
                className="relative overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_14px_34px_rgba(58,46,40,0.07)] transition-shadow hover:shadow-[0_22px_44px_rgba(58,46,40,0.11)]"
              >
                {/* Top accent bar */}
                <div
                  className="absolute left-0 right-0 top-0 h-[3px] rounded-t-[1.35rem]"
                  style={{ backgroundColor: f.bar }}
                />
                <div className={`mt-1 grid h-12 w-12 place-items-center rounded-2xl ${f.chipBg}`}>
                  <f.icon className={`h-6 w-6 ${f.chipColor}`} strokeWidth={2.4} />
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm font-bold leading-6 text-[var(--ink-soft)]">{f.copy}</p>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ── PRODUCT BET ──────────────────────────────────── */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.8rem] bg-[#2EC4B6]">
          <div className="grid items-end gap-8 p-8 md:grid-cols-[1.3fr_0.7fr] md:p-10 lg:p-14">

            {/* Text side */}
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/60">
                The product bet
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Delight for the child.<br />
                <span className="text-[var(--secondary)]">Trust</span> for the parent.
              </h2>
              <div className="mt-8 space-y-3">
                {trustItems.map(item => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl bg-black/10 px-4 py-3.5"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-white" strokeWidth={2.4} />
                    <span className="font-[family-name:var(--font-body)] text-sm font-bold text-white">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <ChunkyButton onClick={() => navigate('/auth/login')}>
                  <BookOpen className="h-5 w-5" />
                  Explore the demo
                </ChunkyButton>
              </div>
            </div>

            {/* Treasure Oyen — rounded frame to handle non-transparent bg */}
            <div className="flex justify-center pb-2 md:justify-end">
              <div className="overflow-hidden rounded-[1.4rem] shadow-[0_20px_48px_rgba(0,0,0,0.2)] ring-4 ring-white/30">
                <img
                  src="/illustration/treasure.png"
                  alt="Oyen celebrating"
                  className="w-48 object-contain md:w-60"
                  draggable={false}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
