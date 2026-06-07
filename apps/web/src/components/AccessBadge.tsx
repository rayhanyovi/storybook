import type { AccessReason } from '@storybook/shared';
import { Lock, Star, BookOpen, Crown, Infinity } from 'lucide-react';
import { cn } from '@/lib/utils';

const config: Record<AccessReason, { label: string; icon: React.ReactNode; color: string }> = {
  FREE: { label: 'Free', icon: <Star className="h-3.5 w-3.5" />, color: 'bg-[var(--color-accent-teal)] text-white' },
  OWNED: { label: 'Owned', icon: <BookOpen className="h-3.5 w-3.5" />, color: 'bg-[var(--color-success)] text-white' },
  SUBSCRIPTION: { label: 'Included', icon: <Infinity className="h-3.5 w-3.5" />, color: 'bg-[var(--color-info)] text-white' },
  LOCKED: { label: 'Ask a grown-up', icon: <Lock className="h-3.5 w-3.5" />, color: 'bg-[var(--muted)] text-[var(--ink-soft)] ring-1 ring-[var(--line)]' },
  ADMIN: { label: 'Admin', icon: <Crown className="h-3.5 w-3.5" />, color: 'bg-[var(--color-accent-purple)] text-white' }
};

export function AccessBadge({ reason, className }: { reason: AccessReason; className?: string }) {
  const { label, icon, color } = config[reason];
  return (
    <span className={cn('inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold leading-none font-[family-name:var(--font-body)]', color, className)}>
      {icon}
      {label}
    </span>
  );
}
