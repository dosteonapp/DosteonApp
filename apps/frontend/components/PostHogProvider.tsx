"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { capturePageview } from "@/lib/analytics";
import { getStoredConsent } from "@/components/CookieConsent";

/**
 * Tracks $pageview on every SPA navigation.
 * PostHog is NOT initialised here — initialisation is gated by CookieConsent.
 * This component only fires pageviews when PostHog is already running.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Only capture pageview if consent was already given in a previous session.
      // New visitors will get their first pageview after they accept the banner.
      if (getStoredConsent() === "accepted") {
        capturePageview(window.location.href);
      }
      return;
    }
    capturePageview(window.location.href);
  }, [pathname]);

  return <>{children}</>;
}
