import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../modules/auth/tokens';
import { AppError } from './AppError';

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'Unauthorized');
  try {
    req.userId = await verifyAccessToken(header.slice(7));
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
  next();
};
