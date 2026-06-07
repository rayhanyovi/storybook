import { PlaceholderImage } from './PlaceholderImage';

type Pose = 'waving' | 'reading' | 'sleeping' | 'celebrating' | 'locked' | '404' | 'error' | 'loading';

const poseSlot: Record<Pose, { slot: string; label: string }> = {
  waving: { slot: 'mascot.login-welcome', label: 'maskot kucing - login welcome' },
  reading: { slot: 'mascot.loading', label: 'maskot kucing - loading' },
  sleeping: { slot: 'mascot.bedtime', label: 'maskot kucing - sleepy' },
  celebrating: { slot: 'mascot.reward', label: 'maskot kucing - reward celebrate' },
  locked: { slot: 'mascot.locked', label: 'maskot kucing - ask a grown-up' },
  '404': { slot: 'mascot.404', label: 'maskot kucing - page not found' },
  error: { slot: 'mascot.error', label: 'maskot kucing - error' },
  loading: { slot: 'mascot.loading', label: 'maskot kucing - loading' }
};

interface MascotProps {
  pose?: Pose;
  size?: 'sm' | 'md' | 'lg';
  speech?: string;
  className?: string;
}

const sizeClass = { sm: 'w-20', md: 'w-32', lg: 'w-48' };

export function Mascot({ pose = 'waving', size = 'md', speech, className }: MascotProps) {
  const { slot, label } = poseSlot[pose];
  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ''}`}>
      <PlaceholderImage slot={slot} label={label} ratio="1/1" className={sizeClass[size]} />
      {speech && (
        <div className="relative bg-white rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-[family-name:var(--font-body)] text-[var(--ink)] max-w-[200px] text-center shadow-sm">
          {speech}
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />
        </div>
      )}
    </div>
  );
}
