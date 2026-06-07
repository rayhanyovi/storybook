import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveAccess } from '../src/modules/access/access.service.js';
import { prisma } from '../src/lib/prisma.js';
import type { JwtPayload } from '../src/middleware/auth.js';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    purchase: { findUnique: vi.fn() },
    subscription: { findFirst: vi.fn() }
  }
}));

const admin: JwtPayload = { sub: 'admin-1', role: 'ADMIN', email: 'admin@demo' };
const user: JwtPayload = { sub: 'user-1', role: 'USER', email: 'parent@demo' };

const freeBook = { id: 'book-free', priceCents: 0 };
const paidBook = { id: 'book-paid', priceCents: 15000 };

const noOwn = undefined;
const ownedPurchase = { id: 'purchase-1' };
const activeSub = { id: 'sub-1' };
const noSub = null;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('resolveAccess', () => {
  it('ADMIN always gets access with reason ADMIN', async () => {
    const result = await resolveAccess(admin, paidBook);
    expect(result).toEqual({ canAccess: true, reason: 'ADMIN' });
  });

  it('free book always gets access with reason FREE', async () => {
    const result = await resolveAccess(user, freeBook);
    expect(result).toEqual({ canAccess: true, reason: 'FREE' });
  });

  it('user who owns the book gets access with reason OWNED', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(ownedPurchase as never);
    const result = await resolveAccess(user, paidBook);
    expect(result).toEqual({ canAccess: true, reason: 'OWNED' });
  });

  it('OWNED is checked before SUBSCRIPTION', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(ownedPurchase as never);
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue(activeSub as never);
    const result = await resolveAccess(user, paidBook);
    expect(result.reason).toBe('OWNED');
    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
  });

  it('active subscription grants access with reason SUBSCRIPTION', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(noOwn as never);
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue(activeSub as never);
    const result = await resolveAccess(user, paidBook);
    expect(result).toEqual({ canAccess: true, reason: 'SUBSCRIPTION' });
  });

  it('no ownership, no active sub → LOCKED', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(noOwn as never);
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue(noSub as never);
    const result = await resolveAccess(user, paidBook);
    expect(result).toEqual({ canAccess: false, reason: 'LOCKED' });
  });

  it('expired sub without ownership → LOCKED', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(noOwn as never);
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue(noSub as never);
    const result = await resolveAccess(user, paidBook);
    expect(result).toEqual({ canAccess: false, reason: 'LOCKED' });
  });

  it('owned book even without sub → OWNED', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(ownedPurchase as never);
    const result = await resolveAccess(user, paidBook);
    expect(result).toEqual({ canAccess: true, reason: 'OWNED' });
    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
  });
});
