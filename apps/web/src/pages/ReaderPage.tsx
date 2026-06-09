import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import confetti from 'canvas-confetti';
import { BookOpen, CheckCircle2, ChevronLeft, Square, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { Mascot } from '@/components/Mascot';
import { ChunkyButton } from '@/components/ChunkyButton';
import { ParentGate } from '@/components/ParentGate';
import { Skeleton } from '@/components/ui/skeleton';
import { useBook, useBookContent, useUpdateReadingProgress } from '@/hooks/useBooks';
import { useScreenTime } from '@/providers/ScreenTimeProvider';
import type { BookPage } from '@storybook/shared';

const HEADER_H = 56;

function calcDims(availW: number, availH: number) {
  // Two landscape pages side by side (each page 4:3 ratio)
  let pageW = Math.floor(availW / 2);
  let pageH = Math.floor(pageW * (3 / 4));
  if (pageH > availH) {
    pageH = availH;
    pageW = Math.floor(pageH * (4 / 3));
  }
  return { width: pageW, height: pageH };
}

function getState() {
  const portrait = window.innerHeight > window.innerWidth;
  const dims = portrait
    ? calcDims(window.innerHeight - HEADER_H, window.innerWidth)
    : calcDims(window.innerWidth, window.innerHeight - HEADER_H);
  return { portrait, dims };
}

function getVisibleNarrationText(pages: BookPage[], currentPage: number) {
  const spreadStart = currentPage % 2 === 0 ? currentPage : currentPage - 1;
  return pages
    .slice(spreadStart, spreadStart + 2)
    .map(page => page.text.trim())
    .filter(Boolean)
    .join('\n\n');
}

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: book } = useBook(id!);
  const { data: content, isLoading, isError } = useBookContent(id!);
  const updateProgress = useUpdateReadingProgress();
  const { isExpired: isScreenTimeExpired, clearKidSession } = useScreenTime();
  const lastTrackedPage = useRef<number | null>(null);
  const completedBookId = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const screenTimeExpiredPage = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [showScreenTimeGate, setShowScreenTimeGate] = useState(false);
  const [{ portrait, dims }, setState] = useState(getState);
  const startPageIndex = book?.currentPage && book.currentPage > 1 && book.currentPage < book.pageCount
    ? book.currentPage - 1
    : 0;
  const speechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  useLayoutEffect(() => {
    const update = () => setState(getState());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  useEffect(() => {
    const enter = async () => {
      try {
        await document.documentElement.requestFullscreen();
        await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
      } catch { /* not supported */ }
    };
    enter();
    return () => {
      if (speechSupported) window.speechSynthesis.cancel();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    setCurrentPage(startPageIndex);
  }, [startPageIndex]);

  useEffect(() => {
    if (!isScreenTimeExpired) {
      screenTimeExpiredPage.current = null;
      setShowScreenTimeGate(false);
      return;
    }

    if (finished) return;

    if (screenTimeExpiredPage.current === null) {
      screenTimeExpiredPage.current = currentPage;
      return;
    }

    if (currentPage !== screenTimeExpiredPage.current) {
      stopNarration();
      setShowScreenTimeGate(true);
    }
  }, [currentPage, finished, isScreenTimeExpired]);

  function stopNarration() {
    if (!speechSupported) return;
    utteranceRef.current = null;
    window.speechSynthesis.cancel();
    setIsReadingAloud(false);
  }

  function handleReadAloud() {
    if (!speechSupported) {
      toast.error('Read aloud is not supported in this browser.');
      return;
    }

    if (!content) return;

    if (isReadingAloud) {
      stopNarration();
      return;
    }

    const text = getVisibleNarrationText(content.pages, currentPage);
    if (!text) {
      toast.info('No story text on this page yet.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 1.04;
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsReadingAloud(false);
      }
    };
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsReadingAloud(false);
        toast.error('Could not read this page aloud.');
      }
    };

    window.speechSynthesis.cancel();
    utteranceRef.current = utterance;
    setIsReadingAloud(true);
    window.speechSynthesis.speak(utterance);
  }

  function handleFlip(e: { data: number }) {
    if (isReadingAloud) stopNarration();
    const page = e.data;
    const pageNumber = page + 1;
    const isLastPage = !!content && page >= content.pages.length - 1;
    setCurrentPage(page);
    if (id && lastTrackedPage.current !== pageNumber) {
      lastTrackedPage.current = pageNumber;
      updateProgress.mutate({ bookId: id, currentPage: pageNumber, completed: false });
    }
    if (id && isLastPage && completedBookId.current !== id) {
      completedBookId.current = id;
      updateProgress.mutate({ bookId: id, currentPage: pageNumber, completed: true });
      setFinished(true);
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    }
  }

  if (isLoading) return (
    <div className="fixed inset-0 bg-[#2C1A0E] flex items-center justify-center">
      <Skeleton className="w-64 h-80 rounded-2xl bg-white/10" />
    </div>
  );

  if (isError || !content) return (
    <div className="fixed inset-0 bg-[var(--color-background)] flex flex-col items-center justify-center gap-4">
      <Mascot pose="locked" size="lg" speech="Locked story" />
      <ChunkyButton variant="ghost" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-4 w-4" />
        Go back
      </ChunkyButton>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#2C1A0E] flex flex-col" style={{ touchAction: 'pan-y' }}>
      <header
        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 shrink-0 z-10"
        style={{ height: HEADER_H }}
      >
        <ChunkyButton variant="light" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4" /> Exit
        </ChunkyButton>
        <h2 className="hidden truncate text-center font-[family-name:var(--font-display)] text-sm text-white/70 sm:block">
          {book?.title ?? 'Storybook'}
        </h2>
        <div className="flex items-center justify-end gap-2">
          <ChunkyButton
            type="button"
            variant="light"
            size="sm"
            onClick={handleReadAloud}
            disabled={!speechSupported}
            aria-pressed={isReadingAloud}
            title={speechSupported ? 'Read this page aloud' : 'Read aloud is not supported in this browser'}
            className="px-3"
          >
            {isReadingAloud ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isReadingAloud ? 'Stop' : 'Bacakan'}
          </ChunkyButton>
          <span className="min-w-11 text-right font-[family-name:var(--font-body)] text-xs text-white/40">
            {currentPage + 1} / {content.pages.length}
          </span>
        </div>
      </header>

      {/* Book area — centered, rotated 90° when portrait */}
      <div className="flex-1 relative overflow-hidden">
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)${portrait ? ' rotate(90deg)' : ''}`,
          }}
        >
          {/* @ts-ignore react-pageflip types are loose */}
          <HTMLFlipBook
            key={`${content.bookId}-${startPageIndex}`}
            width={dims.width}
            height={dims.height}
            showCover={false}
            onFlip={handleFlip}
            className=""
            style={{}}
            startPage={startPageIndex}
            size="fixed"
            minWidth={dims.width}
            maxWidth={dims.width}
            minHeight={dims.height}
            maxHeight={dims.height}
            drawShadow
            flippingTime={500}
            usePortrait={false}
            startZIndex={0}
            autoSize={false}
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            mobileScrollSupport
          >
            {content.pages.map((page: BookPage) => (
              <div
                key={page.index}
                style={{ width: dims.width, height: dims.height }}
                className="bg-[var(--color-card)] overflow-hidden"
              >
                <div className="relative h-full w-full">
                  <PlaceholderImage
                    slot={page.imageSlot}
                    label={page.label}
                    ratio="4/3"
                    className="absolute inset-0 h-full w-full rounded-none border-0"
                  />
                  {page.text.trim() && (
                    <div className="absolute inset-x-5 bottom-5 max-h-[36%] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--card)]/95 p-4 shadow-[0_12px_28px_rgba(44,26,14,0.22)]">
                      <p className="font-[family-name:var(--font-body)] text-base font-extrabold leading-7 text-[var(--ink)]">
                        {page.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      {finished && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center gap-6 z-50">
          <Mascot pose="celebrating" size="lg" speech="You finished" />
          <h2 className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-semibold text-3xl text-white">
            <CheckCircle2 className="h-7 w-7" />
            The End
          </h2>
          <ChunkyButton size="lg" onClick={() => navigate('/')}>
            <BookOpen className="h-5 w-5" />
            Back to library
          </ChunkyButton>
        </div>
      )}

      {showScreenTimeGate && (
        <ParentGate
          title="Screen time is up"
          description="Enter the parent PIN to close kid mode."
          speech="Oyen is getting sleepy"
          mascotPose="sleeping"
          onSuccess={() => {
            clearKidSession();
            navigate('/parent', { replace: true });
          }}
        />
      )}
    </div>
  );
}
