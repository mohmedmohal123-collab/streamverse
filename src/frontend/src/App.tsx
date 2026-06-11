import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import { Layout } from "./components/Layout";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy-load pages
const Welcome = lazy(() => import("./pages/Welcome"));
const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const WatchHistory = lazy(() => import("./pages/WatchHistory"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Create = lazy(() => import("./pages/Create"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const OfflineVideos = lazy(() => import("./pages/OfflineVideos"));
const Playlists = lazy(() => import("./pages/Playlists"));
const LiveStream = lazy(() => import("./pages/LiveStream"));
const Feed = lazy(() => import("./pages/Feed"));

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// Helper: check if the user is authenticated (persisted flag set on login)
function isAuthenticated(): boolean {
  return localStorage.getItem("streamverse_authenticated") === "true";
}

// Helper: check if the user is known admin via localStorage
function isLocalAdmin(): boolean {
  if (localStorage.getItem("streamverse_is_admin") === "true") return true;
  const u = localStorage.getItem("streamverse_admin_username") ?? "";
  return ["mostfa", "admin"].includes(u.toLowerCase().trim());
}

// Track if the welcome screen has been shown in this browser session
const SESSION_WELCOME_KEY = "streamverse_welcome_shown";

function hasSeenWelcomeThisSession(): boolean {
  return sessionStorage.getItem(SESSION_WELCOME_KEY) === "true";
}

// Called by Welcome.tsx when user clicks "Get Started" or "Sign In"
export function markWelcomeSeen(): void {
  sessionStorage.setItem(SESSION_WELCOME_KEY, "true");
}

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
      <Toaster />
    </ThemeProvider>
  ),
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  // Do NOT mark welcome as seen here — only mark when user clicks CTA
  component: Welcome,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    // Always show welcome screen first when app opens fresh (new session)
    if (!hasSeenWelcomeThisSession()) {
      throw redirect({ to: "/welcome" });
    }
    // After welcome, redirect unauthenticated users to login
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: Home,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: Search,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: WatchHistory,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    // Allow access if locally known as admin OR if they've authenticated (Admin.tsx will do final check)
    // This prevents false redirects when localStorage admin flags exist
    const authed = isAuthenticated();
    const admin = isLocalAdmin();
    if (!authed && !admin) {
      throw redirect({ to: "/login" });
    }
  },
  component: Admin,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});

const videoCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: Create,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: Notifications,
});

const subscribeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscribe",
  component: Subscribe,
});

const offlineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/offline",
  component: OfflineVideos,
});

const playlistsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playlists",
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: Playlists,
});

const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/live",
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: LiveStream,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: Feed,
});

const routeTree = rootRoute.addChildren([
  welcomeRoute,
  homeRoute,
  searchRoute,
  historyRoute,
  profileRoute,
  settingsRoute,
  adminRoute,
  loginRoute,
  registerRoute,
  videoCreateRoute,
  notificationsRoute,
  subscribeRoute,
  offlineRoute,
  playlistsRoute,
  liveRoute,
  feedRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
