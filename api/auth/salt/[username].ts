import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const salt = await authService.getSaltForUser(username);

    if (salt === null) {
      return res.status(404).json({ __kind__: 'err', err: 'User not found' });
    }

    return res.status(200).json({ __kind__: 'ok', ok: salt });
  } catch (error) {
    console.error('Get salt error:', error);
    return res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
}
