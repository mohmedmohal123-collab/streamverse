import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

/**
 * Scrolls the main content container to the top on every route change.
 * Uses the #main-content element (the scroll container) instead of window,
 * because the app uses an inner overflow-y-auto container, not window scroll.
 */
export function useScrollToTop() {
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      const mainEl = document.getElementById("main-content");
      if (mainEl) {
        mainEl.scrollTop = 0;
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  });
}
