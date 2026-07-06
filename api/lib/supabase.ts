import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. SUPABASE_URL:', !!supabaseUrl, 'SUPABASE_ANON_KEY:', !!supabaseAnonKey);
}

// User client (anon key — respects RLS)
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Admin client (service role key bypasses RLS, or falls back to anon key)
const adminKey = supabaseServiceRoleKey && !supabaseServiceRoleKey.startsWith('placeholder')
  ? supabaseServiceRoleKey
  : supabaseAnonKey;
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  adminKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
