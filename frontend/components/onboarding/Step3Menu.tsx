"use client";
import React, { useCallback } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import OnboardingBottomBar from "./OnboardingBottomBar";
import { toast } from "sonner";

const CATEGORIES = [
  "Signature",
  "Starter",
  "Main",
  "Side",
  "Dessert",
  "Beverage",
  "Special",
];

export default function Step3Menu() {
  const {
    state,
    setDish,
    addDish,
    goToStep,
    submitStep3,
    step3Valid,
  } = useOnboarding();

  const { dishes } = state.step3;

  // Count dishes with a non-empty name
  const namedCount = dishes.filter((d) => d.name.trim()).length;
  const remaining = Math.max(0, 3 - namedCount);

  const handleContinue = useCallback(async () => {
    if (!step3Valid) return;
    try {
      await submitStep3();
      goToStep(4);
    } catch {
      toast.error("Could not save menu. Please try again.");
    }
  }, [step3Valid, submitStep3, goToStep]);

  const handleBack = useCallback(() => goToStep(2), [goToStep]);

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Scrollable body ── */}
      <div className="flex-1 px-8 py-8 max-w-3xl">
        {/* Header */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3B4EFF] mb-1">
          Step 3: Your Menu
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Add your dishes</h2>
        <p className="text-sm text-gray-500 mb-8">
          Sales logging works by selecting dishes from your menu. Add at least 3 dishes now.
          You can add costs later to unlock margin calculations
        </p>

        {/* ── Dish table ── */}
        <div className="w-full">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_160px_180px] gap-3 mb-2 px-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Dish Name
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Price (RWF)
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Category
            </span>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {dishes.map((dish, idx) => (
              <DishRow
                key={idx}
                index={idx}
                dish={dish}
                onChange={setDish}
              />
            ))}
          </div>

          {/* Add another dish */}
          <button
            type="button"
            onClick={addDish}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#3B4EFF] hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add another dish
          </button>

          {/* Progress counter — shown when < 3 named dishes */}
          {remaining > 0 && (
            <p className="mt-4 text-sm font-medium text-amber-500">
              {namedCount} of 3 required dishes added
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <OnboardingBottomBar
        hint="You need at least 3 dishes to enable sales logging"
        onBack={handleBack}
        onContinue={handleContinue}
        disabled={!step3Valid}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dish row
// ---------------------------------------------------------------------------
interface DishRowProps {
  index: number;
  dish: { name: string; price: number; category: string };
  onChange: (index: number, field: "name" | "price" | "category", value: string | number) => void;
}

function DishRow({ index, dish, onChange }: DishRowProps) {
  const handlePriceStep = (delta: 1 | -1) => {
    const next = Math.max(0, (dish.price ?? 0) + delta);
    onChange(index, "price", next);
  };

  return (
    <div className="grid grid-cols-[1fr_160px_180px] gap-3 items-center">
      {/* Dish name */}
      <input
        type="text"
        placeholder="e.g., Rolex Wrap"
        value={dish.name}
        onChange={(e) => onChange(index, "name", e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
      />

      {/* Price with stepper */}
      <div className="relative flex items-center">
        <input
          type="number"
          min={0}
          value={dish.price}
          onChange={(e) => onChange(index, "price", parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-8 text-sm text-gray-900 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {/* Up / Down stepper buttons */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handlePriceStep(1)}
            className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <ChevronUp className="h-3 w-3" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handlePriceStep(-1)}
            className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Category */}
      <div className="relative">
        <select
          value={dish.category}
          onChange={(e) => onChange(index, "category", e.target.value)}
          className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 pr-8 text-sm text-gray-900 bg-white focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}
