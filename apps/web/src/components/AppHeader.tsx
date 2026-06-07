import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Baby, BookOpen, ChevronLeft, LockKeyhole, User, type LucideIcon } from 'lucide-react';
import { ChunkyButton } from '@/components/ChunkyButton';
import { ParentGate } from '@/components/ParentGate';
import { ProfileSheet } from '@/components/ProfileSheet';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Switch } from '@/components/ui/switch';
import { useMode } from '@/providers/ModeProvider';
import { useLibrary } from '@/hooks/useBooks';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  active?: 'discover' | 'library';
  showBack?: boolean;
}

function navClass(isActive: boolean) {
  return isActive
    ? 'rounded-xl bg-[var(--primary)]/10 px-3 py-2 text-sm font-extrabold text-[var(--primary)]'
    : 'rounded-xl px-3 py-2 text-sm font-extrabold text-[var(--ink-soft)] transition hover:bg-[var(--muted)]';
}

export function AppHeader({ title, subtitle, icon: Icon = BookOpen, active, showBack }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isKid, setMode } = useMode();
  const { data: library } = useLibrary();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showGate, setShowGate] = useState(false);

  const childName = sessionStorage.getItem('childName');
  const resolvedTitle = title ?? (childName ? `${childName}'s Storybook` : 'Storybook');
  const resolvedSubtitle = subtitle ?? 'Digital library';
  const hasActiveSub = library?.hasActiveSub;

  function handleModeChange(next: boolean) {
    if (next) setMode('kid');
    else setShowGate(true);
  }

  function goSubscribe() {
    navigate(`/checkout?type=subscription&returnTo=${encodeURIComponent(location.pathname)}`);
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/92 px-4 py-3 backdrop-blur md:px-7">
        <div className="mx-auto flex max-w-6xl items-center gap-2 sm:gap-3">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--ink-soft)] transition hover:bg-[var(--line)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-[0_8px_18px_rgba(242,96,58,0.24)]">
              <Icon className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-[family-name:var(--font-display)] text-xl font-semibold leading-none text-[var(--ink)]">
                {resolvedTitle}
              </h1>
              <p className="mt-1 hidden text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)] sm:block">
                {resolvedSubtitle}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/" className={navClass(active === 'discover')}>Discover</Link>
            <Link to="/library" className={navClass(active === 'library')}>Library</Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-2.5 py-2 shadow-[0_8px_18px_rgba(58,46,40,0.06)] sm:gap-2.5 sm:px-3">
            {isKid ? (
              <Baby className="h-4 w-4 text-[var(--primary)]" strokeWidth={2.4} />
            ) : (
              <LockKeyhole className="h-4 w-4 text-[var(--primary)]" strokeWidth={2.4} />
            )}
            <span className="hidden text-xs font-extrabold text-[var(--ink-soft)] sm:inline">
              {isKid ? 'Kid' : 'Parent'}
            </span>
            <Switch
              checked={isKid}
              onCheckedChange={handleModeChange}
              aria-label={isKid ? 'Switch to parent mode' : 'Switch to kid mode'}
            />
          </div>

          {!isKid && !hasActiveSub && (
            <ChunkyButton size="sm" onClick={goSubscribe} className="hidden lg:inline-flex">
              Subscribe
            </ChunkyButton>
          )}

          <button
            onClick={() => setProfileOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--ink-soft)] transition hover:bg-[var(--line)]"
            aria-label="Open profile"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      <BottomTabBar onProfileOpen={() => setProfileOpen(true)} />
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />

      {showGate && (
        <ParentGate onSuccess={() => setShowGate(false)} onCancel={() => setShowGate(false)} />
      )}
    </>
  );
}
