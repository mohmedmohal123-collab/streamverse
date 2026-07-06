import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/auth.js';

const jwtSecret: jwt.Secret = process.env.JWT_SECRET || 'streamverse-dev-jwt-secret-do-not-use-in-production-0x7f';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
}
