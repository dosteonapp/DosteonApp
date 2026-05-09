"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ArrowRight,
  Utensils,
  ShoppingBag,
  Truck,
  RefreshCw,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { FigtreeText, UnifiedErrorBanner } from "@/components/ui/dosteon-ui";
import {
  salesService,
  SaleOrder,
  SaleOrderDetail,
} from "@/lib/services/salesService";
import { SalesStatsBanner } from "@/components/sales/SalesStatsBanner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const todayStr = () => new Date().toISOString().split("T")[0];

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(iso));
  } catch { return "--:--"; }
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));
  } catch { return ""; }
}

const CHANNEL_META: Record<string, { label: string; textColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  DINE_IN:  { label: "Dine-in",  textColor: "text-emerald-600", icon: Utensils   },
  TAKEAWAY: { label: "Takeaway", textColor: "text-amber-600",   icon: ShoppingBag },
  DELIVERY: { label: "Delivery", textColor: "text-[#3B59DA]",   icon: Truck       },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  COMPLETED:   { label: "Completed",   color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  IN_PROGRESS: { label: "In-Progress", color: "bg-violet-50  text-violet-500  border-violet-100"  },
  VOIDED:      { label: "Voided",      color: "bg-slate-100  text-slate-400  border-slate-200"    },
};

// ---------------------------------------------------------------------------
// Channel filter
// ---------------------------------------------------------------------------

type ChannelFilter = "ALL" | "DINE_IN" | "TAKEAWAY" | "DELIVERY";

const CHANNEL_FILTERS: { id: ChannelFilter; label: string }[] = [
  { id: "ALL",      label: "All"      },
  { id: "DINE_IN",  label: "Dine-in"  },
  { id: "TAKEAWAY", label: "Takeaway" },
  { id: "DELIVERY", label: "Delivery" },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabSalesHistory() {
  const [orders, setOrders]           = useState<SaleOrder[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, SaleOrderDetail>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("ALL");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const histData = await salesService.getHistory({ date: todayStr(), limit: 50 });
      setOrders(histData.orders);
    } catch {
      setError("Could not load sales history. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  if (isLoading) return <TabHistorySkeleton />;

  const filteredOrders = channelFilter === "ALL"
    ? orders
    : orders.filter((o) => o.channel === channelFilter);

  return (
    <div>
      {/* Week stats banner */}
      <SalesStatsBanner />

      <div className="p-5 md:p-7 space-y-5">
        {error && <UnifiedErrorBanner message={error} />}

        {/* Section header: title + channel pills */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-[18px] font-black text-[#1E293B] font-figtree leading-snug">
              Today&apos;s Sales History
            </h2>
            <p className="text-[12px] font-semibold text-slate-400 font-figtree mt-0.5">
              Each row is a sale. Click to see the dishes in that order.
            </p>
          </div>

          {/* Channel pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CHANNEL_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setChannelFilter(f.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all font-figtree whitespace-nowrap border",
                  channelFilter === f.id
                    ? "bg-[#1E293B] text-white border-[#1E293B] shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders table */}
        {filteredOrders.length === 0 ? (
          <EmptyHistoryState />
        ) : (
          <div className="rounded-[12px] border border-slate-100 overflow-hidden">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[120px_1fr_120px_120px_120px_140px] gap-3 px-5 py-3 bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] font-figtree">
              <span>Time Stamp</span>
              <span>Dishes Sold</span>
              <span>Channel</span>
              <span className="text-right">Revenue</span>
              <span className="text-center">Status</span>
              <span className="text-right">Action</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isExpanded={expandedId === order.id}
                  detail={detailCache[order.id] ?? null}
                  isLoadingDetail={loadingDetailId === order.id}
                  onToggle={() => handleExpand(order.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* See full history link */}
        <div className="flex justify-center pt-1">
          <Link
            href="/dashboard/sales/history"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-[#3B59DA] hover:underline font-figtree transition-colors"
          >
            See Full Sales History
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order row
// ---------------------------------------------------------------------------

function OrderRow({
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
  const st = STATUS_META[order.status] ?? STATUS_META.COMPLETED;

  // Build dish summary from detail if available, otherwise show count
  const dishSummary = detail
    ? detail.items.map((i) => `${i.quantity}x ${i.menu_item_name}`).join(", ")
    : `${order.items_count} dish${order.items_count !== 1 ? "es" : ""}`;

  return (
    <div className={cn("bg-white transition-colors", isExpanded && "bg-indigo-50/20")}>
      {/* Main row */}
      <div className="hidden md:grid grid-cols-[120px_1fr_120px_120px_120px_140px] gap-3 px-5 py-4 items-center">
        {/* Time stamp */}
        <div>
          <div className="text-[13px] font-bold text-[#1E293B] font-figtree tabular-nums">
            {formatTime(order.occurred_at)}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 font-figtree mt-0.5">
            {formatDate(order.occurred_at)}
          </div>
        </div>

        {/* Dishes sold */}
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-[#1E293B] font-figtree truncate">
            {dishSummary}
          </div>
          {!detail && (
            <div className="text-[11px] font-semibold text-slate-400 font-figtree mt-0.5">
              Order #{order.id.slice(-6).toUpperCase()}
            </div>
          )}
        </div>

        {/* Channel */}
        <div className={cn("text-[13px] font-bold font-figtree flex items-center gap-1.5", ch.textColor)}>
          <ch.icon className="h-3.5 w-3.5 shrink-0" />
          {ch.label}
        </div>

        {/* Revenue */}
        <div className="text-[14px] font-black text-[#1E293B] font-figtree tabular-nums text-right">
          RWF {fmt(order.total_revenue)}
        </div>

        {/* Status */}
        <div className="flex items-center justify-center">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold font-figtree",
            st.color
          )}>
            {st.label}
          </span>
        </div>

        {/* Action */}
        <button
          onClick={onToggle}
          className="flex items-center justify-end gap-1.5 text-[12px] font-bold text-[#3B59DA] font-figtree hover:underline transition-colors"
        >
          {isLoadingDetail
            ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            : <>Sales Details <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")} /></>
          }
        </button>
      </div>

      {/* Mobile row */}
      <button
        onClick={onToggle}
        className="md:hidden w-full text-left px-4 py-3.5 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-[#1E293B] font-figtree">
              {formatTime(order.occurred_at)} · RWF {fmt(order.total_revenue)}
            </div>
            <div className={cn("text-[11px] font-semibold font-figtree mt-0.5", ch.textColor)}>
              {ch.label} · {order.items_count} item{order.items_count !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold font-figtree", st.color)}>
            {st.label}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-slate-300 transition-transform", isExpanded && "rotate-180")} />
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="bg-slate-50/60 border-t border-slate-100 px-5 py-4">
          {isLoadingDetail || !detail ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-[6px]" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] font-figtree mb-3">
                Line Items
              </div>
              {detail.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[13px] font-bold text-[#1E293B] font-figtree truncate">
                      {item.menu_item_name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold font-figtree shrink-0">
                      ×{item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <span className="text-[11px] text-slate-400 font-semibold font-figtree tabular-nums">
                      RWF {fmt(item.unit_price)} each
                    </span>
                    <span className="text-[13px] font-black text-[#1E293B] font-figtree tabular-nums w-24 text-right">
                      RWF {fmt(item.line_total)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="text-[11px] font-bold text-slate-400 font-figtree uppercase tracking-[0.1em]">
                  Total
                </span>
                <span className="text-[15px] font-black text-[#1E293B] font-figtree tabular-nums">
                  RWF {fmt(order.total_revenue)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyHistoryState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-[12px] border border-slate-100">
      <div className="h-12 w-12 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center">
        <ReceiptText className="h-5 w-5 text-slate-300" />
      </div>
      <FigtreeText className="text-[13px] font-semibold text-slate-400 max-w-[220px] leading-relaxed">
        No sales recorded today. Log your first sale in the Log Sales tab.
      </FigtreeText>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TabHistorySkeleton() {
  return (
    <div>
      {/* Banner skeleton */}
      <div className="bg-gradient-to-r from-[#091558] via-[#3851dd] to-[#091558] px-5 md:px-7 py-6 md:py-8 grid grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-[12px] p-4 md:p-5 animate-pulse space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-slate-100" />
              <div className="h-2 w-3/4 rounded bg-slate-100" />
            </div>
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="h-2 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="p-7 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded-full" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
          </div>
        </div>
        <div className="rounded-[12px] border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3">
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-t border-slate-100">
              <Skeleton className="h-10 w-full rounded-[6px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
