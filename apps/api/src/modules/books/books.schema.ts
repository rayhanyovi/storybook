import { z } from 'zod';

export const listBooksSchema = z.object({
  category: z.string().optional(),
  ageMin: z.coerce.number().int().min(0).optional(),
  ageMax: z.coerce.number().int().min(0).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const bookStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const createBookSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().default(''),
  coverSlot: z.string().nullable().optional(),
  priceCents: z.number().int().min(0).default(0),
  ageMin: z.number().int().min(0).default(0),
  ageMax: z.number().int().min(0).default(12),
  pageCount: z.number().int().min(1).default(6),
  status: bookStatusEnum.default('DRAFT'),
  categoryIds: z.array(z.string()).default([])
});

export const updateBookSchema = createBookSchema.partial().omit({ slug: true });

export const updateBookContentSchema = z.object({
  coverSlot: z.string().nullable().optional(),
  pageCount: z.number().int().min(1).max(50),
  pages: z.array(z.object({
    index: z.number().int().min(1),
    imageSlot: z.string().nullable().optional(),
    text: z.string().default('')
  })).default([])
});

export type ListBooksQuery = z.infer<typeof listBooksSchema>;
export type CreateBookBody = z.infer<typeof createBookSchema>;
export type UpdateBookBody = z.infer<typeof updateBookSchema>;
export type UpdateBookContentBody = z.infer<typeof updateBookContentSchema>;
