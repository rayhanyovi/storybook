import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { loginSchema } from './auth.schema.js';
import { loginHandler, meHandler, onboardingCompleteHandler, resetDemoStateHandler } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), loginHandler);
authRouter.get('/me', authenticate, meHandler);
authRouter.post('/onboarding/complete', authenticate, requireRole('USER'), onboardingCompleteHandler);
// DEMO-only: resets the signed-in parent account for repeatable presentations.
authRouter.post('/demo/reset', authenticate, requireRole('USER'), resetDemoStateHandler);
