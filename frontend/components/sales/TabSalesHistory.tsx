"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Utensils,
  ShoppingBag,
  Truck,
  Calendar,
  RefreshCw,
  ReceiptText,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { FigtreeText, UnifiedErrorBanner } from "@/components/ui/dosteon-ui";
import {
  salesService,
  WeekStats,
  SaleOrder,
  SaleOrderDetail,
} from "@/lib/services/salesService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const todayStr = () => new Date().toISOString().split("T")[0];

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return "--:--";
  }
}

const CHANNEL_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  DINE_IN:  { label: "Dine-In",  color: "bg-indigo-50 text-[#3B59DA] border-indigo-100",  icon: Utensils   },
  TAKEAWAY: { label: "Takeaway", color: "bg-amber-50  text-amber-600  border-amber-100",  icon: ShoppingBag },
  DELIVERY: { label: "Delivery", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: Truck },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabSalesHistory() {
  const [weekStats, setWeekStats]     = useState<WeekStats | null>(null);
  const [orders, setOrders]           = useState<SaleOrder[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, SaleOrderDetail>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, histData] = await Promise.all([
        salesService.getWeekStats(),
        salesService.getHistory({ date: todayStr(), limit: 50 }),
      ]);
      setWeekStats(statsData);
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
      // silently fail — expand will show nothing
    } finally {
      setLoadingDetailId(null);
    }
  };

  if (isLoading) return <TabHistorySkeleton />;

  return (
    <div>
      {/* Week stats banner */}
      <WeekStatsBanner stats={weekStats} />

      <div className="p-5 md:p-7 space-y-5">
        {error && <UnifiedErrorBanner message={error} />}

        {/* Today's section header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-slate-400 stroke-[2px]" />
            <span className="text-[14px] font-black text-[#1E293B] font-figtree">
              Today's Sales
            </span>
            {orders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold font-figtree">
                {orders.length}
              </span>
            )}
          </div>
          <Link
            href="/dashboard/sales/history"
            className="flex items-center gap-1.5 text-[12px] font-bold text-[#3B59DA] hover:underline font-figtree transition-colors"
          >
            See Full History <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <EmptyHistoryState />
        ) : (
          <div className="space-y-2">
            {/* Column header (desktop only) */}
            <div className="hidden md:grid grid-cols-[80px_1fr_100px_100px_100px_36px] gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] font-figtree">
              <span>Time</span>
              <span>Channel</span>
              <span className="text-right">Items</span>
              <span className="text-right">Revenue</span>
              <span className="text-right">Profit</span>
              <span />
            </div>

            {orders.map((order) => (
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
        )}

        {/* Today's revenue summary */}
        {orders.length > 0 && (
          <TodaySummaryRow orders={orders} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Week stats banner
// ---------------------------------------------------------------------------

function WeekStatsBanner({ stats }: { stats: WeekStats | null }) {
  const s = stats ?? {
    week_revenue: 0, week_revenue_pct: null,
    avg_daily_revenue: 0, best_day: null,
    avg_gross_margin: 0, avg_gross_margin_pts: null,
  };

  return (
    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-indigo-50/20 px-5 md:px-8 py-5">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] font-figtree mb-4">
        This Week (Last 7 Days)
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-slate-200/60">
        {/* Week Revenue */}
        <WeekStat
          label="Week Revenue"
          value={fmt(s.week_revenue)}
          change={s.week_revenue_pct}
          changeUnit="%"
          changeLabel="vs last 7d"
        />
        {/* Avg Daily */}
        <WeekStat
          label="Avg Daily Revenue"
          value={fmt(s.avg_daily_revenue)}
          className="md:pl-6"
        />
        {/* Best Day */}
        <WeekStat
          label="Best Day"
          value={s.best_day ?? "—"}
          className="md:pl-6"
        />
        {/* Gross Margin */}
        <WeekStat
          label="Avg Gross Margin"
          value={`${s.avg_gross_margin.toFixed(1)}%`}
          change={s.avg_gross_margin_pts}
          changeUnit="pp"
          changeLabel="vs last 7d"
          className="md:pl-6"
        />
      </div>
    </div>
  );
}

function WeekStat({
  label,
  value,
  change,
  changeUnit = "%",
  changeLabel,
  className,
}: {
  label: string;
  value: string;
  change?: number | null;
  changeUnit?: string;
  changeLabel?: string;
  className?: string;
}) {
  const isPositive = change != null && change > 0;
  const isNegative = change != null && change < 0;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-[11px] font-semibold text-slate-400 font-figtree">{label}</div>
      <div className="text-[22px] font-black text-[#1E293B] tracking-tight font-figtree leading-none">
        {value}
      </div>
      {change != null && (
        <div className={cn(
          "flex items-center gap-1 text-[11px] font-bold font-figtree",
          isPositive ? "text-emerald-600" : isNegative ? "text-rose-500" : "text-slate-400"
        )}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 shrink-0" />
          ) : isNegative ? (
            <TrendingDown className="h-3 w-3 shrink-0" />
          ) : (
            <Minus className="h-3 w-3 shrink-0" />
          )}
          {isPositive ? "+" : ""}{change.toFixed(1)}{changeUnit}
          {changeLabel && <span className="text-slate-400 font-normal">&nbsp;{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order row with inline expand
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
  const profit = order.gross_profit;
  const margin = order.total_revenue > 0
    ? ((profit / order.total_revenue) * 100).toFixed(0)
    : "0";

  return (
    <div className={cn(
      "rounded-[10px] border transition-all overflow-hidden",
      isExpanded ? "border-[#3B59DA]/20 shadow-[0_2px_12px_rgba(59,89,218,0.06)]" : "border-slate-100 hover:border-slate-200"
    )}>
      {/* Main row */}
      <button
        onClick={onToggle}
        className="w-full text-left bg-white px-4 py-3.5 md:grid md:grid-cols-[80px_1fr_100px_100px_100px_36px] md:gap-3 flex flex-wrap gap-x-4 gap-y-1 items-center transition-colors hover:bg-slate-50/50"
      >
        {/* Time */}
        <span className="text-[13px] font-bold text-slate-500 font-figtree tabular-nums whitespace-nowrap">
          {formatTime(order.occurred_at)}
        </span>

        {/* Channel badge */}
        <div>
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold font-figtree",
            ch.color
          )}>
            <ch.icon className="h-3 w-3 shrink-0" />
            {ch.label}
          </span>
        </div>

        {/* Items count */}
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
          <span className="text-[10px] font-semibold opacity-60 ml-0.5">
            ({margin}%)
          </span>
        </span>

        {/* Expand chevron */}
        <div className="md:flex hidden items-center justify-center shrink-0">
          {isLoadingDetail ? (
            <RefreshCw className="h-3.5 w-3.5 text-slate-300 animate-spin" />
          ) : (
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-slate-300 transition-transform",
              isExpanded && "rotate-180"
            )} />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="bg-slate-50/60 border-t border-slate-100 px-4 py-4">
          {isLoadingDetail || !detail ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-[6px]" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] font-figtree mb-3">
                Line Items
              </div>
              {detail.items.map((item) => (
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
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[11px] text-slate-400 font-semibold font-figtree tabular-nums">
                      {fmt(item.unit_price)} each
                    </span>
                    <span className="text-[13px] font-black text-[#1E293B] font-figtree tabular-nums w-20 text-right">
                      {fmt(item.line_total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Today summary footer row
// ---------------------------------------------------------------------------

function TodaySummaryRow({ orders }: { orders: SaleOrder[] }) {
  const totalRev = orders.reduce((s, o) => s + o.total_revenue, 0);
  const totalProfit = orders.reduce((s, o) => s + o.gross_profit, 0);
  const margin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : "0";

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px] bg-indigo-50/40 border border-indigo-100/40">
      <span className="text-[12px] font-bold text-slate-500 font-figtree">
        Today's Total ({orders.length} sale{orders.length !== 1 ? "s" : ""})
      </span>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[10px] font-semibold text-slate-400 font-figtree uppercase tracking-[0.1em]">Revenue</div>
          <div className="text-[15px] font-black text-[#1E293B] font-figtree tabular-nums">{fmt(totalRev)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold text-slate-400 font-figtree uppercase tracking-[0.1em]">Profit</div>
          <div className={cn(
            "text-[15px] font-black font-figtree tabular-nums",
            totalProfit > 0 ? "text-emerald-600" : "text-slate-400"
          )}>
            {fmt(totalProfit)}
            <span className="text-[10px] font-semibold opacity-60 ml-1">({margin}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyHistoryState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
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
      <div className="border-b border-slate-100 bg-slate-50/80 px-8 py-6">
        <Skeleton className="h-3.5 w-40 rounded-full mb-5" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-7 space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}
