"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Activity, Receipt, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AppContainer,
  FigtreeText,
} from "@/components/ui/dosteon-ui";
import { TabProductCatalog } from "@/components/inventory/TabProductCatalog";
import { TabStockUsage } from "@/components/inventory/TabStockUsage";
import { useBrand } from "@/context/BrandContext";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

type InventoryTab = "catalog" | "usage";

const TABS: {
  id: InventoryTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "catalog", label: "Product Catalog", icon: LayoutGrid },
  { id: "usage",   label: "Stock Usage",     icon: Activity   },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>("catalog");
  const { activeBrand } = useBrand();
  const { isOpen } = useRestaurantDayLifecycle();

  return (
    <AppContainer>

      {/* ── Module Header: Brand card + action buttons ── */}
      <div className="bg-white border border-slate-100 rounded-[12px] px-5 py-4 md:px-7 md:py-5 flex items-center justify-between gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">

        {/* Brand avatar + label + status badge */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="h-11 w-11 md:h-12 md:w-12 rounded-[10px] bg-indigo-50 border border-indigo-100/60 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-[#3B59DA] font-black text-[17px] md:text-[18px] uppercase select-none">
              {activeBrand?.name.charAt(0) ?? "I"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[15px] md:text-[17px] font-black text-[#1E293B] tracking-tight font-figtree truncate leading-tight">
                {activeBrand?.name ?? "Inventory"}
              </div>
              {/* LIVE / CLOSED badge */}
              <span
                className={cn(
                  "shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-figtree border",
                  isOpen
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                    : "bg-slate-100 text-slate-400 border-slate-200/60"
                )}
              >
                {isOpen ? "LIVE" : "CLOSED"}
              </span>
            </div>
            <FigtreeText className="text-[11px] md:text-[12px] font-semibold text-slate-400 leading-tight">
              Main Location
            </FigtreeText>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Button
            variant="outline"
            className="h-9 md:h-10 rounded-[8px] border-slate-200 text-slate-500 font-bold text-[12px] md:text-[13px] font-figtree hover:bg-slate-50 hover:text-slate-700 gap-1.5 md:gap-2 px-3 md:px-4 transition-all"
            disabled
            title="Coming soon"
          >
            <Receipt className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
            <span className="hidden sm:block">Log Expense</span>
          </Button>
          <Button
            className="h-9 md:h-10 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold text-[12px] md:text-[13px] font-figtree gap-1.5 md:gap-2 px-3 md:px-4 shadow-[0_4px_14px_rgba(59,89,218,0.3)] active:scale-95 transition-all"
            asChild
          >
            <Link href="/dashboard/sales">
              <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span className="hidden sm:block">Log Sales</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Tab bar + content surface ── */}
      <div className="bg-white border border-slate-100 rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)]">

        {/* Tab navigation */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-4 text-[13px] md:text-[14px] font-bold transition-all relative font-figtree whitespace-nowrap",
                  isActive
                    ? "text-[#3B59DA] bg-indigo-50/40"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/60"
                )}
              >
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3B59DA] rounded-t-full" />
                )}
                <tab.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "stroke-[2.5px] text-[#3B59DA]" : "stroke-[2px]"
                  )}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content — each tab manages its own locked state */}
        {activeTab === "catalog" && <TabProductCatalog />}
        {activeTab === "usage"   && <TabStockUsage />}
      </div>

    </AppContainer>
  );
}
