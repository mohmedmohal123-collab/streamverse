import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/jwt.js';
import { authService } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ __kind__: 'err', err: 'Invalid token' });
    }

    // Get user details
    const user = await authService.getUser(payload.userId);

    if (!user) {
      return res.status(404).json({ __kind__: 'err', err: 'User not found' });
    }

    return res.status(200).json({
      __kind__: 'ok',
      ok: {
        userId: payload.userId,
        user
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
}

