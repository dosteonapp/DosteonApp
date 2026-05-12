"use client";

import { useState } from "react";
import { TrendingDown, Utensils, Wrench, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppContainer, FigtreeText, InriaHeading } from "@/components/ui/dosteon-ui";
import { Button } from "@/components/ui/button";
import { expenseService } from "@/lib/services/expenseService";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { useBrand } from "@/context/BrandContext";
import { useUser } from "@/context/UserContext";
import { QK } from "@/lib/queryKeys";
import { ExpenditureLogForm, FormState } from "@/components/expenditure/ExpenditureLogForm";
import { EntryPreview } from "@/components/expenditure/EntryPreview";
import { RecentEntries } from "@/components/expenditure/RecentEntries";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
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
  const [isQuickOpening, setIsQuickOpening] = useState(false);
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? null;
  const { isOpen, canStartOpening, finishOpening } = useRestaurantDayLifecycle();
  const { user } = useUser();
  const skipsStockCount = user?.daily_stock_count === false;

  const handleQuickOpen = async () => {
    if (!canStartOpening) return;
    setIsQuickOpening(true);
    try {
      await restaurantOpsService.submitOpeningChecklist({ counts: {} });
      await finishOpening();
    } catch {
      // finishOpening updates local state even on network failure
    } finally {
      setIsQuickOpening(false);
    }
  };

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
      <div className="relative">
        {/* ── Page content (blurred when locked) ── */}
        <div
          className={cn(
            "transition-all duration-700",
            !isOpen && "blur-[5px] grayscale-[0.15] opacity-75 pointer-events-none select-none"
          )}
        >
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
        </div>

        {/* ── Locked overlay ── */}
        {!isOpen && (
          <ExpenditureLockedOverlay
            skipsStockCount={skipsStockCount}
            canStartOpening={canStartOpening}
            isQuickOpening={isQuickOpening}
            onQuickOpen={handleQuickOpen}
          />
        )}
      </div>
    </AppContainer>
  );
}

// ---------------------------------------------------------------------------
// Locked overlay
// ---------------------------------------------------------------------------

function ExpenditureLockedOverlay({
  skipsStockCount,
  canStartOpening,
  isQuickOpening,
  onQuickOpen,
}: {
  skipsStockCount: boolean;
  canStartOpening: boolean;
  isQuickOpening: boolean;
  onQuickOpen: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto rounded-[12px] overflow-hidden">
      <div className="absolute inset-0 bg-white/55 backdrop-blur-[7px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-6 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 bg-white shadow-[0_12px_44px_rgba(0,0,0,0.06)] rounded-[20px] flex items-center justify-center mb-10 border border-slate-100/50">
          <Lock className="h-9 w-9 text-slate-800/80 stroke-[2.5px] drop-shadow-sm" />
        </div>

        <div className="space-y-4 max-w-[440px] mb-12">
          <InriaHeading className="text-[30px] md:text-[38px] font-bold tracking-tight leading-tight">
            Expenditure is Locked
          </InriaHeading>
          <FigtreeText className="text-slate-500 text-[15px] md:text-[17px] leading-relaxed font-bold max-w-[340px] mx-auto opacity-70">
            {skipsStockCount
              ? "Open your kitchen to start logging expenses."
              : "Complete your daily opening stock count to unlock Expenditure."}
          </FigtreeText>
        </div>

        {skipsStockCount ? (
          <Button
            className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black gap-4 shadow-[0_20px_50px_rgba(59,89,218,0.25)] transition-all active:scale-95 group font-figtree text-[17px] border-none"
            onClick={onQuickOpen}
            disabled={isQuickOpening || !canStartOpening}
          >
            {isQuickOpening ? "Opening..." : "Open Kitchen"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
          </Button>
        ) : (
          <Button
            className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black gap-4 shadow-[0_20px_50px_rgba(59,89,218,0.25)] transition-all active:scale-95 group font-figtree text-[17px] border-none"
            asChild
          >
            <Link href="/dashboard/inventory/daily-stock-count">
              Count Daily Stock
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
