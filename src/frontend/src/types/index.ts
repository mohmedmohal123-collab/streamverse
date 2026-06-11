export type Language = "en" | "ar";
export type Platform = "youtube" | "vimeo" | "tiktok";
export type UserRole = "user" | "admin";
export type SubscriptionTier = "free" | "premium" | "pro";

export interface VideoProvider {
  id: string;
  name: string;
  canDownload: boolean;
  searchEnabled: boolean;
}

export interface UnifiedVideo {
  id: string;
  title: string;
  thumbnail: string;
  streamUrl: string;
  downloadUrl: string | null;
  canDownload: boolean;
  source: string;
  provider: string;
  duration?: string;
  views?: number;
}

export interface DownloadProgress {
  stage: "idle" | "fetching" | "downloading" | "complete" | "error";
  percent: number;
  error?: {
    httpStatus?: number;
    providerError?: string;
    failureStage: string;
    userMessage: string;
  };
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  language: Language;
  darkMode: boolean;
  createdAt: bigint;
  isBanned: boolean;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export interface UpdateProfileInput {
  displayName: string;
  avatarUrl: string;
  email: string;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export interface UserSettings {
  language: Language;
  darkMode: boolean;
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  viewCount: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
  platform: Platform;
}

export interface WatchHistoryEntry {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  watchedAt: bigint;
  platform: Platform;
}

export interface TrendingEntry {
  video: VideoMetadata;
  watchCount: bigint;
}

export interface AdminStats {
  totalUsers: bigint;
  totalWatchEvents: bigint;
  trendingCount: bigint;
  bannedUsers: bigint;
}
export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  videoIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PlaylistVideo {
  playlistId: string;
  videoId: string;
}
