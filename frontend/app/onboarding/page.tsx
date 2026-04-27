"use client";
import React from "react";
import { useOnboarding } from "@/context/OnboardingContext";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import dynamic from "next/dynamic";

// Step components — filled in during Phases 5-8; loaded lazily so each phase
// can be added incrementally without the shell breaking.
const Step1Business = dynamic(() => import("@/components/onboarding/Step1Business"), {
  loading: () => <StepLoader />,
});
const Step2Hours = dynamic(() => import("@/components/onboarding/Step2Hours"), {
  loading: () => <StepLoader />,
});
const Step3Menu = dynamic(() => import("@/components/onboarding/Step3Menu"), {
  loading: () => <StepLoader />,
});
const Step4Inventory = dynamic(() => import("@/components/onboarding/Step4Inventory"), {
  loading: () => <StepLoader />,
});
const StepComplete = dynamic(() => import("@/components/onboarding/StepComplete"), {
  loading: () => <StepLoader />,
});

function StepLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#3B4EFF] border-t-transparent" />
    </div>
  );
}

export default function OnboardingPage() {
  const { state } = useOnboarding();

  // Full-page spinner while OnboardingContext fetches existing progress on mount
  if (state.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B4EFF] border-t-transparent" />
      </div>
    );
  }

  // Completion screen — shown after POST /onboarding/complete succeeds
  if (state.isCompleted) {
    return (
      <OnboardingShell isComplete>
        <StepComplete />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell>
      {state.currentStep === 1 && <Step1Business />}
      {state.currentStep === 2 && <Step2Hours />}
      {state.currentStep === 3 && <Step3Menu />}
      {state.currentStep === 4 && <Step4Inventory />}
    </OnboardingShell>
  );
}
