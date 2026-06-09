import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, Clock3, ListChecks, Trophy } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Mascot } from '@/components/Mascot';
import { Skeleton } from '@/components/ui/skeleton';
import { useLibrary } from '@/hooks/useBooks';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChildProgressPage() {
  const navigate = useNavigate();
  const { data: library, isLoading } = useLibrary();
  const readingProgress = library?.readingProgress ?? [];
  const favoriteBooks = library?.favoriteBooks ?? [];
  const inProgress = readingProgress.filter(item => item.currentPage > 1 && item.currentPage < item.book.pageCount);
  const totalFinishedReads = readingProgress.reduce((sum, item) => sum + item.readCount, 0);
  const recentReadingLog = [...readingProgress]
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
    .slice(0, 8);
  const topFavorite = favoriteBooks[0];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <header className="border-b border-[var(--line)] bg-[var(--card)] px-4 py-4 md:px-7">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <ChunkyButton variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ChevronLeft className="h-4 w-4" />
            Back to home
          </ChunkyButton>
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-none text-[var(--ink)]">Child progress</h1>
            <p className="mt-1 hidden text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)] sm:block">Reading stats and logs</p>
          </div>
          <span className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white">Parent</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 md:px-7">
        <section className="grid gap-5 lg:grid-cols-[0.82fr_1fr]">
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Child reading stats</h2>
              <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">A quick view of what has been opened, continued, and finished.</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Books opened', value: readingProgress.length, icon: BookOpen },
                { label: 'In progress', value: inProgress.length, icon: Clock3 },
                { label: 'Finished reads', value: totalFinishedReads, icon: ListChecks },
                { label: 'Top book', value: topFavorite ? `${topFavorite.readCount}x` : '-', icon: Trophy }
              ].map(item => (
                <div key={item.label} className="rounded-2xl bg-[var(--background)] p-4">
                  <item.icon className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
                  <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">{item.value}</p>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">{item.label}</p>
                </div>
              ))}
            </div>

            {topFavorite && (
              <button
                type="button"
                onClick={() => navigate(`/book/${topFavorite.book.id}`)}
                className="mt-4 flex w-full items-center gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--background)] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(58,46,40,0.1)]"
              >
                <PlaceholderImage
                  slot={topFavorite.book.coverSlot ?? `book.cover.${topFavorite.book.slug}`}
                  label={`cover - ${topFavorite.book.title}`}
                  ratio="4/3"
                  className="h-20 w-[6.75rem] shrink-0 rounded-xl"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Most finished</p>
                  <p className="line-clamp-2 font-[family-name:var(--font-display)] font-semibold leading-tight text-[var(--ink)]">{topFavorite.book.title}</p>
                  <p className="mt-1 text-sm font-extrabold text-[var(--primary)]">{topFavorite.readCount} finished reads</p>
                </div>
              </button>
            )}
          </div>

          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Reading log</h2>
              <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">Recent books with last page and completed read count.</p>
            </div>

            {isLoading ? (
              <div className="mt-5 grid gap-3">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-[1.25rem]" />)}
              </div>
            ) : !recentReadingLog.length ? (
              <div className="grid place-items-center py-12 text-center">
                <Mascot pose="reading" size="md" speech="No reading logs yet" />
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {recentReadingLog.map(item => {
                  const finished = item.currentPage >= item.book.pageCount && item.readCount > 0;
                  return (
                    <button
                      key={item.book.id}
                      type="button"
                      onClick={() => navigate(`/book/${item.book.id}`)}
                      className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--background)] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(58,46,40,0.1)]"
                    >
                      <PlaceholderImage
                        slot={item.book.coverSlot ?? `book.cover.${item.book.slug}`}
                        label={`cover - ${item.book.title}`}
                        ratio="4/3"
                        className="h-20 w-[6.75rem] shrink-0 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-[family-name:var(--font-display)] font-semibold leading-tight text-[var(--ink)]">{item.book.title}</p>
                        <p className="mt-1 text-sm font-extrabold text-[var(--primary)]">
                          {finished ? 'Finished' : `Stopped at page ${item.currentPage}`} · {item.readCount} reads
                        </p>
                        <p className="text-xs font-bold text-[var(--ink-soft)]">Last read {formatDate(item.lastReadAt)}</p>
                      </div>
                      <span className="hidden rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink-soft)] sm:inline-flex">
                        {item.currentPage}/{item.book.pageCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Favorite reads</h2>
            <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">Books ranked by completed reading sessions.</p>
          </div>

          {isLoading ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-[1.25rem]" />)}
            </div>
          ) : !favoriteBooks.length ? (
            <div className="grid place-items-center py-10 text-center">
              <Mascot pose="reading" size="md" speech="No reads tracked yet" />
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteBooks.map(item => (
                <button
                  key={item.book.id}
                  onClick={() => navigate(`/book/${item.book.id}`)}
                  className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--background)] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(58,46,40,0.1)]"
                >
                  <PlaceholderImage
                    slot={item.book.coverSlot ?? `book.cover.${item.book.slug}`}
                    label={`cover - ${item.book.title}`}
                    ratio="4/3"
                    className="h-20 w-[6.75rem] shrink-0 rounded-xl"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-[family-name:var(--font-display)] font-semibold leading-tight text-[var(--ink)]">{item.book.title}</p>
                    <p className="mt-1 text-sm font-extrabold text-[var(--primary)]">{item.readCount} reads</p>
                    <p className="text-xs font-bold text-[var(--ink-soft)]">
                      Page {item.currentPage} · Last read {formatDate(item.lastReadAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
