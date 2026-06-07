import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { prisma } from '../../lib/prisma.js';
import type { BookDTO, CategoryDTO } from '@storybook/shared';
import type { Prisma } from '@prisma/client';

export const libraryRouter = Router();

libraryRouter.use(authenticate);

libraryRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const sub = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: 'desc' }
    });

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: { book: { include: { categories: true } } }
    });

    type PurchaseWithBook = Prisma.PurchaseGetPayload<{ include: { book: { include: { categories: true } } } }>;

    const owned: BookDTO[] = purchases.map((p: PurchaseWithBook) => ({
      id: p.book.id,
      slug: p.book.slug,
      title: p.book.title,
      author: p.book.author,
      description: p.book.description,
      coverSlot: p.book.coverSlot,
      priceCents: p.book.priceCents,
      currency: p.book.currency,
      ageMin: p.book.ageMin,
      ageMax: p.book.ageMax,
      pageCount: p.book.pageCount,
      status: p.book.status as BookDTO['status'],
      categories: p.book.categories as CategoryDTO[]
    }));

    res.json({
      subscription: sub
        ? { status: sub.status, expiresAt: sub.expiresAt.toISOString() }
        : null,
      owned,
      hasActiveSub: !!sub
    });
  } catch (err) {
    next(err);
  }
});
