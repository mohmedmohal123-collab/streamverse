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

const VALID_TIERS = new Set(['free', 'plus', 'pro']);
const VALID_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP']);
const VALID_PROVIDERS = new Set(['stripe', 'paypal', 'google_play']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET — public read of subscription plans
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('[plans] GET error:', error);
        return res.status(500).json({ error: 'Failed to load plans' });
      }

      // Also return whether subscriptions are enabled
      const { data: settingData } = await supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', 'subscriptions_enabled')
        .maybeSingle();

      return res.status(200).json({
        plans: data || [],
        subscriptionsEnabled: settingData?.value !== 'false',
      });
    }

    // POST/PUT/DELETE — admin only
    const isAdmin = await requireAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // POST — create or update a plan
    if (req.method === 'POST') {
      const { id, name, description, monthlyPrice, annualPrice, currency, isActive, features, sortOrder } = req.body;

      if (!id || !VALID_TIERS.has(id)) {
        return res.status(400).json({ error: 'Invalid or missing plan id' });
      }

      const update = {
        id,
        name: name || id,
        description: description || '',
        monthly_price: Number(monthlyPrice) || 0,
        annual_price: Number(annualPrice) || 0,
        currency: VALID_CURRENCIES.has(currency) ? currency : 'USD',
        is_active: Boolean(isActive),
        features: JSON.stringify(features || []),
        sort_order: Number(sortOrder) || 0,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from('subscription_plans')
        .upsert(update)
        .select()
        .single();

      if (error) {
        console.error('[plans] POST error:', error);
        return res.status(500).json({ error: 'Failed to save plan' });
      }

      return res.status(200).json({ ok: true, plan: data });
    }

    // PUT — batch update plans
    if (req.method === 'PUT') {
      const { plans } = req.body;
      if (!Array.isArray(plans)) {
        return res.status(400).json({ error: 'Expected plans array' });
      }

      const results: Array<{ id: string; ok: boolean }> = [];
      for (const plan of plans) {
        if (!plan.id || !VALID_TIERS.has(plan.id)) continue;
        const { error } = await supabaseAdmin.from('subscription_plans').upsert({
          id: plan.id,
          name: plan.name || plan.id,
          description: plan.description || '',
          monthly_price: Number(plan.monthlyPrice) || 0,
          annual_price: Number(plan.annualPrice) || 0,
          currency: VALID_CURRENCIES.has(plan.currency) ? plan.currency : 'USD',
          is_active: Boolean(plan.isActive),
          features: JSON.stringify(plan.features || []),
          sort_order: Number(plan.sortOrder) || 0,
          updated_at: new Date().toISOString(),
        });
        results.push({ id: plan.id, ok: !error });
      }

      return res.status(200).json({ ok: true, results });
    }

    // DELETE — deactivate a plan (don't actually delete to preserve referential integrity)
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string' || !VALID_TIERS.has(id)) {
        return res.status(400).json({ error: 'Invalid plan id' });
      }

      const { error } = await supabaseAdmin
        .from('subscription_plans')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('[plans] DELETE error:', error);
        return res.status(500).json({ error: 'Failed to deactivate plan' });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[plans] handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
