"use client";

import { useState } from "react";
import { TrendingDown, Utensils, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppContainer } from "@/components/ui/dosteon-ui";
import { expenseService } from "@/lib/services/expenseService";
import { useBrand } from "@/context/BrandContext";
import { QK } from "@/lib/queryKeys";
import { ExpenditureLogForm, FormState } from "@/components/expenditure/ExpenditureLogForm";
import { EntryPreview } from "@/components/expenditure/EntryPreview";
import { RecentEntries } from "@/components/expenditure/RecentEntries";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-[12px] p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-figtree mb-1">{label}</p>
          {loading ? (
            <div className="h-7 w-28 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <p className="text-[22px] md:text-[24px] font-black text-[#1E293B] font-figtree leading-tight">{value}</p>
          )}
          {sub && !loading && (
            <p className="text-[11px] text-slate-400 font-bold font-figtree mt-1">{sub}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const EMPTY_FORM: FormState = {
  uiType: "ingredient",
  itemName: "",
  supplier: "",
  unit: "",
  quantity: "",
  unitCost: "",
  transportCost: "",
  category: "",
  amount: "",
};

export default function ExpenditurePage() {
  const [previewForm, setPreviewForm] = useState<FormState>(EMPTY_FORM);
  const [refreshKey, setRefreshKey] = useState(0);
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? null;

  const { data: weekStats, isLoading: weekLoading } = useQuery({
    queryKey: QK.expenseWeekStats(brandId),
    queryFn: () => expenseService.getWeekStats(),
    staleTime: 60_000,
  });

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `RWF ${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `RWF ${(n / 1_000).toFixed(0)}K`
      : `RWF ${n.toLocaleString()}`;

  return (
    <AppContainer>
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard
          label="Total Expenditure This Week"
          value={weekStats ? fmt(weekStats.total) : "RWF 0"}
          sub={weekStats?.vs_last_week_pct != null ? `${weekStats.vs_last_week_pct > 0 ? "+" : ""}${weekStats.vs_last_week_pct}% vs last week` : undefined}
          icon={TrendingDown}
          color="text-[#3B59DA]"
          bg="bg-indigo-50"
          loading={weekLoading}
        />
        <StatCard
          label="COGS This Week"
          value={weekStats ? fmt(weekStats.cogs) : "RWF 0"}
          sub="Ingredient costs"
          icon={Utensils}
          color="text-emerald-600"
          bg="bg-emerald-50"
          loading={weekLoading}
        />
        <StatCard
          label="Overheads This Week"
          value={weekStats ? fmt(weekStats.overhead) : "RWF 0"}
          sub="Operational expenses"
          icon={Wrench}
          color="text-amber-600"
          bg="bg-amber-50"
          loading={weekLoading}
        />
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* Left — log form */}
        <div className="bg-white border border-slate-100 rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100">
            <h2 className="text-[15px] font-black text-[#1E293B] font-figtree">Log Expenditure</h2>
            <p className="text-[12px] text-slate-400 font-bold font-figtree mt-0.5">
              Record ingredient purchases, operational costs, or other expenses
            </p>
          </div>
          <ExpenditureLogForm
            onFormChange={setPreviewForm}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        </div>

        {/* Right — preview + recent entries */}
        <div className="flex flex-col gap-4">
          <EntryPreview form={previewForm} />
          <RecentEntries refreshKey={refreshKey} />
        </div>
      </div>
    </AppContainer>
  );
}
