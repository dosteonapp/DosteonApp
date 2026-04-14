"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  X,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Truck,
  Utensils,
  Package,
  ShoppingCart,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FigtreeText, UnifiedErrorBanner } from "@/components/ui/dosteon-ui";
import { salesService, MenuItem, MenuCategory, TodayStats } from "@/lib/services/salesService";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type SaleChannel = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

const CHANNELS: { id: SaleChannel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "DINE_IN",   label: "Dine-In",   icon: Utensils   },
  { id: "TAKEAWAY",  label: "Takeaway",  icon: ShoppingBag },
  { id: "DELIVERY",  label: "Delivery",  icon: Truck      },
];

interface CartItem extends MenuItem {
  quantity: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabLogSales() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [channel, setChannel] = useState<SaleChannel>("DINE_IN");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const [menuData, statsData] = await Promise.all([
        salesService.getMenu(),
        salesService.getTodayStats(),
      ]);
      setCategories(menuData.categories);
      setTodayStats(statsData);
    } catch {
      setError("Could not load menu. Please refresh the page.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Filtered items ─────────────────────────────────────────────────────

  const allItems = useMemo(
    () => categories.flatMap((c) => c.items),
    [categories]
  );

  const visibleItems = useMemo(() => {
    const pool = activeCategory === "all"
      ? allItems
      : (categories.find((c) => c.category === activeCategory)?.items ?? []);

    if (!search.trim()) return pool;
    const q = search.toLowerCase();
    return pool.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [allItems, categories, activeCategory, search]);

  // ── Cart operations ────────────────────────────────────────────────────

  const cartMap = useMemo(
    () => new Map(cart.map((ci) => [ci.id, ci])),
    [cart]
  );

  const addToCart = (item: MenuItem) =>
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing)
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      return [...prev, { ...item, quantity: 1 }];
    });

  const setQty = (itemId: string, qty: number) => {
    if (qty < 1) return removeFromCart(itemId);
    setCart((prev) =>
      prev.map((ci) => (ci.id === itemId ? { ...ci, quantity: qty } : ci))
    );
  };

  const removeFromCart = (itemId: string) =>
    setCart((prev) => prev.filter((ci) => ci.id !== itemId));

  const clearCart = () => setCart([]);

  // ── Computed totals ────────────────────────────────────────────────────

  const cartRevenue = cart.reduce((s, ci) => s + ci.price * ci.quantity, 0);
  const cartCogs    = cart.reduce((s, ci) => s + (ci.cost || 0) * ci.quantity, 0);
  const cartProfit  = cartRevenue - cartCogs;
  const cartMargin  = cartRevenue > 0 ? (cartProfit / cartRevenue) * 100 : 0;
  const cartQty     = cart.reduce((s, ci) => s + ci.quantity, 0);

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleLogSale = async () => {
    if (!cart.length) return;
    setIsSubmitting(true);
    try {
      const order = await salesService.logSale({
        channel,
        items: cart.map((ci) => ({ menu_item_id: ci.id, quantity: ci.quantity })),
      });
      setLastSaleId(order.id);
      clearCart();
      await load(true);
      toast.success("Sale logged!", {
        description: `Revenue: ${fmt(order.total_revenue)} · Profit: ${fmt(order.gross_profit)}`,
      });
    } catch {
      toast.error("Could not log sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (isLoading) return <TabLogSalesSkeleton />;

  return (
    <div>
      {/* Stats banner */}
      <StatsBanner stats={todayStats} isRefreshing={isRefreshing} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

        {/* ── Left: dish grid ─────────────────────────────────────── */}
        <div className="p-5 md:p-7 space-y-5">
          {error && <UnifiedErrorBanner message={error} />}

          {/* Category pills + search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 flex-1">
              <CategoryPill
                label="All"
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {categories.map((c) => (
                <CategoryPill
                  key={c.category}
                  label={c.category}
                  active={activeCategory === c.category}
                  onClick={() => setActiveCategory(c.category)}
                />
              ))}
            </div>

            <div className="relative shrink-0 sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
              <Input
                placeholder="Search dishes..."
                className="pl-9 h-9 text-[13px] font-semibold border-slate-200 rounded-[8px] bg-slate-50 placeholder:text-slate-300 focus-visible:ring-indigo-400/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Dish grid */}
          {visibleItems.length === 0 ? (
            <EmptyDishGrid hasMenu={allItems.length > 0} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {visibleItems.map((item) => {
                const inCart = cartMap.get(item.id);
                return (
                  <DishCard
                    key={item.id}
                    item={item}
                    cartQty={inCart?.quantity ?? 0}
                    onClick={() => addToCart(item)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: sales log panel ───────────────────────────────── */}
        <div className="flex flex-col max-h-[620px] lg:max-h-none">
          {/* Panel header */}
          <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#3B59DA] stroke-[2.5px]" />
              <span className="text-[14px] font-black text-[#1E293B] font-figtree">
                Sales Log
              </span>
              {cartQty > 0 && (
                <span className="h-5 px-1.5 rounded-full bg-[#3B59DA] text-white text-[10px] font-black flex items-center justify-center">
                  {cartQty}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors font-figtree"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Channel selector */}
          <div className="px-5 md:px-6 py-3 border-b border-slate-100 shrink-0">
            <div className="flex gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all font-figtree flex-1 justify-center",
                    channel === ch.id
                      ? "bg-[#3B59DA] text-white shadow-[0_2px_8px_rgba(59,89,218,0.25)]"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/80"
                  )}
                >
                  <ch.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:block lg:hidden xl:block">{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full min-h-[120px] flex flex-col items-center justify-center gap-2 text-center py-8">
                <div className="h-10 w-10 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <ShoppingCart className="h-4.5 w-4.5 text-slate-300" />
                </div>
                <FigtreeText className="text-[12px] text-slate-400 font-semibold max-w-[160px] leading-relaxed">
                  Select dishes from the menu to start a sale
                </FigtreeText>
              </div>
            ) : (
              cart.map((ci) => (
                <CartRow
                  key={ci.id}
                  item={ci}
                  onQtyChange={(q) => setQty(ci.id, q)}
                  onRemove={() => removeFromCart(ci.id)}
                />
              ))
            )}
          </div>

          {/* Totals + CTA */}
          <div className="px-5 md:px-6 py-4 border-t border-slate-100 space-y-3 shrink-0 bg-slate-50/40">
            {/* Revenue preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px] font-figtree">
                <span className="text-slate-400 font-semibold">Revenue</span>
                <span className="font-black text-[#1E293B]">{fmt(cartRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px] font-figtree">
                <span className="text-slate-400 font-semibold">COGS</span>
                <span className="font-bold text-slate-500">{fmt(cartCogs)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px] font-figtree border-t border-slate-100 pt-1.5">
                <span className="text-slate-500 font-bold">Profit</span>
                <span className={cn(
                  "font-black",
                  cartProfit > 0 ? "text-emerald-600" : cartProfit < 0 ? "text-rose-500" : "text-slate-400"
                )}>
                  {fmt(cartProfit)}
                  {cartRevenue > 0 && (
                    <span className="ml-1 text-[10px] font-bold opacity-70">
                      ({cartMargin.toFixed(0)}%)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Log Sale CTA */}
            <Button
              className={cn(
                "w-full h-11 rounded-[10px] font-black text-[14px] font-figtree gap-2 transition-all",
                cart.length > 0
                  ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-[0_4px_16px_rgba(59,89,218,0.3)] active:scale-[0.98]"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
              disabled={!cart.length || isSubmitting}
              onClick={handleLogSale}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Logging…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Log {cartQty > 0 ? `${cartQty} ` : ""}Sale{cartQty !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatsBanner({ stats, isRefreshing }: { stats: TodayStats | null; isRefreshing: boolean }) {
  const s = stats ?? { today_revenue: 0, today_cogs: 0, today_gross_profit: 0, categories_count: 0 };
  const margin = s.today_revenue > 0
    ? ((s.today_gross_profit / s.today_revenue) * 100).toFixed(1)
    : "0";

  return (
    <div className="bg-gradient-to-r from-[#3B59DA] to-[#2D46B2] px-5 md:px-8 py-5 relative overflow-hidden">
      {/* Subtle background circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative flex items-center justify-between gap-2 mb-1">
        <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.15em] font-figtree">
          Today's Performance
        </span>
        {isRefreshing && (
          <RefreshCw className="h-3 w-3 text-white/40 animate-spin" />
        )}
      </div>

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-2">
        <BannerStat label="Revenue" value={fmt(s.today_revenue)} />
        <BannerStat label="COGS" value={fmt(s.today_cogs)} dim />
        <BannerStat
          label="Gross Profit"
          value={fmt(s.today_gross_profit)}
          highlight={s.today_gross_profit > 0 ? "green" : s.today_gross_profit < 0 ? "red" : undefined}
        />
        <BannerStat label="Margin" value={`${margin}%`} />
      </div>
    </div>
  );
}

function BannerStat({
  label,
  value,
  dim,
  highlight,
}: {
  label: string;
  value: string;
  dim?: boolean;
  highlight?: "green" | "red";
}) {
  return (
    <div>
      <div className="text-[10px] md:text-[11px] font-semibold text-white/50 uppercase tracking-[0.1em] font-figtree">
        {label}
      </div>
      <div
        className={cn(
          "text-[18px] md:text-[22px] font-black tracking-tight font-figtree mt-0.5",
          dim ? "text-white/60" : highlight === "green" ? "text-emerald-300" : highlight === "red" ? "text-rose-300" : "text-white"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all font-figtree whitespace-nowrap",
        active
          ? "bg-[#3B59DA] text-white shadow-[0_2px_6px_rgba(59,89,218,0.25)]"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      )}
    >
      {label}
    </button>
  );
}

function DishCard({
  item,
  cartQty,
  onClick,
}: {
  item: MenuItem;
  cartQty: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative text-left rounded-[10px] border p-4 transition-all active:scale-[0.97] group",
        cartQty > 0
          ? "border-[#3B59DA]/30 bg-indigo-50/40 shadow-[0_2px_8px_rgba(59,89,218,0.08)]"
          : "border-slate-100 bg-white hover:border-indigo-200/60 hover:shadow-[0_4px_16px_rgba(59,89,218,0.06)]"
      )}
    >
      {/* Cart qty badge */}
      {cartQty > 0 && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#3B59DA] text-white text-[10px] font-black flex items-center justify-center">
          {cartQty}
        </div>
      )}

      {/* Category badge */}
      <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wide mb-2 font-figtree max-w-full truncate">
        {item.category}
      </span>

      {/* Name */}
      <div className="text-[13px] font-bold text-[#1E293B] font-figtree leading-tight line-clamp-2 mb-2">
        {item.name}
      </div>

      {/* Price */}
      <div className="flex items-center gap-1 mt-auto">
        <span className="text-[15px] font-black text-[#3B59DA] font-figtree">
          {fmt(item.price)}
        </span>
        {item.cost > 0 && (
          <span className="text-[10px] text-slate-300 font-semibold font-figtree">
            · cost {fmt(item.cost)}
          </span>
        )}
      </div>
    </button>
  );
}

function CartRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: CartItem;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 group">
      {/* Name + price per unit */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#1E293B] font-figtree truncate leading-tight">
          {item.name}
        </div>
        <div className="text-[11px] text-slate-400 font-semibold font-figtree">
          {fmt(item.price)} each
        </div>
      </div>

      {/* Qty stepper */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onQtyChange(item.quantity - 1)}
          className="h-6 w-6 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all active:scale-90"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-6 text-center text-[13px] font-black text-[#1E293B] font-figtree tabular-nums">
          {item.quantity}
        </span>
        <button
          onClick={() => onQtyChange(item.quantity + 1)}
          className="h-6 w-6 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all active:scale-90"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Line total */}
      <span className="text-[13px] font-black text-[#1E293B] font-figtree tabular-nums w-16 text-right shrink-0">
        {fmt(item.price * item.quantity)}
      </span>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="text-slate-200 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

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

function TabLogSalesSkeleton() {
  return (
    <div>
      <div className="h-[100px] bg-gradient-to-r from-[#3B59DA] to-[#2D46B2] animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] divide-x divide-slate-100">
        <div className="p-6 md:p-8 space-y-5">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[10px]" />)}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full rounded-[8px]" />
          <Skeleton className="h-48 w-full rounded-[8px]" />
          <Skeleton className="h-11 w-full rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
