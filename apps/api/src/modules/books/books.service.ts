import type { AdminBookContentDTO, BookDTO, BookWithAccess, BookContent, CategoryDTO } from '@storybook/shared';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';
import { resolveAccess } from '../access/access.service.js';
import type { JwtPayload } from '../../middleware/auth.js';
import type { BookWithCategories } from './books.repository.js';
import {
  findBooks,
  findBookById,
  findBookEngagement,
  findBookPages,
  createBook,
  updateBook,
  updateBookContent,
  archiveBook
} from './books.repository.js';
import { prisma } from '../../lib/prisma.js';
import type { ListBooksQuery, CreateBookBody, UpdateBookBody, UpdateBookContentBody, ReadingProgressBody } from './books.schema.js';

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

export async function listBooks(user: JwtPayload, query: ListBooksQuery) {
  const { data, total } = await findBooks(user, query);
  const engagementByBook = await findBookEngagement(user.sub, data.map(book => book.id));
  const booksWithAccess = await Promise.all(
    data.map(async book => {
      const engagement = engagementByBook.get(book.id);
      return {
        ...toBookDTO(book),
        access: await resolveAccess(user, book),
        currentPage: engagement?.currentPage ?? 1,
        readCount: engagement?.readCount ?? 0,
        lastReadAt: engagement?.lastReadAt?.toISOString() ?? null
      };
    })
  );
  return { data: booksWithAccess, page: query.page, limit: query.limit, total };
}

export async function getBook(user: JwtPayload, id: string) {
  const book = await findBookById(id, user);
  if (!book) throw new NotFoundError('Book not found');
  const engagement = (await findBookEngagement(user.sub, [book.id])).get(book.id);
  return {
    ...toBookDTO(book),
    access: await resolveAccess(user, book),
    currentPage: engagement?.currentPage ?? 1,
    readCount: engagement?.readCount ?? 0,
    lastReadAt: engagement?.lastReadAt?.toISOString() ?? null
  };
}

export async function getBookContent(user: JwtPayload, id: string): Promise<BookContent> {
  const book = await findBookById(id, user);
  if (!book) throw new NotFoundError('Book not found');

  const access = await resolveAccess(user, book);
  if (!access.canAccess) throw new ForbiddenError('Access denied');

  const storedPages = await findBookPages(book.id);
  const storedPageByIndex = new Map(storedPages.map(page => [page.index, page]));

  const pages = Array.from({ length: book.pageCount }, (_, i) => ({
    index: i + 1,
    imageSlot: storedPageByIndex.get(i + 1)?.imageSlot ?? `book.page.${book.slug}.${i + 1}`,
    label: `page - ${book.title} #${i + 1}`,
    text: storedPageByIndex.get(i + 1)?.text ?? ''
  }));

  return { bookId: book.id, pages };
}

export async function adminGetBookContent(user: JwtPayload, id: string): Promise<AdminBookContentDTO> {
  const book = await findBookById(id, user);
  if (!book) throw new NotFoundError('Book not found');

  const storedPages = await findBookPages(book.id);
  const storedPageByIndex = new Map(storedPages.map(page => [page.index, page]));
  const pages = Array.from({ length: book.pageCount }, (_, i) => ({
    index: i + 1,
    imageSlot: storedPageByIndex.get(i + 1)?.imageSlot ?? `book.page.${book.slug}.${i + 1}`,
    label: `page - ${book.title} #${i + 1}`,
    text: storedPageByIndex.get(i + 1)?.text ?? ''
  }));

  return {
    bookId: book.id,
    coverSlot: book.coverSlot,
    pageCount: book.pageCount,
    pages
  };
}

export async function adminCreateBook(body: CreateBookBody): Promise<BookDTO> {
  const book = await createBook(body);
  return toBookDTO(book);
}

export async function adminUpdateBook(id: string, body: UpdateBookBody): Promise<BookDTO> {
  const book = await updateBook(id, body);
  return toBookDTO(book);
}

export async function adminUpdateBookContent(id: string, body: UpdateBookContentBody): Promise<AdminBookContentDTO> {
  const book = await updateBookContent(id, body);
  const pages = await findBookPages(book.id);
  const pageByIndex = new Map(pages.map(page => [page.index, page]));

  return {
    bookId: book.id,
    coverSlot: book.coverSlot,
    pageCount: book.pageCount,
    pages: Array.from({ length: book.pageCount }, (_, i) => ({
      index: i + 1,
      imageSlot: pageByIndex.get(i + 1)?.imageSlot ?? `book.page.${book.slug}.${i + 1}`,
      label: `page - ${book.title} #${i + 1}`,
      text: pageByIndex.get(i + 1)?.text ?? ''
    }))
  };
}

export async function adminArchiveBook(id: string) {
  const book = await archiveBook(id);
  return { id: book.id, status: 'ARCHIVED' as const };
}

export async function updateReadingProgress(user: JwtPayload, id: string, body: ReadingProgressBody) {
  const book = await findBookById(id, user);
  if (!book) throw new NotFoundError('Book not found');

  const access = await resolveAccess(user, book);
  if (!access.canAccess) throw new ForbiddenError('Access denied');

  const now = new Date();
  const currentPage = Math.min(body.currentPage, book.pageCount);

  const progress = await prisma.readingProgress.upsert({
    where: { userId_bookId: { userId: user.sub, bookId: book.id } },
    update: {
      currentPage,
      readCount: body.completed ? { increment: 1 } : undefined,
      lastReadAt: now
    },
    create: {
      userId: user.sub,
      bookId: book.id,
      currentPage,
      readCount: body.completed ? 1 : 0,
      lastReadAt: now
    }
  });

  return {
    bookId: book.id,
    currentPage: progress.currentPage,
    readCount: progress.readCount,
    lastReadAt: progress.lastReadAt.toISOString()
  };
}
