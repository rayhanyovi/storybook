import { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { BookCard } from '@/components/BookCard';
import { Mascot } from '@/components/Mascot';
import { ParentGate } from '@/components/ParentGate';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooks, useCategories } from '@/hooks/useBooks';
import { useAuth } from '@/providers/AuthProvider';
import { useMode } from '@/providers/ModeProvider';

const ageFilters = [
  { label: 'All ages', min: 0, max: 12 },
  { label: '2-3', min: 2, max: 3 },
  { label: '3-5', min: 3, max: 5 },
  { label: '6-8', min: 6, max: 8 }
] as const;

export default function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isKid } = useMode();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const [showGate, setShowGate] = useState(false);
  const [pendingBookId, setPendingBookId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAge, setSelectedAge] = useState<(typeof ageFilters)[number]>(ageFilters[0]);

  const { data: booksData, isLoading } = useBooks({ limit: 100, q: deferredQuery || undefined });
  const { data: categories } = useCategories();

  const allBooks = (booksData?.data ?? []).filter(book => user?.role === 'ADMIN' || book.status === 'PUBLISHED');

  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => {
      const categoryMatch = selectedCategory === 'all' || book.categories.some(c => c.slug === selectedCategory);
      const ageMatch = book.ageMin <= selectedAge.max && book.ageMax >= selectedAge.min;
      return categoryMatch && ageMatch;
    });
  }, [allBooks, selectedAge, selectedCategory]);

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
      <AppHeader title="Search" subtitle="Find a story" icon={Search} active="search" />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 md:px-7">
        <section className="grid gap-4 rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_14px_34px_rgba(58,46,40,0.08)] md:p-5">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search title or author"
              className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--background)] pl-12 pr-4 font-[family-name:var(--font-body)] text-base font-bold text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
            />
          </label>

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
        </section>

        <section className="grid gap-4">
          {!isLoading && (
            <p className="text-sm font-bold text-[var(--ink-soft)]">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'story' : 'stories'} found
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-[1.35rem]" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="grid place-items-center rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] py-16 text-center">
              <Mascot pose="reading" size="md" speech="No matching stories" />
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
                  <BookCard
                    book={book}
                    kidMode={isKid}
                    onLocked={() => handleLocked(book.id)}
                  />
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
