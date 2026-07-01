import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../lib/auth';
import { generateToken } from '../../lib/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, passwordHash, salt } = req.body;

    if (!username || !email || !passwordHash || !salt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await authService.registerWithCredentials(username, email, passwordHash, salt);

    if (result.__kind__ === 'ok') {
      // Generate JWT token
      const token = generateToken(result.ok);
      
      // Get user details
      const user = await authService.getUser(result.ok);
      
      return res.status(201).json({
        __kind__: 'ok',
        ok: {
          userId: result.ok,
          token,
          user
        }
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ __kind__: 'err', err: 'Internal server error' });
  }
}
