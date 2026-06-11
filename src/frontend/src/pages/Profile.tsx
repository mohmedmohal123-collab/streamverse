import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  Edit2,
  Eye,
  Facebook,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Save,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SiTiktok } from "react-icons/si";
import { toast } from "sonner";
import type { UserPublic } from "../backend.d";
import { getLocalWatchHistory } from "../components/VideoPlayer";
import { useAuth } from "../hooks/useAuth";
import { useActor } from "../lib/backend";
import { useTranslation } from "../lib/i18n";

function formatDate(ts: bigint, isRTL: boolean): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Follow Button ───────────────────────────────────────────────────────────

interface FollowButtonProps {
  targetId: { toText: () => string };
  isRTL: boolean;
}

function FollowButton({ targetId, isRTL }: FollowButtonProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: isFollowingUser = false, isLoading: checkingFollow } = useQuery(
    {
      queryKey: ["is-following", targetId.toText()],
      queryFn: async () => {
        if (!actor) return false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (actor as any).isFollowing(targetId);
      },
      enabled: !!actor,
    },
  );

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      if (isFollowingUser) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (actor as any).unfollowUser(targetId);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (actor as any).followUser(targetId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["is-following", targetId.toText()],
      });
      queryClient.invalidateQueries({
        queryKey: ["followers", targetId.toText()],
      });
      toast.success(
        isFollowingUser
          ? isRTL
            ? "تم إلغاء المتابعة"
            : "Unfollowed successfully"
          : isRTL
            ? "تمت المتابعة"
            : "Following successfully",
      );
    },
    onError: () => {
      toast.error(isRTL ? "حدث خطأ. حاول مجدداً" : "Error. Please try again.");
    },
  });

  if (checkingFollow) {
    return (
      <Skeleton
        className="h-8 w-28 rounded-full"
        data-ocid="profile.follow_loading_state"
      />
    );
  }

  return (
    <Button
      size="sm"
      data-ocid="profile.follow_button"
      onClick={() => followMutation.mutate()}
      disabled={followMutation.isPending}
      variant={isFollowingUser ? "outline" : "default"}
      className={
        isFollowingUser
          ? "gap-1.5 text-xs border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          : "gap-1.5 text-xs gradient-primary text-white border-0 shadow-glow"
      }
    >
      {followMutation.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowingUser ? (
        <>
          <UserMinus className="h-3.5 w-3.5" />
          {isRTL ? "إلغاء المتابعة" : "Unfollow"}
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          {isRTL ? "متابعة" : "Follow"}
        </>
      )}
    </Button>
  );
}

// ─── Delete Account Confirmation Modal ───────────────────────────────────────

interface DeleteAccountModalProps {
  isOpen: boolean;
  isRTL: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteAccountModal({
  isOpen,
  isRTL,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      data-ocid="profile.delete_account_dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-base">
              {isRTL ? "حذف الحساب" : "Delete Account"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRTL
                ? "هذا الإجراء لا يمكن التراجع عنه"
                : "This action cannot be undone"}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {isRTL
            ? "هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك نهائياً بما في ذلك سجل المشاهدة والتعليقات والملف الشخصي."
            : "Are you sure you want to delete your account? All your data including watch history, comments, and profile will be permanently deleted."}
        </p>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1 border-border"
            onClick={onCancel}
            disabled={isDeleting}
            data-ocid="profile.delete_account_cancel_button"
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 gap-2"
            onClick={onConfirm}
            disabled={isDeleting}
            data-ocid="profile.delete_account_confirm_button"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {isRTL ? "تأكيد الحذف" : "Confirm Delete"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Profile ────────────────────────────────────────────────────────────

export default function Profile() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    isAdmin,
    logout,
    deleteMyAccount,
  } = useAuth();
  const { t, isRTL } = useTranslation();
  const { actor: rawActor, isFetching } = useActor();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actor = rawActor as any;

  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  // Account actions state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const watchCount = getLocalWatchHistory().length;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!actor || isFetching) return;

    setIsLoadingProfile(true);
    const storedUsername =
      localStorage.getItem("streamverse_admin_username") ?? "";

    actor
      .getCallerUserProfile()
      .then((p: UserPublic | null) => {
        if (p) {
          setProfile(p);
          setDisplayName(p.displayName ?? "");
          setEmail(p.email ?? "");
          setAvatarUrl(p.avatarUrl ?? "");
          setFacebookUrl(p.facebookUrl ?? "");
          setTiktokUrl(p.tiktokUrl ?? "");
          setIsLoadingProfile(false);
        } else {
          // Caller is anonymous — look up profile by stored username
          const usernameToLookup = storedUsername;
          if (!usernameToLookup) {
            setIsLoadingProfile(false);
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const actorAny = actor as any;
          const fetchByUsername =
            typeof actorAny.getProfileByUsername === "function"
              ? (actorAny.getProfileByUsername(
                  usernameToLookup,
                ) as Promise<UserPublic | null>)
              : Promise.resolve(null);
          fetchByUsername
            .then((up: UserPublic | null) => {
              if (up) {
                setProfile(up);
                setDisplayName(up.displayName ?? "");
                setEmail(up.email ?? "");
                setAvatarUrl(up.avatarUrl ?? "");
                setFacebookUrl(up.facebookUrl ?? "");
                setTiktokUrl(up.tiktokUrl ?? "");
              } else {
                // Fallback: show username from localStorage
                setDisplayName(usernameToLookup);
              }
            })
            .catch(() => setDisplayName(usernameToLookup))
            .finally(() => setIsLoadingProfile(false));
        }
      })
      .catch(() => {
        // Never show error — always fall back to localStorage username
        if (storedUsername) setDisplayName(storedUsername);
        setIsLoadingProfile(false);
      });
  }, [actor, isFetching, isAuthenticated]);

  const { data: followers = [] } = useQuery({
    queryKey: ["followers", profile?.id?.toText() ?? ""],
    queryFn: async () => {
      if (!actor || !profile?.id) return [];
      return actor.getFollowers(profile.id);
    },
    enabled: !!actor && !!profile?.id,
  });

  const { data: following = [] } = useQuery({
    queryKey: ["following", profile?.id?.toText() ?? ""],
    queryFn: async () => {
      if (!actor || !profile?.id) return [];
      return actor.getFollowing(profile.id);
    },
    enabled: !!actor && !!profile?.id,
  });

  const handleSave = async () => {
    if (!actor) return;
    setIsSaving(true);
    try {
      await actor.updateProfile({
        displayName,
        email,
        avatarUrl,
        facebookUrl,
        tiktokUrl,
      });
      setProfile((prev: UserPublic | null) =>
        prev
          ? ({
              ...prev,
              displayName,
              email,
              avatarUrl,
              facebookUrl,
              tiktokUrl,
            } as UserPublic)
          : prev,
      );
      setEditing(false);
      toast.success(
        isRTL ? "تم حفظ الملف بنجاح" : "Profile saved successfully",
      );
    } catch {
      toast.error(isRTL ? "فشل في حفظ الملف الشخصي" : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setEmail(profile.email);
      setAvatarUrl(profile.avatarUrl ?? "");
      setFacebookUrl(profile.facebookUrl ?? "");
      setTiktokUrl(profile.tiktokUrl ?? "");
    }
    setEditing(false);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    navigate({ to: "/login" });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteMyAccount();
      toast.success(
        isRTL ? "تم حذف حسابك بنجاح" : "Account deleted successfully",
      );
      navigate({ to: "/login" });
    } catch {
      toast.error(
        isRTL
          ? "فشل حذف الحساب. حاول مجدداً."
          : "Failed to delete account. Please try again.",
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div
        className="min-h-full bg-background pb-8 overflow-y-auto"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-card border-b border-border px-4 py-4 flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <h1 className="font-display font-bold text-lg text-foreground">
            {t("profile")}
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm mx-auto px-4 pt-20 text-center space-y-5"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <User
              className="h-10 w-10 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              {isRTL ? "مرحباً بك في StreamVerse" : "Welcome to StreamVerse"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? "سجّل دخولك للوصول إلى ملفك الشخصي وسجل مشاهدتك"
                : "Sign in to access your profile and watch history"}
            </p>
          </div>
          <Button
            data-ocid="profile.login_button"
            onClick={() => navigate({ to: "/login" })}
            disabled={authLoading}
            className="gradient-primary text-white border-0 w-full max-w-xs gap-2"
          >
            <LogIn className="h-4 w-4" />
            {isRTL ? "تسجيل الدخول" : "Sign In"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full bg-background pb-8 overflow-y-auto"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-card border-b border-border px-4 py-4 flex items-center gap-3">
        <User className="h-5 w-5 text-primary" />
        <h1 className="font-display font-bold text-lg text-foreground">
          {t("profile")}
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">
        {/* Profile hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <div className="h-20 gradient-accent" />
            <CardContent className="relative px-5 pb-5 pt-0">
              <div className="-mt-10 mb-3 flex items-end justify-between">
                {isLoadingProfile || authLoading ? (
                  <Skeleton className="h-20 w-20 rounded-full" />
                ) : (
                  <Avatar className="h-20 w-20 ring-4 ring-card shadow-xl">
                    <AvatarImage
                      src={avatarUrl || profile?.avatarUrl}
                      alt={displayName || profile?.displayName}
                    />
                    <AvatarFallback className="gradient-primary text-white font-display font-bold text-xl">
                      {profile
                        ? getInitials(
                            profile.displayName || profile.username || "U",
                          )
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="flex items-center gap-2">
                  {profile?.id && !editing && !isLoadingProfile && (
                    <FollowButton targetId={profile.id} isRTL={isRTL} />
                  )}
                  {!editing && !isLoadingProfile && isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      data-ocid="profile.edit_button"
                      onClick={() => setEditing(true)}
                      className="gap-1.5 text-xs border-border"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      {t("editProfile")}
                    </Button>
                  )}
                </div>
              </div>

              {isLoadingProfile || authLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <div className="flex gap-6 mt-3">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-xl text-foreground">
                      {profile?.displayName ||
                        profile?.username ||
                        displayName ||
                        (isRTL ? "المستخدم" : "User")}
                    </h2>
                    {(profile?.role === "admin" || isAdmin) && (
                      <Badge className="text-[10px] px-1.5 py-0 gap-1 bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
                        <Shield className="h-2.5 w-2.5" />
                        {isRTL ? "مشرف" : "Admin"}
                      </Badge>
                    )}
                  </div>
                  {(profile?.username || displayName) && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      @{profile?.username || displayName}
                    </p>
                  )}

                  {/* Admin dashboard shortcut */}
                  {(profile?.role === "admin" || isAdmin) && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid="profile.admin_dashboard_button"
                        onClick={() => navigate({ to: "/admin" })}
                        className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        {isRTL ? "لوحة التحكم" : "Admin Dashboard"}
                      </Button>
                    </div>
                  )}

                  {/* Follower / following counts */}
                  <div className="flex items-center gap-5 mt-3">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      <span className="font-bold text-sm text-foreground">
                        {followers.length}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? "متابع" : "Followers"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-accent" />
                      <span className="font-bold text-sm text-foreground">
                        {following.length}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? "يتابع" : "Following"}
                      </span>
                    </div>
                  </div>

                  {/* Social links */}
                  {(profile?.facebookUrl || profile?.tiktokUrl) && !editing && (
                    <div className="flex items-center gap-3 mt-3">
                      {profile?.facebookUrl && (
                        <a
                          href={profile.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ocid="profile.facebook_link"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-4 w-4" />
                          <span>Facebook</span>
                        </a>
                      )}
                      {profile?.tiktokUrl && (
                        <a
                          href={profile.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ocid="profile.tiktok_link"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="TikTok"
                        >
                          <SiTiktok className="h-3.5 w-3.5" />
                          <span>TikTok</span>
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Watch stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-4 px-5 py-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-foreground leading-none">
                  {watchCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? "فيديو تم مشاهدته" : "Videos Watched"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base text-foreground">
                  {t("editProfile")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-displayname"
                    className="text-xs text-muted-foreground"
                  >
                    {isRTL ? "الاسم المعروض" : "Display Name"}
                  </Label>
                  <Input
                    id="profile-displayname"
                    data-ocid="profile.display_name_input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-muted/30 border-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-email"
                    className="text-xs text-muted-foreground"
                  >
                    {isRTL ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    data-ocid="profile.email_input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted/30 border-input"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-avatar"
                    className="text-xs text-muted-foreground"
                  >
                    {isRTL ? "رابط الصورة الشخصية" : "Avatar URL"}
                  </Label>
                  <Input
                    id="profile-avatar"
                    type="url"
                    data-ocid="profile.avatar_input"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-muted/30 border-input"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-facebook"
                    className="text-xs text-muted-foreground flex items-center gap-1.5"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    {t("profile.facebook")}
                  </Label>
                  <Input
                    id="profile-facebook"
                    type="url"
                    data-ocid="profile.facebook_input"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="bg-muted/30 border-input"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-tiktok"
                    className="text-xs text-muted-foreground flex items-center gap-1.5"
                  >
                    <SiTiktok className="h-3.5 w-3.5" />
                    {t("profile.tiktok")}
                  </Label>
                  <Input
                    id="profile-tiktok"
                    type="url"
                    data-ocid="profile.tiktok_input"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className="bg-muted/30 border-input"
                    dir="ltr"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    data-ocid="profile.save_button"
                    className="flex-1 gap-2 gradient-primary border-0 text-white"
                    size="sm"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        {t("save")}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="profile.cancel_button"
                    onClick={handleCancel}
                    className="gap-1.5 border-border"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Account details */}
        {!editing && !isLoadingProfile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="px-0 py-0">
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "البريد الإلكتروني" : "Email"}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.email || (isRTL ? "غير محدد" : "Not set")}
                    </p>
                  </div>
                </div>
                {profile?.createdAt !== undefined && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3 px-5 py-3.5">
                      <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "تاريخ الانضمام" : "Joined"}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(profile.createdAt, isRTL)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Account Actions ───────────────────────────────────────────── */}
        {!editing && !isLoadingProfile && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm text-foreground">
                  {isRTL ? "إجراءات الحساب" : "Account Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Sign Out */}
                <Button
                  variant="outline"
                  className="w-full gap-2 border-border text-foreground hover:bg-muted/50 justify-start h-11"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  data-ocid="profile.logout_button"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">
                    {isRTL ? "تسجيل الخروج" : "Sign Out"}
                  </span>
                </Button>

                <Separator />

                {/* Delete Account */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">
                    {isRTL
                      ? "حذف الحساب إجراء نهائي لا يمكن التراجع عنه"
                      : "Deleting your account is permanent and cannot be undone"}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 justify-start h-11"
                    onClick={() => setShowDeleteModal(true)}
                    data-ocid="profile.delete_account_button"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">
                      {isRTL ? "حذف الحساب" : "Delete Account"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        isRTL={isRTL}
        isDeleting={isDeleting}
        onConfirm={() => void handleDeleteAccount()}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
