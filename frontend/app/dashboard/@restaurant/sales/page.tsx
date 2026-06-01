"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  History,
  Lock,
  ArrowRight,
  ShoppingCart,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AppContainer,
  FigtreeText,
  InriaHeading,
} from "@/components/ui/dosteon-ui";
import { ActionConfirmationDialog } from "@/components/ui/action-confirmation-dialog";
import { TabLogSales } from "@/components/sales/TabLogSales";
import { TabSalesHistory } from "@/components/sales/TabSalesHistory";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { useUser } from "@/context/UserContext";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { salesService, MenuItem } from "@/lib/services/salesService";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types + constants
// ---------------------------------------------------------------------------

type SaleChannel = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export interface CartItem extends MenuItem { quantity: number; }

const CHANNELS: { id: SaleChannel; label: string }[] = [
  { id: "DINE_IN",  label: "Dine-in"  },
  { id: "TAKEAWAY", label: "Takeaway" },
  { id: "DELIVERY", label: "Delivery" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const todayLabel = () =>
  new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

type SalesTab = "log" | "history";

const TABS: { id: SalesTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "log",     label: "Log Sales",             icon: TrendingUp },
  { id: "history", label: "Today's Sales History", icon: History    },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SalesPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const activeTab   = (searchParams.get("tab") as SalesTab) ?? "log";
  const { isOpen, canStartOpening, finishOpening } = useRestaurantDayLifecycle();
  const { user } = useUser();
  const [isQuickOpening, setIsQuickOpening] = useState(false);
  const skipsStockCount = user?.daily_stock_count === false;

  // ── Cart state (lifted so Sales Log panel persists across tabs) ──────────
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [channel, setChannel]     = useState<SaleChannel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesRefreshKey, setSalesRefreshKey] = useState(0);

  // ── Confirmation state ────────────────────────────────────────────────────
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingCart, setPendingCart] = useState<CartItem[] | null>(null);
  const [pendingChannel, setPendingChannel] = useState<SaleChannel | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

  // ── Success state ──────────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Reset channel selection when cart is cleared
  useEffect(() => { if (cart.length === 0) setChannel(null); }, [cart.length]);

  const cartMap     = useMemo(() => new Map(cart.map((ci) => [ci.id, ci.quantity])), [cart]);
  const cartRevenue = cart.reduce((s, ci) => s + ci.price * ci.quantity, 0);
  const cartCogs    = cart.reduce((s, ci) => s + (ci.cost || 0) * ci.quantity, 0);
  const cartProfit  = cartRevenue - cartCogs;

  const addToCart = (item: MenuItem) => {
    // Validate item has a valid ID before adding to cart
    if (!item.id || item.id.trim() === "") {
      toast.error("Cannot add item", { description: "Item has invalid ID. Please refresh the menu." });
      console.error("Attempted to add item with invalid ID:", item);
      return;
    }
    setCart((prev) => {
      const ex = prev.find((ci) => ci.id === item.id);
      if (ex) return prev.map((ci) => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const setQty = (itemId: string, qty: number) => {
    if (qty < 1) { setCart((prev) => prev.filter((ci) => ci.id !== itemId)); return; }
    setCart((prev) => prev.map((ci) => ci.id === itemId ? { ...ci, quantity: qty } : ci));
  };

  const removeFromCart = (itemId: string) => setCart((prev) => prev.filter((ci) => ci.id !== itemId));
  const clearCart = () => setCart([]);

  const handleLogSale = () => {
    if (!cart.length || !channel) return;
    setPendingCart([...cart]);
    setPendingChannel(channel);
    setShowConfirmation(true);
    setConfirmationError(null);
  };

  const handleConfirmSale = async () => {
    if (!pendingCart || !pendingChannel) return;

    // Validate cart before submitting
    if (pendingCart.length === 0) {
      setConfirmationError("Cart is empty. Please add items before confirming.");
      return;
    }

    // Validate all items have valid IDs
    const invalidItems = pendingCart.filter((ci) => !ci.id || ci.id.trim() === "");
    if (invalidItems.length > 0) {
      setConfirmationError(`${invalidItems.length} item(s) have invalid IDs. Please refresh and try again.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Debug: Log cart state before filtering
      console.log("=== SALE SUBMISSION DEBUG ===");
      console.log("pendingCart items:", pendingCart.length);
      pendingCart.forEach((item, idx) => {
        console.log(`  Item ${idx}: id="${item.id}", name="${item.name}", qty=${item.quantity}`);
      });

      // Filter out items with empty IDs before submitting
      const validItems = pendingCart.filter((ci) => ci.id && ci.id.trim() !== "");
      const invalidItems = pendingCart.filter((ci) => !ci.id || ci.id.trim() === "");

      console.log(`Valid items: ${validItems.length}, Invalid items: ${invalidItems.length}`);

      if (invalidItems.length > 0) {
        console.warn(`⚠️ Filtered out ${invalidItems.length} item(s) with invalid IDs:`);
        invalidItems.forEach((item, idx) => {
          console.warn(`  Invalid Item ${idx}: id="${item.id}", name="${item.name}"`);
        });
      }

      if (validItems.length === 0) {
        setConfirmationError("Cart contains no valid items. Please refresh the menu and try again.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        channel: pendingChannel,
        items: validItems.map((ci) => ({ menu_item_id: ci.id, quantity: ci.quantity })),
      };

      // Log the final payload
      console.log("✅ Final payload being submitted:");
      console.log(JSON.stringify(payload, null, 2));

      const order = await salesService.logSale(payload);

      // Show success dialog instead of toast
      setSuccessOrder(order);
      setShowSuccess(true);

      // Reset states after short delay to allow user to see success
      setTimeout(() => {
        setSalesRefreshKey((k) => k + 1);
        setShowConfirmation(false);
        clearCart();
        setPendingCart(null);
        setPendingChannel(null);
      }, 500);
    } catch (error) {
      // Extract detailed error message from API response
      let errorMsg = "Could not log sale. Please try again.";
      if (error instanceof Error) {
        // Try to extract API error detail from axios error
        const axiosError = error as any;
        if (axiosError.response?.data?.detail) {
          errorMsg = axiosError.response.data.detail;
        } else if (axiosError.response?.status === 400) {
          // 400 error with no detail - likely validation error
          errorMsg = "Invalid request data. Please check that all items exist and quantities are correct.";
        } else {
          errorMsg = error.message;
        }
      }
      setConfirmationError(errorMsg);
      console.error("Sale confirmation error - Full error object:", error);
      console.error("Response status:", (error as any)?.response?.status);
      console.error("Response data:", (error as any)?.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingCart(null);
    setPendingChannel(null);
    setConfirmationError(null);
  };

  // ── Navigation ───────────────────────────────────────────────────────────
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

  const setActiveTab = (tab: SalesTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <AppContainer>
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── LEFT: tab card ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 relative">
          <div className="bg-white border border-slate-100 rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)]">

            {/* Tab navigation */}
            <div className="px-4 md:px-6 py-3 border-b border-slate-100">
              <div className="flex bg-slate-100/80 rounded-[10px] p-1 gap-1 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[12px] md:text-[13px] font-bold transition-all rounded-[8px] font-figtree whitespace-nowrap min-w-0",
                        isActive
                          ? "bg-white text-[#3B59DA] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                      )}
                    >
                      <tab.icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", isActive ? "stroke-[2.5px] text-[#3B59DA]" : "stroke-[2px]")} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content */}
            <div className={cn("transition-all duration-700", !isOpen && "blur-[5px] grayscale-[0.15] opacity-75 pointer-events-none select-none")}>
              {activeTab === "log"     && <TabLogSales cartMap={cartMap} onAddToCart={addToCart} refreshKey={salesRefreshKey} />}
              {activeTab === "history" && <TabSalesHistory />}
            </div>
          </div>

          {!isOpen && (
            <SalesLockedOverlay
              skipsStockCount={skipsStockCount}
              canStartOpening={canStartOpening}
              isQuickOpening={isQuickOpening}
              onQuickOpen={handleQuickOpen}
            />
          )}
        </div>

        {/* ── RIGHT: Sales Log panel (Log Sales tab only) ──────────── */}
        {activeTab === "log" && (
          <div className={cn(
            "w-full lg:w-[340px] xl:w-[380px] shrink-0",
            !isOpen && "blur-[5px] grayscale-[0.15] opacity-75 pointer-events-none select-none"
          )}>
            <div className="sticky top-0 bg-white border border-slate-100 rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col">
              <SalesLogPanel
                cart={cart}
                channel={channel}
                cartRevenue={cartRevenue}
                cartCogs={cartCogs}
                cartProfit={cartProfit}
                isSubmitting={isSubmitting}
                onChannelChange={setChannel}
                onQtyChange={setQty}
                onRemove={removeFromCart}
                onClear={clearCart}
                onLogSale={handleLogSale}
              />
            </div>
          </div>
        )}

      </div>

      {/* Sales Confirmation Dialog */}
      <ActionConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmSale}
        title="Confirm Sale"
        description="Review your sale before logging"
        summaryItems={
          pendingCart && pendingChannel
            ? [
                { label: "Items", value: pendingCart.length },
                {
                  label: "Revenue",
                  value: fmt(pendingCart.reduce((s, ci) => s + ci.price * ci.quantity, 0)),
                  variant: "positive",
                },
                {
                  label: "Est. COGS",
                  value: fmt(
                    pendingCart.reduce((s, ci) => s + (ci.cost || 0) * ci.quantity, 0)
                  ),
                },
                {
                  label: "Gross Profit",
                  value: fmt(
                    pendingCart.reduce((s, ci) => s + (ci.price - (ci.cost || 0)) * ci.quantity, 0)
                  ),
                  variant: "positive",
                },
                {
                  label: "Channel",
                  value: CHANNELS.find((ch) => ch.id === pendingChannel)?.label || pendingChannel,
                },
              ]
            : []
        }
        itemNames={pendingCart?.map((ci) => ci.name) || []}
        isLoading={isSubmitting}
        error={confirmationError}
        confirmText="Log Sale"
        cancelText="Cancel"
      />

      {/* Success Dialog */}
      {showSuccess && successOrder && (
        <SaleSuccessDialog
          order={successOrder}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </AppContainer>
  );
}

// ---------------------------------------------------------------------------
// Sale Success Dialog
// ---------------------------------------------------------------------------

function SaleSuccessDialog({ order, onClose }: { order: any; onClose: () => void }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-6 animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title and Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Sale Logged!</h2>
          <p className="text-sm text-slate-600">Transaction completed successfully</p>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 font-medium">Items Sold</span>
            <span className="text-lg font-semibold text-slate-900">{order.items_count}</span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 font-medium">Revenue</span>
            <span className="text-lg font-semibold text-slate-900">RWF {fmt(order.total_revenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 font-medium">COGS</span>
            <span className="text-sm text-slate-600">RWF {fmt(order.total_cogs)}</span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">Profit</span>
            <span className="text-lg font-bold text-emerald-600">RWF {fmt(order.gross_profit)}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sales Log panel
// ---------------------------------------------------------------------------

function SalesLogPanel({
  cart, channel, cartRevenue, cartCogs, cartProfit, isSubmitting,
  onChannelChange, onQtyChange, onRemove, onClear, onLogSale,
}: {
  cart: CartItem[];
  channel: SaleChannel | null;
  cartRevenue: number;
  cartCogs: number;
  cartProfit: number;
  isSubmitting: boolean;
  onChannelChange: (ch: SaleChannel) => void;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onLogSale: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <span className="text-[16px] font-black text-[#1E293B] font-figtree">Cart Summary</span>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-slate-400 font-figtree">{todayLabel()}</span>
          {cart.length > 0 && (
            <button onClick={onClear} className="text-[11px] font-bold text-slate-300 hover:text-rose-400 transition-colors font-figtree">
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
              onClick={() => cart.length > 0 && onChannelChange(ch.id)}
              className={cn(
                "flex-1 py-2 rounded-full text-[12px] font-bold transition-all font-figtree border",
                cart.length === 0
                  ? "bg-white text-slate-400 border-slate-200 hover:border-slate-300 cursor-default"
                  : channel === ch.id
                    ? "bg-[#1E293B] text-white border-[#1E293B]"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 cursor-pointer"
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
                onQtyChange={(q) => onQtyChange(ci.id, q)}
                onRemove={() => onRemove(ci.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals + CTA */}
      <div className="px-5 py-4 border-t border-slate-100 space-y-3 shrink-0">
        <div className="space-y-2">
          {[
            { label: "Revenue",      value: cartRevenue, color: "text-[#1E293B]" },
            { label: "Est. COGS",    value: cartCogs,    color: "text-[#1E293B]" },
            { label: "Gross Profit", value: cartProfit,  color: cartProfit > 0 ? "text-emerald-600" : cartProfit < 0 ? "text-rose-500" : "text-[#1E293B]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between text-[13px] font-figtree">
              <span className="text-slate-500 font-semibold">{label}</span>
              <span className={cn("font-bold", color)}>RWF {fmt(value)}</span>
            </div>
          ))}
        </div>

        <button
          disabled={!cart.length || !channel || isSubmitting}
          onClick={onLogSale}
          className={cn(
            "w-full h-12 rounded-[10px] font-black text-[15px] font-figtree transition-all flex items-center justify-center gap-2",
            cart.length > 0 && channel
              ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-[0_4px_16px_rgba(59,89,218,0.3)] active:scale-[0.98]"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          )}
        >
          {isSubmitting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Logging…</> : "Log Sales"}
        </button>
      </div>
    </>
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
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#1E293B] font-figtree leading-tight truncate">{item.name}</div>
        <div className="text-[11px] text-slate-400 font-semibold font-figtree mt-0.5">RWF {fmt(item.price)} each</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => onQtyChange(item.quantity - 1)} className="h-6 w-6 rounded-[5px] border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90">
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-[13px] font-black text-[#1E293B] font-figtree tabular-nums">{item.quantity}</span>
          <button onClick={() => onQtyChange(item.quantity + 1)} className="h-6 w-6 rounded-[5px] border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90">
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <button onClick={onRemove} className="text-[12px] font-black text-[#1E293B] font-figtree tabular-nums hover:text-rose-500 transition-colors">
          RWF {fmt(item.price * item.quantity)}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Locked overlay
// ---------------------------------------------------------------------------

function SalesLockedOverlay({
  skipsStockCount, canStartOpening, isQuickOpening, onQuickOpen,
}: {
  skipsStockCount: boolean; canStartOpening: boolean; isQuickOpening: boolean; onQuickOpen: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto rounded-[12px] overflow-hidden">
      <div className="absolute inset-0 bg-white/55 backdrop-blur-[7px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[120px]" />
      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-6 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 bg-white shadow-[0_12px_44px_rgba(0,0,0,0.06)] rounded-[20px] flex items-center justify-center mb-10 border border-slate-100/50">
          <Lock className="h-9 w-9 text-slate-800/80 stroke-[2.5px] drop-shadow-sm" />
        </div>
        <div className="space-y-4 max-w-[440px] mb-12">
          <InriaHeading className="text-[30px] md:text-[38px] font-bold tracking-tight leading-tight">Sales is Locked</InriaHeading>
          <FigtreeText className="text-slate-500 text-[15px] md:text-[17px] leading-relaxed font-bold max-w-[340px] mx-auto opacity-70">
            {skipsStockCount ? "Open your kitchen to start sales and operations." : "Complete your daily opening stock count to unlock Sales and start logging orders."}
          </FigtreeText>
        </div>
        {skipsStockCount ? (
          <Button className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black gap-4 shadow-[0_20px_50px_rgba(59,89,218,0.25)] transition-all active:scale-95 group font-figtree text-[17px] border-none" onClick={onQuickOpen} disabled={isQuickOpening || !canStartOpening}>
            {isQuickOpening ? "Opening..." : "Open Kitchen"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
          </Button>
        ) : (
          <Button className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black gap-4 shadow-[0_20px_50px_rgba(59,89,218,0.25)] transition-all active:scale-95 group font-figtree text-[17px] border-none" asChild>
            <Link href="/dashboard/inventory/daily-stock-count">
              Count Daily Stock
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
