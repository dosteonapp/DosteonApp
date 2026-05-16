"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Package,
  ShoppingCart,
  RefreshCw,
  TrendingUp,
  Percent,
  ImagePlus,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FigtreeText, UnifiedErrorBanner } from "@/components/ui/dosteon-ui";
import { salesService, MenuItem, MenuCategory, TodayStats } from "@/lib/services/salesService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TabLogSalesProps {
  cartMap: Map<string, number>;
  onAddToCart: (item: MenuItem) => void;
  refreshKey: number;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabLogSales({ cartMap, onAddToCart, refreshKey }: TabLogSalesProps) {
  const [categories, setCategories]     = useState<MenuCategory[]>([]);
  const [todayStats, setTodayStats]     = useState<TodayStats | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const [search, setSearch]                 = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // ── Fetch ──────────────────────────────────────────────────────────────

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const [menuData, stats] = await Promise.all([
        salesService.getMenu(),
        salesService.getTodayStats(),
      ]);
      setCategories(menuData.categories);
      setTodayStats(stats);
    } catch {
      setError("Could not load menu. Please refresh the page.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Re-fetch stats after a sale is logged (parent increments refreshKey)
  useEffect(() => { if (refreshKey > 0) load(true); }, [refreshKey, load]);

  // ── Derived ────────────────────────────────────────────────────────────

  const allItems     = useMemo(() => categories.flatMap((c) => c.items), [categories]);
  const categoryNames = useMemo(() => categories.map((c) => c.category), [categories]);

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (q) {
      const matched = allItems.filter(
        (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
      return matched.length > 0 ? [{ category: "Results", items: matched }] : [];
    }

    if (activeCategory !== "all") {
      const cat = categories.find((c) => c.category === activeCategory);
      return cat ? [cat] : [];
    }

    return categories;
  }, [search, activeCategory, allItems, categories]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (isLoading) return <TabLogSalesSkeleton />;

  const s = todayStats ?? { today_revenue: 0, today_cogs: 0, today_gross_profit: 0, categories_count: 0 };
  const catLabel = s.categories_count > 0
    ? `Across ${s.categories_count} ${s.categories_count === 1 ? "category" : "categories"}`
    : "No sales yet today";

  return (
    <div>

      {/* ── Today's stats banner (3 cards) ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#091558] via-[#3851dd] to-[#091558] px-5 md:px-7 py-6 md:py-8">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard
            label="Today's Revenue"
            value={`RWF ${fmt(s.today_revenue)}`}
            caption={catLabel}
            icon={TrendingUp} iconBg="bg-indigo-100" iconColor="text-[#3B59DA]"
          />
          <StatCard
            label="Est. COGS"
            value={`RWF ${fmt(s.today_cogs)}`}
            caption={catLabel}
            icon={ShoppingCart} iconBg="bg-slate-100" iconColor="text-slate-500"
          />
          <StatCard
            label="Gross Profit"
            value={`RWF ${fmt(s.today_gross_profit)}`}
            caption={catLabel}
            positive={s.today_gross_profit >= 0}
            icon={Percent} iconBg={s.today_gross_profit >= 0 ? "bg-emerald-100" : "bg-rose-100"} iconColor={s.today_gross_profit >= 0 ? "text-emerald-600" : "text-rose-500"}
          />
        </div>
        {isRefreshing && (
          <div className="flex justify-end mt-2">
            <RefreshCw className="h-3 w-3 text-white/30 animate-spin" />
          </div>
        )}
      </div>

      {/* ── Dish grid ──────────────────────────────────────────────────── */}
      <div className="p-5 md:p-6 space-y-5">
        {error && <UnifiedErrorBanner message={error} />}

        {/* Search + category dropdown */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input
              placeholder="Search menu items..."
              className="pl-10 h-11 text-[13px] font-semibold border-slate-200 rounded-[8px] bg-white placeholder:text-slate-300 focus-visible:ring-indigo-400/20 font-figtree"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative shrink-0">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="appearance-none h-11 pl-4 pr-9 text-[13px] font-semibold border border-slate-200 rounded-[8px] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-indigo-400/20 font-figtree cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoryNames.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Dish groups */}
        {visibleGroups.length === 0 ? (
          <EmptyDishGrid hasMenu={allItems.length > 0} />
        ) : (
          <div className="space-y-6">
            {visibleGroups.map((group) => (
              <div key={group.category}>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] font-figtree mb-3">
                  {group.category}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.items.map((item) => (
                    <DishCard
                      key={item.id}
                      item={item}
                      cartQty={cartMap.get(item.id) ?? 0}
                      onClick={() => onAddToCart(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card (today banner)
// ---------------------------------------------------------------------------

function StatCard({
  label, value, caption, positive, icon: Icon, iconBg, iconColor,
}: {
  label: string; value: string; caption?: string; positive?: boolean;
  icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string;
}) {
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
        "text-[22px] md:text-[26px] font-black font-figtree leading-tight",
        positive !== undefined
          ? positive ? "text-emerald-600" : "text-rose-500"
          : "text-[#1E293B]"
      )}>
        {value}
      </div>
      {caption && (
        <p className="text-[11px] text-slate-400 font-semibold font-figtree -mt-1">{caption}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dish card
// ---------------------------------------------------------------------------

function DishCard({ item, cartQty, onClick }: { item: MenuItem; cartQty: number; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col justify-between rounded-[10px] border bg-white transition-all cursor-pointer group overflow-hidden",
        cartQty > 0
          ? "border-[#3B59DA]/30 shadow-[0_2px_8px_rgba(59,89,218,0.08)]"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      )}
    >
      {item.image_url ? (
        <div className="relative h-24 w-full shrink-0">
          <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="h-24 w-full shrink-0 bg-slate-50 flex items-center justify-center border-b border-slate-100">
          <ImagePlus className="h-6 w-6 text-slate-200" />
        </div>
      )}
      <div className="p-4 flex items-start justify-between gap-2 flex-1">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-black text-[#1E293B] font-figtree leading-tight line-clamp-2">
            {item.name}
          </div>
          <div className="text-[12px] font-semibold text-slate-500 font-figtree mt-1">
            RWF {fmt(item.price)} / plate
          </div>
          <div className="text-[11px] italic text-slate-400 font-figtree mt-0.5">
            {item.category}
          </div>
        </div>

        {/* Cart quantity badge */}
        <div className="shrink-0 h-8 w-8 rounded-[6px] flex items-center justify-center">
          {cartQty > 0 ? (
            <span className="h-8 w-8 rounded-[6px] bg-[#3B59DA] text-white text-[13px] font-black flex items-center justify-center">
              {cartQty}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyDishGrid({ hasMenu }: { hasMenu: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
      <div className="h-12 w-12 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center">
        <Package className="h-5 w-5 text-slate-300" />
      </div>
      <FigtreeText className="text-[13px] font-semibold text-slate-400 max-w-[240px] leading-relaxed">
        {hasMenu
          ? "No dishes match your search. Try a different term."
          : "No menu items yet. Add dishes in the Menu Management tab."}
      </FigtreeText>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TabLogSalesSkeleton() {
  return (
    <div>
      <div className="bg-gradient-to-r from-[#091558] via-[#3851dd] to-[#091558] px-5 md:px-7 py-6 md:py-8 grid grid-cols-3 gap-3 md:gap-4">
        {[...Array(3)].map((_, i) => (
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
      <div className="p-6 space-y-5">
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-[8px]" />
          <Skeleton className="h-11 w-36 rounded-[8px]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[10px]" />)}
        </div>
      </div>
    </div>
  );
}
