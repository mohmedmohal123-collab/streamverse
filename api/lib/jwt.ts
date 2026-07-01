import jwt from 'jsonwebtoken';
import type { UserId, JwtPayload } from '../types/auth';

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: UserId): string {
  return jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, jwtSecret) as JwtPayload;
  } catch (error) {
    return null;
  }
}
