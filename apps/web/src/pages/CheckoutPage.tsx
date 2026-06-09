import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { BookOpen, CreditCard, Crown, Lock, ShieldCheck, X } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useBook, usePurchase, useSubscribe } from '@/hooks/useBooks';
import { useAuth } from '@/providers/AuthProvider';

const SUBSCRIPTION_PRICE = 49000;

function priceLabel(cents: number) {
  return `Rp ${cents.toLocaleString('id-ID')}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const purchase = usePurchase();
  const subscribe = useSubscribe();

  const type = params.get('type') === 'purchase' ? 'purchase' : 'subscription';
  const bookId = params.get('bookId') ?? '';
  const returnTo = params.get('returnTo') || '/';

  const { data: book, isLoading: bookLoading } = useBook(bookId, type === 'purchase');

  const [decline, setDecline] = useState(false);
  const [card, setCard] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12 / 34');
  const [cvc, setCvc] = useState('123');
  const [name, setName] = useState(user?.email?.split('@')[0] ?? 'Demo Parent');

  const pending = purchase.isPending || subscribe.isPending;
  const loadingSummary = type === 'purchase' && bookLoading;
  const amount = type === 'purchase' ? book?.priceCents ?? 0 : SUBSCRIPTION_PRICE;
  const itemTitle = type === 'purchase' ? book?.title ?? 'This book' : 'Storybook subscription';
  const itemDesc = type === 'purchase' ? 'One-time purchase · Own forever' : 'Monthly plan · 30 days, all books';

  async function handlePay(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const simulate = decline ? ('fail' as const) : undefined;
    try {
      if (type === 'purchase') {
        await purchase.mutateAsync({ bookId, simulate });
      } else {
        await subscribe.mutateAsync({ simulate });
      }
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      toast.success(type === 'purchase' ? `Payment complete. "${itemTitle}" is yours.` : 'Payment complete. Subscription is active.');
      navigate(returnTo, { replace: true });
    } catch {
      toast.error('Payment declined. Check the card details and try again.');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--line)] bg-[var(--card)] px-4 py-3 md:px-7">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-white shadow-[0_8px_18px_rgba(242,96,58,0.24)]">
              <BookOpen className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">Storybook</span>
            <span className="ml-1 rounded-full bg-[var(--color-warning)]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-warning)]">
              Test mode
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(returnTo)}
            aria-label="Cancel and go back"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--muted)] text-[var(--ink-soft)] transition hover:bg-[var(--line)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:px-7 md:py-12">
        <section className="order-2 md:order-1">
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              {type === 'purchase' ? 'Buy this book' : 'Subscribe'}
            </p>

            <div className="mt-4 flex items-center gap-4">
              {type === 'purchase' ? (
                loadingSummary ? (
                  <Skeleton className="h-24 w-[4.5rem] shrink-0 rounded-xl" />
                ) : (
                  <PlaceholderImage
                    slot={book?.coverSlot ?? `book.cover.${book?.slug ?? 'story'}`}
                    label={`cover - ${itemTitle}`}
                    ratio="4/3"
                    className="h-24 w-32 shrink-0 rounded-xl border-0"
                  />
                )
              ) : (
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--secondary)] text-[var(--ink)]">
                  <Crown className="h-8 w-8" strokeWidth={2.2} />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-[var(--ink)]">{itemTitle}</p>
                <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">{itemDesc}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-[var(--line)] pt-5">
              <div className="flex items-center justify-between text-sm font-bold text-[var(--ink-soft)]">
                <span>Subtotal</span>
                <span>{priceLabel(amount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-[var(--ink-soft)]">
                <span>Tax</span>
                <span>Rp 0</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">Total due</span>
                <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                  {priceLabel(amount)}
                  {type === 'subscription' && <span className="text-sm font-bold text-[var(--ink-soft)]"> /mo</span>}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[var(--muted)] px-4 py-3 text-xs font-bold leading-snug text-[var(--ink-soft)]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
              Mocked payment for this demo — no real card is charged.
            </div>
          </div>
        </section>

        <section className="order-1 md:order-2">
          <form onSubmit={handlePay} className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_14px_34px_rgba(58,46,40,0.08)] md:p-7">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Pay with card</h1>
            <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">Enter payment details to complete the order.</p>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="checkout-email" className="text-sm font-bold text-[var(--ink)]">Email</Label>
                <Input
                  id="checkout-email"
                  value={user?.email ?? ''}
                  readOnly
                  className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="checkout-card" className="text-sm font-bold text-[var(--ink)]">Card information</Label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                  <Input
                    id="checkout-card"
                    value={card}
                    inputMode="numeric"
                    onChange={event => setCard(event.target.value)}
                    className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)] pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    aria-label="Card expiry"
                    value={expiry}
                    placeholder="MM / YY"
                    onChange={event => setExpiry(event.target.value)}
                    className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]"
                  />
                  <Input
                    aria-label="Card CVC"
                    value={cvc}
                    placeholder="CVC"
                    inputMode="numeric"
                    onChange={event => setCvc(event.target.value)}
                    className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="checkout-name" className="text-sm font-bold text-[var(--ink)]">Name on card</Label>
                <Input
                  id="checkout-name"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  className="h-12 rounded-2xl border-[var(--line)] bg-[var(--background)]"
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--background)] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[var(--ink)]">Simulate a declined card</p>
                  <p className="text-xs font-bold text-[var(--ink-soft)]">Demo toggle to exercise the failure path.</p>
                </div>
                <Switch checked={decline} onCheckedChange={setDecline} aria-label="Simulate declined payment" />
              </div>

              <ChunkyButton type="submit" size="lg" className="mt-1 w-full" disabled={pending || loadingSummary}>
                <Lock className="h-5 w-5" />
                {pending ? 'Processing…' : `Pay ${priceLabel(amount)}`}
              </ChunkyButton>

              <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--ink-soft)]">
                <Lock className="h-3.5 w-3.5" />
                Secured demo checkout · powered by Storybook Pay
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
