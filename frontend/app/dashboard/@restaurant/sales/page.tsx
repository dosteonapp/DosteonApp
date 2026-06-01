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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesRefreshKey, setSalesRefreshKey] = useState(0);

  // ── Confirmation state ────────────────────────────────────────────────────
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingCart, setPendingCart] = useState<CartItem[] | null>(null);
  const [pendingChannel, setPendingChannel] = useState<SaleChannel | null>(null);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<string | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

  // ── Success state ──────────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sales_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e);
    }
  }, []);

  const cartMap     = useMemo(() => new Map(cart.map((ci) => [ci.id, ci.quantity])), [cart]);
  const cartRevenue = cart.reduce((s, ci) => s + ci.price * ci.quantity, 0);
  const cartCogs    = cart.reduce((s, ci) => s + (ci.cost || 0) * ci.quantity, 0);
  const cartProfit  = cartRevenue - cartCogs;

  // Persist cart to localStorage
  const saveCartToStorage = (cartData: CartItem[]) => {
    try {
      localStorage.setItem("sales_cart", JSON.stringify(cartData));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  };

  const addToCart = (item: MenuItem) => {
    // Validate item has a valid ID before adding to cart
    if (!item.id || item.id.trim() === "") {
      toast.error("Cannot add item", { description: "Item has invalid ID. Please refresh the menu." });
      console.error("Attempted to add item with invalid ID:", item);
      return;
    }
    setCart((prev) => {
      const updated = (() => {
        const ex = prev.find((ci) => ci.id === item.id);
        if (ex) return prev.map((ci) => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
        return [...prev, { ...item, quantity: 1 }];
      })();
      saveCartToStorage(updated);
      return updated;
    });
  };

  const setQty = (itemId: string, qty: number) => {
    if (qty < 1) {
      setCart((prev) => {
        const updated = prev.filter((ci) => ci.id !== itemId);
        saveCartToStorage(updated);
        return updated;
      });
      return;
    }
    setCart((prev) => {
      const updated = prev.map((ci) => ci.id === itemId ? { ...ci, quantity: qty } : ci);
      saveCartToStorage(updated);
      return updated;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const updated = prev.filter((ci) => ci.id !== itemId);
      saveCartToStorage(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem("sales_cart");
    } catch (e) {
      console.error("Failed to clear cart from localStorage:", e);
    }
  };

  const handleLogSale = () => {
    if (!cart.length) return;
    // Store cart items in state before navigating
    setPendingCart([...cart]);
    // Navigate to review page with cart data in query params
    const itemsParam = encodeURIComponent(JSON.stringify(cart));
    router.push(`/dashboard/sales/review?items=${itemsParam}`);
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
        ...(pendingPaymentMethod && { payment_method: pendingPaymentMethod }),
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
                cartRevenue={cartRevenue}
                cartCogs={cartCogs}
                cartProfit={cartProfit}
                isSubmitting={isSubmitting}
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
  const { user } = useUser();
  const router = useRouter();
  const fmt = (n: number) =>
    new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const itemsSoldText = order.items?.length ?
    order.items.map((item: any) => `${item.quantity}x ${item.menu_item_name}`).join(", ") :
    "Items sold";

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogAnother = () => {
    onClose();
    // Reset cart and return to sales entry
  };

  const handleViewHistory = () => {
    router.push('/dashboard/sales?tab=history');
    onClose();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 animate-in fade-in">
      <div className="bg-white rounded-[16px] shadow-[0_32px_120px_rgba(15,23,42,0.15)] w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div className="px-8 py-8 border-b border-slate-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-[28px] font-bold text-slate-900 mb-2">Sale Logged Successfully</h2>
          <p className="text-sm text-slate-600">Transaction has been recorded successfully</p>
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-8">
          {/* Sales ID and Revenue Section */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sales ID</p>
                <p className="text-sm text-slate-700 font-semibold">#{order.id?.slice(0, 8).toUpperCase() || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
                <p className="text-[36px] font-black text-slate-900 tabular-nums">RWF {fmt(order.total_revenue)}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-[8px] px-4 py-2">
              <span className="text-sm font-bold text-emerald-700">+RWF {fmt(order.gross_profit)} Gross Profit</span>
            </div>
          </div>

          {/* Items Sold */}
          <div>
            <p className="text-[13px] font-bold text-slate-600 mb-2">{order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'} Sold</p>
            <p className="text-sm text-slate-700">{itemsSoldText}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-6">
            <div>
              <p className="text-[13px] font-semibold text-slate-600 mb-1">Channel</p>
              <p className="text-sm font-bold text-slate-900">{CHANNELS.find(ch => ch.id === order.channel)?.label || order.channel}</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-600 mb-1">Logged At</p>
              <p className="text-sm font-bold text-slate-900">{formatTime(order.created_at || order.occurred_at)}</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-600 mb-1">Payment Method</p>
              <p className="text-sm font-bold text-slate-900">{order.payment_method ? order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1).replace('_', ' ') : '—'}</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-600 mb-1">Logged By</p>
              <p className="text-sm font-bold text-slate-900">{user?.first_name || 'Kitchen Staff'}</p>
            </div>
          </div>

          {/* Inventory Depletion */}
          {order.depleted_items && order.depleted_items.length > 0 && (
            <div>
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">Inventory Automatically Depleted:</p>
              <div className="flex flex-wrap gap-2">
                {order.depleted_items.map((item: any, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[6px] px-3 py-2 text-sm font-semibold text-slate-700">
                    {item.product_name}: {item.quantity} {item.unit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 space-y-3">
          <button
            onClick={handleLogAnother}
            className="w-full h-14 bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black text-[15px] rounded-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Log Another Sale
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrintReceipt}
              className="h-12 bg-white border border-slate-200 text-slate-700 font-bold rounded-[10px] hover:bg-slate-50 transition-all active:scale-95 text-sm"
            >
              Print Receipt
            </button>
            <button
              onClick={handleViewHistory}
              className="h-12 bg-white border border-slate-200 text-slate-700 font-bold rounded-[10px] hover:bg-slate-50 transition-all active:scale-95 text-sm"
            >
              View Sales History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sales Log panel
// ---------------------------------------------------------------------------

function SalesLogPanel({
  cart, cartRevenue, cartCogs, cartProfit, isSubmitting,
  onQtyChange, onRemove, onClear, onLogSale,
}: {
  cart: CartItem[];
  cartRevenue: number;
  cartCogs: number;
  cartProfit: number;
  isSubmitting: boolean;
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

      {/* Cart items */}
      <div className="overflow-hidden px-5 py-3 min-h-[160px] max-h-[280px]">
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
          disabled={!cart.length || isSubmitting}
          onClick={onLogSale}
          className={cn(
            "w-full h-12 rounded-[10px] font-black text-[15px] font-figtree transition-all flex items-center justify-center gap-2",
            cart.length > 0
              ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-[0_4px_16px_rgba(59,89,218,0.3)] active:scale-[0.98]"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          )}
        >
          {isSubmitting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Reviewing…</> : "Review Order"}
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
