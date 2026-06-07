import { useState, useLayoutEffect, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import confetti from 'canvas-confetti';
import { BookOpen, CheckCircle2, ChevronLeft } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { Mascot } from '@/components/Mascot';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useBook, useBookContent } from '@/hooks/useBooks';
import type { BookPage } from '@storybook/shared';

const HEADER_H = 44;

function calcDims(availW: number, availH: number) {
  // Two portrait pages side by side (each page 3:4 ratio)
  let pageW = Math.floor(availW / 2);
  let pageH = Math.floor(pageW * (4 / 3));
  if (pageH > availH) {
    pageH = availH;
    pageW = Math.floor(pageH * (3 / 4));
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

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: book } = useBook(id!);
  const { data: content, isLoading, isError } = useBookContent(id!);
  const [currentPage, setCurrentPage] = useState(0);
  const [finished, setFinished] = useState(false);
  const [{ portrait, dims }, setState] = useState(getState);

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
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }, []);

  function handleFlip(e: { data: number }) {
    const page = e.data;
    setCurrentPage(page);
    if (content && page >= content.pages.length - 1) {
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
        className="flex items-center justify-between px-4 shrink-0 z-10"
        style={{ height: HEADER_H }}
      >
        <ChunkyButton variant="light" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4" /> Exit
        </ChunkyButton>
        {book && (
          <h2 className="text-white/70 font-[family-name:var(--font-display)] text-sm truncate max-w-xs">
            {book.title}
          </h2>
        )}
        <span className="text-white/40 text-xs font-[family-name:var(--font-body)]">
          {currentPage + 1} / {content.pages.length}
        </span>
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
            width={dims.width}
            height={dims.height}
            showCover={false}
            onFlip={handleFlip}
            className=""
            style={{}}
            startPage={0}
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
                    ratio="3/4"
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
    </div>
  );
}
