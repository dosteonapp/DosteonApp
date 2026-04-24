"use client";
import React, { useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import OnboardingBottomBar from "./OnboardingBottomBar";
import { toast } from "sonner";

// Category emoji (re-used from 4a — keep in sync or extract to shared constants)
const CATEGORY_EMOJI: Record<string, string> = {
  "Fresh Produce":       "🥕",
  "Grains & Staples":    "🌾",
  "Meat & Poultry":      "🍗",
  "Oils & Fats":         "🫒",
  "Dairy & Eggs":        "🥚",
  "Pantry & Dry":        "🧂",
  "Beverages":           "🧃",
  "Bakery & Pastry":     "🥐",
  "Frozen Foods":        "🧊",
  "Non-Food Essentials": "🧴",
};

export default function Step4bQuantities() {
  const {
    state,
    setInventoryQuantity,
    setInventoryUnit,
    removeInventoryItem,
    setStep4SubScreen,
    submitStep4AndComplete,
  } = useOnboarding();

  const { selected_items } = state.step4;

  const handleComplete = useCallback(async () => {
    try {
      await submitStep4AndComplete();
      // Context sets isCompleted = true → page.tsx switches to StepComplete
    } catch {
      toast.error("Could not complete setup. Please try again.");
    }
  }, [submitStep4AndComplete]);

  const handleBack = useCallback(() => setStep4SubScreen("select"), [setStep4SubScreen]);

  const hint = `${selected_items.length} item${selected_items.length !== 1 ? "s" : ""} ready for setup. You can complete full inventory from the dashboard`;

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3B4EFF] mb-1">
          Step 4: Core Inventory — Almost Done
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Set your opening stock</h2>
        <p className="text-sm text-gray-500 max-w-xl">
          Enter the current quantities you have on hand for the items you selected. This forms the
          baseline for your daily consumption tracking. You can update these later.
        </p>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 px-4 pb-4 sm:px-8 overflow-y-auto">
        {selected_items.length === 0 ? (
          <p className="text-sm text-gray-400 mt-4">
            No items selected. Click &ldquo;Complete Setup&rdquo; to finish with an empty inventory —
            you can add items from the dashboard.
          </p>
        ) : (
          <div className="w-full max-w-3xl">
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_180px_120px_40px] gap-4 px-1 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Item</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Opening Quantity</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Unit</span>
              <span />
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {selected_items.map((item) => {
                const emoji = CATEGORY_EMOJI[item.category] ?? "📦";
                return (
                  <div
                    key={item.canonical_product_id}
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_180px_120px_40px] gap-3 sm:gap-4 sm:items-center rounded-xl border border-gray-200 bg-white px-4 py-3"
                  >
                    {/* Item identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.category}
                          {item.base_unit ? ` · ${item.base_unit}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Qty, Unit, Remove — row on mobile, grid cells on sm+ */}
                    <div className="flex gap-2 sm:contents items-center">
                      {/* Opening quantity */}
                      <input
                        type="number"
                        min={0}
                        value={item.opening_quantity}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          setInventoryQuantity(
                            item.canonical_product_id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 sm:flex-none w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />

                      {/* Unit */}
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          setInventoryUnit(item.canonical_product_id, e.target.value)
                        }
                        className="flex-1 sm:flex-none w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
                      />

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeInventoryItem(item.canonical_product_id)}
                        className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <OnboardingBottomBar
        hint={hint}
        onBack={handleBack}
        onContinue={handleComplete}
        disabled={false}
        continueLabel="Complete Setup"
        completeMode
      />
    </div>
  );
}
