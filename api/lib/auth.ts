import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseAdmin } from './supabase.js';
import { generateToken, verifyToken } from './jwt.js';
import { verifyGoogleIdToken } from './google.js';
import type { 
  UserId, 
  AuthResult, 
  UserPublic 
} from '../types/auth.js';

/**
 * AuthService - Handles authentication operations migrated from auth-api.mo
 * Maintains compatibility with existing Motoko auth interface
 */
export class AuthService {
  /**
   * Register a new user with username/email and client-side password hash+salt
   * Migrated from: registerWithCredentials in auth-api.mo
   */
  async registerWithCredentials(
    username: string,
    email: string,
    passwordHash: string,
    salt: string
  ): Promise<AuthResult> {
    try {
      // Reject reserved admin usernames
      if (username === 'mostfa' || username === 'admin') {
        return { __kind__: 'err', err: 'Username already taken' };
      }

      // Check if username already exists
      const { data: existingCredential } = await supabase
        .from('credentials')
        .select('username')
        .eq('username', username)
        .single();

      if (existingCredential) {
        return { __kind__: 'err', err: 'Username already taken' };
      }

      // Generate a new UUID for the user
      const userId = uuidv4() as UserId;
      const now = Date.now();

      // Create user record
      const { error: userError } = await supabaseAdmin.from('users').insert({
        id: userId,
        username,
        email,
        display_name: username,
        avatar_url: '',
        role: 'user',
        language: 'en',
        dark_mode: true,
        created_at: new Date(now).toISOString(),
        is_banned: false
      });

      if (userError) {
        console.error('Error creating user:', userError);
        return { __kind__: 'err', err: 'Failed to create user' };
      }

      // Create credential record
      const { error: credentialError } = await supabaseAdmin.from('credentials').insert({
        user_id: userId,
        username,
        password_hash: passwordHash,
        salt,
        created_at: new Date(now).toISOString()
      });

      if (credentialError) {
        console.error('Error creating credential:', credentialError);
        // Rollback user creation
        await supabaseAdmin.from('users').delete().eq('id', userId);
        return { __kind__: 'err', err: 'Failed to create credential' };
      }

      return { __kind__: 'ok', ok: userId };
    } catch (error) {
      console.error('Error in registerWithCredentials:', error);
      return { __kind__: 'err', err: 'Registration failed' };
    }
  }

  /**
   * Log in with a username and client-side password hash
   * Returns the user's ID on success
   * Migrated from: loginWithCredentials in auth-api.mo
   */
  async loginWithCredentials(
    username: string,
    passwordHash: string
  ): Promise<AuthResult> {
    try {
      // Get credential record
      const { data: credential, error: credentialError } = await supabaseAdmin
        .from('credentials')
        .select('*')
        .eq('username', username)
        .single();

      if (credentialError || !credential) {
        return { __kind__: 'err', err: 'User not found' };
      }

      // Verify password hash
      if (credential.password_hash !== passwordHash) {
        return { __kind__: 'err', err: 'Invalid password' };
      }

      // Get user record to check if banned
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', credential.user_id)
        .single();

      if (userError || !user) {
        return { __kind__: 'err', err: 'User account missing' };
      }

      if (user.is_banned) {
        return { __kind__: 'err', err: 'Account is banned' };
      }

      return { __kind__: 'ok', ok: credential.user_id as UserId };
    } catch (error) {
      console.error('Error in loginWithCredentials:', error);
      return { __kind__: 'err', err: 'Login failed' };
    }
  }

  /**
   * Return the salt stored for a given username
   * Migrated from: getSaltForUser in auth-api.mo
   */
  async getSaltForUser(username: string): Promise<string | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('credentials')
        .select('*')
        .eq('username', username);

      if (!data || data.length === 0) {
        return null;
      }

      return data[0].salt;
    } catch (error) {
      console.error('Error in getSaltForUser:', error);
      return null;
    }
  }

  /**
   * Verify a Google ID token and return the user's ID
   * Migrated from: verifyGoogleOAuth in auth-api.mo
   */
  async verifyGoogleOAuth(idToken: string): Promise<AuthResult> {
    try {
      const googleData = await verifyGoogleIdToken(idToken);

      if (!googleData || !googleData.sub) {
        return { __kind__: 'err', err: 'Invalid Google token' };
      }

      const { sub: googleSub, email } = googleData;

      // Look up an existing link
      const { data: existingLink } = await supabase
        .from('google_oauth_links')
        .select('*')
        .eq('google_sub', googleSub)
        .single();

      if (existingLink) {
        // Verify the linked user still exists and is not banned
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', existingLink.user_id)
          .single();

        if (userError || !user) {
          return { __kind__: 'err', err: 'Linked user account missing' };
        }

        if (user.is_banned) {
          return { __kind__: 'err', err: 'Account is banned' };
        }

        return { __kind__: 'ok', ok: existingLink.user_id as UserId };
      }

      // First-time Google sign-in: create a new user account
      const localPart = email.split('@')[0] || googleSub;
      const baseUsername = localPart.length > 20 ? localPart.substring(0, 20) : localPart;
      const uniqueUsername = await this.resolveUniqueUsername(baseUsername);

      const userId = uuidv4() as UserId;
      const now = Date.now();

      // Create user
      const { error: userError } = await supabaseAdmin.from('users').insert({
        id: userId,
        username: uniqueUsername,
        email,
        display_name: uniqueUsername,
        avatar_url: '',
        role: 'user',
        language: 'en',
        dark_mode: true,
        created_at: new Date(now).toISOString(),
        is_banned: false
      });

      if (userError) {
        console.error('Error creating user from Google OAuth:', userError);
        return { __kind__: 'err', err: 'Failed to create user' };
      }

      // Register a pseudo-credential so the username is reserved
      const { error: credError } = await supabaseAdmin.from('credentials').insert({
        user_id: userId,
        username: uniqueUsername,
        password_hash: '', // no password for Google-only accounts
        salt: '',
        created_at: new Date(now).toISOString()
      });

      if (credError) {
        console.error('Error creating pseudo-credential:', credError);
      }

      // Store the OAuth link
      const { error: linkError } = await supabaseAdmin.from('google_oauth_links').insert({
        user_id: userId,
        google_sub: googleSub,
        email,
        linked_at: new Date(now).toISOString()
      });

      if (linkError) {
        console.error('Error creating Google OAuth link:', linkError);
      }

      return { __kind__: 'ok', ok: userId };
    } catch (error) {
      console.error('Error in verifyGoogleOAuth:', error);
      return { __kind__: 'err', err: 'Google OAuth verification failed' };
    }
  }

  /**
   * Delete a user account
   */
  async deleteAccount(userId: UserId): Promise<{ __kind__: 'ok' } | { __kind__: 'err'; err: string }> {
    try {
      // Verify user exists
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { __kind__: 'err', err: 'User not found' };
      }

      // Delete credential
      await supabaseAdmin.from('credentials').delete().eq('user_id', userId);

      // Delete Google OAuth links
      await supabaseAdmin.from('google_oauth_links').delete().eq('user_id', userId);

      // Delete user
      await supabaseAdmin.from('users').delete().eq('id', userId);

      return { __kind__: 'ok' };
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      return { __kind__: 'err', err: 'Failed to delete account' };
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: UserId): Promise<UserPublic | null> {
    try {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        language: user.language,
        darkMode: user.dark_mode,
        createdAt: new Date(user.created_at).getTime(),
        isBanned: user.is_banned,
        facebookUrl: user.facebook_url || undefined,
        tiktokUrl: user.tiktok_url || undefined
      };
    } catch (error) {
      console.error('Error in getUser:', error);
      return null;
    }
  }

  /**
   * Find a unique username by appending "_N" if the base is already taken
   * Migrated from: resolveUniqueUsername in auth-api.mo
   */
  private async resolveUniqueUsername(base: string): Promise<string> {
    let candidate = base;
    let n = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('credentials')
        .select('username')
        .eq('username', candidate)
        .single();

      if (!existing) {
        return candidate;
      }

      candidate = `${base}_${n}`;
      n++;
    }
  }
}

export const authService = new AuthService();

