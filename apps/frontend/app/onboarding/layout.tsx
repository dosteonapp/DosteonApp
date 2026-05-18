"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { auth } from "@/lib/firebase";

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

    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (!user) {
        router.replace("/auth/restaurant/signin");
      }
    });
  }, [router]);

  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
}
