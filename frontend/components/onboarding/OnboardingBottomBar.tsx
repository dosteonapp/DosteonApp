"use client";
import React from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";

interface Props {
  /** Contextual hint shown on the left side of the bottom bar */
  hint?: string;
  /** Called when the Back button is clicked */
  onBack?: () => void;
  /** Called when the Continue / primary action button is clicked */
  onContinue: () => void;
  /** Whether the Continue button should be disabled (validation failed) */
  disabled?: boolean;
  /** Label for the primary button. Defaults to "Continue" */
  continueLabel?: string;
  /** Show checkmark icon instead of arrow (used on "Complete Setup") */
  completeMode?: boolean;
  /** Hide the Back button entirely (Step 1) */
  hideBack?: boolean;
}

export default function OnboardingBottomBar({
  hint,
  onBack,
  onContinue,
  disabled = false,
  continueLabel = "Continue",
  completeMode = false,
  hideBack = false,
}: Props) {
  const { state } = useOnboarding();
  const isLoading = state.isSaving;

  return (
    <div className="flex items-center justify-between px-8 py-4 border-t border-gray-100 bg-white">
      {/* Hint text */}
      <span className="text-sm text-gray-400 flex-1 pr-4">{hint ?? ""}</span>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        {!hideBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={disabled || isLoading}
          className={[
            "flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all",
            disabled || isLoading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "text-white shadow-sm hover:opacity-90 active:scale-95",
          ].join(" ")}
          style={
            disabled || isLoading
              ? {}
              : { backgroundColor: "#3B4EFF" }
          }
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : completeMode ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : null}
          {continueLabel}
          {!isLoading && !completeMode && (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
