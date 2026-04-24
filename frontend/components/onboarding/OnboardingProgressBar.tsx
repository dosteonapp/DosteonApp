"use client";
import React from "react";
import { useOnboarding } from "@/context/OnboardingContext";

interface Props {
  /** Override the step shown in the label (used on the completion screen which shows step 4 complete) */
  isComplete?: boolean;
}

export default function OnboardingProgressBar({ isComplete = false }: Props) {
  const { state } = useOnboarding();
  const { currentStep } = state;

  return (
    <div className="flex items-center px-4 py-3 md:px-8 md:py-4 border-b border-gray-100 gap-3 md:gap-6">
      {/* Step label */}
      <span className="shrink-0 text-sm text-gray-500 font-medium">
        {isComplete ? "Step 4 of 4" : `Step ${currentStep} of 4`}
      </span>

      {/* 4-segment progress bar — fills all remaining width */}
      <div className="flex items-center gap-1.5 flex-1">
        {[1, 2, 3, 4].map((seg) => {
          const filled = isComplete ? true : seg <= currentStep;
          return (
            <div
              key={seg}
              className="flex-1 h-1 rounded-full transition-colors duration-300"
              style={{ backgroundColor: filled ? "#3B4EFF" : "#E5E7EB" }}
            />
          );
        })}
      </div>

      {/* Onboarding Complete badge — only visible on completion screen */}
      {isComplete && (
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
          Onboarding Complete
        </span>
      )}
    </div>
  );
}
