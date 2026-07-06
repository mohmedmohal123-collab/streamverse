import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase.js';

// Public-readable settings (non-secret)
const PUBLIC_KEYS = new Set([
  'maintenance_mode',
  'subscriptions_enabled',
  'ads_enabled',
  'google_client_id',
  'stripe_publishable_key',
  'paypal_client_id',
  'vidsrc_enabled',
  'archive_enabled',
  'default_ad_provider',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value')
      .in('key', Array.from(PUBLIC_KEYS));

    if (error) {
      console.error('[public-settings] GET error:', error);
      return res.status(500).json({ error: 'Failed to load settings' });
    }

    const settings: Record<string, string> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }

    return res.status(200).json({ settings });
  } catch (error) {
    console.error('[public-settings] handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
