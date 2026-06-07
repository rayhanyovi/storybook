import { createContext, useContext, useState } from 'react';

type Mode = 'kid' | 'parent';

interface ModeContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isKid: boolean;
  isParent: boolean;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('kid');

  return (
    <ModeContext.Provider
      value={{ mode, setMode, isKid: mode === 'kid', isParent: mode === 'parent' }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
