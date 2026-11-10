import { ErrorRequestHandler } from 'express';
import { AppError } from './AppError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message, details: err.details });
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
