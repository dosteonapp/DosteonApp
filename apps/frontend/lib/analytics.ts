/**
 * PostHog analytics wrapper.
 *
 * Usage:
 *   import { trackEvent, identifyUser } from "@/lib/analytics";
 *   trackEvent("signup_started", { method: "email/password" });
 *   identifyUser(userId, { email });
 */

import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key) return; // Analytics disabled when key is absent (e.g. local dev without config)
  posthog.init(key, {
    api_host: host,
    capture_pageview: false, // Handled manually for SPA routing
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  initialized = true;
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, {
    timestamp: new Date().toISOString(),
    ...properties,
  });
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, traits);
}

export function capturePageview(url: string) {
  if (typeof window === "undefined") return;
  posthog.capture("$pageview", { $current_url: url });
}
