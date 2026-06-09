import { useLocation, Link } from 'react-router-dom';
import { BookOpen, Clock3, Home, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMode } from '@/providers/ModeProvider';
import { useScreenTime } from '@/providers/ScreenTimeProvider';

export function BottomTabBar() {
  const { pathname } = useLocation();
  const { isKid } = useMode();
  const { isActive } = useScreenTime();

  const tabs = [
    { to: '/', icon: Home, label: 'Discover', match: pathname === '/' },
    { to: '/search', icon: Search, label: 'Search', match: pathname === '/search' },
    { to: '/library', icon: BookOpen, label: 'Library', match: pathname === '/library' },
    { to: '/profile', icon: User, label: 'Profile', match: pathname === '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 md:hidden">
      {isKid && isActive && (
        <div className="flex items-center justify-center gap-2 bg-[var(--secondary)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink)]">
          <Clock3 className="h-3.5 w-3.5" strokeWidth={2.4} />
          Rest timer on
        </div>
      )}
      <nav className="flex bg-[var(--color-primary)]">
        {tabs.map(tab => (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-3 transition-all',
              tab.match ? 'text-white' : 'text-white/60 hover:text-white/90'
            )}
          >
            <tab.icon className={cn('w-6 h-6', tab.match && 'drop-shadow-sm')} strokeWidth={tab.match ? 2.5 : 1.8} />
            <span className={cn('text-[10px] font-[family-name:var(--font-body)] font-semibold', tab.match && 'font-extrabold')}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
