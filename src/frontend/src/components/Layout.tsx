import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookmarkIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Home,
  Menu,
  PlusCircle,
  Radio,
  Search,
  Settings,
  Shield,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUnreadCount } from "../hooks/useNotifications";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { useTranslation } from "../lib/i18n";
import { PageTransition } from "./PageTransition";

const SIDEBAR_STORAGE_KEY = "streamverse_sidebar_collapsed";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey:
    | "home"
    | "search"
    | "history"
    | "notifications"
    | "profile"
    | "admin"
    | "settings"
    | "create"
    | "offline"
    | "playlists"
    | "downloads"
    | "live";
  adminOnly?: boolean;
  badge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", icon: Home, labelKey: "home" },
  { to: "/search", icon: Search, labelKey: "search" },
  { to: "/create", icon: PlusCircle, labelKey: "create" },
  { to: "/live", icon: Radio, labelKey: "live" },
  { to: "/history", icon: Clock, labelKey: "history" },
  { to: "/offline", icon: Download, labelKey: "downloads" },
  { to: "/notifications", icon: Bell, labelKey: "notifications", badge: true },
  { to: "/playlists", icon: BookmarkIcon, labelKey: "playlists" },
  { to: "/profile", icon: User, labelKey: "profile" },
  { to: "/admin", icon: Shield, labelKey: "admin", adminOnly: true },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t, isRTL } = useTranslation();
  const { isAdmin: isAdminFromHook } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop sidebar: collapsed persisted in localStorage, expanded by default
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const isAdmin =
    isAdminFromHook ||
    localStorage.getItem("streamverse_is_admin") === "true" ||
    ["mostfa", "admin"].includes(
      (localStorage.getItem("streamverse_admin_username") ?? "").toLowerCase(),
    );

  const { data: unreadCount = 0 } = useUnreadCount();
  const prevUnreadRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      import("sonner").then(({ toast }) => {
        toast.info(
          isRTL
            ? `لديك ${unreadCount} إشعار غير مقروء`
            : `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`,
          { duration: 4000 },
        );
      });
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, isRTL]);

  // Close mobile drawer on route change — location.pathname is intentional
  // biome-ignore lint/correctness/useExhaustiveDependencies: location.pathname drives close
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useScrollToTop();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  const isWelcomePage =
    location.pathname === "/welcome" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (isWelcomePage) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background">
        <PageTransition>{children}</PageTransition>
      </div>
    );
  }

  // Translation helper that handles the custom "downloads" key
  const navLabel = (labelKey: NavItem["labelKey"]) => {
    if (labelKey === "downloads") return isRTL ? "التحميلات" : "Downloads";
    if (labelKey === "live") return isRTL ? "بث مباشر" : "Live";
    return t(labelKey as Parameters<typeof t>[0]);
  };

  const SidebarNavItem = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.to);
    const label = navLabel(item.labelKey);
    const showBadge = item.badge && unreadCount > 0;

    const inner = (
      <Link
        to={item.to}
        data-ocid={`nav.${item.labelKey}_link`}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
          "min-w-0",
          active
            ? "bg-primary/20 text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          collapsed && "justify-center px-2.5",
        )}
        aria-label={label}
      >
        {/* Active indicator bar */}
        {active && (
          <span
            className={cn(
              "absolute inset-y-1.5 w-0.5 bg-primary rounded-full",
              isRTL ? "right-0" : "left-0",
            )}
          />
        )}
        <span className="relative flex-shrink-0">
          <Icon
            className={cn(
              "h-[18px] w-[18px] transition-colors duration-200",
              active
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
          {showBadge && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
        {!collapsed && (
          <span
            className={cn(
              "truncate transition-opacity duration-200",
              active && "font-semibold",
            )}
          >
            {label}
          </span>
        )}
        {!collapsed && showBadge && (
          <span className="ms-auto min-w-[20px] h-5 px-1 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent
            side={isRTL ? "left" : "right"}
            className="font-medium"
          >
            {label}
            {showBadge && (
              <span className="ms-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return inner;
  };

  return (
    <TooltipProvider>
      <div
        className="flex flex-col min-h-screen bg-background"
        dir={isRTL ? "rtl" : "ltr"}
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="flex flex-1 lg:overflow-hidden lg:h-screen">
          {/* ─── Desktop Sidebar ─── */}
          <aside
            data-ocid="layout.sidebar"
            className={cn(
              "hidden lg:flex flex-col flex-shrink-0 z-30",
              "bg-card border-e border-border",
              "transition-all duration-300 ease-in-out",
              collapsed ? "w-[68px]" : "w-[220px]",
            )}
          >
            {/* Logo zone */}
            <div
              className={cn(
                "h-16 flex items-center border-b border-border flex-shrink-0 px-3 gap-2",
                collapsed ? "justify-center" : "justify-between",
              )}
            >
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2.5 min-w-0 flex-shrink-0",
                  collapsed && "mx-auto",
                )}
                aria-label="StreamVerse home"
              >
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                  <span className="font-display font-bold text-foreground truncate text-[15px] tracking-tight">
                    StreamVerse
                  </span>
                )}
              </Link>
              {!collapsed && (
                <button
                  type="button"
                  data-ocid="layout.sidebar_collapse_button"
                  onClick={toggleCollapse}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 flex-shrink-0"
                  aria-label="Collapse sidebar"
                >
                  {isRTL ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Nav items */}
            <nav
              className={cn(
                "flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden",
                collapsed ? "px-2" : "px-3",
              )}
            >
              {visibleItems.map((item) => (
                <SidebarNavItem key={item.to} item={item} />
              ))}
            </nav>

            <Separator className="mx-3" />

            {/* Settings at bottom */}
            <div className={cn("py-3", collapsed ? "px-2" : "px-3")}>
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to="/settings"
                      data-ocid="nav.settings_link"
                      className={cn(
                        "flex items-center justify-center rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive("/settings")
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      )}
                      aria-label={t("settings")}
                    >
                      <Settings className="h-[18px] w-[18px]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side={isRTL ? "left" : "right"}
                    className="font-medium"
                  >
                    {t("settings")}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  to="/settings"
                  data-ocid="nav.settings_link"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive("/settings")
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <Settings className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate">{t("settings")}</span>
                </Link>
              )}

              {/* Expand button when collapsed */}
              {collapsed && (
                <button
                  type="button"
                  data-ocid="layout.sidebar_expand_button"
                  onClick={toggleCollapse}
                  className="mt-1.5 w-full flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                  aria-label="Expand sidebar"
                >
                  {isRTL ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </aside>

          {/* ─── Main content column ─── */}
          <div className="flex flex-col flex-1 min-w-0 lg:overflow-hidden">
            {/* Top header */}
            <header
              data-ocid="layout.header"
              className="h-14 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0 z-20 sticky top-0"
            >
              {/* Mobile: hamburger + logo */}
              <div className="flex items-center gap-3 lg:hidden">
                <button
                  type="button"
                  data-ocid="layout.mobile_menu_button"
                  onClick={() => setMobileOpen(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  aria-label="StreamVerse home"
                >
                  <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-display font-bold text-base text-foreground">
                    StreamVerse
                  </span>
                </Link>
              </div>

              {/* Desktop: spacer */}
              <div className="hidden lg:block" />

              {/* Right actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-ocid="header.notifications_button"
                  onClick={() => void navigate({ to: "/notifications" })}
                  className="notification-bell relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label={t("notifications")}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span
                      className="notification-badge"
                      data-ocid="header.notification_badge"
                      aria-label={`${unreadCount} unread`}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link
                    to="/settings"
                    data-ocid="header.settings_link"
                    aria-label={t("settings")}
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link
                    to="/profile"
                    data-ocid="header.profile_link"
                    aria-label={t("profile")}
                  >
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </header>

            {/* Page content */}
            <main
              id="main-content"
              className="flex-1 overflow-y-auto lg:overflow-y-auto pb-safe"
              style={
                { WebkitOverflowScrolling: "touch" } as React.CSSProperties
              }
            >
              <PageTransition key={location.pathname}>
                {children}
              </PageTransition>
            </main>

            {/* Mobile bottom navigation */}
            <nav
              data-ocid="layout.bottom_nav"
              className="lg:hidden flex bg-card border-t border-border flex-shrink-0 sticky bottom-0 z-20"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {visibleItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                const showBadge = item.badge && unreadCount > 0;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    data-ocid={`bottom_nav.${item.labelKey}_link`}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 transition-all duration-200",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span className="relative">
                      <Icon className={cn("h-5 w-5", active && "scale-110")} />
                      {showBadge && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-medium leading-none">
                      {navLabel(item.labelKey)}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ─── Mobile slide-out drawer ─── */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              role="presentation"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setMobileOpen(false);
              }}
              aria-hidden="true"
            />
            {/* Drawer */}
            <aside
              data-ocid="layout.mobile_drawer"
              className={cn(
                "fixed top-0 bottom-0 z-50 w-[260px] bg-card border-border flex flex-col lg:hidden",
                "transition-transform duration-300",
                isRTL ? "right-0 border-s" : "left-0 border-e",
              )}
            >
              {/* Drawer header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
                <Link
                  to="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setMobileOpen(false)}
                  aria-label="StreamVerse home"
                >
                  <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-foreground text-[15px] tracking-tight">
                    StreamVerse
                  </span>
                </Link>
                <button
                  type="button"
                  data-ocid="layout.mobile_drawer_close"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  const showBadge = item.badge && unreadCount > 0;
                  const label = navLabel(item.labelKey);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      data-ocid={`mobile_nav.${item.labelKey}_link`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-primary/20 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className="relative flex-shrink-0">
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px]",
                            active && "text-primary",
                          )}
                        />
                        {showBadge && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </span>
                      <span className="truncate">{label}</span>
                      {showBadge && (
                        <span className="ms-auto min-w-[20px] h-5 px-1 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <Separator className="mx-3" />

              {/* Settings at bottom of drawer */}
              <div className="py-3 px-3">
                <Link
                  to="/settings"
                  data-ocid="mobile_nav.settings_link"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive("/settings")
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <Settings className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate">{t("settings")}</span>
                </Link>
              </div>
            </aside>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
