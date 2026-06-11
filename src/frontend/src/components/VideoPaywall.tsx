import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Crown, Lock, Sparkles, Star, Zap } from "lucide-react";
import type { ContentTier } from "../hooks/useContentGating";
import { useTranslation } from "../lib/i18n";

// ─── Tier metadata ────────────────────────────────────────────────────────────

const TIER_META: Record<
  ContentTier,
  {
    icon: React.ReactNode;
    colorClass: string;
    labelEn: string;
    labelAr: string;
  }
> = {
  free: {
    icon: <Star className="w-4 h-4" />,
    colorClass: "text-muted-foreground",
    labelEn: "Free",
    labelAr: "مجاني",
  },
  plus: {
    icon: <Zap className="w-4 h-4" />,
    colorClass: "text-primary",
    labelEn: "Plus",
    labelAr: "بلس",
  },
  pro: {
    icon: <Crown className="w-4 h-4" />,
    colorClass: "text-amber-400",
    labelEn: "Pro",
    labelAr: "برو",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface VideoPaywallProps {
  requiredTier: ContentTier;
  /** Compact inline mode (e.g. inside a card thumbnail) */
  compact?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VideoPaywall({
  requiredTier,
  compact = false,
  className = "",
}: VideoPaywallProps) {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const meta = TIER_META[requiredTier];

  if (compact) {
    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-inherit ${className}`}
        data-ocid="paywall.compact"
      >
        <Lock className="w-6 h-6 text-primary mb-1" />
        <Badge
          className={`text-xs gap-1 bg-card border-border ${meta.colorClass}`}
        >
          {meta.icon}
          {isRTL ? meta.labelAr : meta.labelEn}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-sm space-y-5 ${className}`}
      data-ocid="paywall.panel"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-9 h-9 text-primary" />
        </div>
        <span className="absolute -bottom-1 -end-1 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          {meta.icon}
        </span>
      </div>

      {/* Text */}
      <div className="space-y-2 max-w-xs">
        <h3 className="font-display font-bold text-foreground text-lg leading-snug">
          {isRTL
            ? "هذا المحتوى مخصص للمشتركين"
            : "This content is for subscribers"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isRTL
            ? `يتطلب هذا الفيديو اشتراك ${meta.labelAr} أو أعلى للمشاهدة.`
            : `This video requires a ${meta.labelEn} subscription or higher to watch.`}
        </p>
      </div>

      {/* Required tier badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {isRTL ? "مطلوب:" : "Required:"}
        </span>
        <Badge
          className={`gap-1.5 px-3 py-1 text-sm font-semibold border ${
            requiredTier === "pro"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : requiredTier === "plus"
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted/50 text-muted-foreground border-border"
          }`}
          data-ocid="paywall.required_tier_badge"
        >
          {meta.icon}
          {isRTL ? meta.labelAr : meta.labelEn}
        </Badge>
      </div>

      {/* CTA */}
      <Button
        className="gradient-primary text-white border-0 font-semibold px-8 h-11 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
        onClick={() => void navigate({ to: "/subscribe" })}
        data-ocid="paywall.subscribe_button"
      >
        <Sparkles className="w-4 h-4 me-2" />
        {isRTL ? "اشترك الآن" : "Subscribe Now"}
      </Button>

      <p className="text-xs text-muted-foreground">
        {isRTL ? "يمكنك إلغاء الاشتراك في أي وقت." : "You can cancel anytime."}
      </p>
    </div>
  );
}
