import { z } from 'zod';

export const subscribeSchema = z.object({
  idempotencyKey: z.string().optional(),
  simulate: z.enum(['fail']).optional()
});

export const purchaseSchema = z.object({
  bookId: z.string().min(1),
  idempotencyKey: z.string().optional(),
  simulate: z.enum(['fail']).optional()
});

export type SubscribeBody = z.infer<typeof subscribeSchema>;
export type PurchaseBody = z.infer<typeof purchaseSchema>;
