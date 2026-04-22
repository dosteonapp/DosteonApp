"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  ChevronDown,
  ShoppingBag,
  Truck,
  Utensils,
  Package,
  ShoppingCart,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FigtreeText, UnifiedErrorBanner } from "@/components/ui/dosteon-ui";
import { salesService, MenuItem, MenuCategory, TodayStats } from "@/lib/services/salesService";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type SaleChannel = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

const CHANNELS: { id: SaleChannel; label: string }[] = [
  { id: "DINE_IN",  label: "Dine-in"  },
  { id: "TAKEAWAY", label: "Takeaway" },
  { id: "DELIVERY", label: "Delivery" },
];

interface CartItem extends MenuItem { quantity: number; }

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const todayLabel = () =>
  new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabLogSales() {
  const [categories, setCategories]     = useState<MenuCategory[]>([]);
  const [todayStats, setTodayStats]     = useState<TodayStats | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [channel, setChannel]           = useState<SaleChannel>("DINE_IN");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ── Derived ────────────────────────────────────────────────────────────

  const allItems = useMemo(() => categories.flatMap((c) => c.items), [categories]);
  const categoryNames = useMemo(() => categories.map((c) => c.category), [categories]);

  // Groups to display in the dish grid
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

  const cartMap = useMemo(() => new Map(cart.map((ci) => [ci.id, ci])), [cart]);

  // ── Cart ops ───────────────────────────────────────────────────────────

  const addToCart = (item: MenuItem) =>
    setCart((prev) => {
      const ex = prev.find((ci) => ci.id === item.id);
      if (ex) return prev.map((ci) => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { ...item, quantity: 1 }];
    });

  const setQty = (itemId: string, qty: number) => {
    if (qty < 1) return removeFromCart(itemId);
    setCart((prev) => prev.map((ci) => ci.id === itemId ? { ...ci, quantity: qty } : ci));
  };

  const removeFromCart = (itemId: string) => setCart((prev) => prev.filter((ci) => ci.id !== itemId));
  const clearCart = () => setCart([]);

  // ── Totals ─────────────────────────────────────────────────────────────

  const cartRevenue = cart.reduce((s, ci) => s + ci.price * ci.quantity, 0);
  const cartCogs    = cart.reduce((s, ci) => s + (ci.cost || 0) * ci.quantity, 0);
  const cartProfit  = cartRevenue - cartCogs;

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleLogSale = async () => {
    if (!cart.length) return;

    const currentCart = [...cart];
    const prevStats   = todayStats;

    // Optimistic stats update — increment banner immediately
    const optRevenue = currentCart.reduce((s, i) => s + i.price * i.quantity, 0);
    const optCogs    = currentCart.reduce((s, i) => s + (i.cost || 0) * i.quantity, 0);
    if (todayStats) {
      setTodayStats({
        ...todayStats,
        today_revenue:      todayStats.today_revenue      + optRevenue,
        today_cogs:         todayStats.today_cogs         + optCogs,
        today_gross_profit: todayStats.today_gross_profit + (optRevenue - optCogs),
      });
    }
    clearCart();
    setIsSubmitting(true);

    try {
      const order = await salesService.logSale({
        channel,
        items: currentCart.map((ci) => ({ menu_item_id: ci.id, quantity: ci.quantity })),
      });
      toast.success("Sale logged!", {
        description: `Revenue: RWF ${fmt(order.total_revenue)} · Profit: RWF ${fmt(order.gross_profit)}`,
      });
      load(true); // fire-and-forget — settles stats to server values in background
    } catch {
      setTodayStats(prevStats); // rollback optimistic update
      toast.error("Could not log sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* ── Two-column body ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

        {/* LEFT: search + dish grid */}
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
                        cartQty={cartMap.get(item.id)?.quantity ?? 0}
                        onClick={() => addToCart(item)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Sales Log panel */}
        <div className="flex flex-col">

          {/* Panel header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[16px] font-black text-[#1E293B] font-figtree">Sales Log</span>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-slate-400 font-figtree">{todayLabel()}</span>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-bold text-slate-300 hover:text-rose-400 transition-colors font-figtree"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Channel selector */}
          <div className="px-5 py-3 border-b border-slate-100 shrink-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] font-figtree mb-2">
              Select sales category
            </div>
            <div className="flex gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className={cn(
                    "flex-1 py-2 rounded-full text-[12px] font-bold transition-all font-figtree border",
                    channel === ch.id
                      ? "bg-[#1E293B] text-white border-[#1E293B]"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-5 py-3 min-h-[160px]">
            {cart.length === 0 ? (
              <div className="h-full min-h-[120px] flex flex-col items-center justify-center gap-2 py-8 text-center">
                <div className="h-10 w-10 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-slate-300" />
                </div>
                <FigtreeText className="text-[12px] text-slate-400 font-semibold max-w-[160px] leading-relaxed">
                  Select dishes from the menu to start a sale
                </FigtreeText>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cart.map((ci) => (
                  <CartRow
                    key={ci.id}
                    item={ci}
                    onQtyChange={(q) => setQty(ci.id, q)}
                    onRemove={() => removeFromCart(ci.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Totals + CTA */}
          <div className="px-5 py-4 border-t border-slate-100 space-y-3 shrink-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[13px] font-figtree">
                <span className="text-slate-500 font-semibold">Revenue</span>
                <span className="font-bold text-[#1E293B]">RWF {fmt(cartRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] font-figtree">
                <span className="text-slate-500 font-semibold">Est. COGS</span>
                <span className="font-bold text-[#1E293B]">RWF {fmt(cartCogs)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] font-figtree">
                <span className="text-slate-500 font-semibold">Gross Profit</span>
                <span className={cn(
                  "font-bold",
                  cartProfit > 0 ? "text-emerald-600" : cartProfit < 0 ? "text-rose-500" : "text-[#1E293B]"
                )}>
                  RWF {fmt(cartProfit)}
                </span>
              </div>
            </div>

            <button
              disabled={!cart.length || isSubmitting}
              onClick={handleLogSale}
              className={cn(
                "w-full h-12 rounded-[10px] font-black text-[15px] font-figtree transition-all flex items-center justify-center gap-2",
                cart.length > 0
                  ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-[0_4px_16px_rgba(59,89,218,0.3)] active:scale-[0.98]"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Logging…</>
              ) : (
                "Log Sales"
              )}
            </button>
          </div>
        </div>

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
      className={cn(
        "relative flex flex-col justify-between rounded-[10px] border p-4 bg-white transition-all cursor-pointer group",
        cartQty > 0
          ? "border-[#3B59DA]/30 shadow-[0_2px_8px_rgba(59,89,218,0.08)]"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      )}
    >
      {/* Cart badge */}
      {cartQty > 0 && (
        <div className="absolute top-2 left-2 h-5 px-1.5 rounded-full bg-[#3B59DA] text-white text-[10px] font-black flex items-center justify-center">
          {cartQty}
        </div>
      )}

      {/* Content */}
      <div className="flex items-start justify-between gap-2">
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

        {/* Add button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="shrink-0 h-8 w-8 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-[#3B59DA] hover:text-[#3B59DA] hover:bg-indigo-50 transition-all active:scale-90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cart row
// ---------------------------------------------------------------------------

function CartRow({ item, onQtyChange, onRemove }: {
  item: CartItem; onQtyChange: (qty: number) => void; onRemove: () => void;
}) {
  return (
    <div className="py-3 flex items-start justify-between gap-3">
      {/* Name + price each */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#1E293B] font-figtree leading-tight truncate">
          {item.name}
        </div>
        <div className="text-[11px] text-slate-400 font-semibold font-figtree mt-0.5">
          RWF {fmt(item.price)} each
        </div>
      </div>

      {/* Stepper + line total */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQtyChange(item.quantity - 1)}
            className="h-6 w-6 rounded-[5px] border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-[13px] font-black text-[#1E293B] font-figtree tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() => onQtyChange(item.quantity + 1)}
            className="h-6 w-6 rounded-[5px] border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={onRemove}
          className="text-[12px] font-black text-[#1E293B] font-figtree tabular-nums hover:text-rose-500 transition-colors"
        >
          RWF {fmt(item.price * item.quantity)}
        </button>
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] divide-x divide-slate-100">
        <div className="p-6 space-y-5">
          <div className="flex gap-3">
            <Skeleton className="h-11 flex-1 rounded-[8px]" />
            <Skeleton className="h-11 w-36 rounded-[8px]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[10px]" />)}
          </div>
        </div>
        <div className="p-5 space-y-4">
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-40 w-full rounded-[8px]" />
          <Skeleton className="h-12 w-full rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
