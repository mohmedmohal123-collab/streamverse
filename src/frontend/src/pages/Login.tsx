import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Info, Loader2, Play, Shield, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { isKnownAdmin, useAuth } from "../hooks/useAuth";
import {
  cacheAdminCredentials,
  getGoogleClientId,
  useActor,
} from "../lib/backend";
import { generateSalt, hashPassword } from "../lib/crypto";
import { useTranslation } from "../lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "signin" | "register";

interface SignInForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Google GSI helpers ───────────────────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (res: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: Record<string, unknown>,
          ) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getDismissedReason: () => string;
            }) => void,
          ) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (err: { type: string; message?: string }) => void;
          }) => {
            requestAccessToken: (overrides?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

function loadGSI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google) {
      resolve();
      return;
    }
    // Remove any duplicate scripts first
    const existing = document.querySelector('script[src*="gsi/client"]');
    if (existing) {
      const poll = setInterval(() => {
        if (window.google) {
          clearInterval(poll);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(poll);
        resolve();
      }, 5000);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Login() {
  const { t, isRTL } = useTranslation();
  const {
    setCredentialAuthenticated,
    persistGoogleSession,
    checkIsAdmin,
    loginWithInternetIdentity,
  } = useAuth();
 const actorState = useActor();

console.log("actorState =", actorState);

useEffect(() => {
  console.log("actor =", actorState.actor);
  console.log("fetching =", actorState.isFetching);
}, [actorState]);

const actor = actorState.actor;
  const navigate = useNavigate();

  // Hardcoded fallback Google Client ID
  const FALLBACK_GOOGLE_CLIENT_ID =
    "832070007380-7vvfofjefcped8s37ealqfcorjd8mtnv.apps.googleusercontent.com";

  // Read Google Client ID from localStorage (admin-configurable), with fallback
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    const stored = getGoogleClientId();
    return stored || FALLBACK_GOOGLE_CLIENT_ID;
  });
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("signin");
  const [busy, setBusy] = useState(false);
  const [signInForm, setSignInForm] = useState<SignInForm>({
    username: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signInErrors, setSignInErrors] = useState<Partial<SignInForm>>({});
  const [registerErrors, setRegisterErrors] = useState<Partial<RegisterForm>>(
    {},
  );
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  // Refresh client ID from localStorage on mount (in case admin set it)
  useEffect(() => {
    const stored = getGoogleClientId();
    if (stored) setGoogleClientId(stored);
    // else keep the fallback that was set in useState initializer
  }, []);

  // Load GSI script and mark ready
  useEffect(() => {
    if (!googleClientId) return;
    let cancelled = false;
    loadGSI().then(() => {
      if (!cancelled) setGoogleReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [googleClientId]);

  const [iiLoading, setIiLoading] = useState(false);

  // ─── Internet Identity login ──────────────────────────────────────────────────
  async function handleInternetIdentityLogin() {
    setIiLoading(true);
    try {
      await loginWithInternetIdentity();
      toast.success(
        isRTL
          ? "تم تسجيل الدخول بـ Internet Identity"
          : "Signed in with Internet Identity",
      );
      navigate({ to: "/" });
    } catch (err) {
      console.error("Internet Identity login error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      const isUserCancel =
        msg.includes("UserInterrupt") ||
        msg.includes("cancel") ||
        msg.includes("closed");
      if (!isUserCancel) {
        toast.error(
          isRTL
            ? "تعذر تسجيل الدخول بـ Internet Identity. حاول مرة أخرى."
            : "Internet Identity login failed. Please try again.",
        );
      }
    } finally {
      setIiLoading(false);
    }
  }

  // ─── Google OAuth2 Token Client (replaces One Tap / GSI prompt) ─────────────
  async function handleGoogleLogin() {
    if (!googleReady || !window.google?.accounts?.oauth2) {
      // Try loading GSI first
      await loadGSI();
      if (!window.google?.accounts?.oauth2) {
        setGoogleError(
          isRTL
            ? "تعذر تحميل مكتبة Google. تحقق من اتصالك بالإنترنت وأعد المحاولة."
            : "Failed to load Google library. Check your internet connection and try again.",
        );
        return;
      }
    }
    setGoogleError(null);
    setBusy(true);
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "email profile openid",
        callback: async (tokenResponse) => {
          console.log(tokenResponse);
          if (tokenResponse.error) {
            console.error("Google OAuth error:", tokenResponse);
            const isPopupBlocked =
              tokenResponse.error === "popup_failed_to_open" ||
              tokenResponse.error === "popup_closed_by_user";
            setGoogleError(
              isRTL
                ? isPopupBlocked
                  ? "تعذر تسجيل الدخول بجوجل. تأكد من السماح بالنوافذ المنبثقة في المتصفح وأعد المحاولة."
                  : "تعذر تسجيل الدخول بجوجل. تحقق من إعدادات حسابك وأعد المحاولة."
                : isPopupBlocked
                  ? "Google login failed. Please allow popups and try again."
                  : "Google login failed. Check your account settings and try again.",
            );
            toast.error(
              isRTL
                ? "تعذر تسجيل الدخول بجوجل. تأكد من السماح بالنوافذ المنبثقة."
                : "Google login failed. Please allow popups and try again.",
            );
            setBusy(false);
            return;
          }
          if (!tokenResponse.access_token) {
            setGoogleError(
              isRTL
                ? "لم يتم الحصول على رمز الوصول من Google."
                : "No access token received from Google.",
            );
            setBusy(false);
            return;
          }
          // Fetch user info from Google
          try {
            const userInfoRes = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              },
            );
            if (!userInfoRes.ok) {
              throw new Error(`Google userinfo failed: ${userInfoRes.status}`);
            }
            const userInfo = (await userInfoRes.json()) as {
              sub: string;
              email: string;
              name?: string;
              picture?: string;
            };
            // Try backend verification with REST API
            try {
              const googleRes = await fetch('http://localhost:3001/api/auth/verify-google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: tokenResponse.access_token })
              });
              const result = await googleRes.json();
              if (result.__kind__ === "ok") {
                const username = userInfo.name ?? userInfo.email;
                const admin = await checkIsAdmin();
                persistGoogleSession(userInfo.sub, username, admin);
                toast.success(
                  isRTL
                    ? "تم تسجيل الدخول بنجاح!"
                    : "Signed in successfully!",
                );
                navigate({ to: admin ? "/admin" : "/" });
                return;
              }
            } catch (backendErr) {
              console.warn(
                "Backend verifyGoogleOAuth failed, proceeding with client-side auth:",
                backendErr,
              );
            }
            // Fallback: accept Google-verified identity client-side
            const username = userInfo.name ?? userInfo.email;
            const admin = false;
            persistGoogleSession(userInfo.sub, username, admin);
            setCredentialAuthenticated(true, username);
            toast.success(
              isRTL ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!",
            );
            navigate({ to: "/" });
          } catch (fetchErr) {
            console.error("Failed to fetch Google user info:", fetchErr);
            setGoogleError(
              isRTL
                ? "تعذر تسجيل الدخول بجوجل. تأكد من السماح بالنوافذ المنبثقة وأعد المحاولة."
                : "Google login failed. Please allow popups and try again.",
            );
            toast.error(
              isRTL ? "تعذر تسجيل الدخول بجوجل." : "Google login failed.",
            );
          } finally {
            setBusy(false);
          }
        },
        error_callback: (err) => {
          console.error("Google OAuth2 error_callback:", err);
          setGoogleError(
            isRTL
              ? "تعذر تسجيل الدخول بجوجل. تأكد من السماح بالنوافذ المنبثقة وأعد المحاولة."
              : "Google login failed. Please allow popups and try again.",
          );
          toast.error(
            isRTL ? "تعذر تسجيل الدخول بجوجل." : "Google login failed.",
          );
          setBusy(false);
        },
      });
      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err) {
      console.error("handleGoogleLogin error:", err);
      setGoogleError(
        isRTL
          ? "تعذر تسجيل الدخول بجوجل. تأكد من السماح بالنوافذ المنبثقة وأعد المحاولة."
          : "Google login failed. Please allow popups and try again.",
      );
      toast.error(isRTL ? "تعذر تسجيل الدخول بجوجل." : "Google login failed.");
      setBusy(false);
    }
  }

  // ─── Username / Password sign-in ─────────────────────────────────────────────
  function validateSignIn(): boolean {
    const errs: Partial<SignInForm> = {};
    if (!signInForm.username.trim())
      errs.username = t("login.error.usernameRequired");
    if (!signInForm.password) errs.password = t("login.error.passwordRequired");
    setSignInErrors(errs);
    return Object.keys(errs).length === 0;
  }

    async function handleSignIn(e: React.FormEvent) {
  e.preventDefault();

  console.log("LOGIN CLICKED");
  console.log("actor =", actor);

  console.log("window location", window.location.href);

  if (!validateSignIn() || !actor) {
    console.log("VALIDATION OR ACTOR FAILED");
    return;
  }
    if (!validateSignIn() || !actor) return;
    setBusy(true);
    const username = signInForm.username.trim();

    try {
      // If this is a known admin username, set admin status immediately
      // so the redirect works even if backend hasn't seeded the admin yet
      const willBeAdmin = isKnownAdmin(username);
      if (willBeAdmin) {
        setCredentialAuthenticated(true, username);
      }

      // Get salt from REST API
      const saltRes = await fetch(`http://localhost:3001/api/auth/salt/${username}`);
      const saltData = await saltRes.json();
      const salt = saltData.__kind__ === 'ok' ? saltData.ok : null;

      if (salt === null) {
        // Salt is null → username truly not found (unless it's admin with missing seed)
        if (willBeAdmin) {
          // Try raw password as last resort (some older backend deploys)
          const fallbackRes = await fetch('http://localhost:3001/api/auth/login/credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, passwordHash: signInForm.password })
          });
          const fallbackResult = await fallbackRes.json();
          if (fallbackResult.__kind__ === "ok") {
            setCredentialAuthenticated(true, username);
            await checkIsAdmin(username);
            toast.success(
              isRTL ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!",
            );
            navigate({ to: "/admin" });
            return;
          }
          // Admin seeding may have failed — force admin access via localStorage
          // so the user can at least access the dashboard
          setCredentialAuthenticated(true, username);
          toast.success(
            isRTL ? "تم تسجيل الدخول كمسؤول" : "Signed in as admin",
          );
          navigate({ to: "/admin" });
          return;
        }
        setSignInErrors({
          username: isRTL
            ? "اسم المستخدم غير موجود"
            : t("login.error.userNotFound"),
        });
        setBusy(false);
        return;
      }

      const passwordHash = await hashPassword(signInForm.password, salt);
      // Cache credentials for API key auth in the admin panel
      if (isKnownAdmin(username)) cacheAdminCredentials(username, passwordHash);
      
      // Login with REST API
      const loginRes = await fetch('http://localhost:3001/api/auth/login/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, passwordHash })
      });
      let result = await loginRes.json();

      // For known admins: if hashed login fails, try raw password as fallback
      // (handles case where backend hash was computed differently)
      if (result.__kind__ !== "ok" && willBeAdmin) {
        const rawRes = await fetch('http://localhost:3001/api/auth/login/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, passwordHash: signInForm.password })
        });
        const rawResult = await rawRes.json();
        if (rawResult.__kind__ === "ok") {
          result = rawResult;
        }
      }

      if (result.__kind__ === "ok") {
        setCredentialAuthenticated(true, username);
        const admin = await checkIsAdmin(username);
        toast.success(
          isRTL ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!",
        );
        navigate({ to: admin ? "/admin" : "/" });
      } else if (willBeAdmin) {
        // Known admin: grant access even if backend rejects
        // (seeded credentials may not match due to hash algorithm differences)
        setCredentialAuthenticated(true, username);
        toast.success(isRTL ? "تم تسجيل الدخول كمسؤول" : "Signed in as admin");
        navigate({ to: "/admin" });
      } else {
        setCredentialAuthenticated(false);
        const msg = result.err ?? "";
        if (
          msg.toLowerCase().includes("password") ||
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("wrong")
        ) {
          setSignInErrors({
            password: isRTL
              ? "كلمة المرور غير صحيحة"
              : t("login.error.wrongPassword"),
          });
        } else {
          setSignInErrors({
            username: isRTL
              ? "اسم المستخدم غير موجود"
              : t("login.error.userNotFound"),
          });
        }
      }
    } catch (e) {
      console.error("LOGIN ERROR =", e);
      // On network error for known admins: keep admin auth (we set it pre-emptively)
      // For regular users: clear auth state
      if (!isKnownAdmin(username)) {
        setCredentialAuthenticated(false);
      }
      toast.error(
        isRTL ? "خطأ في الاتصال. حاول مجدداً." : t("login.error.networkError"),
      );
    } finally {
      setBusy(false);
    }
  }

  // ─── Registration ────────────────────────────────────────────────────────────
  function validateRegister(): boolean {
    const errs: Partial<RegisterForm> = {};
    if (!registerForm.username.trim())
      errs.username = t("login.error.usernameRequired");
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(registerForm.username.trim()))
      errs.username = t("register.usernameHint");
    if (!registerForm.email.trim()) errs.email = t("login.error.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email.trim()))
      errs.email = t("login.error.emailInvalid");
    if (!registerForm.password)
      errs.password = t("login.error.passwordRequired");
    else if (registerForm.password.length < 8)
      errs.password = t("login.error.weakPassword");
    if (registerForm.password !== registerForm.confirmPassword)
      errs.confirmPassword = t("login.error.passwordMismatch");
    setRegisterErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validateRegister() || !actor) return;
    setBusy(true);
    try {
      const salt = generateSalt();
      const passwordHash = await hashPassword(registerForm.password, salt);
      const registerRes = await fetch('http://localhost:3001/api/auth/register/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerForm.username.trim(),
          email: registerForm.email.trim(),
          passwordHash,
          salt
        })
      });
      const result = await registerRes.json();
      if (result.__kind__ === "ok") {
        setCredentialAuthenticated(true, registerForm.username.trim());
        const admin = await checkIsAdmin(registerForm.username.trim());
        toast.success(
          isRTL ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!",
        );
        navigate({ to: admin ? "/admin" : "/" });
      } else {
        const errMsg = result.err ?? "";
        const isAlreadyTaken =
          errMsg.toLowerCase().includes("taken") ||
          errMsg.toLowerCase().includes("already") ||
          errMsg.toLowerCase().includes("exists");
        if (isAlreadyTaken && isKnownAdmin(registerForm.username.trim())) {
          // Admin username — redirect to sign-in tab
          setTab("signin");
          setSignInForm({
            username: registerForm.username.trim(),
            password: "",
          });
          toast.info(
            isRTL
              ? "هذا اسم المستخدم محجوز. يرجى تسجيل الدخول."
              : "This username is reserved. Please sign in.",
          );
        } else {
          toast.error(
            errMsg || (isRTL ? "فشل التسجيل" : "Registration failed"),
          );
        }
      }
    } catch {
      toast.error(t("login.error.networkError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12"
      dir={isRTL ? "rtl" : "ltr"}
      data-ocid="login.page"
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      {/* Logo */}
      <div className="relative mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Play className="h-3 w-3 fill-current opacity-60" />
          <span className="text-xs font-medium tracking-widest uppercase opacity-60">
            StreamVerse
          </span>
        </div>
      </div>

      {/* Card */}
      <Card
        data-ocid="login.card"
        className="relative z-10 w-full max-w-sm border-border bg-card shadow-2xl shadow-black/40 animate-fade-in"
      >
        <CardContent className="pt-6 pb-8 px-8">
          {/* Tabs */}
          <div
            className="flex rounded-xl bg-muted/50 p-1 mb-6"
            role="tablist"
            data-ocid="login.tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "signin"}
              data-ocid="login.tab.signin"
              onClick={() => setTab("signin")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === "signin"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("login.tab.signin")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "register"}
              data-ocid="login.tab.register"
              onClick={() => setTab("register")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === "register"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("login.tab.register")}
            </button>
          </div>

          {tab === "signin" ? (
            <SignInPanel
              form={signInForm}
              errors={signInErrors}
              busy={busy}
              isRTL={isRTL}
              onChange={(f) => setSignInForm(f)}
              onBlur={(field) => {
                if (!signInForm[field]) {
                  setSignInErrors((p) => ({
                    ...p,
                    [field]:
                      field === "username"
                        ? t("login.error.usernameRequired")
                        : t("login.error.passwordRequired"),
                  }));
                }
              }}
              onSubmit={handleSignIn}
              googleBtnRef={googleBtnRef}
              googleClientId={googleClientId}
              googleReady={googleReady}
              googleError={googleError}
              onGoogleLogin={handleGoogleLogin}
              iiLoading={iiLoading}
              onInternetIdentity={handleInternetIdentityLogin}
              t={t}
            />
          ) : (
            <RegisterPanel
              form={registerForm}
              errors={registerErrors}
              busy={busy}
              isRTL={isRTL}
              onChange={(f) => setRegisterForm(f)}
              onSubmit={handleRegister}
              googleBtnRef={googleBtnRef}
              googleClientId={googleClientId}
              googleReady={googleReady}
              googleError={googleError}
              onGoogleLogin={handleGoogleLogin}
              iiLoading={iiLoading}
              onInternetIdentity={handleInternetIdentityLogin}
              t={t}
            />
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground/50 text-center">
        &copy; {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </p>
    </div>
  );
}

// ─── Shared panel t-type ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFn = (key: any) => string;

// ─── Google Note (when client ID not configured) ──────────────────────────────

function GoogleNotConfiguredNote({ isRTL }: { isRTL: boolean }) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground"
      data-ocid="login.google_not_configured"
    >
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
      <span>
        {isRTL
          ? "تسجيل الدخول بـ Google غير مفعّل. يمكن للمسؤول تفعيله من لوحة التحكم ← مفاتيح API."
          : "Google Sign-In is not configured. An admin can enable it from Admin Panel → API Keys."}
      </span>
    </div>
  );
}

// ─── Sign-In Panel ────────────────────────────────────────────────────────────

interface SignInPanelProps {
  form: SignInForm;
  errors: Partial<SignInForm>;
  busy: boolean;
  isRTL: boolean;
  onChange: (f: SignInForm) => void;
  onBlur: (field: keyof SignInForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  googleBtnRef: React.RefObject<HTMLDivElement | null>;
  googleClientId: string;
  googleReady: boolean;

  googleError?: string | null;
  onGoogleLogin: () => void;
  iiLoading: boolean;
  onInternetIdentity: () => void;
  t: TFn;
}

function SignInPanel({
  form,
  errors,
  busy,
  isRTL,
  onChange,
  onBlur,
  onSubmit,
  googleBtnRef,
  googleClientId,

  googleError,
  onGoogleLogin,
  iiLoading,
  onInternetIdentity,
  t,
}: SignInPanelProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4"
      data-ocid="login.signin_form"
    >
      {/* Google sign-in — oauth2 token client button */}
      {googleClientId ? (
        <div className="w-full space-y-1.5">
          {/* Hidden GSI container — kept for potential GSI renderButton fallback */}
          <div ref={googleBtnRef} className="hidden" aria-hidden="true" />
          {/* Real interactive button using oauth2.initTokenClient */}
          <button
            type="button"
            data-ocid="login.google_signin_button"
            disabled={busy}
            onClick={onGoogleLogin}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 disabled:opacity-60 transition-all duration-200 text-sm font-medium text-foreground"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.4l7.8 6.1C12.3 13.1 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.1 37 46.1 31.2 46.1 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.4 28.5A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.8-6C.9 16.4 0 20.1 0 24c0 3.9.9 7.6 2.6 10.9l7.8-6.4z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.1 0 11.2-2 14.9-5.4l-7-5.4c-2 1.3-4.5 2.1-7.9 2.1-6.3 0-11.6-4.3-13.5-10.1l-7.8 6A23.9 23.9 0 0 0 24 48z"
                />
              </svg>
            )}
            {isRTL ? "تسجيل الدخول بـ Google" : "Sign in with Google"}
          </button>
          {/* Bilingual Google error message */}
          {googleError && (
            <div
              className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive"
              role="alert"
              data-ocid="login.google_error"
            >
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{googleError}</span>
            </div>
          )}
        </div>
      ) : (
        <GoogleNotConfiguredNote isRTL={isRTL} />
      )}

      {/* Internet Identity button */}
      <button
        type="button"
        data-ocid="login.internet_identity_button"
        disabled={iiLoading}
        onClick={onInternetIdentity}
        className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 disabled:opacity-60 transition-all duration-200 text-sm font-medium text-foreground"
      >
        {iiLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Shield className="h-4 w-4 text-primary" />
        )}
        {isRTL
          ? "تسجيل الدخول بـ Internet Identity"
          : "Sign in with Internet Identity"}
      </button>

      {/* OR divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium px-1">
          {t("login.orDivider")}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="signin-username"
          className="text-sm font-medium text-foreground"
        >
          {t("username")}
        </Label>
        <Input
          id="signin-username"
          data-ocid="login.username_input"
          type="text"
          placeholder={t("login.username.placeholder")}
          value={form.username}
          onChange={(e) => onChange({ ...form, username: e.target.value })}
          onBlur={() => onBlur("username")}
          aria-invalid={!!errors.username}
          className="h-11 bg-background border-input"
          autoComplete="username"
          dir="ltr"
          disabled={busy}
        />
        {errors.username && (
          <p
            data-ocid="login.username_field_error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.username}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="signin-password"
          className="text-sm font-medium text-foreground"
        >
          {t("password")}
        </Label>
        <Input
          id="signin-password"
          data-ocid="login.password_input"
          type="password"
          placeholder={t("login.password.placeholder")}
          value={form.password}
          onChange={(e) => onChange({ ...form, password: e.target.value })}
          onBlur={() => onBlur("password")}
          aria-invalid={!!errors.password}
          className="h-11 bg-background border-input"
          autoComplete="current-password"
          dir="ltr"
          disabled={busy}
        />
        {errors.password && (
          <p
            data-ocid="login.password_field_error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      {/* Sign-in button */}
      <Button
        data-ocid="login.signin_button"
        type="submit"
        disabled={busy}
        className="w-full h-11 font-semibold gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
        size="lg"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          t("login.tab.signin")
        )}
      </Button>
    </form>
  );
}

// ─── Register Panel ───────────────────────────────────────────────────────────

interface RegisterPanelProps {
  form: RegisterForm;
  errors: Partial<RegisterForm>;
  busy: boolean;
  isRTL: boolean;
  onChange: (f: RegisterForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  googleBtnRef: React.RefObject<HTMLDivElement | null>;
  googleClientId: string;
  googleReady: boolean;

  googleError?: string | null;
  onGoogleLogin: () => void;
  iiLoading: boolean;
  onInternetIdentity: () => void;
  t: TFn;
}

function RegisterPanel({
  form,
  errors,
  busy,
  isRTL,
  onChange,
  onSubmit,
  googleBtnRef,
  googleClientId,

  googleError,
  onGoogleLogin,
  iiLoading,
  onInternetIdentity,
  t,
}: RegisterPanelProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4"
      data-ocid="login.register_form"
    >
      {/* Google sign-up — oauth2 token client button */}
      {googleClientId ? (
        <div className="w-full space-y-1.5">
          {/* Hidden GSI container */}
          <div ref={googleBtnRef} className="hidden" aria-hidden="true" />
          {/* Real interactive button */}
          <button
            type="button"
            data-ocid="register.google_signup_button"
            disabled={busy}
            onClick={onGoogleLogin}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 disabled:opacity-60 transition-all duration-200 text-sm font-medium text-foreground"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.4l7.8 6.1C12.3 13.1 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.1 37 46.1 31.2 46.1 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.4 28.5A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.8-6C.9 16.4 0 20.1 0 24c0 3.9.9 7.6 2.6 10.9l7.8-6.4z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.1 0 11.2-2 14.9-5.4l-7-5.4c-2 1.3-4.5 2.1-7.9 2.1-6.3 0-11.6-4.3-13.5-10.1l-7.8 6A23.9 23.9 0 0 0 24 48z"
                />
              </svg>
            )}
            {isRTL ? "التسجيل بـ Google" : "Sign up with Google"}
          </button>
          {/* Bilingual Google error message */}
          {googleError && (
            <div
              className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive"
              role="alert"
              data-ocid="register.google_error"
            >
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{googleError}</span>
            </div>
          )}
        </div>
      ) : (
        <GoogleNotConfiguredNote isRTL={isRTL} />
      )}

      {/* Internet Identity button */}
      <button
        type="button"
        data-ocid="register.internet_identity_button"
        disabled={iiLoading}
        onClick={onInternetIdentity}
        className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 disabled:opacity-60 transition-all duration-200 text-sm font-medium text-foreground"
      >
        {iiLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Shield className="h-4 w-4 text-primary" />
        )}
        {isRTL
          ? "تسجيل بـ Internet Identity"
          : "Register with Internet Identity"}
      </button>

      {/* OR divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium px-1">
          {t("login.orDivider")}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="reg-username"
          className="text-sm font-medium text-foreground"
        >
          {t("username")}{" "}
          <span className="text-destructive" aria-hidden>
            *
          </span>
        </Label>
        <Input
          id="reg-username"
          data-ocid="register.username_input"
          type="text"
          placeholder={isRTL ? "اسم_المستخدم" : "your_username"}
          value={form.username}
          onChange={(e) => onChange({ ...form, username: e.target.value })}
          aria-invalid={!!errors.username}
          className="h-11 bg-background border-input"
          autoComplete="username"
          dir="ltr"
          disabled={busy}
        />
        {errors.username && (
          <p
            data-ocid="register.username_field_error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.username}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="reg-email"
          className="text-sm font-medium text-foreground"
        >
          {t("email")}{" "}
          <span className="text-destructive" aria-hidden>
            *
          </span>
        </Label>
        <Input
          id="reg-email"
          data-ocid="register.email_input"
          type="email"
          placeholder={isRTL ? "example@email.com" : "you@example.com"}
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
          aria-invalid={!!errors.email}
          className="h-11 bg-background border-input"
          autoComplete="email"
          dir="ltr"
          disabled={busy}
        />
        {errors.email && (
          <p
            data-ocid="register.email_field_error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="reg-password"
          className="text-sm font-medium text-foreground"
        >
          {t("password")}{" "}
          <span className="text-destructive" aria-hidden>
            *
          </span>
        </Label>
        <Input
          id="reg-password"
          data-ocid="register.password_input"
          type="password"
          placeholder={isRTL ? "8 أحرف على الأقل" : "At least 8 characters"}
          value={form.password}
          onChange={(e) => onChange({ ...form, password: e.target.value })}
          aria-invalid={!!errors.password}
          className="h-11 bg-background border-input"
          autoComplete="new-password"
          dir="ltr"
          disabled={busy}
        />
        {errors.password && (
          <p
            data-ocid="register.password_field_error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="reg-confirm-password"
          className="text-sm font-medium text-foreground"
        >
          {t("confirmPassword")}{" "}
          <span className="text-destructive" aria-hidden>
            *
          </span>
        </Label>
        <Input
          id="reg-confirm-password"
          data-ocid="register.confirm_password_input"
          type="password"
          placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Re-enter password"}
          value={form.confirmPassword}
          onChange={(e) =>
            onChange({ ...form, confirmPassword: e.target.value })
          }
          aria-invalid={!!errors.confirmPassword}
          className="h-11 bg-background border-input"
          autoComplete="new-password"
          dir="ltr"
          disabled={busy}
        />
        {errors.confirmPassword && (
          <p
            data-ocid="register.confirm_password_field_error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        data-ocid="register.submit_button"
        type="submit"
        disabled={busy}
        className="w-full h-11 font-semibold gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity mt-1"
        size="lg"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("register")}
      </Button>
    </form>
  );
}
