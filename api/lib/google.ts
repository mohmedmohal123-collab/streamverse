import { OAuth2Client } from 'google-auth-library';
import { supabaseAdmin } from './supabase.js';

async function getGoogleClientId(): Promise<string | null> {
  // 1. Check environment variable first
  const envKey = process.env.GOOGLE_CLIENT_ID;
  if (envKey) return envKey;

  // 2. Check admin_settings in database
  try {
    const { data } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'google_client_id')
      .maybeSingle();

    if (data && data.value) return data.value;
  } catch {
    // Database may not be available during initial setup
  }

  return null;
}

let cachedClient: OAuth2Client | null = null;
let cachedClientId: string | null = null;

async function getGoogleClient(): Promise<OAuth2Client | null> {
  const clientId = await getGoogleClientId();
  if (!clientId) return null;

  if (cachedClient && cachedClientId === clientId) {
    return cachedClient;
  }

  cachedClient = new OAuth2Client(clientId);
  cachedClientId = clientId;
  return cachedClient;
}

/**
 * Verify a Google ID token and return the payload.
 * Also supports access tokens by fetching userinfo as a fallback.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<{
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
} | null> {
  const client = await getGoogleClient();
  if (!client) {
    throw new Error('Google OAuth client not configured. Set GOOGLE_CLIENT_ID env var or configure it in admin settings.');
  }

  // First try: verify as an ID token
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: await getGoogleClientId() || undefined,
    });
    const payload = ticket.getPayload();
    if (payload && payload.sub) {
      return {
        sub: payload.sub,
        email: payload.email || '',
        email_verified: payload.email_verified,
        name: payload.name,
        picture: payload.picture,
      };
    }
  } catch (idTokenErr) {
    // Not a valid ID token — try as an access token (from oauth2.initTokenClient)
    console.warn('[google] ID token verification failed, trying as access token:', idTokenErr instanceof Error ? idTokenErr.message : String(idTokenErr));
  }

  // Fallback: treat as access token and fetch userinfo
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) {
      throw new Error(`Google userinfo request failed: ${res.status}`);
    }
    const data = await res.json() as {
      sub: string;
      email: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };
    if (data && data.sub) {
      return data;
    }
    return null;
  } catch (err) {
    console.error('[google] Access token verification also failed:', err);
    return null;
  }
}
