import type { AdminBookContentDTO, BookDTO, BookWithAccess, BookContent, CategoryDTO } from '@storybook/shared';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';
import { resolveAccess } from '../access/access.service.js';
import type { JwtPayload } from '../../middleware/auth.js';
import type { BookWithCategories } from './books.repository.js';
import {
  findBooks,
  findBookById,
  findBookPages,
  createBook,
  updateBook,
  updateBookContent,
  archiveBook
} from './books.repository.js';
import type { ListBooksQuery, CreateBookBody, UpdateBookBody, UpdateBookContentBody } from './books.schema.js';

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
  const booksWithAccess: BookWithAccess[] = await Promise.all(
    data.map(async book => ({
      ...toBookDTO(book),
      access: await resolveAccess(user, book)
    }))
  );
  return { data: booksWithAccess, page: query.page, limit: query.limit, total };
}

export async function getBook(user: JwtPayload, id: string): Promise<BookWithAccess> {
  const book = await findBookById(id, user);
  if (!book) throw new NotFoundError('Book not found');
  return { ...toBookDTO(book), access: await resolveAccess(user, book) };
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
