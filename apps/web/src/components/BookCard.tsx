import { useNavigate } from 'react-router-dom';
import type { BookWithAccess } from '@storybook/shared';
import { PlaceholderImage } from './PlaceholderImage';
import { AccessBadge } from './AccessBadge';
import { BookOpen, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: BookWithAccess & {
    currentPage?: number;
    readCount?: number;
  };
  onLocked?: () => void;
  kidMode?: boolean;
}

export function BookCard({ book, onLocked, kidMode = false }: BookCardProps) {
  const navigate = useNavigate();
  const hasProgress = !!book.currentPage && book.currentPage > 1 && book.currentPage < book.pageCount;

  function handleClick() {
    if (!book.access.canAccess && kidMode) {
      onLocked?.();
    } else {
      navigate(`/book/${book.id}`);
    }
  }

  return (
    <div
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-[1.35rem] bg-[var(--card)] text-left',
        'border border-[var(--line)] shadow-[0_10px_24px_rgba(58,46,40,0.08)] transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(58,46,40,0.12)]',
        kidMode && 'min-h-[64px]'
      )}
    >
      <button
        onClick={handleClick}
        aria-label={`${book.title}. ${book.access.canAccess ? 'Accessible' : 'Locked'}`}
        className="flex w-full flex-1 flex-col text-left"
      >
        <div className="relative bg-[var(--muted)]">
          <PlaceholderImage
            slot={book.coverSlot ?? `book.cover.${book.slug}`}
            label={`cover - ${book.title}`}
            ratio="4/3"
            className="rounded-none border-0"
          />
          <div className="absolute left-2.5 top-2.5">
            <AccessBadge reason={book.access.reason} />
          </div>
          {!book.access.canAccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/18">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--card)]/95 shadow-[0_8px_20px_rgba(58,46,40,0.18)]">
                <Lock className="h-6 w-6 text-[var(--ink-soft)]" strokeWidth={2.5} />
              </div>
            </div>
          )}
        </div>
        <div className="flex min-h-[7rem] flex-col gap-2 p-3.5">
          <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-base font-semibold leading-tight text-[var(--ink)]">
            {book.title}
          </h3>
          <p className="font-[family-name:var(--font-body)] text-xs font-semibold text-[var(--ink-soft)]">{book.author}</p>
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ink-soft)]">
              <BookOpen className="h-3.5 w-3.5" />
              {hasProgress ? `Page ${book.currentPage}` : book.readCount && book.readCount > 0 && !kidMode ? `${book.readCount} reads` : `${book.pageCount} pages`}
            </span>
            {!kidMode && book.priceCents > 0 && !book.access.canAccess && (
              <span className="rounded-full bg-[var(--muted)] px-2 py-1 text-xs font-extrabold text-[var(--ink)]">
                Rp {book.priceCents.toLocaleString('id-ID')}
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
