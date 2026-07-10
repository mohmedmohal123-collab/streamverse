import { b as useActor, d as useQuery, p as useQueryClient, q as useMutation, v as ue, aq as PlanType, ar as SubscriptionTier, u as useTranslation, r as reactExports, j as jsxRuntimeExports, B as Button, X, Z as Zap, D as Shield } from "./index-B4P1PGaK.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-OHUUwJKB.js";
import { B as Badge } from "./badge-B5FJUKjx.js";
import { C as CreditCard } from "./credit-card-DOpCpcJG.js";
import { S as Sparkles } from "./sparkles-0JpH7AaU.js";
import { C as Calendar } from "./calendar-DQkwFrm4.js";
import { L as LoaderCircle } from "./loader-circle-CD345DHk.js";
import { E as ExternalLink } from "./external-link-CIWNqrEm.js";
import { C as Check } from "./check-C3_r_4Ww.js";
import "./index-C1nCKn3U.js";
function backendTierToKind(tier) {
  if (tier === SubscriptionTier.plus) return "plus";
  if (tier === SubscriptionTier.pro) return "pro";
  return "free";
}
function kindToBackendTier(kind) {
  if (kind === "plus") return SubscriptionTier.plus;
  if (kind === "pro") return SubscriptionTier.pro;
  return SubscriptionTier.free;
}
function useMySubscription() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!actor) return { tier: "free", status: "none" };
      const sub = await actor.getMySubscription();
      if (!sub) return { tier: "free", status: "none" };
      return {
        tier: backendTierToKind(sub.tier),
        status: sub.status,
        currentPeriodEnd: Number(sub.currentPeriodEnd)
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 1e3 * 60
  });
}
function useCreateCheckoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tier,
      successUrl,
      cancelUrl,
      billing
    }) => {
      if (!actor) throw new Error("actor_not_ready");
      const planType = billing === "annual" ? PlanType.annual : PlanType.monthly;
      const finalSuccessUrl = billing === "annual" ? `${successUrl}&billing=annual` : successUrl;
      const result = await actor.createCheckoutSession(
        kindToBackendTier(tier),
        planType,
        finalSuccessUrl,
        cancelUrl
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (checkoutUrl) => {
      void queryClient.invalidateQueries({ queryKey: ["subscription"] });
      window.location.href = checkoutUrl;
    },
    onError: (err) => {
      if (err.message === "actor_not_ready") {
        ue.error(
          "يجب على المسؤول ربط Stripe أولاً / Admin must configure Stripe first"
        );
      } else {
        ue.error(
          `حدث خطأ أثناء إنشاء جلسة الدفع / Checkout failed: ${err.message}`
        );
      }
    }
  });
}
function useCancelSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("actor_not_ready");
      const result = await actor.cancelSubscription();
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscription"] });
      ue.success("تم إلغاء الاشتراك / Subscription canceled");
    },
    onError: (err) => {
      ue.error(`فشل إلغاء الاشتراك / Cancel failed: ${err.message}`);
    }
  });
}
function useCreateCustomerPortalSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("actor_not_ready");
      const returnUrl = window.location.href;
      const result = await actor.createCustomerPortalSession(returnUrl);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (portalUrl) => {
      window.location.href = portalUrl;
    },
    onError: (err) => {
      if (err.message === "actor_not_ready") {
        ue.error(
          "يجب على المسؤول ربط Stripe أولاً / Admin must configure Stripe first"
        );
      } else {
        ue.error(`فشل فتح بوابة الدفع / Portal failed: ${err.message}`);
      }
    }
  });
}
const TIERS = [
  {
    id: "free",
    features: ["Search & Watch", "Watch History", "Basic Quality"],
    featuresAr: ["بحث ومشاهدة", "سجل المشاهدة", "جودة أساسية"],
    monthlyPrice: 0,
    annualPrice: 0
  },
  {
    id: "plus",
    features: ["All Free features", "HD Quality", "No Ads", "Download Videos"],
    featuresAr: [
      "كل مميزات المجاني",
      "جودة عالية HD",
      "بدون إعلانات",
      "تحميل الفيديوهات"
    ],
    monthlyPrice: 4.99,
    annualPrice: 3.99
  },
  {
    id: "pro",
    featured: true,
    features: [
      "All Plus features",
      "4K Quality",
      "Early Access",
      "Priority Support",
      "Creator Analytics"
    ],
    featuresAr: [
      "كل مميزات بلس",
      "جودة 4K",
      "وصول مبكر",
      "دعم أولوية",
      "تحليلات المنشئ"
    ],
    monthlyPrice: 9.99,
    annualPrice: 7.99
  }
];
const STATUS_COLORS = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  canceled: "bg-destructive/15 text-destructive border-destructive/30",
  past_due: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  none: "bg-muted text-muted-foreground border-border"
};
function formatDate(ts, isRTL) {
  if (!ts || ts === 0) return "";
  const date = new Date(ts < 1e12 ? ts * 1e3 : ts);
  return date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function Subscribe() {
  const { t, isRTL } = useTranslation();
  const [billing, setBilling] = reactExports.useState("monthly");
  const { data: subscription } = useMySubscription();
  const { mutate: checkout, isPending: checkingOut } = useCreateCheckoutSession();
  const { mutate: cancelSub, isPending: canceling } = useCancelSubscription();
  const { mutate: openPortal, isPending: openingPortal } = useCreateCustomerPortalSession();
  const currentTier = (subscription == null ? void 0 : subscription.tier) ?? "free";
  const currentStatus = (subscription == null ? void 0 : subscription.status) ?? "none";
  const isActiveSub = currentStatus === "active" && (currentTier === "plus" || currentTier === "pro");
  function handleUpgrade(tier) {
    if (tier === "free") return;
    const successUrl = `${window.location.origin}/subscribe?success=1&tier=${tier}`;
    const cancelUrl = `${window.location.origin}/subscribe`;
    checkout({ tier, successUrl, cancelUrl, billing });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "transition-page min-h-screen overflow-y-auto pb-28 md:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-xl mx-auto pt-8 px-4 mb-8 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-7 w-7 text-white" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-3xl text-foreground", children: t("subscribe.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: t("subscribe.subtitle") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center mb-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border",
        "data-ocid": "subscribe.billing_toggle",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setBilling("monthly"),
              "data-ocid": "subscribe.billing_monthly_tab",
              className: `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${billing === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
              children: isRTL ? "شهري" : "Monthly"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setBilling("annual"),
              "data-ocid": "subscribe.billing_annual_tab",
              className: `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${billing === "annual" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
              children: [
                isRTL ? "سنوي" : "Annual",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5", children: isRTL ? "وفر 20%" : "Save 20%" })
              ]
            }
          )
        ]
      }
    ) }),
    isActiveSub && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "max-w-2xl mx-auto px-4 mb-8",
        "data-ocid": "subscribe.status_panel",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-cyan-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm", children: t(
                  `subscribe.${currentTier}.name`
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[currentStatus] ?? STATUS_COLORS.none}`,
                    "data-ocid": "subscribe.current_status_badge",
                    children: t(
                      `subscribe.status.${currentStatus}`
                    )
                  }
                ) })
              ] })
            ] }),
            (subscription == null ? void 0 : subscription.currentPeriodEnd) !== void 0 && subscription.currentPeriodEnd > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-cyan-400 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                t("subscribe.nextBilling"),
                ":",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: formatDate(subscription.currentPeriodEnd, isRTL) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-cyan-500/20 pt-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: t("subscribe.managePaymentHint") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-all gap-2",
                onClick: () => openPortal(),
                disabled: openingPortal,
                "data-ocid": "subscribe.manage_payment_button",
                children: openingPortal ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                  t("subscribe.openingPortal")
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" }),
                  t("subscribe.managePayment"),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5 opacity-60 ms-auto" })
                ] })
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "subscription-tiers-container px-4",
        "data-ocid": "subscribe.tiers",
        children: TIERS.map((tier) => {
          const isCurrent = currentTier === tier.id;
          const isActive = (subscription == null ? void 0 : subscription.status) === "active";
          const features = isRTL ? tier.featuresAr : tier.features;
          const displayPrice = billing === "annual" ? tier.annualPrice : tier.monthlyPrice;
          const savePercent = tier.monthlyPrice > 0 ? Math.round((1 - tier.annualPrice / tier.monthlyPrice) * 100) : 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `subscribe.tier.${tier.id}`,
              className: `subscription-tier-card ${tier.featured ? "featured" : ""}`,
              children: [
                tier.featured && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "subscription-tier-badge", children: t("subscribe.featured") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 pt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "subscription-tier-name", children: t(`subscribe.${tier.id}.name`) }),
                    isCurrent && isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        variant: "secondary",
                        className: "text-xs bg-primary/15 text-primary border-primary/20",
                        "data-ocid": `subscribe.current_badge.${tier.id}`,
                        children: t("subscribe.currentPlan")
                      }
                    )
                  ] }),
                  tier.monthlyPrice === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-baseline gap-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "subscription-tier-price", children: isRTL ? "مجاني" : "Free" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "subscription-tier-price", children: [
                        "$",
                        displayPrice.toFixed(2)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "subscription-tier-price-period", children: isRTL ? "/شهر" : "/mo" }),
                      billing === "annual" && savePercent > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-emerald-400 font-semibold ms-1", children: isRTL ? `وفر ${savePercent}%` : `Save ${savePercent}%` })
                    ] }),
                    billing === "annual" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: isRTL ? `يُدفع $${(displayPrice * 12).toFixed(2)} سنوياً` : `$${(displayPrice * 12).toFixed(2)} billed annually` })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "subscription-tier-description", children: t(`subscribe.${tier.id}.desc`) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "subscription-tier-features", children: features.map((feature) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "subscription-tier-feature", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "subscription-tier-feature-check", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }) }),
                  feature
                ] }, feature)) }),
                tier.id === "free" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "subscription-tier-cta subscription-tier-cta-secondary w-full",
                    disabled: true,
                    "data-ocid": "subscribe.free_plan_button",
                    children: isRTL ? "مجاني دائماً" : "Always Free"
                  }
                ) : isCurrent && isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "outline",
                      className: "w-full border-destructive/30 text-destructive hover:bg-destructive/10",
                      disabled: canceling,
                      "data-ocid": `subscribe.cancel_button.${tier.id}`,
                      children: [
                        canceling ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin me-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 me-2" }),
                        t("subscribe.cancel")
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    AlertDialogContent,
                    {
                      "data-ocid": "subscribe.cancel_dialog",
                      className: "max-w-sm mx-4",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: t("subscribe.cancelConfirmTitle") }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: t("subscribe.cancelConfirmDesc") })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { className: "flex-row-reverse sm:flex-row gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "subscribe.cancel_abort_button", children: t("subscribe.cancelAbort") }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            AlertDialogAction,
                            {
                              className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                              onClick: () => cancelSub(),
                              "data-ocid": "subscribe.cancel_confirm_button",
                              children: t("subscribe.cancelConfirm")
                            }
                          )
                        ] })
                      ]
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "subscription-tier-cta subscription-tier-cta-primary w-full flex items-center justify-center gap-2",
                    onClick: () => handleUpgrade(tier.id),
                    disabled: checkingOut,
                    "data-ocid": `subscribe.upgrade_button.${tier.id}`,
                    children: checkingOut ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                      t("subscribe.processing")
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
                      t("subscribe.upgrade"),
                      " ",
                      t(
                        `subscribe.${tier.id}.name`
                      ),
                      billing === "annual" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-75 ms-1", children: [
                        "(",
                        isRTL ? "سنوي" : "Annual",
                        ")"
                      ] })
                    ] })
                  }
                )
              ]
            },
            tier.id
          );
        })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mt-6 px-4 max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: isRTL ? "المدفوعات مؤمّنة عبر Stripe. يتم تشفير جميع البيانات." : "Payments secured by Stripe. All transactions are encrypted." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-md mx-auto px-4 mt-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground mb-0.5", children: isRTL ? "نظام الدفع" : "Payment System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: isRTL ? "يتم معالجة جميع المدفوعات عبر Stripe. بعد تأكيد وصول المبلغ إلى حساب Stripe الخاص بالموقع، يتم تفعيل مميزات الاشتراك تلقائياً." : "All payments are processed by Stripe. Once payment is confirmed in the site's Stripe account, your subscription features are activated automatically." })
      ] })
    ] }) })
  ] });
}
export {
  Subscribe as default
};
