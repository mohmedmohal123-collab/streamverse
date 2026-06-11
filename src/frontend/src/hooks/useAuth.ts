import { AuthClient } from "@dfinity/auth-client";
import type { Principal } from "@icp-sdk/core/principal";
import { useEffect, useState } from "react";
import { useActor } from "../lib/backend";

export type AuthMethod = "credentials" | "google" | "internet-identity" | null;

const ADMIN_KEY = "streamverse_is_admin";
const ADMIN_USERNAME_KEY = "streamverse_admin_username";
const II_AUTH_KEY = "streamverse_ii_authenticated";
const II_PRINCIPAL_KEY = "streamverse_ii_principal";
const AUTH_SESSION_KEY = "streamverse_auth_session";

interface AuthSession {
  userId?: string;
  username?: string;
  isAdmin: boolean;
  authType: "credentials" | "google" | "internet-identity";
}

/** Known admin usernames — checked client-side as a fast-path hint */
const KNOWN_ADMIN_USERNAMES = ["mostfa", "admin"];

export function isKnownAdmin(username: string): boolean {
  return KNOWN_ADMIN_USERNAMES.includes(username.toLowerCase().trim());
}

export function useAuth() {
  const { actor, isFetching } = useActor();

  // Persist isAdmin in localStorage so it survives page refresh
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Check both the isAdmin flag and the stored username
    if (localStorage.getItem(ADMIN_KEY) === "true") return true;
    const storedUsername = localStorage.getItem(ADMIN_USERNAME_KEY) ?? "";
    return isKnownAdmin(storedUsername);
  });

  const [credentialAuth, setCredentialAuth] = useState<boolean>(() => {
    // Also restore from auth session
    const session = localStorage.getItem(AUTH_SESSION_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session) as AuthSession;
        if (parsed.authType === "google") return true;
      } catch {
        /* ignore */
      }
    }
    return localStorage.getItem("streamverse_credential_auth") === "true";
  });

  // Internet Identity state
  const [iiAuth, setIiAuth] = useState<boolean>(() => {
    return localStorage.getItem(II_AUTH_KEY) === "true";
  });
  const [iiPrincipal, setIiPrincipal] = useState<Principal | undefined>(() => {
    // Principal stored as string
    const stored = localStorage.getItem(II_PRINCIPAL_KEY);
    if (!stored) return undefined;
    try {
      // We just store the text; convert on read
      return { toString: () => stored } as unknown as Principal;
    } catch {
      return undefined;
    }
  });

  const isLoading = false;

  // Re-validate admin status from backend on mount/actor change
  useEffect(() => {
    if (!credentialAuth && !iiAuth) {
      setIsAdmin(false);
      localStorage.removeItem(ADMIN_KEY);
      localStorage.removeItem(ADMIN_USERNAME_KEY);
      return;
    }

    // Fast-path: if we already know admin from localStorage OR known username, trust it immediately
    const storedUsername = localStorage.getItem(ADMIN_USERNAME_KEY) ?? "";
    if (
      localStorage.getItem(ADMIN_KEY) === "true" ||
      isKnownAdmin(storedUsername)
    ) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, "true");
      return;
    }

    // For non-known usernames, check backend
    if (isFetching || !actor) return;

    actor
      .isCallerAdmin()
      .then((result: boolean) => {
        if (result) {
          setIsAdmin(true);
          localStorage.setItem(ADMIN_KEY, "true");
        }
      })
      .catch(() => {
        // Ignore errors — keep current state
      });
  }, [actor, isFetching, credentialAuth, iiAuth]);

  const setCredentialAuthenticated = (value: boolean, username?: string) => {
    if (value) {
      localStorage.setItem("streamverse_credential_auth", "true");
      localStorage.setItem("streamverse_authenticated", "true");
      if (username) {
        localStorage.setItem(ADMIN_USERNAME_KEY, username);
        // Immediately mark as admin if it's a known admin username
        if (isKnownAdmin(username)) {
          localStorage.setItem(ADMIN_KEY, "true");
          setIsAdmin(true);
        }
      }
    } else {
      localStorage.removeItem("streamverse_credential_auth");
      localStorage.removeItem("streamverse_authenticated");
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(ADMIN_KEY);
      localStorage.removeItem(ADMIN_USERNAME_KEY);
      setIsAdmin(false);
    }
    setCredentialAuth(value);
  };

  /**
   * Persist a Google auth session to localStorage so it survives page reload.
   */
  const persistGoogleSession = (
    userId: string,
    username: string,
    isAdminUser: boolean,
  ) => {
    const session: AuthSession = {
      userId,
      username,
      isAdmin: isAdminUser,
      authType: "google",
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("streamverse_credential_auth", "true");
    localStorage.setItem("streamverse_authenticated", "true");
    if (isAdminUser) {
      localStorage.setItem(ADMIN_KEY, "true");
      localStorage.setItem(ADMIN_USERNAME_KEY, username);
      setIsAdmin(true);
    }
    setCredentialAuth(true);
  };

  /**
   * Login with Internet Identity.
   * Opens the II popup, on success stores auth state.
   */
  const loginWithInternetIdentity = async (): Promise<void> => {
    const authClient = await AuthClient.create();
    return new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          const principalText = principal.toString();
          localStorage.setItem(II_AUTH_KEY, "true");
          localStorage.setItem(II_PRINCIPAL_KEY, principalText);
          localStorage.setItem("streamverse_authenticated", "true");
          setIiAuth(true);
          setIiPrincipal(principal as unknown as Principal);
          resolve();
        },
        onError: (err) => {
          console.error("Internet Identity error:", err);
          reject(new Error(err ?? "Internet Identity login failed"));
        },
      });
    });
  };

  /**
   * Call immediately after login to check admin status and get the result.
   * Returns true if the current caller is an admin.
   * Also accepts the username to apply a fast-path check for known admins.
   */
  const checkIsAdmin = async (username?: string): Promise<boolean> => {
    // Fast-path for known admin usernames — check FIRST, no async needed
    const usernameToCheck =
      username ?? localStorage.getItem(ADMIN_USERNAME_KEY) ?? "";
    if (usernameToCheck && isKnownAdmin(usernameToCheck)) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, "true");
      return true;
    }

    // Check localStorage cache
    if (localStorage.getItem(ADMIN_KEY) === "true") {
      setIsAdmin(true);
      return true;
    }

    if (!actor) {
      return false;
    }

    try {
      const result = await actor.isCallerAdmin();
      setIsAdmin(result);
      if (result) {
        localStorage.setItem(ADMIN_KEY, "true");
      } else {
        localStorage.removeItem(ADMIN_KEY);
      }
      return result;
    } catch {
      // On error, fall back to localStorage value
      const cached = localStorage.getItem(ADMIN_KEY) === "true";
      setIsAdmin(cached);
      return cached;
    }
  };

  const logout = () => {
    setCredentialAuthenticated(false);
    // Also clear II session
    localStorage.removeItem(II_AUTH_KEY);
    localStorage.removeItem(II_PRINCIPAL_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem("streamverse_authenticated");
    setIiAuth(false);
    setIiPrincipal(undefined);
    // Try to logout from AuthClient too
    AuthClient.create()
      .then((client) => client.logout())
      .catch(() => {});
  };

  /**
   * Delete the current user's account.
   * Calls actor.deleteMyAccount() if available, then logs out.
   */
  const deleteMyAccount = async (): Promise<void> => {
    if (!actor) throw new Error("Not connected");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actorAny = actor as any;
    if (typeof actorAny.deleteMyAccount === "function") {
      await actorAny.deleteMyAccount();
    }
    logout();
  };

  // Stub — navigates to /login. Profile.tsx calls this when unauthenticated.
  const login = () => {
    window.location.href = "/login";
  };

  const isAuthenticated = credentialAuth || iiAuth;

  return {
    isAuthenticated,
    // II-specific
    isIIAuthenticated: iiAuth,
    isLoading,
    principal: iiPrincipal,
    login,
    logout,
    deleteMyAccount,
    identity: undefined as undefined,
    loginStatus: "success" as const,
    isAdmin,
    setCredentialAuthenticated,
    persistGoogleSession,
    checkIsAdmin,
    loginWithInternetIdentity,
  };
}
