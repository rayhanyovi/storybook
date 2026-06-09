import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, Crown, CreditCard, Lock } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { AccessBadge } from '@/components/AccessBadge';
import { AppHeader } from '@/components/AppHeader';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Mascot } from '@/components/Mascot';
import { ParentGate } from '@/components/ParentGate';
import { Skeleton } from '@/components/ui/skeleton';
import { useBook } from '@/hooks/useBooks';
import { useMode } from '@/providers/ModeProvider';

function priceLabel(cents: number) {
  return `Rp ${cents.toLocaleString('id-ID')}`;
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isKid } = useMode();
  const { data: book, isLoading } = useBook(id!);
  const [showGate, setShowGate] = useState(false);

  const returnTo = `/book/${id}`;

  function goPurchase() {
    navigate(`/checkout?type=purchase&bookId=${id}&returnTo=${encodeURIComponent(returnTo)}`);
  }

  function goSubscribe() {
    navigate(`/checkout?type=subscription&returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-4">
      <Skeleton className="h-11 w-28 rounded-2xl" />
      <div className="mx-auto mt-8 grid max-w-5xl gap-8 md:grid-cols-[0.8fr_1fr]">
        <Skeleton className="aspect-[3/4] rounded-[1.5rem]" />
        <div className="grid content-start gap-4">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (!book) return (
    <div className="grid min-h-screen place-items-center bg-[var(--background)] p-6 text-center">
      <div className="flex flex-col items-center gap-5">
        <Mascot pose="404" size="lg" speech="Book not found" />
        <ChunkyButton variant="ghost" onClick={() => navigate('/')}>
          <ChevronLeft className="h-4 w-4" />
          Back home
        </ChunkyButton>
      </div>
    </div>
  );

  const canRead = book.access.canAccess;
  const canBuyToKeep = !isKid && book.priceCents > 0 && book.access.reason === 'SUBSCRIPTION';
  const shouldShowParentPurchase = !isKid && !canRead && book.priceCents > 0;
  const isInProgress = book.currentPage > 1 && book.currentPage < book.pageCount;
  const isCompleted = book.currentPage >= book.pageCount && book.readCount > 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-12">
      <AppHeader showBack />

      <main className="mx-auto grid max-w-6xl gap-7 px-4 pt-6 md:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1fr)] md:px-7">
        <section className="relative">
          <div className="sticky top-24">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] shadow-[0_18px_48px_rgba(58,46,40,0.14)]">
              <PlaceholderImage
                slot={book.coverSlot ?? `book.cover.${book.slug}`}
                label={`cover - ${book.title}`}
                ratio="4/3"
                className="rounded-none border-0"
              />
              <div className="absolute left-4 top-4">
                <AccessBadge reason={book.access.reason} />
              </div>
              {!canRead && (
                <div className="absolute inset-0 grid place-items-center bg-[var(--ink)]/20">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--card)]/95 shadow-xl">
                    <Lock className="h-7 w-7 text-[var(--ink-soft)]" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)] md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[var(--ink)]">
                  {book.title}
                </h1>
                <p className="mt-2 text-sm font-bold text-[var(--ink-soft)]">by {book.author}</p>
              </div>
              {!isKid && book.priceCents > 0 && (
                <span className="rounded-2xl bg-[var(--secondary)] px-4 py-3 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">
                  {priceLabel(book.priceCents)}
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {book.categories.map(category => (
                <span
                  key={category.id}
                  className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink-soft)]"
                >
                  {category.name}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink-soft)]">
                <CalendarDays className="h-3.5 w-3.5" />
                Ages {book.ageMin}-{book.ageMax}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink-soft)]">
                <BookOpen className="h-3.5 w-3.5" />
                {book.pageCount} pages
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink-soft)]">
                <BarChart3 className="h-3.5 w-3.5" />
                {book.readCount} reads
              </span>
              {(isInProgress || isCompleted) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--secondary)]/30 px-3 py-1.5 text-xs font-extrabold text-[var(--ink)]">
                  <BookOpen className="h-3.5 w-3.5" />
                  {isCompleted ? 'Completed' : `Continue from page ${book.currentPage}`}
                </span>
              )}
            </div>

            <p className="mt-5 text-base font-semibold leading-relaxed text-[var(--ink-soft)]">
              {book.description || 'A short, calm story designed for a complete child-sized reading session.'}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)] md:p-7">
            {canRead ? (
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--color-success)]/15 text-[var(--color-success)]">
                    <CheckCircle2 className="h-6 w-6" strokeWidth={2.4} />
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                      {book.access.reason === 'OWNED' ? 'You own this book' : book.access.reason === 'SUBSCRIPTION' ? 'Included with subscription' : 'Ready to read'}
                    </h2>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-[var(--ink-soft)]">
                      {book.access.reason === 'OWNED'
                        ? 'Ownership is permanent, even if subscription access changes later.'
                        : 'The reader is unlocked now. Page turns stay user-controlled and calm.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <ChunkyButton size="lg" onClick={() => navigate(`/read/${book.id}`)}>
                    <BookOpen className="h-5 w-5" />
                    {isInProgress ? `Continue page ${book.currentPage}` : isCompleted ? 'Read again' : 'Read now'}
                  </ChunkyButton>
                  {canBuyToKeep && (
                    <ChunkyButton variant="secondary" size="lg" onClick={goPurchase}>
                      <CreditCard className="h-5 w-5" />
                      Buy to keep · {priceLabel(book.priceCents)}
                    </ChunkyButton>
                  )}
                </div>
              </div>
            ) : isKid ? (
              <div className="grid gap-5 text-center">
                <Mascot pose="locked" size="md" speech="Ask a grown-up" />
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">This story needs a grown-up</h2>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--ink-soft)]">
                    Kid mode does not show checkout. A parent can unlock it after the PIN.
                  </p>
                </div>
                <ChunkyButton size="lg" variant="secondary" className="w-full" onClick={() => setShowGate(true)}>
                  <Lock className="h-5 w-5" />
                  Ask a grown-up
                </ChunkyButton>
              </div>
            ) : shouldShowParentPurchase ? (
              <div className="grid gap-5">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Unlock options</h2>
                  <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">
                    Buy this book to keep it forever, or subscribe to open the whole catalog.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--background)] p-4">
                    <CreditCard className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
                    <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">{priceLabel(book.priceCents)}</p>
                    <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">Own this book forever</p>
                    <ChunkyButton variant="secondary" size="lg" className="mt-4 w-full" onClick={goPurchase}>
                      <CreditCard className="h-5 w-5" />
                      Buy this book
                    </ChunkyButton>
                  </div>

                  <div className="flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--background)] p-4">
                    <Crown className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
                    <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">Rp 49.000</p>
                    <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">30 days, all books</p>
                    <ChunkyButton size="lg" className="mt-4 w-full" onClick={goSubscribe}>
                      <Crown className="h-5 w-5" />
                      Subscribe
                    </ChunkyButton>
                  </div>
                </div>
              </div>
            ) : (
              <ChunkyButton size="lg" className="w-full" onClick={() => navigate('/parent')}>
                Open parent mode
              </ChunkyButton>
            )}
          </div>
        </section>
      </main>

      {showGate && (
        <ParentGate
          onSuccess={() => setShowGate(false)}
          onCancel={() => setShowGate(false)}
        />
      )}
    </div>
  );
}
