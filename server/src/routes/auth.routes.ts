import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/auth/register/credentials
 * Register a new user with username, email, and client-side password hash+salt
 * Migrated from: registerWithCredentials in auth-api.mo
 */
router.post('/register/credentials', async (req: Request, res: Response) => {
  try {
    const { username, email, passwordHash, salt } = req.body;

    if (!username || !email || !passwordHash || !salt) {
      return res.status(400).json({ __kind__: 'err', err: 'Missing required fields' });
    }

    const result = await authService.registerWithCredentials(username, email, passwordHash, salt);
    res.json(result);
  } catch (error) {
    console.error('Error in register/credentials:', error);
    res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login/credentials
 * Log in with username and client-side password hash
 * Returns user ID and JWT token on success
 * Migrated from: loginWithCredentials in auth-api.mo
 */
router.post('/login/credentials', async (req: Request, res: Response) => {
  try {
    const { username, passwordHash } = req.body;

    if (!username || !passwordHash) {
      return res.status(400).json({ __kind__: 'err', err: 'Missing username or password' });
    }

    const result = await authService.loginWithCredentials(username, passwordHash);
    
    if (result.__kind__ === 'ok') {
      // Generate JWT token
      const token = authService.generateToken(result.ok);
      res.json({ 
        __kind__: 'ok', 
        ok: { 
          userId: result.ok, 
          token 
        } 
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error in login/credentials:', error);
    res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
});

/**
 * GET /api/auth/salt/:username
 * Get the salt for a given username (needed for client-side password hashing)
 * Migrated from: getSaltForUser in auth-api.mo
 */
router.get('/salt/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const salt = await authService.getSaltForUser(username);
    
    if (salt === null) {
      return res.status(404).json({ __kind__: 'err', err: 'User not found' });
    }
    
    res.json({ __kind__: 'ok', ok: salt });
  } catch (error) {
    console.error('Error in get salt:', error);
    res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-google
 * Verify a Google ID token and return/create user
 * Migrated from: verifyGoogleOAuth in auth-api.mo
 */
router.post('/verify-google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ __kind__: 'err', err: 'Missing idToken' });
    }

    const result = await authService.verifyGoogleOAuth(idToken);
    
    if (result.__kind__ === 'ok') {
      // Generate JWT token
      const token = authService.generateToken(result.ok);
      res.json({ 
        __kind__: 'ok', 
        ok: { 
          userId: result.ok, 
          token 
        } 
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error in verify-google:', error);
    res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
});

/**
 * POST /api/auth/link-google
 * Link a Google account to the authenticated user
 * Migrated from: linkGoogleAccount in auth-api.mo
 */
router.post('/link-google', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { googleSub, email } = req.body;

    if (!googleSub || !email) {
      return res.status(400).json({ __kind__: 'err', err: 'Missing googleSub or email' });
    }

    if (!req.userId) {
      return res.status(401).json({ __kind__: 'err', err: 'Not authenticated' });
    }

    const result = await authService.linkGoogleAccount(req.userId, googleSub, email);
    res.json(result);
  } catch (error) {
    console.error('Error in link-google:', error);
    res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify a JWT token and return user info
 */
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ __kind__: 'err', err: 'Missing token' });
    }

    const payload = authService.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ __kind__: 'err', err: 'Invalid token' });
    }

    const user = await authService.getUser(payload.userId);
    
    if (!user) {
      return res.status(404).json({ __kind__: 'err', err: 'User not found' });
    }

    res.json({ __kind__: 'ok', ok: user });
  } catch (error) {
    console.error('Error in verify-token:', error);
    res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
});

export default router;
