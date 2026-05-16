"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppContainer } from "@/components/ui/dosteon-ui";
import { TabProductCatalog } from "@/components/inventory/TabProductCatalog";
import { TabStockUsage } from "@/components/inventory/TabStockUsage";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as InventoryTab) ?? "catalog";

  const setActiveTab = (tab: InventoryTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <AppContainer>

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

        {/* Tab content */}
        {activeTab === "catalog" && <TabProductCatalog />}
        {activeTab === "usage"   && <TabStockUsage />}
      </div>

    </AppContainer>
  );
}
