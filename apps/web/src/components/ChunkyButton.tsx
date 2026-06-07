import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light';

interface ChunkyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--primary)] text-white border-b-4 border-[var(--primary-hover)] hover:bg-[var(--primary-hover)] active:translate-y-0.5 active:border-b-2',
  secondary: 'bg-[var(--secondary)] text-[var(--ink)] border-b-4 border-[var(--secondary-hover)] hover:bg-[var(--secondary-hover)] active:translate-y-0.5 active:border-b-2',
  ghost: 'bg-[var(--muted)] text-[var(--ink)] border-b-4 border-[var(--line)] hover:bg-[var(--line)] active:translate-y-0.5 active:border-b-2',
  light: 'bg-white/20 text-white border-b-4 border-white/10 hover:bg-white/30 active:translate-y-0.5 active:border-b-2'
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm min-h-[44px]',
  md: 'px-6 py-3 text-base min-h-[52px]',
  lg: 'px-8 py-4 text-lg min-h-[64px]'
};

export function ChunkyButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ChunkyButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex max-w-full items-center justify-center gap-2 rounded-2xl font-[family-name:var(--font-display)] font-semibold leading-none',
        'transition-all duration-75 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
        'whitespace-nowrap shadow-[0_6px_16px_rgba(58,46,40,0.08)]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
