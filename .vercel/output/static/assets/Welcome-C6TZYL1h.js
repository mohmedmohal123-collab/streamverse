import { c as createLucideIcon, u as useTranslation, a as useNavigate, r as reactExports, j as jsxRuntimeExports, B as Button, m as markWelcomeSeen, Z as Zap } from "./index-B4P1PGaK.js";
import { T as TrendingUp } from "./trending-up-C7qWBfVa.js";
import { U as Users } from "./users-DyqbZ55O.js";
import { S as Sparkles } from "./sparkles-0JpH7AaU.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
      key: "l5xja"
    }
  ],
  [
    "path",
    {
      d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
      key: "ep3f8r"
    }
  ],
  ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }],
  ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }],
  ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }],
  ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }],
  ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }],
  ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }],
  ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]
];
const Brain = createLucideIcon("brain", __iconNode);
const FEATURES = [
  {
    icon: Brain,
    labelEn: "AI-Powered Search",
    labelAr: "بحث بالذكاء الاصطناعي",
    descEn: "Find exactly what you want across all platforms",
    descAr: "اعثر على ما تريد عبر جميع المنصات",
    delay: 0
  },
  {
    icon: TrendingUp,
    labelEn: "Trending Content",
    labelAr: "الأكثر رواجاً",
    descEn: "Stay on top of what the world is watching",
    descAr: "ابقَ على اطلاع بما يشاهده العالم",
    delay: 150
  },
  {
    icon: Users,
    labelEn: "Follow & Connect",
    labelAr: "تابع وتواصل",
    descEn: "Follow creators and see their latest content",
    descAr: "تابع المبدعين وشاهد أحدث محتواهم",
    delay: 300
  }
];
const PARTICLES = [
  { l: 5, t: 10, d: 0, dur: 4, big: false, op: 0.3 },
  { l: 42, t: 63, d: 0.4, dur: 5, big: false, op: 0.4 },
  { l: 79, t: 26, d: 0.8, dur: 6, big: true, op: 0.5 },
  { l: 16, t: 79, d: 1.2, dur: 7, big: false, op: 0.6 },
  { l: 53, t: 42, d: 1.6, dur: 4, big: false, op: 0.3 },
  { l: 90, t: 85, d: 2, dur: 5, big: true, op: 0.4 },
  { l: 27, t: 48, d: 2.4, dur: 6, big: false, op: 0.5 },
  { l: 64, t: 11, d: 2.8, dur: 7, big: false, op: 0.6 },
  { l: 1, t: 37, d: 3.2, dur: 4, big: true, op: 0.3 },
  { l: 38, t: 90, d: 3.6, dur: 5, big: false, op: 0.4 },
  { l: 75, t: 53, d: 0.2, dur: 6, big: false, op: 0.5 },
  { l: 12, t: 16, d: 0.6, dur: 7, big: false, op: 0.6 },
  { l: 49, t: 69, d: 1, dur: 4, big: true, op: 0.3 },
  { l: 86, t: 32, d: 1.4, dur: 5, big: false, op: 0.4 },
  { l: 23, t: 5, d: 1.8, dur: 6, big: false, op: 0.5 },
  { l: 60, t: 96, d: 2.2, dur: 7, big: false, op: 0.6 },
  { l: 97, t: 59, d: 2.6, dur: 4, big: true, op: 0.3 },
  { l: 34, t: 22, d: 3, dur: 5, big: false, op: 0.4 },
  { l: 71, t: 75, d: 3.4, dur: 6, big: false, op: 0.5 },
  { l: 8, t: 88, d: 3.8, dur: 7, big: false, op: 0.6 }
];
function Particles() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute inset-0 overflow-hidden pointer-events-none",
      "aria-hidden": "true",
      children: PARTICLES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "welcome-particle",
          style: {
            left: `${p.l}%`,
            top: `${p.t}%`,
            animationDelay: `${p.d}s`,
            animationDuration: `${p.dur}s`,
            width: p.big ? "3px" : "2px",
            height: p.big ? "3px" : "2px",
            opacity: p.op
          }
        },
        `p-${p.l}-${p.t}`
      ))
    }
  );
}
function GlowOrb() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "absolute inset-0 overflow-hidden pointer-events-none",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "welcome-orb-main absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "orb-1 absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full opacity-20",
            style: {
              background: "radial-gradient(circle, oklch(0.68 0.24 270 / 0.7) 0%, transparent 70%)",
              filter: "blur(60px)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "orb-2 absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-15",
            style: {
              background: "radial-gradient(circle, oklch(0.72 0.22 290 / 0.8) 0%, transparent 70%)",
              filter: "blur(55px)"
            }
          }
        )
      ]
    }
  );
}
function LogoMark() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "welcome-ring-outer absolute inset-0 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "welcome-ring-inner absolute inset-2 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-12 h-12 text-white", strokeWidth: 2.5 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl md:text-6xl font-extrabold tracking-tight gradient-text leading-tight", children: "StreamVerse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 justify-center mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3 text-primary/70" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground tracking-widest uppercase", children: "Premium Video Platform" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3 text-primary/70" })
      ] })
    ] })
  ] });
}
function FeatureCard({
  icon: Icon,
  labelEn,
  labelAr,
  descEn,
  descAr,
  delay,
  show,
  isAr
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "glass-effect rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-transform duration-300 hover:scale-[1.03]",
      style: {
        animation: show ? `welcome-card-in 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` : "none",
        opacity: show ? void 0 : 0
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-6 h-6 text-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground", children: isAr ? labelAr : labelEn }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: isAr ? descAr : descEn })
        ] })
      ]
    }
  );
}
function Welcome() {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const isAr = language === "ar";
  const [phase, setPhase] = reactExports.useState(0);
  const [isExiting, setIsExiting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1350);
    const t4 = setTimeout(() => setPhase(4), 2e3);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);
  function handleGetStarted() {
    markWelcomeSeen();
    setIsExiting(true);
    setTimeout(() => {
      void navigate({ to: "/login" });
    }, 450);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "welcome.page",
      dir: isAr ? "rtl" : "ltr",
      className: `relative min-h-dvh flex flex-col overflow-hidden bg-[oklch(0.08_0.015_265)] transition-all duration-500 ${isExiting ? "welcome-exit" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GlowOrb, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Particles, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 z-0 opacity-[0.03] pointer-events-none",
            "aria-hidden": "true",
            style: {
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                animation: phase >= 1 ? "welcome-logo-in 0.8s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
                opacity: phase >= 1 ? void 0 : 0
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogoMark, {})
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center space-y-2 max-w-lg",
              style: {
                animation: phase >= 2 ? "welcome-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both" : "none",
                opacity: phase >= 2 ? void 0 : 0
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl md:text-3xl font-bold text-foreground/90", children: isAr ? "اكتشف عالم الفيديو" : "Discover Your Video World" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm md:text-base text-muted-foreground leading-relaxed", children: isAr ? "YouTube · Vimeo · AI · فلاتر · مشاركة" : "YouTube · Vimeo · AI · Filters · Community" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full", children: FEATURES.map((feat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            FeatureCard,
            {
              ...feat,
              delay: feat.delay,
              show: phase >= 3,
              isAr
            },
            feat.labelEn
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                animation: phase >= 4 ? "welcome-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both" : "none",
                opacity: phase >= 4 ? void 0 : 0
              },
              className: "flex flex-col items-center gap-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  phase >= 4 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "welcome-btn-glow absolute inset-0 rounded-full pointer-events-none" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "lg",
                      onClick: handleGetStarted,
                      "data-ocid": "welcome.get_started_button",
                      className: "relative h-14 px-12 text-base font-bold rounded-full gradient-primary shadow-2xl hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 z-10",
                      children: isAr ? "ابدأ الآن" : "Get Started"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleGetStarted,
                    "data-ocid": "welcome.sign_in_link",
                    className: "text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 underline-offset-2 hover:underline",
                    children: isAr ? "هل لديك حساب؟ سجّل الدخول" : "Already have an account? Sign in"
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "relative z-10 text-center pb-6 text-xs text-muted-foreground/30 anim-fade-in delay-900", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          ".",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : ""
              )}`,
              target: "_blank",
              rel: "noreferrer",
              className: "hover:text-muted-foreground/60 transition-colors duration-200",
              children: "Built with love using caffeine.ai"
            }
          )
        ] })
      ]
    }
  );
}
export {
  Welcome as default
};
