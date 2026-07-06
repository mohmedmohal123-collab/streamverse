import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase.js';

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
      .from('ad_config')
      .select('provider, is_enabled, is_default, banner_ad_unit, native_ad_unit, interstitial_ad_unit, rewarded_ad_unit')
      .eq('is_enabled', true)
      .order('provider');

    if (error) {
      console.error('[ads-public] GET error:', error);
      return res.status(500).json({ error: 'Failed to load ad config' });
    }

    return res.status(200).json({ providers: data || [] });
  } catch (error) {
    console.error('[ads-public] handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
