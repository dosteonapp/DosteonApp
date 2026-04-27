"use client";
import React from "react";
import OnboardingSidebar from "./OnboardingSidebar";
import OnboardingProgressBar from "./OnboardingProgressBar";

interface Props {
  children: React.ReactNode;
  /** Pass true only on the completion screen */
  isComplete?: boolean;
}

/**
 * OnboardingShell — the fixed chrome that wraps all 4 onboarding steps
 * and the completion screen.
 *
 * Layout:
 *   ┌──────────────┬──────────────────────────────────┐
 *   │              │  Progress bar (top)               │
 *   │   Sidebar    │  Step content (scrollable)        │
 *   │   (fixed     │                                   │
 *   │    navy)     │  Bottom bar (fixed)               │
 *   └──────────────┴──────────────────────────────────┘
 *
 * The sidebar is always visible (no mobile collapse — per spec desktop+tablet only).
 * The content column uses flex-col so the bottom bar stays pinned to the bottom.
 */
export default function OnboardingShell({ children, isComplete = false }: Props) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* ── Sidebar ── */}
      <OnboardingSidebar />

      {/* ── Main content column ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Progress bar — fixed at top of content column */}
        <OnboardingProgressBar isComplete={isComplete} />

        {/* Scrollable step body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
