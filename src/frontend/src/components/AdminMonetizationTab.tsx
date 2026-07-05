import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeDollarSign, BookOpen, CircleCheck as CheckCircle2, CreditCard, Crown, ExternalLink, Eye, EyeOff, LayoutGrid, Lock, LockOpen, PiggyBank, Plus, Save, Shield, TrendingUp, Unlink, Wifi, WifiOff, Circle as XCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { SiStripe } from "react-icons/si";
import { toast } from "sonner";
import type { ContentTier } from "../hooks/useContentGating";
import { useContentGatingAdmin } from "../hooks/useContentGating";
import { useActor } from "../lib/backend";

interface SubscriptionTier {
  id: string;
  name: string;
  nameAr: string;
  price: string;
  features: string[];
  featuresAr: string[];
  badge?: string;
}

const DEFAULT_TIERS: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    nameAr: "مجاني",
    price: "$0/mo",
    features: ["Search & Watch", "Watch History", "Basic Quality"],
    featuresAr: ["بحث ومشاهدة", "سجل المشاهدة", "جودة أساسية"],
  },
  {
    id: "plus",
    name: "Plus",
    nameAr: "بلس",
    price: "$4.99/mo",
    features: ["All Free features", "HD Quality", "No Ads", "Download videos"],
    featuresAr: [
      "كل مميزات المجاني",
      "جودة عالية",
      "بدون إعلانات",
      "تحميل الفيديوهات",
    ],
    badge: "Popular",
  },
  {
    id: "pro",
    name: "Pro",
    nameAr: "برو",
    price: "$9.99/mo",
    features: [
      "All Plus features",
      "4K Quality",
      "Early Access",
      "Priority Support",
    ],
    featuresAr: ["كل مميزات بلس", "جودة 4K", "وصول مبكر", "دعم أولوية"],
  },
];

interface AdSlot {
  placement: string;
  cpm: string;
}

const DEFAULT_AD_SLOTS: AdSlot[] = [
  { placement: "Homepage Banner", cpm: "2.50" },
  { placement: "Video Pre-roll", cpm: "5.00" },
  { placement: "Search Results", cpm: "1.80" },
];

function TierRow({
  tier,
  isRTL,
  idx,
}: {
  tier: SubscriptionTier;
  isRTL: boolean;
  idx: number;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border"
      data-ocid={`admin.monetization.tier.${idx + 1}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-foreground text-sm">
            {isRTL ? tier.nameAr : tier.name}
          </span>
          {tier.badge && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs py-0">
              {isRTL ? "الأشهر" : tier.badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {(isRTL ? tier.featuresAr : tier.features).join(" · ")}
        </p>
      </div>
      <span className="font-mono text-sm font-bold text-primary shrink-0">
        {tier.price}
      </span>
    </div>
  );
}

/** Determine mode from key prefix */
function detectMode(key: string): "test" | "live" | null {
  if (key.startsWith("pk_test_") || key.startsWith("sk_test_")) return "test";
  if (key.startsWith("pk_live_") || key.startsWith("sk_live_")) return "live";
  return null;
}

function validatePublishableKey(key: string) {
  return key.startsWith("pk_test_") || key.startsWith("pk_live_");
}

function validateSecretKey(key: string) {
  return key.startsWith("sk_test_") || key.startsWith("sk_live_");
}

/** Stripe Config Card */
function StripeConfigCard({ isRTL }: { isRTL: boolean }) {
  const { actor } = useActor();
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [pricePlus, setPricePlus] = useState("");
  const [pricePlusAnnual, setPricePlusAnnual] = useState("");
  const [pricePro, setPricePro] = useState("");
  const [priceProAnnual, setPriceProAnnual] = useState("");
  const [showSecKey, setShowSecKey] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  // Load persisted keys on mount
  useEffect(() => {
    const savedPub = localStorage.getItem("stripePublishableKey") ?? "";
    const savedSec = localStorage.getItem("stripeSecretKey") ?? "";
    const savedWh = localStorage.getItem("stripeWebhookSecret") ?? "";
    const savedPlus = localStorage.getItem("stripePricePlus") ?? "";
    const savedPlusAnnual = localStorage.getItem("stripePricePlusAnnual") ?? "";
    const savedPro = localStorage.getItem("stripePricePro") ?? "";
    const savedProAnnual = localStorage.getItem("stripePriceProAnnual") ?? "";
    setPubKey(savedPub);
    setSecKey(savedSec);
    setWebhookSecret(savedWh);
    setPricePlus(savedPlus);
    setPricePlusAnnual(savedPlusAnnual);
    setPricePro(savedPro);
    setPriceProAnnual(savedProAnnual);
    if (validatePublishableKey(savedPub) && validateSecretKey(savedSec)) {
      setConnected(true);
    }
  }, []);

  const detectedMode = detectMode(pubKey) ?? detectMode(secKey) ?? null;

  async function handleConnect() {
    if (!validatePublishableKey(pubKey)) {
      toast.error(
        isRTL
          ? "مفتاح النشر غير صالح (يجب أن يبدأ بـ pk_test_ أو pk_live_)"
          : "Invalid publishable key (must start with pk_test_ or pk_live_)",
      );
      return;
    }
    if (!validateSecretKey(secKey)) {
      toast.error(
        isRTL
          ? "المفتاح السري غير صالح (يجب أن يبدأ بـ sk_test_ أو sk_live_)"
          : "Invalid secret key (must start with sk_test_ or sk_live_)",
      );
      return;
    }
    setConnecting(true);
    let backendSaved = false;
    try {
      // Persist keys to backend (actor) so they are stored securely
      if (actor) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actorAny = actor as any;
        if (typeof actorAny.setStripeKeys === "function") {
          try {
            await actorAny.setStripeKeys(secKey, webhookSecret || "");
            backendSaved = true;
          } catch (e) {
            console.error("[Admin/Stripe] setStripeKeys failed", e);
            toast.warning(
              isRTL
                ? "تعذر حفظ المفاتيح في الباكند — سيتم حفظها محلياً فقط"
                : "Backend save failed — keys saved locally only",
            );
          }
        } else {
          console.warn("[Admin/Stripe] setStripeKeys not available on actor — saving locally only");
        }
      } else {
        console.warn("[Admin/Stripe] actor not connected — saving keys locally only");
      }
    } catch (e) {
      console.error("[Admin/Stripe] handleConnect: unexpected error", e);
    }
    // Persist to localStorage as a client-side cache
    localStorage.setItem("stripePublishableKey", pubKey);
    localStorage.setItem("stripeSecretKey", secKey);
    if (webhookSecret) {
      localStorage.setItem("stripeWebhookSecret", webhookSecret);
    }
    if (pricePlus) localStorage.setItem("stripePricePlus", pricePlus);
    if (pricePlusAnnual)
      localStorage.setItem("stripePricePlusAnnual", pricePlusAnnual);
    if (pricePro) localStorage.setItem("stripePricePro", pricePro);
    if (priceProAnnual)
      localStorage.setItem("stripePriceProAnnual", priceProAnnual);
    setConnected(true);
    setConnecting(false);
    console.log("[Admin/Stripe] handleConnect complete", { backendSaved, mode: detectedMode });
    toast.success(
      isRTL
        ? `تم ربط Stripe (${detectedMode === "live" ? "البث المباشر" : "وضع الاختبار"})${backendSaved ? "" : " — محلي فقط"}`
        : `Stripe connected (${detectedMode === "live" ? "Live Mode" : "Test Mode"})${backendSaved ? "" : " — local only"}`,
    );
  }

  function handleDisconnect() {
    localStorage.removeItem("stripePublishableKey");
    localStorage.removeItem("stripeSecretKey");
    localStorage.removeItem("stripeWebhookSecret");
    localStorage.removeItem("stripePricePlus");
    localStorage.removeItem("stripePricePlusAnnual");
    localStorage.removeItem("stripePricePro");
    localStorage.removeItem("stripePriceProAnnual");
    setPubKey("");
    setSecKey("");
    setWebhookSecret("");
    setPricePlus("");
    setPricePlusAnnual("");
    setPricePro("");
    setPriceProAnnual("");
    setConnected(false);
    toast.info(isRTL ? "تم قطع الاتصال بـ Stripe" : "Stripe disconnected");
  }

  function handleSavePriceIds() {
    localStorage.setItem("stripePricePlus", pricePlus.trim());
    localStorage.setItem("stripePricePlusAnnual", pricePlusAnnual.trim());
    localStorage.setItem("stripePricePro", pricePro.trim());
    localStorage.setItem("stripePriceProAnnual", priceProAnnual.trim());
    toast.success(isRTL ? "تم حفظ معرّفات الأسعار" : "Price IDs saved");
  }

  return (
    <Card
      className="bg-card border-border overflow-hidden"
      data-ocid="admin.stripe.panel"
    >
      {/* Header band */}
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-muted/60 to-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SiStripe className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold text-foreground text-sm">
            {isRTL ? "إعدادات Stripe" : "Stripe Settings"}
          </span>
        </div>
        {/* Connection badge */}
        {connected ? (
          <Badge
            className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 text-xs"
            data-ocid="admin.stripe.connected_badge"
          >
            <CheckCircle2 className="w-3 h-3" />
            {isRTL
              ? detectedMode === "live"
                ? "متصل · بث مباشر"
                : "متصل · اختبار"
              : detectedMode === "live"
                ? "Connected · Live"
                : "Connected · Test"}
          </Badge>
        ) : (
          <Badge
            className="bg-muted/50 text-muted-foreground border-border gap-1 text-xs"
            data-ocid="admin.stripe.disconnected_badge"
          >
            <XCircle className="w-3 h-3" />
            {isRTL ? "غير مهيأ" : "Not Configured"}
          </Badge>
        )}
      </div>

      <CardContent className="pt-5 space-y-5">
        {/* Mode indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              detectedMode === "live"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : detectedMode === "test"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-muted/30 border-border text-muted-foreground"
            }`}
            data-ocid="admin.stripe.mode_indicator"
          >
            {detectedMode === "live" ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            {detectedMode === "live"
              ? isRTL
                ? "وضع البث المباشر"
                : "Live Mode"
              : detectedMode === "test"
                ? isRTL
                  ? "وضع الاختبار"
                  : "Test Mode"
                : isRTL
                  ? "لم يتم الكشف عن الوضع"
                  : "Mode not detected"}
          </div>
          <span className="text-xs text-muted-foreground">
            {isRTL
              ? "يُكتشف تلقائياً من بادئة المفتاح"
              : "Auto-detected from key prefix"}
          </span>
        </div>

        {/* Publishable Key */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {isRTL ? "مفتاح النشر (Publishable Key)" : "Publishable Key"}
          </Label>
          <Input
            type="text"
            placeholder="pk_test_..."
            value={pubKey}
            onChange={(e) => {
              setPubKey(e.target.value);
              setConnected(false);
            }}
            className="bg-muted/30 border-input font-mono text-xs h-10"
            disabled={connected}
            data-ocid="admin.stripe.publishable_key_input"
          />
          {pubKey && !validatePublishableKey(pubKey) && (
            <p
              className="text-xs text-destructive flex items-center gap-1"
              data-ocid="admin.stripe.pub_key_error"
            >
              <XCircle className="w-3 h-3" />
              {isRTL
                ? "يجب أن يبدأ بـ pk_test_ أو pk_live_"
                : "Must start with pk_test_ or pk_live_"}
            </p>
          )}
        </div>

        {/* Secret Key */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {isRTL ? "المفتاح السري (Secret Key)" : "Secret Key"}
          </Label>
          <div className="relative">
            <Input
              type={showSecKey ? "text" : "password"}
              placeholder="sk_test_..."
              value={secKey}
              onChange={(e) => {
                setSecKey(e.target.value);
                setConnected(false);
              }}
              className="bg-muted/30 border-input font-mono text-xs h-10 pe-10"
              disabled={connected}
              data-ocid="admin.stripe.secret_key_input"
            />
            <button
              type="button"
              onClick={() => setShowSecKey((v) => !v)}
              className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showSecKey ? "Hide key" : "Show key"}
              data-ocid="admin.stripe.toggle_secret_visibility"
            >
              {showSecKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {secKey && !validateSecretKey(secKey) && (
            <p
              className="text-xs text-destructive flex items-center gap-1"
              data-ocid="admin.stripe.sec_key_error"
            >
              <XCircle className="w-3 h-3" />
              {isRTL
                ? "يجب أن يبدأ بـ sk_test_ أو sk_live_"
                : "Must start with sk_test_ or sk_live_"}
            </p>
          )}
        </div>

        {/* Webhook Secret */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {isRTL ? "مفتاح Webhook (اختياري)" : "Webhook Secret (optional)"}
          </Label>
          <div className="relative">
            <Input
              type={showWebhook ? "text" : "password"}
              placeholder="whsec_..."
              value={webhookSecret}
              onChange={(e) => {
                setWebhookSecret(e.target.value);
              }}
              className="bg-muted/30 border-input font-mono text-xs h-10 pe-10"
              disabled={connected}
              data-ocid="admin.stripe.webhook_secret_input"
            />
            <button
              type="button"
              onClick={() => setShowWebhook((v) => !v)}
              className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showWebhook ? "Hide webhook" : "Show webhook"}
              data-ocid="admin.stripe.toggle_webhook_visibility"
            >
              {showWebhook ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* ── Payment Configuration Guide ── */}
        <div
          className="space-y-3 pt-1 border-t border-border"
          data-ocid="admin.stripe.payment_guide"
        >
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            {isRTL ? "دليل إعداد Stripe" : "Stripe Setup Guide"}
          </p>

          {/* Step 1 */}
          <div className="rounded-lg bg-muted/20 border border-border p-3 space-y-1.5">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              {isRTL ? "إنشاء حساب Stripe" : "Create a Stripe Account"}
            </p>
            <p className="text-xs text-muted-foreground ps-6 leading-relaxed">
              {isRTL
                ? "اذهب إلى dashboard.stripe.com ، سجّل بياناتك الشخصية والبنكية. سيتم تحويل المدفوعات مباشرةً إلى حسابك البنكي."
                : "Go to dashboard.stripe.com, register, and link your bank account. Payments will be deposited directly to your bank."}
            </p>
            <a
              href="https://dashboard.stripe.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline ps-6"
            >
              dashboard.stripe.com
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg bg-muted/20 border border-border p-3 space-y-1.5">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              {isRTL ? "نسخ المفاتيح" : "Copy API Keys"}
            </p>
            <p className="text-xs text-muted-foreground ps-6 leading-relaxed">
              {isRTL
                ? "من لوحة Stripe: Developers → API Keys. انسخ Publishable Key (pk_...) وSecret Key (sk_...) وأدخلهما أعلاه."
                : "From Stripe: Developers → API Keys. Copy the Publishable Key (pk_...) and Secret Key (sk_...) and paste above."}
            </p>
          </div>

          {/* Step 3: Webhook URL */}
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              {isRTL
                ? "إعداد Webhook في Stripe"
                : "Configure Webhook in Stripe"}
            </p>
            <p className="text-xs text-muted-foreground ps-6 leading-relaxed">
              {isRTL
                ? "من لوحة Stripe: Developers → Webhooks → Add endpoint. أضف الرابط التالي:"
                : "From Stripe: Developers → Webhooks → Add endpoint. Use this URL:"}
            </p>
            <div className="ms-6 rounded-md bg-background border border-border px-3 py-2 flex items-center justify-between gap-2">
              <code className="text-xs text-primary font-mono break-all">
                {`${window.location.origin}/api/stripe-webhook`}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/api/stripe-webhook`,
                  );
                }}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                aria-label="Copy webhook URL"
              >
                {isRTL ? "نسخ" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground ps-6">
              {isRTL
                ? "من أحداث Stripe اختر: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"
                : "Events to listen: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"}
            </p>
          </div>

          {/* Step 4: Bank account */}
          <div className="rounded-lg bg-muted/20 border border-border p-3 space-y-1.5">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                4
              </span>
              {isRTL ? "ربط الحساب البنكي" : "Link Your Bank Account"}
            </p>
            <p className="text-xs text-muted-foreground ps-6 leading-relaxed">
              {isRTL
                ? "في Stripe: Settings → Payouts. أضف حسابك البنكي (IBAN أو رقم الحساب). سيتم تحويل المدفوعات تلقائياً بعد كل دفعة."
                : "In Stripe: Settings → Payouts. Add your bank account (IBAN or account number). Payments are auto-transferred after each transaction."}
            </p>
          </div>
        </div>

        {/* ── Stripe Price IDs (monthly + annual) ── */}
        <div className="space-y-3 pt-1 border-t border-border">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            {isRTL ? "معرّفات الأسعار (Price IDs)" : "Stripe Price IDs"}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isRTL
              ? "أضف معرّف سعر كل باقة من لوحة Stripe → Products → تحديد المنتج → نسخ Price ID"
              : "Add each plan's price ID from Stripe Dashboard → Products → select product → copy Price ID"}
          </p>

          {/* Plus */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {isRTL ? "باقة Plus" : "Plus Plan"}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground/70">
                  {isRTL ? "شهري" : "Monthly"}
                </Label>
                <Input
                  type="text"
                  placeholder="price_..."
                  value={pricePlus}
                  onChange={(e) => setPricePlus(e.target.value)}
                  className="bg-muted/30 border-input font-mono text-xs h-9"
                  dir="ltr"
                  data-ocid="admin.stripe.price_plus_input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground/70">
                  {isRTL ? "سنوي" : "Annual"}
                </Label>
                <Input
                  type="text"
                  placeholder="price_..."
                  value={pricePlusAnnual}
                  onChange={(e) => setPricePlusAnnual(e.target.value)}
                  className="bg-muted/30 border-input font-mono text-xs h-9"
                  dir="ltr"
                  data-ocid="admin.stripe.price_plus_annual_input"
                />
              </div>
            </div>
          </div>

          {/* Pro */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {isRTL ? "باقة Pro" : "Pro Plan"}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground/70">
                  {isRTL ? "شهري" : "Monthly"}
                </Label>
                <Input
                  type="text"
                  placeholder="price_..."
                  value={pricePro}
                  onChange={(e) => setPricePro(e.target.value)}
                  className="bg-muted/30 border-input font-mono text-xs h-9"
                  dir="ltr"
                  data-ocid="admin.stripe.price_pro_input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground/70">
                  {isRTL ? "سنوي" : "Annual"}
                </Label>
                <Input
                  type="text"
                  placeholder="price_..."
                  value={priceProAnnual}
                  onChange={(e) => setPriceProAnnual(e.target.value)}
                  className="bg-muted/30 border-input font-mono text-xs h-9"
                  dir="ltr"
                  data-ocid="admin.stripe.price_pro_annual_input"
                />
              </div>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full border-primary/40 text-primary hover:bg-primary/10"
            onClick={handleSavePriceIds}
            disabled={!pricePlus.trim() && !pricePro.trim()}
            data-ocid="admin.stripe.save_price_ids_button"
          >
            <Save className="w-3.5 h-3.5 me-1.5" />
            {isRTL ? "حفظ معرّفات الأسعار" : "Save Price IDs"}
          </Button>
        </div>

        {/* Security note */}
        <p className="text-xs text-muted-foreground bg-muted/20 border border-border rounded-lg px-3 py-2 leading-relaxed">
          🔒{" "}
          {isRTL
            ? "يتم تخزين المفاتيح محلياً على هذا الجهاز فقط. لا يتم إرسالها إلى أي خادم خارجي."
            : "Keys are stored locally on this device only. They are not sent to any external server."}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          {connected ? (
            <Button
              variant="outline"
              className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={handleDisconnect}
              data-ocid="admin.stripe.disconnect_button"
            >
              <Unlink className="w-3.5 h-3.5 me-1.5" />
              {isRTL ? "قطع الاتصال" : "Disconnect Stripe"}
            </Button>
          ) : (
            <Button
              className="flex-1 gradient-primary text-white border-0 font-semibold"
              onClick={() => void handleConnect()}
              disabled={connecting || !pubKey || !secKey}
              data-ocid="admin.stripe.connect_button"
            >
              {connecting ? (
                <>
                  <span className="w-3.5 h-3.5 me-1.5 animate-spin rounded-full border-2 border-white/30 border-t-white inline-block" />
                  {isRTL ? "جارٍ الاتصال..." : "Connecting..."}
                </>
              ) : (
                <>
                  <SiStripe className="w-3.5 h-3.5 me-1.5" />
                  {isRTL ? "ربط Stripe" : "Connect Stripe"}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Revenue Dashboard card */
function RevenueDashboardCard({ isRTL }: { isRTL: boolean }) {
  // Read subscription stats from localStorage (written by useSubscription hook)
  const subRaw = localStorage.getItem("streamverse_subscription");
  let subData: { tier: string; status: string } | null = null;
  try {
    subData = subRaw ? (JSON.parse(subRaw) as { tier: string; status: string }) : null;
  } catch (e) {
    console.warn("[Admin/Revenue] streamverse_subscription parse failed", e);
  }
  const activeSubs = subData?.status === "active" ? 1 : 0;
  const tierPrices: Record<string, number> = { free: 0, plus: 4.99, pro: 9.99 };
  const monthlyRev =
    activeSubs > 0 && subData ? (tierPrices[subData.tier] ?? 0) : 0;

  const stats = [
    {
      label: isRTL ? "إجمالي الإيرادات" : "Total Revenue",
      value: `$${monthlyRev.toFixed(2)}`,
      icon: BadgeDollarSign,
      color: "text-emerald-400",
    },
    {
      label: isRTL ? "الاشتراكات النشطة" : "Active Subscriptions",
      value: String(activeSubs),
      icon: CreditCard,
      color: "text-primary",
    },
    {
      label: isRTL ? "إيرادات الشهر" : "Monthly Revenue",
      value: `$${monthlyRev.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-amber-400",
    },
  ];

  return (
    <Card className="bg-card border-border" data-ocid="admin.revenue.panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          {isRTL ? "لوحة الإيرادات" : "Revenue Dashboard"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="rounded-xl bg-muted/20 border border-border p-3 text-center"
              data-ocid={`admin.revenue.stat.${idx + 1}`}
            >
              <stat.icon className={`w-5 h-5 mx-auto mb-1.5 ${stat.color}`} />
              <p className="font-mono font-bold text-foreground text-lg leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="relative rounded-xl border border-dashed border-border bg-muted/10 h-36 overflow-hidden">
          {/* Fake chart bars for aesthetics */}
          <div className="absolute inset-0 flex items-end gap-1 px-4 pb-4 opacity-10">
            {[
              { id: "jan", h: 30 },
              { id: "feb", h: 45 },
              { id: "mar", h: 20 },
              { id: "apr", h: 55 },
              { id: "may", h: 35 },
              { id: "jun", h: 60 },
              { id: "jul", h: 40 },
              { id: "aug", h: 70 },
              { id: "sep", h: 50 },
              { id: "oct", h: 65 },
              { id: "nov", h: 45 },
              { id: "dec", h: 80 },
            ].map((bar) => (
              <div
                key={bar.id}
                className="flex-1 bg-primary rounded-t"
                style={{ height: `${bar.h}%` }}
              />
            ))}
          </div>
          {/* Coming soon overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-[1px]">
            <TrendingUp className="w-7 h-7 text-muted-foreground/40" />
            <p className="font-display font-semibold text-foreground text-sm">
              {isRTL ? "قريباً" : "Coming Soon"}
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-[18rem] px-4">
              {isRTL
                ? "سيتوفر تقرير الإيرادات بعد ربط Stripe وتفعيل الاشتراكات."
                : "Revenue chart will be available once Stripe is connected and subscriptions are active."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Content Gating Card ──────────────────────────────────────────────────────

const TIER_ICONS: Record<ContentTier, React.ReactNode> = {
  free: <Shield className="w-3.5 h-3.5" />,
  plus: <Zap className="w-3.5 h-3.5" />,
  pro: <Crown className="w-3.5 h-3.5" />,
};

const TIER_LABELS_EN: Record<ContentTier, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
};
const TIER_LABELS_AR: Record<ContentTier, string> = {
  free: "مجاني",
  plus: "بلس",
  pro: "برو",
};

interface AddPremiumVideoForm {
  videoId: string;
  tier: ContentTier;
}

function ContentGatingCard({ isRTL }: { isRTL: boolean }) {
  const {
    settings,
    premiumVideos,
    updateSettings,
    setPremiumVideo,
    removePremiumVideo,
  } = useContentGatingAdmin();

  const [addForm, setAddForm] = useState<AddPremiumVideoForm>({
    videoId: "",
    tier: "plus",
  });
  const [adding, setAdding] = useState(false);

  function handleToggleGating() {
    updateSettings({ enabled: !settings.enabled });
    toast.success(
      !settings.enabled
        ? isRTL
          ? "تم تفعيل قفل المحتوى"
          : "Content gating enabled"
        : isRTL
          ? "تم تعطيل قفل المحتوى"
          : "Content gating disabled",
    );
  }

  function handleAddPremiumVideo() {
    if (!addForm.videoId.trim()) {
      toast.error(isRTL ? "أدخل معرّف الفيديو" : "Enter a video ID");
      return;
    }
    setAdding(true);
    setPremiumVideo(addForm.videoId.trim(), true, addForm.tier);
    setAddForm({ videoId: "", tier: "plus" });
    setAdding(false);
    toast.success(isRTL ? "تمت إضافة الفيديو المميز" : "Premium video added");
  }

  const premiumList = Object.values(premiumVideos);

  return (
    <Card
      className="bg-card border-border"
      data-ocid="admin.content_gating.panel"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            {isRTL ? "قفل المحتوى" : "Content Gating"}
          </CardTitle>
          {/* Master toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={settings.enabled}
            onClick={handleToggleGating}
            className={`relative w-12 h-6 rounded-full border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring outline-none ${
              settings.enabled
                ? "bg-primary border-primary"
                : "bg-muted border-border"
            }`}
            data-ocid="admin.content_gating.master_toggle"
          >
            <span
              className={`absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-all duration-200 ${
                settings.enabled
                  ? "translate-x-6 rtl:-translate-x-6"
                  : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Status hint */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
            settings.enabled
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-muted/30 border-border text-muted-foreground"
          }`}
          data-ocid="admin.content_gating.status"
        >
          {settings.enabled ? (
            <Lock className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <LockOpen className="w-3.5 h-3.5 shrink-0" />
          )}
          {settings.enabled
            ? isRTL
              ? "قفل المحتوى مفعّل — المقاطع المميزة محمية بالاشتراك."
              : "Content gating is ON — premium videos are subscription-locked."
            : isRTL
              ? "قفل المحتوى معطّل — جميع المقاطع متاحة للجميع."
              : "Content gating is OFF — all videos are accessible to everyone."}
        </div>

        {/* Free videos per day */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {isRTL
              ? "عدد الفيديوهات المجانية يومياً للمستخدمين غير المشتركين"
              : "Free videos per day for non-subscribers"}
          </Label>
          <input
            type="number"
            min={0}
            max={100}
            value={settings.defaultFreeVideosPerDay}
            onChange={(e) =>
              updateSettings({
                defaultFreeVideosPerDay: Math.max(
                  0,
                  Number.parseInt(e.target.value) || 0,
                ),
              })
            }
            className="w-24 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-ocid="admin.content_gating.free_per_day_input"
          />
        </div>

        {/* Add premium video */}
        <div className="space-y-2 pt-1 border-t border-border">
          <Label className="text-sm font-medium text-foreground">
            {isRTL ? "إضافة فيديو مميز (مقفل)" : "Add premium (gated) video"}
          </Label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={isRTL ? "معرّف الفيديو..." : "Video ID..."}
              value={addForm.videoId}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, videoId: e.target.value }))
              }
              className="flex-1 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              data-ocid="admin.content_gating.video_id_input"
            />
            <select
              value={addForm.tier}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  tier: e.target.value as ContentTier,
                }))
              }
              className="rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="admin.content_gating.tier_select"
            >
              <option value="plus">{isRTL ? "بلس" : "Plus"}</option>
              <option value="pro">{isRTL ? "برو" : "Pro"}</option>
            </select>
            <Button
              size="sm"
              className="h-9 gradient-primary text-white border-0 shrink-0"
              onClick={handleAddPremiumVideo}
              disabled={adding || !addForm.videoId.trim()}
              data-ocid="admin.content_gating.add_video_button"
            >
              <Plus className="w-3.5 h-3.5 me-1" />
              {isRTL ? "إضافة" : "Add"}
            </Button>
          </div>
        </div>

        {/* Premium video list */}
        {premiumList.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              {isRTL
                ? `الفيديوهات المميزة (${premiumList.length})`
                : `Premium Videos (${premiumList.length})`}
            </p>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {premiumList.map((v, idx) => (
                <div
                  key={v.videoId}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border text-sm"
                  data-ocid={`admin.content_gating.video_item.${idx + 1}`}
                >
                  <code className="flex-1 font-mono text-xs text-foreground truncate">
                    {v.videoId}
                  </code>
                  <Badge
                    className={`gap-1 text-xs shrink-0 ${
                      v.requiredTier === "pro"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-primary/10 text-primary border-primary/30"
                    }`}
                  >
                    {TIER_ICONS[v.requiredTier]}
                    {isRTL
                      ? TIER_LABELS_AR[v.requiredTier]
                      : TIER_LABELS_EN[v.requiredTier]}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => {
                      removePremiumVideo(v.videoId);
                      toast.success(
                        isRTL
                          ? "تم إزالة الفيديو المميز"
                          : "Premium video removed",
                      );
                    }}
                    className="text-destructive hover:text-destructive/80 transition-colors text-xs font-medium shrink-0"
                    aria-label={isRTL ? "إزالة" : "Remove"}
                    data-ocid={`admin.content_gating.remove_video_button.${idx + 1}`}
                  >
                    {isRTL ? "إزالة" : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {premiumList.length === 0 && (
          <div
            className="text-center py-6 text-muted-foreground text-xs"
            data-ocid="admin.content_gating.empty_state"
          >
            <LockOpen className="w-7 h-7 mx-auto mb-2 opacity-30" />
            {isRTL
              ? "لا توجد فيديوهات مميزة بعد. أضف معرّف فيديو أعلاه."
              : "No premium videos yet. Add a video ID above."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AdminMonetizationTab({ isRTL }: { isRTL: boolean }) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>(DEFAULT_TIERS);
  const [adSlots, setAdSlots] = useState<AdSlot[]>(DEFAULT_AD_SLOTS);
  const [showAddTier, setShowAddTier] = useState(false);
  const [savingAds, setSavingAds] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);

  // Add tier form state
  const [newTierName, setNewTierName] = useState("");
  const [newTierNameAr, setNewTierNameAr] = useState("");
  const [newTierPrice, setNewTierPrice] = useState("");
  const [newTierFeatures, setNewTierFeatures] = useState("");

  // Payout form
  const [payoutEmail, setPayoutEmail] = useState("");
  const [payoutBank, setPayoutBank] = useState("");
  const [payoutMin, setPayoutMin] = useState("50");

  function handleAddTier() {
    if (!newTierName.trim() || !newTierPrice.trim()) {
      toast.error(
        isRTL ? "أدخل اسم الباقة والسعر" : "Enter tier name and price",
      );
      return;
    }
    const tier: SubscriptionTier = {
      id: `custom_${Date.now()}`,
      name: newTierName.trim(),
      nameAr: newTierNameAr.trim() || newTierName.trim(),
      price: newTierPrice.trim(),
      features: newTierFeatures
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      featuresAr: newTierFeatures
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    };
    setTiers((prev) => [...prev, tier]);
    setNewTierName("");
    setNewTierNameAr("");
    setNewTierPrice("");
    setNewTierFeatures("");
    setShowAddTier(false);
    toast.success(isRTL ? "تمت إضافة الباقة" : "Tier added");
  }

  async function handleSaveAds() {
    if (!adSlots.length) {
      toast.error(isRTL ? "لا توجد مواضع إعلانات" : "No ad slots to save");
      return;
    }
    setSavingAds(true);
    try {
      localStorage.setItem(
        "streamverse_ad_slots",
        JSON.stringify(adSlots),
      );
      console.log("[Admin/Ads] ad slots saved locally", adSlots.length, "slots");
      toast.success(
        isRTL ? "تم حفظ إعدادات الإعلانات" : "Ad settings saved",
      );
    } catch (e) {
      console.error("[Admin/Ads] handleSaveAds failed", e);
      toast.error(
        isRTL
          ? "فشل حفظ إعدادات الإعلانات"
          : "Failed to save ad settings",
      );
    } finally {
      setSavingAds(false);
    }
  }

  async function handleSavePayout() {
    if (!payoutEmail.trim() && !payoutBank.trim()) {
      toast.error(
        isRTL
          ? "أدخل بريد PayPal أو رقم IBAN"
          : "Enter PayPal email or IBAN",
      );
      return;
    }
    setSavingPayout(true);
    try {
      localStorage.setItem(
        "streamverse_payout_settings",
        JSON.stringify({
          email: payoutEmail.trim(),
          bank: payoutBank.trim(),
          min: payoutMin.trim(),
        }),
      );
      console.log("[Admin/Payout] payout settings saved locally");
      toast.success(
        isRTL ? "تم حفظ إعدادات الدفع" : "Payout settings saved",
      );
    } catch (e) {
      console.error("[Admin/Payout] handleSavePayout failed", e);
      toast.error(
        isRTL
          ? "فشل حفظ إعدادات الدفع"
          : "Failed to save payout settings",
      );
    } finally {
      setSavingPayout(false);
    }
  }

  return (
    <div className="space-y-6" data-ocid="admin.monetization.panel">
      {/* 0. Stripe Config — placed first, most prominent */}
      <StripeConfigCard isRTL={isRTL} />

      {/* 1. Content Gating */}
      <ContentGatingCard isRTL={isRTL} />

      {/* 2. Revenue Dashboard */}
      <RevenueDashboardCard isRTL={isRTL} />

      {/* 2. Subscription Tiers */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <BadgeDollarSign className="w-4 h-4 text-primary" />
              {isRTL ? "باقات الاشتراك" : "Subscription Tiers"}
            </CardTitle>
            <Button
              size="sm"
              className="h-8 text-xs gradient-primary text-white border-0"
              onClick={() => setShowAddTier(true)}
              data-ocid="admin.monetization.add_tier_button"
            >
              <Plus className="w-3.5 h-3.5 me-1" />
              {isRTL ? "إضافة باقة" : "Add Tier"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {tiers.map((tier, idx) => (
            <TierRow key={tier.id} tier={tier} isRTL={isRTL} idx={idx} />
          ))}
        </CardContent>
      </Card>

      {/* 3. Ad Slots */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-violet-400" />
            {isRTL ? "مواضع الإعلانات" : "Ad Slots"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {adSlots.map((slot, idx) => (
            <div
              key={slot.placement}
              className="flex items-center gap-3"
              data-ocid={`admin.monetization.ad_slot.${idx + 1}`}
            >
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">
                  {slot.placement}
                </Label>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">CPM $</span>
                <Input
                  type="number"
                  step="0.01"
                  value={slot.cpm}
                  onChange={(e) =>
                    setAdSlots((prev) =>
                      prev.map((s, i) =>
                        i === idx ? { ...s, cpm: e.target.value } : s,
                      ),
                    )
                  }
                  className="w-20 h-8 text-xs bg-muted/30 border-input"
                  data-ocid={`admin.monetization.ad_cpm_input.${idx + 1}`}
                />
              </div>
            </div>
          ))}
          <Button
            size="sm"
            className="w-full mt-2 gradient-primary text-white border-0"
            onClick={() => void handleSaveAds()}
            disabled={savingAds}
            data-ocid="admin.monetization.save_ads_button"
          >
            <Save className="w-3.5 h-3.5 me-1.5" />
            {savingAds
              ? isRTL
                ? "جارٍ الحفظ..."
                : "Saving..."
              : isRTL
                ? "حفظ الإعدادات"
                : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* 4. Payout Settings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-amber-400" />
            {isRTL ? "إعدادات الدفع" : "Payout Settings"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {isRTL
                ? "البريد الإلكتروني للدفع (PayPal)"
                : "Payout Email (PayPal)"}
            </Label>
            <Input
              type="email"
              placeholder="example@paypal.com"
              value={payoutEmail}
              onChange={(e) => setPayoutEmail(e.target.value)}
              className="bg-muted/30 border-input"
              data-ocid="admin.monetization.payout_email_input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {isRTL ? "رقم الحساب البنكي (IBAN)" : "Bank Account (IBAN)"}
            </Label>
            <Input
              type="text"
              placeholder="SA... / AE... / EG..."
              value={payoutBank}
              onChange={(e) => setPayoutBank(e.target.value)}
              className="bg-muted/30 border-input font-mono"
              data-ocid="admin.monetization.payout_bank_input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {isRTL ? "الحد الأدنى للصرف ($)" : "Minimum Payout Threshold ($)"}
            </Label>
            <Input
              type="number"
              min="1"
              value={payoutMin}
              onChange={(e) => setPayoutMin(e.target.value)}
              className="bg-muted/30 border-input"
              data-ocid="admin.monetization.payout_min_input"
            />
          </div>
          <Button
            className="w-full gradient-primary text-white border-0"
            onClick={() => void handleSavePayout()}
            disabled={savingPayout}
            data-ocid="admin.monetization.save_payout_button"
          >
            <Save className="w-3.5 h-3.5 me-1.5" />
            {savingPayout
              ? isRTL
                ? "جارٍ الحفظ..."
                : "Saving..."
              : isRTL
                ? "حفظ إعدادات الدفع"
                : "Save Payout Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Add Tier Dialog */}
      <Dialog open={showAddTier} onOpenChange={setShowAddTier}>
        <DialogContent data-ocid="admin.monetization.add_tier_dialog">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "إضافة باقة اشتراك جديدة" : "Add Subscription Tier"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">
                  {isRTL ? "الاسم (EN)" : "Name (EN)"}
                </Label>
                <Input
                  placeholder="Pro Max"
                  value={newTierName}
                  onChange={(e) => setNewTierName(e.target.value)}
                  className="bg-muted/30 border-input"
                  data-ocid="admin.monetization.new_tier_name_input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  {isRTL ? "الاسم (AR)" : "Name (AR)"}
                </Label>
                <Input
                  placeholder="برو ماكس"
                  value={newTierNameAr}
                  onChange={(e) => setNewTierNameAr(e.target.value)}
                  className="bg-muted/30 border-input"
                  data-ocid="admin.monetization.new_tier_name_ar_input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{isRTL ? "السعر" : "Price"}</Label>
              <Input
                placeholder="$14.99/mo"
                value={newTierPrice}
                onChange={(e) => setNewTierPrice(e.target.value)}
                className="bg-muted/30 border-input"
                data-ocid="admin.monetization.new_tier_price_input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                {isRTL
                  ? "المميزات (مفصولة بفواصل)"
                  : "Features (comma-separated)"}
              </Label>
              <Input
                placeholder={
                  isRTL ? "مميزة 1, مميزة 2" : "Feature 1, Feature 2"
                }
                value={newTierFeatures}
                onChange={(e) => setNewTierFeatures(e.target.value)}
                className="bg-muted/30 border-input"
                data-ocid="admin.monetization.new_tier_features_input"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddTier(false)}
                data-ocid="admin.monetization.add_tier_cancel_button"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                className="flex-1 gradient-primary text-white border-0"
                onClick={handleAddTier}
                data-ocid="admin.monetization.add_tier_confirm_button"
              >
                {isRTL ? "إضافة" : "Add Tier"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
