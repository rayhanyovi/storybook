import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronLeft, Crown, CreditCard, LibraryBig, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Mascot } from '@/components/Mascot';
import { Skeleton } from '@/components/ui/skeleton';
import { useLibrary } from '@/hooks/useBooks';
import { useMode } from '@/providers/ModeProvider';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ParentPage() {
  const navigate = useNavigate();
  const { setMode } = useMode();
  const { data: library, isLoading } = useLibrary();

  function exitParent() {
    setMode('kid');
    navigate('/');
  }

  function handleSubscribe() {
    navigate(`/checkout?type=subscription&returnTo=${encodeURIComponent('/parent')}`);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <header className="border-b border-[var(--line)] bg-[var(--card)] px-4 py-4 md:px-7">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <ChunkyButton variant="ghost" size="sm" onClick={exitParent}>
            <ChevronLeft className="h-4 w-4" />
            Kid mode
          </ChunkyButton>
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-none text-[var(--ink)]">Parent mode</h1>
            <p className="mt-1 hidden text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)] sm:block">PIN protected account surface</p>
          </div>
          <span className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white">Parent</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 md:px-7">
        <section className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
          <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_18px_42px_rgba(58,46,40,0.1)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                  Access control
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[var(--ink)]">
                  Unlock stories without exposing checkout to kids.
                </h2>
                <p className="mt-4 text-base font-semibold leading-relaxed text-[var(--ink-soft)]">
                  Subscription opens the live catalog while active. One-time purchases stay owned permanently, even if subscription access changes later.
                </p>
              </div>
              <PlaceholderImage slot="hero.subscribe" label="ilustrasi - subscribe hero" ratio="16/9" className="w-full max-w-sm rounded-[1.35rem]" />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_18px_42px_rgba(58,46,40,0.1)] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Monthly plan</p>
                <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">Rp 49.000 · 30 days</p>
              </div>
              {isLoading ? <Skeleton className="h-8 w-24 rounded-full" /> : library?.hasActiveSub ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success)] px-3 py-1.5 text-xs font-extrabold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink-soft)]">
                  <XCircle className="h-3.5 w-3.5" />
                  Inactive
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--background)] p-4">
                <Crown className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
                <div>
                  <p className="font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">All published books</p>
                  <p className="text-sm font-bold text-[var(--ink-soft)]">Includes new catalog additions while active.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--background)] p-4">
                <CreditCard className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
                <div>
                  <p className="font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">Buy-to-keep still available</p>
                  <p className="text-sm font-bold text-[var(--ink-soft)]">Purchased books remain readable after churn.</p>
                </div>
              </div>
            </div>

            {library?.subscription && (
              <p className="mt-5 rounded-2xl bg-[var(--muted)] px-4 py-3 text-sm font-bold text-[var(--ink-soft)]">
                Current access ends {formatDate(library.subscription.expiresAt)}.
              </p>
            )}

            <ChunkyButton size="lg" className="mt-5 w-full" onClick={handleSubscribe}>
              {library?.hasActiveSub ? <RefreshCw className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
              {library?.hasActiveSub ? 'Renew subscription' : 'Subscribe now'}
            </ChunkyButton>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Account snapshot</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Owned', value: library?.owned.length ?? 0, icon: BookOpen },
                { label: 'Subscription', value: library?.hasActiveSub ? 'On' : 'Off', icon: Crown }
              ].map(item => (
                <div key={item.label} className="rounded-2xl bg-[var(--background)] p-4">
                  <item.icon className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
                  <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">{item.value}</p>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">{item.label}</p>
                </div>
              ))}
            </div>
            <ChunkyButton variant="secondary" className="mt-4 w-full" onClick={() => navigate('/')}>
              <LibraryBig className="h-5 w-5" />
              Browse catalog
            </ChunkyButton>
          </div>

          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Owned books</h2>
                <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">Permanent purchases, including archived books.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-[1.25rem]" />)}
              </div>
            ) : library?.owned.length === 0 ? (
              <div className="grid place-items-center py-12 text-center">
                <Mascot pose="reading" size="md" speech="No owned books yet" />
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {library?.owned.map(book => (
                  <button
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--background)] text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(58,46,40,0.1)]"
                  >
                    <PlaceholderImage slot={book.coverSlot ?? `book.cover.${book.slug}`} label={`cover - ${book.title}`} ratio="3/4" className="rounded-none border-0" />
                    <div className="p-3">
                      <p className="line-clamp-2 font-[family-name:var(--font-display)] font-semibold leading-tight text-[var(--ink)]">{book.title}</p>
                      <p className="mt-1 text-xs font-bold text-[var(--ink-soft)]">{book.status === 'ARCHIVED' ? 'Archived, still owned' : 'Owned forever'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
