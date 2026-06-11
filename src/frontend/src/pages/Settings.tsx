import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Bell,
  Globe,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Language, UserSettings, backendInterface } from "../backend.d";
import { useAuth } from "../hooks/useAuth";
import {
  getPushPermissionStatus,
  requestPushPermission,
} from "../hooks/useNotifications";
import { useTheme } from "../hooks/useTheme";
import { useActor } from "../lib/backend";
import { useTranslation } from "../lib/i18n";

export default function Settings() {
  const { t, isRTL, language, setLanguage } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as unknown as backendInterface | null;

  const [pushPermission, setPushPermission] = useState<string>(() =>
    getPushPermissionStatus(),
  );
  const [isRequestingPush, setIsRequestingPush] = useState(false);

  const [isSavingLang, setIsSavingLang] = useState(false);

  const handleEnablePush = async () => {
    setIsRequestingPush(true);
    try {
      const sub = await requestPushPermission();
      if (sub) {
        setPushPermission("granted");
        toast.success(
          isRTL ? "✓ تم تفعيل الإشعارات!" : "✓ Push notifications enabled!",
        );
      } else {
        toast.error(
          isRTL
            ? "تعذّر تفعيل الإشعارات. تأكد من منح الإذن في إعدادات المتصفح"
            : "Failed to enable notifications. Check browser permissions.",
        );
      }
    } finally {
      setIsRequestingPush(false);
      setPushPermission(getPushPermissionStatus());
    }
  };

  const handleLanguageChange = async (lang: "en" | "ar") => {
    setLanguage(lang);
    // Persist to backend if authenticated
    if (actor && !isFetching && isAuthenticated) {
      setIsSavingLang(true);
      try {
        const settings: UserSettings = {
          language: lang as Language,
          darkMode: isDark,
        };
        await actor.updateSettings(settings);
      } catch {
        // Best-effort — language is already updated in local store
      } finally {
        setIsSavingLang(false);
      }
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleDeleteAccount = () => {
    toast.error(
      isRTL
        ? "ميزة حذف الحساب غير متاحة حالياً"
        : "Account deletion is not available yet",
    );
  };

  return (
    <div
      className="min-h-full bg-background pb-20 md:pb-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Page header */}
      <div className="bg-card border-b border-border px-4 py-4 flex items-center gap-3">
        <SettingsIcon className="h-5 w-5 text-primary" />
        <h1 className="font-display font-bold text-lg text-foreground">
          {t("settings")}
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">
        {/* Language section */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">
                {t("language")}
              </h2>
            </div>
            {isSavingLang && (
              <span className="text-xs text-muted-foreground animate-pulse">
                {t("loading")}
              </span>
            )}
          </div>

          <div className="p-3 flex gap-3">
            <button
              type="button"
              data-ocid="settings.language_en_button"
              onClick={() => void handleLanguageChange("en")}
              className={cn(
                "flex-1 py-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                language === "en"
                  ? "border-primary bg-primary/12 text-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span aria-hidden>🇬🇧</span> English
            </button>
            <button
              type="button"
              data-ocid="settings.language_ar_button"
              onClick={() => void handleLanguageChange("ar")}
              className={cn(
                "flex-1 py-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                language === "ar"
                  ? "border-primary bg-primary/12 text-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span aria-hidden>🇸🇦</span> العربية
            </button>
          </div>
        </motion.div>

        {/* Theme section */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-sm text-foreground">
              {t("theme")}
            </h2>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                  isDark ? "bg-primary/15" : "bg-amber-500/15",
                )}
              >
                {isDark ? (
                  <Moon className="h-4.5 w-4.5 text-primary" />
                ) : (
                  <Sun className="h-4.5 w-4.5 text-amber-500" />
                )}
              </div>
              <div>
                <Label
                  htmlFor="dark-mode-switch"
                  className="text-sm text-foreground font-medium cursor-pointer"
                >
                  {isDark ? t("darkMode") : t("lightMode")}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isDark
                    ? isRTL
                      ? "تجربة مظلمة مريحة للعيون"
                      : "Easy on the eyes, perfect for night use"
                    : isRTL
                      ? "واجهة مضيئة وواضحة"
                      : "Clean and bright interface"}
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode-switch"
              data-ocid="settings.dark_mode_switch"
              checked={isDark}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </motion.div>

        {/* Account section — only when authenticated */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">
                {isRTL ? "الحساب" : "Account"}
              </h2>
            </div>

            {/* Principal ID — not available without Internet Identity */}

            <Separator />

            {/* Sign out */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("logout")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL
                    ? "سيتم تسجيل خروجك من جميع الأجهزة"
                    : "Sign out from all sessions"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                data-ocid="settings.logout_button"
                onClick={logout}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/40"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </Button>
            </div>

            <Separator />

            {/* Delete account */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isRTL ? "حذف الحساب" : "Delete Account"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL
                    ? "إجراء لا يمكن التراجع عنه"
                    : "This action cannot be undone"}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-ocid="settings.delete_account_button"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/40"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="settings.delete_dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isRTL ? "حذف الحساب" : "Delete Account"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isRTL
                        ? "هل أنت متأكد أنك تريد حذف حسابك؟ سيتم فقدان جميع بياناتك بشكل نهائي ولا يمكن التراجع عن هذا."
                        : "Are you sure you want to delete your account? All your data will be permanently lost and this action cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="settings.cancel_button">
                      {t("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-ocid="settings.confirm_button"
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        )}

        {/* Push Notifications section */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-sm text-foreground">
              {isRTL ? "الإشعارات الفورية" : "Push Notifications"}
            </h2>
          </div>
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {isRTL
                  ? "تفعيل الإشعارات الفورية"
                  : "Enable push notifications"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pushPermission === "granted"
                  ? isRTL
                    ? "✓ الإشعارات مفعلة"
                    : "✓ Notifications are enabled"
                  : pushPermission === "denied"
                    ? isRTL
                      ? "تم رفض الإشعارات - يمكنك تغييرها من إعدادات المتصفح"
                      : "Notifications blocked — change in browser settings"
                    : isRTL
                      ? "احصل على إشعارات حتى عند إغلاق التطبيق"
                      : "Get notified even when the app is closed"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              data-ocid="settings.push_notifications_button"
              disabled={
                isRequestingPush ||
                pushPermission === "denied" ||
                pushPermission === "unsupported"
              }
              onClick={() => void handleEnablePush()}
              className={
                pushPermission === "granted"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                  : "gradient-primary text-white border-0"
              }
            >
              {isRequestingPush ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : pushPermission === "granted" ? (
                isRTL ? (
                  "مفعلة"
                ) : (
                  "Enabled"
                )
              ) : isRTL ? (
                "تفعيل"
              ) : (
                "Enable"
              )}
            </Button>
          </div>
        </motion.div>

        {/* About / App info */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 space-y-3">
            <h2 className="font-display font-semibold text-sm text-foreground">
              {isRTL ? "عن التطبيق" : "About"}
            </h2>
            <Separator />
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {isRTL ? "الإصدار" : "Version"}
                </span>
                <span className="font-mono text-xs text-foreground bg-muted/50 px-2 py-0.5 rounded">
                  1.0.0
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {isRTL ? "المنصة" : "Platform"}
                </span>
                <span className="text-foreground text-xs font-medium">
                  Internet Computer
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {isRTL ? "التقنية" : "Tech"}
                </span>
                <span className="text-foreground text-xs font-medium">
                  React + Motoko
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/60 text-center pt-2 pb-4">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
