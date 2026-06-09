import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Crown, LibraryBig, Sparkles, Star } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { AppHeader } from '@/components/AppHeader';
import { Mascot } from '@/components/Mascot';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooks, useLibrary } from '@/hooks/useBooks';
import { useMode } from '@/providers/ModeProvider';

const TABS = ['All', 'In Progress', 'Free', 'Owned', 'Included'] as const;
type Tab = (typeof TABS)[number];

export default function LibraryPage() {
  const navigate = useNavigate();
  const { isKid } = useMode();
  const [activeTab, setActiveTab] = useState<Tab>('All');

  const { data: booksData, isLoading } = useBooks({ limit: 100 });
  const { data: library } = useLibrary();

  const accessible = booksData?.data.filter(book => book.access.canAccess) ?? [];
  const freeCount = accessible.filter(book => book.access.reason === 'FREE' || book.access.reason === 'ADMIN').length;
  const ownedCount = accessible.filter(book => book.access.reason === 'OWNED').length;
  const includedCount = accessible.filter(book => book.access.reason === 'SUBSCRIPTION').length;
  const inProgressCount = accessible.filter(book => book.currentPage > 1 && book.currentPage < book.pageCount).length;

  const filtered = (() => {
    if (activeTab === 'All') return accessible;
    if (activeTab === 'In Progress') return accessible.filter(book => book.currentPage > 1 && book.currentPage < book.pageCount);
    if (activeTab === 'Free') return accessible.filter(book => book.access.reason === 'FREE' || book.access.reason === 'ADMIN');
    if (activeTab === 'Owned') return accessible.filter(book => book.access.reason === 'OWNED');
    if (activeTab === 'Included') return accessible.filter(book => book.access.reason === 'SUBSCRIPTION');
    return accessible;
  })();

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-10">
      <AppHeader
        title="My Library"
        subtitle={library?.hasActiveSub ? 'Subscription active' : 'Owned and free books'}
        icon={LibraryBig}
        active="library"
      />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 md:px-7">
        <section className="hidden overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] shadow-[0_18px_42px_rgba(58,46,40,0.1)] md:block">
          <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-8 md:p-8">
            <div className="relative grid place-items-center overflow-hidden rounded-[1.5rem] bg-[var(--secondary)]/15 px-6 py-5">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--primary)]/10" />
              <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-[var(--secondary)]/25" />
              <Mascot pose="emptyLibrary" size="lg" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                {library?.hasActiveSub ? <Sparkles className="h-4 w-4 text-[var(--primary)]" /> : <LibraryBig className="h-4 w-4 text-[var(--primary)]" />}
                {library?.hasActiveSub ? 'Subscription active' : 'Your shelf'}
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[var(--ink)] md:text-4xl">
                Ready-to-read shelf
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[var(--ink-soft)] md:text-base">
                Everything the account can open right now — free books, owned books, and subscription-included stories all in one place.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'Progress', value: inProgressCount, icon: BookOpen, tint: 'bg-[var(--secondary)]/20 text-[var(--ink)]' },
                  { label: 'Free', value: freeCount, icon: Star, tint: 'bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)]' },
                  { label: 'Owned', value: ownedCount, icon: BookOpen, tint: 'bg-[var(--color-success)]/15 text-[var(--color-success)]' },
                  { label: 'Included', value: includedCount, icon: Crown, tint: 'bg-[var(--color-info)]/15 text-[var(--color-info)]' }
                ].map(item => (
                  <div key={item.label} className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--background)] p-4">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl ${item.tint}`}>
                      <item.icon className="h-5 w-5" strokeWidth={2.4} />
                    </span>
                    <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">{item.value}</p>
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`min-h-[2.9rem] shrink-0 rounded-full border px-4 text-sm font-extrabold transition ${
                  activeTab === tab
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                    : 'border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:bg-[var(--muted)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {!isLoading && (
            <p className="text-sm font-bold text-[var(--ink-soft)]">
              {filtered.length} {filtered.length === 1 ? 'book' : 'books'} accessible
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-[1.35rem]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] py-16 text-center">
              <div className="flex flex-col items-center gap-4 px-5">
                <Mascot pose="emptyLibrary" size="lg" speech="Nothing here yet" />
                <p className="max-w-sm text-sm font-semibold leading-relaxed text-[var(--ink-soft)]">
                  {activeTab === 'All'
                    ? "No accessible books yet. Start with a free story or ask a parent to unlock more."
                    : `No ${activeTab.toLowerCase()} books in this shelf.`}
                </p>
                <ChunkyButton variant="secondary" onClick={() => navigate('/')}>
                  Browse catalog
                </ChunkyButton>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              animate="show"
            >
              {filtered.map(book => (
                <motion.div
                  key={book.id}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.22 }}
                >
                  <BookCard
                    book={book}
                    kidMode={isKid}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}
