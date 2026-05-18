"use client";

import {
  ArrowRight,
  Package,
  Plus,
  Receipt,
  Clock,
  ChefHat,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { salesService } from "@/lib/services/salesService";
import { expenseService } from "@/lib/services/expenseService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { AppContainer } from "@/components/ui/dosteon-ui";
import { cn } from "@/lib/utils";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useBrand } from "@/context/BrandContext";
import { useUser } from "@/context/UserContext";
import { QK } from "@/lib/queryKeys";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Donut chart (CSS conic-gradient, no extra deps)
// ---------------------------------------------------------------------------

function DonutChart({
  healthy,
  low,
  critical,
}: {
  healthy: number;
  low: number;
  critical: number;
}) {
  const total = healthy + low + critical;
  if (total === 0) {
    return (
      <div className="relative h-[100px] w-[100px] shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-slate-100" />
        <div className="absolute inset-[14px] rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-[16px] font-black text-[#1E293B] leading-none">0</span>
          <span className="text-[9px] text-slate-400 font-medium mt-0.5">items</span>
        </div>
      </div>
    );
  }
  const hDeg = (healthy / total) * 360;
  const lDeg = (low / total) * 360;
  const cDeg = (critical / total) * 360;

  const gradient = (() => {
    const parts: string[] = [];
    let cursor = 0;
    if (healthy > 0) { parts.push(`#22c55e ${cursor}deg ${cursor + hDeg}deg`); cursor += hDeg; }
    if (low > 0)     { parts.push(`#eab308 ${cursor}deg ${cursor + lDeg}deg`); cursor += lDeg; }
    if (critical > 0){ parts.push(`#ef4444 ${cursor}deg ${cursor + cDeg}deg`); }
    return `conic-gradient(${parts.join(", ")})`;
  })();

  return (
    <div className="relative h-[100px] w-[100px] shrink-0 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full" style={{ background: gradient }} />
      <div className="absolute inset-[14px] rounded-full bg-white flex flex-col items-center justify-center">
        <span className="text-[16px] font-black text-[#1E293B] leading-none">{total}</span>
        <span className="text-[9px] text-slate-400 font-medium mt-0.5">items</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero stat card (white card inside blue gradient banner)
// ---------------------------------------------------------------------------

function HeroStat({
  label,
  value,
  valueColor,
  sub1,
  sub1Green,
  sub2,
}: {
  label: string;
  value: string;
  valueColor?: "blue" | "green" | "default";
  sub1?: string;
  sub1Green?: boolean;
  sub2?: string;
}) {
  const valueClass =
    valueColor === "blue"
      ? "text-[#3B59DA]"
      : valueColor === "green"
      ? "text-emerald-500"
      : "text-[#1E293B]";

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 flex flex-col gap-2 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
        {label}
      </p>
      <p className={cn("text-[22px] md:text-[26px] font-black leading-tight truncate", valueClass)}>
        {value}
      </p>
      <div className="space-y-0.5">
        {sub1 && (
          <p className={cn("text-[12px] font-semibold leading-none flex items-center gap-1", sub1Green ? "text-emerald-500" : "text-slate-500")}>
            {sub1}
          </p>
        )}
        {sub2 && (
          <p className="text-[11px] text-slate-400 leading-none">{sub2}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini stat card (inside Inventory Health)
// ---------------------------------------------------------------------------

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
        {label}
      </p>
      <p className="text-[18px] font-black text-[#1E293B] leading-tight">
        {value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RestaurantDashboardPage() {
  const {
    isOpen,
    isLoading: isStatusLoading,
    isClosingTimeReached,
    targetClosingTime,
    canStartOpening,
    finishOpening,
  } = useRestaurantDayLifecycle();
  const { user } = useUser();
  const [isQuickOpening, setIsQuickOpening] = useState(false);
  const { activeBrand } = useBrand();
  const brandId: string | null = activeBrand?.id ?? null;

  const { data: stats = { totalItems: 0, countedItems: 0, healthy: 0, low: 0, critical: 0 } } =
    useQuery({
      queryKey: QK.dashboardStats(brandId),
      queryFn: () => restaurantOpsService.getStats(),
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
      placeholderData: keepPreviousData,
    });

  const { data: activities = [] } = useQuery({
    queryKey: QK.recentActivities(brandId),
    queryFn: () => restaurantOpsService.getRecentActivities({ offset: 0, limit: 5 }),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });

  const { data: todayStats } = useQuery({
    queryKey: QK.todayStats(brandId),
    queryFn: () => salesService.getTodayStats(),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    enabled: isOpen,
    placeholderData: keepPreviousData,
  });

  const { data: expenseStats } = useQuery({
    queryKey: QK.expenseStats(brandId),
    queryFn: () => expenseService.getTodayStats(),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    enabled: isOpen,
    placeholderData: keepPreviousData,
  });

  const { data: menuStats } = useQuery({
    queryKey: QK.menuStats(brandId),
    queryFn: () => salesService.getMenuStats(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: keepPreviousData,
  });

  const { data: settings } = useQuery({
    queryKey: QK.orgSettings(user?.organization_id ?? null),
    queryFn: () => restaurantOpsService.getSettings(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

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

  // Derived values
  const needReview = stats.low + stats.critical;
  const grossMarginPct =
    todayStats?.today_revenue && todayStats.today_revenue > 0
      ? Math.round((todayStats.today_gross_profit / todayStats.today_revenue) * 100)
      : null;

  const formattedOpeningTime = (() => {
    const raw = settings?.opening_time as string | undefined;
    if (!raw) return "—";
    if (raw.includes("AM") || raw.includes("PM")) return raw;
    const [h, m] = raw.split(":").map(Number);
    if (isNaN(h)) return raw;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  })();

  const fmt = (n: number) =>
    `RWF ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  if (isStatusLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <AppContainer className="pb-24">

      {/* ── ① Quick action buttons ───────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        {isOpen ? (
          <>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 font-semibold text-[13px] gap-2 hover:bg-slate-50"
              asChild
            >
              <Link href="/dashboard/expenses">
                <Receipt className="h-4 w-4" />
                Log Expenses
              </Link>
            </Button>
            <Button
              className="h-10 px-4 rounded-xl bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-semibold text-[13px] gap-2 shadow-sm"
              asChild
            >
              <Link href="/dashboard/sales">
                <Plus className="h-4 w-4" />
                Log Sales
              </Link>
            </Button>
          </>
        ) : skipsStockCount ? (
          <Button
            className="h-10 px-5 rounded-xl bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-semibold text-[13px] gap-2 shadow-sm"
            onClick={handleQuickOpen}
            disabled={isQuickOpening || !canStartOpening}
          >
            {isQuickOpening ? "Opening…" : "Open Kitchen"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="h-10 px-5 rounded-xl bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-semibold text-[13px] gap-2 shadow-sm"
            asChild
          >
            <Link href="/dashboard/inventory/daily-stock-count">
              <ClipboardList className="h-4 w-4" />
              Count Daily Stock
            </Link>
          </Button>
        )}
      </div>

      {/* ── ② Hero stats banner ──────────────────────────────────────── */}
      <div
        className="w-full rounded-2xl mb-6 p-3 md:p-4 lg:p-5"
        style={{
          background:
            "linear-gradient(135deg, #091558 0%, #3851dd 50%, #091558 100%)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <HeroStat
            label="Total Revenue Today"
            value={isOpen && todayStats ? fmt(todayStats.today_revenue) : "—"}
            valueColor="blue"
            sub1={
              isOpen && grossMarginPct !== null
                ? `↑ +${grossMarginPct}% vs yesterday`
                : undefined
            }
            sub1Green={isOpen && grossMarginPct !== null && grossMarginPct > 0}
            sub2="Revenue across all brands"
          />
          <HeroStat
            label="Total Expenditure"
            value={isOpen && expenseStats ? fmt(expenseStats.total_expenses) : "—"}
            valueColor="default"
            sub2="COGS + overheads"
          />
          <HeroStat
            label="Gross Profit"
            value={isOpen && todayStats ? fmt(todayStats.today_gross_profit) : "—"}
            valueColor="green"
            sub1={
              isOpen && grossMarginPct !== null
                ? `↑ ${grossMarginPct}% margin`
                : undefined
            }
            sub1Green={isOpen && grossMarginPct !== null && grossMarginPct > 0}
            sub2="RWF today"
          />
          <HeroStat
            label="Active Menu Items"
            value={menuStats ? String(menuStats.total_dishes) : "—"}
            valueColor="default"
            sub2="Across all categories"
          />
        </div>
      </div>

      {/* ── ③ Two-column body ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Inventory Health */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#1E293B] tracking-tight">
              Inventory Health
            </h2>
            {needReview > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
                {needReview} Need Review
              </span>
            )}
          </div>

          {/* Notice */}
          <p className="text-[13px] text-slate-500 leading-relaxed">
            {isClosingTimeReached
              ? "Closing Stock Review is now enabled. You can now proceed to finalize your daily operations."
              : (
                <>
                  Closing Stock Review will be enabled at{" "}
                  <strong className="text-[#1E293B]">{targetClosingTime}</strong>. To change the
                  Closing Stock Review time, your admin can change it in the store management
                  settings.
                </>
              )}
          </p>

          {/* 2×2 stats */}
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Opened At" value={isOpen ? formattedOpeningTime : "—"} />
            <MiniStat label="Closing Due" value={targetClosingTime} />
            <MiniStat label="Total Inventory Items" value={String(stats.totalItems)} />
            <MiniStat label="Flagged Inventory Items" value={String(needReview)} />
          </div>

          {/* Donut chart + legend */}
          <div className="flex items-center gap-6">
            <DonutChart
              healthy={stats.healthy}
              low={stats.low}
              critical={stats.critical}
            />
            <div className="flex flex-col gap-2.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                  Healthy stock
                </span>
                <span className="text-[13px] font-bold text-[#1E293B]">{stats.healthy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 shrink-0" />
                  Low stock
                </span>
                <span className="text-[13px] font-bold text-[#1E293B]">{stats.low}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                  Out of stock
                </span>
                <span className="text-[13px] font-bold text-[#1E293B]">{stats.critical}</span>
              </div>
            </div>
          </div>

          {/* Open Inventory CTA */}
          <Button
            className="w-full h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#3B59DA] font-bold text-[14px] border-0 shadow-none"
            asChild
          >
            <Link href="/dashboard/inventory">Open Inventory</Link>
          </Button>
        </div>

        {/* Today's Activities */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#1E293B] tracking-tight">
              Today&apos;s Activities
            </h2>
            <Link
              href="/dashboard/activities"
              className="text-[13px] font-semibold text-[#3B59DA] hover:underline"
            >
              View All
            </Link>
          </div>
          <p className="text-[13px] text-slate-400 mb-3">Your most recent procurement orders</p>

          {/* Activity list */}
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-0.5">
            {activities.length === 0 ? (
              <div className="py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <ChefHat className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest mb-1">
                  No recent activity yet
                </p>
                <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed">
                  Once you start logging sales or updating inventory, your recent activity will
                  appear here.
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border border-slate-100 rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="h-4 w-4 text-[#3B59DA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-[#1E293B] leading-snug">
                      {activity.title || activity.activity}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {activity.description}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">{activity.time}</p>
                  </div>
                  {activity.actionLabel && activity.actionHref && (
                    <Button
                      size="sm"
                      className="bg-[#3B59DA] hover:bg-[#2d4bc8] text-white text-[12px] px-3 h-8 rounded-lg font-bold shrink-0"
                      asChild
                    >
                      <Link href={activity.actionHref}>{activity.actionLabel}</Link>
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppContainer>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-[160px] w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[420px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    </div>
  );
}
