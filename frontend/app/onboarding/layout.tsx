"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProvider } from "@/context/OnboardingContext";

/**
 * Onboarding layout — two responsibilities:
 *
 * 1. Route guard: if the user has already completed onboarding
 *    (onboarding_completed === true on their backend profile), redirect
 *    them to /dashboard immediately. A completed user should never see
 *    this flow.
 *
 * 2. Wrap every onboarding page in OnboardingProvider so the state
 *    machine context is available to all child components without
 *    re-mounting when navigating between steps.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    (async () => {
      try {
        // Need a live session to know the onboarding status.
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        if (!supabase) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // No session — send to sign in; they can't be in onboarding without auth.
          router.replace("/auth/restaurant/signin");
          return;
        }

        // Fetch backend profile — source of truth for onboarding_completed.
        const { default: axiosInstance } = await import("@/lib/axios");
        const { data: profile } = await axiosInstance.get("/auth/me");

        if (profile?.onboarding_completed === true) {
          // Already completed — bounce to dashboard silently.
          router.replace("/dashboard");
        }
        // If not completed: do nothing, let the onboarding page render.
      } catch {
        // Network error or cold-start — let the page render; it handles
        // its own loading state via OnboardingContext.
      }
    })();
  }, [router]);

  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
}
