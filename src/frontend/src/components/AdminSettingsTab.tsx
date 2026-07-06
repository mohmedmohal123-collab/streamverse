import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader as Loader2, Save, Settings as SettingsIcon, Wrench, Globe, ChartBar as BarChart3, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type AdminSettings,
  fetchAdminSettings,
  saveAdminSetting,
} from "../lib/api";

export function AdminSettingsTab({ isRTL }: { isRTL: boolean }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await fetchAdminSettings();
      setSettings(data);
      const values: Record<string, string> = {};
      for (const [key, val] of Object.entries(data)) {
        values[key] = val.value;
      }
      setLocalValues(values);
    } catch (e) {
      console.error("[Admin/Settings] load failed", e);
      toast.error(
        isRTL ? "فشل تحميل الإعدادات" : "Failed to load settings",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(key: string) {
    const value = localValues[key];
    if (value === undefined) return;
    setSaving(key);
    try {
      await saveAdminSetting(key, value);
      toast.success(
        isRTL ? "✓ تم حفظ الإعداد" : "✓ Setting saved",
      );
      await loadSettings();
    } catch (e) {
      console.error("[Admin/Settings] save failed", key, e);
      toast.error(
        isRTL
          ? `فشل الحفظ: ${e instanceof Error ? e.message : ""}`
          : `Failed to save: ${e instanceof Error ? e.message : ""}`,
      );
    } finally {
      setSaving(null);
    }
  }

  function updateLocal(key: string, value: string) {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const setting = (key: string) => settings?.[key];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            {isRTL ? "الإعدادات العامة" : "General Settings"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "المصادقة، البيئة، وضع الصيانة، التحليلات"
              : "Authentication, environment, maintenance, analytics"}
          </p>
        </div>
      </div>

      {/* Authentication section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            {isRTL ? "المصادقة و Google OAuth" : "Authentication & Google OAuth"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {isRTL ? "Google Client ID" : "Google Client ID"}
            </Label>
            <div className="flex gap-2">
              <Input
                value={localValues["google_client_id"] ?? ""}
                onChange={(e) => updateLocal("google_client_id", e.target.value)}
                placeholder="xxxxx.apps.googleusercontent.com"
                className="bg-background"
              />
              <Button
                onClick={() => handleSave("google_client_id")}
                disabled={saving === "google_client_id"}
                size="sm"
                className="shrink-0"
              >
                {saving === "google_client_id" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance mode */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-400" />
            {isRTL ? "وضع الصيانة" : "Maintenance Mode"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">
                {isRTL
                  ? "تعطيل الوصول للتطبيق وإظهار صفحة الصيانة"
                  : "Disable app access and show maintenance page"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL
                  ? "المسؤولون يمكنهم الوصول دائماً"
                  : "Admins always have access"}
              </p>
            </div>
            <Switch
              checked={localValues["maintenance_mode"] === "true"}
              onCheckedChange={async (v) => {
                updateLocal("maintenance_mode", String(v));
                setSaving("maintenance_mode");
                try {
                  await saveAdminSetting("maintenance_mode", String(v));
                  toast.success(
                    isRTL
                      ? v
                        ? "تم تفعيل وضع الصيانة"
                        : "تم إلغاء وضع الصيانة"
                      : v
                        ? "Maintenance mode enabled"
                        : "Maintenance mode disabled",
                  );
                } catch (e) {
                  toast.error(isRTL ? "فشل التبديل" : "Failed to toggle");
                } finally {
                  setSaving(null);
                }
              }}
              disabled={saving === "maintenance_mode"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment providers keys */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">
            {isRTL ? "مفاتيح Stripe" : "Stripe Keys"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecretInput
            label="Stripe Publishable Key"
            isSecret={false}
            value={localValues["stripe_publishable_key"] ?? ""}
            onChange={(v) => updateLocal("stripe_publishable_key", v)}
            onSave={() => handleSave("stripe_publishable_key")}
            saving={saving === "stripe_publishable_key"}
            isRTL={isRTL}
          />
          <SecretInput
            label="Stripe Secret Key"
            isSecret={true}
            value={localValues["stripe_secret_key"] ?? ""}
            onChange={(v) => updateLocal("stripe_secret_key", v)}
            onSave={() => handleSave("stripe_secret_key")}
            saving={saving === "stripe_secret_key"}
            isRTL={isRTL}
            show={showSecrets["stripe_secret_key"]}
            onToggleShow={() =>
              setShowSecrets((p) => ({ ...p, stripe_secret_key: !p.stripe_secret_key }))
            }
          />
          <SecretInput
            label="Stripe Webhook Secret"
            isSecret={true}
            value={localValues["stripe_webhook_secret"] ?? ""}
            onChange={(v) => updateLocal("stripe_webhook_secret", v)}
            onSave={() => handleSave("stripe_webhook_secret")}
            saving={saving === "stripe_webhook_secret"}
            isRTL={isRTL}
            show={showSecrets["stripe_webhook_secret"]}
            onToggleShow={() =>
              setShowSecrets((p) => ({ ...p, stripe_webhook_secret: !p.stripe_webhook_secret }))
            }
          />
        </CardContent>
      </Card>

      {/* PayPal keys */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">
            {isRTL ? "مفاتيح PayPal" : "PayPal Keys"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecretInput
            label="PayPal Client ID"
            isSecret={false}
            value={localValues["paypal_client_id"] ?? ""}
            onChange={(v) => updateLocal("paypal_client_id", v)}
            onSave={() => handleSave("paypal_client_id")}
            saving={saving === "paypal_client_id"}
            isRTL={isRTL}
          />
          <SecretInput
            label="PayPal Client Secret"
            isSecret={true}
            value={localValues["paypal_client_secret"] ?? ""}
            onChange={(v) => updateLocal("paypal_client_secret", v)}
            onSave={() => handleSave("paypal_client_secret")}
            saving={saving === "paypal_client_secret"}
            isRTL={isRTL}
            show={showSecrets["paypal_client_secret"]}
            onToggleShow={() =>
              setShowSecrets((p) => ({ ...p, paypal_client_secret: !p.paypal_client_secret }))
            }
          />
        </CardContent>
      </Card>

      {/* Google Play Billing */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">
            {isRTL ? "Google Play Billing" : "Google Play Billing"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SecretInput
            label="Google Play Billing Key"
            isSecret={true}
            value={localValues["google_play_billing_key"] ?? ""}
            onChange={(v) => updateLocal("google_play_billing_key", v)}
            onSave={() => handleSave("google_play_billing_key")}
            saving={saving === "google_play_billing_key"}
            isRTL={isRTL}
            show={showSecrets["google_play_billing_key"]}
            onToggleShow={() =>
              setShowSecrets((p) => ({ ...p, google_play_billing_key: !p.google_play_billing_key }))
            }
          />
        </CardContent>
      </Card>

      {/* Streaming providers */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">
            {isRTL ? "مزودات البث" : "Streaming Providers"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">VidSrc</Label>
            <Switch
              checked={localValues["vidsrc_enabled"] !== "false"}
              onCheckedChange={async (v) => {
                updateLocal("vidsrc_enabled", String(v));
                await saveAdminSetting("vidsrc_enabled", String(v)).catch(() => {});
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Archive.org</Label>
            <Switch
              checked={localValues["archive_enabled"] !== "false"}
              onCheckedChange={async (v) => {
                updateLocal("archive_enabled", String(v));
                await saveAdminSetting("archive_enabled", String(v)).catch(() => {});
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {isRTL ? "التحليلات" : "Analytics"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? "آخر تحديث" : "Last Updated"}
              </p>
              <p className="text-sm font-medium text-foreground">
                {settings?.maintenance_mode?.updatedAt
                  ? new Date(settings.maintenance_mode.updatedAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? "حالة النظام" : "System Status"}
              </p>
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400">
                {isRTL ? "يعمل" : "Operational"}
              </Badge>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? "الإعدادات" : "Settings"}
              </p>
              <p className="text-sm font-medium text-foreground">
                {Object.keys(settings ?? {}).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecretInput({
  label,
  value,
  onChange,
  onSave,
  saving,
  isSecret,
  isRTL,
  show,
  onToggleShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  isSecret: boolean;
  isRTL: boolean;
  show?: boolean;
  onToggleShow?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={isSecret && !show ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isRTL ? "أدخل القيمة" : "Enter value"}
            className="bg-background"
          />
          {isSecret && onToggleShow && (
            <button
              type="button"
              onClick={onToggleShow}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        <Button
          onClick={onSave}
          disabled={saving}
          size="sm"
          className="shrink-0"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
