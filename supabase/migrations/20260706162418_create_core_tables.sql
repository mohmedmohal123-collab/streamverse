/*
# Create Core Tables for StreamVerse

## Summary
Creates the foundational database tables for the StreamVerse video streaming platform:
1. `users` — User profiles (username, email, role, display settings)
2. `credentials` — Username/password hash storage for credential auth
3. `google_oauth_links` — Links Google OAuth subjects to user accounts
4. `admin_settings` — Key-value store for admin-configurable settings (API keys, provider config, etc.)
5. `subscription_plans` — Subscription tier definitions (free, plus, pro) with pricing
6. `ad_config` — Ad network configuration (AdMob, AppLovin, Unity Ads) with provider keys

## Tables

### users
- id (uuid, PK) — User identifier
- username (text, unique) — Unique username
- email (text, unique) — User email
- display_name (text) — Display name shown in UI
- avatar_url (text) — Profile picture URL
- role (text) — 'user' or 'admin'
- language (text) — 'en' or 'ar'
- dark_mode (boolean) — Dark mode preference
- created_at (timestamptz) — Account creation timestamp
- is_banned (boolean) — Whether the user is banned
- facebook_url (text, nullable) — Facebook profile link
- tiktok_url (text, nullable) — TikTok profile link

### credentials
- user_id (uuid, FK → users) — Owning user
- username (text, unique) — Username for login lookup
- password_hash (text) — Client-side hashed password
- salt (text) — Per-user salt for hashing
- created_at (timestamptz) — Credential creation timestamp

### google_oauth_links
- user_id (uuid, FK → users) — Linked user account
- google_sub (text, unique) — Google OAuth subject ID
- email (text) — Email from Google
- linked_at (timestamptz) — When the link was created

### admin_settings
- key (text, PK) — Setting key (e.g. 'youtube_api_key', 'google_client_id')
- value (text) — Setting value
- updated_at (timestamptz) — Last update timestamp
- updated_by (uuid, nullable) — Admin user ID who updated

### subscription_plans
- id (text, PK) — Plan identifier ('free', 'plus', 'pro')
- name (text) — Display name
- description (text) — Plan description
- monthly_price (numeric) — Monthly price in the plan currency
- annual_price (numeric) — Annual price (per month, billed annually)
- currency (text) — ISO currency code (e.g. 'USD')
- is_active (boolean) — Whether the plan is available for purchase
- features (jsonb) — List of feature strings included in the plan
- sort_order (int) — Display ordering
- created_at (timestamptz) — Creation timestamp
- updated_at (timestamptz) — Last update timestamp

### ad_config
- id (uuid, PK) — Config entry identifier
- provider (text) — Ad provider name ('admob', 'applovin', 'unity')
- is_enabled (boolean) — Whether this provider is active
- app_id (text, nullable) — Provider app ID
- api_key (text, nullable) — Provider API/key
- banner_ad_unit (text, nullable) — Banner ad unit ID
- native_ad_unit (text, nullable) — Native ad unit ID
- interstitial_ad_unit (text, nullable) — Interstitial ad unit ID
- rewarded_ad_unit (text, nullable) — Rewarded ad unit ID
- is_default (boolean) — Whether this is the selected provider
- created_at (timestamptz) — Creation timestamp
- updated_at (timestamptz) — Last update timestamp

## Security
- RLS enabled on ALL tables.
- `admin_settings`: Only service role can read/write (contains secrets). No anon/authenticated policies — the service role bypasses RLS.
- `users`, `credentials`, `google_oauth_links`: Access via API serverless functions using the service role key. No direct anon access to credentials.
- `subscription_plans`: Public read (anon + authenticated), admin-only write.
- `ad_config`: Public read (anon + authenticated, but secrets are masked), admin-only write via service role.

## Notes
1. The `admin_settings` table stores API keys and sensitive configuration. It has NO anon or authenticated policies — only the service role (used by Vercel serverless functions) can access it. This prevents secrets from leaking to the client.
2. The `subscription_plans` table is publicly readable so the pricing page can display plans without authentication. Writes are admin-only via the service role.
3. The `ad_config` table is publicly readable for the non-sensitive fields (provider name, enabled status). The API layer is responsible for masking api_key values when returning data to the client.
4. Default subscription plans (free, plus, pro) are seeded with default pricing.
5. Default ad provider entries (admob, applovin, unity) are seeded as disabled.
*/
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  dark_mode boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_banned boolean NOT NULL DEFAULT false,
  facebook_url text,
  tiktok_url text
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL DEFAULT '',
  salt text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS google_oauth_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  google_sub text UNIQUE NOT NULL,
  email text NOT NULL,
  linked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE google_oauth_links ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  monthly_price numeric NOT NULL DEFAULT 0,
  annual_price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT true,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_subscription_plans" ON subscription_plans;
CREATE POLICY "public_read_subscription_plans"
  ON subscription_plans FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS ad_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE CHECK (provider IN ('admob', 'applovin', 'unity')),
  is_enabled boolean NOT NULL DEFAULT false,
  app_id text,
  api_key text,
  banner_ad_unit text,
  native_ad_unit text,
  interstitial_ad_unit text,
  rewarded_ad_unit text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ad_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ad_config" ON ad_config;
CREATE POLICY "public_read_ad_config"
  ON ad_config FOR SELECT
  TO anon, authenticated USING (true);

-- Seed default subscription plans
INSERT INTO subscription_plans (id, name, description, monthly_price, annual_price, currency, is_active, features, sort_order) VALUES
  ('free', 'Free', 'Basic streaming access', 0, 0, 'USD', true, '["Search & Watch","Watch History","Basic Quality"]'::jsonb, 0),
  ('plus', 'Plus', 'HD streaming with no ads', 4.99, 3.99, 'USD', true, '["All Free features","HD Quality","No Ads","Download Videos"]'::jsonb, 1),
  ('pro', 'Pro', 'Premium 4K streaming', 9.99, 7.99, 'USD', true, '["All Plus features","4K Quality","Early Access","Priority Support","Creator Analytics"]'::jsonb, 2)
ON CONFLICT (id) DO NOTHING;

-- Seed default ad provider entries (all disabled)
INSERT INTO ad_config (provider, is_enabled, is_default) VALUES
  ('admob', false, false),
  ('applovin', false, false),
  ('unity', false, false)
ON CONFLICT (provider) DO NOTHING;
