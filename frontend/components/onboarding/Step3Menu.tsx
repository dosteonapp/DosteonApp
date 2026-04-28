"use client";
import React, { useCallback } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useOnboarding, Dish } from "@/context/OnboardingContext";
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

// Colour palette for brand tab badges (matches Step 1)
const BRAND_COLORS = ["#F97316", "#EF4444", "#8B5CF6", "#0EA5E9", "#10B981"];

export default function Step3Menu() {
  const {
    state,
    setDish,
    addDish,
    removeDish,
    setActiveBrandTab,
    setDishForBrand,
    addDishForBrand,
    removeDishForBrand,
    goToStep,
    submitStep3,
    step3Valid,
  } = useOnboarding();

  const { step3, savedBrands } = state;
  const isMultiBrand = savedBrands.length > 1;

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
      <div className="flex-1 px-8 py-8 max-w-3xl">
        {/* Header */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3B4EFF] mb-1">
          Step 3: Your Menu
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Add your dishes</h2>
        <p className="text-sm text-gray-500 mb-6">
          Sales logging works by selecting dishes from your menu. Add at least 3 dishes now.
          You can add costs later to unlock margin calculations.
        </p>

        {isMultiBrand ? (
          <MultiBrandMenuEditor
            brands={savedBrands}
            brandDishes={step3.brandDishes}
            activeBrandId={step3.activeBrandId}
            onTabChange={setActiveBrandTab}
            onChangeDish={setDishForBrand}
            onAddDish={addDishForBrand}
            onRemoveDish={removeDishForBrand}
          />
        ) : (
          <SingleBrandMenuEditor
            dishes={step3.dishes}
            onChangeDish={setDish}
            onAddDish={addDish}
            onRemoveDish={removeDish}
          />
        )}
      </div>

      <OnboardingBottomBar
        hint={
          isMultiBrand
            ? "Each brand needs at least 1 dish, and 3 total minimum"
            : "You need at least 3 dishes to enable sales logging"
        }
        onBack={handleBack}
        onContinue={handleContinue}
        disabled={!step3Valid}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single-brand editor (original layout)
// ---------------------------------------------------------------------------
interface SingleBrandMenuEditorProps {
  dishes: Dish[];
  onChangeDish: (index: number, field: keyof Dish, value: string | number) => void;
  onAddDish: () => void;
  onRemoveDish: (index: number) => void;
}

function SingleBrandMenuEditor({ dishes, onChangeDish, onAddDish, onRemoveDish }: SingleBrandMenuEditorProps) {
  const namedCount = dishes.filter((d) => d.name.trim()).length;
  const remaining = Math.max(0, 3 - namedCount);

  return (
    <div className="w-full">
      <div className="hidden sm:grid grid-cols-[1fr_160px_180px] gap-3 mb-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Dish Name</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Price (RWF)</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Category</span>
      </div>

      <div className="space-y-2">
        {dishes.map((dish, idx) => (
          <DishRow
            key={idx}
            index={idx}
            dish={dish}
            onChange={onChangeDish}
            onRemove={dishes.length > 3 ? () => onRemoveDish(idx) : undefined}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddDish}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#3B4EFF] hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        Add another dish
      </button>

      {remaining > 0 && (
        <p className="mt-4 text-sm font-medium text-amber-500">
          {namedCount} of 3 required dishes added
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-brand editor — tabs per brand
// ---------------------------------------------------------------------------
interface MultiBrandMenuEditorProps {
  brands: { id: string; name: string }[];
  brandDishes: { [brandId: string]: Dish[] };
  activeBrandId: string | null;
  onTabChange: (brandId: string) => void;
  onChangeDish: (brandId: string, index: number, field: keyof Dish, value: string | number) => void;
  onAddDish: (brandId: string) => void;
  onRemoveDish: (brandId: string, index: number) => void;
}

function MultiBrandMenuEditor({
  brands,
  brandDishes,
  activeBrandId,
  onTabChange,
  onChangeDish,
  onAddDish,
  onRemoveDish,
}: MultiBrandMenuEditorProps) {
  const activeId = activeBrandId ?? brands[0]?.id ?? null;
  const activeDishes = activeId ? (brandDishes[activeId] ?? []) : [];

  // Count named dishes per brand for the tab badge
  const namedPerBrand = (brandId: string) =>
    (brandDishes[brandId] ?? []).filter((d) => d.name.trim()).length;

  return (
    <div>
      {/* Info banner */}
      <div className="mb-5 flex items-start gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
        <span className="mt-0.5 text-[#3B4EFF] text-sm">ℹ</span>
        <p className="text-sm text-[#3B4EFF]">
          Each brand gets its own menu. Add dishes under each brand tab — they&apos;ll only appear
          in that brand&apos;s sales log and stats.
        </p>
      </div>

      {/* Brand tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {brands.map((brand, idx) => {
          const isActive = brand.id === activeId;
          const count = namedPerBrand(brand.id);
          const color = BRAND_COLORS[idx % BRAND_COLORS.length];
          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => onTabChange(brand.id)}
              className={[
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border-2 transition-all",
                isActive
                  ? "border-[#3B4EFF] bg-[#EEF0FF] text-[#3B4EFF]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
              ].join(" ")}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold"
                style={{ backgroundColor: color }}
              >
                {brand.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate max-w-[120px]">{brand.name}</span>
              {count > 0 && (
                <span
                  className={[
                    "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isActive ? "bg-[#3B4EFF] text-white" : "bg-gray-100 text-gray-500",
                  ].join(" ")}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active brand dish table */}
      {activeId && (
        <div className="w-full">
          <div className="hidden sm:grid grid-cols-[1fr_160px_180px] gap-3 mb-2 px-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Dish Name</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Price (RWF)</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Category</span>
          </div>

          <div className="space-y-2">
            {activeDishes.map((dish, idx) => (
              <DishRow
                key={idx}
                index={idx}
                dish={dish}
                onChange={(index, field, value) => onChangeDish(activeId, index, field, value)}
                onRemove={activeDishes.length > 1 ? () => onRemoveDish(activeId, idx) : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => onAddDish(activeId)}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#3B4EFF] hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add another dish
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dish row
// ---------------------------------------------------------------------------
interface DishRowProps {
  index: number;
  dish: Dish;
  onChange: (index: number, field: keyof Dish, value: string | number) => void;
  onRemove?: () => void;
}

function DishRow({ index, dish, onChange, onRemove }: DishRowProps) {
  const handlePriceStep = (delta: 1 | -1) => {
    const next = Math.max(0, (dish.price ?? 0) + delta);
    onChange(index, "price", next);
  };

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_160px_180px_auto] gap-2 sm:gap-3 items-stretch sm:items-center">
      {/* Dish name */}
      <input
        type="text"
        placeholder="e.g., Rolex Wrap"
        value={dish.name}
        onChange={(e) => onChange(index, "name", e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
      />

      {/* Price, Category, Remove — row on mobile, grid cells on sm+ */}
      <div className="flex gap-2 sm:contents items-center">
        {/* Price with stepper */}
        <div className="relative flex items-center flex-1 sm:flex-none">
          <input
            type="number"
            min={0}
            value={dish.price}
            onChange={(e) => onChange(index, "price", parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-8 text-sm text-gray-900 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
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
        <div className="relative flex-1 sm:flex-none">
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

        {/* Remove button */}
        <div className="w-6 shrink-0">
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-6 w-6 items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              title="Remove dish"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
