import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import { createBookSchema, updateBookContentSchema, updateBookSchema } from './books.schema.js';
import {
  listBooksHandler,
  getBookHandler,
  getBookContentHandler,
  createBookHandler,
  adminGetBookContentHandler,
  updateBookHandler,
  adminUpdateBookContentHandler,
  archiveBookHandler
} from './books.controller.js';

export const booksRouter = Router();

booksRouter.use(authenticate);

booksRouter.get('/', listBooksHandler);
booksRouter.get('/:id/admin-content', requireRole('ADMIN'), adminGetBookContentHandler);
booksRouter.get('/:id/content', getBookContentHandler);
booksRouter.get('/:id', getBookHandler);

booksRouter.post('/', requireRole('ADMIN'), validate(createBookSchema), createBookHandler);
booksRouter.put('/:id/admin-content', requireRole('ADMIN'), validate(updateBookContentSchema), adminUpdateBookContentHandler);
booksRouter.patch('/:id', requireRole('ADMIN'), validate(updateBookSchema), updateBookHandler);
booksRouter.delete('/:id', requireRole('ADMIN'), archiveBookHandler);
