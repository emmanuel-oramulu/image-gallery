import jwt, { type JwtPayload } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import {
  InvalidAccessTokenError
} from '../errors/errors.js';

interface TokenPayload extends JwtPayload {
  userId: string;
}

export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.headers?.authorization?.startsWith('Bearer')) {
      return next(new InvalidAccessTokenError());
    }
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new InvalidAccessTokenError());
    }

    const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");

    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === 'string') return next(new InvalidAccessTokenError('Invalid token payload'));

    const { userId } = decoded as TokenPayload;

    req.userId = userId;
    next()
  } catch (err) {
    next(new InvalidAccessTokenError());
  }
}

