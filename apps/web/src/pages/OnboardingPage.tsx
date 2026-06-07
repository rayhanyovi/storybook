import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Baby, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { ChunkyButton } from '@/components/ChunkyButton';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { api } from '@/lib/api';
import { usePin } from '@/providers/PinProvider';
import { useAuth } from '@/providers/AuthProvider';

const TOTAL = 4;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { savePin } = usePin();
  const { setUser, user } = useAuth();
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [childName, setChildName] = useState('');
  const [ageRange, setAgeRange] = useState('3-5');
  const [loading, setLoading] = useState(false);

  const pinReady = pin.length === 4 && pinConfirm.length === 4 && pin === pinConfirm;

  function next() {
    setStep(s => Math.min(s + 1, TOTAL - 1));
  }

  function continueFromPin() {
    if (!pinReady) {
      toast.error(pin.length === 4 && pinConfirm.length === 4 ? 'PINs do not match' : 'Enter a 4-digit PIN');
      return;
    }
    next();
  }

  async function finish() {
    if (!pinReady) {
      toast.error('Set a matching 4-digit PIN first');
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      savePin(pin);
      const result = await api.post<{ onboardingCompletedAt: string }>('/auth/onboarding/complete');
      if (user) setUser({ ...user, onboardingCompletedAt: result.onboardingCompletedAt });
      if (childName) sessionStorage.setItem('childName', childName);
      sessionStorage.setItem('childAgeRange', ageRange);
      navigate('/');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    <div key="welcome" className="grid gap-7 md:grid-cols-[0.8fr_1fr] md:items-center">
      <Mascot pose="waving" size="lg" className="justify-self-center" />
      <div className="text-center md:text-left">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">Welcome</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
          Build a safe reading space first.
        </h1>
        <p className="mt-4 text-lg font-semibold leading-relaxed text-[var(--ink-soft)]">
          Storybook starts in kid mode, then asks a grown-up before any purchase or account action.
        </p>
        <ChunkyButton size="lg" onClick={next} className="mt-6">
          Let's start
        </ChunkyButton>
      </div>
    </div>,

    <div key="how" className="grid gap-6 md:grid-cols-[1fr_0.9fr] md:items-center">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">Two surfaces</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ink)]">Buyer and reader stay separate.</h2>
        <div className="mt-5 grid gap-3">
          {[
            { icon: Baby, title: 'Kid mode', desc: 'Large tap targets, accessible books, no checkout UI.' },
            { icon: LockKeyhole, title: 'Parent mode', desc: 'Subscription, book purchase, library status, and account controls.' }
          ].map(item => (
            <div key={item.title} className="flex gap-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_8px_18px_rgba(58,46,40,0.06)]">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--primary)]">
                <item.icon className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">{item.title}</h3>
                <p className="mt-1 text-sm font-semibold leading-snug text-[var(--ink-soft)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <ChunkyButton size="lg" onClick={next} className="mt-6">
          Got it
        </ChunkyButton>
      </div>
      <PlaceholderImage slot="mascot.onboarding" label="maskot kucing - onboarding #1" ratio="4/3" className="rounded-[1.5rem]" />
    </div>,

    <div key="pin" className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
      <Mascot pose="locked" size="md" speech="Parent PIN" />
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">Parent gate</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ink)]">Set a 4-digit PIN</h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--ink-soft)]">
          Demo reviewers can use 1234, but this setup accepts any four digits.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <p className="text-sm font-bold text-[var(--ink-soft)]">Enter PIN</p>
          <InputOTP maxLength={4} value={pin} onChange={setPin}>
            <InputOTPGroup>
              {[0, 1, 2, 3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-bold text-[var(--ink-soft)]">Confirm PIN</p>
          <InputOTP maxLength={4} value={pinConfirm} onChange={setPinConfirm}>
            <InputOTPGroup>
              {[0, 1, 2, 3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
      <ChunkyButton size="lg" onClick={continueFromPin} disabled={pin.length < 4 || pinConfirm.length < 4}>
        Set PIN
      </ChunkyButton>
    </div>,

    <div key="who" className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[0.9fr_1fr] md:items-center">
      <Mascot pose="reading" size="lg" className="justify-self-center" />
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">Reader profile</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ink)]">Who's reading today?</h2>
        <div className="mt-5 grid gap-4">
          <Input
            placeholder="Child's name (optional)"
            value={childName}
            onChange={e => setChildName(e.target.value)}
            className="h-14 rounded-2xl border-[var(--line)] bg-[var(--card)] text-lg"
          />
          <div className="grid grid-cols-3 gap-2">
            {['2-3', '3-5', '6-8'].map(range => (
              <button
                key={range}
                onClick={() => setAgeRange(range)}
                className={`min-h-[3.5rem] rounded-2xl border px-3 font-[family-name:var(--font-display)] font-semibold transition ${
                  ageRange === range
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                    : 'border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:bg-[var(--muted)]'
                }`}
              >
                Ages {range}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ChunkyButton variant="ghost" size="lg" onClick={finish} disabled={loading}>
            Skip
          </ChunkyButton>
          <ChunkyButton size="lg" onClick={finish} disabled={loading}>
            {loading ? 'Setting up' : 'Start reading'}
          </ChunkyButton>
        </div>
      </div>
    </div>
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] px-5 py-7">
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col">
        <div className="mb-8 flex items-center gap-3">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
              <div className={`h-full rounded-full bg-[var(--primary)] transition-all ${i <= step ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
          <div className="hidden items-center gap-2 rounded-full bg-[var(--card)] px-3 py-2 text-xs font-extrabold text-[var(--ink-soft)] shadow-sm sm:flex">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
            Step {step + 1} of {TOTAL}
          </div>
        </div>

        <main className="grid flex-1 place-items-center rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_18px_48px_rgba(58,46,40,0.1)] md:p-10">
          {steps[step]}
        </main>
      </div>
    </div>
  );
}
