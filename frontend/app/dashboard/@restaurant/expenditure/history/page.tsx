"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppContainer } from "@/components/ui/dosteon-ui";
import { expenseService, ExpenseHistoryItem, ExpenseType } from "@/lib/services/expenseService";
import { useBrand } from "@/context/BrandContext";
import { useUser } from "@/context/UserContext";
import { QK } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { ExportModal } from "@/components/expenditure/ExportModal";

// ---------------------------------------------------------------------------
// Format date as "Mar 05, 2026"
// ---------------------------------------------------------------------------
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const todayStr = () => new Date().toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const fmtFull = (n: number) =>
  `RWF ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Stat card — text-only, matches mockup
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  loading,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      "bg-white border border-slate-100 rounded-[12px] px-6 py-5",
      accent && "border-t-2 border-t-[#3B59DA]"
    )}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-figtree mb-3">{label}</p>
      {loading ? (
        <>
          <div className="h-7 w-36 bg-slate-100 animate-pulse rounded-md mb-2" />
          <div className="h-3 w-20 bg-slate-50 animate-pulse rounded-md" />
        </>
      ) : (
        <>
          <p className="text-[22px] font-black text-[#1E293B] font-figtree leading-tight">{value}</p>
          <p className="text-[12px] text-slate-400 font-bold font-figtree mt-1">{sub}</p>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type badge — matches mockup pill style
// ---------------------------------------------------------------------------

function TypeBadge({ type }: { type: string }) {
  if (type === "INGREDIENT") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-figtree border border-slate-300 text-slate-600 bg-white">
        Ingredient
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-figtree bg-slate-100 text-slate-600">
      Operational
    </span>
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function HistoryRow({ item }: { item: ExpenseHistoryItem }) {
  const date = item.business_date
    ? new Date(item.business_date).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-bold text-slate-800 font-figtree">{item.item_name}</p>
        <p className="text-[11px] text-slate-400 font-medium font-figtree mt-0.5">{date}</p>
      </td>
      <td className="px-5 py-3.5">
        <TypeBadge type={item.expense_type} />
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] text-slate-600 font-medium font-figtree">{item.source || "—"}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] text-slate-600 font-medium font-figtree">
          {item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : "—"}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <span className="text-[13px] font-black text-slate-800 font-figtree">{fmtFull(item.amount)}</span>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-100">
      <td className="px-5 py-3.5">
        <div className="h-4 w-32 bg-slate-100 animate-pulse rounded mb-1.5" />
        <div className="h-3 w-20 bg-slate-50 animate-pulse rounded" />
      </td>
      <td className="px-5 py-3.5"><div className="h-5 w-20 bg-slate-100 animate-pulse rounded-full" /></td>
      <td className="px-5 py-3.5"><div className="h-4 w-24 bg-slate-100 animate-pulse rounded" /></td>
      <td className="px-5 py-3.5"><div className="h-4 w-12 bg-slate-100 animate-pulse rounded" /></td>
      <td className="px-5 py-3.5 flex justify-end"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded" /></td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Numbered pagination
// ---------------------------------------------------------------------------

function Pagination({
  page,
  totalPages,
  totalEntries,
  onPage,
}: {
  page: number;
  totalPages: number;
  totalEntries: number;
  onPage: (p: number) => void;
}) {
  const start = totalEntries === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalEntries);

  // Build visible page numbers (up to 3 around current)
  const pages: number[] = [];
  const maxVisible = 3;
  let s = Math.max(1, page - 1);
  const e = Math.min(totalPages, s + maxVisible - 1);
  if (e - s + 1 < maxVisible) s = Math.max(1, e - maxVisible + 1);
  for (let i = s; i <= e; i++) pages.push(i);

  return (
    <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
      <p className="text-[12px] text-slate-400 font-bold font-figtree">
        Showing {start}–{end} of {totalEntries} entries
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="h-8 px-3 rounded-[6px] border border-slate-200 text-[12px] font-bold text-slate-500 hover:border-[#3B59DA] hover:text-[#3B59DA] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-figtree"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={cn(
              "h-8 w-8 rounded-[6px] text-[12px] font-bold font-figtree transition-all",
              p === page
                ? "bg-[#3B59DA] text-white border border-[#3B59DA]"
                : "border border-slate-200 text-slate-500 hover:border-[#3B59DA] hover:text-[#3B59DA]"
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="h-8 px-3 rounded-[6px] border border-slate-200 text-[12px] font-bold text-slate-500 hover:border-[#3B59DA] hover:text-[#3B59DA] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-figtree"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExpenditureHistoryPage() {
  // Pending filter state (not yet applied)
  const [fromDate,       setFromDate]       = useState(daysAgo(29));
  const [toDate,         setToDate]         = useState(todayStr());
  const [typeFilter,     setTypeFilter]     = useState<ExpenseType | "">("");
  const [supplierFilter, setSupplierFilter] = useState("");

  // Applied state — only changes on "Apply"
  const [applied, setApplied] = useState({
    fromDate:  daysAgo(29),
    toDate:    todayStr(),
    type:      "" as ExpenseType | "",
    supplier:  "",
  });

  const [page,        setPage]        = useState(1);
  const [exportOpen,  setExportOpen]  = useState(false);

  const { activeBrand } = useBrand();
  const { user }        = useUser();
  const brandId         = activeBrand?.id ?? null;

  const workspaceSlug = user?.workspace_slug;
  const backHref = workspaceSlug
    ? `/${workspaceSlug}/dashboard/expenditure`
    : "/dashboard/expenditure";

  // Convert date range → `days` param (backend accepts 1–90)
  const days = useMemo(() => {
    const from = new Date(applied.fromDate);
    const to   = new Date(applied.toDate);
    const lo   = from < to ? from : to;
    const hi   = from < to ? to   : from;
    const diff = Math.ceil((hi.getTime() - lo.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(90, Math.max(1, diff));
  }, [applied.fromDate, applied.toDate]);

  const historyParams = { page: 1, limit: 100, days };

  const { data: history, isLoading: histLoading } = useQuery({
    queryKey: [...QK.expenseHistory(brandId), historyParams],
    queryFn:  () => expenseService.getHistory(historyParams),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  // Client-side type + supplier filter on top of backend days filter
  const filteredItems = useMemo(() => {
    let items = history?.items ?? [];
    if (applied.type)
      items = items.filter((i) => i.expense_type === applied.type);
    if (applied.supplier.trim()) {
      const q = applied.supplier.toLowerCase();
      items = items.filter((i) => i.source?.toLowerCase().includes(q));
    }
    return items;
  }, [history?.items, applied.type, applied.supplier]);

  const totalEntries = filteredItems.length;
  const totalPages   = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const displayItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats computed from filtered items — always reflects the active period + filters
  const computedStats = useMemo(() => {
    const total       = filteredItems.reduce((s, i) => s + i.amount, 0);
    const cogs        = filteredItems.filter((i) => i.expense_type === "INGREDIENT").reduce((s, i) => s + i.amount, 0);
    const overhead    = filteredItems.filter((i) => i.expense_type === "OVERHEAD").reduce((s, i) => s + i.amount, 0);
    const cogsP       = total > 0 ? Math.round((cogs    / total) * 100) : 0;
    const overheadP   = total > 0 ? Math.round((overhead / total) * 100) : 0;
    return { total, cogs, overhead, cogsP, overheadP };
  }, [filteredItems]);

  const handleApply = () => {
    setApplied({ fromDate, toDate, type: typeFilter, supplier: supplierFilter });
    setPage(1);
  };

  const handleClear = () => {
    const f = daysAgo(29);
    const t = todayStr();
    setFromDate(f);
    setToDate(t);
    setTypeFilter("");
    setSupplierFilter("");
    setApplied({ fromDate: f, toDate: t, type: "", supplier: "" });
    setPage(1);
  };

  const periodLabel = `${fmtDate(applied.fromDate)} – ${fmtDate(applied.toDate)}`;

  return (
    <AppContainer>

      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-5">
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

      {/* ── Filter panel ── */}
      <div className="bg-white border border-slate-100 rounded-[12px] px-5 pt-5 pb-5 mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-black text-[#1E293B] font-figtree">Expense History Filter</h2>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="h-9 px-5 rounded-[8px] border border-slate-200 text-[12px] font-bold text-slate-600 hover:border-slate-300 transition-all font-figtree"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="h-9 px-5 rounded-[8px] bg-[#3B59DA] text-white text-[12px] font-bold font-figtree hover:bg-[#2D46B2] transition-all"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* From */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 font-figtree mb-1.5 uppercase tracking-wide">From</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-[8px] border border-slate-200 text-[12px] font-bold text-slate-700 font-figtree focus:outline-none focus:border-[#3B59DA] transition-all bg-white"
              />
            </div>
          </div>

          {/* To */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 font-figtree mb-1.5 uppercase tracking-wide">To</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-[8px] border border-slate-200 text-[12px] font-bold text-slate-700 font-figtree focus:outline-none focus:border-[#3B59DA] transition-all bg-white"
              />
            </div>
          </div>

          {/* Expense Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 font-figtree mb-1.5 uppercase tracking-wide">Expense Type</label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ExpenseType | "")}
                className="w-full h-9 pl-3 pr-8 rounded-[8px] border border-slate-200 text-[12px] font-bold text-slate-700 font-figtree focus:outline-none focus:border-[#3B59DA] transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="">All types</option>
                <option value="INGREDIENT">Ingredient</option>
                <option value="OVERHEAD">Operational</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 font-figtree mb-1.5 uppercase tracking-wide">Supplier</label>
            <input
              type="text"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              placeholder="e.g. Kimironko Market"
              className="w-full h-9 px-3 rounded-[8px] border border-slate-200 text-[12px] font-bold text-slate-700 font-figtree placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:border-[#3B59DA] transition-all bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── Stat cards — computed from the active filter, not a separate API call ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Total Expenditure"
          value={histLoading ? "—" : fmtFull(computedStats.total)}
          sub={periodLabel}
          loading={histLoading}
          accent
        />
        <StatCard
          label="Ingredient Cost"
          value={histLoading ? "—" : fmtFull(computedStats.cogs)}
          sub={histLoading ? "—" : `${computedStats.cogsP}% of total spend`}
          loading={histLoading}
        />
        <StatCard
          label="Operational Cost"
          value={histLoading ? "—" : fmtFull(computedStats.overhead)}
          sub={histLoading ? "—" : `${computedStats.overheadP}% of total spend`}
          loading={histLoading}
        />
        <StatCard
          label="Entries"
          value={histLoading ? "—" : totalEntries.toLocaleString()}
          sub="in selected period"
          loading={histLoading}
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-100 rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)]">

        {/* Table section header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-[15px] font-black text-[#1E293B] font-figtree">Expense History</h2>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 h-8 px-4 rounded-[8px] bg-indigo-50 text-[#3B59DA] text-[12px] font-bold font-figtree hover:bg-indigo-100 transition-all"
          >
            Export <Download className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 font-figtree">Item & Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 font-figtree">Type</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 font-figtree">Supplier</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 font-figtree">Quantity</th>
                <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 font-figtree">Amount</th>
              </tr>
            </thead>
            <tbody>
              {histLoading ? (
                Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !displayItems.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                        <TrendingDown className="h-5 w-5 text-slate-300" />
                      </div>
                      <p className="text-[13px] font-black text-slate-500 font-figtree">No expenses found</p>
                      <p className="text-[12px] text-slate-400 font-medium font-figtree">Try adjusting the filters or date range</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayItems.map((item) => <HistoryRow key={item.id} item={item} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Always-visible pagination */}
        {!histLoading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalEntries={totalEntries}
            onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
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
