/**
 * Authentication types matching the Motoko auth-api.mo interface
 * Maintains frontend compatibility with existing ICP types
 */

export type UserId = string; // UUID instead of Principal

export type AuthResult = 
  | { __kind__: 'ok'; ok: UserId }
  | { __kind__: 'err'; err: string };

export interface CredentialAuth {
  userId: UserId;
  passwordHash: string;
  salt: string;
  createdAt: number; // Unix timestamp in milliseconds
}

export interface GoogleOAuthLink {
  userId: UserId;
  googleSub: string;
  email: string;
  linkedAt: number; // Unix timestamp in milliseconds
}

export interface RegisterInput {
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

export interface UserPublic {
  id: UserId;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  language: 'en' | 'ar';
  darkMode: boolean;
  createdAt: number;
  isBanned: boolean;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export interface JwtPayload {
  userId: UserId;
  iat?: number;
  exp?: number;
}
