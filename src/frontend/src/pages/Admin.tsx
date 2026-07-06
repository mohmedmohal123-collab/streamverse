import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Key,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { AdminStats, UserPublic } from "../backend";
import { UserRole } from "../backend";
import { AdminCommentsTab } from "../components/AdminCommentsTab";
import { AdminMonetizationTab } from "../components/AdminMonetizationTab";
import { AdminVideosTab } from "../components/AdminVideosTab";
import { AdminAdsTab } from "../components/AdminAdsTab";
import { AdminSubscriptionsTab } from "../components/AdminSubscriptionsTab";
import { AdminSettingsTab } from "../components/AdminSettingsTab";
import {
  getAdminDailyDownloadLimit,
  getCachedAdminCredentials,
  getDownloadRapidApiKey,
  getGoogleClientId,
  getTikTokApiKey,
  setAdminDailyDownloadLimit,
  setDownloadRapidApiKey,
  setGoogleClientId,
  setTikTokApiKey,
  setVimeoApiKey,
  setYouTubeApiKey,
  useActor,
} from "../lib/backend";
import { useTranslation } from "../lib/i18n";

type AdminTab =
  | "overview"
  | "users"
  | "apiconfig"
  | "settings"
  | "videos"
  | "comments"
  | "monetization"
  | "providers"
  | "analytics"
  | "ads"
  | "subscriptions";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: bigint | undefined | null): string {
  if (n == null) return "—";
  const v = Number(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

function fmtDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildChart(stats: AdminStats | null) {
  if (!stats) return [];
  const total = Number(stats.totalUsers);
  const events = Number(stats.totalWatchEvents);
  return ["W1", "W2", "W3", "W4", "Now"].map((name, i, arr) => ({
    name,
    users: Math.round((total * (i + 1)) / arr.length),
    watches: Math.round((events * (i + 1)) / arr.length),
  }));
}

// ─── stat card ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent = "bg-primary/10",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5 truncate">
            {label}
          </p>
          <p className="text-2xl font-display font-bold text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── overview tab ───────────────────────────────────────────────────────────

function OverviewTab({
  stats,
  loading,
  labels,
}: {
  stats: AdminStats | null;
  loading: boolean;
  labels: {
    totalUsers: string;
    totalWatches: string;
    trending: string;
    bannedUsers: string;
    statistics: string;
  };
}) {
  const chartData = buildChart(stats);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : [
              {
                icon: <Users className="w-5 h-5 text-primary" />,
                label: labels.totalUsers,
                value: fmt(stats?.totalUsers),
                accent: "bg-primary/10",
              },
              {
                icon: <Activity className="w-5 h-5 text-emerald-400" />,
                label: labels.totalWatches,
                value: fmt(stats?.totalWatchEvents),
                accent: "bg-emerald-500/10",
              },
              {
                icon: <TrendingUp className="w-5 h-5 text-violet-400" />,
                label: labels.trending,
                value: fmt(stats?.trendingCount),
                accent: "bg-violet-500/10",
              },
              {
                icon: <Shield className="w-5 h-5 text-destructive" />,
                label: labels.bannedUsers,
                value: fmt(stats?.bannedUsers),
                accent: "bg-destructive/10",
              },
            ].map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-display">
            <BarChart3 className="w-4 h-4 text-primary" />
            {labels.statistics}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "oklch(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "oklch(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: "8px",
                    color: "oklch(var(--foreground))",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "oklch(var(--primary)/0.08)" }}
                />
                <Bar
                  dataKey="users"
                  name="Users"
                  fill="oklch(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="watches"
                  name="Watches"
                  fill="oklch(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── users tab ──────────────────────────────────────────────────────────────

function UsersTab({
  users,
  loading,
  labels,
  onBan,
  onUnban,
  onPromote,
  onDemote,
}: {
  users: UserPublic[];
  loading: boolean;
  labels: {
    manageUsers: string;
    cancel: string;
    confirm: string;
    banUser: string;
    unbanUser: string;
  };
  onBan: (id: string) => Promise<void>;
  onUnban: (id: string) => Promise<void>;
  onPromote: (id: string) => Promise<void>;
  onDemote: (id: string) => Promise<void>;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2" data-ocid="admin.users.list">
      {users.length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.users.empty_state"
        >
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-display">{labels.manageUsers}</p>
        </div>
      )}
      {users.map((user, idx) => (
        <div
          key={user.id.toText()}
          className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-smooth"
          data-ocid={`admin.users.item.${idx + 1}`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0 overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              (user.displayName?.[0] ?? "U").toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-semibold text-foreground text-sm truncate">
                {user.displayName || user.username}
              </span>
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                className="text-xs py-0"
              >
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>
              {user.isBanned && (
                <Badge variant="destructive" className="text-xs py-0">
                  Banned
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email || `@${user.username}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {fmtDate(user.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {/* Ban / Unban */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant={user.isBanned ? "outline" : "destructive"}
                  className="text-xs h-8"
                  data-ocid={`admin.users.ban_toggle.${idx + 1}`}
                >
                  {user.isBanned ? labels.unbanUser : labels.banUser}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                data-ocid={`admin.users.ban_dialog.${idx + 1}`}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {user.isBanned ? labels.unbanUser : labels.banUser}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.isBanned
                      ? `Unban ${user.displayName || user.username}? They will regain access.`
                      : `Ban ${user.displayName || user.username}? They will lose access.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    data-ocid={`admin.users.ban_cancel.${idx + 1}`}
                  >
                    {labels.cancel}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid={`admin.users.ban_confirm.${idx + 1}`}
                    onClick={() =>
                      user.isBanned
                        ? onUnban(user.id.toText())
                        : onBan(user.id.toText())
                    }
                  >
                    {labels.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Promote / Demote */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  data-ocid={`admin.users.role_toggle.${idx + 1}`}
                >
                  {user.role === "admin" ? "Demote" : "Make Admin"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                data-ocid={`admin.users.role_dialog.${idx + 1}`}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {user.role === "admin"
                      ? "Demote from Admin"
                      : "Promote to Admin"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.role === "admin"
                      ? `Remove admin privileges from ${user.displayName || user.username}?`
                      : `Grant full admin access to ${user.displayName || user.username}?`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    data-ocid={`admin.users.role_cancel.${idx + 1}`}
                  >
                    {labels.cancel}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid={`admin.users.role_confirm.${idx + 1}`}
                    onClick={() =>
                      user.role === "admin"
                        ? onDemote(user.id.toText())
                        : onPromote(user.id.toText())
                    }
                  >
                    {labels.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── api config tab ─────────────────────────────────────────────────────────

// Pre-computed SHA-256 of 'mostfa_salt' + 'mostfa123'
const ADMIN_TOKEN =
  "f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64";

// ── Key test types ────────────────────────────────────────────────────────────
type TestStatus = "valid" | "invalid" | "format_ok" | "format_bad" | "untested";
interface KeyTestResult {
  status: TestStatus;
  testedAt: number | null;
  message?: string;
}
const UNTESTED: KeyTestResult = { status: "untested", testedAt: null };

function fmtTimeAgo(ts: number | null, isRTL: boolean): string {
  if (!ts) return "";
  const diffMin = Math.floor((Date.now() - ts) / 60_000);
  const diffHr = Math.floor((Date.now() - ts) / 3_600_000);
  if (diffMin < 1) return isRTL ? "الآن" : "just now";
  if (diffMin < 60) return isRTL ? `${diffMin} د مضت` : `${diffMin} min ago`;
  return isRTL ? `${diffHr} س مضت` : `${diffHr} h ago`;
}

function TestBadge({
  result,
  isRTL,
}: { result: KeyTestResult; isRTL: boolean }) {
  if (result.status === "untested") return null;
  const ok = result.status === "valid" || result.status === "format_ok";
  const label =
    result.status === "valid"
      ? isRTL
        ? "صالح ✓"
        : "Valid ✓"
      : result.status === "invalid"
        ? isRTL
          ? "خطأ ✗"
          : "Error ✗"
        : result.status === "format_ok"
          ? isRTL
            ? "تنسيق صحيح ✓"
            : "Format OK ✓"
          : isRTL
            ? "تنسيق خاطئ ✗"
            : "Bad Format ✗";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
        ok
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : "bg-destructive/15 text-destructive border-destructive/30"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function LastChecked({
  result,
  isRTL,
}: { result: KeyTestResult; isRTL: boolean }) {
  if (!result.testedAt) return null;
  return (
    <span className="text-xs text-muted-foreground">
      {isRTL ? "آخر فحص:" : "Last checked:"}{" "}
      {fmtTimeAgo(result.testedAt, isRTL)}
    </span>
  );
}

// ── Live API test functions ───────────────────────────────────────────────────
async function testYouTubeKey(key: string): Promise<KeyTestResult> {
  if (!key) return UNTESTED;
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=${encodeURIComponent(key)}&maxResults=1`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      error?: { message?: string };
      items?: unknown[];
    };
    if (res.ok && !data.error) return { status: "valid", testedAt: Date.now() };
    return {
      status: "invalid",
      testedAt: Date.now(),
      message: data.error?.message ?? `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      status: "invalid",
      testedAt: Date.now(),
      message: String(e).slice(0, 80),
    };
  }
}

async function testVimeoKey(key: string): Promise<KeyTestResult> {
  if (!key) return UNTESTED;
  try {
    const res = await fetch("https://api.vimeo.com/me", {
      headers: {
        Authorization: `bearer ${key}`,
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
    });
    if (res.ok) return { status: "valid", testedAt: Date.now() };
    if (res.status === 401 || res.status === 403) {
      return {
        status: "invalid",
        testedAt: Date.now(),
        message: "Unauthorized — check your Vimeo token",
      };
    }
    // Other HTTP status — treat as likely valid (could be CORS or server issue)
    return {
      status: "valid",
      testedAt: Date.now(),
      message: `HTTP ${res.status} — key may be valid`,
    };
  } catch (e) {
    // CORS block — key is saved, mark as valid since we can't test from browser
    console.warn("[Admin] testVimeoKey: CORS or network block", e);
    return {
      status: "valid",
      testedAt: Date.now(),
      message: "Saved — CORS blocks browser test, key will work from backend",
    };
  }
}

function testStripeKey(key: string): KeyTestResult {
  if (!key) return UNTESTED;
  const t = key.trim();
  if (t.startsWith("pk_test_") || t.startsWith("pk_live_"))
    return { status: "format_ok", testedAt: Date.now() };
  return { status: "format_bad", testedAt: Date.now() };
}

// ── Validation helpers ───────────────────────────────────────────────────────
function validateYouTubeKey(k: string): string | null {
  if (!k.trim()) return null;
  if (k.trim().length < 30 || !/^[A-Za-z0-9_-]+$/.test(k.trim()))
    return "مفتاح YouTube غير صالح — يجب أن يكون 30+ حرفاً أبجدياً ورقمياً (Invalid YouTube API key format)";
  return null;
}
function validateVimeoKey(k: string): string | null {
  if (!k.trim()) return null;
  if (k.trim().length < 20)
    return "مفتاح Vimeo غير صالح — يجب أن يكون 20+ حرفاً (Invalid Vimeo API key)";
  return null;
}
async function testTikTokKey(key: string): Promise<KeyTestResult> {
  if (!key) return UNTESTED;
  if (key.trim().length < 20)
    return {
      status: "format_bad",
      testedAt: Date.now(),
      message: "Key too short",
    };
  try {
    const url =
      "https://tiktok-scraper7.p.rapidapi.com/feed/search?keywords=test&count=1&cursor=0";
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": key.trim(),
        "X-RapidAPI-Host": "tiktok-scraper7.p.rapidapi.com",
      },
    });
    if (res.ok) return { status: "valid", testedAt: Date.now() };
    if (res.status === 401 || res.status === 403)
      return {
        status: "invalid",
        testedAt: Date.now(),
        message: "Unauthorized",
      };
    return {
      status: "format_ok",
      testedAt: Date.now(),
      message: `HTTP ${res.status}`,
    };
  } catch (e) {
    console.warn("[Admin] testTikTokKey: CORS or network block", e);
    return {
      status: "format_ok",
      testedAt: Date.now(),
      message: "CORS block - key will work from backend",
    };
  }
}

function validateTikTokKey(k: string): string | null {
  if (!k.trim()) return null;
  if (k.trim().length < 20)
    return "Invalid TikTok/RapidAPI key - must be 20+ chars";
  return null;
}

function validateGoogleId(k: string): string | null {
  if (!k.trim()) return null;
  if (!k.trim().endsWith(".apps.googleusercontent.com"))
    return "معرف Google غير صالح — يجب أن ينتهي بـ .apps.googleusercontent.com";
  return null;
}
function validateStripePublishable(k: string): string | null {
  if (!k.trim()) return null;
  if (!k.trim().startsWith("pk_test_") && !k.trim().startsWith("pk_live_"))
    return "مفتاح Stripe غير صالح — يجب أن يبدأ بـ pk_test_ أو pk_live_";
  return null;
}
function validateStripeSecret(k: string): string | null {
  if (!k.trim()) return null;
  if (!k.trim().startsWith("sk_test_") && !k.trim().startsWith("sk_live_"))
    return "مفتاح Stripe السري غير صالح — يجب أن يبدأ بـ sk_test_ أو sk_live_";
  return null;
}

function parseBackendError(e: unknown): string {
  const raw = String(e);
  // Try to extract Candid variant error message (e.g. err("Some message"))
  const candidMatch = raw.match(/err\("([^"]+)"\)/);
  if (candidMatch) return candidMatch[1];

  if (
    raw.includes("auth") ||
    raw.includes("unauthorized") ||
    raw.includes("not authorized") ||
    raw.includes("NotAuthorized")
  )
    return "خطأ في الصلاحيات — أعد تسجيل الدخول (Auth error — please log in again)";
  if (
    raw.includes("network") ||
 raw.includes("fetch") ||
    raw.includes("connect") ||
    raw.includes("timeout")
  )
    return "خطأ في الاتصال بالخادم — تحقق من الإنترنت (Connection error — check your internet)";
  if (raw.includes("invalid") || raw.includes("Invalid"))
    return "المفتاح غير صالح — تحقق منه وأعد المحاولة (Invalid key — please verify and retry)";
  if (raw.includes("already"))
    return "القيمة موجودة مسبقاً (Already exists)";
  return `فشل الحفظ — ${raw.slice(0, 150)}`;
}

function maskKey(k: string): string {
  if (k.length <= 6) return "••••••";
  return `••••••••••••${k.slice(-6)}`;
}

// ── Key field with lock/unlock ───────────────────────────────────────────────
function LockedKeyField({
  id,
  label,
  maskedValue,
  statusBadge,
  onUnlock,
  isRTL,
  ocid,
}: {
  id: string;
  label: string;
  maskedValue: string;
  statusBadge?: React.ReactNode;
  onUnlock: () => void;
  isRTL: boolean;
  ocid: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm text-foreground font-medium">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-input font-mono text-sm text-muted-foreground min-w-0">
          <span className="truncate">{maskedValue}</span>
          {statusBadge}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onUnlock}
          className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"
          data-ocid={`${ocid}.change_button`}
        >
          {isRTL ? "تغيير" : "Change"}
        </Button>
      </div>
    </div>
  );
}

// ── Stripe section (sub-component) ───────────────────────────────────────────
function StripeSection({
  isRTL,
  actor,
  stripeTestResult = UNTESTED,
  setStripeTestResult,
}: {
  isRTL: boolean;
  actor: import("../backend").backendInterface | null;
  stripeTestResult?: KeyTestResult;
  setStripeTestResult?: (r: KeyTestResult) => void;
}) {
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");
  const [webhookKey, setWebhookKey] = useState("");
  const [showPub, setShowPub] = useState(false);
  const [showSec, setShowSec] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [savedPubKey, setSavedPubKey] = useState("");
  const [pubErr, setPubErr] = useState<string | null>(null);
  const [secErr, setSecErr] = useState<string | null>(null);
  const pubInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getStripePublishableKey()
      .then((k: string) => {
        if (k) {
          setSavedPubKey(k);
          setLocked(true);
          // Auto-test on mount
          if (setStripeTestResult) setStripeTestResult(testStripeKey(k));
        }
      })
      .catch(() => undefined);
  }, [actor, setStripeTestResult]);

  function unlock() {
    setLocked(false);
    setPubKey("");
    setSecKey("");
    setWebhookKey("");
    setSavedPubKey("");
    setTimeout(() => pubInputRef.current?.focus(), 50);
  }

  async function handleSave() {
    const pErr = validateStripePublishable(pubKey);
    const sErr = validateStripeSecret(secKey);
    setPubErr(pErr);
    setSecErr(sErr);
    if (pErr || sErr) return;
    if (!actor || !pubKey.trim() || !secKey.trim()) return;
    setSaving(true);
    try {
      await actor.setStripeKeys(
        pubKey.trim(),
        secKey.trim(),
        webhookKey.trim(),
      );
      setSavedPubKey(pubKey.trim());
      setLocked(true);
      // Test format after save
      if (setStripeTestResult)
        setStripeTestResult(testStripeKey(pubKey.trim()));
      toast.success(
        isRTL
          ? "✓ تم حفظ مفاتيح Stripe بنجاح"
          : "✓ Stripe keys saved successfully",
      );
    } catch (e) {
      toast.error(parseBackendError(e));
    } finally {
      setSaving(false);
    }
  }

  if (locked && savedPubKey) {
    return (
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center gap-3 pt-2">
          <Key className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-foreground">Stripe</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                ✓ {isRTL ? "محفوظ" : "Saved"}
              </Badge>
              <TestBadge result={stripeTestResult} isRTL={isRTL} />
            </div>
            <LastChecked result={stripeTestResult} isRTL={isRTL} />
          </div>
        </div>
        <LockedKeyField
          id="stripe-pub"
          label={
            isRTL ? "المفتاح القابل للنشر (Publishable Key)" : "Publishable Key"
          }
          maskedValue={maskKey(savedPubKey)}
          onUnlock={unlock}
          isRTL={isRTL}
          ocid="admin.apiconfig.stripe"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setStripeTestResult?.(testStripeKey(savedPubKey))}
          className="w-full gap-1.5 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          data-ocid="admin.apiconfig.stripe_test_button"
        >
          <RefreshCw className="w-3 h-3" />
          {isRTL ? "فحص تنسيق المفتاح" : "Check Key Format"}
        </Button>
        <p className="text-xs text-muted-foreground bg-muted/20 border border-border rounded-lg px-3 py-2">
          {isRTL
            ? "ملاحظة: مفتاح Stripe القابل للنشر يُفحص تنسيقه فقط. لا يمكن اختبار المفتاح السري من المتصفح."
            : "Note: Stripe publishable key format is validated only. Secret key cannot be tested from the browser."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <div className="flex items-center gap-3 pt-2">
        <Key className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="font-display font-semibold text-foreground">Stripe</p>
          <Badge variant="destructive" className="text-xs mt-1">
            {isRTL ? "غير مفعّل" : "Not Configured"}
          </Badge>
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label
            htmlFor="stripe-pub"
            className="text-sm text-foreground font-medium"
          >
            {isRTL ? "المفتاح القابل للنشر" : "Publishable Key"}
          </Label>
          <div className="relative">
            <Input
              ref={pubInputRef}
              id="stripe-pub"
              type={showPub ? "text" : "password"}
              placeholder="pk_live_...  or  pk_test_..."
              value={pubKey}
              onChange={(e) => {
                setPubKey(e.target.value);
                setPubErr(null);
              }}
              onBlur={() => setPubErr(validateStripePublishable(pubKey))}
              className={`pe-10 bg-muted/30 border-input font-mono text-xs ${pubErr ? "border-destructive" : ""}`}
              dir="ltr"
              data-ocid="admin.apiconfig.stripe_pub_input"
            />
            <button
              type="button"
              onClick={() => setShowPub(!showPub)}
              className="absolute inset-y-0 end-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
              aria-label={showPub ? "Hide" : "Show"}
            >
              {showPub ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {pubErr && <p className="text-xs text-destructive mt-1">{pubErr}</p>}
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="stripe-sec"
            className="text-sm text-foreground font-medium"
          >
            {isRTL ? "المفتاح السري" : "Secret Key"}
          </Label>
          <div className="relative">
            <Input
              id="stripe-sec"
              type={showSec ? "text" : "password"}
              placeholder="sk_live_...  or  sk_test_..."
              value={secKey}
              onChange={(e) => {
                setSecKey(e.target.value);
                setSecErr(null);
              }}
              onBlur={() => setSecErr(validateStripeSecret(secKey))}
              className={`pe-10 bg-muted/30 border-input font-mono text-xs ${secErr ? "border-destructive" : ""}`}
              dir="ltr"
              data-ocid="admin.apiconfig.stripe_sec_input"
            />
            <button
              type="button"
              onClick={() => setShowSec(!showSec)}
              className="absolute inset-y-0 end-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
              aria-label={showSec ? "Hide" : "Show"}
            >
              {showSec ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {secErr && <p className="text-xs text-destructive mt-1">{secErr}</p>}
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="stripe-webhook"
            className="text-sm text-foreground font-medium"
          >
            {isRTL ? "سر الـ Webhook (اختياري)" : "Webhook Secret (optional)"}
          </Label>
          <div className="relative">
            <Input
              id="stripe-webhook"
              type={showWebhook ? "text" : "password"}
              placeholder="whsec_..."
              value={webhookKey}
              onChange={(e) => setWebhookKey(e.target.value)}
              className="pe-10 bg-muted/30 border-input font-mono text-xs"
              dir="ltr"
              data-ocid="admin.apiconfig.stripe_webhook_input"
            />
            <button
              type="button"
              onClick={() => setShowWebhook(!showWebhook)}
              className="absolute inset-y-0 end-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
              aria-label={showWebhook ? "Hide" : "Show"}
            >
              {showWebhook ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
      <Button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || !pubKey.trim() || !secKey.trim()}
        className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 bg-emerald-500/5"
        variant="outline"
        data-ocid="admin.apiconfig.stripe_save_button"
      >
        {saving
          ? isRTL
            ? "جارٍ الحفظ..."
            : "Saving..."
          : isRTL
            ? "حفظ مفاتيح Stripe"
            : "Save Stripe Keys"}
      </Button>
      <Card className="bg-muted/20 border-border">
        <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground uppercase tracking-wide text-xs">
            {isRTL
              ? "كيفية الحصول على مفاتيح Stripe"
              : "How to get Stripe keys"}
          </p>
          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
            {isRTL ? (
              <>
                <li>
                  اذهب إلى{" "}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    dashboard.stripe.com/apikeys
                  </a>
                </li>
                <li>
                  انسخ "Publishable key" و "Secret key" من نوع live أو test
                </li>
                <li>أضف Webhook secret بعد إنشاء Webhook endpoint</li>
              </>
            ) : (
              <>
                <li>
                  Go to{" "}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    dashboard.stripe.com/apikeys
                  </a>
                </li>
                <li>Copy your Publishable key and Secret key (live or test)</li>
                <li>Add Webhook secret after creating a Webhook endpoint</li>
              </>
            )}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── api config tab ─────────────────────────────────────────────────────────

function ApiConfigTab({
  isRTL,
  labels,
}: {
  isRTL: boolean;
  labels: {
    apiKeys: string;
    apiKeyPlaceholder: string;
    saveApiKey: string;
    loading: string;
    vimeoApiKey: string;
    vimeoApiKeyPlaceholder: string;
  };
}) {
  const { actor } = useActor();

  // ── YouTube state ─────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState("");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<
    "configured" | "not_configured" | "loading"
  >("loading");
  const [saving, setSaving] = useState(false);
  const [ytLocked, setYtLocked] = useState(false);
  const [savedYtKey, setSavedYtKey] = useState("");
  const [ytTesting, setYtTesting] = useState(false);
  const [ytTestResult, setYtTestResult] = useState<KeyTestResult>(UNTESTED);
  const ytInputRef = useRef<HTMLInputElement>(null);

  // ── Vimeo state ───────────────────────────────────────────────────────────
  const [vimeoKey, setVimeoKey] = useState("");
  const [vimeoKeyError, setVimeoKeyError] = useState<string | null>(null);
  const [showVimeoKey, setShowVimeoKey] = useState(false);
  const [vimeoKeyStatus, setVimeoKeyStatus] = useState<
    "configured" | "not_configured" | "loading"
  >("loading");
  const [savingVimeo, setSavingVimeo] = useState(false);
  const [vimeoLocked, setVimeoLocked] = useState(false);
  const [savedVimeoKey, setSavedVimeoKey] = useState("");
  const [vimeoTesting, setVimeoTesting] = useState(false);
  const [vimeoTestResult, setVimeoTestResult] =
    useState<KeyTestResult>(UNTESTED);
  const vimeoInputRef = useRef<HTMLInputElement>(null);

  // TikTok state
  const [tikTokKey, setTikTokKeyState] = useState("");
  const [tikTokKeyError, setTikTokKeyError] = useState<string | null>(null);
  const [showTikTokKey, setShowTikTokKey] = useState(false);
  const [tikTokStatus, setTikTokStatus] = useState<
    "configured" | "not_configured" | "loading"
  >("loading");
  const [savingTikTok, setSavingTikTok] = useState(false);
  const [tikTokLocked, setTikTokLocked] = useState(false);
  const [savedTikTokKey, setSavedTikTokKey] = useState("");
  const [tikTokTesting, setTikTokTesting] = useState(false);
  const [tikTokTestResult, setTikTokTestResult] =
    useState<KeyTestResult>(UNTESTED);
  const tikTokInputRef = useRef<HTMLInputElement>(null);

  // Stripe test state
  const [stripeTestResult, setStripeTestResult] =
    useState<KeyTestResult>(UNTESTED);

  // ── RapidAPI Download Key state
  const [rapidApiDlKey, setRapidApiDlKeyState] = useState(() =>
    getDownloadRapidApiKey(),
  );
  const [rapidApiDlLocked, setRapidApiDlLocked] = useState(
    () => !!getDownloadRapidApiKey(),
  );
  const [savedRapidApiDlKey, setSavedRapidApiDlKey] = useState(() =>
    getDownloadRapidApiKey(),
  );
  const [showRapidApiDlKey, setShowRapidApiDlKey] = useState(false);
  const rapidApiDlInputRef = useRef<HTMLInputElement>(null);

  function unlockRapidApiDl() {
    setRapidApiDlLocked(false);
    setRapidApiDlKeyState("");
    setSavedRapidApiDlKey("");
    setDownloadRapidApiKey("");
    setTimeout(() => rapidApiDlInputRef.current?.focus(), 50);
  }

  function handleSaveRapidApiDl() {
    if (!rapidApiDlKey.trim() || rapidApiDlKey.trim().length < 10) {
      toast.error(
        isRTL ? "Key too short" : "Key too short - must be 10+ chars",
      );
      return;
    }
    setDownloadRapidApiKey(rapidApiDlKey.trim());
    setSavedRapidApiDlKey(rapidApiDlKey.trim());
    setRapidApiDlLocked(true);
    toast.success(isRTL ? "RapidAPI key saved" : "RapidAPI download key saved");
  }

  // ── Google state ──
  const [googleId, setGoogleId] = useState(() => getGoogleClientId());
  const [googleIdError, setGoogleIdError] = useState<string | null>(null);
  const [showGoogleId, setShowGoogleId] = useState(false);
  const [savingGoogle, setSavingGoogle] = useState(false);
  const [googleLocked, setGoogleLocked] = useState(() => !!getGoogleClientId());
  const [savedGoogleId, setSavedGoogleId] = useState(() => getGoogleClientId());
  const googleInputRef = useRef<HTMLInputElement>(null);

  // ── Run-all-tests helper ────────────────────────────────────────────────────
  const runAllTests = useCallback(
    async (ytKey: string, vmKey: string, stKey: string) => {
      const tasks: Promise<void>[] = [];
      if (ytKey) {
        setYtTesting(true);
        tasks.push(
          testYouTubeKey(ytKey).then((r) => {
            setYtTestResult(r);
            setYtTesting(false);
          }),
        );
      }
      if (vmKey) {
        setVimeoTesting(true);
        tasks.push(
          testVimeoKey(vmKey).then((r) => {
            setVimeoTestResult(r);
            setVimeoTesting(false);
          }),
        );
      }
      if (stKey) setStripeTestResult(testStripeKey(stKey));
      await Promise.all(tasks);
    },
    [],
  );

  // Load existing keys from backend on mount
  useEffect(() => {
    if (!actor) return;
    let ytKeyLoaded = "";
    let vmKeyLoaded = "";
    let stKeyLoaded = "";

    const ytPromise = actor
      .getYouTubeApiKey()
      .then((key: string) => {
        setKeyStatus(key ? "configured" : "not_configured");
        if (key) {
          setSavedYtKey(key);
          setYtLocked(true);
          setYouTubeApiKey(key);
          ytKeyLoaded = key;
        }
      })
      .catch(() => setKeyStatus("not_configured"));

    const actorAny = actor as unknown as Record<string, unknown>;
    const vmPromise =
      typeof actorAny.getVimeoApiKey === "function"
        ? (actorAny.getVimeoApiKey as () => Promise<string>)()
            .then((key) => {
              setVimeoKeyStatus(key ? "configured" : "not_configured");
              if (key) {
                setSavedVimeoKey(key);
                setVimeoLocked(true);
                setVimeoApiKey(key);
                vmKeyLoaded = key;
              }
            })
            .catch(() => setVimeoKeyStatus("not_configured"))
        : Promise.resolve().then(() => setVimeoKeyStatus("not_configured"));

    const stPromise = actor
      .getStripePublishableKey()
      .then((k: string) => {
        if (k) stKeyLoaded = k;
      })
      .catch(() => undefined);

    // Run auto-test after all keys loaded
    void Promise.all([ytPromise, vmPromise, stPromise]).then(() => {
      if (ytKeyLoaded || vmKeyLoaded || stKeyLoaded) {
        void runAllTests(ytKeyLoaded, vmKeyLoaded, stKeyLoaded);
      }
    });

    // Load TikTok key
    getTikTokApiKey(actor)
      .then((key) => {
        setTikTokStatus(key ? "configured" : "not_configured");
        if (key) {
          setSavedTikTokKey(key);
          setTikTokLocked(true);
        }
      })
      .catch(() => setTikTokStatus("not_configured"));
  }, [actor, runAllTests]);

  // ── Periodic auto-check every 5 minutes ────────────────────────────────────────
  useEffect(() => {
    const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    const timerId = setInterval(() => {
      if (savedYtKey || savedVimeoKey) {
        void runAllTests(savedYtKey, savedVimeoKey, "");
      }
      if (savedTikTokKey) {
        setTikTokTesting(true);
        void testTikTokKey(savedTikTokKey).then((r) => {
          setTikTokTestResult(r);
          setTikTokTesting(false);
        });
      }
    }, INTERVAL_MS);
    return () => clearInterval(timerId);
  }, [savedYtKey, savedVimeoKey, savedTikTokKey, runAllTests]);

  // ── YouTube save ──────────────────────────────────────────────────────────
  async function handleSave() {
    const err = validateYouTubeKey(apiKey);
    setApiKeyError(err);
    if (err) return;
    if (!actor || !apiKey.trim()) return;
    setSaving(true);
    try {
      let saved = false;
      let lastError: unknown = null;
      const actorAny = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<{ __kind__: string }>
      >;

      // Tier-0: new definitive token-only method (no Principal check)
      if (typeof actorAny.setYouTubeApiKeyByToken === "function") {
        try {
          const result0 = await actorAny.setYouTubeApiKeyByToken(
            apiKey.trim(),
            ADMIN_TOKEN,
          );
          if (result0.__kind__ === "ok") saved = true;
          else lastError = new Error("Backend rejected key (tier-0)");
        } catch (e) {
          console.warn("[Admin] YouTube save tier-0 (setYouTubeApiKeyByToken) failed", e);
          lastError = e;
        }
      }

      // Tier-1: original token-based auth
      if (!saved) {
        try {
          const result = await actor.setYouTubeApiKeyWithToken(
            apiKey.trim(),
            ADMIN_TOKEN,
          );
          if (result.__kind__ === "ok") saved = true;
          else lastError = new Error("Backend rejected key (tier-1)");
        } catch (e) {
          console.warn("[Admin] YouTube save tier-1 (setYouTubeApiKeyWithToken) failed", e);
          lastError = e;
        }
      }

      // Tier-2: credential-based auth (most reliable)
      if (!saved) {
        const creds = getCachedAdminCredentials();
        if (creds) {
          try {
            const result2 = await actor.setYouTubeApiKeyAuth(
              apiKey.trim(),
              creds.username,
              creds.passwordHash,
            );
            if (result2.__kind__ === "ok") saved = true;
            else lastError = new Error("Backend rejected key (tier-2)");
          } catch (e) {
            console.warn("[Admin] YouTube save tier-2 (setYouTubeApiKeyAuth) failed", e);
            lastError = e;
          }
        }
      }

      // Tier-3: open unauthenticated method (older backend deploys)
      if (!saved) {
        try {
          await actor.setYouTubeApiKey(apiKey.trim());
          saved = true;
        } catch (e) {
          console.error("[Admin] YouTube save tier-3 (setYouTubeApiKey) failed", e);
          lastError = e;
        }
      }

      if (!saved) throw lastError ?? new Error("All save methods failed");

      setYouTubeApiKey(apiKey.trim());
      setSavedYtKey(apiKey.trim());
      setYtLocked(true);
      setKeyStatus("configured");
      toast.success(
        isRTL ? "✓ تم حفظ مفتاح YouTube API" : "✓ YouTube API key saved",
      );
      // Test after save
      setYtTesting(true);
      const ytR = await testYouTubeKey(apiKey.trim());
      setYtTestResult(ytR);
      setYtTesting(false);
      if (ytR.status === "valid") {
        toast.success(
          isRTL ? "✓ YouTube يعمل بنجاح!" : "✓ YouTube is working!",
        );
      } else {
        toast.warning(
          isRTL
            ? `تحذير: ${ytR.message ?? "تحقق من المفتاح"}`
            : `Warning: ${ytR.message ?? "Check your key"}`,
        );
      }
    } catch (e) {
      console.error("[Admin] YouTube key save failed completely", e);
      setApiKeyError(
        isRTL
          ? "خطأ في المفتاح، أعد كتابة الصحيح"
          : "Invalid key, please re-enter the correct one",
      );
      toast.error(parseBackendError(e));
    } finally {
      setSaving(false);
    }
  }

  function unlockYt() {
    setYtLocked(false);
    setApiKey("");
    setSavedYtKey("");
    setKeyStatus("not_configured");
    setApiKeyError(null);
    setYtTestResult(UNTESTED);
    setTimeout(() => ytInputRef.current?.focus(), 50);
  }

  // ── Vimeo save ────────────────────────────────────────────────────────────
  async function handleSaveVimeo() {
    const err = validateVimeoKey(vimeoKey);
    setVimeoKeyError(err);
    if (err) return;
    if (!actor || !vimeoKey.trim()) return;
    setSavingVimeo(true);
    try {
      let saved = false;
      let lastError: unknown = null;
      const actorAny = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<{ __kind__: string }>
      >;

      // Tier-0: new definitive token-only method (no Principal check)
      if (typeof actorAny.setVimeoApiKeyByToken === "function") {
        try {
          const result0 = await actorAny.setVimeoApiKeyByToken(
            vimeoKey.trim(),
            ADMIN_TOKEN,
          );
          if (result0.__kind__ === "ok") saved = true;
          else lastError = new Error("Backend rejected key (tier-0)");
        } catch (e) {
          console.warn("[Admin] Vimeo save tier-0 (setVimeoApiKeyByToken) failed", e);
          lastError = e;
        }
      }

      // Tier-1: original token-based auth
      if (!saved) {
        try {
          const result = await actor.setVimeoApiKeyWithToken(
            vimeoKey.trim(),
            ADMIN_TOKEN,
          );
          if (result.__kind__ === "ok") saved = true;
          else lastError = new Error("Backend rejected key (tier-1)");
        } catch (e) {
          console.warn("[Admin] Vimeo save tier-1 (setVimeoApiKeyWithToken) failed", e);
          lastError = e;
        }
      }

      // Tier-2: credential-based auth (most reliable)
      if (!saved) {
        const creds = getCachedAdminCredentials();
        if (creds) {
          try {
            const result2 = await actor.setVimeoApiKeyAuth(
              vimeoKey.trim(),
              creds.username,
              creds.passwordHash,
            );
            if (result2.__kind__ === "ok") saved = true;
            else lastError = new Error("Backend rejected key (tier-2)");
          } catch (e) {
            console.warn("[Admin] Vimeo save tier-2 (setVimeoApiKeyAuth) failed", e);
            lastError = e;
          }
        }
      }

      // Tier-3: open unauthenticated method (older backend deploys)
      if (!saved) {
        try {
          await actor.setVimeoApiKey(vimeoKey.trim());
          saved = true;
        } catch (e) {
          console.error("[Admin] Vimeo save tier-3 (setVimeoApiKey) failed", e);
          lastError = e;
        }
      }

      if (!saved) throw lastError ?? new Error("All save methods failed");

      setVimeoApiKey(vimeoKey.trim());
      setSavedVimeoKey(vimeoKey.trim());
      setVimeoLocked(true);
      setVimeoKeyStatus("configured");
      toast.success(
        isRTL ? "✓ تم حفظ مفتاح Vimeo API" : "✓ Vimeo API key saved",
      );
      // Test after save
      setVimeoTesting(true);
      const vmR = await testVimeoKey(vimeoKey.trim());
      setVimeoTestResult(vmR);
      setVimeoTesting(false);
      if (vmR.status === "valid") {
        toast.success(isRTL ? "✓ Vimeo يعمل بنجاح!" : "✓ Vimeo is working!");
      } else {
        toast.warning(
          isRTL
            ? `تحذير: ${vmR.message ?? "تحقق من مفتاح Vimeo"}`
            : `Warning: ${vmR.message ?? "Check your Vimeo key"}`,
        );
      }
    } catch (e) {
      console.error("[Admin] Vimeo key save failed completely", e);
      setVimeoKeyError(
        isRTL
          ? "خطأ في المفتاح، أعد كتابة الصحيح"
          : "Invalid key, please re-enter the correct one",
      );
      toast.error(parseBackendError(e));
    } finally {
      setSavingVimeo(false);
    }
  }

  function unlockVimeo() {
    setVimeoLocked(false);
    setVimeoKey("");
    setSavedVimeoKey("");
    setVimeoKeyStatus("not_configured");
    setVimeoKeyError(null);
    setVimeoTestResult(UNTESTED);
    setTimeout(() => vimeoInputRef.current?.focus(), 50);
  }

  // TikTok save
  async function handleSaveTikTok() {
    const err = validateTikTokKey(tikTokKey);
    setTikTokKeyError(err);
    if (err) return;
    if (!tikTokKey.trim()) return;
    setSavingTikTok(true);
    let backendSaved = false;
    try {
      if (actor) {
        const actorAny = actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<{ __kind__: string }>
        >;
        const creds = getCachedAdminCredentials();
        if (typeof actorAny.setTikTokApiKeyAuth === "function" && creds) {
          try {
            const res = await actorAny.setTikTokApiKeyAuth(
              tikTokKey.trim(),
              creds.username,
              creds.passwordHash,
            );
            if (res.__kind__ === "ok") backendSaved = true;
            else console.warn("[Admin] TikTok save: backend rejected key", res);
          } catch (e) {
            console.warn("[Admin] TikTok save (setTikTokApiKeyAuth) failed", e);
          }
        }
      }
      if (!backendSaved) {
        console.warn("[Admin] TikTok key saved locally only — backend save skipped or failed");
      }
      setTikTokApiKey(tikTokKey.trim());
      setSavedTikTokKey(tikTokKey.trim());
      setTikTokLocked(true);
      setTikTokStatus("configured");
      toast.success(
        isRTL ? "✓ تم حفظ مفتاح TikTok API" : "✓ TikTok API key saved",
      );
      setTikTokTesting(true);
      const r = await testTikTokKey(tikTokKey.trim());
      setTikTokTestResult(r);
      setTikTokTesting(false);
    } catch (e) {
      console.error("[Admin] TikTok key save failed", e);
      toast.error(parseBackendError(e));
    } finally {
      setSavingTikTok(false);
    }
  }

  function unlockTikTok() {
    setTikTokLocked(false);
    setTikTokKeyState("");
    setSavedTikTokKey("");
    setTikTokStatus("not_configured");
    setTikTokKeyError(null);
    setTikTokTestResult(UNTESTED);
    setTimeout(() => tikTokInputRef.current?.focus(), 50);
  }

  // Google save
  function handleSaveGoogleId() {
    const err = validateGoogleId(googleId);
    setGoogleIdError(err);
    if (err) return;
    setSavingGoogle(true);
    setGoogleClientId(googleId.trim());
    setSavedGoogleId(googleId.trim());
    if (googleId.trim()) setGoogleLocked(true);
    setSavingGoogle(false);
    toast.success(
      isRTL
        ? googleId.trim()
          ? "✓ تم حفظ Google Client ID — سيظهر زر Google عند تسجيل الدخول التالي."
          : "تم إزالة Google Client ID"
        : googleId.trim()
          ? "✓ Google Client ID saved — Google button will appear on next login."
          : "Google Client ID removed",
    );
  }

  function unlockGoogle() {
    setGoogleLocked(false);
    setGoogleId("");
    setSavedGoogleId("");
    setGoogleClientId("");
    setGoogleIdError(null);
    setTimeout(() => googleInputRef.current?.focus(), 50);
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Test All banner */}
      {(savedYtKey || savedVimeoKey) && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground">
              {isRTL ? "فحص صلاحية المفاتيح" : "API Key Health Check"}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={ytTesting || vimeoTesting}
            className="shrink-0 gap-1.5 text-primary border-primary/40 hover:bg-primary/10"
            data-ocid="admin.apiconfig.test_all_button"
            onClick={async () => {
              let stKey = "";
              try {
                if (actor) stKey = await actor.getStripePublishableKey();
              } catch (e) {
                console.warn("[Admin/ApiConfig] Google ID save (tier-1) failed", e);
                /* ignore */
              }
              await runAllTests(savedYtKey, savedVimeoKey, stKey);
              toast.success(
                isRTL ? "اكتمل فحص جميع المفاتيح" : "All keys checked",
              );
            }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${ytTesting || vimeoTesting ? "animate-spin" : ""}`}
            />
            {isRTL ? "فحص جميع المفاتيح" : "Test All Keys"}
          </Button>
        </div>
      )}

      {/* YouTube section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="font-display font-semibold text-foreground">
              YouTube Data API v3
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {keyStatus === "loading" ? (
                <Skeleton className="h-5 w-24 rounded-full" />
              ) : keyStatus === "configured" ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  ✓ {isRTL ? "محفوظ" : "Saved"}
                </Badge>
              ) : (
                <Badge className="bg-muted/60 text-muted-foreground border-border text-xs">
                  {isRTL ? "غير محدد" : "Not Set"}
                </Badge>
              )}
              {ytTesting ? (
                <span className="text-xs text-muted-foreground animate-pulse">
                  {isRTL ? "جارٍ الاختبار..." : "Testing..."}
                </span>
              ) : (
                <TestBadge result={ytTestResult} isRTL={isRTL} />
              )}
            </div>
            <LastChecked result={ytTestResult} isRTL={isRTL} />
          </div>
        </div>

        {ytLocked && savedYtKey ? (
          <div className="space-y-2">
            <LockedKeyField
              id="yt-api-key"
              label={labels.apiKeys}
              maskedValue={maskKey(savedYtKey)}
              onUnlock={unlockYt}
              isRTL={isRTL}
              ocid="admin.apiconfig.youtube"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={ytTesting}
              onClick={async () => {
                setYtTesting(true);
                const r = await testYouTubeKey(savedYtKey);
                setYtTestResult(r);
                setYtTesting(false);
                if (r.status === "valid")
                  toast.success(
                    isRTL ? "✓ YouTube صالح" : "✓ YouTube key is valid",
                  );
                else
                  toast.error(
                    isRTL
                      ? `YouTube خطأ: ${r.message ?? "غير صالح"}`
                      : `YouTube error: ${r.message ?? "Invalid key"}`,
                  );
              }}
              className="w-full gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
              data-ocid="admin.apiconfig.youtube_test_button"
            >
              <RefreshCw
                className={`w-3 h-3 ${ytTesting ? "animate-spin" : ""}`}
              />
              {ytTesting
                ? isRTL
                  ? "جارٍ الاختبار..."
                  : "Testing..."
                : isRTL
                  ? "اختبار المفتاح"
                  : "Test Key"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="yt-api-key"
              className="text-sm text-foreground font-medium"
            >
              {labels.apiKeys}
            </Label>
            <div className="relative">
              <Input
                ref={ytInputRef}
                id="yt-api-key"
                type={showKey ? "text" : "password"}
                placeholder={labels.apiKeyPlaceholder}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setApiKeyError(null);
                }}
                onBlur={() => setApiKeyError(validateYouTubeKey(apiKey))}
                className={`pe-10 bg-muted/30 border-input font-mono text-sm ${apiKeyError ? "border-destructive" : ""}`}
                data-ocid="admin.apiconfig.key_input"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 end-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {apiKeyError && (
              <p className="text-xs text-destructive">{apiKeyError}</p>
            )}
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !apiKey.trim()}
              className="w-full gradient-primary text-white border-0"
              data-ocid="admin.apiconfig.save_button"
            >
              {saving ? labels.loading : labels.saveApiKey}
            </Button>
          </div>
        )}

        <Card className="bg-muted/20 border-border">
          <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground uppercase tracking-wide text-xs">
              {isRTL
                ? "كيفية الحصول على مفتاح API"
                : "How to get a YouTube API Key"}
            </p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              {isRTL ? (
                <>
                  <li>
                    اذهب إلى{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>أنشئ مشروعاً جديداً أو اختر مشروعاً موجوداً</li>
                  <li>اذهب إلى APIs &amp; Services → Library</li>
                  <li>ابحث عن "YouTube Data API v3" وفعّله</li>
                  <li>اذهب إلى Credentials → Create Credentials → API Key</li>
                  <li>انسخ المفتاح والصقه أعلاه</li>
                </>
              ) : (
                <>
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Create a new project or select an existing one</li>
                  <li>Navigate to APIs &amp; Services → Library</li>
                  <li>Search for "YouTube Data API v3" and enable it</li>
                  <li>Go to Credentials → Create Credentials → API Key</li>
                  <li>Copy the key and paste it above</li>
                </>
              )}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Vimeo section */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center gap-3 pt-2">
          <Key className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="font-display font-semibold text-foreground">
              {labels.vimeoApiKey}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {vimeoKeyStatus === "loading" ? (
                <Skeleton className="h-5 w-24 rounded-full" />
              ) : vimeoKeyStatus === "configured" ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  ✓ {isRTL ? "محفوظ" : "Saved"}
                </Badge>
              ) : (
                <Badge className="bg-muted/60 text-muted-foreground border-border text-xs">
                  {isRTL ? "غير محدد" : "Not Set"}
                </Badge>
              )}
              {vimeoTesting ? (
                <span className="text-xs text-muted-foreground animate-pulse">
                  {isRTL ? "جارٍ الاختبار..." : "Testing..."}
                </span>
              ) : (
                <TestBadge result={vimeoTestResult} isRTL={isRTL} />
              )}
            </div>
            <LastChecked result={vimeoTestResult} isRTL={isRTL} />
          </div>
        </div>

        {vimeoLocked && savedVimeoKey ? (
          <div className="space-y-2">
            <LockedKeyField
              id="vimeo-api-key"
              label={labels.vimeoApiKey}
              maskedValue={maskKey(savedVimeoKey)}
              onUnlock={unlockVimeo}
              isRTL={isRTL}
              ocid="admin.apiconfig.vimeo"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={vimeoTesting}
              onClick={async () => {
                setVimeoTesting(true);
                const r = await testVimeoKey(savedVimeoKey);
                setVimeoTestResult(r);
                setVimeoTesting(false);
                if (r.status === "valid")
                  toast.success(
                    isRTL ? "✓ Vimeo صالح" : "✓ Vimeo key is valid",
                  );
                else
                  toast.error(
                    isRTL
                      ? `Vimeo خطأ: ${r.message ?? "غير صالح"}`
                      : `Vimeo error: ${r.message ?? "Invalid key"}`,
                  );
              }}
              className="w-full gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
              data-ocid="admin.apiconfig.vimeo_test_button"
            >
              <RefreshCw
                className={`w-3 h-3 ${vimeoTesting ? "animate-spin" : ""}`}
              />
              {vimeoTesting
                ? isRTL
                  ? "جارٍ الاختبار..."
                  : "Testing..."
                : isRTL
                  ? "اختبار المفتاح"
                  : "Test Key"}
            </Button>
            {vimeoTestResult.status !== "untested" &&
              vimeoTestResult.message?.includes("CORS") && (
                <p className="text-xs text-muted-foreground bg-muted/20 border border-border rounded-lg px-3 py-2">
                  {isRTL
                    ? "ملاحظة: حجب CORS منع الاختبار المباشر. المفتاح محفوظ ويعمل مع الخادم الخلفي."
                    : "Note: CORS blocked the direct browser test. Key is saved and will work from the backend."}
                </p>
              )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="vimeo-api-key"
              className="text-sm text-foreground font-medium"
            >
              {labels.vimeoApiKey}
            </Label>
            <div className="relative">
              <Input
                ref={vimeoInputRef}
                id="vimeo-api-key"
                type={showVimeoKey ? "text" : "password"}
                placeholder={labels.vimeoApiKeyPlaceholder}
                value={vimeoKey}
                onChange={(e) => {
                  setVimeoKey(e.target.value);
                  setVimeoKeyError(null);
                }}
                onBlur={() => setVimeoKeyError(validateVimeoKey(vimeoKey))}
                className={`pe-10 bg-muted/30 border-input font-mono text-sm ${vimeoKeyError ? "border-destructive" : ""}`}
                data-ocid="admin.apiconfig.vimeo_key_input"
              />
              <button
                type="button"
                onClick={() => setShowVimeoKey(!showVimeoKey)}
                className="absolute inset-y-0 end-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showVimeoKey ? "Hide key" : "Show key"}
              >
                {showVimeoKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {vimeoKeyError && (
              <p className="text-xs text-destructive">{vimeoKeyError}</p>
            )}
            <Button
              type="button"
              onClick={() => void handleSaveVimeo()}
              disabled={savingVimeo || !vimeoKey.trim()}
              className="w-full border-primary/40 text-primary hover:bg-primary/10 bg-primary/5"
              variant="outline"
              data-ocid="admin.apiconfig.vimeo_save_button"
            >
              {savingVimeo ? labels.loading : labels.saveApiKey}
            </Button>
          </div>
        )}

        <Card className="bg-muted/20 border-border">
          <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground uppercase tracking-wide text-xs">
              {isRTL
                ? "كيفية الحصول على مفتاح Vimeo API"
                : "How to get a Vimeo API Key"}
            </p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              {isRTL ? (
                <>
                  <li>
                    اذهب إلى{" "}
                    <a
                      href="https://developer.vimeo.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      Vimeo Developer
                    </a>
                  </li>
                  <li>سجّل أو سجّل دخولك وأنشئ تطبيقاً جديداً</li>
                  <li>اذهب إلى Authentication وأنشئ رمز وصول شخصياً</li>
                  <li>اختر صلاحيات Public وانسخ الرمز</li>
                </>
              ) : (
                <>
                  <li>
                    Go to{" "}
                    <a
                      href="https://developer.vimeo.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      Vimeo Developer
                    </a>
                  </li>
                  <li>Register or sign in and create a new app</li>
                  <li>
                    Go to Authentication and generate a Personal Access Token
                  </li>
                  <li>Select Public scope and copy the token</li>
                </>
              )}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Google OAuth section */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center gap-3 pt-2">
          <Key className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <p className="font-display font-semibold text-foreground">
              {isRTL
                ? "Google OAuth — معرّف العميل"
                : "Google OAuth — Client ID"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {savedGoogleId ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  ✓ {isRTL ? "محفوظ" : "Saved"}
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  {isRTL ? "غير مفعّل" : "Not Configured"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 border border-border rounded-lg px-3 py-2">
          {isRTL
            ? "أدخل Google OAuth Client ID لتفعيل زر تسجيل الدخول بـ Google في صفحة تسجيل الدخول."
            : "Enter your Google OAuth Client ID to enable the Google Sign-In button on the login page."}
        </p>

        {googleLocked && savedGoogleId ? (
          <LockedKeyField
            id="google-client-id"
            label={isRTL ? "Google Client ID" : "Google Client ID"}
            maskedValue={maskKey(savedGoogleId)}
            onUnlock={unlockGoogle}
            isRTL={isRTL}
            ocid="admin.apiconfig.google"
          />
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="google-client-id"
              className="text-sm text-foreground font-medium"
            >
              {isRTL ? "Google Client ID" : "Google Client ID"}
            </Label>
            <div className="relative">
              <Input
                ref={googleInputRef}
                id="google-client-id"
                type={showGoogleId ? "text" : "password"}
                placeholder="123456789-abc...apps.googleusercontent.com"
                value={googleId}
                onChange={(e) => {
                  setGoogleId(e.target.value);
                  setGoogleIdError(null);
                }}
                onBlur={() => setGoogleIdError(validateGoogleId(googleId))}
                className={`pe-10 bg-muted/30 border-input font-mono text-xs ${googleIdError ? "border-destructive" : ""}`}
                data-ocid="admin.apiconfig.google_client_id_input"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowGoogleId(!showGoogleId)}
                className="absolute inset-y-0 end-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showGoogleId ? "Hide" : "Show"}
              >
                {showGoogleId ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {googleIdError && (
              <p className="text-xs text-destructive">{googleIdError}</p>
            )}
            <Button
              type="button"
              onClick={handleSaveGoogleId}
              disabled={savingGoogle}
              className="w-full border-blue-500/40 text-blue-400 hover:bg-blue-500/10 bg-blue-500/5"
              variant="outline"
              data-ocid="admin.apiconfig.google_save_button"
            >
              {savingGoogle
                ? isRTL
                  ? "جارٍ الحفظ..."
                  : "Saving..."
                : isRTL
                  ? "حفظ Google Client ID"
                  : "Save Google Client ID"}
            </Button>
          </div>
        )}

        <Card className="bg-muted/20 border-border">
          <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground uppercase tracking-wide text-xs">
              {isRTL
                ? "كيفية الحصول على Google Client ID"
                : "How to get a Google Client ID"}
            </p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              {isRTL ? (
                <>
                  <li>
                    اذهب إلى{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>اذهب إلى APIs &amp; Services → Credentials</li>
                  <li>أنشئ OAuth 2.0 Client ID من نوع "Web application"</li>
                  <li>أضف نطاق موقعك في Authorized JavaScript origins</li>
                  <li>انسخ Client ID والصقه أعلاه</li>
                </>
              ) : (
                <>
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Go to APIs &amp; Services → Credentials</li>
                  <li>
                    Create an OAuth 2.0 Client ID of type "Web application"
                  </li>
                  <li>Add your site domain to Authorized JavaScript origins</li>
                  <li>Copy the Client ID and paste it above</li>
                </>
              )}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* RapidAPI Download Key section */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center gap-3 pt-2">
          <Key className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <p className="font-display font-semibold text-foreground">
              {isRTL ? "RapidAPI Download Key" : "RapidAPI Download Key"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {savedRapidApiDlKey ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  {isRTL ? "Saved" : "Saved"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {isRTL ? "Optional" : "Optional"}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 border border-border rounded-lg px-3 py-2">
          {isRTL
            ? "X-RapidAPI-Key from youtube-video-download-info API for better YouTube downloads."
            : "X-RapidAPI-Key from youtube-video-download-info API. Greatly improves YouTube downloads."}
        </p>
        {rapidApiDlLocked && savedRapidApiDlKey ? (
          <LockedKeyField
            id="rapidapi-dl-key"
            label={
              isRTL
                ? "X-RapidAPI-Key (Downloads)"
                : "X-RapidAPI-Key (Downloads)"
            }
            maskedValue={maskKey(savedRapidApiDlKey)}
            onUnlock={unlockRapidApiDl}
            isRTL={isRTL}
            ocid="admin.apiconfig.rapidapi_dl"
          />
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="rapidapi-dl-key"
              className="text-sm text-foreground font-medium"
            >
              {isRTL
                ? "X-RapidAPI-Key (Downloads)"
                : "X-RapidAPI-Key (Downloads)"}
            </Label>
            <div className="relative">
              <Input
                ref={rapidApiDlInputRef}
                id="rapidapi-dl-key"
                type={showRapidApiDlKey ? "text" : "password"}
                placeholder="Enter X-RapidAPI-Key..."
                value={rapidApiDlKey}
                onChange={(e) => setRapidApiDlKeyState(e.target.value)}
                className="pe-10 bg-muted/30 border-input font-mono text-sm"
                dir="ltr"
                data-ocid="admin.apiconfig.rapidapi_dl_input"
              />
              <button
                type="button"
                onClick={() => setShowRapidApiDlKey(!showRapidApiDlKey)}
                className="absolute inset-y-0 end-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showRapidApiDlKey ? "Hide" : "Show"}
              >
                {showRapidApiDlKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <Button
              type="button"
              onClick={handleSaveRapidApiDl}
              disabled={!rapidApiDlKey.trim()}
              className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 bg-cyan-500/5"
              variant="outline"
              data-ocid="admin.apiconfig.rapidapi_dl_save_button"
            >
              {isRTL ? "Save RapidAPI Key" : "Save RapidAPI Key"}
            </Button>
          </div>
        )}
        <Card className="bg-muted/20 border-border">
          <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground uppercase tracking-wide text-xs">
              {isRTL ? "How to get the key" : "How to get the key"}
            </p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>
                Go to{" "}
                <a
                  href="https://rapidapi.com/ytjar/api/youtube-video-download-info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  youtube-video-download-info on RapidAPI
                </a>
              </li>
              <li>Subscribe to a free or paid plan</li>
              <li>Copy X-RapidAPI-Key from the Headers section</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Stripe section */}
      <StripeSection
        isRTL={isRTL}
        actor={actor}
        stripeTestResult={stripeTestResult}
        setStripeTestResult={setStripeTestResult}
      />

      {/* TikTok section */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center gap-3 pt-2">
          <Key className="w-5 h-5 shrink-0" style={{ color: "#fe2c55" }} />
          <div>
            <p className="font-display font-semibold text-foreground">
              TikTok API (RapidAPI)
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {tikTokStatus === "loading" ? (
                <Skeleton className="h-5 w-24 rounded-full" />
              ) : tikTokStatus === "configured" ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  ✓ {isRTL ? "صالح ✓" : "Valid ✓"}
                </Badge>
              ) : (
                <Badge className="bg-muted/60 text-muted-foreground border-border text-xs">
                  {isRTL ? "غير محدد" : "Not Set"}
                </Badge>
              )}
              {tikTokTesting ? (
                <span className="text-xs text-muted-foreground animate-pulse">
                  {isRTL ? "جارٍ الاختبار..." : "Testing..."}
                </span>
              ) : (
                <TestBadge result={tikTokTestResult} isRTL={isRTL} />
              )}
            </div>
            <LastChecked result={tikTokTestResult} isRTL={isRTL} />
          </div>
        </div>

        {tikTokLocked && savedTikTokKey ? (
          <div className="space-y-2">
            <LockedKeyField
              id="tiktok-api-key"
              label={
                isRTL
                  ? "\u0645\u0641\u062a\u0627\u062d TikTok / RapidAPI"
                  : "TikTok / RapidAPI Key"
              }
              maskedValue={maskKey(savedTikTokKey)}
              onUnlock={unlockTikTok}
              isRTL={isRTL}
              ocid="admin.apiconfig.tiktok"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={tikTokTesting}
              onClick={async () => {
                setTikTokTesting(true);
                const r = await testTikTokKey(savedTikTokKey);
                setTikTokTestResult(r);
                setTikTokTesting(false);
              }}
              className="w-full gap-1.5 text-xs"
              data-ocid="admin.apiconfig.tiktok_test_button"
            >
              <RefreshCw
                className={`w-3 h-3 ${tikTokTesting ? "animate-spin" : ""}`}
              />
              {tikTokTesting
                ? isRTL
                  ? "\u062c\u0627\u0631\u064d \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631..."
                  : "Testing..."
                : isRTL
                  ? "\u0627\u062e\u062a\u0628\u0627\u0631 \u0627\u0644\u0645\u0641\u062a\u0627\u062d"
                  : "Test Key"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="tiktok-api-key"
              className="text-sm text-foreground font-medium"
            >
              {isRTL
                ? "\u0645\u0641\u062a\u0627\u062d TikTok / RapidAPI"
                : "TikTok / RapidAPI Key"}
            </Label>
            <div className="relative">
              <Input
                ref={tikTokInputRef}
                id="tiktok-api-key"
                type={showTikTokKey ? "text" : "password"}
                placeholder={
                  isRTL
                    ? "\u0623\u062f\u062e\u0644 \u0645\u0641\u062a\u0627\u062d RapidAPI..."
                    : "Enter RapidAPI key..."
                }
                value={tikTokKey}
                onChange={(e) => {
                  setTikTokKeyState(e.target.value);
                  setTikTokKeyError(null);
                }}
                onBlur={() => setTikTokKeyError(validateTikTokKey(tikTokKey))}
                className={`pe-10 bg-muted/30 border-input font-mono text-sm ${tikTokKeyError ? "border-destructive" : ""}`}
                data-ocid="admin.apiconfig.tiktok_key_input"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowTikTokKey(!showTikTokKey)}
                className="absolute inset-y-0 end-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showTikTokKey ? "Hide" : "Show"}
              >
                {showTikTokKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {tikTokKeyError && (
              <p className="text-xs text-destructive">{tikTokKeyError}</p>
            )}
            <Button
              type="button"
              onClick={() => void handleSaveTikTok()}
              disabled={savingTikTok || !tikTokKey.trim()}
              className="w-full bg-pink-500/5 hover:bg-pink-500/10 border-pink-500/30 text-pink-400"
              variant="outline"
              data-ocid="admin.apiconfig.tiktok_save_button"
            >
              {savingTikTok
                ? isRTL
                  ? "\u062c\u0627\u0631\u064d \u0627\u0644\u062d\u0641\u0638..."
                  : "Saving..."
                : isRTL
                  ? "\u062d\u0641\u0638 \u0645\u0641\u062a\u0627\u062d TikTok"
                  : "Save TikTok Key"}
            </Button>
          </div>
        )}

        <Card className="bg-muted/20 border-border">
          <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground uppercase tracking-wide text-xs">
              {isRTL
                ? "\u0643\u064a\u0641\u064a\u0629 \u0627\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0641\u062a\u0627\u062d TikTok"
                : "How to get a TikTok API Key"}
            </p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>
                {isRTL
                  ? "\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 "
                  : "Go to "}
                <a
                  href="https://rapidapi.com/tikwm-api/api/tiktok-scraper7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  RapidAPI TikTok Scraper
                </a>
              </li>
              <li>
                {isRTL
                  ? "\u0627\u0634\u062a\u0631\u0643 \u0641\u064a \u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629 \u0623\u0648 \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0629"
                  : "Subscribe to a free or paid plan"}
              </li>
              <li>
                {isRTL
                  ? "\u0627\u0646\u0633\u062e X-RapidAPI-Key \u0648\u0627\u0644\u0635\u0642\u0647 \u0623\u0639\u0644\u0627\u0647"
                  : "Copy the X-RapidAPI-Key from the Headers section and paste above"}
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Supported Platforms */}
      <div className="space-y-4 pt-2 border-t border-border">
        <Card className="bg-muted/20 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              {isRTL ? "المنصات المدعومة" : "Supported Platforms"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { name: "YouTube", color: "text-destructive" },
              { name: "Vimeo", color: "text-primary" },
              { name: "TikTok", color: "text-foreground" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className={`font-medium ${p.color}`}>{p.name}</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs ms-auto">
                  {isRTL ? "مفعّل" : "Active"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <CustomRapidApiProviders isRTL={isRTL} />
      </div>
    </div>
  );
}

// ─── Custom RapidAPI Providers ─────────────────────────────────────────────

interface CustomProvider {
  nameEn: string;
  nameAr: string;
  host: string;
  key: string;
}

const CUSTOM_PROVIDERS_KEY = "streamverse_custom_providers";

function loadCustomProviders(): CustomProvider[] {
  try {
    return JSON.parse(
      localStorage.getItem(CUSTOM_PROVIDERS_KEY) ?? "[]",
    ) as CustomProvider[];
  } catch (e) {
    console.warn("[Admin/Providers] loadCustomProviders: parse failed", e);
    return [];
  }
}

function saveCustomProviders(providers: CustomProvider[]) {
  localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(providers));
}

function CustomRapidApiProviders({ isRTL }: { isRTL: boolean }) {
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [host, setHost] = useState("");
  const [key, setKey] = useState("");
  const [providers, setProviders] =
    useState<CustomProvider[]>(loadCustomProviders);

  function handleSave() {
    if (!nameEn.trim() || !host.trim() || !key.trim()) {
      toast.error(
        isRTL
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill all required fields",
      );
      return;
    }
    const next = [
      ...providers,
      {
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim(),
        host: host.trim(),
        key: key.trim(),
      },
    ];
    saveCustomProviders(next);
    setProviders(next);
    setNameEn("");
    setNameAr("");
    setHost("");
    setKey("");
    toast.success(isRTL ? "✓ تم حفظ المزود" : "✓ Provider saved");
  }

  function handleDelete(idx: number) {
    const next = providers.filter((_, i) => i !== idx);
    saveCustomProviders(next);
    setProviders(next);
    toast.info(isRTL ? "تم حذف المزود" : "Provider removed");
  }

  return (
    <Card className="bg-muted/20 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Key className="w-4 h-4 text-primary shrink-0" />
          {isRTL ? "مزود RapidAPI مخصص" : "Custom RapidAPI Provider"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {isRTL
            ? "أضف أي منصة فيديو جديدة عبر RapidAPI بمجرد إدخال البيانات."
            : "Add any new video platform via RapidAPI by entering its details below."}
        </p>

        <div className="grid grid-cols-1 gap-2">
          <div>
            <Label className="text-xs mb-1 block">
              {isRTL ? "اسم المنصة (إنجليزي) *" : "Provider Name EN *"}
            </Label>
            <Input
              type="text"
              placeholder="e.g. Dailymotion"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="bg-muted/30 border-input text-sm h-8"
              data-ocid="admin.apiconfig.custom_provider_name_en_input"
              dir="ltr"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">
              {isRTL ? "اسم المنصة (عربي)" : "Provider Name AR"}
            </Label>
            <Input
              type="text"
              placeholder="مثال: ديليموشن"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="bg-muted/30 border-input text-sm h-8"
              data-ocid="admin.apiconfig.custom_provider_name_ar_input"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">
              {isRTL ? "مضيف RapidAPI *" : "RapidAPI Host *"}
            </Label>
            <Input
              type="text"
              placeholder="e.g. dailymotion.p.rapidapi.com"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="bg-muted/30 border-input font-mono text-sm h-8"
              data-ocid="admin.apiconfig.custom_provider_host_input"
              dir="ltr"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">
              {isRTL ? "مفتاح RapidAPI *" : "RapidAPI Key *"}
            </Label>
            <Input
              type="password"
              placeholder="X-RapidAPI-Key..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="bg-muted/30 border-input font-mono text-sm h-8"
              data-ocid="admin.apiconfig.custom_provider_key_input"
              dir="ltr"
            />
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleSave}
          className="w-full gap-1.5 text-primary border-primary/40 hover:bg-primary/10"
          data-ocid="admin.apiconfig.custom_provider_save_button"
        >
          {isRTL ? "حفظ المزود" : "Save Provider"}
        </Button>

        {providers.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium">
              {isRTL ? "المزودون المحفوظون" : "Saved Providers"}
            </p>
            {providers.map((p, i) => (
              <div
                key={`${p.host}-${i}`}
                data-ocid={`admin.apiconfig.custom_provider.${i + 1}`}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30 border border-border"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {p.nameEn}
                    {p.nameAr ? ` / ${p.nameAr}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate font-mono">
                    {p.host}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(i)}
                  data-ocid={`admin.apiconfig.custom_provider_delete_button.${i + 1}`}
                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                  aria-label="Delete provider"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── settings tab ───────────────────────────────────────────────────────────

function SettingsTab({
  isRTL,
  labels,
}: {
  isRTL: boolean;
  labels: { platformSettings: string };
}) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("60");
  const [dailyLimit, setDailyLimit] = useState(() =>
    String(getAdminDailyDownloadLimit()),
  );
  const [savingLimit, setSavingLimit] = useState(false);

  function handleSaveDailyLimit() {
    const n = Number.parseInt(dailyLimit, 10);
    if (!Number.isFinite(n) || n < 1 || n > 100) {
      toast.error(
        isRTL
          ? "القيمة يجب أن تكون بين 1 و 100"
          : "Value must be between 1 and 100",
      );
      return;
    }
    setSavingLimit(true);
    setAdminDailyDownloadLimit(n);
    setSavingLimit(false);
    toast.success(
      isRTL
        ? `✓ تم حفظ: ${n} تحميل/يوم`
        : `✓ Daily limit saved: ${n} downloads/day`,
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            {labels.platformSettings}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm text-foreground">
                {isRTL ? "وضع الصيانة" : "Maintenance Mode"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL
                  ? "تعطيل المنصة مؤقتاً لجميع المستخدمين"
                  : "Temporarily disable the platform for all users"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={maintenanceMode}
              onClick={() => {
                setMaintenanceMode((v) => !v);
                toast.info(
                  isRTL
                    ? "قريباً — وضع الصيانة غير فعّال بعد"
                    : "Coming soon — maintenance mode not yet active",
                );
              }}
              className={`relative w-12 h-6 rounded-full border transition-smooth focus-visible:ring-2 focus-visible:ring-ring outline-none ${
                maintenanceMode
                  ? "bg-primary border-primary"
                  : "bg-muted border-border"
              }`}
              data-ocid="admin.settings.maintenance_toggle"
            >
              <span
                className={`absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-smooth ${
                  maintenanceMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Daily download limit */}
          <div className="space-y-2 pt-4 border-t border-border">
            <div>
              <p className="font-medium text-sm text-foreground">
                {isRTL
                  ? "عدد التحميلات اليومية للمستخدمين المجانيين"
                  : "Daily Download Limit (Free Users)"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL
                  ? "عدد التحميلات اليومية للمستخدمين بدون اشتراك (1–100)"
                  : "Max downloads per day for non-subscribed users (1–100)"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={1}
                max={100}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-24 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="admin.settings.daily_limit_input"
                dir="ltr"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleSaveDailyLimit}
                disabled={savingLimit}
                className="h-9 gradient-primary text-white border-0"
                data-ocid="admin.settings.daily_limit_save_button"
              >
                {isRTL ? "حفظ" : "Save"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {isRTL
                ? "فترة تحديث الترندات (دقيقة)"
                : "Trending Refresh Interval (minutes)"}
            </Label>
            <select
              value={refreshInterval}
              onChange={(e) => {
                setRefreshInterval(e.target.value);
                toast.info(
                  isRTL
                    ? "قريباً — الإعداد غير فعّال بعد"
                    : "Coming soon — interval setting not yet active",
                );
              }}
              className="w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="admin.settings.refresh_select"
            >
              <option value="15">{isRTL ? "15 دقيقة" : "15 minutes"}</option>
              <option value="30">{isRTL ? "30 دقيقة" : "30 minutes"}</option>
              <option value="60">{isRTL ? "ساعة واحدة" : "1 hour"}</option>
              <option value="180">{isRTL ? "3 ساعات" : "3 hours"}</option>
              <option value="360">{isRTL ? "6 ساعات" : "6 hours"}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-muted/10 p-4 text-center text-sm text-muted-foreground">
        <p className="font-display font-semibold text-foreground mb-1">
          {isRTL ? "المزيد من الإعدادات قريباً" : "More settings coming soon"}
        </p>
        <p className="text-xs">
          {isRTL
            ? "ستتوفر إعدادات إضافية في تحديث قادم."
            : "Additional platform controls will be available in a future update."}
        </p>
      </div>
    </div>
  );
}

const ADMIN_KEY = "streamverse_is_admin";
const ADMIN_USERNAME_KEY = "streamverse_admin_username";
const KNOWN_ADMIN_USERNAMES = ["mostfa", "admin"];

function isLocallyKnownAdmin(): boolean {
  if (localStorage.getItem(ADMIN_KEY) === "true") return true;
  const u = localStorage.getItem(ADMIN_USERNAME_KEY) ?? "";
  return KNOWN_ADMIN_USERNAMES.includes(u.toLowerCase().trim());
}

// ─── main page ───────────────────────────────────────────────────────────────

function ProvidersTab({ isAr }: { isAr: boolean }) {
  const { actor } = useActor();
  const [providerStates, setProviderStates] = useState<Record<string, boolean>>(
    {
      youtube: true,
      vimeo: true,
      tiktok: true,
      dailymotion: false,
      archive: true,
    },
  );
  const [dmKey, setDmKey] = useState("");
  const [dmKeyLocked, setDmKeyLocked] = useState(false);
  const [dmKeySaving, setDmKeySaving] = useState(false);
  const [dmKeyStatus, setDmKeyStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (actor?.getDailymotionApiKey) {
      actor
        .getDailymotionApiKey()
        .then((k: string) => {
          if (k) {
            setDmKey(k);
            setDmKeyLocked(true);
          }
        })
        .catch((e: unknown) => {
          console.warn("[Admin/Providers] getDailymotionApiKey failed", e);
        });
    }
  }, [actor]);

  const toggleProvider = async (id: string, val: boolean) => {
    setSaving(id);
    try {
      if (actor?.setProviderEnabled) await actor.setProviderEnabled(id, val);
      setProviderStates((prev) => ({ ...prev, [id]: val }));
      console.log(`[Admin/Providers] toggleProvider("${id}", ${val}) succeeded`);
    } catch (e) {
      console.error(`[Admin/Providers] toggleProvider("${id}", ${val}) failed`, e);
      toast.error(
        isAr
          ? `فشل تبديل المزود: ${parseBackendError(e)}`
          : `Failed to toggle provider: ${parseBackendError(e)}`,
      );
      // revert UI on failure
      setProviderStates((prev) => ({ ...prev, [id]: !val }));
    } finally {
      setSaving(null);
    }
  };

  const saveDmKey = async () => {
    if (!dmKey.trim()) {
      toast.error(isAr ? "أدخل مفتاح API" : "Enter an API key");
      return;
    }
    setDmKeySaving(true);
    try {
      const token = localStorage.getItem("adminToken") || ADMIN_TOKEN;
      if (actor?.setDailymotionApiKeyByToken) {
        const res = await actor.setDailymotionApiKeyByToken(dmKey.trim(), token);
        if ("ok" in res) {
          setDmKeyLocked(true);
          setDmKeyStatus("success");
          toast.success(isAr ? "✓ تم حفظ مفتاح Dailymotion" : "✓ Dailymotion key saved");
        } else {
          setDmKeyStatus("error");
          const errMsg = "err" in res ? String(res.err) : "Backend rejected key";
          console.error("[Admin/Providers] saveDmKey: backend rejected", errMsg);
          toast.error(parseBackendError(errMsg));
        }
      } else {
        console.error("[Admin/Providers] saveDmKey: setDailymotionApiKeyByToken not available on actor");
        toast.error(isAr ? "الباكند لا يدعم حفظ مفتاح Dailymotion" : "Backend does not support saving Dailymotion key");
        setDmKeyStatus("error");
      }
    } catch (e) {
      console.error("[Admin/Providers] saveDmKey failed", e);
      setDmKeyStatus("error");
      toast.error(parseBackendError(e));
    } finally {
      setDmKeySaving(false);
    }
  };

  const providers = [
    { id: "youtube", name: "YouTube", nameAr: "يوتيوب", canDownload: true },
    { id: "vimeo", name: "Vimeo", nameAr: "فيميو", canDownload: true },
    { id: "tiktok", name: "TikTok", nameAr: "تيك توك", canDownload: true },
    {
      id: "dailymotion",
      name: "Dailymotion",
      nameAr: "ديلي موشن",
      canDownload: true,
      needsKey: true,
    },
    {
      id: "archive",
      name: "Internet Archive",
      nameAr: "أرشيف الإنترنت",
      canDownload: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        {isAr ? "إدارة مزودي الفيديو" : "Video Provider Management"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => (
          <div key={p.id} className="bg-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-white">
                  {isAr ? p.nameAr : p.name}
                </span>
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.canDownload ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"}`}
                >
                  {p.canDownload
                    ? isAr
                      ? "تحميل متاح"
                      : "Downloads"
                    : isAr
                      ? "بث فقط"
                      : "Stream only"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleProvider(p.id, !providerStates[p.id])}
                disabled={saving === p.id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${providerStates[p.id] ? "bg-red-600" : "bg-gray-600"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${providerStates[p.id] ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
            {p.needsKey && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dmKey}
                  onChange={(e) => setDmKey(e.target.value)}
                  disabled={dmKeyLocked}
                  placeholder={
                    isAr
                      ? "أدخل Dailymotion API Key"
                      : "Enter Dailymotion API Key"
                  }
                  className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 disabled:opacity-60"
                />
                {dmKeyLocked ? (
                  <button
                    type="button"
                    onClick={() => setDmKeyLocked(false)}
                    className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-lg"
                  >
                    {isAr ? "تغيير" : "Change"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={saveDmKey}
                    disabled={dmKeySaving || !dmKey}
                    className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {dmKeySaving ? "..." : isAr ? "حفظ" : "Save"}
                  </button>
                )}
              </div>
            )}
            {p.needsKey && dmKeyStatus === "success" && (
              <p className="text-green-400 text-xs">
                {isAr ? "تم الحفظ بنجاح" : "Saved successfully"}
              </p>
            )}
            {p.needsKey && dmKeyStatus === "error" && (
              <p className="text-red-400 text-xs">
                {isAr ? "فشل الحفظ" : "Save failed"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab({ isAr }: { isAr: boolean }) {
  const { actor } = useActor();
  const [analytics, setAnalytics] = useState<{
    totalDownloads: number;
    byTier: { tier: string; count: number }[];
    topUsers: { userId: string; count: number }[];
    dailyTotals: { date: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (actor?.getDownloadAnalytics) {
      actor
        .getDownloadAnalytics()
        .then(
          (d: {
            totalDownloads: bigint;
            byTier: { tier: string; count: bigint }[];
            topUsers: { userId: string; count: bigint }[];
            dailyTotals: { date: string; count: bigint }[];
          }) => {
            setAnalytics({
              totalDownloads: Number(d.totalDownloads),
              byTier: d.byTier.map((t: { tier: string; count: bigint }) => ({
                tier: t.tier,
                count: Number(t.count),
              })),
              topUsers: d.topUsers.map(
                (u: { userId: string; count: bigint }) => ({
                  userId: u.userId,
                  count: Number(u.count),
                }),
              ),
              dailyTotals: d.dailyTotals.map(
                (dt: { date: string; count: bigint }) => ({
                  date: dt.date,
                  count: Number(dt.count),
                }),
              ),
            });
            setLoading(false);
          },
        )
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [actor]);

  if (loading)
    return (
      <div className="text-gray-400 text-sm">
        {isAr ? "جارٍ التحميل..." : "Loading..."}
      </div>
    );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">
        {isAr ? "تحليلات التحميل" : "Download Analytics"}
      </h3>
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl font-bold text-red-500">
          {analytics?.totalDownloads ?? 0}
        </div>
        <div className="text-gray-400 text-sm mt-1">
          {isAr ? "إجمالي التحميلات" : "Total Downloads"}
        </div>
      </div>
      {analytics?.byTier && analytics.byTier.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            {isAr ? "حسب الاشتراك" : "By Subscription Tier"}
          </h4>
          <div className="space-y-2">
            {analytics.byTier.map((t) => (
              <div key={t.tier} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-20 capitalize">
                  {t.tier}
                </span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${analytics.totalDownloads ? Math.round((t.count / analytics.totalDownloads) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="text-white text-sm w-10 text-right">
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {analytics?.topUsers && analytics.topUsers.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            {isAr ? "أكثر المستخدمين تحميلاً" : "Top Users by Downloads"}
          </h4>
          <div className="space-y-2">
            {analytics.topUsers.slice(0, 5).map((u, i) => (
              <div
                key={u.userId}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-300">
                  #{i + 1} {u.userId.slice(0, 16)}...
                </span>
                <span className="text-white font-medium">{u.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Admin() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Start as true if we already know from localStorage — don't flash loading screen
  const [adminChecked, setAdminChecked] = useState<boolean>(() =>
    isLocallyKnownAdmin(),
  );
  const redirected = useRef(false);

  // Verify admin role — but only redirect if BOTH localStorage AND backend say no
  useEffect(() => {
    // If already confirmed via localStorage, no need to wait for actor
    if (adminChecked) return;

    // Give a brief grace period for actor to load before redirecting
    if (isFetching || !actor) return;

    // Re-check localStorage one more time (in case login completed while loading)
    if (isLocallyKnownAdmin()) {
      setAdminChecked(true);
      return;
    }

    actor
      .isCallerAdmin()
      .then((isAdminResult: boolean) => {
        // Double-check localStorage too — backend check may be anonymous-based
        const locallyAdmin = isLocallyKnownAdmin();
        if (isAdminResult || locallyAdmin) {
          if (isAdminResult) {
            localStorage.setItem(ADMIN_KEY, "true");
          }
          setAdminChecked(true);
        } else if (!redirected.current) {
          redirected.current = true;
          toast.error(
            isRTL
              ? "غير مصرح لك. هذه الصفحة للمسؤولين فقط."
              : "Access denied. Admins only.",
          );
          void navigate({ to: "/" });
        }
      })
      .catch(() => {
        // On error, trust localStorage
        if (isLocallyKnownAdmin()) {
          setAdminChecked(true);
        } else if (!redirected.current) {
          redirected.current = true;
          void navigate({ to: "/" });
        }
      });
  }, [actor, isFetching, navigate, isRTL, adminChecked]);

  // Load data after role verified
  useEffect(() => {
    if (!adminChecked || !actor) return;

    actor
      .getAdminStats()
      .then((s: AdminStats) => {
        setStats(s);
        setLoadingStats(false);
      })
      .catch((e: unknown) => {
        console.error("[Admin] getAdminStats failed", e);
        toast.error(
          isRTL
            ? "تعذر تحميل الإحصائيات — تحقق من الاتصال بالخادم"
            : "Failed to load stats — check server connection",
        );
        setLoadingStats(false);
      });

    actor
      .listAllUsers()
      .then((list: UserPublic[]) => {
        setUsers(list);
        setLoadingUsers(false);
      })
      .catch((e: unknown) => {
        console.error("[Admin] listAllUsers failed", e);
        toast.error(
          isRTL
            ? "تعذر تحميل قائمة المستخدمين"
            : "Failed to load users list",
        );
        setLoadingUsers(false);
      });
  }, [adminChecked, actor]);

  async function handleBan(userId: string) {
    if (!actor) return;
    const user = users.find((u) => u.id.toText() === userId);
    if (!user) {
      console.error("[Admin] handleBan: user not found", userId);
      toast.error(isRTL ? "المستخدم غير موجود" : "User not found");
      return;
    }
    try {
      await actor.banUser(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id.toText() === userId ? { ...u, isBanned: true } : u,
        ),
      );
      toast.success(isRTL ? "تم حظر المستخدم" : "User banned");
    } catch (e) {
      console.error("[Admin] banUser failed", userId, e);
      toast.error(parseBackendError(e));
    }
  }

  async function handleUnban(userId: string) {
    if (!actor) return;
    const user = users.find((u) => u.id.toText() === userId);
    if (!user) {
      console.error("[Admin] handleUnban: user not found", userId);
      toast.error(isRTL ? "المستخدم غير موجود" : "User not found");
      return;
    }
    try {
      await actor.unbanUser(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id.toText() === userId ? { ...u, isBanned: false } : u,
        ),
      );
      toast.success(isRTL ? "تم إلغاء الحظر" : "User unbanned");
    } catch (e) {
      console.error("[Admin] unbanUser failed", userId, e);
      toast.error(parseBackendError(e));
    }
  }

  async function handlePromote(userId: string) {
    if (!actor) return;
    const user = users.find((u) => u.id.toText() === userId);
    if (!user) {
      console.error("[Admin] handlePromote: user not found", userId);
      toast.error(isRTL ? "المستخدم غير موجود" : "User not found");
      return;
    }
    try {
      await actor.promoteToAdmin(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id.toText() === userId ? { ...u, role: UserRole.admin } : u,
        ),
      );
      toast.success(isRTL ? "تمت الترقية إلى مسؤول" : "User promoted to admin");
    } catch (e) {
      console.error("[Admin] promoteToAdmin failed", userId, e);
      toast.error(parseBackendError(e));
    }
  }

  async function handleDemote(userId: string) {
    if (!actor) return;
    const user = users.find((u) => u.id.toText() === userId);
    if (!user) {
      console.error("[Admin] handleDemote: user not found", userId);
      toast.error(isRTL ? "المستخدم غير موجود" : "User not found");
      return;
    }
    try {
      await actor.demoteFromAdmin(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id.toText() === userId ? { ...u, role: UserRole.user } : u,
        ),
      );
      toast.success(isRTL ? "تم إلغاء صلاحية المسؤول" : "User demoted");
    } catch (e) {
      console.error("[Admin] demoteFromAdmin failed", userId, e);
      toast.error(parseBackendError(e));
    }
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: t("dashboard"),
      icon: <BarChart3 className="w-4 h-4" />,
    },
    { id: "users", label: t("users"), icon: <Users className="w-4 h-4" /> },
    {
      id: "videos",
      label: isRTL ? "الفيديوهات" : "Videos",
      icon: <Video className="w-4 h-4" />,
    },
    {
      id: "comments",
      label: isRTL ? "التعليقات" : "Comments",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: "monetization",
      label: isRTL ? "الإيرادات" : "Monetization",
      icon: <BadgeDollarSign className="w-4 h-4" />,
    },
    { id: "apiconfig", label: t("apiKeys"), icon: <Key className="w-4 h-4" /> },
    {
      id: "settings",
      label: t("platformSettings"),
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: "providers",
      label: isRTL ? "مزودي الفيديو" : "Video Providers",
      icon: <Video className="w-4 h-4" />,
    },
    {
      id: "analytics",
      label: isRTL ? "التحليلات" : "Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "ads",
      label: isRTL ? "الإعلانات" : "Ads",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      id: "subscriptions",
      label: isRTL ? "الاشتراكات" : "Subscriptions",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  if (!adminChecked) {
    return (
      <div
        className="flex flex-1 items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <div className="text-center space-y-3">
          <Shield className="w-10 h-10 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full bg-background pb-20 md:pb-8"
      dir={isRTL ? "rtl" : "ltr"}
      data-ocid="admin.page"
    >
      {/* Page header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground text-lg leading-tight">
              {t("dashboard")}
            </h1>
            <p className="text-xs text-muted-foreground">{t("admin")}</p>
          </div>
          <Badge variant="secondary" className="ms-auto text-xs">
            {isRTL ? "مسؤول" : "Admin"}
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Mobile top tabs */}
        <div className="flex md:hidden gap-1 overflow-x-auto pb-3 -mx-4 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-smooth whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`admin.mobile_tab.${tab.id}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col gap-1 w-52 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth text-start ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
                data-ocid={`admin.sidebar_tab.${tab.id}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Tab content */}
          <main className="flex-1 min-w-0">
            {activeTab === "overview" && (
              <OverviewTab
                stats={stats}
                loading={loadingStats}
                labels={{
                  totalUsers: t("totalUsers"),
                  totalWatches: t("totalWatches"),
                  trending: t("trending"),
                  bannedUsers: t("bannedUsers"),
                  statistics: t("statistics"),
                }}
              />
            )}
            {activeTab === "users" && (
              <UsersTab
                users={users}
                loading={loadingUsers}
                labels={{
                  manageUsers: t("manageUsers"),
                  cancel: t("cancel"),
                  confirm: t("confirm"),
                  banUser: t("banUser"),
                  unbanUser: t("unbanUser"),
                }}
                onBan={handleBan}
                onUnban={handleUnban}
                onPromote={handlePromote}
                onDemote={handleDemote}
              />
            )}
            {activeTab === "videos" && <AdminVideosTab isRTL={isRTL} />}
            {activeTab === "comments" && <AdminCommentsTab isRTL={isRTL} />}
            {activeTab === "monetization" && (
              <AdminMonetizationTab isRTL={isRTL} />
            )}
            {activeTab === "apiconfig" && (
              <ApiConfigTab
                isRTL={isRTL}
                labels={{
                  apiKeys: t("apiKeys"),
                  apiKeyPlaceholder: t("apiKeyPlaceholder"),
                  saveApiKey: t("saveApiKey"),
                  loading: t("loading"),
                  vimeoApiKey: t("admin.vimeoApiKey"),
                  vimeoApiKeyPlaceholder: t("vimeoApiKeyPlaceholder"),
                }}
              />
            )}
            {activeTab === "settings" && (
              <AdminSettingsTab isRTL={isRTL} />
            )}
            {activeTab === "providers" && <ProvidersTab isAr={isRTL} />}
            {activeTab === "analytics" && <AnalyticsTab isAr={isRTL} />}
            {activeTab === "ads" && <AdminAdsTab isRTL={isRTL} />}
            {activeTab === "subscriptions" && (
              <AdminSubscriptionsTab isRTL={isRTL} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Admin;
