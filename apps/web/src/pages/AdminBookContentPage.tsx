import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, BookImage, CheckCircle2, ChevronLeft, ChevronRight, FileText, Loader2, Plus, Save, Type } from 'lucide-react';
import { ChunkyButton } from '@/components/ChunkyButton';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminBookContent, useAdminUpdateBookContent, useBook } from '@/hooks/useBooks';
import type { BookPage, BookWithAccess } from '@storybook/shared';

const MIN_PAGE_COUNT = 1;
const MAX_PAGE_COUNT = 50;

function clampPageCount(value: number) {
  if (!Number.isFinite(value)) return MIN_PAGE_COUNT;
  return Math.min(MAX_PAGE_COUNT, Math.max(MIN_PAGE_COUNT, Math.round(value)));
}

function cleanSlot(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function fallbackPage(book: BookWithAccess | undefined, index: number): BookPage {
  const slug = book?.slug ?? 'story';
  const title = book?.title ?? 'Story';
  return {
    index,
    imageSlot: `book.page.${slug}.${index}`,
    label: `page - ${title} #${index}`,
    text: ''
  };
}

function normalizePages(pages: BookPage[], pageCount: number, book: BookWithAccess | undefined) {
  return Array.from({ length: pageCount }, (_, i) => {
    const index = i + 1;
    const existing = pages.find(page => page.index === index);
    return existing ?? fallbackPage(book, index);
  });
}

export default function AdminBookContentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookId = id ?? '';
  const { data: book, isLoading: isBookLoading, isError: isBookError } = useBook(bookId);
  const { data: content, isLoading: isContentLoading, isError: isContentError } = useAdminBookContent(bookId);
  const updateContent = useAdminUpdateBookContent(bookId);
  const [initializedBookId, setInitializedBookId] = useState<string | null>(null);
  const [coverSlot, setCoverSlot] = useState('');
  const [pages, setPages] = useState<BookPage[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!book || !content || initializedBookId === content.bookId) return;

    setCoverSlot(content.coverSlot ?? '');
    setPages(normalizePages(content.pages, clampPageCount(content.pageCount), book));
    setSlideIndex(0);
    setInitializedBookId(content.bookId);
  }, [book, content, initializedBookId]);

  const isCover = slideIndex === 0;
  const pageArrayIndex = slideIndex - 1;
  const currentPage = !isCover ? pages[pageArrayIndex] : undefined;
  const isLastSlide = slideIndex >= pages.length;
  const totalSlides = pages.length + 1;
  const progress = Math.round(((slideIndex + 1) / totalSlides) * 100);
  const previewCoverSlot = coverSlot.trim() || book?.coverSlot || (book ? `book.cover.${book.slug}` : 'book.cover.story');
  const categories = book?.categories.map(category => category.name).join(', ') || 'No category';
  const isError = isBookError || isContentError;

  function updateCurrentText(text: string) {
    setPages(prev => prev.map((page, index) => index === pageArrayIndex ? { ...page, text } : page));
  }

  function goPrev() {
    setSlideIndex(prev => Math.max(0, prev - 1));
  }

  function goNext() {
    setSlideIndex(prev => Math.min(pages.length, prev + 1));
  }

  function addPage() {
    const nextSlide = pages.length + 1;
    setPages(prev => [...prev, fallbackPage(book, prev.length + 1)]);
    setSlideIndex(nextSlide);
  }

  async function saveContent() {
    return updateContent.mutateAsync({
      coverSlot: cleanSlot(coverSlot),
      pageCount: pages.length,
      pages: pages.map((page, index) => ({
        index: index + 1,
        imageSlot: page.imageSlot,
        text: page.text
      }))
    });
  }

  async function handleSave() {
    try {
      await saveContent();
      toast.success('Book content saved.');
    } catch {
      toast.error('Failed to save book content.');
    }
  }

  async function handleFinish() {
    try {
      await saveContent();
      toast.success('Book content finished.');
      navigate('/admin');
    } catch {
      toast.error('Failed to finish book content.');
    }
  }

  if (isError) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--background)] px-4">
        <div className="max-w-md rounded-[1.5rem] border border-[var(--line)] bg-[var(--card)] p-6 text-center shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
          <FileText className="mx-auto h-10 w-10 text-[var(--primary)]" />
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Content not found</h1>
          <p className="mt-2 font-[family-name:var(--font-body)] text-sm font-bold text-[var(--ink-soft)]">
            The book may have been removed or your session expired.
          </p>
          <ChunkyButton variant="ghost" className="mt-5" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
            Back to admin
          </ChunkyButton>
        </div>
      </div>
    );
  }

  if (isBookLoading || isContentLoading || !book || !content) {
    return (
      <div className="min-h-screen bg-[var(--background)] pb-12">
        <header className="border-b border-[var(--line)] bg-[var(--card)] px-4 py-4 md:px-7">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <ChunkyButton variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4" />
              Admin
            </ChunkyButton>
            <div className="min-w-0 flex-1">
              <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-none text-[var(--ink)]">
                Book content
              </h1>
            </div>
          </div>
        </header>
        <main className="mx-auto grid max-w-5xl gap-5 px-4 pt-6 md:px-7">
          <Skeleton className="h-44 rounded-[1.6rem]" />
          <Skeleton className="h-[32rem] rounded-[1.6rem]" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <header className="border-b border-[var(--line)] bg-[var(--card)] px-4 py-4 md:px-7">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <ChunkyButton variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
            Admin
          </ChunkyButton>
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-none text-[var(--ink)]">
              Book content
            </h1>
            <p className="mt-1 hidden text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)] sm:block">
              Slides · cover and story pages
            </p>
          </div>
          <ChunkyButton size="sm" disabled={updateContent.isPending} onClick={handleSave}>
            {updateContent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </ChunkyButton>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-5 px-4 pt-6 md:px-7">
        <section className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_14px_34px_rgba(58,46,40,0.08)] md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Editing</p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[var(--ink)]">
                {book.title}
              </h2>
              <p className="mt-2 max-w-2xl font-[family-name:var(--font-body)] text-sm font-bold leading-6 text-[var(--ink-soft)]">
                {book.description || 'No catalog description yet.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink)]">{categories}</span>
              <span className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink)]">Ages {book.ageMin}-{book.ageMax}</span>
              <span className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink)]">{pages.length} pages</span>
              <span className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink)]">{book.status.toLowerCase()}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
              <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Slide {slideIndex + 1} / {totalSlides}
            </span>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_14px_34px_rgba(58,46,40,0.08)] md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {isCover ? <BookImage className="h-5 w-5 text-[var(--primary)]" /> : <FileText className="h-5 w-5 text-[var(--primary)]" />}
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                {isCover ? 'Cover slide' : `Page ${slideIndex} of ${pages.length}`}
              </h3>
            </div>
            {!isCover && currentPage && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink-soft)]">
                <Type className="h-3.5 w-3.5" />
                {currentPage.text.trim().length} chars
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[20rem_1fr]">
            <PlaceholderImage
              slot={isCover ? previewCoverSlot : currentPage?.imageSlot ?? previewCoverSlot}
              label={isCover ? `cover - ${book.title}` : currentPage?.label ?? `page - ${book.title}`}
              ratio="3/4"
              className="mx-auto w-full max-w-[20rem] rounded-[1.25rem] border border-[var(--line)]"
            />

            {isCover ? (
              <div className="grid content-start gap-3">
                <Label htmlFor="coverSlot" className="text-sm font-bold text-[var(--ink)]">Book image slot or URL</Label>
                <Input
                  id="coverSlot"
                  value={coverSlot}
                  placeholder={`book.cover.${book.slug}`}
                  className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]"
                  onChange={event => setCoverSlot(event.target.value)}
                />
                <p className="font-[family-name:var(--font-body)] text-sm font-bold leading-6 text-[var(--ink-soft)]">
                  This is the cover children see in the catalog. Leave it blank to fall back to the default art for this book.
                </p>
              </div>
            ) : currentPage ? (
              <div className="grid content-start gap-3">
                <Label htmlFor="pageText" className="text-sm font-bold text-[var(--ink)]">Story text on this page</Label>
                <textarea
                  id="pageText"
                  value={currentPage.text}
                  placeholder="Once upon a cozy morning..."
                  className="min-h-[18rem] resize-none rounded-[1.25rem] border border-[var(--line)] bg-[var(--background)] px-4 py-3 font-[family-name:var(--font-body)] text-base font-semibold leading-7 text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)]/70 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
                  onChange={event => updateCurrentText(event.target.value)}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <ChunkyButton variant="ghost" disabled={isCover} onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </ChunkyButton>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isLastSlide ? (
                <ChunkyButton onClick={goNext}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </ChunkyButton>
              ) : (
                <ChunkyButton variant="secondary" onClick={addPage}>
                  <Plus className="h-4 w-4" />
                  Add page
                </ChunkyButton>
              )}

              {!isCover && isLastSlide && (
                <ChunkyButton disabled={updateContent.isPending} onClick={handleFinish}>
                  {updateContent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Finish
                </ChunkyButton>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
