import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

export const categoriesRouter = Router();

categoriesRouter.use(authenticate);

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1)
});

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post('/', requireRole('ADMIN'), validate(createCategorySchema), async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});
