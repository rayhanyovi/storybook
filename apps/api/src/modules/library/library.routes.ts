import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { prisma } from '../../lib/prisma.js';
import type { BookDTO, CategoryDTO } from '@storybook/shared';
import type { Prisma } from '@prisma/client';

export const libraryRouter = Router();

libraryRouter.use(authenticate);

type BookWithCategories = Prisma.BookGetPayload<{ include: { categories: true } }>;

function toBookDTO(book: BookWithCategories): BookDTO {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    description: book.description,
    coverSlot: book.coverSlot,
    priceCents: book.priceCents,
    currency: book.currency,
    ageMin: book.ageMin,
    ageMax: book.ageMax,
    pageCount: book.pageCount,
    status: book.status as BookDTO['status'],
    categories: book.categories as CategoryDTO[]
  };
}

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

    const readingProgress = await prisma.readingProgress.findMany({
      where: { userId },
      include: { book: { include: { categories: true } } },
      orderBy: { lastReadAt: 'desc' }
    });

    type PurchaseWithBook = Prisma.PurchaseGetPayload<{ include: { book: { include: { categories: true } } } }>;

    const owned: BookDTO[] = purchases.map((p: PurchaseWithBook) => toBookDTO(p.book));

    res.json({
      subscription: sub
        ? { status: sub.status, expiresAt: sub.expiresAt.toISOString() }
        : null,
      owned,
      readingProgress: readingProgress.map(item => ({
        book: toBookDTO(item.book),
        currentPage: item.currentPage,
        readCount: item.readCount,
        lastReadAt: item.lastReadAt.toISOString()
      })),
      favoriteBooks: [...readingProgress]
        .sort((a, b) => b.readCount - a.readCount || b.lastReadAt.getTime() - a.lastReadAt.getTime())
        .slice(0, 5)
        .map(item => ({
          book: toBookDTO(item.book),
          currentPage: item.currentPage,
          readCount: item.readCount,
          lastReadAt: item.lastReadAt.toISOString()
        })),
      hasActiveSub: !!sub
    });
  } catch (err) {
    next(err);
  }
});
