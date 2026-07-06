import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/jwt.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { authService } from '../lib/auth.js';

// Keys that are secrets — masked when returned to the client
const SECRET_KEYS = new Set([
  'stripe_secret_key',
  'stripe_webhook_secret',
  'paypal_client_secret',
  'google_play_billing_key',
  'youtube_api_key',
  'vimeo_api_key',
  'dailymotion_api_key',
  'tiktok_api_key',
  'tmdb_api_key',
  'rapidapi_download_key',
]);

// Keys that can be stored
const ALLOWED_KEYS = new Set([
  'maintenance_mode',
  'subscriptions_enabled',
  'ads_enabled',
  'google_client_id',
  'stripe_secret_key',
  'stripe_publishable_key',
  'stripe_webhook_secret',
  'paypal_client_id',
  'paypal_client_secret',
  'google_play_billing_key',
  'youtube_api_key',
  'vimeo_api_key',
  'dailymotion_api_key',
  'tiktok_api_key',
  'tmdb_api_key',
  'vidsrc_enabled',
  'archive_enabled',
  'rapidapi_download_key',
  'stripe_price_plus',
  'stripe_price_plus_annual',
  'stripe_price_pro',
  'stripe_price_pro_annual',
  'default_ad_provider',
]);

function maskSecret(value: string): string {
  if (!value || value.length <= 4) return value ? '****' : '';
  return value.slice(0, 2) + '*'.repeat(Math.min(value.length - 4, 20)) + value.slice(-2);
}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Admin check for all operations
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // GET — read all settings (secrets masked)
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('key, value, updated_at');

      if (error) {
        console.error('[admin-settings] GET error:', error);
        return res.status(500).json({ error: 'Failed to load settings' });
      }

      const settings: Record<string, { value: string; isSecret: boolean; updatedAt: string }> = {};
      for (const row of data || []) {
        const isSecret = SECRET_KEYS.has(row.key);
        settings[row.key] = {
          value: isSecret ? maskSecret(row.value) : row.value,
          isSecret,
          updatedAt: row.updated_at,
        };
      }

      return res.status(200).json({ settings });
    }

    // POST — save a single setting
    if (req.method === 'POST') {
      const { key, value } = req.body;

      if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'Missing key' });
      }

      if (!ALLOWED_KEYS.has(key)) {
        return res.status(400).json({ error: `Unknown setting key: ${key}` });
      }

      if (value === undefined || value === null) {
        return res.status(400).json({ error: 'Missing value' });
      }

      const stringValue = String(value);

      // Don't update if the value is a masked secret (****)
      if (SECRET_KEYS.has(key) && stringValue.includes('****')) {
        return res.status(200).json({ ok: true, skipped: true, message: 'Value unchanged (masked)' });
      }

      const { error } = await supabaseAdmin
        .from('admin_settings')
        .upsert({
          key,
          value: stringValue,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('[admin-settings] POST error:', error);
        return res.status(500).json({ error: 'Failed to save setting' });
      }

      return res.status(200).json({ ok: true });
    }

    // PUT — batch update multiple settings
    if (req.method === 'PUT') {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Missing settings object' });
      }

      const updates: Array<{ key: string; value: string; updated_at: string }> = [];
      for (const [key, value] of Object.entries(settings)) {
        if (!ALLOWED_KEYS.has(key)) continue;
        const stringValue = String(value);
        if (SECRET_KEYS.has(key) && stringValue.includes('****')) continue;
        updates.push({
          key,
          value: stringValue,
          updated_at: new Date().toISOString(),
        });
      }

      if (updates.length === 0) {
        return res.status(200).json({ ok: true, skipped: true });
      }

      const { error } = await supabaseAdmin
        .from('admin_settings')
        .upsert(updates);

      if (error) {
        console.error('[admin-settings] PUT error:', error);
        return res.status(500).json({ error: 'Failed to save settings' });
      }

      return res.status(200).json({ ok: true, saved: updates.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[admin-settings] handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
