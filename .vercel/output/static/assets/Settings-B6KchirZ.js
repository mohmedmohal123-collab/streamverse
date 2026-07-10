import { c as createLucideIcon, F as z, u as useTranslation, A as useAuth, b as useActor, r as reactExports, H as getPushPermissionStatus, j as jsxRuntimeExports, I as Settings$1, t as cn, U as User, E as Separator, B as Button, J as Bell, K as requestPushPermission, v as ue } from "./index-B4P1PGaK.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-OHUUwJKB.js";
import { L as Label } from "./label-DLTocRv1.js";
import { G as Globe, S as Switch } from "./switch-BNsGjAoU.js";
import { m as motion } from "./proxy-qgqE2Kvk.js";
import { L as LogOut } from "./log-out-DRrcKkXC.js";
import { T as Trash2 } from "./trash-2-QrZqrw48.js";
import { L as LoaderCircle } from "./loader-circle-CD345DHk.js";
import "./index-C1nCKn3U.js";
import "./index-HkvmYA7b.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
const Monitor = createLucideIcon("monitor", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
];
const Moon = createLucideIcon("moon", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
const Sun = createLucideIcon("sun", __iconNode);
function useTheme() {
  const { theme, setTheme, resolvedTheme } = z();
  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  return {
    theme,
    resolvedTheme,
    isDark,
    toggleTheme,
    setTheme
  };
}
function Settings() {
  const { t, isRTL, language, setLanguage } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor;
  const [pushPermission, setPushPermission] = reactExports.useState(
    () => getPushPermissionStatus()
  );
  const [isRequestingPush, setIsRequestingPush] = reactExports.useState(false);
  const [isSavingLang, setIsSavingLang] = reactExports.useState(false);
  const handleEnablePush = async () => {
    setIsRequestingPush(true);
    try {
      const sub = await requestPushPermission();
      if (sub) {
        setPushPermission("granted");
        ue.success(
          isRTL ? "✓ تم تفعيل الإشعارات!" : "✓ Push notifications enabled!"
        );
      } else {
        ue.error(
          isRTL ? "تعذّر تفعيل الإشعارات. تأكد من منح الإذن في إعدادات المتصفح" : "Failed to enable notifications. Check browser permissions."
        );
      }
    } finally {
      setIsRequestingPush(false);
      setPushPermission(getPushPermissionStatus());
    }
  };
  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    if (actor && !isFetching && isAuthenticated) {
      setIsSavingLang(true);
      try {
        const settings = {
          language: lang,
          darkMode: isDark
        };
        await actor.updateSettings(settings);
      } catch {
      } finally {
        setIsSavingLang(false);
      }
    }
  };
  const handleThemeToggle = () => {
    toggleTheme();
  };
  const handleDeleteAccount = () => {
    ue.error(
      isRTL ? "ميزة حذف الحساب غير متاحة حالياً" : "Account deletion is not available yet"
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-full bg-background pb-20 md:pb-10",
      dir: isRTL ? "rtl" : "ltr",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border-b border-border px-4 py-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings$1, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-lg text-foreground", children: t("settings") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl mx-auto px-4 pt-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3, delay: 0.04 },
              className: "bg-card rounded-xl border border-border overflow-hidden",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm text-foreground", children: t("language") })
                  ] }),
                  isSavingLang && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground animate-pulse", children: t("loading") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 flex gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "settings.language_en_button",
                      onClick: () => void handleLanguageChange("en"),
                      className: cn(
                        "flex-1 py-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                        language === "en" ? "border-primary bg-primary/12 text-primary shadow-sm" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: "🇬🇧" }),
                        " English"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "settings.language_ar_button",
                      onClick: () => void handleLanguageChange("ar"),
                      className: cn(
                        "flex-1 py-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                        language === "ar" ? "border-primary bg-primary/12 text-primary shadow-sm" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: "🇸🇦" }),
                        " العربية"
                      ]
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3, delay: 0.08 },
              className: "bg-card rounded-xl border border-border overflow-hidden",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "h-4 w-4 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm text-foreground", children: t("theme") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                          isDark ? "bg-primary/15" : "bg-amber-500/15"
                        ),
                        children: isDark ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4.5 w-4.5 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4.5 w-4.5 text-amber-500" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Label,
                        {
                          htmlFor: "dark-mode-switch",
                          className: "text-sm text-foreground font-medium cursor-pointer",
                          children: isDark ? t("darkMode") : t("lightMode")
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: isDark ? isRTL ? "تجربة مظلمة مريحة للعيون" : "Easy on the eyes, perfect for night use" : isRTL ? "واجهة مضيئة وواضحة" : "Clean and bright interface" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      id: "dark-mode-switch",
                      "data-ocid": "settings.dark_mode_switch",
                      checked: isDark,
                      onCheckedChange: handleThemeToggle
                    }
                  )
                ] })
              ]
            }
          ),
          isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3, delay: 0.12 },
              className: "bg-card rounded-xl border border-border overflow-hidden",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm text-foreground", children: isRTL ? "الحساب" : "Account" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: t("logout") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: isRTL ? "سيتم تسجيل خروجك من جميع الأجهزة" : "Sign out from all sessions" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      "data-ocid": "settings.logout_button",
                      onClick: logout,
                      className: "gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/40",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
                        t("logout")
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: isRTL ? "حذف الحساب" : "Delete Account" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: isRTL ? "إجراء لا يمكن التراجع عنه" : "This action cannot be undone" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "ghost",
                        size: "sm",
                        "data-ocid": "settings.delete_account_button",
                        className: "gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/40",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                          t("delete")
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "settings.delete_dialog", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: isRTL ? "حذف الحساب" : "Delete Account" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: isRTL ? "هل أنت متأكد أنك تريد حذف حسابك؟ سيتم فقدان جميع بياناتك بشكل نهائي ولا يمكن التراجع عن هذا." : "Are you sure you want to delete your account? All your data will be permanently lost and this action cannot be undone." })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "settings.cancel_button", children: t("cancel") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          AlertDialogAction,
                          {
                            "data-ocid": "settings.confirm_button",
                            onClick: handleDeleteAccount,
                            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                            children: t("delete")
                          }
                        )
                      ] })
                    ] })
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3, delay: 0.14 },
              className: "bg-card rounded-xl border border-border overflow-hidden",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm text-foreground", children: isRTL ? "الإشعارات الفورية" : "Push Notifications" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex items-center justify-between gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: isRTL ? "تفعيل الإشعارات الفورية" : "Enable push notifications" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: pushPermission === "granted" ? isRTL ? "✓ الإشعارات مفعلة" : "✓ Notifications are enabled" : pushPermission === "denied" ? isRTL ? "تم رفض الإشعارات - يمكنك تغييرها من إعدادات المتصفح" : "Notifications blocked — change in browser settings" : isRTL ? "احصل على إشعارات حتى عند إغلاق التطبيق" : "Get notified even when the app is closed" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      "data-ocid": "settings.push_notifications_button",
                      disabled: isRequestingPush || pushPermission === "denied" || pushPermission === "unsupported",
                      onClick: () => void handleEnablePush(),
                      className: pushPermission === "granted" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25" : "gradient-primary text-white border-0",
                      children: isRequestingPush ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : pushPermission === "granted" ? isRTL ? "مفعلة" : "Enabled" : isRTL ? "تفعيل" : "Enable"
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3, delay: 0.16 },
              className: "bg-card rounded-xl border border-border overflow-hidden",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm text-foreground", children: isRTL ? "عن التطبيق" : "About" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: isRTL ? "الإصدار" : "Version" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-foreground bg-muted/50 px-2 py-0.5 rounded", children: "1.0.0" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: isRTL ? "المنصة" : "Platform" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground text-xs font-medium", children: "Internet Computer" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: isRTL ? "التقنية" : "Tech" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground text-xs font-medium", children: "React + Motoko" })
                  ] })
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/60 text-center pt-2 pb-4", children: [
            "© ",
            (/* @__PURE__ */ new Date()).getFullYear(),
            ". Built with love using",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-primary/70 hover:text-primary transition-colors hover:underline",
                children: "caffeine.ai"
              }
            )
          ] })
        ] })
      ]
    }
  );
}
export {
  Settings as default
};
