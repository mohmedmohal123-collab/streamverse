-- Supabase Database Setup for StreamVerse Authentication
-- This script adds missing tables and columns without dropping existing data
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE - Add missing columns if they don't exist
-- ============================================

-- Add display_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE users ADD COLUMN display_name TEXT;
    END IF;
END $$;

-- Add avatar_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
        ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- Add language column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'language'
    ) THEN
        ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en';
        ALTER TABLE users ADD CONSTRAINT check_language CHECK (language IN ('en', 'ar'));
    END IF;
END $$;

-- Add dark_mode column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'dark_mode'
    ) THEN
        ALTER TABLE users ADD COLUMN dark_mode BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add is_banned column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_banned'
    ) THEN
        ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add facebook_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'facebook_url'
    ) THEN
        ALTER TABLE users ADD COLUMN facebook_url TEXT;
    END IF;
END $$;

-- Add tiktok_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'tiktok_url'
    ) THEN
        ALTER TABLE users ADD COLUMN tiktok_url TEXT;
    END IF;
END $$;

-- Ensure username is unique if constraint doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;

-- Ensure email is unique if constraint doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;

-- ============================================
-- CREDENTIALS TABLE - Create if doesn't exist
-- ============================================

CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, username)
);

-- ============================================
-- GOOGLE OAUTH LINKS TABLE - Create if doesn't exist
-- ============================================

CREATE TABLE IF NOT EXISTS google_oauth_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  google_sub TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, google_sub)
);

-- ============================================
-- INDEXES - Create if they don't exist
-- ============================================

CREATE INDEX IF NOT EXISTS idx_credentials_username ON credentials(username);
CREATE INDEX IF NOT EXISTS idx_google_oauth_links_sub ON google_oauth_links(google_sub);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Enable if not enabled
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'users' AND rowsecurity = true
    ) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'credentials' AND rowsecurity = true
    ) THEN
        ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'google_oauth_links' AND rowsecurity = true
    ) THEN
        ALTER TABLE google_oauth_links ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- RLS POLICIES - Drop and recreate to ensure they exist
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can be created by anyone" ON users;
DROP POLICY IF EXISTS "Credentials can be read by username" ON credentials;
DROP POLICY IF EXISTS "Credentials can be created by anyone" ON credentials;
DROP POLICY IF EXISTS "Google links can be read by sub" ON google_oauth_links;
DROP POLICY IF EXISTS "Google links can be created by anyone" ON google_oauth_links;

-- Create policies
CREATE POLICY "Users are viewable by everyone" 
ON users FOR SELECT USING (true);

CREATE POLICY "Users can be created by anyone" 
ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Credentials can be read by username" 
ON credentials FOR SELECT USING (true);

CREATE POLICY "Credentials can be created by anyone" 
ON credentials FOR INSERT WITH CHECK (true);

CREATE POLICY "Google links can be read by sub" 
ON google_oauth_links FOR SELECT USING (true);

CREATE POLICY "Google links can be created by anyone" 
ON google_oauth_links FOR INSERT WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if username is admin
CREATE OR REPLACE FUNCTION is_admin_username(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN username IN ('mostfa', 'admin');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED ADMIN USER
-- ============================================

-- Seed admin user (username: mostfa, password: mostfa123)
-- This matches the Motoko seedAdmin() function
-- Password: mostfa123 with salt: mostfa_salt
-- SHA-256 hash of "mostfa_saltmostfa123" = f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64

-- Insert or update admin user
INSERT INTO users (id, username, email, display_name, avatar_url, role, language, dark_mode, created_at, is_banned)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'mostfa',
  'mostfa@streamverse.com',
  'mostfa',
  '',
  'admin',
  'en',
  true,
  NOW(),
  false
) ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = COALESCE(users.display_name, EXCLUDED.display_name),
  role = EXCLUDED.role,
  is_banned = false;

-- Insert admin credentials
INSERT INTO credentials (user_id, username, password_hash, salt, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'mostfa',
  'f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64',
  'mostfa_salt',
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  salt = EXCLUDED.salt;
