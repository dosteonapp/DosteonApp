"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Utensils,
  Wrench,
  ShoppingBasket,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppContainer } from "@/components/ui/dosteon-ui";
import { expenseService, ExpenseHistoryItem, ExpenseType } from "@/lib/services/expenseService";
import { useBrand } from "@/context/BrandContext";
import { useUser } from "@/context/UserContext";
import { QK } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExportModal } from "@/components/expenditure/ExportModal";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  INGREDIENT: { label: "Ingredient",   color: "text-emerald-700", bg: "bg-emerald-50",  icon: ShoppingBasket },
  OVERHEAD:   { label: "Operational",  color: "text-amber-700",   bg: "bg-amber-50",    icon: Wrench },
  OTHER:      { label: "Other",        color: "text-slate-700",   bg: "bg-slate-100",   icon: MoreHorizontal },
};

const DAY_OPTIONS = [
  { label: "Last 7 days",  value: 7  },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-figtree mb-1 leading-tight">{label}</p>
          {loading ? (
            <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-md" />
          ) : (
            <p className="text-[18px] font-black text-[#1E293B] font-figtree leading-tight">{value}</p>
          )}
        </div>
        <div className={cn("w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0", bg)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function HistoryRow({ item }: { item: ExpenseHistoryItem }) {
  const meta = TYPE_META[item.expense_type] ?? TYPE_META.OVERHEAD;
  const Icon = meta.icon;

  const date = item.business_date
    ? new Date(item.business_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const time = item.occurred_at
    ? new Date(item.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <tr className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
      {/* Item & Date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0", meta.bg)}>
            <Icon className={cn("h-3.5 w-3.5", meta.color)} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-700 font-figtree">{item.item_name}</p>
            <p className="text-[11px] text-slate-400 font-bold font-figtree">{date}{time ? ` · ${time}` : ""}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span className={cn("px-2 py-1 rounded-full text-[11px] font-bold font-figtree", meta.bg, meta.color)}>
          {meta.label}
        </span>
      </td>

      {/* Supplier / Source */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-500 font-bold font-figtree">{item.source || "—"}</span>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-500 font-bold font-figtree">
          {item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : "—"}
        </span>
      </td>

      {/* Amount */}
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] font-black text-slate-800 font-figtree">
          RWF {item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExpenditureHistoryPage() {
  const [days, setDays] = useState(7);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<ExpenseType | "">("");
  const [exportOpen, setExportOpen] = useState(false);

  const { activeBrand } = useBrand();
  const { user } = useUser();
  const brandId = activeBrand?.id ?? null;

  const workspaceSlug = user?.workspace_slug;
  const backHref = workspaceSlug
    ? `/${workspaceSlug}/dashboard/expenditure`
    : "/dashboard/expenditure";

  const { data: weekStats, isLoading: weekLoading } = useQuery({
    queryKey: QK.expenseWeekStats(brandId),
    queryFn: () => expenseService.getWeekStats(),
    staleTime: 60_000,
  });

  const historyParams = { page, limit: 50, days };

  const { data: history, isLoading: histLoading } = useQuery({
    queryKey: [...QK.expenseHistory(brandId), historyParams],
    queryFn: () => expenseService.getHistory(historyParams),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const filteredItems = typeFilter
    ? (history?.items ?? []).filter((i) => i.expense_type === typeFilter)
    : (history?.items ?? []);

  const displayItems = filteredItems.slice((page - 1) * 20, page * 20);

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `RWF ${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `RWF ${(n / 1_000).toFixed(0)}K`
      : `RWF ${n.toLocaleString()}`;

  const totalEntries = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / 20));

  return (
    <AppContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="w-9 h-9 rounded-[10px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-[18px] font-black text-[#1E293B] font-figtree leading-tight">Expense History</h1>
            <p className="text-[12px] text-slate-400 font-bold font-figtree">Full log of all recorded expenditures</p>
          </div>
        </div>
        <Button
          onClick={() => setExportOpen(true)}
          className="h-10 px-5 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black text-[13px] font-figtree gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-slate-100 rounded-[12px] px-4 py-3 mb-4 flex flex-wrap items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {/* Period */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-black text-slate-400 font-figtree uppercase tracking-wide">Period</span>
          <div className="flex gap-1">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setDays(opt.value); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-bold font-figtree border transition-all",
                  days === opt.value
                    ? "bg-[#3B59DA] text-white border-[#3B59DA]"
                    : "border-slate-200 text-slate-500 hover:border-[#3B59DA] hover:text-[#3B59DA]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[12px] font-black text-slate-400 font-figtree uppercase tracking-wide">Type</span>
          <div className="flex gap-1">
            {(["", "INGREDIENT", "OVERHEAD"] as const).map((t) => (
              <button
                key={t || "all"}
                type="button"
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-bold font-figtree border transition-all",
                  typeFilter === t
                    ? "bg-[#3B59DA] text-white border-[#3B59DA]"
                    : "border-slate-200 text-slate-500 hover:border-[#3B59DA] hover:text-[#3B59DA]"
                )}
              >
                {t === "" ? "All" : t === "INGREDIENT" ? "Ingredient" : "Operational"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Total Expenditure"
          value={weekStats ? fmt(weekStats.total) : "—"}
          icon={TrendingDown}
          color="text-[#3B59DA]"
          bg="bg-indigo-50"
          loading={weekLoading}
        />
        <StatCard
          label="Ingredient Cost"
          value={weekStats ? fmt(weekStats.cogs) : "—"}
          icon={Utensils}
          color="text-emerald-600"
          bg="bg-emerald-50"
          loading={weekLoading}
        />
        <StatCard
          label="Operational Cost"
          value={weekStats ? fmt(weekStats.overhead) : "—"}
          icon={Wrench}
          color="text-amber-600"
          bg="bg-amber-50"
          loading={weekLoading}
        />
        <StatCard
          label="Entries"
          value={totalEntries.toLocaleString()}
          icon={TrendingDown}
          color="text-slate-500"
          bg="bg-slate-100"
          loading={histLoading}
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-100 rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 font-figtree">Item & Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 font-figtree">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 font-figtree">Supplier / Source</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 font-figtree">Quantity</th>
                <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-400 font-figtree">Amount</th>
              </tr>
            </thead>
            <tbody>
              {histLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                  </td>
                </tr>
              ) : !displayItems.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-[13px] text-slate-400 font-bold font-figtree">No expenses recorded in this period</p>
                  </td>
                </tr>
              ) : (
                displayItems.map((item) => <HistoryRow key={item.id} item={item} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[12px] text-slate-400 font-bold font-figtree">
              Page {page} of {totalPages} · {totalEntries} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 rounded-[8px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#3B59DA] hover:border-[#3B59DA] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-8 h-8 rounded-[8px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#3B59DA] hover:border-[#3B59DA] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export modal */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        items={filteredItems}
        totalEntries={totalEntries}
      />
    </AppContainer>
  );
}
