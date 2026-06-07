import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError, PaymentFailedError } from '../../lib/errors.js';
import type { JwtPayload } from '../../middleware/auth.js';
import type { SubscribeBody, PurchaseBody } from './payments.schema.js';

export async function subscribe(user: JwtPayload, body: SubscribeBody) {
  if (body.simulate === 'fail') {
    await prisma.payment.create({
      data: {
        userId: user.sub,
        type: 'SUBSCRIPTION',
        amountCents: 49000,
        currency: 'IDR',
        status: 'FAILED',
        idempotencyKey: body.idempotencyKey
      }
    });
    throw new PaymentFailedError('Payment simulation failed');
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const [subscription, payment] = await prisma.$transaction(async tx => {
    const sub = await tx.subscription.create({
      data: {
        userId: user.sub,
        status: 'ACTIVE',
        plan: 'MONTHLY',
        expiresAt
      }
    });

    const pay = await tx.payment.create({
      data: {
        userId: user.sub,
        type: 'SUBSCRIPTION',
        amountCents: 49000,
        currency: 'IDR',
        status: 'SUCCEEDED',
        idempotencyKey: body.idempotencyKey
      }
    });

    return [sub, pay];
  });

  return {
    subscription: { status: subscription.status, expiresAt: subscription.expiresAt.toISOString() },
    payment
  };
}

export async function purchase(user: JwtPayload, body: PurchaseBody) {
  const book = await prisma.book.findUnique({ where: { id: body.bookId } });
  if (!book) throw new NotFoundError('Book not found');

  if (book.status !== 'PUBLISHED') {
    throw new ConflictError('Book is not available for purchase');
  }

  // idempotent — return existing purchase if already owned
  const existing = await prisma.purchase.findUnique({
    where: { userId_bookId: { userId: user.sub, bookId: body.bookId } }
  });
  if (existing) {
    const existingPayment = await prisma.payment.findFirst({
      where: { userId: user.sub, type: 'BOOK_PURCHASE', referenceId: book.id }
    });
    return { purchase: existing, payment: existingPayment };
  }

  if (body.simulate === 'fail') {
    await prisma.payment.create({
      data: {
        userId: user.sub,
        type: 'BOOK_PURCHASE',
        amountCents: book.priceCents,
        currency: book.currency,
        status: 'FAILED',
        referenceId: book.id,
        idempotencyKey: body.idempotencyKey
      }
    });
    throw new PaymentFailedError('Payment simulation failed');
  }

  const [newPurchase, payment] = await prisma.$transaction(async tx => {
    const p = await tx.purchase.create({
      data: { userId: user.sub, bookId: body.bookId, pricePaidCents: book.priceCents }
    });

    const pay = await tx.payment.create({
      data: {
        userId: user.sub,
        type: 'BOOK_PURCHASE',
        amountCents: book.priceCents,
        currency: book.currency,
        status: 'SUCCEEDED',
        referenceId: book.id,
        idempotencyKey: body.idempotencyKey
      }
    });

    return [p, pay];
  });

  return { purchase: newPurchase, payment };
}
