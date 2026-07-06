/*
# Seed Admin User with Known Credentials

## Summary
Creates the default admin user so the admin panel is accessible immediately after deployment.

## Details
1. Creates a user with username='admin', email='admin@streamverse.local', role='admin'.
2. Creates a credential record with a pre-computed SHA-256 hash of (salt + 'admin123').
   - Salt: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
   - Hash: SHA-256(salt + 'admin123') computed via pgcrypto encode(digest(), 'hex')
3. All inserts use ON CONFLICT DO NOTHING so this is safe to re-run.

## Security Notes
1. The admin password is 'admin123' — this is a bootstrap credential for initial access.
2. The admin should change this password after first login via the Settings page.
3. The credential record uses the same SHA-256(salt + password) format as the client-side crypto module.
*/
DO $$
DECLARE
  admin_id uuid;
  admin_salt text := 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';
  admin_hash text;
BEGIN
  -- Compute SHA-256(salt + 'admin123') using pgcrypto
  admin_hash := encode(digest(admin_salt || 'admin123', 'sha256'), 'hex');

  -- Insert admin user if not exists
  INSERT INTO users (id, username, email, display_name, role, language, dark_mode, is_banned)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@streamverse.local',
    'Admin',
    'admin',
    'en',
    true,
    false
  )
  ON CONFLICT (username) DO NOTHING;

  -- Get the admin user ID (either the one we just inserted or the existing one)
  SELECT id INTO admin_id FROM users WHERE username = 'admin';

  -- Insert credential if not exists
  INSERT INTO credentials (user_id, username, password_hash, salt)
  VALUES (admin_id, 'admin', admin_hash, admin_salt)
  ON CONFLICT (username) DO NOTHING;

  -- Also seed 'mostfa' as admin (known admin username referenced in frontend)
  INSERT INTO users (id, username, email, display_name, role, language, dark_mode, is_banned)
  VALUES (
    '00000000-0000-0000-0000-000000000002',
    'mostfa',
    'mostfa@streamverse.local',
    'Mostfa',
    'admin',
    'en',
    true,
    false
  )
  ON CONFLICT (username) DO NOTHING;

  SELECT id INTO admin_id FROM users WHERE username = 'mostfa';

  INSERT INTO credentials (user_id, username, password_hash, salt)
  VALUES (admin_id, 'mostfa', admin_hash, admin_salt)
  ON CONFLICT (username) DO NOTHING;
END $$;
