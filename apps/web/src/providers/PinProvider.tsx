import { createContext, useContext } from 'react';

// DEMO-only: PIN is stored in localStorage as plain text.
// REAL: hash server-side and pair with biometric/platform controls.
const DEMO_PIN = '1234';
const PIN_KEY = 'storybook_pin';

interface PinContextValue {
  hasPin: () => boolean;
  savePin: (pin: string) => void;
  verifyPin: (input: string) => boolean;
  clearPin: () => void;
}

const PinContext = createContext<PinContextValue | null>(null);

export function PinProvider({ children }: { children: React.ReactNode }) {
  const hasPin = () => Boolean(localStorage.getItem(PIN_KEY));
  const savePin = (pin: string) => localStorage.setItem(PIN_KEY, pin || DEMO_PIN);
  const verifyPin = (input: string) => input === (localStorage.getItem(PIN_KEY) ?? DEMO_PIN);
  const clearPin = () => localStorage.removeItem(PIN_KEY);

  return (
    <PinContext.Provider value={{ hasPin, savePin, verifyPin, clearPin }}>
      {children}
    </PinContext.Provider>
  );
}

export function usePin() {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error('usePin must be used within PinProvider');
  return ctx;
}
