import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a page with the CSS transition-page animation (fade + 8px micro-translate).
 * Use as a thin wrapper inside each page component's root element,
 * or wrap the Outlet in App.tsx to apply globally.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("transition-page w-full h-full", className)}>
      {children}
    </div>
  );
}
