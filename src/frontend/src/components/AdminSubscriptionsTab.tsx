import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CreditCard, Check, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type SubscriptionPlan,
  fetchSubscriptionPlans,
  saveSubscriptionPlan,
  saveAdminSetting,
} from "../lib/api";

const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "EGP"];

const DEFAULT_FEATURES: Record<string, string[]> = {
  free: ["Search & Watch", "Watch History", "Basic Quality"],
  plus: ["All Free features", "HD Quality", "No Ads", "Download Videos"],
  pro: ["All Plus features", "4K Quality", "Early Access", "Priority Support", "Creator Analytics"],
};

interface PlanFormData {
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  currency: string;
  isActive: boolean;
  features: string;
}

export function AdminSubscriptionsTab({ isRTL }: { isRTL: boolean }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, PlanFormData>>({});

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const { plans: data, subscriptionsEnabled: enabled } = await fetchSubscriptionPlans();
      setPlans(data);
      setSubscriptionsEnabled(enabled);

      const formsMap: Record<string, PlanFormData> = {};
      for (const plan of data) {
        formsMap[plan.id] = {
          name: plan.name,
          description: plan.description,
          monthlyPrice: String(plan.monthly_price),
          annualPrice: String(plan.annual_price),
          currency: plan.currency,
          isActive: plan.is_active,
          features: Array.isArray(plan.features) ? plan.features.join(", ") : String(plan.features),
        };
      }
      setForms(formsMap);
    } catch (e) {
      console.error("[Admin/Subscriptions] load failed", e);
      toast.error(
        isRTL ? "فشل تحميل خطط الاشتراك" : "Failed to load subscription plans",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(planId: string) {
    const formData = forms[planId];
    if (!formData) return;
    setSaving(planId);
    try {
      const features = formData.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      await saveSubscriptionPlan({
        id: planId,
        name: formData.name,
        description: formData.description,
        monthlyPrice: formData.monthlyPrice,
        annualPrice: formData.annualPrice,
        currency: formData.currency,
        isActive: formData.isActive,
        features,
        sortOrder: plans.find((p) => p.id === planId)?.sort_order ?? 0,
      });

      toast.success(
        isRTL ? "✓ تم حفظ خطة الاشتراك" : "✓ Subscription plan saved",
      );
      await loadPlans();
    } catch (e) {
      console.error("[Admin/Subscriptions] save failed", planId, e);
      toast.error(
        isRTL
          ? `فشل الحفظ: ${e instanceof Error ? e.message : ""}`
          : `Failed to save: ${e instanceof Error ? e.message : ""}`,
      );
    } finally {
      setSaving(null);
    }
  }

  async function handleToggleSubscriptions(enabled: boolean) {
    setSubscriptionsEnabled(enabled);
    try {
      await saveAdminSetting("subscriptions_enabled", String(enabled));
      toast.success(
        isRTL
          ? enabled
            ? "تم تفعيل الاشتراكات"
            : "تم إلغاء تفعيل الاشتراكات"
          : enabled
            ? "Subscriptions enabled"
            : "Subscriptions disabled",
      );
    } catch (e) {
      console.error("[Admin/Subscriptions] toggle failed", e);
      setSubscriptionsEnabled(!enabled);
      toast.error(isRTL ? "فشل التبديل" : "Failed to toggle");
    }
  }

  function updateForm(planId: string, updates: Partial<PlanFormData>) {
    setForms((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], ...updates },
    }));
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {isRTL ? "إدارة الاشتراكات" : "Subscription Management"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? "إدارة خطط الاشتراك والأسعار والعملات"
                : "Manage subscription plans, pricing, and currencies"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground">
            {isRTL ? "تفعيل الاشتراكات" : "Enable Subscriptions"}
          </Label>
          <Switch
            checked={subscriptionsEnabled}
            onCheckedChange={handleToggleSubscriptions}
          />
        </div>
      </div>

      {/* Payment providers info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            {isRTL ? "مزودات الدفع" : "Payment Providers"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Stripe</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {isRTL ? "مفعّل" : "Configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>PayPal</span>
            <Badge variant="outline" className="text-muted-foreground">
              {isRTL ? "يتطلب إعداد" : "Requires setup"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Google Play Billing</span>
            <Badge variant="outline" className="text-muted-foreground">
              {isRTL ? "يتطلب إعداد" : "Requires setup"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Plan cards */}
      {plans.map((plan) => {
        const formData = forms[plan.id];
        if (!formData) return null;

        return (
          <Card key={plan.id} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {plan.name}
                <Badge variant="outline" className="text-xs">
                  {plan.id}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">
                  {isRTL ? "نشط" : "Active"}
                </Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(v) => updateForm(plan.id, { isActive: v })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name and description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {isRTL ? "الاسم" : "Name"}
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateForm(plan.id, { name: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {isRTL ? "الوصف" : "Description"}
                  </Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => updateForm(plan.id, { description: e.target.value })}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {isRTL ? "السعر الشهري" : "Monthly Price"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.monthlyPrice}
                    onChange={(e) => updateForm(plan.id, { monthlyPrice: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {isRTL ? "السعر السنوي" : "Annual Price (/mo)"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.annualPrice}
                    onChange={(e) => updateForm(plan.id, { annualPrice: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {isRTL ? "العملة" : "Currency"}
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(v) => updateForm(plan.id, { currency: v })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {isRTL ? "المميزات (مفصولة بفواصل)" : "Features (comma-separated)"}
                </Label>
                <Input
                  value={formData.features}
                  onChange={(e) => updateForm(plan.id, { features: e.target.value })}
                  placeholder={DEFAULT_FEATURES[plan.id]?.join(", ") ?? ""}
                  className="bg-background"
                />
              </div>

              {/* Save button */}
              <Button
                onClick={() => handleSave(plan.id)}
                disabled={saving === plan.id}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <Check className="h-4 w-4 me-2" />
                )}
                {isRTL ? "حفظ الخطة" : "Save Plan"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
