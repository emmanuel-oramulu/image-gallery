import rateLimit from 'express-rate-limit';
import { type Request } from 'express';

export const IPRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts, please try again later',
  statusCode: 429
});

export const EmailRateLimiter = rateLimit({
  keyGenerator: (req: Request) => req.body.email,
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, please try again later',
  statusCode: 429
})