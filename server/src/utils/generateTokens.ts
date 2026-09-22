import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';



export function signAccessToken(userId: string) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign({
    userId
  }, JWT_SECRET, {
    expiresIn: "15m"
  });
}

export function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
};