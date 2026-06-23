import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token and sets userId in request
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ __kind__: 'err', err: 'No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const authService = new AuthService();
  const payload = authService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({ __kind__: 'err', err: 'Invalid or expired token' });
  }

  req.userId = payload.userId;
  next();
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without userId
  }

  const token = authHeader.substring(7);
  const authService = new AuthService();
  const payload = authService.verifyToken(token);

  if (payload) {
    req.userId = payload.userId;
  }
  
  next();
};
