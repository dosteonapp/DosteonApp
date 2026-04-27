"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  History,
  BookOpen,
  Lock,
  ArrowRight,
  Plus,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AppContainer,
  FigtreeText,
  InriaHeading,
} from "@/components/ui/dosteon-ui";
import { TabLogSales } from "@/components/sales/TabLogSales";
import { TabSalesHistory } from "@/components/sales/TabSalesHistory";
import { TabMenuManagement } from "@/components/sales/TabMenuManagement";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { BrandSwitcherCard } from "@/components/BrandSwitcherCard";

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

type SalesTab = "log" | "history" | "menu";

const TABS: { id: SalesTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "log",     label: "Log Sales",              icon: TrendingUp },
  { id: "history", label: "Today's Sales History",  icon: History    },
  { id: "menu",    label: "Menu Management",         icon: BookOpen   },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<SalesTab>("log");
  const { isOpen } = useRestaurantDayLifecycle();

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
            onClick={() => setActiveTab("log")}
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
            <span className="hidden sm:block">Log Sales</span>
            <TrendingUp className="h-3.5 w-3.5 sm:hidden shrink-0" />
          </Button>
        </div>
      </div>

      {/* ── Tab bar + content surface ── */}
      <div className="relative">
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

          {/* Tab content — blurred when day is closed */}
          <div
            className={cn(
              "transition-all duration-700",
              !isOpen && "blur-[5px] grayscale-[0.15] opacity-75 pointer-events-none select-none"
            )}
          >
            {activeTab === "log"     && <TabLogSales />}
            {activeTab === "history" && <TabSalesHistory />}
            {activeTab === "menu"    && <TabMenuManagement />}
          </div>
        </div>

        {/* Locked overlay */}
        {!isOpen && <SalesLockedOverlay />}
      </div>

    </AppContainer>
  );
}

// ---------------------------------------------------------------------------
// Locked overlay
// ---------------------------------------------------------------------------

function SalesLockedOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto rounded-[12px] overflow-hidden">
      <div className="absolute inset-0 bg-white/55 backdrop-blur-[7px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-6 text-center animate-in fade-in zoom-in-95 duration-700">
        {/* Lock icon card */}
        <div className="w-20 h-20 bg-white shadow-[0_12px_44px_rgba(0,0,0,0.06)] rounded-[20px] flex items-center justify-center mb-10 border border-slate-100/50">
          <Lock className="h-9 w-9 text-slate-800/80 stroke-[2.5px] drop-shadow-sm" />
        </div>

        <div className="space-y-4 max-w-[440px] mb-12">
          <InriaHeading className="text-[30px] md:text-[38px] font-bold tracking-tight leading-tight">
            Sales is Locked
          </InriaHeading>
          <FigtreeText className="text-slate-500 text-[15px] md:text-[17px] leading-relaxed font-bold max-w-[340px] mx-auto opacity-70">
            Complete your daily opening stock count to unlock Sales and start logging orders.
          </FigtreeText>
        </div>

        <Button
          className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black gap-4 shadow-[0_20px_50px_rgba(59,89,218,0.25)] transition-all active:scale-95 group font-figtree text-[17px] border-none"
          asChild
        >
          <Link href="/dashboard/inventory/daily-stock-count">
            Count Daily Stock
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
