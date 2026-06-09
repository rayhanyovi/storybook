import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Baby, BarChart3, BookOpen, Crown, Home, LockKeyhole, LogOut, Search, Settings, Star } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ChunkyButton } from '@/components/ChunkyButton';
import { ParentGate } from '@/components/ParentGate';
import { ScreenTimeSetup } from '@/components/ScreenTimeSetup';
import { useAuth } from '@/providers/AuthProvider';
import { useMode } from '@/providers/ModeProvider';
import { useScreenTime } from '@/providers/ScreenTimeProvider';
import { useLibrary } from '@/hooks/useBooks';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface ProfileContentProps {
  onClose?: () => void;
  className?: string;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export function ProfileContent({ onClose, className }: ProfileContentProps) {
  const { user, logout } = useAuth();
  const { isKid, setMode } = useMode();
  const { data: library } = useLibrary();
  const { startKidSession, clearKidSession } = useScreenTime();
  const navigate = useNavigate();
  const location = useLocation();
  const [showGate, setShowGate] = useState(false);
  const [showScreenTimeSetup, setShowScreenTimeSetup] = useState(false);

  const initial = user?.email?.[0]?.toUpperCase() ?? 'U';
  const name = user?.email?.split('@')[0] ?? '';

  function close() {
    onClose?.();
  }

  function go(path: string) {
    navigate(path);
    close();
  }

  function handleModeChange(next: boolean) {
    if (next) {
      setShowScreenTimeSetup(true);
    } else {
      setShowGate(true);
    }
  }

  function startKidMode(minutes: number) {
    startKidSession(minutes);
    setMode('kid');
    setShowScreenTimeSetup(false);
    navigate('/');
    close();
  }

  function handleSubscribe() {
    navigate(`/checkout?type=subscription&returnTo=${encodeURIComponent(location.pathname)}`);
    close();
  }

  function handleLogout() {
    clearKidSession();
    logout();
    navigate('/auth/login');
    close();
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--background)]', className)}>
      <div className="bg-[var(--primary)] p-6 text-white">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/25 font-[family-name:var(--font-display)] text-2xl font-semibold">
          {initial}
        </div>
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold capitalize">{name}</p>
        <p className="font-[family-name:var(--font-body)] text-sm text-white/70">{user?.email}</p>
        {user?.role === 'ADMIN' && (
          <span className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 font-[family-name:var(--font-body)] text-xs">
            Admin
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-[var(--color-muted)] p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--card)] text-[var(--primary)]">
              {isKid ? <Baby className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-ink)]">
                {isKid ? 'Kid mode' : 'Parent mode'}
              </p>
              <p className="mt-0.5 font-[family-name:var(--font-body)] text-xs text-[var(--color-ink-soft)]">
                {isKid ? 'Safe browsing, no purchases' : 'Account, access, purchases'}
              </p>
            </div>
          </div>
          <Switch
            checked={isKid}
            onCheckedChange={handleModeChange}
            aria-label={isKid ? 'Switch to parent mode' : 'Switch to kid mode'}
            className="shrink-0"
          />
        </div>

        {library?.hasActiveSub ? (
          <div className="mb-1 flex items-center gap-2 px-2 py-2">
            <Star className="h-4 w-4 text-[var(--color-success)]" />
            <span className="font-[family-name:var(--font-body)] text-sm font-semibold text-[var(--color-success)]">
              Active subscription
            </span>
          </div>
        ) : !isKid ? (
          <ChunkyButton className="mb-3 w-full" onClick={handleSubscribe}>
            <Crown className="h-4 w-4" />
            Subscribe · Rp 49.000/mo
          </ChunkyButton>
        ) : null}

        <Separator className="my-2" />

        {([
          { label: 'Discover', icon: Home, path: '/' },
          { label: 'Search', icon: Search, path: '/search' },
          { label: 'My Library', icon: BookOpen, path: '/library' },
          ...(user?.role === 'ADMIN' ? [{ label: 'Admin Panel', icon: Settings, path: '/admin' }] : []),
        ] as { label: string; icon: typeof Home; path: string }[]).map(item => (
          <button
            key={item.path}
            onClick={() => go(item.path)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-[var(--color-muted)]"
          >
            <item.icon className="h-5 w-5 text-[var(--color-ink-soft)]" />
            <span className="font-[family-name:var(--font-body)] text-[var(--color-ink)]">{item.label}</span>
          </button>
        ))}

        {!isKid && (
          <>
            <Separator className="my-2" />
            <p className="px-2 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">For Parent</p>
            {([
              { label: 'Account and Subscription', icon: Settings, path: '/parent' },
              { label: 'Child Progress', icon: BarChart3, path: '/parent/child-progress' }
            ] as { label: string; icon: typeof Home; path: string }[]).map(item => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-[var(--color-muted)]"
              >
                <item.icon className="h-5 w-5 text-[var(--color-ink-soft)]" />
                <span className="font-[family-name:var(--font-body)] text-[var(--color-ink)]">{item.label}</span>
              </button>
            ))}
          </>
        )}

        <Separator className="my-2" />

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 text-[var(--color-destructive)]" />
          <span className="font-[family-name:var(--font-body)] text-[var(--color-destructive)]">Log out</span>
        </button>

        <div className="mt-4 space-y-1 text-center font-[family-name:var(--font-body)] text-xs text-[var(--color-ink-soft)]">
          <p>Storybook v1.0 · Demo</p>
          <p>Developed by Muhammad Rayhan Yovi for Technical Test Purpose.</p>
        </div>
      </div>

      {showGate && (
        <ParentGate
          onSuccess={() => { setShowGate(false); setMode('parent'); close(); }}
          onCancel={() => setShowGate(false)}
        />
      )}
      {showScreenTimeSetup && (
        <ScreenTimeSetup
          onStart={startKidMode}
          onCancel={() => setShowScreenTimeSetup(false)}
        />
      )}
    </div>
  );
}

export function ProfileSheet({ open, onOpenChange }: SheetProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  function close() {
    onOpenChange(false);
  }

  useEffect(() => {
    if (!open || !isDesktop) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, open]);

  if (isMobile) return null;

  return (
    <>
      {isDesktop ? (
        open && (
          <>
            <button
              type="button"
              aria-label="Close profile menu"
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              onClick={close}
            />
            <div className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-50 px-4 md:px-7">
              <div className="mx-auto flex max-w-6xl justify-end">
                <div className="pointer-events-auto flex max-h-[calc(100vh-6rem)] w-96 flex-col overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-[var(--background)] shadow-[0_24px_64px_rgba(58,46,40,0.18)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
                  <ProfileContent onClose={close} />
                </div>
              </div>
            </div>
          </>
        )
      ) : (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="right" className="flex w-80 flex-col gap-0 bg-[var(--background)] p-0 data-[state=closed]:duration-300 data-[state=open]:duration-300">
            <ProfileContent onClose={close} />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
