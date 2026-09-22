import { type Request, type Response, type NextFunction } from 'express';
import AppError from './appError.js';
import {
  ValidationError
} from './errors.js';

export default function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (!(err instanceof AppError)) {
    console.error('Unknown error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
  console.error(`Error: ${err.message}`, err.stack);

  const status: number = err.status || 500;
  const message: string = status === 500 ? 'Internal server error' : err.message;

  if (err instanceof ValidationError) {
    return res.status(status).json({
      message, fieldErrors: err.fieldErrors
    });
  }

  return res.status(status).json({
    message
  });
}