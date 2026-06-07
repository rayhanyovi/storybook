import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { NotFoundError } from './lib/errors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { booksRouter } from './modules/books/books.routes.js';
import { paymentsRouter } from './modules/payments/payments.routes.js';
import { libraryRouter } from './modules/library/library.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/me/library', libraryRouter);
app.use('/api/categories', categoriesRouter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

app.use(errorHandler);
