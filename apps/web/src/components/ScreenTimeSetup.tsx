import { useState } from 'react';
import { Clock3, Minus, Plus } from 'lucide-react';
import { ChunkyButton } from '@/components/ChunkyButton';

interface ScreenTimeSetupProps {
  onStart: (minutes: number) => void;
  onCancel: () => void;
}

const presets = [15, 30, 60] as const;

export function ScreenTimeSetup({ onStart, onCancel }: ScreenTimeSetupProps) {
  const [minutes, setMinutes] = useState(15);

  function updateMinutes(next: number) {
    setMinutes(Math.max(1, Math.min(180, next)));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--background)]/96 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-6 text-center shadow-[0_24px_64px_rgba(58,46,40,0.18)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--secondary)]/35 text-[var(--ink)]">
          <Clock3 className="h-7 w-7" strokeWidth={2.4} />
        </div>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Set kid screen time</h2>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-[var(--ink-soft)]">
          Kid mode will wind down when the timer ends. A parent PIN is required to close it.
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => updateMinutes(minutes - 5)}
            className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--muted)] text-[var(--ink)]"
            aria-label="Decrease screen time"
          >
            <Minus className="h-5 w-5" />
          </button>
          <label className="min-w-32">
            <span className="sr-only">Screen time minutes</span>
            <input
              type="number"
              min={1}
              max={180}
              value={minutes}
              onChange={event => updateMinutes(Number(event.target.value))}
              className="h-16 w-full rounded-2xl border border-[var(--line)] bg-[var(--background)] text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ink)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
            />
          </label>
          <button
            type="button"
            onClick={() => updateMinutes(minutes + 5)}
            className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--muted)] text-[var(--ink)]"
            aria-label="Increase screen time"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {presets.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setMinutes(preset)}
              className={`min-h-11 rounded-2xl border text-sm font-extrabold transition ${
                minutes === preset
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--line)] bg-[var(--background)] text-[var(--ink-soft)] hover:bg-[var(--muted)]'
              }`}
            >
              {preset} min
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ChunkyButton variant="ghost" size="lg" onClick={onCancel}>Cancel</ChunkyButton>
          <ChunkyButton size="lg" onClick={() => onStart(minutes)}>Start kid mode</ChunkyButton>
        </div>
      </div>
    </div>
  );
}
