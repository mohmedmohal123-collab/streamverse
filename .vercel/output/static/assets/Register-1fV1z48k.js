import { u as useTranslation, b as useActor, a as useNavigate, r as reactExports, j as jsxRuntimeExports, Z as Zap, B as Button, v as ue } from "./index-B4P1PGaK.js";
import { C as Card, b as CardHeader, a as CardContent } from "./card-GJqfMiND.js";
import { I as Input } from "./input-DsF85mHK.js";
import { L as Label } from "./label-DLTocRv1.js";
import { L as LoaderCircle } from "./loader-circle-CD345DHk.js";
function validate(data, isRTL) {
  const errors = {};
  if (!data.displayName.trim()) {
    errors.displayName = isRTL ? "الاسم المعروض مطلوب" : "Display name is required";
  }
  if (!data.username.trim()) {
    errors.username = isRTL ? "اسم المستخدم مطلوب" : "Username is required";
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username.trim())) {
    errors.username = isRTL ? "3-20 حرف: أحرف، أرقام أو _" : "3-20 chars: letters, numbers, or _";
  }
  if (!data.email.trim()) {
    errors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = isRTL ? "بريد إلكتروني غير صالح" : "Invalid email address";
  }
  return errors;
}
function Register() {
  const { t, isRTL } = useTranslation();
  const { actor } = useActor();
  const navigate = useNavigate();
  const [form, setForm] = reactExports.useState({
    displayName: "",
    username: "",
    email: "",
    avatarUrl: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const [submitting, setSubmitting] = reactExports.useState(false);
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: void 0 }));
    }
  };
  const handleBlur = (field) => () => {
    const fieldErrors = validate(form, isRTL);
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate(form, isRTL);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    if (!actor) {
      ue.error(isRTL ? "خطأ في الاتصال بالخادم" : "Connection error");
      return;
    }
    setSubmitting(true);
    try {
      await actor.registerUser({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        avatarUrl: form.avatarUrl.trim()
      });
      ue.success(
        isRTL ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!"
      );
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      ue.error(
        isRTL ? `فشل التسجيل: ${msg}` : `Registration failed: ${msg}`
      );
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12",
      dir: isRTL ? "rtl" : "ltr",
      "data-ocid": "register.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "aria-hidden": true,
            className: "pointer-events-none fixed inset-0 overflow-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-8 flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-7 w-7 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium tracking-widest uppercase text-muted-foreground opacity-60", children: "StreamVerse" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Card,
          {
            "data-ocid": "register.card",
            className: "relative z-10 w-full max-w-md border-border bg-card shadow-2xl shadow-black/40",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-4 pt-8 px-8 text-center space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-2xl text-foreground", children: t("register") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: isRTL ? "أنشئ حسابك في StreamVerse" : "Create your StreamVerse account" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "px-8 pb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "form",
                {
                  onSubmit: handleSubmit,
                  noValidate: true,
                  className: "flex flex-col gap-5",
                  "data-ocid": "register.form",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Label,
                        {
                          htmlFor: "displayName",
                          className: "text-sm font-medium text-foreground",
                          children: [
                            isRTL ? "الاسم المعروض" : "Display Name",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive ms-1", "aria-hidden": true, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          id: "displayName",
                          "data-ocid": "register.display_name_input",
                          type: "text",
                          placeholder: isRTL ? "أدخل اسمك" : "Your full name",
                          value: form.displayName,
                          onChange: handleChange("displayName"),
                          onBlur: handleBlur("displayName"),
                          "aria-invalid": !!errors.displayName,
                          "aria-describedby": errors.displayName ? "displayName-error" : void 0,
                          className: "h-11 bg-background border-input focus:border-primary",
                          autoComplete: "name"
                        }
                      ),
                      errors.displayName && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          id: "displayName-error",
                          "data-ocid": "register.display_name_field_error",
                          className: "text-xs text-destructive",
                          role: "alert",
                          children: errors.displayName
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Label,
                        {
                          htmlFor: "username",
                          className: "text-sm font-medium text-foreground",
                          children: [
                            isRTL ? "اسم المستخدم" : "Username",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive ms-1", "aria-hidden": true, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          id: "username",
                          "data-ocid": "register.username_input",
                          type: "text",
                          placeholder: isRTL ? "اسم_المستخدم" : "your_username",
                          value: form.username,
                          onChange: handleChange("username"),
                          onBlur: handleBlur("username"),
                          "aria-invalid": !!errors.username,
                          "aria-describedby": errors.username ? "username-error" : void 0,
                          className: "h-11 bg-background border-input focus:border-primary",
                          autoComplete: "username",
                          dir: "ltr"
                        }
                      ),
                      errors.username && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          id: "username-error",
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
                          htmlFor: "email",
                          className: "text-sm font-medium text-foreground",
                          children: [
                            isRTL ? "البريد الإلكتروني" : "Email",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive ms-1", "aria-hidden": true, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          id: "email",
                          "data-ocid": "register.email_input",
                          type: "email",
                          placeholder: isRTL ? "example@email.com" : "you@example.com",
                          value: form.email,
                          onChange: handleChange("email"),
                          onBlur: handleBlur("email"),
                          "aria-invalid": !!errors.email,
                          "aria-describedby": errors.email ? "email-error" : void 0,
                          className: "h-11 bg-background border-input focus:border-primary",
                          autoComplete: "email",
                          dir: "ltr"
                        }
                      ),
                      errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          id: "email-error",
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
                          htmlFor: "avatarUrl",
                          className: "text-sm font-medium text-foreground",
                          children: [
                            isRTL ? "رابط الصورة الشخصية" : "Profile Picture URL",
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs ms-1.5 font-normal", children: [
                              "(",
                              isRTL ? "اختياري" : "optional",
                              ")"
                            ] })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          id: "avatarUrl",
                          "data-ocid": "register.avatar_url_input",
                          type: "url",
                          placeholder: "https://...",
                          value: form.avatarUrl,
                          onChange: handleChange("avatarUrl"),
                          className: "h-11 bg-background border-input focus:border-primary",
                          autoComplete: "photo",
                          dir: "ltr"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        "data-ocid": "register.submit_button",
                        type: "submit",
                        disabled: submitting || !actor,
                        className: "w-full h-12 font-semibold text-base gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity mt-1",
                        size: "lg",
                        children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin me-2" }),
                          t("loading")
                        ] }) : t("register")
                      }
                    ),
                    submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        "data-ocid": "register.loading_state",
                        className: "text-xs text-muted-foreground text-center",
                        children: t("loading")
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", children: isRTL ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      "لديك حساب بالفعل؟",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: "/login",
                          "data-ocid": "register.login_link",
                          className: "text-primary hover:underline font-medium",
                          children: t("login")
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      "Already have an account?",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: "/login",
                          "data-ocid": "register.login_link",
                          className: "text-primary hover:underline font-medium",
                          children: t("login")
                        }
                      )
                    ] }) })
                  ]
                }
              ) })
            ]
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
export {
  Register as default
};
