import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from './lib/auth.js';
import { generateToken, verifyToken } from './lib/jwt.js';
import { supabaseAdmin } from './lib/supabase.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res: VercelResponse, status: number, body: unknown): VercelResponse {
  setCorsHeaders(res);
  return res.status(status).json(body);
}

function sendError(res: VercelResponse, status: number, message: string): VercelResponse {
  return sendJson(res, status, { error: message });
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

function getToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  const tokenFromBody = req.body?.token;
  return authHeader?.replace('Bearer ', '') || tokenFromBody || null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const VALID_AD_PROVIDERS = new Set(['admob', 'applovin', 'unity']);
const VALID_AD_FIELDS = new Set([
  'is_enabled', 'app_id', 'api_key', 'banner_ad_unit',
  'native_ad_unit', 'interstitial_ad_unit', 'rewarded_ad_unit', 'is_default',
]);

const VALID_TIERS = new Set(['free', 'plus', 'pro']);
const VALID_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP']);

function maskSecret(value: string): string {
  if (!value || value.length <= 4) return value ? '****' : '';
  return value.slice(0, 2) + '*'.repeat(Math.min(value.length - 4, 20)) + value.slice(-2);
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

// POST /api/auth/login/credentials
async function loginCredentials(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  try {
    const { username, passwordHash } = req.body;
    if (!username || !passwordHash) return sendError(res, 400, 'Missing required fields');
    const result = await authService.loginWithCredentials(username, passwordHash);
    if (result.__kind__ === 'ok') {
      const token = generateToken(result.ok);
      const user = await authService.getUser(result.ok);
      return sendJson(res, 200, { __kind__: 'ok', ok: { userId: result.ok, token, user } });
    }
    return sendJson(res, 401, result);
  } catch (error) {
    console.error('Login error:', error);
    return sendJson(res, 500, { __kind__: 'err', err: 'Internal server error' });
  }
}

// POST /api/auth/register/credentials
async function registerCredentials(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  try {
    const { username, email, passwordHash, salt } = req.body;
    if (!username || !email || !passwordHash || !salt) return sendError(res, 400, 'Missing required fields');
    const result = await authService.registerWithCredentials(username, email, passwordHash, salt);
    if (result.__kind__ === 'ok') {
      const token = generateToken(result.ok);
      const user = await authService.getUser(result.ok);
      return sendJson(res, 201, { __kind__: 'ok', ok: { userId: result.ok, token, user } });
    }
    return sendJson(res, 400, result);
  } catch (error) {
    console.error('Register error:', error);
    return sendJson(res, 500, { __kind__: 'err', err: 'Internal server error' });
  }
}

// POST /api/auth/verify-google
async function verifyGoogle(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  try {
    const { idToken } = req.body;
    if (!idToken) return sendError(res, 400, 'Missing idToken');
    const result = await authService.verifyGoogleOAuth(idToken);
    if (result.__kind__ === 'ok') {
      const token = generateToken(result.ok);
      const user = await authService.getUser(result.ok);
      return sendJson(res, 200, { __kind__: 'ok', ok: { userId: result.ok, token, user } });
    }
    return sendJson(res, 401, result);
  } catch (error) {
    console.error('Verify Google error:', error);
    return sendJson(res, 500, { __kind__: 'err', err: 'Internal server error' });
  }
}

// POST /api/auth/verify-token
async function verifyTokenEndpoint(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 400, 'Missing token');
    const payload = verifyToken(token);
    if (!payload) return sendJson(res, 401, { __kind__: 'err', err: 'Invalid token' });
    const user = await authService.getUser(payload.userId);
    if (!user) return sendJson(res, 404, { __kind__: 'err', err: 'User not found' });
    return sendJson(res, 200, { __kind__: 'ok', ok: { userId: payload.userId, user } });
  } catch (error) {
    console.error('Verify token error:', error);
    return sendJson(res, 500, { __kind__: 'err', err: 'Internal server error' });
  }
}

// POST /api/auth/delete-account
async function deleteAccount(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  try {
    const token = getToken(req);
    if (!token) return sendJson(res, 401, { __kind__: 'err', err: 'Missing authentication token' });
    const payload = verifyToken(token);
    if (!payload) return sendJson(res, 401, { __kind__: 'err', err: 'Invalid token' });
    const result = await authService.deleteAccount(payload.userId);
    if (result.__kind__ === 'ok') return sendJson(res, 200, result);
    return sendJson(res, 400, result);
  } catch (error) {
    console.error('Delete account error:', error);
    return sendJson(res, 500, { __kind__: 'err', err: 'Internal server error' });
  }
}

// GET /api/auth/salt/:username
async function getSalt(req: VercelRequest, res: VercelResponse, username: string): Promise<VercelResponse> {
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');
  try {
    if (!username) return sendError(res, 400, 'Invalid username');
    const salt = await authService.getSaltForUser(username);
    if (salt === null) return sendJson(res, 404, { __kind__: 'err', err: 'User not found' });
    return sendJson(res, 200, { __kind__: 'ok', ok: salt });
  } catch (error) {
    console.error('Get salt error:', error);
    return sendJson(res, 500, { __kind__: 'err', err: 'Internal server error' });
  }
}

// GET/POST/PUT /api/admin/settings
async function adminSettings(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return sendError(res, 403, 'Admin access required');
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('key, value, updated_at');
      if (error) {
        console.error('[admin-settings] GET error:', error);
        return sendError(res, 500, 'Failed to load settings');
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
      return sendJson(res, 200, { settings });
    }

    if (req.method === 'POST') {
      const { key, value } = req.body;
      if (!key || typeof key !== 'string') return sendError(res, 400, 'Missing key');
      if (!ALLOWED_KEYS.has(key)) return sendError(res, 400, `Unknown setting key: ${key}`);
      if (value === undefined || value === null) return sendError(res, 400, 'Missing value');
      const stringValue = String(value);
      if (SECRET_KEYS.has(key) && stringValue.includes('****')) {
        return sendJson(res, 200, { ok: true, skipped: true, message: 'Value unchanged (masked)' });
      }
      const { error } = await supabaseAdmin
        .from('admin_settings')
        .upsert({ key, value: stringValue, updated_at: new Date().toISOString() });
      if (error) {
        console.error('[admin-settings] POST error:', error);
        return sendError(res, 500, 'Failed to save setting');
      }
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'PUT') {
      const { settings } = req.body;
      if (!settings || typeof settings !== 'object') return sendError(res, 400, 'Missing settings object');
      const updates: Array<{ key: string; value: string; updated_at: string }> = [];
      for (const [key, value] of Object.entries(settings)) {
        if (!ALLOWED_KEYS.has(key)) continue;
        const stringValue = String(value);
        if (SECRET_KEYS.has(key) && stringValue.includes('****')) continue;
        updates.push({ key, value: stringValue, updated_at: new Date().toISOString() });
      }
      if (updates.length === 0) return sendJson(res, 200, { ok: true, skipped: true });
      const { error } = await supabaseAdmin.from('admin_settings').upsert(updates);
      if (error) {
        console.error('[admin-settings] PUT error:', error);
        return sendError(res, 500, 'Failed to save settings');
      }
      return sendJson(res, 200, { ok: true, saved: updates.length });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error) {
    console.error('[admin-settings] handler error:', error);
    return sendError(res, 500, 'Internal server error');
  }
}

// GET/POST/PUT/DELETE /api/admin/ads
async function adminAds(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('ad_config')
        .select('*')
        .order('provider');
      if (error) {
        console.error('[ads] GET error:', error);
        return sendError(res, 500, 'Failed to load ad config');
      }
      const configs = (data || []).map((row) => ({
        ...row,
        api_key: row.api_key ? row.api_key.slice(0, 2) + '****' + row.api_key.slice(-2) : null,
      }));
      return sendJson(res, 200, { configs });
    }

    // POST/PUT/DELETE — admin only
    const isAdmin = await requireAdmin(req);
    if (!isAdmin) return sendError(res, 403, 'Admin access required');

    if (req.method === 'POST') {
      const { provider, ...fields } = req.body;
      if (!provider || !VALID_AD_PROVIDERS.has(provider)) return sendError(res, 400, 'Invalid or missing provider');
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const [key, value] of Object.entries(fields)) {
        if (VALID_AD_FIELDS.has(key)) update[key] = value;
      }
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
        return sendError(res, 500, 'Failed to save ad config');
      }
      return sendJson(res, 200, { ok: true, config: data });
    }

    if (req.method === 'PUT') {
      const { configs } = req.body;
      if (!Array.isArray(configs)) return sendError(res, 400, 'Expected configs array');
      const results: Array<{ provider: string; ok: boolean }> = [];
      for (const cfg of configs) {
        if (!cfg.provider || !VALID_AD_PROVIDERS.has(cfg.provider)) continue;
        const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
        for (const [key, value] of Object.entries(cfg)) {
          if (key !== 'provider' && VALID_AD_FIELDS.has(key)) update[key] = value;
        }
        const { error } = await supabaseAdmin.from('ad_config').upsert({ provider: cfg.provider, ...update });
        results.push({ provider: cfg.provider, ok: !error });
      }
      return sendJson(res, 200, { ok: true, results });
    }

    if (req.method === 'DELETE') {
      const { provider } = req.query;
      if (!provider || typeof provider !== 'string' || !VALID_AD_PROVIDERS.has(provider))
        return sendError(res, 400, 'Invalid provider');
      const { error } = await supabaseAdmin.from('ad_config').delete().eq('provider', provider);
      if (error) {
        console.error('[ads] DELETE error:', error);
        return sendError(res, 500, 'Failed to delete ad config');
      }
      return sendJson(res, 200, { ok: true });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error) {
    console.error('[ads] handler error:', error);
    return sendError(res, 500, 'Internal server error');
  }
}

// GET/POST/PUT/DELETE /api/admin/plans
async function adminPlans(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .order('sort_order');
      if (error) {
        console.error('[plans] GET error:', error);
        return sendError(res, 500, 'Failed to load plans');
      }
      const { data: settingData } = await supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', 'subscriptions_enabled')
        .maybeSingle();
      return sendJson(res, 200, {
        plans: data || [],
        subscriptionsEnabled: settingData?.value !== 'false',
      });
    }

    const isAdmin = await requireAdmin(req);
    if (!isAdmin) return sendError(res, 403, 'Admin access required');

    if (req.method === 'POST') {
      const body = req.body;
      const id = body.id;
      const name = body.name;
      const description = body.description;
      const monthlyPrice = body.monthlyPrice ?? body.monthly_price;
      const annualPrice = body.annualPrice ?? body.annual_price;
      const currency = body.currency;
      const isActive = body.isActive ?? body.is_active;
      const features = body.features;
      const sortOrder = body.sortOrder ?? body.sort_order;

      if (!id || !VALID_TIERS.has(id)) return sendError(res, 400, 'Invalid or missing plan id');

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
        return sendError(res, 500, 'Failed to save plan');
      }
      return sendJson(res, 200, { ok: true, plan: data });
    }

    if (req.method === 'PUT') {
      const { plans } = req.body;
      if (!Array.isArray(plans)) return sendError(res, 400, 'Expected plans array');
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
      return sendJson(res, 200, { ok: true, results });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string' || !VALID_TIERS.has(id)) return sendError(res, 400, 'Invalid plan id');
      const { error } = await supabaseAdmin
        .from('subscription_plans')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        console.error('[plans] DELETE error:', error);
        return sendError(res, 500, 'Failed to deactivate plan');
      }
      return sendJson(res, 200, { ok: true });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error) {
    console.error('[plans] handler error:', error);
    return sendError(res, 500, 'Internal server error');
  }
}

// GET /api/settings/public
async function publicSettings(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value')
      .in('key', Array.from(PUBLIC_KEYS));
    if (error) {
      console.error('[public-settings] GET error:', error);
      return sendError(res, 500, 'Failed to load settings');
    }
    const settings: Record<string, string> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }
    return sendJson(res, 200, { settings });
  } catch (error) {
    console.error('[public-settings] handler error:', error);
    return sendError(res, 500, 'Internal server error');
  }
}

// GET /api/ads/public
async function publicAds(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');
  try {
    const { data, error } = await supabaseAdmin
      .from('ad_config')
      .select('provider, is_enabled, is_default, banner_ad_unit, native_ad_unit, interstitial_ad_unit, rewarded_ad_unit')
      .eq('is_enabled', true)
      .order('provider');
    if (error) {
      console.error('[ads-public] GET error:', error);
      return sendError(res, 500, 'Failed to load ad config');
    }
    return sendJson(res, 200, { providers: data || [] });
  } catch (error) {
    console.error('[ads-public] handler error:', error);
    return sendError(res, 500, 'Internal server error');
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vercel catch-all: req.query.route is an array of path segments
  const route = req.query.route as string[] | undefined;
  const segments = route || [];
  const path = '/' + segments.join('/');

  try {
    // /api/auth/login/credentials
    if (path === '/auth/login/credentials') {
      return await loginCredentials(req, res);
    }

    // /api/auth/register/credentials
    if (path === '/auth/register/credentials') {
      return await registerCredentials(req, res);
    }

    // /api/auth/verify-google
    if (path === '/auth/verify-google') {
      return await verifyGoogle(req, res);
    }

    // /api/auth/verify-token
    if (path === '/auth/verify-token') {
      return await verifyTokenEndpoint(req, res);
    }

    // /api/auth/delete-account
    if (path === '/auth/delete-account') {
      return await deleteAccount(req, res);
    }

    // /api/auth/salt/:username
    if (segments.length === 3 && segments[0] === 'auth' && segments[1] === 'salt') {
      return await getSalt(req, res, segments[2]);
    }

    // /api/admin/settings
    if (path === '/admin/settings') {
      return await adminSettings(req, res);
    }

    // /api/admin/ads
    if (path === '/admin/ads') {
      return await adminAds(req, res);
    }

    // /api/admin/plans
    if (path === '/admin/plans') {
      return await adminPlans(req, res);
    }

    // /api/settings/public
    if (path === '/settings/public') {
      return await publicSettings(req, res);
    }

    // /api/ads/public
    if (path === '/ads/public') {
      return await publicAds(req, res);
    }

    return sendError(res, 404, `Not found: ${path}`);
  } catch (error) {
    console.error('[router] unhandled error:', error);
    return sendError(res, 500, 'Internal server error');
  }
}
