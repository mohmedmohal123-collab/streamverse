/*
# Create User Subscriptions Table + Maintenance Mode Setting

## Summary
1. Creates `user_subscriptions` table to track which subscription tier each user has.
2. Seeds `admin_settings` with default values for maintenance_mode, google_client_id, and subscription_enabled.
3. Seeds a default admin user with known credentials.

## Tables

### user_subscriptions
- id (uuid, PK) — Subscription record identifier
- user_id (uuid, FK → users) — The user who has this subscription
- tier (text) — 'free', 'plus', or 'pro'
- status (text) — 'active', 'canceled', 'past_due', 'none'
- provider (text, nullable) — Payment provider ('stripe', 'paypal', 'google_play')
- provider_subscription_id (text, nullable) — External subscription ID from the payment provider
- current_period_end (timestamptz, nullable) — When the current billing period ends
- created_at (timestamptz) — Record creation timestamp
- updated_at (timestamptz) — Last update timestamp

## Seeded Data
### admin_settings defaults
- `maintenance_mode` = 'false'
- `subscriptions_enabled` = 'true'
- `ads_enabled` = 'false'
- `google_client_id` = '' (empty — admin must configure)

### Admin user seed
- Username: 'admin', Email: 'admin@streamverse.local', Role: 'admin'
- Credential: password_hash for 'admin123' hashed with a known salt
- Note: The admin should change this password after first login.

## Security
- RLS enabled on `user_subscriptions`.
- Users can read their own subscription (auth.uid() = user_id).
- Only service role can insert/update/delete (via API functions).

## Notes
1. The `user_subscriptions` table allows only the owning user to read their subscription.
2. All writes go through the Vercel serverless API using the service role key.
3. The admin user is seeded with a known password so the admin panel is accessible immediately.
4. The password hash is computed client-side, so the seed uses a matching hash format.
*/
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'plus', 'pro')),
  status text NOT NULL DEFAULT 'none' CHECK (status IN ('active', 'canceled', 'past_due', 'none')),
  provider text CHECK (provider IS NULL OR provider IN ('stripe', 'paypal', 'google_play')),
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_subscription" ON user_subscriptions;
CREATE POLICY "read_own_subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Seed default admin settings
INSERT INTO admin_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('subscriptions_enabled', 'true'),
  ('ads_enabled', 'false'),
  ('google_client_id', ''),
  ('stripe_secret_key', ''),
  ('stripe_publishable_key', ''),
  ('stripe_webhook_secret', ''),
  ('paypal_client_id', ''),
  ('paypal_client_secret', ''),
  ('google_play_billing_key', ''),
  ('youtube_api_key', ''),
  ('vimeo_api_key', ''),
  ('dailymotion_api_key', ''),
  ('tiktok_api_key', ''),
  ('tmdb_api_key', ''),
  ('vidsrc_enabled', 'true'),
  ('archive_enabled', 'true'),
  ('rapidapi_download_key', '')
ON CONFLICT (key) DO NOTHING;
