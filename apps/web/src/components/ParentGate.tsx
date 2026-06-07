import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockKeyhole } from 'lucide-react';
import { Mascot } from './Mascot';
import { ChunkyButton } from './ChunkyButton';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { usePin } from '@/providers/PinProvider';
import { useMode } from '@/providers/ModeProvider';

interface ParentGateProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ParentGate({ onSuccess, onCancel }: ParentGateProps) {
  const { verifyPin } = usePin();
  const { setMode } = useMode();
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);

  function handleChange(v: string) {
    setValue(v);
    if (v.length === 4) {
      if (verifyPin(v)) {
        setMode('parent');
        onSuccess();
      } else {
        setShake(true);
        setTimeout(() => { setShake(false); setValue(''); }, 600);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--background)]/96 p-6 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center gap-7 rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-6 text-center shadow-[0_24px_64px_rgba(58,46,40,0.18)]">
      <Mascot pose="locked" size="lg" speech="Ask a grown-up" />
      <div>
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--primary)]">
          <LockKeyhole className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <h2 className="font-[family-name:var(--font-display)] font-semibold text-2xl text-[var(--ink)]">Parent mode</h2>
        <p className="text-[var(--ink-soft)] font-[family-name:var(--font-body)] mt-1 font-semibold">Enter the 4-digit PIN</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={shake ? 'shake' : 'idle'}
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <InputOTP maxLength={4} value={value} onChange={handleChange}>
            <InputOTPGroup>
              {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="w-14 h-14 text-xl" />)}
            </InputOTPGroup>
          </InputOTP>
        </motion.div>
      </AnimatePresence>
      {shake && (
        <p className="text-sm font-[family-name:var(--font-body)] text-[var(--destructive)]">
          Wrong PIN. Try again.
        </p>
      )}
      {onCancel && (
        <ChunkyButton variant="secondary" size="sm" onClick={onCancel}>Cancel</ChunkyButton>
      )}
      </div>
    </div>
  );
}
