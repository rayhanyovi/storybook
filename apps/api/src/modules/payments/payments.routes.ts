import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { subscribeSchema, purchaseSchema } from './payments.schema.js';
import { subscribe, purchase } from './payments.service.js';

export const paymentsRouter = Router();

paymentsRouter.use(authenticate);

paymentsRouter.post('/subscribe', validate(subscribeSchema), async (req, res, next) => {
  try {
    const result = await subscribe(req.user, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post('/purchase', validate(purchaseSchema), async (req, res, next) => {
  try {
    const result = await purchase(req.user, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
