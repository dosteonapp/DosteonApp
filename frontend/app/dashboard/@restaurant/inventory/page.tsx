"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Activity, Receipt, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppContainer } from "@/components/ui/dosteon-ui";
import { TabProductCatalog } from "@/components/inventory/TabProductCatalog";
import { TabStockUsage } from "@/components/inventory/TabStockUsage";
import { BrandSwitcherCard } from "@/components/BrandSwitcherCard";

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

  return (
    <AppContainer>

      {/* ── Module Header: Brand card + action buttons ── */}
      <div className="flex items-center justify-between gap-4 px-1">

        <BrandSwitcherCard />

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

        {/* Tab navigation — segmented control */}
        <div className="px-4 md:px-6 py-3 border-b border-slate-100">
          <div className="flex bg-slate-100/80 rounded-[10px] p-1 gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[12px] md:text-[13px] font-bold transition-all rounded-[8px] font-figtree whitespace-nowrap min-w-0",
                    isActive
                      ? "bg-white text-[#3B59DA] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  )}
                >
                  <tab.icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isActive ? "stroke-[2.5px] text-[#3B59DA]" : "stroke-[2px]"
                    )}
                  />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content — each tab manages its own locked state */}
        {activeTab === "catalog" && <TabProductCatalog />}
        {activeTab === "usage"   && <TabStockUsage />}
      </div>

    </AppContainer>
  );
}
