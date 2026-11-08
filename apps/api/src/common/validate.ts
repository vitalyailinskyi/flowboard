import { RequestHandler } from 'express';
import { ZodType } from 'zod';
import { AppError } from './AppError';

export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'Validation failed', result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
