"use client";

import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { TrendingDown, ShoppingCart, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AppContainer } from "@/components/ui/dosteon-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseHistory } from "@/components/expenses/ExpenseHistory";
import { useBrand } from "@/context/BrandContext";
import { QK } from "@/lib/queryKeys";
import { expenseService } from "@/lib/services/expenseService";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function ExpenseStatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "rose" | "indigo" | "slate";
  loading?: boolean;
}) {
  const palette = {
    rose:  { bg: "bg-rose-50",  border: "border-rose-100",  text: "text-rose-600",  icon: "text-rose-400"  },
    indigo:{ bg: "bg-indigo-50",border: "border-indigo-100",text: "text-indigo-600",icon: "text-indigo-400"},
    slate: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", icon: "text-slate-400" },
  }[color];

  return (
    <div className={cn("rounded-[12px] border p-5 space-y-3", palette.bg, palette.border)}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-figtree">
          {label}
        </p>
        <div className={cn("p-2 rounded-[8px] bg-white/60", palette.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-7 w-32" />
      ) : (
        <p className={cn("text-2xl font-bold font-inria tracking-tight", palette.text)}>{value}</p>
      )}
      {sub && <p className="text-xs text-slate-500 font-figtree">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString("en-US")}`;

export default function ExpensesPage() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? null;

  const { data: weekStats, isLoading } = useQuery({
    queryKey: QK.expenseWeekStats(brandId),
    queryFn: () => expenseService.getWeekStats(),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    placeholderData: keepPreviousData,
  });

  const cogsPercent =
    weekStats && weekStats.total > 0
      ? Math.round((weekStats.cogs / weekStats.total) * 100)
      : null;
  const overheadPercent =
    weekStats && weekStats.total > 0
      ? Math.round((weekStats.overhead / weekStats.total) * 100)
      : null;

  const vsSign = weekStats?.vs_last_week_pct != null
    ? weekStats.vs_last_week_pct > 0 ? "+" : ""
    : "";
  const vsTrend = weekStats?.vs_last_week_pct != null
    ? `${vsSign}${weekStats.vs_last_week_pct}% vs last week`
    : undefined;

  return (
    <AppContainer>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-figtree transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-xs text-slate-600 font-semibold font-figtree">Log Expenses</span>
      </div>

      {/* Week stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ExpenseStatCard
          label="Total Expenditure This Week"
          value={weekStats ? fmt(weekStats.total) : "—"}
          sub={vsTrend}
          icon={TrendingDown}
          color="rose"
          loading={isLoading}
        />
        <ExpenseStatCard
          label="COGS This Week"
          value={weekStats ? fmt(weekStats.cogs) : "—"}
          sub={cogsPercent != null ? `${cogsPercent}% of total spend` : undefined}
          icon={ShoppingCart}
          color="indigo"
          loading={isLoading}
        />
        <ExpenseStatCard
          label="Overheads This Week"
          value={weekStats ? fmt(weekStats.overhead) : "—"}
          sub={overheadPercent != null ? `${overheadPercent}% of total spend` : undefined}
          icon={Zap}
          color="slate"
          loading={isLoading}
        />
      </div>

      {/* Two-column: form left, history right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-[380px] shrink-0">
          <ExpenseForm />
        </div>
        <div className="flex-1 min-w-0">
          <ExpenseHistory />
        </div>
      </div>
    </AppContainer>
  );
}
