'use strict';
import { type Request, type Response, type NextFunction } from 'express';
import { type ZodType } from 'zod';
import {
  ValidationError
} from '../errors/errors.js';

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return next(new ValidationError(fieldErrors));
  }

  req.body = result.data;
  next();
}