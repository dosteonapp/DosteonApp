"use client";

import { useState, useEffect } from "react";
import { RefreshCw, BarChart2, CalendarDays, Star, Percent, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { salesService, WeekStats, TodayStats } from "@/lib/services/salesService";

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export function SalesStatsBanner() {
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([salesService.getWeekStats(), salesService.getTodayStats()])
      .then(([w, t]) => { setWeekStats(w); setTodayStats(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const w = weekStats ?? {
    week_revenue: 0,
    week_revenue_pct: null,
    avg_daily_revenue: 0,
    best_day: null,
    avg_gross_margin: 0,
    avg_gross_margin_pts: null,
  };
  const catCount = todayStats?.categories_count ?? 0;

  return (
    <div className="bg-gradient-to-r from-[#091558] via-[#3851dd] to-[#091558] px-5 md:px-7 py-6 md:py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <BannerCard
          label="This Week Revenue"
          value={`RWF ${fmt(w.week_revenue)}`}
          sub={w.week_revenue_pct != null
            ? { text: `${w.week_revenue_pct >= 0 ? "up" : "down"} by ${Math.abs(w.week_revenue_pct)}% from last week`, positive: w.week_revenue_pct >= 0 }
            : null}
          caption={catCount > 0 ? `Across ${catCount} ${catCount === 1 ? "category" : "categories"}` : "No sales yet"}
          icon={BarChart2} iconBg="bg-indigo-100" iconColor="text-[#3B59DA]"
          loading={loading}
        />
        <BannerCard
          label="Avg Daily Revenue"
          value={`RWF ${fmt(w.avg_daily_revenue)}`}
          caption="Revenue per day, 7-day avg"
          icon={CalendarDays} iconBg="bg-blue-100" iconColor="text-blue-600"
          loading={loading}
        />
        <BannerCard
          label="Best Day This Week"
          value={w.best_day ?? "—"}
          caption={w.best_day ? "highest revenue day" : "No sales yet this week"}
          icon={Star} iconBg="bg-amber-100" iconColor="text-amber-500"
          loading={loading}
        />
        <BannerCard
          label="Avg Gross Margin"
          value={`${w.avg_gross_margin.toFixed(1)}%`}
          sub={w.avg_gross_margin_pts != null
            ? { text: `${w.avg_gross_margin_pts >= 0 ? "up" : "down"} ${Math.abs(w.avg_gross_margin_pts)}pts vs prior week`, positive: w.avg_gross_margin_pts >= 0 }
            : null}
          caption={catCount > 0 ? `Across ${catCount} ${catCount === 1 ? "category" : "categories"}` : undefined}
          icon={Percent} iconBg="bg-emerald-100" iconColor="text-emerald-600"
          loading={loading}
        />
      </div>
    </div>
  );
}

function BannerCard({
  label, value, sub, caption, icon: Icon, iconBg, iconColor, loading,
}: {
  label: string;
  value: string;
  sub?: { text: string; positive: boolean | null } | null;
  caption?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-[12px] p-4 md:p-5 flex flex-col gap-3 animate-pulse shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-slate-100" />
          <div className="h-2 w-3/4 rounded bg-slate-100" />
        </div>
        <div className="h-8 w-2/3 rounded bg-slate-100" />
        <div className="h-2 w-1/2 rounded bg-slate-100" />
      </div>
    );
  }

  const isText = isNaN(parseFloat(value.replace(/[^0-9.]/g, ""))) || value === "—";

  return (
    <div className="bg-white rounded-[12px] p-4 md:p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2">
        <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("h-3.5 w-3.5 stroke-[2px]", iconColor)} />
        </div>
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.08em] font-figtree leading-tight">
          {label}
        </span>
      </div>
      <div className={cn(
        "font-black text-[#1E293B] font-figtree leading-tight",
        isText ? "text-[16px] md:text-[18px] line-clamp-2" : "text-[22px] md:text-[26px]"
      )}>
        {value}
      </div>
      <div className="space-y-0.5 -mt-1">
        {sub && (
          <p className={cn(
            "text-[11px] font-bold font-figtree flex items-center gap-1",
            sub.positive === true ? "text-emerald-500" : sub.positive === false ? "text-rose-500" : "text-slate-400"
          )}>
            {sub.positive === true  && <TrendingUp   className="h-3 w-3" />}
            {sub.positive === false && <TrendingDown  className="h-3 w-3" />}
            {sub.text}
          </p>
        )}
        {caption && (
          <p className="text-[11px] text-slate-400 font-semibold font-figtree">{caption}</p>
        )}
      </div>
    </div>
  );
}
