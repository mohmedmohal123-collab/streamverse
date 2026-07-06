/**
 * REST API client for admin operations.
 * Replaces the Motoko actor calls for settings, ads, and subscription management.
 */

const JWT_KEY = "streamverse_jwt_token";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(JWT_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AdminSettings {
  [key: string]: {
    value: string;
    isSecret: boolean;
    updatedAt: string;
  };
}

export interface AdConfig {
  id?: string;
  provider: string;
  is_enabled: boolean;
  app_id?: string | null;
  api_key?: string | null;
  banner_ad_unit?: string | null;
  native_ad_unit?: string | null;
  interstitial_ad_unit?: string | null;
  rewarded_ad_unit?: string | null;
  is_default: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  currency: string;
  is_active: boolean;
  features: string[];
  sort_order: number;
}

// ─── Admin Settings ──────────────────────────────────────────────────────────

export async function fetchAdminSettings(): Promise<AdminSettings> {
  const res = await fetch("/api/admin/settings", {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || `Failed to load settings (${res.status})`);
  }
  const data = await res.json();
  return data.settings as AdminSettings;
}

export async function saveAdminSetting(key: string, value: string): Promise<boolean> {
  const res = await fetch("/api/admin/settings", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Save failed" }));
    throw new Error(data.error || `Failed to save setting (${res.status})`);
  }
  return true;
}

export async function saveAdminSettings(settings: Record<string, string>): Promise<boolean> {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ settings }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Save failed" }));
    throw new Error(data.error || `Failed to save settings (${res.status})`);
  }
  return true;
}

// ─── Public Settings ─────────────────────────────────────────────────────────

export async function fetchPublicSettings(): Promise<Record<string, string>> {
  const res = await fetch("/api/settings/public");
  if (!res.ok) return {};
  const data = await res.json();
  return data.settings as Record<string, string>;
}

// ─── Ads Config ──────────────────────────────────────────────────────────────

export async function fetchAdConfigs(): Promise<AdConfig[]> {
  const res = await fetch("/api/admin/ads", {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || `Failed to load ad config (${res.status})`);
  }
  const data = await res.json();
  return data.configs as AdConfig[];
}

export async function saveAdConfig(provider: string, fields: Partial<AdConfig>): Promise<boolean> {
  const res = await fetch("/api/admin/ads", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ provider, ...fields }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Save failed" }));
    throw new Error(data.error || `Failed to save ad config (${res.status})`);
  }
  return true;
}

export async function deleteAdConfig(provider: string): Promise<boolean> {
  const res = await fetch(`/api/admin/ads?provider=${encodeURIComponent(provider)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Delete failed" }));
    throw new Error(data.error || `Failed to delete ad config (${res.status})`);
  }
  return true;
}

export async function fetchPublicAdProviders(): Promise<AdConfig[]> {
  const res = await fetch("/api/ads/public");
  if (!res.ok) return [];
  const data = await res.json();
  return data.providers as AdConfig[];
}

// ─── Subscription Plans ──────────────────────────────────────────────────────

export async function fetchSubscriptionPlans(): Promise<{ plans: SubscriptionPlan[]; subscriptionsEnabled: boolean }> {
  const res = await fetch("/api/admin/plans");
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || `Failed to load plans (${res.status})`);
  }
  const data = await res.json();
  return {
    plans: data.plans as SubscriptionPlan[],
    subscriptionsEnabled: data.subscriptionsEnabled,
  };
}

export async function saveSubscriptionPlan(plan: Partial<SubscriptionPlan> & { id: string }): Promise<boolean> {
  const res = await fetch("/api/admin/plans", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(plan),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Save failed" }));
    throw new Error(data.error || `Failed to save plan (${res.status})`);
  }
  return true;
}
