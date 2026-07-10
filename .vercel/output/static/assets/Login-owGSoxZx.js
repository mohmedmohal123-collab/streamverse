import { u as useTranslation, A as useAuth, b as useActor, a as useNavigate, r as reactExports, ac as getGoogleClientId, ah as setGoogleClientId, v as ue, j as jsxRuntimeExports, Z as Zap, ak as isKnownAdmin, al as cacheAdminCredentials, D as Shield, B as Button } from "./index-B4P1PGaK.js";
import { C as Card, a as CardContent } from "./card-GJqfMiND.js";
import { I as Input } from "./input-DsF85mHK.js";
import { L as Label } from "./label-DLTocRv1.js";
import { P as Play } from "./play-BCFueK3b.js";
import { L as Loader } from "./loader-BwyIGfQg.js";
import { I as Info } from "./info-Dl9FkbIU.js";
function generateSalt() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function loadGSI() {
  return new Promise((resolve) => {
    var _a, _b, _c, _d;
    if (((_b = (_a = window.google) == null ? void 0 : _a.accounts) == null ? void 0 : _b.oauth2) || ((_d = (_c = window.google) == null ? void 0 : _c.accounts) == null ? void 0 : _d.id)) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="gsi/client"]');
    if (existing) {
      const poll = setInterval(() => {
        var _a2, _b2, _c2, _d2;
        if (((_b2 = (_a2 = window.google) == null ? void 0 : _a2.accounts) == null ? void 0 : _b2.oauth2) || ((_d2 = (_c2 = window.google) == null ? void 0 : _c2.accounts) == null ? void 0 : _d2.id)) {
          clearInterval(poll);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        var _a2, _b2;
        clearInterval(poll);
        resolve(!!((_b2 = (_a2 = window.google) == null ? void 0 : _a2.accounts) == null ? void 0 : _b2.oauth2));
      }, 5e3);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      var _a2, _b2;
      return resolve(!!((_b2 = (_a2 = window.google) == null ? void 0 : _a2.accounts) == null ? void 0 : _b2.oauth2));
    };
    script.onerror = () => {
      console.warn("[Google] GSI script failed to load — likely WebView or network issue");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}
function isWebView() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /; wv\)/i.test(ua) || /Android.*;.*;.*\sChrome\/[\d.]+\sMobile/i.test(ua) && !/Chrome\/[\d.]+\sMobile\sSafari/i.test(ua) || /Median/i.test(ua) || /; android/i.test(ua) && /wv/i.test(ua);
}
function getGoogleRedirectUri() {
  return `${window.location.origin}/login`;
}
function Login() {
  const { t, isRTL } = useTranslation();
  const {
    setCredentialAuthenticated,
    persistGoogleSession,
    checkIsAdmin,
    loginWithInternetIdentity
  } = useAuth();
  const actorState = useActor();
  const actor = actorState.actor;
  const navigate = useNavigate();
  const [googleClientId, setGoogleClientId$1] = reactExports.useState(() => {
    return getGoogleClientId() || "";
  });
  const [googleError, setGoogleError] = reactExports.useState(null);
  const [tab, setTab] = reactExports.useState("signin");
  const [busy, setBusy] = reactExports.useState(false);
  const [signInForm, setSignInForm] = reactExports.useState({
    username: "",
    password: ""
  });
  const [registerForm, setRegisterForm] = reactExports.useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [signInErrors, setSignInErrors] = reactExports.useState({});
  const [registerErrors, setRegisterErrors] = reactExports.useState(
    {}
  );
  const googleBtnRef = reactExports.useRef(null);
  const [googleReady, setGoogleReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const stored = getGoogleClientId();
    if (stored) {
      setGoogleClientId$1(stored);
    }
    fetch("/api/settings/public").then((res) => res.ok ? res.json() : null).then((data) => {
      var _a;
      if ((_a = data == null ? void 0 : data.settings) == null ? void 0 : _a.google_client_id) {
        setGoogleClientId$1(data.settings.google_client_id);
        setGoogleClientId(data.settings.google_client_id);
      }
    }).catch(() => {
    });
  }, []);
  const [isWebViewEnv] = reactExports.useState(() => isWebView());
  reactExports.useEffect(() => {
    if (!googleClientId || isWebViewEnv) {
      setGoogleReady(false);
      return;
    }
    let cancelled = false;
    loadGSI().then((loaded) => {
      if (!cancelled) setGoogleReady(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [googleClientId, isWebViewEnv]);
  const [iiLoading, setIiLoading] = reactExports.useState(false);
  async function handleInternetIdentityLogin() {
    setIiLoading(true);
    try {
      await loginWithInternetIdentity();
      ue.success(
        isRTL ? "تم تسجيل الدخول بـ Internet Identity" : "Signed in with Internet Identity"
      );
      navigate({ to: "/" });
    } catch (err) {
      console.error("Internet Identity login error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      const isUserCancel = msg.includes("UserInterrupt") || msg.includes("cancel") || msg.includes("closed");
      if (!isUserCancel) {
        ue.error(
          isRTL ? "تعذر تسجيل الدخول بـ Internet Identity. حاول مرة أخرى." : "Internet Identity login failed. Please try again."
        );
      }
    } finally {
      setIiLoading(false);
    }
  }
  async function handleGoogleLogin() {
    var _a, _b, _c, _d;
    if (!googleClientId) {
      setGoogleError(
        isRTL ? "Google Sign-In غير مفعّل. يمكن للمسؤول تفعيله من لوحة التحكم." : "Google Sign-In is not configured. An admin can enable it from the Admin Panel."
      );
      return;
    }
    if (isWebViewEnv || !googleReady) {
      handleGoogleRedirectLogin();
      return;
    }
    if (!((_b = (_a = window.google) == null ? void 0 : _a.accounts) == null ? void 0 : _b.oauth2)) {
      const loaded = await loadGSI();
      if (!loaded || !((_d = (_c = window.google) == null ? void 0 : _c.accounts) == null ? void 0 : _d.oauth2)) {
        handleGoogleRedirectLogin();
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
          var _a2, _b2, _c2;
          if (tokenResponse.error) {
            console.error("Google OAuth error:", tokenResponse);
            const isPopupBlocked = tokenResponse.error === "popup_failed_to_open" || tokenResponse.error === "popup_closed_by_user";
            setGoogleError(
              isRTL ? isPopupBlocked ? "تعذر تسجيل الدخول بجوجل. تأكد من السماح بالنوافذ المنبثقة في المتصفح وأعد المحاولة." : "تعذر تسجيل الدخول بجوجل. تحقق من إعدادات حسابك وأعد المحاولة." : isPopupBlocked ? "Google login failed. Please allow popups and try again." : "Google login failed. Check your account settings and try again."
            );
            ue.error(
              isRTL ? "تعذر تسجيل الدخول بجوجل. تأكد من السماح بالنوافذ المنبثقة." : "Google login failed. Please allow popups and try again."
            );
            setBusy(false);
            return;
          }
          if (!tokenResponse.access_token) {
            setGoogleError(
              isRTL ? "لم يتم الحصول على رمز الوصول من Google." : "No access token received from Google."
            );
            setBusy(false);
            return;
          }
          try {
            const googleRes = await fetch("/api/auth/verify-google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: tokenResponse.access_token })
            });
            const result = await googleRes.json();
            if (result.__kind__ === "ok" && result.ok) {
              const username = ((_a2 = result.ok.user) == null ? void 0 : _a2.displayName) || ((_b2 = result.ok.user) == null ? void 0 : _b2.email) || "Google User";
              const admin = ((_c2 = result.ok.user) == null ? void 0 : _c2.role) === "admin";
              persistGoogleSession(result.ok.userId, username, admin);
              if (result.ok.token) {
                localStorage.setItem("streamverse_jwt_token", result.ok.token);
              }
              ue.success(
                isRTL ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!"
              );
              navigate({ to: admin ? "/admin" : "/" });
              return;
            } else {
              throw new Error(result.err || "Backend verification failed");
            }
          } catch (backendErr) {
            console.error("[Google] Backend verification failed:", backendErr);
            setGoogleError(
              isRTL ? "فشل التحقق من حساب Google. حاول مرة أخرى." : "Google verification failed. Please try again."
            );
            ue.error(
              isRTL ? "تعذر تسجيل الدخول بجوجل." : "Google login failed."
            );
          } finally {
            setBusy(false);
          }
        },
        error_callback: (err) => {
          console.error("Google OAuth2 error_callback:", err);
          setGoogleError(
            isRTL ? "تعذر تسجيل الدخول بجوجل. تأكد من السماح بالنوافذ المنبثقة وأعد المحاولة." : "Google login failed. Please allow popups and try again."
          );
          ue.error(
            isRTL ? "تعذر تسجيل الدخول بجوجل." : "Google login failed."
          );
          setBusy(false);
        }
      });
      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err) {
      console.error("[Google] handleGoogleLogin error:", err);
      handleGoogleRedirectLogin();
    }
  }
  function handleGoogleRedirectLogin() {
    if (!googleClientId) {
      setGoogleError(
        isRTL ? "Google Sign-In غير مفعّل." : "Google Sign-In is not configured."
      );
      return;
    }
    const redirectUri = getGoogleRedirectUri();
    const scope = "email profile openid";
    const responseType = "token";
    const state = `streamverse_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("google_oauth_state", state);
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", googleClientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", responseType);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("prompt", "select_account");
    window.location.href = authUrl.toString();
  }
  reactExports.useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const state = params.get("state");
    const error = params.get("error");
    window.history.replaceState(null, "", window.location.pathname);
    if (error) {
      setGoogleError(
        isRTL ? `خطأ في Google: ${error}` : `Google error: ${error}`
      );
      return;
    }
    if (!accessToken) return;
    const savedState = sessionStorage.getItem("google_oauth_state");
    sessionStorage.removeItem("google_oauth_state");
    if (state && savedState && state !== savedState) {
      setGoogleError(
        isRTL ? "خطأ في التحقق من Google OAuth." : "Google OAuth state mismatch."
      );
      return;
    }
    setBusy(true);
    fetch("/api/auth/verify-google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: accessToken })
    }).then((res) => res.json()).then((result) => {
      var _a, _b, _c;
      if (result.__kind__ === "ok" && result.ok) {
        const username = ((_a = result.ok.user) == null ? void 0 : _a.displayName) || ((_b = result.ok.user) == null ? void 0 : _b.email) || "Google User";
        const admin = ((_c = result.ok.user) == null ? void 0 : _c.role) === "admin";
        persistGoogleSession(result.ok.userId, username, admin);
        if (result.ok.token) {
          localStorage.setItem("streamverse_jwt_token", result.ok.token);
        }
        ue.success(
          isRTL ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!"
        );
        navigate({ to: admin ? "/admin" : "/" });
      } else {
        throw new Error(result.err || "Verification failed");
      }
    }).catch((err) => {
      console.error("[Google] Redirect callback verification failed:", err);
      setGoogleError(
        isRTL ? "فشل تسجيل الدخول بـ Google. حاول مرة أخرى." : "Google login failed. Please try again."
      );
      ue.error(
        isRTL ? "تعذر تسجيل الدخول بجوجل." : "Google login failed."
      );
    }).finally(() => setBusy(false));
  }, [persistGoogleSession, navigate, isRTL]);
  function validateSignIn() {
    const errs = {};
    if (!signInForm.username.trim())
      errs.username = t("login.error.usernameRequired");
    if (!signInForm.password) errs.password = t("login.error.passwordRequired");
    setSignInErrors(errs);
    return Object.keys(errs).length === 0;
  }
  async function handleSignIn(e) {
    var _a, _b, _c;
    e.preventDefault();
    console.log("LOGIN CLICKED");
    console.log("actor =", actor);
    if (!validateSignIn() || !actor) {
      return;
    }
    setBusy(true);
    const username = signInForm.username.trim();
    try {
      const saltRes = await fetch(`/api/auth/salt/${username}`);
      const saltData = await saltRes.json();
      const salt = saltData.__kind__ === "ok" ? saltData.ok : null;
      if (salt === null) {
        setSignInErrors({
          username: isRTL ? "اسم المستخدم غير موجود" : t("login.error.userNotFound")
        });
        setBusy(false);
        return;
      }
      const passwordHash = await hashPassword(signInForm.password, salt);
      if (isKnownAdmin(username)) cacheAdminCredentials(username, passwordHash);
      const loginRes = await fetch("/api/auth/login/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, passwordHash })
      });
      const result = await loginRes.json();
      if (result.__kind__ === "ok") {
        if ((_a = result.ok) == null ? void 0 : _a.token) {
          localStorage.setItem("streamverse_jwt_token", result.ok.token);
        }
        setCredentialAuthenticated(true, username);
        const admin = ((_c = (_b = result.ok) == null ? void 0 : _b.user) == null ? void 0 : _c.role) === "admin" || await checkIsAdmin(username);
        ue.success(
          isRTL ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!"
        );
        navigate({ to: admin ? "/admin" : "/" });
      } else {
        setCredentialAuthenticated(false);
        const msg = result.err ?? "";
        if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("wrong")) {
          setSignInErrors({
            password: isRTL ? "كلمة المرور غير صحيحة" : t("login.error.wrongPassword")
          });
        } else {
          setSignInErrors({
            username: isRTL ? "اسم المستخدم غير موجود" : t("login.error.userNotFound")
          });
        }
      }
    } catch (e2) {
      console.error("[Login] credential login error:", e2);
      setCredentialAuthenticated(false);
      ue.error(
        isRTL ? "خطأ في الاتصال. حاول مجدداً." : t("login.error.networkError")
      );
    } finally {
      setBusy(false);
    }
  }
  function validateRegister() {
    const errs = {};
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
  async function handleRegister(e) {
    e.preventDefault();
    if (!validateRegister() || !actor) return;
    setBusy(true);
    try {
      const salt = generateSalt();
      const passwordHash = await hashPassword(registerForm.password, salt);
      const registerRes = await fetch("/api/auth/register/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        ue.success(
          isRTL ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!"
        );
        navigate({ to: admin ? "/admin" : "/" });
      } else {
        const errMsg = result.err ?? "";
        const isAlreadyTaken = errMsg.toLowerCase().includes("taken") || errMsg.toLowerCase().includes("already") || errMsg.toLowerCase().includes("exists");
        if (isAlreadyTaken && isKnownAdmin(registerForm.username.trim())) {
          setTab("signin");
          setSignInForm({
            username: registerForm.username.trim(),
            password: ""
          });
          ue.info(
            isRTL ? "هذا اسم المستخدم محجوز. يرجى تسجيل الدخول." : "This username is reserved. Please sign in."
          );
        } else {
          ue.error(
            errMsg || (isRTL ? "فشل التسجيل" : "Registration failed")
          );
        }
      }
    } catch {
      ue.error(t("login.error.networkError"));
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12",
      dir: isRTL ? "rtl" : "ltr",
      "data-ocid": "login.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "aria-hidden": true,
            className: "pointer-events-none fixed inset-0 overflow-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-8 flex flex-col items-center gap-3 animate-fade-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-8 w-8 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3 w-3 fill-current opacity-60" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium tracking-widest uppercase opacity-60", children: "StreamVerse" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            "data-ocid": "login.card",
            className: "relative z-10 w-full max-w-sm border-border bg-card shadow-2xl shadow-black/40 animate-fade-in",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6 pb-8 px-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex rounded-xl bg-muted/50 p-1 mb-6",
                  role: "tablist",
                  "data-ocid": "login.tabs",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        role: "tab",
                        "aria-selected": tab === "signin",
                        "data-ocid": "login.tab.signin",
                        onClick: () => setTab("signin"),
                        className: `flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${tab === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                        children: t("login.tab.signin")
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        role: "tab",
                        "aria-selected": tab === "register",
                        "data-ocid": "login.tab.register",
                        onClick: () => setTab("register"),
                        className: `flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${tab === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                        children: t("login.tab.register")
                      }
                    )
                  ]
                }
              ),
              tab === "signin" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                SignInPanel,
                {
                  form: signInForm,
                  errors: signInErrors,
                  busy,
                  isRTL,
                  onChange: (f) => setSignInForm(f),
                  onBlur: (field) => {
                    if (!signInForm[field]) {
                      setSignInErrors((p) => ({
                        ...p,
                        [field]: field === "username" ? t("login.error.usernameRequired") : t("login.error.passwordRequired")
                      }));
                    }
                  },
                  onSubmit: handleSignIn,
                  googleBtnRef,
                  googleClientId,
                  googleReady,
                  googleError,
                  onGoogleLogin: handleGoogleLogin,
                  iiLoading,
                  onInternetIdentity: handleInternetIdentityLogin,
                  t
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                RegisterPanel,
                {
                  form: registerForm,
                  errors: registerErrors,
                  busy,
                  isRTL,
                  onChange: (f) => setRegisterForm(f),
                  onSubmit: handleRegister,
                  googleBtnRef,
                  googleClientId,
                  googleReady,
                  googleError,
                  onGoogleLogin: handleGoogleLogin,
                  iiLoading,
                  onInternetIdentity: handleInternetIdentityLogin,
                  t
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-8 text-xs text-muted-foreground/50 text-center", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          ".",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:text-muted-foreground transition-colors",
              children: "Built with love using caffeine.ai"
            }
          )
        ] })
      ]
    }
  );
}
function GoogleNotConfiguredNote({ isRTL }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground",
      "data-ocid": "login.google_not_configured",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isRTL ? "تسجيل الدخول بـ Google غير مفعّل. يمكن للمسؤول تفعيله من لوحة التحكم ← مفاتيح API." : "Google Sign-In is not configured. An admin can enable it from Admin Panel → API Keys." })
      ]
    }
  );
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
  t
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit,
      noValidate: true,
      className: "flex flex-col gap-4",
      "data-ocid": "login.signin_form",
      children: [
        googleClientId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: googleBtnRef, className: "hidden", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "login.google_signin_button",
              disabled: busy,
              onClick: onGoogleLogin,
              className: "w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 disabled:opacity-60 transition-all duration-200 text-sm font-medium text-foreground",
              children: [
                busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "svg",
                  {
                    width: "18",
                    height: "18",
                    viewBox: "0 0 48 48",
                    "aria-hidden": "true",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fill: "#EA4335",
                          d: "M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.4l7.8 6.1C12.3 13.1 17.7 9.5 24 9.5z"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fill: "#4285F4",
                          d: "M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.1 37 46.1 31.2 46.1 24.5z"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fill: "#FBBC05",
                          d: "M10.4 28.5A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.8-6C.9 16.4 0 20.1 0 24c0 3.9.9 7.6 2.6 10.9l7.8-6.4z"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fill: "#34A853",
                          d: "M24 48c6.1 0 11.2-2 14.9-5.4l-7-5.4c-2 1.3-4.5 2.1-7.9 2.1-6.3 0-11.6-4.3-13.5-10.1l-7.8 6A23.9 23.9 0 0 0 24 48z"
                        }
                      )
                    ]
                  }
                ),
                isRTL ? "تسجيل الدخول بـ Google" : "Sign in with Google"
              ]
            }
          ),
          googleError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive",
              role: "alert",
              "data-ocid": "login.google_error",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 mt-0.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: googleError })
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleNotConfiguredNote, { isRTL }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "data-ocid": "login.internet_identity_button",
            disabled: iiLoading,
            onClick: onInternetIdentity,
            className: "w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 disabled:opacity-60 transition-all duration-200 text-sm font-medium text-foreground",
            children: [
              iiLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-primary" }),
              isRTL ? "تسجيل الدخول بـ Internet Identity" : "Sign in with Internet Identity"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 my-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium px-1", children: t("login.orDivider") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "signin-username",
              className: "text-sm font-medium text-foreground",
              children: t("username")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "signin-username",
              "data-ocid": "login.username_input",
              type: "text",
              placeholder: t("login.username.placeholder"),
              value: form.username,
              onChange: (e) => onChange({ ...form, username: e.target.value }),
              onBlur: () => onBlur("username"),
              "aria-invalid": !!errors.username,
              className: "h-11 bg-background border-input",
              autoComplete: "username",
              dir: "ltr",
              disabled: busy
            }
          ),
          errors.username && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "login.username_field_error",
              className: "text-xs text-destructive",
              role: "alert",
              children: errors.username
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "signin-password",
              className: "text-sm font-medium text-foreground",
              children: t("password")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "signin-password",
              "data-ocid": "login.password_input",
              type: "password",
              placeholder: t("login.password.placeholder"),
              value: form.password,
              onChange: (e) => onChange({ ...form, password: e.target.value }),
              onBlur: () => onBlur("password"),
              "aria-invalid": !!errors.password,
              className: "h-11 bg-background border-input",
              autoComplete: "current-password",
              dir: "ltr",
              disabled: busy
            }
          ),
          errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "login.password_field_error",
              className: "text-xs text-destructive",
              role: "alert",
              children: errors.password
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            "data-ocid": "login.signin_button",
            type: "submit",
            disabled: busy,
            className: "w-full h-11 font-semibold gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity",
            size: "lg",
            children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-4 w-4 animate-spin" }) : t("login.tab.signin")
          }
        )
      ]
    }
  );
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
  t
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit,
      noValidate: true,
      className: "flex flex-col gap-4",
      "data-ocid": "login.register_form",
      children: [
        googleClientId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: googleBtnRef, className: "hidden", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "register.google_signup_button",
              disabled: busy,
              onClick: onGoogleLogin,
              className: "w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 disabled:opacity-60 transition-all duration-200 text-sm font-medium text-foreground",
              children: [
                busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "svg",
                  {
                    width: "18",
                    height: "18",
                    viewBox: "0 0 48 48",
                    "aria-hidden": "true",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fill: "#EA4335",
                          d: "M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.4l7.8 6.1C12.3 13.1 17.7 9.5 24 9.5z"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fill: "#4285F4",
                          d: "M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.1 37 46.1 31.2 46.1 24.5z"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fill: "#FBBC05",
                          d: "M10.4 28.5A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.8-6C.9 16.4 0 20.1 0 24c0 3.9.9 7.6 2.6 10.9l7.8-6.4z"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fill: "#34A853",
                          d: "M24 48c6.1 0 11.2-2 14.9-5.4l-7-5.4c-2 1.3-4.5 2.1-7.9 2.1-6.3 0-11.6-4.3-13.5-10.1l-7.8 6A23.9 23.9 0 0 0 24 48z"
                        }
                      )
                    ]
                  }
                ),
                isRTL ? "التسجيل بـ Google" : "Sign up with Google"
              ]
            }
          ),
          googleError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive",
              role: "alert",
              "data-ocid": "register.google_error",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 mt-0.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: googleError })
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleNotConfiguredNote, { isRTL }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "data-ocid": "register.internet_identity_button",
            disabled: iiLoading,
            onClick: onInternetIdentity,
            className: "w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 disabled:opacity-60 transition-all duration-200 text-sm font-medium text-foreground",
            children: [
              iiLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-primary" }),
              isRTL ? "تسجيل بـ Internet Identity" : "Register with Internet Identity"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 my-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium px-1", children: t("login.orDivider") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Label,
            {
              htmlFor: "reg-username",
              className: "text-sm font-medium text-foreground",
              children: [
                t("username"),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", "aria-hidden": true, children: "*" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "reg-username",
              "data-ocid": "register.username_input",
              type: "text",
              placeholder: isRTL ? "اسم_المستخدم" : "your_username",
              value: form.username,
              onChange: (e) => onChange({ ...form, username: e.target.value }),
              "aria-invalid": !!errors.username,
              className: "h-11 bg-background border-input",
              autoComplete: "username",
              dir: "ltr",
              disabled: busy
            }
          ),
          errors.username && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "register.username_field_error",
              className: "text-xs text-destructive",
              role: "alert",
              children: errors.username
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Label,
            {
              htmlFor: "reg-email",
              className: "text-sm font-medium text-foreground",
              children: [
                t("email"),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", "aria-hidden": true, children: "*" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "reg-email",
              "data-ocid": "register.email_input",
              type: "email",
              placeholder: isRTL ? "example@email.com" : "you@example.com",
              value: form.email,
              onChange: (e) => onChange({ ...form, email: e.target.value }),
              "aria-invalid": !!errors.email,
              className: "h-11 bg-background border-input",
              autoComplete: "email",
              dir: "ltr",
              disabled: busy
            }
          ),
          errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "register.email_field_error",
              className: "text-xs text-destructive",
              role: "alert",
              children: errors.email
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Label,
            {
              htmlFor: "reg-password",
              className: "text-sm font-medium text-foreground",
              children: [
                t("password"),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", "aria-hidden": true, children: "*" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "reg-password",
              "data-ocid": "register.password_input",
              type: "password",
              placeholder: isRTL ? "8 أحرف على الأقل" : "At least 8 characters",
              value: form.password,
              onChange: (e) => onChange({ ...form, password: e.target.value }),
              "aria-invalid": !!errors.password,
              className: "h-11 bg-background border-input",
              autoComplete: "new-password",
              dir: "ltr",
              disabled: busy
            }
          ),
          errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "register.password_field_error",
              className: "text-xs text-destructive",
              role: "alert",
              children: errors.password
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Label,
            {
              htmlFor: "reg-confirm-password",
              className: "text-sm font-medium text-foreground",
              children: [
                t("confirmPassword"),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", "aria-hidden": true, children: "*" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "reg-confirm-password",
              "data-ocid": "register.confirm_password_input",
              type: "password",
              placeholder: isRTL ? "أعد إدخال كلمة المرور" : "Re-enter password",
              value: form.confirmPassword,
              onChange: (e) => onChange({ ...form, confirmPassword: e.target.value }),
              "aria-invalid": !!errors.confirmPassword,
              className: "h-11 bg-background border-input",
              autoComplete: "new-password",
              dir: "ltr",
              disabled: busy
            }
          ),
          errors.confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "register.confirm_password_field_error",
              className: "text-xs text-destructive",
              role: "alert",
              children: errors.confirmPassword
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            "data-ocid": "register.submit_button",
            type: "submit",
            disabled: busy,
            className: "w-full h-11 font-semibold gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity mt-1",
            size: "lg",
            children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-4 w-4 animate-spin" }) : t("register")
          }
        )
      ]
    }
  );
}
export {
  Login as default
};
