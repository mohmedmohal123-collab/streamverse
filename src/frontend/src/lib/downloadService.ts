/**
 * downloadService.ts
 * StreamVerse Video Provider Download Architecture
 *
 * Rules:
 * - Vimeo, Dailymotion, Internet Archive → direct blob download (allowed)
 * - YouTube, TikTok → return null immediately (NEVER attempt download)
 * - All downloads are client-side only via fetch → blob → anchor.click()
 * - X-RapidAPI-Key is sent in headers for RapidAPI endpoints
 */

export interface DownloadProgress {
  stage: string;
  percent: number;
  error?: {
    httpStatus?: number;
    providerError?: string;
    failureStage?: string;
    userMessage?: string;
  };
}

/** Hardcoded fallback RapidAPI key */
const DEFAULT_RAPIDAPI_KEY =
  "54ca2c15e4mshe644cf482a6a4edp19b3fajsn6ab22879e0db";

// ─── Logging ─────────────────────────────────────────────────────────────────

let _debugLog: DownloadLogEntry[] = [];

export function getDownloadDebugLog(): DownloadLogEntry[] {
  return [..._debugLog];
}

export function clearDownloadDebugLog(): void {
  _debugLog = [];
}

function logDownload(
  step: string,
  status: DownloadLogEntry["status"],
  message: string,
  details?: Record<string, unknown>,
): void {
  const entry: DownloadLogEntry = {
    timestamp: new Date().toISOString(),
    step,
    status,
    message,
    details,
  };
  _debugLog.push(entry);
  const consoleMethod =
    status === "error"
      ? console.error
      : status === "warning"
        ? console.warn
        : console.log;
  consoleMethod(`[Download:${step}] ${message}`, details ?? "");
}

function maskKey(key: string): string {
  if (!key || key.length < 12) return "***";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function classifyHttpError(status: number, bodyPreview?: string): string {
  if (status === 401 || status === 403)
    return `API authorization failed (HTTP ${status}). The RapidAPI key may be invalid, expired, or rate-limited.`;
  if (status === 404)
    return `Video not found on this endpoint (HTTP ${status}). The provider may have removed the video or changed its API.`;
  if (status === 429)
    return `Rate limit exceeded (HTTP ${status}). Too many requests to RapidAPI. Wait a minute and try again.`;
  if (status >= 500)
    return `RapidAPI server error (HTTP ${status}). The download service is temporarily unavailable.`;
  if (bodyPreview?.toLowerCase().includes("html"))
    return `API returned an HTML page instead of JSON (HTTP ${status}). The endpoint may be down or require different parameters.`;
  return `API request failed with HTTP ${status}.`;
}

export interface DownloadLogEntry {
  timestamp: string;
  step: string;
  status: "info" | "success" | "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
}

export interface DownloadResult {
  success: boolean;
  blobUrl?: string;
  blob?: Blob;
  filename?: string;
  directUrl?: string;
  error?: string;
  details?: string;
}

// ─── Provider: getVideoDownloadUrl ───────────────────────────────────────────

/**
 * Get a direct download URL for a video from an allowed provider.
 * Returns null immediately for YouTube and TikTok (download blocked).
 */
export async function getVideoDownloadUrl(
  videoId: string,
  provider: string,
  quality: string,
  rapidApiKey: string,
): Promise<string | null> {
  const key = rapidApiKey || DEFAULT_RAPIDAPI_KEY;
  const lowerProvider = provider.toLowerCase();

  logDownload("getVideoDownloadUrl", "info", "Resolving download URL", {
    provider: lowerProvider,
    videoId,
    quality,
    maskedKey: maskKey(key),
  });

  // ── BLOCKED: YouTube ────────────────────────────────────────────────
  if (lowerProvider === "youtube") {

  console.log("YOUTUBE RAPIDAPI CALLED", videoId);

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);

    const res = await fetch(
      `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": key,
          "X-RapidAPI-Host":
            "youtube-media-downloader.p.rapidapi.com",
        },
        signal: ctrl.signal,
      },
    );

    clearTimeout(timer);

    const bodyText = await res.text();

    logDownload(
      "getVideoDownloadUrl",
      res.ok ? "success" : "error",
      `YouTube API HTTP ${res.status}`,
      {
        bodyPreview: bodyText.slice(0, 500),
      },
    );

    if (!res.ok) {
      return null;
    }

    const data = JSON.parse(bodyText);

   console.log(
  "VIDEO QUALITIES:",
  data.videos?.items?.map((v:any) => ({
    quality: v.quality,
    width: v.width,
    height: v.height,
    url: v.url,
    downloadUrl: v.downloadUrl
  }))
);
console.log("AUDIOS:", data.audios);
console.log("FIRST VIDEO:", data.videos?.items?.[0]);
console.log("FIRST AUDIO:", data.audios?.items?.[0]);
console.log("FORMATS:", data.formats);
console.log("MUXED:", data.muxed);
console.log("FIRST VIDEO:", data.videos?.items?.[0]);
console.log(
  "VIDEO QUALITIES:",
  data.videos?.items?.map((v: any) => ({
    quality: v.quality,
    width: v.width,
    height: v.height,
    url: v.url,
    downloadUrl: v.downloadUrl,
  })),
);

    console.log(
  "YT API RESPONSE FULL:",
  JSON.stringify(data, null, 2)
);
console.log("YT KEYS:", Object.keys(data));

    const videos = data?.videos?.items ?? [];

if (!videos.length) {
  console.error("NO VIDEOS FOUND");
  return null;
}

const wantedHeight = Number(quality);

const selected =
  videos.find(
    (v: any) =>
      Number(v.height) === wantedHeight &&
      v.hasAudio === true,
  ) ||
  videos.find((v: any) => v.hasAudio === true) ||
  videos[0];

console.log("SELECTED FORMAT:", selected);

console.log(
  "RETURNING URL:",
  selected?.url?.substring(0, 120),
);

return selected?.url ?? null;
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : String(err);

    logDownload(
      "getVideoDownloadUrl",
      "error",
      `YouTube error: ${msg}`,
    );

    return null;
  }
}

  // ── BLOCKED: TikTok ─────────────────────────────────────────────────
  if (lowerProvider === "tiktok") {
    logDownload(
      "getVideoDownloadUrl",
      "warning",
      "TikTok download is blocked — stream only",
      { provider: lowerProvider },
    );
    return null;
  }

  // ── Vimeo ───────────────────────────────────────────────────────────
  if (lowerProvider === "vimeo") {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          Authorization: `bearer ${key}`,
          Accept: "application/vnd.vimeo.*+json;version=3.4",
        },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const bodyText = await res.text();
      logDownload(
        "getVideoDownloadUrl",
        res.ok ? "success" : "error",
        `Vimeo API HTTP ${res.status}`,
        { bodyPreview: bodyText.slice(0, 300) },
      );
      if (!res.ok) return null;
      const data = JSON.parse(bodyText) as {
        download?: Array<{ quality: string; link: string; type: string }>;
        files?: Array<{ quality: string; link: string; type: string }>;
      };
      const downloads = data.download ?? data.files ?? [];
      // Try exact quality match
      const qual = quality.replace("p", "");
      const match = downloads.find(
        (d) =>
          d.quality.includes(qual) ||
          d.quality.includes(quality) ||
          (qual === "720" && d.quality.includes("hd")),
      );
      if (match?.link) {
        logDownload(
          "getVideoDownloadUrl",
          "success",
          "Vimeo download URL resolved",
          { quality: match.quality },
        );
        return match.link;
      }
      // Fallback to first available
      const first = downloads.find((d) => d.link);
      if (first?.link) {
        logDownload(
          "getVideoDownloadUrl",
          "success",
          "Vimeo download URL resolved (fallback)",
          { quality: first.quality },
        );
        return first.link;
      }
      logDownload(
        "getVideoDownloadUrl",
        "warning",
        "Vimeo response has no download links",
      );
      return null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logDownload("getVideoDownloadUrl", "error", `Vimeo error: ${msg}`);
      return null;
    }
  }

  // ── Dailymotion ─────────────────────────────────────────────────────
  if (lowerProvider === "dailymotion") {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(
        `https://api.dailymotion.com/video/${videoId}?fields=stream_h264_url,stream_h264_hd_url,url`,
        { signal: ctrl.signal },
      );
      clearTimeout(timer);
      const bodyText = await res.text();
      logDownload(
        "getVideoDownloadUrl",
        res.ok ? "success" : "error",
        `Dailymotion API HTTP ${res.status}`,
        { bodyPreview: bodyText.slice(0, 300) },
      );
      if (!res.ok) return null;
      const data = JSON.parse(bodyText) as {
        stream_h264_url?: string;
        stream_h264_hd_url?: string;
        url?: string;
      };
      const url =
        data.stream_h264_hd_url ?? data.stream_h264_url ?? data.url ?? null;
      if (url) {
        logDownload(
          "getVideoDownloadUrl",
          "success",
          "Dailymotion stream URL resolved",
        );
      }
      return url ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logDownload("getVideoDownloadUrl", "error", `Dailymotion error: ${msg}`);
      return null;
    }
  }

  // ── Internet Archive ──────────────────────────────────────────────
  if (lowerProvider === "archive" || lowerProvider === "internetarchive") {
    const url = `https://archive.org/download/${videoId}/${videoId}.mp4`;
    logDownload(
      "getVideoDownloadUrl",
      "success",
      "Internet Archive direct URL constructed",
      { url },
    );
    return url;
  }

  logDownload(
    "getVideoDownloadUrl",
    "warning",
    `Unknown provider: ${lowerProvider}`,
  );
  return null;
}

// ─── Blob Download ─────────────────────────────────────────────────────────────

/**
 * Download a video file as a Blob using fetch with X-RapidAPI-Key headers.
 * Streams the response to show real progress percentage.
 */
export async function downloadVideo(
  url: string,
  filename: string,
  rapidApiKey: string,
  onProgress: (p: DownloadProgress) => void,
): Promise<void> {

if (
  url.includes("googlevideo.com") ||
  url.includes("youtube.com")
) {
  const res = await fetch(
    `https://streamverse-proxy.streamverseproxy.workers.dev/download?url=${encodeURIComponent(url)}`
  );

  const blob = await res.blob();

  const blobUrl = URL.createObjectURL(blob);

  triggerBlobDownload(blobUrl, filename);

  URL.revokeObjectURL(blobUrl);

  onProgress({
    stage: "complete",
    percent: 100,
  });
  return;
}

  const key = rapidApiKey || DEFAULT_RAPIDAPI_KEY;

  logDownload("downloadVideo", "info", "Starting blob download", {
    url: url.slice(0, 200),
    filename,
    maskedKey: maskKey(key),
  });

  onProgress({ stage: "fetching", percent: 5 });

  let res: Response;
  try {
    res = await fetch(url, {
      mode: "cors",
      headers: {
        "X-RapidAPI-Key": key,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isCors =
      err instanceof TypeError &&
      (msg.includes("CORS") ||
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError"));
    logDownload("downloadVideo", "error", `Fetch failed: ${msg}`, {
      isCors,
    });
    onProgress({
      stage: "error",
      percent: 0,
      error: {
        httpStatus: isCors ? 0 : undefined,
        providerError: msg,
        failureStage: "fetch",
        userMessage: isCors
          ? "تعذر التحميل بسبب قيود المتصفح (CORS) / Download blocked by browser (CORS)"
          : "فشل الاتصال بالخادم — تأكد من اتصال الإنترنت / Connection failed — check your internet",
      },
    });
    throw new Error(msg);
  }

  logDownload("downloadVideo", "info", `HTTP ${res.status}`, {
    statusText: res.statusText,
    contentType: res.headers.get("content-type"),
    contentLength: res.headers.get("content-length"),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    const errMsg = classifyHttpError(res.status, bodyText);
    logDownload("downloadVideo", "error", errMsg, {
      status: res.status,
      bodyPreview: bodyText.slice(0, 500),
    });
    onProgress({
      stage: "error",
      percent: 0,
      error: {
        httpStatus: res.status,
        providerError: errMsg,
        failureStage: "api-call",
        userMessage: `فشل التحميل (${res.status}) — ${errMsg} / Download failed (${res.status}) — ${errMsg}`,
      },
    });
    throw new Error(errMsg);
  }

  const contentLength = res.headers.get("content-length");
  const total = contentLength ? Number.parseInt(contentLength, 10) : 0;

  onProgress({ stage: "downloading", percent: 10 });

  if (!res.body) {
    // No streaming body — fallback to res.blob()
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    triggerBlobDownload(blobUrl, filename);
    URL.revokeObjectURL(blobUrl);
    onProgress({ stage: "complete", percent: 100 });
    logDownload(
      "downloadVideo",
      "success",
      "Download complete (no streaming)",
      {
        sizeBytes: blob.size,
      },
    );
    return;
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const result = await reader.read();
    if (result.done) break;
    chunks.push(result.value);
    loaded += result.value.length;
    const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
    onProgress({ stage: "downloading", percent: Math.max(10, percent) });
  }

  const contentType = res.headers.get("content-type") ?? "video/mp4";
  const blob = new Blob(chunks as BlobPart[], { type: contentType });
  const blobUrl = URL.createObjectURL(blob);
  triggerBlobDownload(blobUrl, filename);
  URL.revokeObjectURL(blobUrl);

  onProgress({ stage: "complete", percent: 100 });
  logDownload("downloadVideo", "success", "Download complete", {
    sizeBytes: blob.size,
    sizeMB: (blob.size / 1024 / 1024).toFixed(2),
  });
}

export function triggerBlobDownload(blobUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function triggerAnchorDownload(
  url: string,
  filename: string
): void {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
}

// ─── Legacy compatibility exports ────────────────────────────────────────────

/** Kept for backward compat — returns null for all blocked providers */
export async function getRapidApiYouTubeUrl(): Promise<{
  url: string | null;
  lastError: string;
}> {
  return { url: null, lastError: "YouTube download is blocked" };
}

/** Kept for backward compat — returns null for all blocked providers */
export async function getRapidApiDownloadUrl(): Promise<{
  url: string | null;
  lastError: string;
}> {
  return { url: null, lastError: "TikTok download is blocked" };
}

export function buildWatchUrl(platform: string, videoId: string): string {
  switch (platform) {
    case "vimeo":
      return `https://vimeo.com/${videoId}`;
    case "tiktok":
      return `https://www.tiktok.com/video/${videoId}`;
    default:
      return `https://www.youtube.com/watch?v=${videoId}`;
  }
}

export const DOWNLOAD_CONTENT_ERROR =
  "تعذر التحميل - يرجى المحاولة مرة أخرى / Download failed - please try again";
export const DOWNLOAD_CORS_ERROR =
  "تعذر التحميل بسبب قيود المتصفح (CORS) - يرجى المحاولة مرة أخرى / Download blocked by browser (CORS) - please try again";

// ─── Legacy wrapper for backward compatibility ─────────────────────────────────

export async function downloadVideoLegacy(params: {
  videoId: string;
  platform: string;
  quality: string;
  isAudio?: boolean;
  title?: string;
  onProgress?: (p: { loaded: number; total: number; percent: number }) => void;
}): Promise<{
  success: boolean;
  blobUrl?: string;
  directUrl?: string;
  filename?: string;
  blob?: Blob;
  details?: string;
  error?: string;
}> {
  if (params.platform === "tiktok") {
  return {
    success: false,
    error: "Stream only - download not available for this platform",
  };
}
  try {
    const rapidApiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("streamverse_rapidapi_key") || ""
        : "";
    const url = await getVideoDownloadUrl(
      params.videoId,
      params.platform,
      params.quality,
      rapidApiKey,
    );
    if (!url) return { success: false, error: "No download URL available" };
    let _lastProgress = 0;
    await downloadVideo(
      url,
      `${params.title || params.videoId}.mp4`,
      rapidApiKey,
      (p) => {
        if (params.onProgress)
          params.onProgress({
            loaded: p.percent,
            total: 100,
            percent: p.percent,
          });
        _lastProgress = p.percent;
        if (p.stage === "error")
          throw new Error(p.error?.userMessage || "Download failed");
      },
    );
    return {
      success: true,
      directUrl: url,
      filename: `${params.title || params.videoId}.mp4`,
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Download failed" };
  }
}
