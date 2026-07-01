import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/jwt';
import { authService } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header or body
    const authHeader = req.headers.authorization;
    const tokenFromBody = req.body.token;
    const token = authHeader?.replace('Bearer ', '') || tokenFromBody;

    if (!token) {
      return res.status(401).json({ __kind__: 'err', err: 'Missing authentication token' });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ __kind__: 'err', err: 'Invalid token' });
    }

    const result = await authService.deleteAccount(payload.userId);

    if (result.__kind__ === 'ok') {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
}
