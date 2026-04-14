"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/context/OnboardingContext";

// Summary row — label + right-aligned value
function SummaryRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
        {String(value)}
      </span>
    </div>
  );
}

export default function StepComplete() {
  const router = useRouter();
  const { state } = useOnboarding();
  const summary = state.completeSummary;

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-8">
      {/* Glowing green checkmark */}
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full mb-6"
        style={{
          background: "radial-gradient(circle, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)",
          boxShadow: "0 0 0 12px #d1fae533, 0 0 0 24px #6ee7b711",
        }}
      >
        <svg
          className="h-12 w-12 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Labels */}
      <p className="text-xs font-bold uppercase tracking-widest text-[#3B4EFF] mb-2">
        Setup Complete
      </p>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">You&apos;re all set.</h2>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-8">
        Your Dosteon workspace is ready. Your first stock check is scheduled for tomorrow morning.
      </p>

      {/* Summary card */}
      {summary && (
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white px-6 py-1 mb-8 shadow-sm">
          <SummaryRow label="Restaurant Name" value={summary.organization_name} />
          <SummaryRow label="Phone Number" value={summary.phone} />
          <SummaryRow label="Hours" value={summary.hours_display} />
          <SummaryRow label="Operating Days" value={summary.operating_days_display} />
          <SummaryRow
            label="Menu Dishes Added"
            value={
              summary.menu_dishes_count > 0
                ? `${summary.menu_dishes_count} dish${summary.menu_dishes_count !== 1 ? "es" : ""}`
                : null
            }
          />
          <SummaryRow
            label="Inventory Items Added"
            value={
              summary.inventory_items_count > 0
                ? `${summary.inventory_items_count} item${summary.inventory_items_count !== 1 ? "s" : ""}`
                : "0 items"
            }
          />
        </div>
      )}

      {/* Go to Dashboard */}
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="w-full max-w-md rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
        style={{ backgroundColor: "#3B4EFF" }}
      >
        Go to Dashboard
      </button>

      <p className="mt-4 text-xs text-gray-400 text-center max-w-sm">
        You can adjust your overall business details in your workspace later as you see fit
      </p>
    </div>
  );
}
