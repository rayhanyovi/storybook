import type { RequestHandler } from 'express';
import {
  listBooks,
  getBook,
  getBookContent,
  adminGetBookContent,
  adminCreateBook,
  adminUpdateBook,
  adminUpdateBookContent,
  adminArchiveBook,
  updateReadingProgress
} from './books.service.js';
import { readingProgressSchema, listBooksSchema } from './books.schema.js';
import type { CreateBookBody, UpdateBookBody, UpdateBookContentBody } from './books.schema.js';

export const listBooksHandler: RequestHandler = async (req, res, next) => {
  try {
    const query = listBooksSchema.parse(req.query);
    const result = await listBooks(req.user, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBookHandler: RequestHandler = async (req, res, next) => {
  try {
    const book = await getBook(req.user, req.params['id'] as string);
    res.json(book);
  } catch (err) {
    next(err);
  }
};

export const getBookContentHandler: RequestHandler = async (req, res, next) => {
  try {
    const content = await getBookContent(req.user, req.params['id'] as string);
    res.json(content);
  } catch (err) {
    next(err);
  }
};

export const createBookHandler: RequestHandler = async (req, res, next) => {
  try {
    const book = await adminCreateBook(req.body as CreateBookBody);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

export const adminGetBookContentHandler: RequestHandler = async (req, res, next) => {
  try {
    const content = await adminGetBookContent(req.user, req.params['id'] as string);
    res.json(content);
  } catch (err) {
    next(err);
  }
};

export const updateBookHandler: RequestHandler = async (req, res, next) => {
  try {
    const book = await adminUpdateBook(req.params['id'] as string, req.body as UpdateBookBody);
    res.json(book);
  } catch (err) {
    next(err);
  }
};

export const adminUpdateBookContentHandler: RequestHandler = async (req, res, next) => {
  try {
    const content = await adminUpdateBookContent(req.params['id'] as string, req.body as UpdateBookContentBody);
    res.json(content);
  } catch (err) {
    next(err);
  }
};

export const archiveBookHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await adminArchiveBook(req.params['id'] as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateReadingProgressHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = readingProgressSchema.parse(req.body);
    const result = await updateReadingProgress(req.user, req.params['id'] as string, body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
