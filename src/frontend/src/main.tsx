import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// PWA install banner component
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Detect Arabic language preference
  const isArabic =
    typeof navigator !== "undefined" &&
    (navigator.language.startsWith("ar") ||
      document.documentElement.lang === "ar");

  useEffect(() => {
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div
      data-ocid="pwa.install_banner"
      style={{
        position: "fixed",
        bottom: "80px",
        left: "16px",
        right: "16px",
        zIndex: 9999,
        background: "rgba(10, 10, 10, 0.95)",
        border: "1px solid rgba(6, 182, 212, 0.4)",
        borderRadius: "12px",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        direction: isArabic ? "rtl" : "ltr",
      }}
    >
      {/* App icon */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #06b6d4, #0891b2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "20px",
        }}
      >
        ▶
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {isArabic
            ? "ثبّت StreamVerse كتطبيق"
            : "Install StreamVerse as an app"}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "12px",
            marginTop: "2px",
          }}
        >
          {isArabic
            ? "وصول أسرع بدون متصفح"
            : "Faster access without a browser"}
        </div>
      </div>

      {/* Install button */}
      <button
        type="button"
        data-ocid="pwa.install_button"
        onClick={handleInstall}
        style={{
          background: "#06b6d4",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          padding: "8px 14px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#0891b2";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#06b6d4";
        }}
      >
        {isArabic ? "تثبيت" : "Install"}
      </button>

      {/* Dismiss button */}
      <button
        type="button"
        data-ocid="pwa.dismiss_button"
        onClick={handleDismiss}
        aria-label={isArabic ? "إغلاق" : "Dismiss"}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.5)",
          cursor: "pointer",
          padding: "4px",
          fontSize: "18px",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SW] Registered:", registration.scope);
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
  });
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
      <InstallBanner />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
