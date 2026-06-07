import { useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onProfileOpen: () => void;
}

export function BottomTabBar({ onProfileOpen }: Props) {
  const { pathname } = useLocation();

  const tabs = [
    { to: '/', icon: Home, label: 'Discover', match: pathname === '/' },
    { to: '/library', icon: BookOpen, label: 'Library', match: pathname === '/library' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-[var(--color-primary)] flex z-20">
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
      <button
        onClick={onProfileOpen}
        className="flex-1 flex flex-col items-center gap-0.5 py-3 text-white/60 hover:text-white/90 transition-all"
      >
        <User className="w-6 h-6" strokeWidth={1.8} />
        <span className="text-[10px] font-[family-name:var(--font-body)] font-semibold">Profile</span>
      </button>
    </nav>
  );
}
