import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../lib/auth.js';
import { generateToken } from '../../lib/jwt.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, passwordHash } = req.body;

    if (!username || !passwordHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await authService.loginWithCredentials(username, passwordHash);

    if (result.__kind__ === 'ok') {
      // Generate JWT token
      const token = generateToken(result.ok);
      
      // Get user details
      const user = await authService.getUser(result.ok);
      
      return res.status(200).json({
        __kind__: 'ok',
        ok: {
          userId: result.ok,
          token,
          user
        }
      });
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
}

