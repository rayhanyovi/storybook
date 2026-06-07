import type { RequestHandler } from 'express';
import { login, getMe, completeOnboarding } from './auth.service.js';
import type { LoginBody } from './auth.schema.js';

export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginBody;
    const result = await login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const meHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = await getMe(req.user.sub);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const onboardingCompleteHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await completeOnboarding(req.user.sub);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
