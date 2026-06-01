"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppContainer } from "@/components/ui/dosteon-ui";
import { salesService } from "@/lib/services/salesService";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

type SaleChannel = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

interface CartItem {
  id: string;
  name: string;
  price: number;
  cost?: number;
  quantity: number;
}

const CHANNELS: { id: SaleChannel; label: string }[] = [
  { id: "DINE_IN", label: "Dine-In" },
  { id: "TAKEAWAY", label: "Takeaway" },
  { id: "DELIVERY", label: "Delivery" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export default function ReviewSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  const router = useRouter();
  const { user } = useUser();
  const params = use(searchParams);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<SaleChannel | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Load cart items from localStorage (primary) or query params (fallback)
  useEffect(() => {
    try {
      // Try localStorage first
      const savedCart = localStorage.getItem("sales_cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
        return;
      }
      // Fallback to URL params
      if (params.items) {
        setCartItems(JSON.parse(decodeURIComponent(params.items)));
      }
    } catch (e) {
      console.error("Failed to load cart items:", e);
    }
  }, [params]);

  const totalRevenue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCogs = cartItems.reduce((sum, item) => sum + ((item.cost || 0) * item.quantity), 0);
  const grossProfit = totalRevenue - totalCogs;

  const paymentMethods = [
    { id: "momo", label: "MoMo", icon: "📱" },
    { id: "cash", label: "Cash", icon: "💵" },
    { id: "card", label: "Card (POS/Credit)", icon: "💳" },
    { id: "vuba_vuba", label: "Vuba Vuba", icon: "🏠" },
  ];

  const handleBack = () => {
    router.back();
  };

  const saveCartToStorage = (items: CartItem[]) => {
    try {
      localStorage.setItem("sales_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updated = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updated);
    saveCartToStorage(updated);
  };

  const removeItem = (itemId: string) => {
    const updated = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updated);
    saveCartToStorage(updated);
  };

  const handleConfirm = async () => {
    if (!selectedPaymentMethod || !selectedChannel) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        channel: selectedChannel,
        items: cartItems.map((item) => ({ menu_item_id: item.id, quantity: item.quantity })),
        ...(selectedPaymentMethod && { payment_method: selectedPaymentMethod }),
      };

      const order = await salesService.logSale(payload);
      setSuccessOrder(order);
      setShowSuccess(true);

      // Clear cart from localStorage after successful sale
      try {
        localStorage.removeItem("sales_cart");
      } catch (e) {
        console.error("Failed to clear cart from localStorage:", e);
      }

      // Redirect back to sales page after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/@restaurant/sales?tab=log');
      }, 2000);
    } catch (error) {
      let errorMsg = "Could not log sale. Please try again.";
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.detail) {
          errorMsg = axiosError.response.data.detail;
        } else {
          errorMsg = error.message;
        }
      }
      setError(errorMsg);
      console.error("Sale error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-[28px] font-bold text-slate-900">Review Sales</h1>
          <p className="text-sm text-slate-600 mt-1">Step 2 of 2 • Review your order and select payment method</p>
        </div>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Order Summary + Sales Category */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white border border-slate-100 rounded-[12px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Order Summary
            </h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-1">RWF {fmt(item.price)}/each</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">RWF {fmt(item.price * item.quantity)}</div>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-100 rounded-[8px] px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-slate-600 hover:text-slate-900 font-bold transition-colors"
                        >
                          −
                        </button>
                        <span className="text-xs font-bold text-slate-900 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-600 hover:text-slate-900 font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors text-lg font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 py-4 text-center">No items in order</div>
              )}
            </div>

            {/* Summary Metrics */}
            <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Est. COGS</span>
                <span className="text-sm font-semibold text-slate-900">RWF {fmt(totalCogs)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Gross Profit</span>
                <span className={cn("text-sm font-bold", grossProfit > 0 ? "text-emerald-600" : "text-rose-500")}>
                  RWF {fmt(grossProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Sales Category Card */}
          <div className="bg-white border border-slate-100 rounded-[12px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Select Sales Category
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={cn(
                    "py-3 px-4 rounded-[10px] font-bold text-sm transition-all text-center border-2",
                    selectedChannel === ch.id
                      ? "bg-[#3B59DA] text-white border-[#3B59DA]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {ch.id === "DINE_IN" && "🍽️"}
                  {ch.id === "TAKEAWAY" && "📦"}
                  {ch.id === "DELIVERY" && "🚗"}
                  <div className="mt-1 text-xs">{ch.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment Method Selection */}
        <div className="space-y-6">
          {/* Payment Method Card */}
          <div className="bg-white border border-slate-100 rounded-[12px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Payment Method
            </h2>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-[10px] cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={() => setSelectedPaymentMethod(method.id)}
                    className="w-4 h-4 text-[#3B59DA] focus:ring-2 focus:ring-[#3B59DA] cursor-pointer"
                  />
                  <span className="text-lg">{method.icon}</span>
                  <span className="text-sm font-semibold text-slate-900">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              💡 <strong>Payment is processed off-platform.</strong> This records the method for reconciliation purposes.
            </p>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white border border-slate-100 rounded-[12px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Total Revenue
            </h2>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-600">Amount</span>
              <span className="text-[36px] font-black text-slate-900">RWF {fmt(totalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-[200] bg-rose-50 border border-rose-200 rounded-[10px] p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-900">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-100 sticky bottom-0 bg-white">
        <button
          onClick={handleBack}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-[10px] border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedPaymentMethod || !selectedChannel || isSubmitting}
          className={cn(
            "px-8 py-3 rounded-[10px] font-bold transition-all active:scale-95 flex items-center gap-2",
            selectedPaymentMethod && selectedChannel && !isSubmitting
              ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-lg"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Logging..." : "Confirm & Log Sale"}
        </button>
      </div>

      {/* Success Dialog */}
      {showSuccess && successOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 animate-in fade-in">
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
              <p className="text-sm text-slate-600">Transaction has been registered to the {user?.first_name}'s account</p>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-8">
              {/* Sales ID and Revenue Section */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sales ID</p>
                    <p className="text-sm text-slate-700 font-semibold">#{successOrder.id?.slice(0, 8).toUpperCase() || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-[36px] font-black text-slate-900 tabular-nums">RWF {fmt(successOrder.total_revenue)}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-[8px] px-4 py-2">
                  <span className="text-sm font-bold text-emerald-700">+RWF {fmt(successOrder.gross_profit)} Gross Profit</span>
                </div>
              </div>

              {/* Items Sold */}
              {successOrder.items && successOrder.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">{successOrder.items.length}x {successOrder.items.map((item: any) => item.menu_item_name).join(', ')}</p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-6">
                <div>
                  <p className="text-[13px] font-semibold text-slate-600 mb-1">Channel</p>
                  <p className="text-sm font-bold text-slate-900 capitalize">{selectedChannel?.replace('_', '-') || '—'}</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-600 mb-1">Logged At</p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(successOrder.created_at || successOrder.occurred_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-600 mb-1">Payment Method</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPaymentMethod ? selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1).replace('_', ' ') : '—'}</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-600 mb-1">Logged By</p>
                  <p className="text-sm font-bold text-slate-900">{user?.first_name || 'Kitchen Staff'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 space-y-3">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  router.push('/dashboard/sales?tab=log');
                }}
                className="w-full h-14 bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold rounded-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>+</span> Log Another Sale
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.print()}
                  className="h-12 bg-white border border-slate-200 text-slate-700 font-bold rounded-[10px] hover:bg-slate-50 transition-all active:scale-95 text-sm"
                >
                  🖨️ Print Receipt
                </button>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    router.push('/dashboard/sales?tab=history');
                  }}
                  className="h-12 bg-white border border-slate-200 text-slate-700 font-bold rounded-[10px] hover:bg-slate-50 transition-all active:scale-95 text-sm"
                >
                  📋 View Sales History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppContainer>
  );
}
