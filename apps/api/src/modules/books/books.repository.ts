import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type { ListBooksQuery } from './books.schema.js';
import type { JwtPayload } from '../../middleware/auth.js';

const bookInclude = { categories: true } satisfies Prisma.BookInclude;

export type BookWithCategories = Prisma.BookGetPayload<{ include: typeof bookInclude }>;
export type BookEngagement = {
  bookId: string;
  currentPage: number;
  readCount: number;
  lastReadAt: Date | null;
};

function buildVisibilityWhere(user: JwtPayload): Prisma.BookWhereInput {
  if (user.role === 'ADMIN') return {};
  return {
    OR: [
      { status: 'PUBLISHED' },
      { purchases: { some: { userId: user.sub } } }
    ]
  };
}

export async function findBooks(user: JwtPayload, query: ListBooksQuery) {
  const { category, ageMin, ageMax, q, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.BookWhereInput = {
    AND: [
      buildVisibilityWhere(user),
      category ? { categories: { some: { slug: category } } } : {},
      ageMin !== undefined ? { ageMin: { gte: ageMin } } : {},
      ageMax !== undefined ? { ageMax: { lte: ageMax } } : {},
      q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { author: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {}
    ]
  };

  const [data, total] = await Promise.all([
    prisma.book.findMany({ where, include: bookInclude, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.book.count({ where })
  ]);

  return { data, total };
}

export async function findBookById(id: string, user: JwtPayload) {
  const where: Prisma.BookWhereInput = {
    id,
    ...buildVisibilityWhere(user)
  };
  return prisma.book.findFirst({ where, include: bookInclude });
}

export async function findBookEngagement(userId: string, bookIds: string[]): Promise<Map<string, BookEngagement>> {
  if (bookIds.length === 0) return new Map();

  const progress = await prisma.readingProgress.findMany({
    where: { userId, bookId: { in: bookIds } },
    select: { bookId: true, currentPage: true, readCount: true, lastReadAt: true }
  });
  const progressByBook = new Map(progress.map(item => [item.bookId, item]));

  return new Map(
    bookIds.map(bookId => {
      const item = progressByBook.get(bookId);
      return [
        bookId,
        {
          bookId,
          currentPage: item?.currentPage ?? 1,
          readCount: item?.readCount ?? 0,
          lastReadAt: item?.lastReadAt ?? null
        }
      ];
    })
  );
}

export async function findBookPages(bookId: string) {
  return prisma.bookPage.findMany({
    where: { bookId },
    orderBy: { index: 'asc' }
  });
}

export async function createBook(data: {
  slug: string; title: string; author: string; description: string;
  coverSlot?: string | null; priceCents: number; ageMin: number; ageMax: number;
  pageCount: number; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; categoryIds: string[];
}) {
  const { categoryIds, ...rest } = data;
  return prisma.book.create({
    data: {
      ...rest,
      categories: { connect: categoryIds.map(id => ({ id })) }
    },
    include: bookInclude
  });
}

export async function updateBook(id: string, data: {
  title?: string; author?: string; description?: string; coverSlot?: string | null;
  priceCents?: number; ageMin?: number; ageMax?: number; pageCount?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; categoryIds?: string[];
}) {
  const { categoryIds, ...rest } = data;
  return prisma.book.update({
    where: { id },
    data: {
      ...rest,
      ...(categoryIds !== undefined
        ? { categories: { set: categoryIds.map(id => ({ id })) } }
        : {})
    },
    include: bookInclude
  });
}

export async function updateBookContent(id: string, data: {
  coverSlot?: string | null;
  pageCount: number;
  pages: { index: number; imageSlot?: string | null; text: string }[];
}) {
  return prisma.$transaction(async tx => {
    const pagesByIndex = new Map(
      data.pages
        .filter(page => page.index >= 1 && page.index <= data.pageCount)
        .map(page => [page.index, page])
    );

    const book = await tx.book.update({
      where: { id },
      data: {
        ...(data.coverSlot !== undefined ? { coverSlot: data.coverSlot } : {}),
        pageCount: data.pageCount
      },
      include: bookInclude
    });

    await tx.bookPage.deleteMany({
      where: {
        bookId: id,
        index: { gt: data.pageCount }
      }
    });

    await Promise.all(
      Array.from(pagesByIndex.values()).map(page =>
        tx.bookPage.upsert({
          where: { bookId_index: { bookId: id, index: page.index } },
          update: {
            imageSlot: page.imageSlot ?? null,
            text: page.text
          },
          create: {
            bookId: id,
            index: page.index,
            imageSlot: page.imageSlot ?? null,
            text: page.text
          }
        })
      )
    );

    return book;
  });
}

export async function archiveBook(id: string) {
  return prisma.book.update({
    where: { id },
    data: { status: 'ARCHIVED' },
    include: bookInclude
  });
}
