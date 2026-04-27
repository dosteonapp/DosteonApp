"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Utensils,
  ShoppingBag,
  Truck,
  ReceiptText,
  RefreshCw,
  Plus,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AppContainer } from "@/components/ui/dosteon-ui";
import {
  salesService,
  SaleOrder,
  SaleOrderDetail,
  SalesHistory,
} from "@/lib/services/salesService";
import { BrandSwitcherCard } from "@/components/BrandSwitcherCard";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const CHANNEL_META: Record<string, {
  label: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  DINE_IN:  { label: "Dine-In",  textColor: "text-[#3B59DA]",   icon: Utensils    },
  TAKEAWAY: { label: "Takeaway", textColor: "text-amber-500",   icon: ShoppingBag },
  DELIVERY: { label: "Delivery", textColor: "text-emerald-600", icon: Truck       },
};

const CHANNEL_FILTERS = [
  { id: "",         label: "All"      },
  { id: "DINE_IN",  label: "Dine-In"  },
  { id: "TAKEAWAY", label: "Takeaway" },
  { id: "DELIVERY", label: "Delivery" },
];

const STATUS_META: Record<string, { label: string; className: string }> = {
  COMPLETED:   { label: "Completed",   className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-violet-50  text-violet-600  border-violet-200"  },
  VOID:        { label: "Void",        className: "bg-rose-50    text-rose-500    border-rose-200"    },
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SalesHistoryPage() {
  const today = new Date();
  const defaultRange: DateRange = { from: subDays(today, 29), to: today };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultRange);
  const [calOpen, setCalOpen]     = useState(false);
  const [channel, setChannel]     = useState("");
  const [page, setPage]           = useState(1);

  const [data, setData]           = useState<SalesHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [expandedId, setExpandedId]           = useState<string | null>(null);
  const [detailCache, setDetailCache]         = useState<Record<string, SaleOrderDetail>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Parameters<typeof salesService.getHistory>[0] = {
        channel: channel || undefined,
        page,
        limit: PAGE_SIZE,
      };
      if (dateRange?.from && dateRange?.to) {
        params.start_date = format(dateRange.from, "yyyy-MM-dd");
        params.end_date   = format(dateRange.to,   "yyyy-MM-dd");
      }
      setData(await salesService.getHistory(params));
    } catch {
      setError("Could not load sales history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, channel, page]);

  useEffect(() => { load(); }, [load]);

  const handleChannelChange = (v: string) => { setChannel(v); setPage(1); };
  const handleRangeSelect   = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) { setCalOpen(false); setPage(1); }
  };

  const handleExpand = async (orderId: string) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (detailCache[orderId]) return;
    setLoadingDetailId(orderId);
    try {
      const detail = await salesService.getOrderDetail(orderId);
      setDetailCache((prev) => ({ ...prev, [orderId]: detail }));
    } catch { /* silently fail */ } finally {
      setLoadingDetailId(null);
    }
  };

  const orders     = data?.orders ?? [];
  const totalPages = data?.pages  ?? 1;
  const totalCount = data?.total  ?? 0;
  const showFrom   = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showTo     = Math.min(page * PAGE_SIZE, totalCount);

  const dateRangeLabel = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "MMM dd, yyyy")} – ${format(dateRange.to, "MMM dd, yyyy")}`
    : dateRange?.from
      ? `From ${format(dateRange.from, "MMM dd, yyyy")}`
      : "Select date range";

  return (
    <AppContainer>

      {/* ── Header — on page background ── */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sales"
            className="h-9 w-9 rounded-[10px] border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-[#3B59DA] hover:border-[#3B59DA]/30 transition-all active:scale-95 shadow-sm shrink-0"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5px]" />
          </Link>
          <BrandSwitcherCard />
        </div>
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
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span className="hidden sm:block">Log Sales</span>
              <TrendingUp className="h-3.5 w-3.5 sm:hidden shrink-0" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Hero — SALES RANGE on bg, TOTAL PERIOD REVENUE in stat card ── */}
      <div className="flex items-center justify-between gap-6 px-1">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] font-figtree mb-1.5">
            Sales Range
          </div>
          <div className="text-[22px] md:text-[32px] font-black text-[#1E293B] tracking-tight font-figtree leading-tight">
            {dateRangeLabel}
          </div>
        </div>

        {/* Stat card */}
        <div className="shrink-0 bg-white border border-slate-100 rounded-[12px] px-5 py-4 text-right shadow-[0_4px_16px_rgba(0,0,0,0.04)] min-w-[180px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] font-figtree mb-1.5">
            Total Period Revenue
          </div>
          {isLoading ? (
            <div className="h-8 w-36 rounded-[6px] bg-slate-100 animate-pulse ml-auto" />
          ) : (
            <div className="text-[22px] md:text-[26px] font-black text-[#3B59DA] tracking-tight font-figtree leading-tight">
              RWF {fmt(data?.period_revenue ?? 0)}
            </div>
          )}
        </div>
      </div>

      {/* ── Single main card: filters + table + pagination ── */}
      <div className="bg-white border border-slate-100 rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)]">

        {/* Filter row */}
        <div className="px-5 py-4 md:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Date range picker */}
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 h-9 px-3.5 rounded-[8px] border border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-600 font-figtree hover:border-[#3B59DA]/40 hover:text-[#3B59DA] transition-all">
                <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{dateRangeLabel}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                disabled={{ after: today }}
                initialFocus
              />
              {dateRange && (
                <div className="border-t border-slate-100 px-3 py-2 flex justify-end">
                  <button
                    onClick={() => { setDateRange(undefined); setPage(1); setCalOpen(false); }}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors font-figtree"
                  >
                    Clear
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Channel pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] font-figtree mr-0.5">
              Channel:
            </span>
            {CHANNEL_FILTERS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleChannelChange(ch.id)}
                className={cn(
                  "h-8 px-3.5 rounded-full text-[12px] font-bold border transition-all font-figtree",
                  channel === ch.id
                    ? "bg-[#1E293B] text-white border-[#1E293B]"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table content */}
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[8px]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-[13px] font-semibold text-rose-500 font-figtree">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[130px_1fr_130px_110px_130px_140px] gap-3 px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] font-figtree bg-slate-50/60">
              <span>Time Stamp</span>
              <span>Dishes Sold</span>
              <span>Channel</span>
              <span className="text-right">Revenue</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {orders.map((order) => (
              <HistoryOrderRow
                key={order.id}
                order={order}
                isExpanded={expandedId === order.id}
                detail={detailCache[order.id] ?? null}
                isLoadingDetail={loadingDetailId === order.id}
                onToggle={() => handleExpand(order.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination footer — inside the card */}
        {!isLoading && totalCount > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[12px] font-semibold text-slate-400 font-figtree">
              Showing {showFrom} to {showTo} of {totalCount} results
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  className="h-9 px-3 rounded-[8px] border-slate-200 text-[12px] font-bold font-figtree"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                  Prev
                </Button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5
                    ? i + 1
                    : page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                        ? totalPages - 4 + i
                        : page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-9 w-9 rounded-[8px] text-[13px] font-bold font-figtree transition-all",
                        p === page
                          ? "bg-[#3B59DA] text-white shadow-[0_2px_8px_rgba(59,89,218,0.25)]"
                          : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}

                <Button
                  variant="outline"
                  className="h-9 px-3 rounded-[8px] border-slate-200 text-[12px] font-bold font-figtree"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

    </AppContainer>
  );
}

// ---------------------------------------------------------------------------
// Order row
// ---------------------------------------------------------------------------

function HistoryOrderRow({
  order,
  isExpanded,
  detail,
  isLoadingDetail,
  onToggle,
}: {
  order: SaleOrder;
  isExpanded: boolean;
  detail: SaleOrderDetail | null;
  isLoadingDetail: boolean;
  onToggle: () => void;
}) {
  const ch     = CHANNEL_META[order.channel] ?? CHANNEL_META.DINE_IN;
  const status = STATUS_META[order.status]   ?? STATUS_META.COMPLETED;

  return (
    <div className={cn("transition-colors", isExpanded && "bg-indigo-50/20")}>
      <div className="w-full px-5 py-4 md:grid md:grid-cols-[130px_1fr_130px_110px_130px_140px] md:gap-3 flex flex-wrap gap-x-5 gap-y-1.5 items-center">

        {/* Time stamp */}
        <span className="text-[12px] font-bold text-[#1E293B] font-figtree">
          {formatDateTime(order.occurred_at)}
        </span>

        {/* Dishes sold */}
        <span className="text-[13px] font-semibold text-slate-600 font-figtree">
          {order.items_count} {order.items_count === 1 ? "dish" : "dishes"}
        </span>

        {/* Channel */}
        <div className="flex items-center gap-1.5">
          <ch.icon className={cn("h-3.5 w-3.5 shrink-0", ch.textColor)} />
          <span className={cn("text-[12px] font-bold font-figtree", ch.textColor)}>
            {ch.label}
          </span>
        </div>

        {/* Revenue */}
        <span className="text-[13px] font-black text-[#1E293B] font-figtree md:text-right tabular-nums">
          RWF {fmt(order.total_revenue)}
        </span>

        {/* Status */}
        <div>
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold font-figtree",
            status.className
          )}>
            {status.label}
          </span>
        </div>

        {/* Action */}
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-[12px] font-bold text-[#3B59DA] hover:text-[#2D46B2] transition-colors font-figtree"
        >
          {isLoadingDetail ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <>
              Sales Details
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
            </>
          )}
        </button>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-5 pb-4 border-t border-slate-100 bg-slate-50/40">
          <div className="pt-4 space-y-2">
            {isLoadingDetail || !detail ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-[6px]" />
                ))}
              </div>
            ) : (
              detail.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[12px] font-bold text-[#1E293B] font-figtree truncate">
                      {item.menu_item_name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold font-figtree shrink-0">
                      ×{item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-[11px] text-slate-400 font-semibold font-figtree tabular-nums hidden sm:block">
                      {fmt(item.unit_price)} each
                    </span>
                    <span className="text-[13px] font-black text-[#1E293B] font-figtree tabular-nums w-24 text-right">
                      RWF {fmt(item.line_total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="h-12 w-12 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center">
        <ReceiptText className="h-5 w-5 text-slate-300" />
      </div>
      <p className="text-[13px] font-semibold text-slate-400 font-figtree max-w-[220px] leading-relaxed">
        No sales match your filters. Try adjusting the date range or channel.
      </p>
    </div>
  );
}
