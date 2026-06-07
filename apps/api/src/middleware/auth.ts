import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { UserDTO } from '@storybook/shared';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export interface JwtPayload {
  sub: string;
  role: UserDTO['role'];
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing or invalid token'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
};
