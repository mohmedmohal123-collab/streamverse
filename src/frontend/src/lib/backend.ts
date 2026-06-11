import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";

export function useActor(): { actor: backendInterface | null; isFetching: boolean } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _useActor(createActor as any) as { actor: backendInterface | null; isFetching: boolean };
}

// ─── YouTube API Key ─────────────────────────────────────────────────────────

const YOUTUBE_API_KEY_STORAGE = "streamverse_yt_api_key";

export function getYouTubeApiKeySync(): string {
  return localStorage.getItem(YOUTUBE_API_KEY_STORAGE) ?? "";
}

export async function getYouTubeApiKey(
  actor?: backendInterface | null,
): Promise<string> {
  const cached = localStorage.getItem(YOUTUBE_API_KEY_STORAGE) ?? "";
  if (cached) return cached;

  if (actor) {
    try {
      const key: string = await actor.getYouTubeApiKey();
      if (key) {
        localStorage.setItem(YOUTUBE_API_KEY_STORAGE, key);
        return key;
      }
    } catch {
      // ignore backend errors
    }
  }

  return "";
}

export function setYouTubeApiKey(key: string): void {
  localStorage.setItem(YOUTUBE_API_KEY_STORAGE, key);
}

// ─── Vimeo API Key ───────────────────────────────────────────────────────────

const VIMEO_API_KEY_STORAGE = "streamverse_vimeo_api_key";

export function getVimeoApiKeySync(): string {
  return localStorage.getItem(VIMEO_API_KEY_STORAGE) ?? "";
}

export async function getVimeoApiKey(
  actor?: backendInterface | null,
): Promise<string> {
  const cached = localStorage.getItem(VIMEO_API_KEY_STORAGE) ?? "";
  if (cached) return cached;

  if (actor) {
    try {
      // getVimeoApiKey is added in the new backend version; guard for older deploys
      const actorAny = actor as unknown as Record<string, unknown>;
      if (typeof actorAny["getVimeoApiKey"] === "function") {
        const key = await (actorAny["getVimeoApiKey"] as () => Promise<string>)();
        if (key) {
          localStorage.setItem(VIMEO_API_KEY_STORAGE, key);
          return key;
        }
      }
    } catch {
      // ignore backend errors
    }
  }

  return "";
}

export function setVimeoApiKey(key: string): void {
  localStorage.setItem(VIMEO_API_KEY_STORAGE, key);
}

// ─── TikTok API Key ───────────────────────────────────────────────────────────

const TIKTOK_API_KEY_STORAGE = "streamverse_tiktok_api_key";

export function getTikTokApiKeySync(): string {
  return localStorage.getItem(TIKTOK_API_KEY_STORAGE) ?? "";
}

export async function getTikTokApiKey(
  actor?: backendInterface | null,
): Promise<string> {
  const cached = localStorage.getItem(TIKTOK_API_KEY_STORAGE) ?? "";
  if (cached) return cached;

  if (actor) {
    try {
      const actorAny = actor as unknown as Record<string, unknown>;
      if (typeof actorAny["getTikTokApiKey"] === "function") {
        const key = await (actorAny["getTikTokApiKey"] as () => Promise<string>)();
        if (key) {
          localStorage.setItem(TIKTOK_API_KEY_STORAGE, key);
          return key;
        }
      }
    } catch {
      // ignore
    }
  }

  return "";
}

export function setTikTokApiKey(key: string): void {
  localStorage.setItem(TIKTOK_API_KEY_STORAGE, key);
}

// ─── Video Provider Architecture ────────────────────────────────────────────

/**
 * Extensible video provider interface.
 * Built-in providers (youtube, vimeo, tiktok) are always available.
 * Custom providers are stored in localStorage and use RapidAPI.
 */
export interface VideoProvider {
  id: string;
  name: string;
  nameAr: string;
  type: "youtube" | "vimeo" | "tiktok" | "rapidapi-generic";
  rapidApiHost?: string;
  rapidApiKey?: string;
  searchEndpoint?: string;
  enabled: boolean;
}

const CUSTOM_PROVIDERS_KEY = "streamverse_custom_providers";

export function getCustomProviders(): VideoProvider[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VideoProvider[];
  } catch {
    return [];
  }
}

export function saveCustomProviders(providers: VideoProvider[]): void {
  localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(providers));
}

/**
 * Returns the list of all currently configured/enabled providers.
 * Built-in providers are included when their API keys are set.
 */
export function getVideoProviders(): VideoProvider[] {
  const providers: VideoProvider[] = [
    {
      id: "youtube",
      name: "YouTube",
      nameAr: "يوتيوب",
      type: "youtube",
      enabled: !!getYouTubeApiKeySync(),
    },
    {
      id: "vimeo",
      name: "Vimeo",
      nameAr: "فيميو",
      type: "vimeo",
      enabled: !!getVimeoApiKeySync(),
    },
    {
      id: "tiktok",
      name: "TikTok",
      nameAr: "تيك توك",
      type: "tiktok",
      enabled: !!getTikTokApiKeySync(),
    },
    ...getCustomProviders(),
  ];
  return providers;
}

// ─── Google Client ID ─────────────────────────────────────────────────────────

const GOOGLE_CLIENT_ID_STORAGE = "streamverse_google_client_id";

export function getGoogleClientId(): string {
  return localStorage.getItem(GOOGLE_CLIENT_ID_STORAGE) ?? "";
}

export function setGoogleClientId(id: string): void {
  if (id) {
    localStorage.setItem(GOOGLE_CLIENT_ID_STORAGE, id);
  } else {
    localStorage.removeItem(GOOGLE_CLIENT_ID_STORAGE);
  }
}

// ─── Admin credential cache (for API key auth fallback) ───────────────────────
// After admin login, we cache username + passwordHash so the admin panel
// can use credential-based auth when saving API keys.

const ADMIN_CRED_USER_STORAGE = "streamverse_admin_cred_user";
const ADMIN_CRED_HASH_STORAGE = "streamverse_admin_cred_hash";

export function cacheAdminCredentials(username: string, passwordHash: string): void {
  localStorage.setItem(ADMIN_CRED_USER_STORAGE, username);
  localStorage.setItem(ADMIN_CRED_HASH_STORAGE, passwordHash);
}

export function getCachedAdminCredentials(): { username: string; passwordHash: string } | null {
  const username = localStorage.getItem(ADMIN_CRED_USER_STORAGE);
  const passwordHash = localStorage.getItem(ADMIN_CRED_HASH_STORAGE);
  if (username && passwordHash) return { username, passwordHash };
  return null;
}

export function clearAdminCredentials(): void {
  localStorage.removeItem(ADMIN_CRED_USER_STORAGE);
  localStorage.removeItem(ADMIN_CRED_HASH_STORAGE);
}
// ─── Dailymotion API Key ─────────────────────────────────────────────────────

const DAILYMOTION_API_KEY_STORAGE = "streamverse_dailymotion_api_key";

export function getDailymotionApiKeySync(): string {
  return localStorage.getItem(DAILYMOTION_API_KEY_STORAGE) ?? "";
}

export async function getDailymotionApiKey(
  actor?: backendInterface | null,
): Promise<string> {
  const cached = localStorage.getItem(DAILYMOTION_API_KEY_STORAGE) ?? "";
  if (cached) return cached;
  if (actor) {
    try {
      const actorAny = actor as unknown as Record<string, unknown>;
      if (typeof actorAny["getDailymotionApiKey"] === "function") {
        const key = await (actorAny["getDailymotionApiKey"] as () => Promise<string>)();
        if (key) {
          localStorage.setItem(DAILYMOTION_API_KEY_STORAGE, key);
          return key;
        }
      }
    } catch { /* ignore */ }
  }
  return "";
}

export async function setDailymotionApiKey(
  key: string,
  token: string,
  actor?: backendInterface | null,
): Promise<boolean> {
  if (!actor) return false;
  try {
    const actorAny = actor as unknown as Record<string, unknown>;
    if (typeof actorAny["setDailymotionApiKeyByToken"] === "function") {
      const res = await (actorAny["setDailymotionApiKeyByToken"] as (
        k: string,
        t: string,
      ) => Promise<{ __kind__: "ok" | "err"; ok?: string; err?: string }>)(
        key,
        token,
      );
      if (res.__kind__ === "ok") {
        localStorage.setItem(DAILYMOTION_API_KEY_STORAGE, key);
        return true;
      }
    }
  } catch { /* ignore */ }
  return false;
}

// ─── Archive Enabled ─────────────────────────────────────────────────────────

const ARCHIVE_ENABLED_STORAGE = "streamverse_archive_enabled";

export function getArchiveEnabledSync(): boolean {
  return localStorage.getItem(ARCHIVE_ENABLED_STORAGE) === "true";
}

export async function getArchiveEnabled(
  actor?: backendInterface | null,
): Promise<boolean> {
  const cached = localStorage.getItem(ARCHIVE_ENABLED_STORAGE);
  if (cached !== null) return cached === "true";
  if (actor) {
    try {
      const actorAny = actor as unknown as Record<string, unknown>;
      if (typeof actorAny["getArchiveEnabled"] === "function") {
        const val = await (actorAny["getArchiveEnabled"] as () => Promise<boolean>)();
        localStorage.setItem(ARCHIVE_ENABLED_STORAGE, String(val));
        return val;
      }
    } catch { /* ignore */ }
  }
  return false;
}

export async function setArchiveEnabled(
  enabled: boolean,
  token: string,
  actor?: backendInterface | null,
): Promise<boolean> {
  if (!actor) return false;
  try {
    const actorAny = actor as unknown as Record<string, unknown>;
    if (typeof actorAny["setArchiveEnabled"] === "function") {
      const res = await (actorAny["setArchiveEnabled"] as (
        e: boolean,
        t: string,
      ) => Promise<{ __kind__: "ok" | "err"; ok?: string; err?: string }>)(
        enabled,
        token,
      );
      if (res.__kind__ === "ok") {
        localStorage.setItem(ARCHIVE_ENABLED_STORAGE, String(enabled));
        return true;
      }
    }
  } catch { /* ignore */ }
  return false;
}

// ─── Provider Enabled ────────────────────────────────────────────────────────

export async function getProviderEnabled(
  provider: string,
  actor?: backendInterface | null,
): Promise<boolean> {
  if (!actor) return true;
  try {
    const actorAny = actor as unknown as Record<string, unknown>;
    if (typeof actorAny["getProviderEnabled"] === "function") {
      return await (actorAny["getProviderEnabled"] as (p: string) => Promise<boolean>)(
        provider,
      );
    }
  } catch { /* ignore */ }
  return true;
}

export async function setProviderEnabled(
  provider: string,
  enabled: boolean,
  token: string,
  actor?: backendInterface | null,
): Promise<boolean> {
  if (!actor) return false;
  try {
    const actorAny = actor as unknown as Record<string, unknown>;
    if (typeof actorAny["setProviderEnabled"] === "function") {
      const res = await (actorAny["setProviderEnabled"] as (
        p: string,
        e: boolean,
        t: string,
      ) => Promise<{ __kind__: "ok" | "err"; ok?: string; err?: string }>)(
        provider,
        enabled,
        token,
      );
      return res.__kind__ === "ok";
    }
  } catch { /* ignore */ }
  return false;
}

// ─── Download Analytics ──────────────────────────────────────────────────────

export interface DownloadAnalytics {
  totalDownloads: bigint;
  totalErrors: bigint;
  providerBreakdown: Array<{ provider: string; count: bigint }>;
}

export async function getDownloadAnalytics(
  actor?: backendInterface | null,
): Promise<DownloadAnalytics | null> {
  if (!actor) return null;
  try {
    const actorAny = actor as unknown as Record<string, unknown>;
    if (typeof actorAny["getDownloadAnalytics"] === "function") {
      return await (actorAny["getDownloadAnalytics"] as () => Promise<DownloadAnalytics>)();
    }
  } catch { /* ignore */ }
  return null;
}

// ─── Can User Download ───────────────────────────────────────────────────────

export async function canUserDownload(
  userId: string,
  actor?: backendInterface | null,
): Promise<{ allowed: boolean; reason?: string }> {
  if (!actor) return { allowed: true };
  try {
    const actorAny = actor as unknown as Record<string, unknown>;
    if (typeof actorAny["canUserDownload"] === "function") {
      const res = await (actorAny["canUserDownload"] as (
        u: string,
      ) => Promise<{ allowed: boolean; reason?: string }>)(userId);
      return res;
    }
  } catch { /* ignore */ }
  return { allowed: true };
}

// ─── RapidAPI Download Key ───────────────────────────────────────────────────

const RAPIDAPI_DOWNLOAD_KEY_STORAGE = "streamverse_rapidapi_download_key";

export function getDownloadRapidApiKey(): string {
  return localStorage.getItem(RAPIDAPI_DOWNLOAD_KEY_STORAGE) ?? "";
}

export function setDownloadRapidApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(RAPIDAPI_DOWNLOAD_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(RAPIDAPI_DOWNLOAD_KEY_STORAGE);
  }
}

// ─── Download Limit (localStorage-based) ────────────────────────────────────

const DOWNLOAD_LIMIT_KEY = "streamverse_dl_limit";
const DAILY_LIMIT_ADMIN_KEY = "dailyDownloadLimit";

export function getAdminDailyDownloadLimit(): number {
  const v = parseInt(localStorage.getItem(DAILY_LIMIT_ADMIN_KEY) ?? "", 10);
  return Number.isFinite(v) && v > 0 ? v : FREE_USER_DAILY_LIMIT;
}

export function setAdminDailyDownloadLimit(n: number): void {
  localStorage.setItem(DAILY_LIMIT_ADMIN_KEY, String(n));
}

const FREE_USER_DAILY_LIMIT = 3;

interface DLRecord { date: string; count: number }

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export interface DownloadLimitInfo {
  used: number;
  limit: number;
  remaining: number;
}

export function getDownloadLimitInfo(): DownloadLimitInfo {
  const limit = getAdminDailyDownloadLimit();
  try {
    const raw = localStorage.getItem(DOWNLOAD_LIMIT_KEY);
    if (raw) {
      const rec = JSON.parse(raw) as DLRecord;
      if (rec.date === getTodayKey()) {
        const used = rec.count;
        const remaining = Math.max(0, limit - used);
        return { used, limit, remaining };
      }
    }
  } catch {
    // ignore
  }
  return { used: 0, limit, remaining: limit };
}

export function recordDownloadLocal(): void {
  try {
    const today = getTodayKey();
    const raw = localStorage.getItem(DOWNLOAD_LIMIT_KEY);
    let count = 0;
    if (raw) {
      const rec = JSON.parse(raw) as DLRecord;
      if (rec.date === today) count = rec.count;
    }
    localStorage.setItem(DOWNLOAD_LIMIT_KEY, JSON.stringify({ date: today, count: count + 1 }));
  } catch {
    // ignore
  }
}


// ─── Shared result type ───────────────────────────────────────────────────────

export interface VideoSearchResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  platform: "youtube" | "vimeo" | "tiktok";
}

// Keep backward-compat alias
export type YouTubeSearchResult = VideoSearchResult;

// ─── YouTube Search ───────────────────────────────────────────────────────────

export async function searchYouTube(
  query: string,
  maxResults = 20,
  actor?: backendInterface | null,
): Promise<VideoSearchResult[]> {
  const apiKey = await getYouTubeApiKey(actor);
  if (!apiKey) {
    throw new Error("YouTube API key not configured");
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    throw new Error("YouTube search failed");
  }
  const searchData = await searchRes.json() as {
    items: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
        channelTitle: string;
        publishedAt: string;
      };
    }>;
  };

  const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
  if (!videoIds) return [];

  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json() as {
    items: Array<{
      id: string;
      statistics: { viewCount?: string };
      contentDetails: { duration: string };
    }>;
  };

  const statsMap: Record<string, { viewCount: string; duration: string }> = {};
  for (const item of statsData.items) {
    statsMap[item.id] = {
      viewCount: formatViewCount(item.statistics.viewCount ?? "0"),
      duration: parseDuration(item.contentDetails.duration),
    };
  }

  return searchData.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    viewCount: statsMap[item.id.videoId]?.viewCount ?? "0",
    duration: statsMap[item.id.videoId]?.duration ?? "0:00",
    platform: "youtube" as const,
  }));
}

// ─── Vimeo Search ─────────────────────────────────────────────────────────────

interface VimeoSearchResponse {
  data: Array<{
    uri: string;
    name: string;
    description: string | null;
    duration: number;
    created_time: string;
    pictures: { sizes: Array<{ width: number; link: string }> };
    stats: { plays: number | null };
    user: { name: string };
  }>;
}

export async function searchVimeo(
  query: string,
  maxResults = 20,
  actor?: backendInterface | null,
): Promise<VideoSearchResult[]> {
  const apiKey = await getVimeoApiKey(actor);
  if (!apiKey) {
    throw new Error("Vimeo API key not configured");
  }

  const url = `https://api.vimeo.com/videos?query=${encodeURIComponent(query)}&per_page=${maxResults}&fields=uri,name,duration,created_time,pictures,stats,user`;
  const res = await fetch(url, {
    headers: {
      Authorization: `bearer ${apiKey}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
  });

  if (!res.ok) {
    throw new Error("Vimeo search failed");
  }

  const data = await res.json() as VimeoSearchResponse;

  return data.data.map((item) => {
    const idMatch = item.uri.match(/\/videos\/(\d+)/);
    const videoId = idMatch ? idMatch[1] : item.uri;
    const thumb =
      item.pictures.sizes.find((s) => s.width >= 640)?.link ??
      item.pictures.sizes[item.pictures.sizes.length - 1]?.link ??
      "";

    return {
      videoId,
      title: item.name,
      thumbnailUrl: thumb,
      channelTitle: item.user.name,
      publishedAt: item.created_time,
      viewCount: formatViewCount(String(item.stats.plays ?? 0)),
      duration: formatVimeoDuration(item.duration),
      platform: "vimeo" as const,
    };
  });
}

// ─── TikTok Search ───────────────────────────────────────────────────────────

const TIKTOK_CACHE_KEY = "streamverse_tiktok_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: VideoSearchResult[];
  timestamp: number;
  query: string;
}

function readCache(key: string, query: string): VideoSearchResult[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (entry.query !== query) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(key: string, query: string, data: VideoSearchResult[]): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), query }));
  } catch {
    // ignore
  }
}

export async function searchTikTok(
  query: string,
  maxResults = 20,
  actor?: backendInterface | null,
): Promise<VideoSearchResult[]> {
  const cached = readCache(TIKTOK_CACHE_KEY, query);
  if (cached) return cached;

  const apiKey = await getTikTokApiKey(actor);
  if (!apiKey) return [];

  // Try multiple TikTok RapidAPI endpoints in order
  const endpoints = [
    {
      url: `https://tiktok-scraper7.p.rapidapi.com/feed/search?keywords=${encodeURIComponent(query)}&count=${maxResults}&cursor=0`,
      host: "tiktok-scraper7.p.rapidapi.com",
    },
    {
      url: `https://tiktok-api23.p.rapidapi.com/api/search/video?keywords=${encodeURIComponent(query)}&count=${maxResults}&cursor=0`,
      host: "tiktok-api23.p.rapidapi.com",
    },
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": endpoint.host,
        },
      });

      if (!res.ok) {
        console.log(`[TikTok] ${endpoint.host} returned HTTP ${res.status}`);
        continue;
      }

      // biome-ignore lint/suspicious/noExplicitAny: flexible RapidAPI response parsing
      const data = await res.json() as Record<string, any>;
      console.log(`[TikTok] ${endpoint.host} response keys:`, Object.keys(data));

      // Try all known response shapes
      // Shape 1: { data: { videos: [...] } }
      let videoArr =
        data?.data?.videos ??
        // Shape 2: { data: [...] } (array directly under data)
        (Array.isArray(data?.data) ? data.data : null) ??
        // Shape 3: { videos: [...] }
        data?.videos ??
        // Shape 4: { items: [...] }
        data?.items ??
        // Shape 5: { result: [...] }
        data?.result ??
        // Shape 6: { aweme_list: [...] } (TikTok internal)
        data?.aweme_list ??
        null;

      // Shape 7: deeply nested { data: { data: [...] } }
      if (!videoArr && data?.data?.data && Array.isArray(data.data.data)) {
        videoArr = data.data.data;
      }

      if (!videoArr || !Array.isArray(videoArr) || videoArr.length === 0) {
        console.log(`[TikTok] ${endpoint.host} no video array found in response`);
        continue;
      }

      console.log(`[TikTok] ${endpoint.host} found ${videoArr.length} videos`);

      // biome-ignore lint/suspicious/noExplicitAny: dynamic API response
      const results: VideoSearchResult[] = (videoArr as Record<string, unknown>[]).slice(0, maxResults).map((v) => ({
        videoId: String(v.video_id ?? v.id ?? v.aweme_id ?? ""),
        title: String(v.title ?? v.desc ?? v.caption ?? v.description ?? query),
        thumbnailUrl: String(
          v.cover ?? v.thumbnail ?? v.cover_url ??
          (v.video as Record<string, unknown> | undefined)?.cover ??
          ""
        ),
        channelTitle: String(
          (v.author as Record<string, unknown> | undefined)?.nickname ??
          (v.author as Record<string, unknown> | undefined)?.unique_id ??
          v.author_name ?? (v.user as Record<string, unknown> | undefined)?.nickname ?? "TikTok"
        ),
        publishedAt: v.create_time
          ? new Date(Number(v.create_time) * 1000).toISOString()
          : new Date().toISOString(),
        viewCount: formatViewCount(
          String(
            (v.stats as Record<string, unknown> | undefined)?.playCount ??
            v.play_count ??
            (v.statistics as Record<string, unknown> | undefined)?.play_count ?? 0
          )
        ),
        duration: v.duration
          ? formatVimeoDuration(Math.round(Number(v.duration)))
          : "",
        platform: "tiktok" as const,
      }));

      writeCache(TIKTOK_CACHE_KEY, query, results);
      return results;
    } catch (err) {
      console.log(`[TikTok] ${endpoint.host} error:`, err);
    }
  }

  console.log("[TikTok] All endpoints failed");
  return [];
}

// ─── Generic RapidAPI Provider Search ────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: flexible RapidAPI response parsing
function parseGenericRapidApiResponse(data: Record<string, any>, query: string, maxResults: number, providerId: string): VideoSearchResult[] | null {
  // Generic response shape detection
  const vlist: unknown[] | null =
    (Array.isArray(data?.data?.vlist) ? data.data.vlist : null) ??
    (Array.isArray(data?.vlist) ? data.vlist : null) ??
    (Array.isArray(data?.videoList) ? data.videoList : null) ??
    (Array.isArray(data?.result?.list) ? data.result.list : null) ??
    (Array.isArray(data?.items) ? data.items : null) ??
    (Array.isArray(data?.videos) ? data.videos : null) ??
    (Array.isArray(data?.result) ? data.result : null) ??
    (Array.isArray(data?.results) ? data.results : null) ??
    (Array.isArray(data?.data) ? data.data : null) ??
    (Array.isArray(data?.data?.videos) ? data.data.videos : null) ??
    (Array.isArray(data?.data?.items) ? data.data.items : null) ??
    (Array.isArray(data?.data?.results) ? data.data.results : null) ??
    null;
  if (!vlist || vlist.length === 0) return null;
  // biome-ignore lint/suspicious/noExplicitAny: dynamic API response
  return (vlist as Record<string, any>[]).slice(0, maxResults).map((v) => ({
    videoId: String(v.id ?? v.video_id ?? v.videoId ?? v.photo_id ?? ""),
    title: String(v.title ?? v.caption ?? v.description ?? v.desc ?? query),
    thumbnailUrl: String(
      v.thumbnail ?? v.cover_url ?? v.cover ?? v.poster ?? v.image_url ?? ""
    ),
    channelTitle: String(
      (v.author as Record<string, unknown> | undefined)?.name ??
      (v.author as Record<string, unknown> | undefined)?.nickname ??
      v.author_name ?? v.channel ?? "Video"
    ),
    publishedAt: v.created_at ?? v.timestamp
      ? new Date(Number(v.created_at ?? v.timestamp) * 1000).toISOString()
      : new Date().toISOString(),
    viewCount: formatViewCount(
      String(v.views ?? v.view_count ?? v.play_count ?? v.playCount ?? 0)
    ),
    duration: v.duration ? formatVimeoDuration(Math.round(Number(v.duration))) : "0:00",
    platform: providerId as VideoSearchResult["platform"],
  }));
}

// ─── Trending ─────────────────────────────────────────────────────────────────

export async function getTrendingVideos(
  maxResults = 12,
  actor?: backendInterface | null,
): Promise<VideoSearchResult[]> {
  const apiKey = await getYouTubeApiKey(actor);
  if (!apiKey) return getSampleTrendingVideos();

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}&regionCode=SA&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return getSampleTrendingVideos();
  const data = await res.json() as {
    items: Array<{
      id: string;
      snippet: {
        title: string;
        thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
        channelTitle: string;
        publishedAt: string;
      };
      statistics: { viewCount?: string };
      contentDetails: { duration: string };
    }>;
  };

  return data.items.map((item) => ({
    videoId: item.id,
    title: item.snippet.title,
    thumbnailUrl:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    viewCount: formatViewCount(item.statistics.viewCount ?? "0"),
    duration: parseDuration(item.contentDetails.duration),
    platform: "youtube" as const,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatViewCount(count: string): string {
  const n = parseInt(count, 10);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatVimeoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Playlist Helpers ──────────────────────────────────────────────────────────────────

export interface PlaylistData {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  videoIds: string[];
  createdAt: number;
  updatedAt: number;
}

const PLAYLIST_CACHE_PREFIX = "streamverse_playlists_";

function savePlaylistCache(userId: string, playlists: PlaylistData[]): void {
  try {
    localStorage.setItem(`${PLAYLIST_CACHE_PREFIX}${userId}`, JSON.stringify(playlists));
  } catch {
    // ignore
  }
}

export async function getMyPlaylists(
  userId: string,
  actor?: backendInterface | null,
): Promise<PlaylistData[]> {
  const cached = localStorage.getItem(`${PLAYLIST_CACHE_PREFIX}${userId}`);
  let offline: PlaylistData[] = [];
  if (cached) {
    try { offline = JSON.parse(cached) as PlaylistData[]; } catch { /* ok */ }
  }
  if (!actor || !userId) return offline;
  try {
    const raw = await actor.getUserPlaylists(userId);
    const result: PlaylistData[] = raw.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.name,
      description: p.description,
      isPublic: p.isPublic,
      videoIds: p.videoIds,
      createdAt: Number(p.createdAt),
      updatedAt: Number(p.updatedAt),
    }));
    savePlaylistCache(userId, result);
    return result;
  } catch {
    return offline;
  }
}

export async function createMyPlaylist(
  userId: string,
  name: string,
  desc: string,
  isPublic: boolean,
  token: string,
  actor?: backendInterface | null,
): Promise<string | null> {
  if (!actor) return null;
  try {
    const res = await actor.createPlaylist(userId, name, desc, isPublic, token);
    if (res.__kind__ === "ok") return res.ok;
    return null;
  } catch {
    return null;
  }
}

export async function addToPlaylist(
  playlistId: string,
  videoId: string,
  userId: string,
  token: string,
  actor?: backendInterface | null,
): Promise<boolean> {
  if (!actor) return false;
  try {
    const res = await actor.addVideoToPlaylist(playlistId, videoId, userId, token);
    return res.__kind__ === "ok";
  } catch {
    return false;
  }
}

export async function removeFromPlaylist(
  playlistId: string,
  videoId: string,
  userId: string,
  token: string,
  actor?: backendInterface | null,
): Promise<boolean> {
  if (!actor) return false;
  try {
    const res = await actor.removeVideoFromPlaylist(playlistId, videoId, userId, token);
    return res.__kind__ === "ok";
  } catch {
    return false;
  }
}

export function getSampleTrendingVideos(): VideoSearchResult[] {
  return [
    {
      videoId: "dQw4w9WgXcQ",
      title: "The Future of AI: What's Coming in 2025",
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      channelTitle: "Tech Insights",
      publishedAt: "2025-03-15T10:00:00Z",
      viewCount: "2.4M",
      duration: "18:32",
      platform: "youtube",
    },
    {
      videoId: "9bZkp7q19f0",
      title: "Top 10 Movies You Must Watch This Year",
      thumbnailUrl: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg",
      channelTitle: "Cinema World",
      publishedAt: "2025-04-01T14:00:00Z",
      viewCount: "1.8M",
      duration: "22:45",
      platform: "youtube",
    },
    {
      videoId: "kJQP7kiw5Fk",
      title: "Epic Gaming Moments Compilation 2025",
      thumbnailUrl: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
      channelTitle: "GamersHub",
      publishedAt: "2025-04-10T16:30:00Z",
      viewCount: "892K",
      duration: "15:20",
      platform: "youtube",
    },
    {
      videoId: "RgKAFK5djSk",
      title: "Learn Arabic in 30 Minutes — Beginner Guide",
      thumbnailUrl: "https://img.youtube.com/vi/RgKAFK5djSk/hqdefault.jpg",
      channelTitle: "Language Academy",
      publishedAt: "2025-02-20T09:00:00Z",
      viewCount: "3.1M",
      duration: "31:00",
      platform: "youtube",
    },
    {
      videoId: "JGwWNGJdvx8",
      title: "Best Travel Destinations in the Middle East",
      thumbnailUrl: "https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg",
      channelTitle: "Travel Diaries",
      publishedAt: "2025-03-28T12:00:00Z",
      viewCount: "567K",
      duration: "25:14",
      platform: "youtube",
    },
    {
      videoId: "hT_nvWreIhg",
      title: "Cooking Masterclass: Authentic Arabic Cuisine",
      thumbnailUrl: "https://img.youtube.com/vi/hT_nvWreIhg/hqdefault.jpg",
      channelTitle: "Chef Khalid",
      publishedAt: "2025-04-05T11:00:00Z",
      viewCount: "1.2M",
      duration: "42:18",
      platform: "youtube",
    },
  ];
}
