import { Link, useNavigate } from 'react-router-dom';
import { Baby, BarChart3, BookOpen, Clock3, LockKeyhole, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { ChunkyButton } from '@/components/ChunkyButton';
import { PlaceholderImage } from '@/components/PlaceholderImage';

const features = [
  {
    title: 'Kid mode',
    copy: 'A bright reading surface with big covers, gentle locks, and no checkout UI.',
    icon: Baby,
    tone: 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
  },
  {
    title: 'Parent control',
    copy: 'PIN-protected access for subscription, buy-to-keep, progress, and screen-time.',
    icon: LockKeyhole,
    tone: 'bg-[var(--secondary)]/25 text-[var(--ink)]'
  },
  {
    title: 'Read aloud',
    copy: 'The app speaks the exact page text admins write for each story.',
    icon: Volume2,
    tone: 'bg-[var(--accent-teal)]/15 text-[var(--accent-teal)]'
  }
];

const trustItems = [
  { label: 'No buy buttons in kid mode', icon: ShieldCheck },
  { label: 'Screen-time wind-down', icon: Clock3 },
  { label: 'Favorite book insights', icon: BarChart3 }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <section className="relative flex min-h-[86svh] overflow-hidden">
        <img
          src="/illustration/books/goodnight_little_star_cover.png"
          alt="Goodnight Little Star storybook cover"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--background)]/78" />
        <div className="absolute inset-0 bg-[var(--card)]/28" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-5 py-5 md:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo2.png" alt="Storybook logo" className="h-12 w-12 rounded-2xl object-cover shadow-[0_8px_18px_rgba(58,46,40,0.18)]" />
              <span className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-none">Storybook</span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link to="/auth/login" className="hidden rounded-2xl px-4 py-3 text-sm font-extrabold text-[var(--ink-soft)] transition hover:bg-[var(--card)] sm:inline-flex">
                Sign in
              </Link>
              <ChunkyButton size="sm" onClick={() => navigate('/auth/register')}>
                Start demo
              </ChunkyButton>
            </nav>
          </header>

          <div className="flex flex-1 items-center py-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--card)]/92 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)] shadow-[0_10px_28px_rgba(58,46,40,0.1)]">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                Kid safe · Parent first · Admin ready
              </div>
              <h1 className="mt-6 font-[family-name:var(--font-display)] text-6xl font-semibold leading-[0.95] text-[var(--ink)] sm:text-7xl lg:text-8xl">
                Storybook
              </h1>
              <p className="mt-5 max-w-2xl text-xl font-bold leading-8 text-[var(--ink)] sm:text-2xl sm:leading-9">
                A paid digital library where children can roam freely and parents stay in control.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ChunkyButton size="lg" onClick={() => navigate('/auth/register')}>
                  <BookOpen className="h-5 w-5" />
                  Create account
                </ChunkyButton>
                <ChunkyButton variant="ghost" size="lg" onClick={() => navigate('/auth/login')}>
                  Try demo profiles
                </ChunkyButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {features.map(feature => (
            <article key={feature.title} className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${feature.tone}`}>
                <feature.icon className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">{feature.title}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[var(--ink-soft)]">{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-14 md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)] md:grid-cols-[0.9fr_1.1fr] md:p-7">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--primary)]">The product bet</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[var(--ink)]">
              Delight for the child. Trust for the parent.
            </h2>
            <div className="mt-6 grid gap-3">
              {trustItems.map(item => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[var(--muted)] px-4 py-3">
                  <item.icon className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
                  <span className="font-[family-name:var(--font-body)] text-sm font-extrabold text-[var(--ink)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PlaceholderImage slot="book.cover.oyen-cleans-up" label="cover - Oyen Cleans Up" ratio="4/3" className="rounded-[1.25rem]" />
            <PlaceholderImage slot="book.cover.counting-oyen" label="cover - Counting with Oyen" ratio="4/3" className="rounded-[1.25rem] sm:mt-10" />
          </div>
        </div>
      </section>
    </main>
  );
}
