import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../lib/backend";
import { useTranslation } from "../lib/i18n";

interface FormData {
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string;
}

interface FormErrors {
  displayName?: string;
  username?: string;
  email?: string;
}

function validate(data: FormData, isRTL: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!data.displayName.trim()) {
    errors.displayName = isRTL
      ? "الاسم المعروض مطلوب"
      : "Display name is required";
  }
  if (!data.username.trim()) {
    errors.username = isRTL ? "اسم المستخدم مطلوب" : "Username is required";
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username.trim())) {
    errors.username = isRTL
      ? "3-20 حرف: أحرف، أرقام أو _"
      : "3-20 chars: letters, numbers, or _";
  }
  if (!data.email.trim()) {
    errors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = isRTL ? "بريد إلكتروني غير صالح" : "Invalid email address";
  }
  return errors;
}

export default function Register() {
  const { t, isRTL } = useTranslation();
  const { actor } = useActor();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    displayName: "",
    username: "",
    email: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear field error on change
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleBlur = (field: keyof FormErrors) => () => {
    const fieldErrors = validate(form, isRTL);
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(form, isRTL);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    if (!actor) {
      toast.error(isRTL ? "خطأ في الاتصال بالخادم" : "Connection error");
      return;
    }

    setSubmitting(true);
    try {
      await actor.registerUser({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        avatarUrl: form.avatarUrl.trim(),
      });
      toast.success(
        isRTL ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!",
      );
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        isRTL ? `فشل التسجيل: ${msg}` : `Registration failed: ${msg}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12"
      dir={isRTL ? "rtl" : "ltr"}
      data-ocid="register.page"
    >
      {/* Background glow decorations */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      {/* Logo mark */}
      <div className="relative mb-8 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground opacity-60">
          StreamVerse
        </span>
      </div>

      {/* Register card */}
      <Card
        data-ocid="register.card"
        className="relative z-10 w-full max-w-md border-border bg-card shadow-2xl shadow-black/40"
      >
        <CardHeader className="pb-4 pt-8 px-8 text-center space-y-1">
          <h1 className="font-display font-bold text-2xl text-foreground">
            {t("register")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "أنشئ حسابك في StreamVerse"
              : "Create your StreamVerse account"}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
            data-ocid="register.form"
          >
            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="displayName"
                className="text-sm font-medium text-foreground"
              >
                {isRTL ? "الاسم المعروض" : "Display Name"}
                <span className="text-destructive ms-1" aria-hidden>
                  *
                </span>
              </Label>
              <Input
                id="displayName"
                data-ocid="register.display_name_input"
                type="text"
                placeholder={isRTL ? "أدخل اسمك" : "Your full name"}
                value={form.displayName}
                onChange={handleChange("displayName")}
                onBlur={handleBlur("displayName")}
                aria-invalid={!!errors.displayName}
                aria-describedby={
                  errors.displayName ? "displayName-error" : undefined
                }
                className="h-11 bg-background border-input focus:border-primary"
                autoComplete="name"
              />
              {errors.displayName && (
                <p
                  id="displayName-error"
                  data-ocid="register.display_name_field_error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                {isRTL ? "اسم المستخدم" : "Username"}
                <span className="text-destructive ms-1" aria-hidden>
                  *
                </span>
              </Label>
              <Input
                id="username"
                data-ocid="register.username_input"
                type="text"
                placeholder={isRTL ? "اسم_المستخدم" : "your_username"}
                value={form.username}
                onChange={handleChange("username")}
                onBlur={handleBlur("username")}
                aria-invalid={!!errors.username}
                aria-describedby={
                  errors.username ? "username-error" : undefined
                }
                className="h-11 bg-background border-input focus:border-primary"
                autoComplete="username"
                dir="ltr"
              />
              {errors.username && (
                <p
                  id="username-error"
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
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                {isRTL ? "البريد الإلكتروني" : "Email"}
                <span className="text-destructive ms-1" aria-hidden>
                  *
                </span>
              </Label>
              <Input
                id="email"
                data-ocid="register.email_input"
                type="email"
                placeholder={isRTL ? "example@email.com" : "you@example.com"}
                value={form.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="h-11 bg-background border-input focus:border-primary"
                autoComplete="email"
                dir="ltr"
              />
              {errors.email && (
                <p
                  id="email-error"
                  data-ocid="register.email_field_error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Avatar URL (optional) */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="avatarUrl"
                className="text-sm font-medium text-foreground"
              >
                {isRTL ? "رابط الصورة الشخصية" : "Profile Picture URL"}
                <span className="text-muted-foreground text-xs ms-1.5 font-normal">
                  ({isRTL ? "اختياري" : "optional"})
                </span>
              </Label>
              <Input
                id="avatarUrl"
                data-ocid="register.avatar_url_input"
                type="url"
                placeholder="https://..."
                value={form.avatarUrl}
                onChange={handleChange("avatarUrl")}
                className="h-11 bg-background border-input focus:border-primary"
                autoComplete="photo"
                dir="ltr"
              />
            </div>

            {/* Submit */}
            <Button
              data-ocid="register.submit_button"
              type="submit"
              disabled={submitting || !actor}
              className="w-full h-12 font-semibold text-base gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity mt-1"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin me-2" />
                  {t("loading")}
                </>
              ) : (
                t("register")
              )}
            </Button>

            {/* Loading / error state */}
            {submitting && (
              <p
                data-ocid="register.loading_state"
                className="text-xs text-muted-foreground text-center"
              >
                {t("loading")}
              </p>
            )}

            {/* Back to login */}
            <p className="text-xs text-muted-foreground text-center">
              {isRTL ? (
                <>
                  لديك حساب بالفعل؟{" "}
                  <a
                    href="/login"
                    data-ocid="register.login_link"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("login")}
                  </a>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <a
                    href="/login"
                    data-ocid="register.login_link"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("login")}
                  </a>
                </>
              )}
            </p>
          </form>
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
