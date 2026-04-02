"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initPostHog, capturePageview } from "@/lib/analytics";

/**
 * Initialises PostHog once and captures a $pageview on every SPA navigation.
 * Must be a client component so it can access window and Next.js hooks.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Initialise on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Track pageviews on route change (skip the very first render — PostHog's
  // own init call captures the landing pageview when capture_pageview is true,
  // but since we disabled that we fire it ourselves after init settles).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      capturePageview(window.location.href);
      return;
    }
    capturePageview(window.location.href);
  }, [pathname]);

  return <>{children}</>;
}
