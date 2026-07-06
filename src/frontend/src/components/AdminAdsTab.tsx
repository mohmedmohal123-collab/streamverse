import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader as Loader2, Megaphone, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type AdConfig,
  fetchAdConfigs,
  saveAdConfig,
  deleteAdConfig,
} from "../lib/api";

const PROVIDERS = [
  { id: "admob", name: "Google AdMob", color: "text-rose-400" },
  { id: "applovin", name: "AppLovin", color: "text-amber-400" },
  { id: "unity", name: "Unity Ads", color: "text-cyan-400" },
] as const;

const AD_TYPES = [
  { field: "banner_ad_unit", label: "Banner Ad Unit ID" },
  { field: "native_ad_unit", label: "Native Ad Unit ID" },
  { field: "interstitial_ad_unit", label: "Interstitial Ad Unit ID" },
  { field: "rewarded_ad_unit", label: "Rewarded Ad Unit ID" },
] as const;

export function AdminAdsTab({ isRTL }: { isRTL: boolean }) {
  const [configs, setConfigs] = useState<AdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [adsEnabled, setAdsEnabled] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    setLoading(true);
    try {
      const data = await fetchAdConfigs();
      setConfigs(data);
      const defaultProvider = data.find((c) => c.is_default);
      setAdsEnabled(!!defaultProvider?.is_enabled);
    } catch (e) {
      console.error("[Admin/Ads] load failed", e);
      toast.error(
        isRTL
          ? "فشل تحميل إعدادات الإعلانات"
          : "Failed to load ad settings",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(provider: string, fields: Partial<AdConfig>) {
    setSaving(provider);
    try {
      await saveAdConfig(provider, fields);
      toast.success(
        isRTL ? "✓ تم حفظ إعدادات الإعلانات" : "✓ Ad settings saved",
      );
      await loadConfigs();
    } catch (e) {
      console.error("[Admin/Ads] save failed", provider, e);
      toast.error(
        isRTL
          ? `فشل حفظ الإعدادات: ${e instanceof Error ? e.message : ""}`
          : `Failed to save: ${e instanceof Error ? e.message : ""}`,
      );
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(provider: string) {
    try {
      await deleteAdConfig(provider);
      toast.success(isRTL ? "تم حذف المزود" : "Provider deleted");
      await loadConfigs();
    } catch (e) {
      console.error("[Admin/Ads] delete failed", provider, e);
      toast.error(isRTL ? "فشل الحذف" : "Failed to delete");
    }
  }

  function getConfig(provider: string): AdConfig | undefined {
    return configs.find((c) => c.provider === provider);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            {isRTL ? "إدارة الإعلانات" : "Ads Management"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "إدارة مزودات الإعلانات ووحدات الإعلان"
              : "Manage ad providers and ad units"}
          </p>
        </div>
      </div>

      {/* Provider cards */}
      {PROVIDERS.map((provider) => {
        const config = getConfig(provider.id);
        const isEnabled = config?.is_enabled ?? false;
        const isDefault = config?.is_default ?? false;

        return (
          <AdProviderCard
            key={provider.id}
            provider={provider}
            config={config}
            isEnabled={isEnabled}
            isDefault={isDefault}
            isRTL={isRTL}
            saving={saving === provider.id}
            onSave={(fields) => handleSave(provider.id, fields)}
            onDelete={() => handleDelete(provider.id)}
          />
        );
      })}
    </div>
  );
}

function AdProviderCard({
  provider,
  config,
  isEnabled,
  isDefault,
  isRTL,
  saving,
  onSave,
  onDelete,
}: {
  provider: { id: string; name: string; color: string };
  config?: AdConfig;
  isEnabled: boolean;
  isDefault: boolean;
  isRTL: boolean;
  saving: boolean;
  onSave: (fields: Partial<AdConfig>) => void;
  onDelete: () => void;
}) {
  const [enabled, setEnabled] = useState(isEnabled);
  const [defaultProvider, setDefaultProvider] = useState(isDefault);
  const [appId, setAppId] = useState(config?.app_id ?? "");
  const [apiKey, setApiKey] = useState(config?.api_key ?? "");
  const [adUnits, setAdUnits] = useState<Record<string, string>>({
    banner_ad_unit: config?.banner_ad_unit ?? "",
    native_ad_unit: config?.native_ad_unit ?? "",
    interstitial_ad_unit: config?.interstitial_ad_unit ?? "",
    rewarded_ad_unit: config?.rewarded_ad_unit ?? "",
  });

  function handleSave() {
    const fields: Partial<AdConfig> = {
      is_enabled: enabled,
      is_default: defaultProvider,
      app_id: appId,
      api_key: apiKey,
      ...adUnits,
    };
    onSave(fields);
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <CardTitle className={`text-base font-semibold ${provider.color}`}>
            {provider.name}
          </CardTitle>
          {isDefault && (
            <Badge variant="secondary" className="text-xs bg-primary/15 text-primary">
              {isRTL ? "افتراضي" : "Default"}
            </Badge>
          )}
          {isEnabled && (
            <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-400">
              {isRTL ? "مفعّل" : "Active"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          {/* Default provider toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              {isRTL ? "استخدام ك مزود افتراضي" : "Set as default provider"}
            </Label>
            <Switch
              checked={defaultProvider}
              onCheckedChange={setDefaultProvider}
            />
          </div>

          {/* App ID */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {isRTL ? "معرّف التطبيق (App ID)" : "App ID"}
            </Label>
            <Input
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder={isRTL ? "أدخل معرّف التطبيق" : "Enter App ID"}
              className="bg-background"
            />
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {isRTL ? "مفتاح API" : "API Key"}
            </Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={isRTL ? "أدخل مفتاح API" : "Enter API Key"}
              className="bg-background"
            />
          </div>

          {/* Ad units */}
          {AD_TYPES.map((adType) => (
            <div key={adType.field} className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {isRTL ? adType.label.replace("Ad Unit ID", "معرّف وحدة") : adType.label}
              </Label>
              <Input
                value={adUnits[adType.field] ?? ""}
                onChange={(e) =>
                  setAdUnits({ ...adUnits, [adType.field]: e.target.value })
                }
                placeholder={isRTL ? "أدخل معرّف الوحدة" : "Enter Ad Unit ID"}
                className="bg-background"
              />
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Plus className="h-4 w-4 me-2" />
              )}
              {isRTL ? "حفظ" : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 me-2" />
              {isRTL ? "حذف" : "Delete"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
