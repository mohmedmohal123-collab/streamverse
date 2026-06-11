import { useCallback, useEffect, useState } from "react";
import type { backendInterface } from "../backend.d";
import { useActor } from "../lib/backend";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentTier = "free" | "plus" | "pro";

export interface PremiumVideoConfig {
  videoId: string;
  isPremium: boolean;
  requiredTier: ContentTier;
}

export interface ContentGatingSettings {
  enabled: boolean;
  defaultFreeVideosPerDay: number;
}

const STORAGE_KEY = "streamverse_content_gating";
const PREMIUM_VIDEOS_KEY = "streamverse_premium_videos";

// ─── localStorage helpers (fallback) ─────────────────────────────────────────

function loadSettingsLocal(): ContentGatingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ContentGatingSettings;
  } catch {
    // ignore
  }
  return { enabled: false, defaultFreeVideosPerDay: 5 };
}

function saveSettingsLocal(settings: ContentGatingSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadPremiumVideosLocal(): Record<string, PremiumVideoConfig> {
  try {
    const raw = localStorage.getItem(PREMIUM_VIDEOS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, PremiumVideoConfig>;
  } catch {
    // ignore
  }
  return {};
}

function savePremiumVideosLocal(map: Record<string, PremiumVideoConfig>): void {
  localStorage.setItem(PREMIUM_VIDEOS_KEY, JSON.stringify(map));
}

// ─── IC variant helpers ───────────────────────────────────────────────────────

/**
 * IC variant objects come back as {variantName: null} at runtime.
 * Safely extract the variant name string.
 */
function variantToString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length > 0) return keys[0];
  }
  return "";
}

// ─── Admin hook — for the admin panel ────────────────────────────────────────

export function useContentGatingAdmin() {
  const { actor } = useActor();
  const [settings, setSettings] =
    useState<ContentGatingSettings>(loadSettingsLocal);
  const [premiumVideos, setPremiumVideos] = useState<
    Record<string, PremiumVideoConfig>
  >(loadPremiumVideosLocal);

  // Load settings and premium video list from backend on mount
  useEffect(() => {
    if (!actor) return;

    // Fetch gating settings
    actor
      .getContentGatingSettings()
      .then((res) => {
        const s: ContentGatingSettings = {
          enabled: res.enabled,
          defaultFreeVideosPerDay: Number(res.defaultFreeVideosPerDay),
        };
        setSettings(s);
        saveSettingsLocal(s);
      })
      .catch(() => {
        // fall back to localStorage
      });

    // Fetch premium video ids
    actor
      .getPremiumVideoIds()
      .then((ids) => {
        const map: Record<string, PremiumVideoConfig> = {};
        for (const id of ids) {
          map[id] = { videoId: id, isPremium: true, requiredTier: "plus" };
        }
        // Merge with local cache to preserve tier info
        const local = loadPremiumVideosLocal();
        for (const id of ids) {
          map[id] = local[id] ?? {
            videoId: id,
            isPremium: true,
            requiredTier: "plus",
          };
        }
        setPremiumVideos(map);
        savePremiumVideosLocal(map);
      })
      .catch(() => {
        // fall back to localStorage
      });
  }, [actor]);

  const updateSettings = useCallback(
    (updates: Partial<ContentGatingSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...updates };
        saveSettingsLocal(next);
        // Persist to backend
        if (actor) {
          actor
            .setContentGatingSettings(
              next.enabled,
              BigInt(next.defaultFreeVideosPerDay),
            )
            .catch(() => {
              // best-effort; local state already updated
            });
        }
        return next;
      });
    },
    [actor],
  );

  const setPremiumVideo = useCallback(
    (videoId: string, isPremium: boolean, requiredTier: ContentTier) => {
      setPremiumVideos((prev) => {
        const next = { ...prev };
        if (!isPremium) {
          delete next[videoId];
        } else {
          next[videoId] = { videoId, isPremium, requiredTier };
        }
        savePremiumVideosLocal(next);
        return next;
      });

      // Persist to backend — map ContentTier string to SubscriptionTier variant
      if (actor) {
        const tierArg = tierStringToBackendVariant(requiredTier, actor);
        actor.setVideoPremium(videoId, isPremium, tierArg).catch(() => {
          // best-effort
        });
      }
    },
    [actor],
  );

  const removePremiumVideo = useCallback(
    (videoId: string) => {
      setPremiumVideos((prev) => {
        const next = { ...prev };
        delete next[videoId];
        savePremiumVideosLocal(next);
        return next;
      });

      // Remove from backend
      if (actor) {
        // Setting isPremium=false with any tier removes the entry
        const tierArg = tierStringToBackendVariant("free", actor);
        actor.setVideoPremium(videoId, false, tierArg).catch(() => {
          // best-effort
        });
      }
    },
    [actor],
  );

  return {
    settings,
    premiumVideos,
    updateSettings,
    setPremiumVideo,
    removePremiumVideo,
  };
}

// ─── Helpers to map tier strings ↔ backend SubscriptionTier variants ──────────

/**
 * The backend setVideoPremium expects a SubscriptionTier enum value.
 * At runtime these are IC variants. We pass the enum-compatible string.
 */
function tierStringToBackendVariant(
  tier: ContentTier,
  _actor: backendInterface,
): Parameters<backendInterface["setVideoPremium"]>[2] {
  // The generated bindings accept the enum string directly
  return tier as Parameters<backendInterface["setVideoPremium"]>[2];
}

// ─── User hook — for checking access ─────────────────────────────────────────

export type UserTier = "free" | "plus" | "pro";

const TIER_ORDER: Record<UserTier, number> = { free: 0, plus: 1, pro: 2 };

function tierSatisfies(userTier: UserTier, required: ContentTier): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[required];
}

export function useContentGating(videoId: string) {
  const { actor } = useActor();
  const [userTier, setUserTier] = useState<UserTier>("free");
  const [settings, setSettings] =
    useState<ContentGatingSettings>(loadSettingsLocal);
  const [premiumVideos, setPremiumVideos] = useState<
    Record<string, PremiumVideoConfig>
  >(loadPremiumVideosLocal);
  const [backendCanAccess, setBackendCanAccess] = useState<boolean | null>(
    null,
  );

  // Fetch subscription tier from backend
  useEffect(() => {
    if (!actor) return;
    actor
      .getMySubscription()
      .then((sub) => {
        if (sub) {
          // IC variants arrive as {variantName: null} at runtime; extract the key
          const statusStr = variantToString(sub.status);
          const tierStr = variantToString(sub.tier) as UserTier;
          if (statusStr === "active" && tierStr) {
            setUserTier(tierStr);
          } else {
            setUserTier("free");
          }
        } else {
          setUserTier("free");
        }
      })
      .catch(() => setUserTier("free"));
  }, [actor]);

  // Fetch content gating settings from backend
  useEffect(() => {
    if (!actor) return;
    actor
      .getContentGatingSettings()
      .then((res) => {
        const s: ContentGatingSettings = {
          enabled: res.enabled,
          defaultFreeVideosPerDay: Number(res.defaultFreeVideosPerDay),
        };
        setSettings(s);
        saveSettingsLocal(s);
      })
      .catch(() => {
        // fall back to localStorage
        setSettings(loadSettingsLocal());
      });
  }, [actor]);

  // Fetch premium video list from backend
  useEffect(() => {
    if (!actor || !videoId) return;
    actor
      .getPremiumVideoIds()
      .then((ids) => {
        const local = loadPremiumVideosLocal();
        const map: Record<string, PremiumVideoConfig> = {};
        for (const id of ids) {
          map[id] = local[id] ?? {
            videoId: id,
            isPremium: true,
            requiredTier: "plus",
          };
        }
        setPremiumVideos(map);
        savePremiumVideosLocal(map);
      })
      .catch(() => {
        // fall back to localStorage
        setPremiumVideos(loadPremiumVideosLocal());
      });
  }, [actor, videoId]);

  // Ask backend directly if this specific video is accessible (re-check when tier changes)
  useEffect(() => {
    if (!actor || !videoId) return;
    actor
      .canUserAccessVideo(videoId)
      .then((result) => {
        if (result.__kind__ === "ok") {
          setBackendCanAccess(result.ok);
        }
      })
      .catch(() => {
        // fall back to local computation
        setBackendCanAccess(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, videoId]);

  const videoConfig = premiumVideos[videoId];
  const isPremium = settings.enabled && !!videoConfig?.isPremium;
  const requiredTier: ContentTier = videoConfig?.requiredTier ?? "free";

  // Prefer the authoritative backend answer; fall back to local tier check
  const canAccess =
    backendCanAccess !== null
      ? backendCanAccess
      : !isPremium || tierSatisfies(userTier, requiredTier);

  return {
    isPremium,
    requiredTier,
    userTier,
    canAccess,
    gatingEnabled: settings.enabled,
  };
}
