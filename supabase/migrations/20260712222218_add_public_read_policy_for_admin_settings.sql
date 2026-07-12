/*
# Add public read policy for admin_settings table

## Summary
The `admin_settings` table has RLS enabled but NO policies, which means ALL access
is blocked for the anon key. The `publicSettings()` API endpoint uses the anon key
(falling back from the placeholder service role key) to query public settings,
but gets 0 rows because RLS blocks everything.

This migration adds a SELECT policy that allows anon and authenticated roles to
read ONLY the public (non-secret) keys from `admin_settings`. Secret keys (API keys,
client secrets) remain inaccessible to the anon key.

## Tables
- `admin_settings` — no schema changes, only RLS policy added

## Security
- Adds `public_read_admin_settings` SELECT policy on `admin_settings`
- Policy allows anon + authenticated to SELECT rows where `key` is in the public set:
  maintenance_mode, subscriptions_enabled, ads_enabled, google_client_id,
  stripe_publishable_key, paypal_client_id, vidsrc_enabled, archive_enabled,
  default_ad_provider
- Secret keys (youtube_api_key, google_client_secret, stripe_secret_key, etc.)
  remain blocked — the anon key cannot read them
- Admin write access remains via service role only (no INSERT/UPDATE/DELETE policies)
*/

DROP POLICY IF EXISTS "public_read_admin_settings" ON admin_settings;
CREATE POLICY "public_read_admin_settings"
  ON admin_settings FOR SELECT
  TO anon, authenticated
  USING (
    key IN (
      'maintenance_mode',
      'subscriptions_enabled',
      'ads_enabled',
      'google_client_id',
      'stripe_publishable_key',
      'paypal_client_id',
      'vidsrc_enabled',
      'archive_enabled',
      'default_ad_provider'
    )
  );
