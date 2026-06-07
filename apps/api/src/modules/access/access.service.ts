import type { AccessResult } from '@storybook/shared';
import { prisma } from '../../lib/prisma.js';
import type { JwtPayload } from '../../middleware/auth.js';

type BookLike = { id: string; priceCents: number };

const ownsBook = (userId: string, bookId: string) =>
  prisma.purchase
    .findUnique({ where: { userId_bookId: { userId, bookId } } })
    .then(Boolean);

const hasActiveSub = (userId: string) =>
  prisma.subscription
    .findFirst({
      where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } }
    })
    .then(Boolean);

export async function resolveAccess(
  user: JwtPayload,
  book: BookLike
): Promise<AccessResult> {
  if (user.role === 'ADMIN') return { canAccess: true, reason: 'ADMIN' };
  if (book.priceCents === 0) return { canAccess: true, reason: 'FREE' };
  if (await ownsBook(user.sub, book.id)) return { canAccess: true, reason: 'OWNED' };
  if (await hasActiveSub(user.sub)) return { canAccess: true, reason: 'SUBSCRIPTION' };
  return { canAccess: false, reason: 'LOCKED' };
}
