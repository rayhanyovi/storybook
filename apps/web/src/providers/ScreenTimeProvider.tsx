import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useMode } from '@/providers/ModeProvider';

const SCREEN_TIME_KEY = 'storybook_screen_time';

interface StoredScreenTime {
  expiresAt: number;
}

interface ScreenTimeContextValue {
  isActive: boolean;
  isExpired: boolean;
  remainingSeconds: number;
  startKidSession: (minutes: number) => void;
  clearKidSession: () => void;
}

const ScreenTimeContext = createContext<ScreenTimeContextValue | null>(null);

function readStoredSession(): StoredScreenTime | null {
  const raw = localStorage.getItem(SCREEN_TIME_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredScreenTime;
    return Number.isFinite(parsed.expiresAt) ? parsed : null;
  } catch {
    return null;
  }
}

export function ScreenTimeProvider({ children }: { children: React.ReactNode }) {
  const { isKid } = useMode();
  const [expiresAt, setExpiresAt] = useState<number | null>(() => readStoredSession()?.expiresAt ?? null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      localStorage.removeItem(SCREEN_TIME_KEY);
      return;
    }
    localStorage.setItem(SCREEN_TIME_KEY, JSON.stringify({ expiresAt }));
  }, [expiresAt]);

  const remainingSeconds = Math.max(0, Math.ceil(((expiresAt ?? now) - now) / 1000));
  const isActive = isKid && expiresAt !== null;
  const isExpired = isActive && remainingSeconds <= 0;

  const value = useMemo<ScreenTimeContextValue>(() => ({
    isActive,
    isExpired,
    remainingSeconds,
    startKidSession: (minutes: number) => {
      const safeMinutes = Math.max(1, Math.min(180, Math.round(minutes)));
      setExpiresAt(Date.now() + safeMinutes * 60_000);
      setNow(Date.now());
    },
    clearKidSession: () => setExpiresAt(null)
  }), [isActive, isExpired, remainingSeconds]);

  return (
    <ScreenTimeContext.Provider value={value}>
      {children}
    </ScreenTimeContext.Provider>
  );
}

export function useScreenTime() {
  const ctx = useContext(ScreenTimeContext);
  if (!ctx) throw new Error('useScreenTime must be used within ScreenTimeProvider');
  return ctx;
}
