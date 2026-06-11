import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Brain, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { markWelcomeSeen } from "../App";
import { useTranslation } from "../lib/i18n";

/* ─── Animation phase sequencing ─────────────────────────────────────────── */
// 0: dark screen
// 1: logo fades + scales in  (0ms)
// 2: tagline slides up       (800ms after logo starts)
// 3: feature cards appear    (1300ms)
// 4: CTA button glows in     (1900ms)
// 5: exiting                 (click)

const FEATURES = [
  {
    icon: Brain,
    labelEn: "AI-Powered Search",
    labelAr: "بحث بالذكاء الاصطناعي",
    descEn: "Find exactly what you want across all platforms",
    descAr: "اعثر على ما تريد عبر جميع المنصات",
    delay: 0,
  },
  {
    icon: TrendingUp,
    labelEn: "Trending Content",
    labelAr: "الأكثر رواجاً",
    descEn: "Stay on top of what the world is watching",
    descAr: "ابقَ على اطلاع بما يشاهده العالم",
    delay: 150,
  },
  {
    icon: Users,
    labelEn: "Follow & Connect",
    labelAr: "تابع وتواصل",
    descEn: "Follow creators and see their latest content",
    descAr: "تابع المبدعين وشاهد أحدث محتواهم",
    delay: 300,
  },
];

const PARTICLES = [
  { l: 5, t: 10, d: 0.0, dur: 4, big: false, op: 0.3 },
  { l: 42, t: 63, d: 0.4, dur: 5, big: false, op: 0.4 },
  { l: 79, t: 26, d: 0.8, dur: 6, big: true, op: 0.5 },
  { l: 16, t: 79, d: 1.2, dur: 7, big: false, op: 0.6 },
  { l: 53, t: 42, d: 1.6, dur: 4, big: false, op: 0.3 },
  { l: 90, t: 85, d: 2.0, dur: 5, big: true, op: 0.4 },
  { l: 27, t: 48, d: 2.4, dur: 6, big: false, op: 0.5 },
  { l: 64, t: 11, d: 2.8, dur: 7, big: false, op: 0.6 },
  { l: 1, t: 37, d: 3.2, dur: 4, big: true, op: 0.3 },
  { l: 38, t: 90, d: 3.6, dur: 5, big: false, op: 0.4 },
  { l: 75, t: 53, d: 0.2, dur: 6, big: false, op: 0.5 },
  { l: 12, t: 16, d: 0.6, dur: 7, big: false, op: 0.6 },
  { l: 49, t: 69, d: 1.0, dur: 4, big: true, op: 0.3 },
  { l: 86, t: 32, d: 1.4, dur: 5, big: false, op: 0.4 },
  { l: 23, t: 5, d: 1.8, dur: 6, big: false, op: 0.5 },
  { l: 60, t: 96, d: 2.2, dur: 7, big: false, op: 0.6 },
  { l: 97, t: 59, d: 2.6, dur: 4, big: true, op: 0.3 },
  { l: 34, t: 22, d: 3.0, dur: 5, big: false, op: 0.4 },
  { l: 71, t: 75, d: 3.4, dur: 6, big: false, op: 0.5 },
  { l: 8, t: 88, d: 3.8, dur: 7, big: false, op: 0.6 },
];

/* ─── Floating particle ─────────────────────────────────────────────────── */
function Particles() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <span
          key={`p-${p.l}-${p.t}`}
          className="welcome-particle"
          style={{
            left: `${p.l}%`,
            top: `${p.t}%`,
            animationDelay: `${p.d}s`,
            animationDuration: `${p.dur}s`,
            width: p.big ? "3px" : "2px",
            height: p.big ? "3px" : "2px",
            opacity: p.op,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Glowing rotating orb ──────────────────────────────────────────────── */
function GlowOrb() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Main slow-rotating gradient orb */}
      <div className="welcome-orb-main absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full" />
      {/* Secondary orb top-right */}
      <div
        className="orb-1 absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.24 270 / 0.7) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Bottom-left accent */}
      <div
        className="orb-2 absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.22 290 / 0.8) 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />
    </div>
  );
}

/* ─── Logo mark ─────────────────────────────────────────────────────────── */
function LogoMark() {
  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Animated ring around logo */}
      <div className="relative">
        <div className="welcome-ring-outer absolute inset-0 rounded-full" />
        <div className="welcome-ring-inner absolute inset-2 rounded-full" />
        <div className="relative w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl z-10">
          <Zap className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Brand name */}
      <div className="text-center">
        <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight gradient-text leading-tight">
          StreamVerse
        </h1>
        <div className="flex items-center gap-2 justify-center mt-1">
          <Sparkles className="w-3 h-3 text-primary/70" />
          <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
            Premium Video Platform
          </span>
          <Sparkles className="w-3 h-3 text-primary/70" />
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ──────────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  labelEn,
  labelAr,
  descEn,
  descAr,
  delay,
  show,
  isAr,
}: {
  icon: typeof Brain;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  delay: number;
  show: boolean;
  isAr: boolean;
}) {
  return (
    <div
      className="glass-effect rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-transform duration-300 hover:scale-[1.03]"
      style={{
        animation: show
          ? `welcome-card-in 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`
          : "none",
        opacity: show ? undefined : 0,
      }}
    >
      <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg flex-shrink-0">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">
          {isAr ? labelAr : labelEn}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {isAr ? descAr : descEn}
        </p>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function Welcome() {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const isAr = language === "ar";

  const [phase, setPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Drive the animation sequence with timeouts
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100); // logo
    const t2 = setTimeout(() => setPhase(2), 900); // tagline
    const t3 = setTimeout(() => setPhase(3), 1350); // cards
    const t4 = setTimeout(() => setPhase(4), 2000); // CTA
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

  return (
    <div
      data-ocid="welcome.page"
      dir={isAr ? "rtl" : "ltr"}
      className={`relative min-h-dvh flex flex-col overflow-hidden bg-[oklch(0.08_0.015_265)] transition-all duration-500 ${isExiting ? "welcome-exit" : ""}`}
    >
      {/* Background layers */}
      <GlowOrb />
      <Particles />

      {/* Noise texture for film-grain depth */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── CONTENT ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
        {/* Phase 1: Logo */}
        <div
          style={{
            animation:
              phase >= 1
                ? "welcome-logo-in 0.8s cubic-bezier(0.34,1.56,0.64,1) both"
                : "none",
            opacity: phase >= 1 ? undefined : 0,
          }}
        >
          <LogoMark />
        </div>

        {/* Phase 2: Tagline (bilingual) */}
        <div
          className="text-center space-y-2 max-w-lg"
          style={{
            animation:
              phase >= 2
                ? "welcome-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both"
                : "none",
            opacity: phase >= 2 ? undefined : 0,
          }}
        >
          <p className="font-display text-2xl md:text-3xl font-bold text-foreground/90">
            {isAr ? "اكتشف عالم الفيديو" : "Discover Your Video World"}
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {isAr
              ? "YouTube · Vimeo · AI · فلاتر · مشاركة"
              : "YouTube · Vimeo · AI · Filters · Community"}
          </p>
        </div>

        {/* Phase 3: Feature cards (staggered) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          {FEATURES.map((feat) => (
            <FeatureCard
              key={feat.labelEn}
              {...feat}
              delay={feat.delay}
              show={phase >= 3}
              isAr={isAr}
            />
          ))}
        </div>

        {/* Phase 4: CTA button */}
        <div
          style={{
            animation:
              phase >= 4
                ? "welcome-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both"
                : "none",
            opacity: phase >= 4 ? undefined : 0,
          }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            {/* Pulsing glow ring behind button */}
            {phase >= 4 && (
              <div className="welcome-btn-glow absolute inset-0 rounded-full pointer-events-none" />
            )}
            <Button
              size="lg"
              onClick={handleGetStarted}
              data-ocid="welcome.get_started_button"
              className="relative h-14 px-12 text-base font-bold rounded-full gradient-primary shadow-2xl hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 z-10"
            >
              {isAr ? "ابدأ الآن" : "Get Started"}
            </Button>
          </div>
          <button
            type="button"
            onClick={handleGetStarted}
            data-ocid="welcome.sign_in_link"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 underline-offset-2 hover:underline"
          >
            {isAr
              ? "هل لديك حساب؟ سجّل الدخول"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-6 text-xs text-muted-foreground/30 anim-fade-in delay-900">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-muted-foreground/60 transition-colors duration-200"
        >
          Built with love using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
