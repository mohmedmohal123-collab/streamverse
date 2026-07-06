import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/jwt.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { authService } from '../lib/auth.js';

async function requireAdmin(req: VercelRequest): Promise<boolean> {
  const authHeader = req.headers.authorization;
  const tokenFromBody = req.body?.token;
  const token = authHeader?.replace('Bearer ', '') || tokenFromBody;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const user = await authService.getUser(payload.userId);
  if (!user || user.isBanned) return false;
  return user.role === 'admin';
}

const VALID_PROVIDERS = new Set(['admob', 'applovin', 'unity']);
const VALID_FIELDS = new Set([
  'is_enabled', 'app_id', 'api_key', 'banner_ad_unit',
  'native_ad_unit', 'interstitial_ad_unit', 'rewarded_ad_unit', 'is_default',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET — public read (api_key masked)
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('ad_config')
        .select('*')
        .order('provider');

      if (error) {
        console.error('[ads] GET error:', error);
        return res.status(500).json({ error: 'Failed to load ad config' });
      }

      const configs = (data || []).map((row) => ({
        ...row,
        api_key: row.api_key ? row.api_key.slice(0, 2) + '****' + row.api_key.slice(-2) : null,
      }));

      return res.status(200).json({ configs });
    }

    // POST/PUT/DELETE — admin only
    const isAdmin = await requireAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // POST — create or update a provider config
    if (req.method === 'POST') {
      const { provider, ...fields } = req.body;

      if (!provider || !VALID_PROVIDERS.has(provider)) {
        return res.status(400).json({ error: 'Invalid or missing provider' });
      }

      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const [key, value] of Object.entries(fields)) {
        if (VALID_FIELDS.has(key)) {
          update[key] = value;
        }
      }

      // If setting is_default=true, clear other defaults
      if (update.is_default === true) {
        await supabaseAdmin.from('ad_config').update({ is_default: false }).neq('provider', provider);
      }

      const { data, error } = await supabaseAdmin
        .from('ad_config')
        .upsert({ provider, ...update })
        .select()
        .single();

      if (error) {
        console.error('[ads] POST error:', error);
        return res.status(500).json({ error: 'Failed to save ad config' });
      }

      return res.status(200).json({ ok: true, config: data });
    }

    // PUT — batch update
    if (req.method === 'PUT') {
      const { configs } = req.body;
      if (!Array.isArray(configs)) {
        return res.status(400).json({ error: 'Expected configs array' });
      }

      const results: Array<{ provider: string; ok: boolean }> = [];
      for (const cfg of configs) {
        if (!cfg.provider || !VALID_PROVIDERS.has(cfg.provider)) continue;
        const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
        for (const [key, value] of Object.entries(cfg)) {
          if (key !== 'provider' && VALID_FIELDS.has(key)) {
            update[key] = value;
          }
        }
        const { error } = await supabaseAdmin.from('ad_config').upsert({ provider: cfg.provider, ...update });
        results.push({ provider: cfg.provider, ok: !error });
      }

      return res.status(200).json({ ok: true, results });
    }

    // DELETE — remove a provider config
    if (req.method === 'DELETE') {
      const { provider } = req.query;
      if (!provider || typeof provider !== 'string' || !VALID_PROVIDERS.has(provider)) {
        return res.status(400).json({ error: 'Invalid provider' });
      }

      const { error } = await supabaseAdmin
        .from('ad_config')
        .delete()
        .eq('provider', provider);

      if (error) {
        console.error('[ads] DELETE error:', error);
        return res.status(500).json({ error: 'Failed to delete ad config' });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[ads] handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
