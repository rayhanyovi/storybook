import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Settings, Sparkles } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { AccessBadge } from '@/components/AccessBadge';
import { BookCard } from '@/components/BookCard';
import { ChunkyButton } from '@/components/ChunkyButton';
import { ParentGate } from '@/components/ParentGate';
import { AppHeader } from '@/components/AppHeader';
import { Mascot } from '@/components/Mascot';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooks, useCategories } from '@/hooks/useBooks';
import { useMode } from '@/providers/ModeProvider';
import { useAuth } from '@/providers/AuthProvider';
import type { BookWithAccess } from '@storybook/shared';

const ageFilters = [
  { label: 'All ages', min: 0, max: 12 },
  { label: '2-3', min: 2, max: 3 },
  { label: '3-5', min: 3, max: 5 },
  { label: '6-8', min: 6, max: 8 }
] as const;

function FeaturedBook({
  book,
  total,
  onNext,
  onPrev,
  onRead
}: {
  book: BookWithAccess;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onRead: () => void;
}) {
  return (
    <div className="relative">
      <section className="grid overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] shadow-[0_18px_42px_rgba(58,46,40,0.1)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[3.5rem] flex-col justify-between gap-5 p-5 md:p-6">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                Featured book
              </div>
              <AccessBadge reason={book.access.reason} />
            </div>

            <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[var(--ink)] md:text-4xl">
              {book.title}
            </h2>
            <p className="mt-1.5 text-sm font-extrabold text-[var(--ink-soft)]">by {book.author}</p>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-[var(--ink-soft)] md:text-base">
              {book.description || 'A short illustrated story sized for one calm reading session.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
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
            </div>
          </div>

          <ChunkyButton size="lg" onClick={onRead}>
            <BookOpen className="h-5 w-5" />
            Read Now
          </ChunkyButton>
        </div>

        <div className="relative bg-[var(--muted)]">
          <PlaceholderImage
            slot={book.coverSlot ?? `book.cover.${book.slug}`}
            label={`cover - ${book.title}`}
            // ratio="3/4"
            className="h-full min-h-[1rem] rounded-none border-0"
          />
        
        </div>
      </section>

      <button
        type="button"
        onClick={onPrev}
        disabled={total <= 1}
        className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-[0_10px_24px_rgba(58,46,40,0.16)] transition hover:-translate-x-0.5 hover:bg-[var(--muted)] disabled:opacity-45 md:-left-5"
        aria-label="Previous featured book"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={total <= 1}
        className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-[0_10px_24px_rgba(58,46,40,0.16)] transition hover:translate-x-0.5 hover:bg-[var(--muted)] disabled:opacity-45 md:-right-5"
        aria-label="Next featured book"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function KidHomePage() {
  const navigate = useNavigate();
  const { isKid } = useMode();
  const { user } = useAuth();
  const [showGate, setShowGate] = useState(false);
  const [pendingBookId, setPendingBookId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAge, setSelectedAge] = useState<(typeof ageFilters)[number]>(ageFilters[0]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const { data: booksData, isLoading } = useBooks({ limit: 100 });
  const { data: categories } = useCategories();

  const allBooks = (booksData?.data ?? []).filter(book => user?.role === 'ADMIN' || book.status === 'PUBLISHED');

  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => {
      const categoryMatch = selectedCategory === 'all' || book.categories.some(c => c.slug === selectedCategory);
      const ageMatch = book.ageMin <= selectedAge.max && book.ageMax >= selectedAge.min;
      return categoryMatch && ageMatch;
    });
  }, [allBooks, selectedAge, selectedCategory]);

  const featuredBook = allBooks[featuredIndex];

  useEffect(() => {
    if (featuredIndex >= allBooks.length) setFeaturedIndex(0);
  }, [allBooks.length, featuredIndex]);

  function showNextFeaturedBook() {
    setFeaturedIndex(index => (allBooks.length ? (index + 1) % allBooks.length : 0));
  }

  function showPreviousFeaturedBook() {
    setFeaturedIndex(index => (allBooks.length ? (index - 1 + allBooks.length) % allBooks.length : 0));
  }

  function handleLocked(bookId: string) {
    setPendingBookId(bookId);
    setShowGate(true);
  }

  function handleGateSuccess() {
    setShowGate(false);
    if (pendingBookId) navigate(`/book/${pendingBookId}`);
    setPendingBookId(null);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-10">
      <AppHeader active="discover" />

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-6 md:px-7">
        {isLoading ? (
          <Skeleton className="min-h-[24rem] rounded-[1.75rem]" />
        ) : featuredBook ? (
          <FeaturedBook
            book={featuredBook}
            total={allBooks.length}
            onPrev={showPreviousFeaturedBook}
            onNext={showNextFeaturedBook}
            onRead={() => navigate(`/book/${featuredBook.id}`)}
          />
        ) : (
          <section className="grid min-h-[18rem] place-items-center rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] text-center shadow-[0_18px_42px_rgba(58,46,40,0.1)]">
            <Mascot pose="reading" size="md" speech="No featured book yet" />
          </section>
        )}

        <section className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Browse stories</h2>
              <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">
                Filter by theme and reading age{!isLoading ? ` · ${filteredBooks.length} ${filteredBooks.length === 1 ? 'story' : 'stories'} shown` : ''}.
              </p>
            </div>
            {!isKid && user?.role === 'ADMIN' && (
              <ChunkyButton size="sm" variant="ghost" onClick={() => navigate('/admin')}>
                <Settings className="h-4 w-4" />
                Admin
              </ChunkyButton>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`min-h-[3rem] shrink-0 rounded-2xl border px-4 font-[family-name:var(--font-display)] font-semibold transition ${
                selectedCategory === 'all'
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:bg-[var(--muted)]'
              }`}
            >
              All themes
            </button>
            {categories?.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`min-h-[3rem] shrink-0 rounded-2xl border px-4 font-[family-name:var(--font-display)] font-semibold transition ${
                  selectedCategory === category.slug
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                    : 'border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:bg-[var(--muted)]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ageFilters.map(filter => (
              <button
                key={filter.label}
                onClick={() => setSelectedAge(filter)}
                className={`min-h-[2.75rem] shrink-0 rounded-full border px-4 text-sm font-extrabold transition ${
                  selectedAge.label === filter.label
                    ? 'border-[var(--secondary)] bg-[var(--secondary)] text-[var(--ink)]'
                    : 'border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:bg-[var(--muted)]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-[1.35rem]" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="grid place-items-center rounded-[1.5rem] border border-[var(--line)] bg-[var(--card)] py-14 text-center">
              <Mascot pose="reading" size="md" speech="Try another filter" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              animate="show"
            >
              {filteredBooks.map(book => (
                <motion.div
                  key={book.id}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.22 }}
                >
                  <BookCard book={book} kidMode={isKid} onLocked={() => handleLocked(book.id)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>

      {showGate && (
        <ParentGate
          onSuccess={handleGateSuccess}
          onCancel={() => { setShowGate(false); setPendingBookId(null); }}
        />
      )}
    </div>
  );
}
