import type { RequestHandler } from 'express';
import type { UserDTO } from '@storybook/shared';
import { AppError } from '../lib/errors.js';

export function requireRole(...roles: UserDTO['role'][]): RequestHandler {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
}
