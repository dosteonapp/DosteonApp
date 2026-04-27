"use client";
import React, { useMemo, useState } from "react";
import { Search, Check, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useOnboarding, SelectedInventoryItem } from "@/context/OnboardingContext";
import OnboardingBottomBar from "./OnboardingBottomBar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CatalogItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  base_unit: string;
  is_critical_item: boolean;
}

// Category emoji mapping — matches the canonical category names in the DB
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Step4aSelect() {
  const { state, toggleInventoryItem, setStep4SubScreen, goToStep } = useOnboarding();
  const selectedIds = new Set(state.step4.selected_items.map((i) => i.canonical_product_id));

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All Items");

  // Fetch catalog
  const { data: catalog = [], isLoading } = useQuery<CatalogItem[]>({
    queryKey: ["catalog-onboarding"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/inventory/catalog");
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 min — catalog rarely changes
  });

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of catalog) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [catalog]);

  // Sorted category list
  const categoryList = useMemo(
    () =>
      Object.entries(categoryCounts).sort(
        (a, b) => b[1] - a[1] // descending by count (matches designs)
      ),
    [categoryCounts]
  );

  // Filtered items
  const visibleItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return catalog.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All Items" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalog, search, activeCategory]);

  const handleToggle = (item: CatalogItem) => {
    const payload: Omit<SelectedInventoryItem, "opening_quantity"> = {
      canonical_product_id: item.id,
      name: item.name,
      category: item.category,
      base_unit: item.base_unit,
      unit: item.base_unit,
    };
    toggleInventoryItem(payload);
  };

  const handleContinue = () => {
    if (state.step4.selected_items.length === 0) {
      // No items selected — skip 4b and go straight to complete via parent
      setStep4SubScreen("set_quantities");
    } else {
      setStep4SubScreen("set_quantities");
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-3 sm:px-8 sm:pt-8 sm:pb-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3B4EFF] mb-1">
            Step 4: Core Inventory
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            What does your kitchen stock?
          </h2>
          <p className="text-sm text-gray-500 max-w-xl">
            Dosteon&apos;s inventory intelligence starts the moment you record what you have today.
            Opening stock = Day 1 of the data chain. Add key items now; you can complete the full
            inventory from the app.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative sm:mt-1 flex-shrink-0 w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for ingredients (e.g., Tomatoes, Beef)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
          />
        </div>
      </div>

      {/* ── Two-panel body ── */}
      <div className="flex flex-col sm:flex-row flex-1 gap-0 px-4 sm:px-8 pb-4 overflow-hidden min-h-0">
        {/* Mobile-only category pills */}
        <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 flex-shrink-0 mb-2">
          <button
            type="button"
            onClick={() => setActiveCategory("All Items")}
            className={[
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              activeCategory === "All Items"
                ? "bg-[#3B4EFF] text-white border-[#3B4EFF]"
                : "bg-white text-gray-600 border-gray-200",
            ].join(" ")}
          >
            All
          </button>
          {categoryList.map(([cat]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={[
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                activeCategory === cat
                  ? "bg-[#3B4EFF] text-white border-[#3B4EFF]"
                  : "bg-white text-gray-600 border-gray-200",
              ].join(" ")}
            >
              {CATEGORY_EMOJI[cat] ?? "📦"} {cat}
            </button>
          ))}
        </div>

        {/* Left — Categories (hidden on mobile) */}
        <div className="hidden sm:flex sm:flex-col w-52 flex-shrink-0 pr-4 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Categories
          </p>

          <ul className="space-y-0.5">
            {/* All Items */}
            <li>
              <button
                type="button"
                onClick={() => setActiveCategory("All Items")}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  activeCategory === "All Items"
                    ? "border-l-2 border-[#3B4EFF] bg-blue-50 text-[#3B4EFF] font-semibold pl-2.5"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                <span>All Items</span>
                <span
                  className={[
                    "text-xs rounded-full px-2 py-0.5 font-medium",
                    activeCategory === "All Items"
                      ? "bg-[#3B4EFF] text-white"
                      : "bg-gray-100 text-gray-500",
                  ].join(" ")}
                >
                  {catalog.length}
                </span>
              </button>
            </li>

            {/* Category rows */}
            {categoryList.map(([cat, count]) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    activeCategory === cat
                      ? "border-l-2 border-[#3B4EFF] bg-blue-50 text-[#3B4EFF] font-semibold pl-2.5"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <span>{CATEGORY_EMOJI[cat] ?? "📦"}</span>
                    <span className="truncate max-w-[90px]">{cat}</span>
                  </span>
                  <span
                    className={[
                      "text-xs rounded-full px-2 py-0.5 font-medium flex-shrink-0",
                      activeCategory === cat
                        ? "bg-[#3B4EFF] text-white"
                        : "bg-gray-100 text-gray-500",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — Item grid */}
        <div className="flex-1 overflow-y-auto sm:pl-4 sm:border-l border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">All Items</p>
            <p className="text-xs text-gray-400">
              Select items to add them to your core inventory draft. You can set opening quantities on the right.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3B4EFF] border-t-transparent" />
            </div>
          ) : visibleItems.length === 0 ? (
            <p className="text-sm text-gray-400 mt-8 text-center">No items found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {visibleItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    onToggle={() => handleToggle(item)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <OnboardingBottomBar
        hint="You can complete full inventory from the dashboard"
        onBack={() => goToStep(3)}
        onContinue={handleContinue}
        disabled={false}
        continueLabel="Continue"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item card
// ---------------------------------------------------------------------------
interface ItemCardProps {
  item: CatalogItem;
  isSelected: boolean;
  onToggle: () => void;
}

function ItemCard({ item, isSelected, onToggle }: ItemCardProps) {
  const emoji = CATEGORY_EMOJI[item.category] ?? "📦";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "flex items-center justify-between gap-2 rounded-xl border p-3 transition-all w-full text-left",
        isSelected
          ? "border-[#3B4EFF] bg-[#EEF0FF]"
          : "border-gray-200 bg-white hover:border-[#3B4EFF] hover:bg-[#F5F7FF]",
      ].join(" ")}
    >
      {/* Icon + text */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl flex-shrink-0">{emoji}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {item.category}
            {item.base_unit ? ` · ${item.base_unit}` : ""}
          </p>
        </div>
      </div>

      {/* Visual indicator (non-interactive — card handles the click) */}
      <span
        className={[
          "flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
          isSelected
            ? "border-[#3B4EFF] bg-[#3B4EFF]"
            : "border-gray-300 bg-white group-hover:border-[#3B4EFF]",
        ].join(" ")}
      >
        {isSelected ? (
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        ) : (
          <Plus className="h-3.5 w-3.5 text-gray-400" strokeWidth={2.5} />
        )}
      </span>
    </button>
  );
}
