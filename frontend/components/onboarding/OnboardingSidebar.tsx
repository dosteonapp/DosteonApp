"use client";
import React from "react";
import { Check } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";

const STEPS = [
  { number: 1, label: "Your Business", sublabel: "Business details and structure" },
  { number: 2, label: "Operating Hours", sublabel: "Hours & operating days" },
  { number: 3, label: "Your Menu", sublabel: "Dishes & prices" },
  { number: 4, label: "Core Inventory", sublabel: "Stock & you're ready" },
] as const;

export default function OnboardingSidebar() {
  const { state } = useOnboarding();
  const { currentStep } = state;

  return (
    <aside
      className="hidden md:flex flex-col h-full shrink-0"
      style={{ backgroundColor: "#0D1B4B", width: "300px", minWidth: "280px", maxWidth: "300px" }}
    >
      {/* Logo */}
      <div className="px-8 pt-10 pb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Dosteon</h1>
        <p className="text-blue-300 text-xs mt-1 font-light">Intelligence for food businesses</p>
      </div>

      {/* Step list */}
      <nav className="flex-1 px-6">
        <ul className="space-y-1">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;
            const isInactive = currentStep < step.number;

            return (
              <li key={step.number}>
                <div
                  className={[
                    "flex items-start gap-3 rounded-xl px-3 py-3 transition-colors",
                    isActive ? "bg-white/10" : "",
                  ].join(" ")}
                >
                  {/* Step indicator */}
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      /* Green checkmark circle */
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                      </span>
                    ) : isActive ? (
                      /* Active: white filled circle with dark number */
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0D1B4B] text-xs font-bold">
                        {step.number}
                      </span>
                    ) : (
                      /* Inactive: muted border circle */
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-400/40 text-blue-300/60 text-xs font-medium">
                        {step.number}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div>
                    <p
                      className={[
                        "text-sm font-medium leading-tight",
                        isActive || isCompleted ? "text-white" : "text-blue-300/60",
                      ].join(" ")}
                    >
                      {step.label}
                    </p>
                    <p
                      className={[
                        "text-xs mt-0.5 leading-tight",
                        isActive || isCompleted ? "text-blue-200/70" : "text-blue-300/40",
                      ].join(" ")}
                    >
                      {step.sublabel}
                    </p>
                  </div>
                </div>

                {/* Connector line (not after last step) */}
                {idx < STEPS.length - 1 && (
                  <div className="ml-[22px] my-0.5 w-px h-4 bg-blue-400/20" />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-8 pb-10 pt-6 border-t border-white/10">
        <p className="text-blue-200/60 text-xs leading-relaxed">
          Used by restaurants across Kigali to close the gap between what they spend, consume, and earn.
        </p>
        <p className="text-blue-300/50 text-xs mt-3">
          Questions?{" "}
          <span className="text-blue-300/70">dosteonapp@gmail.com</span>
        </p>
      </div>
    </aside>
  );
}
