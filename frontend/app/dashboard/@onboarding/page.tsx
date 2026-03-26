"use client";
import OnboardingPage from "@/app/onboarding/page";

/**
 * We reuse the main onboarding page component here to ensure 
 * consistent branding and flow when the user is forced into 
 * onboarding from the dashboard.
 */
export default function DashboardOnboarding() {
  return <OnboardingPage />;
}