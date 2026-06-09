import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, LockKeyhole, LogIn, Settings, Sparkles, UserPlus } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useMode } from '@/providers/ModeProvider';
import type { UserDTO } from '@storybook/shared';

interface LoginResponse { token: string; user: UserDTO; }
type AuthMode = 'login' | 'register';
type ProfileMode = 'kid' | 'parent' | 'admin';

const profiles: {
  label: string;
  hint: string;
  email: string;
  password: string;
  mode: ProfileMode;
  icon: typeof BookOpen;
}[] = [
  { label: 'Kid', hint: 'Safe reader view', email: 'parent@demo.com', password: 'password', mode: 'kid', icon: BookOpen },
  { label: 'Parent', hint: 'PIN-protected', email: 'parent@demo.com', password: 'password', mode: 'parent', icon: LockKeyhole },
  { label: 'Admin', hint: 'Catalog tools', email: 'admin@demo.com', password: 'password', mode: 'admin', icon: Settings }
];

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setMode } = useMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const isRegister = mode === 'register';

  function routeAfterLogin(user: UserDTO, targetMode: ProfileMode) {
    if (user.role === 'ADMIN' || targetMode === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    if (!user.onboardingCompletedAt) {
      setMode('kid');
      navigate('/onboarding', { replace: true });
      return;
    }

    if (targetMode === 'parent') {
      setMode('kid');
      navigate('/parent', { replace: true });
      return;
    }

    setMode('kid');
    navigate('/', { replace: true });
  }

  async function handleLogin(e?: React.FormEvent, prefillEmail?: string, prefillPassword?: string, targetMode: ProfileMode = 'kid') {
    e?.preventDefault();
    const loginEmail = prefillEmail ?? email;
    const loginPassword = prefillPassword ?? password;
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    try {
      const { token, user } = await api.post<LoginResponse>('/auth/login', { email: loginEmail, password: loginPassword });
      login(token, user);
      routeAfterLogin(user, targetMode);
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!registerEmail || !registerPassword) {
      toast.error('Enter an email and password to register.');
      return;
    }
    if (registerPassword !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    toast.info('Sign-ups are mocked in this demo. Use a demo profile on the login page to explore everything.');
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--background)] px-5 py-8 md:px-10 md:py-10 lg:px-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] md:items-center">
        <section className="flex flex-col items-center gap-8 text-center md:items-start md:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-[0_8px_18px_rgba(242,96,58,0.28)]">
              <BookOpen className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-none text-[var(--ink)]">Storybook</p>
              <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">Paid digital library MVP</p>
            </div>
          </div>

          <Mascot pose="hero" size="lg" className="justify-self-center" />

          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
            A cozy library children can browse safely.
          </h1>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col gap-4">
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_48px_rgba(58,46,40,0.12)] sm:p-6">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${isRegister ? 'bg-[var(--secondary)]/30 text-[var(--ink)]' : 'bg-[var(--primary)]/12 text-[var(--primary)]'}`}>
                {isRegister ? <UserPlus className="h-5 w-5" strokeWidth={2.4} /> : <LogIn className="h-5 w-5" strokeWidth={2.4} />}
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-none text-[var(--ink)]">
                  {isRegister ? 'Create an account' : 'Welcome back'}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">
                  {isRegister ? 'New here? Start with a parent profile.' : 'Sign in to your library.'}
                </p>
              </div>
            </div>

            {isRegister ? (
              <form onSubmit={handleRegister} className="mt-5 flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-name" className="font-[family-name:var(--font-body)] text-sm font-bold text-[var(--ink)]">Name</Label>
                  <Input id="reg-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-email" className="font-[family-name:var(--font-body)] text-sm font-bold text-[var(--ink)]">Email</Label>
                  <Input id="reg-email" type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reg-password" className="font-[family-name:var(--font-body)] text-sm font-bold text-[var(--ink)]">Password</Label>
                    <Input id="reg-password" type="password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} placeholder="Create a password" className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reg-confirm" className="font-[family-name:var(--font-body)] text-sm font-bold text-[var(--ink)]">Confirm</Label>
                    <Input id="reg-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]" />
                  </div>
                </div>
                <ChunkyButton type="submit" variant="secondary" size="lg" className="mt-1 w-full">
                  <UserPlus className="h-4 w-4" />
                  Create account
                </ChunkyButton>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="font-[family-name:var(--font-body)] text-sm font-bold text-[var(--ink)]">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="parent@demo.com" className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password" className="font-[family-name:var(--font-body)] text-sm font-bold text-[var(--ink)]">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]" />
                </div>
                <ChunkyButton type="submit" disabled={loading} size="lg" className="mt-1 w-full">
                  {loading ? 'Signing in' : 'Sign in'}
                </ChunkyButton>
              </form>
            )}

            <div className="mt-5 rounded-2xl bg-[var(--muted)] px-4 py-3 text-center">
              <p className="text-sm font-bold text-[var(--ink-soft)]">
                {isRegister ? 'Already have an account?' : 'New here?'}{' '}
                <Link to={isRegister ? '/auth/login' : '/auth/register'} className="text-[var(--primary)] underline-offset-4 hover:underline">
                  {isRegister ? 'Sign in' : 'Create a parent login'}
                </Link>
              </p>
            </div>
          </div>

          {!isRegister && (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--muted)] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">Open demo</h2>
              </div>
              <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">Jump straight in with a ready-made profile.</p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {profiles.map(profile => (
                  <button
                    key={profile.label}
                    onClick={() => handleLogin(undefined, profile.email, profile.password, profile.mode)}
                    disabled={loading}
                    className="flex min-h-[6.25rem] flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3 text-center transition hover:-translate-y-0.5 hover:bg-[var(--background)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    <profile.icon className="h-6 w-6 text-[var(--primary)]" strokeWidth={2.4} />
                    <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--ink)]">{profile.label}</span>
                    <span className="text-xs font-bold leading-tight text-[var(--ink-soft)]">{profile.hint}</span>
                  </button>
                ))}
              </div>

              <p className="mt-4 rounded-2xl bg-[var(--card)] px-4 py-3 text-center text-xs font-bold leading-relaxed text-[var(--ink-soft)]">
                Demo PIN: <span className="text-[var(--ink)]">1234</span> · Parent: <span className="text-[var(--ink)]">parent@demo.com</span> · Admin: <span className="text-[var(--ink)]">admin@demo.com</span>
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
