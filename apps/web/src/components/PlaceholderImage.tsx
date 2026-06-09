import { cn } from '@/lib/utils';
import { resolveImage } from '@/lib/imageRegistry';
import { ImageIcon } from 'lucide-react';

interface PlaceholderImageProps {
  slot: string;
  label: string;
  ratio?: '1/1' | '4/3' | '3/4' | '16/9';
  className?: string;
}

const ratioClass: Record<string, string> = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '16/9': 'aspect-video'
};

const toneBySlot = [
  { test: 'bedtime', accent: 'bg-[var(--color-accent-blue)]', wash: 'bg-[var(--color-accent-blue)]/10' },
  { test: 'star', accent: 'bg-[var(--color-accent-blue)]', wash: 'bg-[var(--color-accent-blue)]/10' },
  { test: 'adventure', accent: 'bg-[var(--color-primary)]', wash: 'bg-[var(--color-primary)]/10' },
  { test: 'boat', accent: 'bg-[var(--color-primary)]', wash: 'bg-[var(--color-primary)]/10' },
  { test: 'learning', accent: 'bg-[var(--color-accent-purple)]', wash: 'bg-[var(--color-accent-purple)]/10' },
  { test: 'counting', accent: 'bg-[var(--color-accent-purple)]', wash: 'bg-[var(--color-accent-purple)]/10' },
  { test: 'abc', accent: 'bg-[var(--color-accent-purple)]', wash: 'bg-[var(--color-accent-purple)]/10' },
  { test: 'animals', accent: 'bg-[var(--color-accent-green)]', wash: 'bg-[var(--color-accent-green)]/10' },
  { test: 'jungle', accent: 'bg-[var(--color-accent-green)]', wash: 'bg-[var(--color-accent-green)]/10' },
  { test: 'ocean', accent: 'bg-[var(--color-accent-teal)]', wash: 'bg-[var(--color-accent-teal)]/10' },
  { test: 'mascot', accent: 'bg-[var(--color-primary)]', wash: 'bg-[var(--color-primary)]/10' },
];

function getTone(slot: string) {
  return toneBySlot.find(tone => slot.includes(tone.test)) ?? {
    accent: 'bg-[var(--color-secondary)]',
    wash: 'bg-[var(--color-secondary)]/15'
  };
}

export function PlaceholderImage({ slot, label, ratio = '1/1', className }: PlaceholderImageProps) {
  const src = resolveImage(slot);
  const tone = getTone(slot);

  if (src) {
    return (
      <div className={cn('overflow-hidden rounded-2xl', ratioClass[ratio], className)}>
        <img
          src={src}
          alt={label}
          className="h-full w-full bg-[var(--muted)] object-contain"
          loading="lazy"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed',
        'bg-[var(--muted)] border-[var(--line)] text-[var(--muted-foreground)]',
        ratioClass[ratio],
        className
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-2', tone.accent)} />
      <div className={cn('absolute -right-10 top-7 h-20 w-40 rotate-12 rounded-2xl', tone.wash)} />
      <div className={cn('absolute -left-12 bottom-8 h-16 w-36 -rotate-12 rounded-2xl', tone.wash)} />
      <div className={cn('relative grid h-11 w-11 place-items-center rounded-2xl text-white shadow-sm', tone.accent)}>
        <ImageIcon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <span className="relative max-w-[82%] px-2 text-center font-[family-name:var(--font-body)] text-xs font-bold leading-tight opacity-75">
        {label}
      </span>
    </div>
  );
}
