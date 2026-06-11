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
import {
  Calendar,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  type SubscriptionTierKind,
  useCancelSubscription,
  useCreateCheckoutSession,
  useCreateCustomerPortalSession,
  useMySubscription,
} from "../hooks/useSubscription";
import { useTranslation } from "../lib/i18n";

type BillingCycle = "monthly" | "annual";

interface TierConfig {
  id: SubscriptionTierKind;
  featured?: boolean;
  features: string[];
  featuresAr: string[];
  monthlyPrice: number;
  annualPrice: number;
}

const TIERS: TierConfig[] = [
  {
    id: "free",
    features: ["Search & Watch", "Watch History", "Basic Quality"],
    featuresAr: ["بحث ومشاهدة", "سجل المشاهدة", "جودة أساسية"],
    monthlyPrice: 0,
    annualPrice: 0,
  },
  {
    id: "plus",
    features: ["All Free features", "HD Quality", "No Ads", "Download Videos"],
    featuresAr: [
      "كل مميزات المجاني",
      "جودة عالية HD",
      "بدون إعلانات",
      "تحميل الفيديوهات",
    ],
    monthlyPrice: 4.99,
    annualPrice: 3.99,
  },
  {
    id: "pro",
    featured: true,
    features: [
      "All Plus features",
      "4K Quality",
      "Early Access",
      "Priority Support",
      "Creator Analytics",
    ],
    featuresAr: [
      "كل مميزات بلس",
      "جودة 4K",
      "وصول مبكر",
      "دعم أولوية",
      "تحليلات المنشئ",
    ],
    monthlyPrice: 9.99,
    annualPrice: 7.99,
  },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  canceled: "bg-destructive/15 text-destructive border-destructive/30",
  past_due: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  none: "bg-muted text-muted-foreground border-border",
};

function formatDate(ts: number | undefined, isRTL: boolean): string {
  if (!ts || ts === 0) return "";
  const date = new Date(ts < 1e12 ? ts * 1000 : ts);
  return date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Subscribe() {
  const { t, isRTL } = useTranslation();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const { data: subscription } = useMySubscription();
  const { mutate: checkout, isPending: checkingOut } =
    useCreateCheckoutSession();
  const { mutate: cancelSub, isPending: canceling } = useCancelSubscription();
  const { mutate: openPortal, isPending: openingPortal } =
    useCreateCustomerPortalSession();

  const currentTier = subscription?.tier ?? "free";
  const currentStatus = subscription?.status ?? "none";
  const isActiveSub =
    currentStatus === "active" &&
    (currentTier === "plus" || currentTier === "pro");

  function handleUpgrade(tier: SubscriptionTierKind) {
    if (tier === "free") return;
    const successUrl = `${window.location.origin}/subscribe?success=1&tier=${tier}`;
    const cancelUrl = `${window.location.origin}/subscribe`;
    checkout({ tier, successUrl, cancelUrl, billing });
  }

  return (
    <div className="transition-page min-h-screen overflow-y-auto pb-28 md:pb-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto pt-8 px-4 mb-8 space-y-2">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
          <CreditCard className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl text-foreground">
          {t("subscribe.title")}
        </h1>
        <p className="text-muted-foreground">{t("subscribe.subtitle")}</p>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center mb-8 px-4">
        <div
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border"
          data-ocid="subscribe.billing_toggle"
        >
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            data-ocid="subscribe.billing_monthly_tab"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              billing === "monthly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isRTL ? "شهري" : "Monthly"}
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            data-ocid="subscribe.billing_annual_tab"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              billing === "annual"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isRTL ? "سنوي" : "Annual"}
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
              {isRTL ? "وفر 20%" : "Save 20%"}
            </span>
          </button>
        </div>
      </div>

      {/* Active subscription status panel */}
      {isActiveSub && (
        <div
          className="max-w-2xl mx-auto px-4 mb-8"
          data-ocid="subscribe.status_panel"
        >
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {t(
                      `subscribe.${currentTier}.name` as Parameters<
                        typeof t
                      >[0],
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[currentStatus] ?? STATUS_COLORS.none}`}
                      data-ocid="subscribe.current_status_badge"
                    >
                      {t(
                        `subscribe.status.${currentStatus}` as Parameters<
                          typeof t
                        >[0],
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {subscription?.currentPeriodEnd !== undefined &&
                subscription.currentPeriodEnd > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>
                      {t("subscribe.nextBilling")}:{" "}
                      <span className="text-foreground font-medium">
                        {formatDate(subscription.currentPeriodEnd, isRTL)}
                      </span>
                    </span>
                  </div>
                )}
            </div>

            <div className="border-t border-cyan-500/20 pt-4 space-y-1">
              <p className="text-xs text-muted-foreground mb-3">
                {t("subscribe.managePaymentHint")}
              </p>
              <Button
                variant="outline"
                className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-all gap-2"
                onClick={() => openPortal()}
                disabled={openingPortal}
                data-ocid="subscribe.manage_payment_button"
              >
                {openingPortal ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("subscribe.openingPortal")}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {t("subscribe.managePayment")}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60 ms-auto" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tiers grid */}
      <div
        className="subscription-tiers-container px-4"
        data-ocid="subscribe.tiers"
      >
        {TIERS.map((tier) => {
          const isCurrent = currentTier === tier.id;
          const isActive = subscription?.status === "active";
          const features = isRTL ? tier.featuresAr : tier.features;
          const displayPrice =
            billing === "annual" ? tier.annualPrice : tier.monthlyPrice;
          const savePercent =
            tier.monthlyPrice > 0
              ? Math.round((1 - tier.annualPrice / tier.monthlyPrice) * 100)
              : 0;

          return (
            <div
              key={tier.id}
              data-ocid={`subscribe.tier.${tier.id}`}
              className={`subscription-tier-card ${tier.featured ? "featured" : ""}`}
            >
              {tier.featured && (
                <span className="subscription-tier-badge">
                  {t("subscribe.featured")}
                </span>
              )}

              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="subscription-tier-name">
                    {t(`subscribe.${tier.id}.name` as Parameters<typeof t>[0])}
                  </h2>
                  {isCurrent && isActive && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-primary/15 text-primary border-primary/20"
                      data-ocid={`subscribe.current_badge.${tier.id}`}
                    >
                      {t("subscribe.currentPlan")}
                    </Badge>
                  )}
                </div>

                {tier.monthlyPrice === 0 ? (
                  <div className="flex items-baseline gap-0.5">
                    <span className="subscription-tier-price">
                      {isRTL ? "مجاني" : "Free"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="subscription-tier-price">
                        ${displayPrice.toFixed(2)}
                      </span>
                      <span className="subscription-tier-price-period">
                        {isRTL ? "/شهر" : "/mo"}
                      </span>
                      {billing === "annual" && savePercent > 0 && (
                        <span className="text-xs text-emerald-400 font-semibold ms-1">
                          {isRTL
                            ? `وفر ${savePercent}%`
                            : `Save ${savePercent}%`}
                        </span>
                      )}
                    </div>
                    {billing === "annual" && (
                      <p className="text-xs text-muted-foreground">
                        {isRTL
                          ? `يُدفع $${(displayPrice * 12).toFixed(2)} سنوياً`
                          : `$${(displayPrice * 12).toFixed(2)} billed annually`}
                      </p>
                    )}
                  </div>
                )}

                <p className="subscription-tier-description">
                  {t(`subscribe.${tier.id}.desc` as Parameters<typeof t>[0])}
                </p>
              </div>

              <ul className="subscription-tier-features">
                {features.map((feature) => (
                  <li key={feature} className="subscription-tier-feature">
                    <span className="subscription-tier-feature-check">
                      <Check className="h-3 w-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {tier.id === "free" ? (
                <button
                  type="button"
                  className="subscription-tier-cta subscription-tier-cta-secondary w-full"
                  disabled
                  data-ocid="subscribe.free_plan_button"
                >
                  {isRTL ? "مجاني دائماً" : "Always Free"}
                </button>
              ) : isCurrent && isActive ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                      disabled={canceling}
                      data-ocid={`subscribe.cancel_button.${tier.id}`}
                    >
                      {canceling ? (
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                      ) : (
                        <X className="h-4 w-4 me-2" />
                      )}
                      {t("subscribe.cancel")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    data-ocid="subscribe.cancel_dialog"
                    className="max-w-sm mx-4"
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("subscribe.cancelConfirmTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("subscribe.cancelConfirmDesc")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse sm:flex-row gap-2">
                      <AlertDialogCancel data-ocid="subscribe.cancel_abort_button">
                        {t("subscribe.cancelAbort")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => cancelSub()}
                        data-ocid="subscribe.cancel_confirm_button"
                      >
                        {t("subscribe.cancelConfirm")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <button
                  type="button"
                  className="subscription-tier-cta subscription-tier-cta-primary w-full flex items-center justify-center gap-2"
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={checkingOut}
                  data-ocid={`subscribe.upgrade_button.${tier.id}`}
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("subscribe.processing")}
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      {t("subscribe.upgrade")}{" "}
                      {t(
                        `subscribe.${tier.id}.name` as Parameters<typeof t>[0],
                      )}
                      {billing === "annual" && (
                        <span className="text-xs opacity-75 ms-1">
                          ({isRTL ? "سنوي" : "Annual"})
                        </span>
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stripe security notice */}
      <div className="flex items-center justify-center gap-2 mt-6 px-4 max-w-md mx-auto">
        <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-center text-xs text-muted-foreground">
          {isRTL
            ? "المدفوعات مؤمّنة عبر Stripe. يتم تشفير جميع البيانات."
            : "Payments secured by Stripe. All transactions are encrypted."}
        </p>
      </div>

      {/* Payment info notice */}
      <div className="max-w-md mx-auto px-4 mt-4 mb-4">
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
          <CreditCard className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-0.5">
              {isRTL ? "نظام الدفع" : "Payment System"}
            </p>
            <p>
              {isRTL
                ? "يتم معالجة جميع المدفوعات عبر Stripe. بعد تأكيد وصول المبلغ إلى حساب Stripe الخاص بالموقع، يتم تفعيل مميزات الاشتراك تلقائياً."
                : "All payments are processed by Stripe. Once payment is confirmed in the site's Stripe account, your subscription features are activated automatically."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
