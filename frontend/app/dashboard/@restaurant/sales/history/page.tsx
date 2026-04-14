"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Utensils,
  ShoppingBag,
  Truck,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  RefreshCw,
  Filter,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AppContainer,
  FigtreeText,
  PrimarySurfaceCard,
} from "@/components/ui/dosteon-ui";
import {
  salesService,
  SaleOrder,
  SaleOrderDetail,
  SalesHistory,
} from "@/lib/services/salesService";

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
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  DINE_IN:  { label: "Dine-In",  color: "bg-indigo-50 text-[#3B59DA] border-indigo-100",     icon: Utensils    },
  TAKEAWAY: { label: "Takeaway", color: "bg-amber-50  text-amber-600  border-amber-100",     icon: ShoppingBag },
  DELIVERY: { label: "Delivery", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: Truck       },
};

const CHANNELS = [
  { id: "",         label: "All Channels" },
  { id: "DINE_IN",  label: "Dine-In"      },
  { id: "TAKEAWAY", label: "Takeaway"     },
  { id: "DELIVERY", label: "Delivery"     },
];

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SalesHistoryPage() {
  const [date, setDate]       = useState("");
  const [channel, setChannel] = useState("");
  const [page, setPage]       = useState(1);

  const [data, setData]       = useState<SalesHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [detailCache, setDetailCache]   = useState<Record<string, SaleOrderDetail>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await salesService.getHistory({
        ...(date    ? { date }    : {}),
        ...(channel ? { channel } : {}),
        page,
        limit: PAGE_SIZE,
      });
      setData(result);
    } catch {
      setError("Could not load sales history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [date, channel, page]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  const handleDateChange = (v: string) => { setDate(v); setPage(1); };
  const handleChannelChange = (v: string) => { setChannel(v); setPage(1); };

  const handleExpand = async (orderId: string) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (detailCache[orderId]) return;
    setLoadingDetailId(orderId);
    try {
      const detail = await salesService.getOrderDetail(orderId);
      setDetailCache((prev) => ({ ...prev, [orderId]: detail }));
    } catch {
      // silently fail
    } finally {
      setLoadingDetailId(null);
    }
  };

  const orders = data?.orders ?? [];
  const totalPages = data?.pages ?? 1;

  // Totals for the current page
  const pageRevenue = orders.reduce((s, o) => s + o.total_revenue, 0);
  const pageProfit  = orders.reduce((s, o) => s + o.gross_profit, 0);
  const pageMargin  = pageRevenue > 0 ? ((pageProfit / pageRevenue) * 100).toFixed(1) : "0";

  return (
    <AppContainer>

      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/sales"
          className="h-9 w-9 rounded-[10px] border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-[#3B59DA] hover:border-[#3B59DA]/30 transition-all active:scale-95 shadow-sm shrink-0"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5px]" />
        </Link>
        <div>
          <h1 className="text-[20px] md:text-[24px] font-black text-[#1E293B] tracking-tight font-figtree leading-tight">
            Sales History
          </h1>
          <FigtreeText className="text-[12px] font-semibold text-slate-400">
            {data ? `${data.total} order${data.total !== 1 ? "s" : ""} found` : "Loading…"}
          </FigtreeText>
        </div>
      </div>

      {/* Filter bar */}
      <PrimarySurfaceCard>
        <div className="p-4 md:p-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="h-4 w-4" />
            <span className="text-[12px] font-bold uppercase tracking-[0.1em] font-figtree">Filters</span>
          </div>

          {/* Date picker */}
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-9 px-3 rounded-[8px] border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 font-figtree focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-[#3B59DA]/40 transition-all"
          />

          {/* Channel filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleChannelChange(ch.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-bold transition-all font-figtree",
                  channel === ch.id
                    ? "bg-[#3B59DA] text-white shadow-[0_2px_6px_rgba(59,89,218,0.25)]"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {(date || channel) && (
            <button
              onClick={() => { handleDateChange(""); handleChannelChange(""); }}
              className="text-[12px] font-bold text-slate-400 hover:text-rose-500 transition-colors font-figtree ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </PrimarySurfaceCard>

      {/* Content */}
      <PrimarySurfaceCard>
        {isLoading ? (
          <HistorySkeleton />
        ) : error ? (
          <div className="p-6">
            <p className="text-[13px] font-semibold text-rose-500 font-figtree">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[1fr_120px_90px_110px_110px_36px] gap-3 px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] font-figtree bg-slate-50/50">
              <span>Date & Time</span>
              <span>Channel</span>
              <span className="text-right">Items</span>
              <span className="text-right">Revenue</span>
              <span className="text-right">Profit</span>
              <span />
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

            {/* Page summary footer */}
            <div className="px-5 py-3.5 bg-slate-50/40 flex items-center justify-between gap-4">
              <span className="text-[12px] font-bold text-slate-500 font-figtree">
                Page {page} of {totalPages} · {data?.total ?? 0} total
              </span>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-5 text-[12px] font-figtree">
                  <div>
                    <span className="text-slate-400 font-semibold">Revenue </span>
                    <span className="font-black text-[#1E293B] tabular-nums">{fmt(pageRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Profit </span>
                    <span className={cn(
                      "font-black tabular-nums",
                      pageProfit > 0 ? "text-emerald-600" : "text-slate-400"
                    )}>
                      {fmt(pageProfit)}
                      <span className="text-[10px] font-semibold opacity-60 ml-1">({pageMargin}%)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PrimarySurfaceCard>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="h-9 w-9 p-0 rounded-[8px] border-slate-200"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
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
          </div>

          <Button
            variant="outline"
            className="h-9 w-9 p-0 rounded-[8px] border-slate-200"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

    </AppContainer>
  );
}

// ---------------------------------------------------------------------------
// History order row (with inline expand)
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
  const ch = CHANNEL_META[order.channel] ?? CHANNEL_META.DINE_IN;
  const profit = order.gross_profit;
  const margin = order.total_revenue > 0
    ? ((profit / order.total_revenue) * 100).toFixed(0)
    : "0";

  return (
    <div className={cn(
      "transition-colors",
      isExpanded && "bg-indigo-50/20"
    )}>
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 md:grid md:grid-cols-[1fr_120px_90px_110px_110px_36px] md:gap-3 flex flex-wrap gap-x-5 gap-y-1.5 items-center hover:bg-slate-50/60 transition-colors"
      >
        {/* Date & time */}
        <span className="text-[13px] font-bold text-[#1E293B] font-figtree">
          {formatDateTime(order.occurred_at)}
        </span>

        {/* Channel */}
        <div>
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold font-figtree",
            ch.color
          )}>
            <ch.icon className="h-3 w-3 shrink-0" />
            {ch.label}
          </span>
        </div>

        {/* Items */}
        <span className="text-[13px] font-semibold text-slate-500 font-figtree md:text-right">
          <span className="md:hidden text-slate-400 text-[11px]">Items: </span>
          {order.items_count}
        </span>

        {/* Revenue */}
        <span className="text-[14px] font-black text-[#1E293B] font-figtree md:text-right tabular-nums">
          {fmt(order.total_revenue)}
        </span>

        {/* Profit */}
        <span className={cn(
          "text-[13px] font-bold font-figtree md:text-right tabular-nums",
          profit > 0 ? "text-emerald-600" : profit < 0 ? "text-rose-500" : "text-slate-400"
        )}>
          {fmt(profit)}
          <span className="text-[10px] font-semibold opacity-60 ml-0.5">({margin}%)</span>
        </span>

        {/* Chevron */}
        <div className="md:flex hidden items-center justify-center shrink-0">
          {isLoadingDetail ? (
            <RefreshCw className="h-3.5 w-3.5 text-slate-300 animate-spin" />
          ) : (
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-slate-300 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
          )}
        </div>
      </button>

      {/* Expanded items */}
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
                    <span className="text-[13px] font-black text-[#1E293B] font-figtree tabular-nums w-20 text-right">
                      {fmt(item.line_total)}
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
// Empty + skeleton
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="h-12 w-12 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center">
        <ReceiptText className="h-5 w-5 text-slate-300" />
      </div>
      <FigtreeText className="text-[13px] font-semibold text-slate-400 max-w-[220px] leading-relaxed">
        No sales match your filters. Try adjusting the date or channel.
      </FigtreeText>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="p-5 space-y-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-[8px]" />
      ))}
    </div>
  );
}
