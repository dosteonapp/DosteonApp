"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  LockOpen,
  BarChart2,
  CreditCard,
  Clock,
  ChevronRight,
  Check,
  Pencil,
  Store,
  AlertCircle,
  TrendingUp,
  Home,
  Download,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/hooks/use-toast";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import axiosInstance from "@/lib/axios";
import {
  salesService,
  TodayOrderItem,
  OrderItemUpdateResult,
} from "@/lib/services/salesService";
import {
  expenseService,
  TodayExpenseItem,
  ExpenseUpdateResult,
} from "@/lib/services/expenseService";

type ClosingView =
  | "locked"
  | "checklist"
  | "review-sales"
  | "review-expenses"
  | "final-review"
  | "closed";

interface ClosingStatus {
  sales_reviewed: boolean;
  expenses_reviewed: boolean;
  sales_reviewed_at: string | null;
  expenses_reviewed_at: string | null;
  can_close: boolean;
  state: string;
}

interface TodayStats {
  today_revenue: number;
  today_cogs: number;
  today_gross_profit: number;
  categories_count: number;
  dishes_sold?: number;
  channels?: {
    dine_in: { revenue: number; count: number; pct: number };
    takeaway: { revenue: number; count: number; pct: number };
    delivery: { revenue: number; count: number; pct: number };
  };
}

interface ExpenseStats {
  total_expenses: number;
  cogs: number;
  overhead: number;
}

export default function ClosingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { activeBrand } = useBrand();
  const {
    isOpen,
    isClosing,
    isClosed,
    isClosingTimeReached,
    targetClosingTime,
  } = useRestaurantDayLifecycle();

  const [view, setView] = useState<ClosingView>("locked");
  const [salesReviewed, setSalesReviewed] = useState(false);
  const [expensesReviewed, setExpensesReviewed] = useState(false);
  const [salesReviewedAt, setSalesReviewedAt] = useState<string | null>(null);
  const [expensesReviewedAt, setExpensesReviewedAt] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [salesOrders, setSalesOrders] = useState<TodayOrderItem[]>([]);
  const [expenses, setExpenses] = useState<TodayExpenseItem[]>([]);
  const [salesSearch, setSalesSearch] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [salesChannel, setSalesChannel] = useState<string>("all");
  const [editSalesTarget, setEditSalesTarget] = useState<TodayOrderItem | null>(null);
  const [editExpenseTarget, setEditExpenseTarget] = useState<TodayExpenseItem | null>(null);
  const [editSalesResult, setEditSalesResult] = useState<OrderItemUpdateResult | null>(null);
  const [editExpenseResult, setEditExpenseResult] = useState<ExpenseUpdateResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [openingTime, setOpeningTime] = useState("07:00 AM");
  const [closingTime, setClosingTime] = useState("10:00 PM");
  const [location, setLocation] = useState("");
  const [checksCompleteAt, setChecksCompleteAt] = useState<string | null>(null);

  const brandId = activeBrand?.id;

  // ─── Initial data load ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const [statusRes, statsRes, expStatsRes, settingsRes] = await Promise.all([
          axiosInstance.get("/restaurant/closing/status"),
          axiosInstance.get("/sales/stats/today", {
            params: brandId ? { brand_id: brandId } : {},
          }),
          axiosInstance.get("/expenses/stats/today", {
            params: brandId ? { brand_id: brandId } : {},
          }),
          restaurantOpsService.getSettings(),
        ]);
        if (cancelled) return;

        const status: ClosingStatus = statusRes.data;
        setSalesReviewed(status.sales_reviewed);
        setExpensesReviewed(status.expenses_reviewed);
        setSalesReviewedAt(status.sales_reviewed_at);
        setExpensesReviewedAt(status.expenses_reviewed_at);
        setTodayStats(statsRes.data);
        setExpenseStats(expStatsRes.data);

        const s = settingsRes as any;
        setOrgName(s?.name || s?.restaurant_name || "");
        setLocation(s?.city || s?.location || "");
        if (s?.opening_time) setOpeningTime(s.opening_time);
        if (s?.closing_time) setClosingTime(s.closing_time);

        // Determine initial view
        if (status.state === "CLOSED") {
          setView("closed");
        } else if (status.state === "CLOSING") {
          setView("final-review");
        } else if (!isClosingTimeReached) {
          setView("locked");
        } else {
          setView("checklist");
        }
      } catch (e) {
        console.error("Failed to load closing data", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [brandId, isClosingTimeReached]);

  // Update view when day lifecycle changes
  useEffect(() => {
    if (isClosed) setView("closed");
    else if (isClosing) {
      /* stay on final-review or closed */
    } else if (!isClosingTimeReached && !salesReviewed && !expensesReviewed)
      setView("locked");
    else if (isClosingTimeReached && view === "locked") setView("checklist");
  }, [isClosed, isClosing, isClosingTimeReached]);

  const handleMarkSalesDone = async () => {
    try {
      await axiosInstance.post("/restaurant/closing/mark-reviewed", { type: "sales" });
      setSalesReviewed(true);
      setSalesReviewedAt(new Date().toISOString());
      if (!checksCompleteAt && expensesReviewed)
        setChecksCompleteAt(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      setView("checklist");
    } catch {
      toast({ title: "Failed to mark sales as reviewed", variant: "destructive" });
    }
  };

  const handleMarkExpensesDone = async () => {
    try {
      await axiosInstance.post("/restaurant/closing/mark-reviewed", { type: "expenses" });
      setExpensesReviewed(true);
      setExpensesReviewedAt(new Date().toISOString());
      if (!checksCompleteAt && salesReviewed)
        setChecksCompleteAt(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      setView("checklist");
    } catch {
      toast({ title: "Failed to mark expenses as reviewed", variant: "destructive" });
    }
  };

  const handleConfirmAndClose = async () => {
    setIsSubmitting(true);
    try {
      await restaurantOpsService.closeKitchen();
      setView("final-review");
    } catch (e: any) {
      toast({
        title: e?.response?.data?.detail || "Failed to close kitchen",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWrapUp = async () => {
    setIsSubmitting(true);
    try {
      await restaurantOpsService.submitClosingChecklist({ summary: {}, items: [] });
      setView("closed");
      toast({ title: "Restaurant Closed!", description: "Great job today. See you tomorrow." });
    } catch (e: any) {
      toast({
        title: e?.response?.data?.detail || "Failed to submit closing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const enterReviewSales = async () => {
    setView("review-sales");
    try {
      const orders = await salesService.getTodayOrders(brandId);
      setSalesOrders(orders);
    } catch {
      /* show empty state */
    }
  };

  const enterReviewExpenses = async () => {
    setView("review-expenses");
    try {
      const exp = await expenseService.getToday(brandId);
      setExpenses(exp);
    } catch {
      /* show empty state */
    }
  };

  const handleEditSaleItem = async (quantity: number, unit_price: number) => {
    if (!editSalesTarget) return;
    try {
      const result = await salesService.updateOrderItem(
        editSalesTarget.order_id,
        editSalesTarget.item_id,
        { quantity, unit_price }
      );
      setEditSalesResult(result);
      const orders = await salesService.getTodayOrders(brandId);
      setSalesOrders(orders);
      const { data } = await axiosInstance.get("/sales/stats/today", {
        params: brandId ? { brand_id: brandId } : {},
      });
      setTodayStats(data);
    } catch {
      toast({ title: "Failed to update sale item", variant: "destructive" });
    }
  };

  const handleEditExpenseItem = async (payload: Partial<TodayExpenseItem>) => {
    if (!editExpenseTarget) return;
    try {
      const result = await expenseService.updateExpense(editExpenseTarget.id, payload as any);
      setEditExpenseResult(result);
      const exp = await expenseService.getToday(brandId);
      setExpenses(exp);
      const { data } = await axiosInstance.get("/expenses/stats/today", {
        params: brandId ? { brand_id: brandId } : {},
      });
      setExpenseStats(data);
    } catch {
      toast({ title: "Failed to update expense", variant: "destructive" });
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = today.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const displayClosingTime = targetClosingTime || closingTime;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // ─── LOCKED SCREEN ────────────────────────────────────────────────────────
  if (view === "locked") {
    return (
      <div className="mt-8 px-4 lg:px-0 pb-6">
        <div className="lg:max-w-5xl lg:mx-auto">
          <div className="space-y-4 lg:grid lg:grid-cols-[5fr_7fr] lg:gap-6 lg:space-y-0 lg:items-start">

            {/* Left: centered lock card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Lock className="h-6 w-6 text-slate-400" />
              </div>
              <h2 className="text-[20px] font-bold text-[#1E293B]">Closing is Locked</h2>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[260px]">
                The closing workflow is not yet available. Please ensure all daily prerequisites are met.
              </p>
            </div>

            {/* Right: single card with all requirements + CTA */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
              {/* Header */}
              <div className="px-5 py-4">
                <p className="text-[16px] font-bold text-[#1E293B]">Requirements</p>
              </div>

              {/* Row: Review Sales */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <BarChart2 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1E293B]">Review Sales Summary</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">Must be reviewed and confirmed</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
              </div>

              {/* Row: Review Expenses */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1E293B]">Review Expenses Summary</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">Must be reviewed and confirmed</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
              </div>

              {/* Row: Wait until closing time */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1E293B]">Wait until {displayClosingTime}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    Currently {today.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
              </div>

              {/* Row: Store Management info */}
              <div className="flex items-start gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1E293B]">Store Management</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    Closing hours and reset times can be adjusted by admins in Settings.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 py-4">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-11 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── CHECKLIST SCREEN ─────────────────────────────────────────────────────
  if (view === "checklist") {
    const bothDone = salesReviewed && expensesReviewed;
    return (
      <div className="mt-8 px-4 lg:px-0 pb-6">
        <div className="lg:max-w-5xl lg:mx-auto">
          <div className="space-y-4 lg:grid lg:grid-cols-[5fr_7fr] lg:gap-6 lg:space-y-0 lg:items-start">

            {/* Left column: centered status card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
              <div className="w-14 h-14 rounded-2xl bg-[#3B59DA]/10 flex items-center justify-center">
                <LockOpen className="h-6 w-6 text-[#3B59DA]" />
              </div>
              <h2 className="text-[28px] font-bold text-[#1E293B] leading-tight">Closing is Ready</h2>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[260px]">
                Proceed to review both expenses and the sales summary before confirming end-of-day operations.
              </p>
            </div>

            {/* Right column: single card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
              {/* Header */}
              <div className="px-5 py-4">
                <p className="text-[16px] font-bold text-[#1E293B]">Ready to Review</p>
              </div>

              {/* Review Sales row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <BarChart2 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1E293B]">Review Sales Summary</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    Review totals, payment mix, flagged items, and daily performance before close.
                  </p>
                  <div className="mt-1.5">
                    {salesReviewed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-1">
                        <Check className="h-3 w-3" /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
                {salesReviewed ? (
                  <button onClick={enterReviewSales} className="flex items-center gap-1 text-[#3B59DA] text-[13px] font-semibold shrink-0 hover:opacity-80 transition-opacity">
                    Edit <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button onClick={enterReviewSales} className="flex items-center gap-1 text-[#3B59DA] text-[13px] font-semibold shrink-0 hover:opacity-80 transition-opacity">
                    Open Review <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Review Expenses row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1E293B]">Review Expenses Summary</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">Review all logged expenditures before closing.</p>
                  <div className="mt-1.5">
                    {expensesReviewed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-1">
                        <Check className="h-3 w-3" /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
                {expensesReviewed ? (
                  <button onClick={enterReviewExpenses} className="flex items-center gap-1 text-[#3B59DA] text-[13px] font-semibold shrink-0 hover:opacity-80 transition-opacity">
                    Edit <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button onClick={enterReviewExpenses} className="flex items-center gap-1 text-[#3B59DA] text-[13px] font-semibold shrink-0 hover:opacity-80 transition-opacity">
                    Open Review <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Closing Requirements Met row */}
              <div className="flex items-start gap-4 px-5 py-4">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", bothDone ? "bg-green-50" : "bg-slate-50")}>
                  <Clock className={cn("h-4 w-4", bothDone ? "text-green-500" : "text-slate-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1E293B]">Closing Requirements Met</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    {bothDone
                      ? "Inventory count is complete and the closing workflow is now unlocked for final review."
                      : "Complete both reviews above to unlock the closing workflow."}
                  </p>
                </div>
              </div>

              {/* Confirm & Close CTA */}
              <div className="px-5 py-4">
                <Button
                  onClick={handleConfirmAndClose}
                  disabled={!bothDone || isSubmitting}
                  className={cn(
                    "w-full h-11 font-bold rounded-xl text-white",
                    bothDone ? "bg-[#3B59DA] hover:bg-[#2d4bc8]" : "bg-[#3B59DA]/40 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Close"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── REVIEW SALES SCREEN ──────────────────────────────────────────────────
  if (view === "review-sales") {
    const filtered = salesOrders;
    const totalRevenue = filtered.reduce((sum, item) => sum + item.line_total, 0);
    const totalPlates = filtered.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div className="mt-4 pb-20 px-4 lg:px-0">
        <div className="lg:max-w-6xl lg:mx-auto">
          {/* Back button */}
          <button
            onClick={() => setView("checklist")}
            className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-800 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {/* Dark navy header card */}
          <div
            className="rounded-2xl p-6 mb-4"
            style={{ background: "linear-gradient(135deg, #091558 0%, #3851dd 50%, #091558 100%)" }}
          >
            <h1 className="text-[20px] font-bold text-white mb-0.5">Daily Sales Summary</h1>
            <p className="text-[13px] text-white/60 mb-4">{formattedDate}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "TODAY'S REVENUE", value: `RWF ${(todayStats?.today_revenue || 0).toLocaleString()}`, sub: `Across ${todayStats?.categories_count || 0} categories`, color: "text-[#3B59DA]" },
                { label: "TOTAL ITEMS SOLD", value: `${todayStats?.dishes_sold || salesOrders.length}`, sub: "Across all categories", color: "text-[#1E293B]" },
                { label: "EST. COGS", value: `RWF ${(todayStats?.today_cogs || 0).toLocaleString()}`, sub: `Across ${todayStats?.categories_count || 0} categories`, color: "text-[#3B59DA]" },
                { label: "GROSS PROFIT", value: `RWF ${(todayStats?.today_gross_profit || 0).toLocaleString()}`, sub: `Across ${todayStats?.categories_count || 0} categories`, color: "text-green-600" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="bg-white rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                  <p className={cn("text-[18px] lg:text-[20px] font-black leading-tight", color)}>{value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main card: table + right panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-[16px] font-bold text-[#1E293B]">Review Today's Sales Data</p>
              <button
                onClick={() => toast({ title: "Export coming soon", description: "Report export will be available soon." })}
                className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors"
              >
                <Download className="h-4 w-4" /> Export Report
              </button>
            </div>

            <div className="lg:grid lg:grid-cols-[1fr_260px]">
              {/* Table */}
              <div className="overflow-x-auto lg:border-r lg:border-slate-100">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Dish Name</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Channel</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Plates Sold</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Margin</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-slate-400">
                          No sales logged yet today.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item.item_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800 max-w-[140px] truncate">{item.menu_item_name}</td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[11px] font-semibold rounded-full px-2.5 py-1",
                              item.channel === "DINE_IN" ? "bg-yellow-50 text-yellow-700" :
                              item.channel === "TAKEAWAY" ? "bg-[#3B59DA]/10 text-[#3B59DA]" :
                              "bg-orange-50 text-orange-700"
                            )}>
                              {item.channel === "DINE_IN" ? "Dine-in" : item.channel === "TAKEAWAY" ? "Takeaway" : "Delivery"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">RWF {item.unit_price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-700">{item.quantity} plates</td>
                          <td className="px-4 py-3 font-bold text-slate-900">RWF {item.line_total.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[11px] font-bold rounded-full px-2.5 py-1",
                              item.margin_pct >= 60 ? "bg-green-50 text-green-700" :
                              item.margin_pct >= 30 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                            )}>
                              {item.margin_pct}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setEditSalesTarget(item); setEditSalesResult(null); }}
                              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-colors"
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">Total</td>
                        <td />
                        <td />
                        <td className="px-4 py-3 text-slate-600">{totalPlates} plates</td>
                        <td className="px-4 py-3 font-black text-slate-900">RWF {totalRevenue.toLocaleString()}</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Right panel */}
              <div className="p-5 space-y-5 border-t lg:border-t-0 border-slate-100">
                <div>
                  <p className="text-[14px] font-bold text-[#1E293B] mb-3">By Channel</p>
                  <div className="space-y-2.5">
                    {todayStats?.channels ? (
                      <>
                        {[
                          { key: "dine_in", label: "Dine-in" },
                          { key: "takeaway", label: "Takeaway" },
                          { key: "delivery", label: "Delivery" },
                        ].map(({ key, label }) => {
                          const ch = todayStats.channels![key as keyof typeof todayStats.channels];
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-[13px] text-slate-600">{label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-slate-900">RWF {ch.revenue.toLocaleString()}</span>
                                <span className="text-[12px] text-slate-400">{ch.pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                          <span className="text-[13px] font-bold text-slate-900">Total</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900">RWF {(todayStats?.today_revenue || 0).toLocaleString()}</span>
                            <span className="text-[12px] text-slate-400">100%</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-[12px] text-slate-400">No channel data available.</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <p className="text-[12px] text-slate-500">Forgot something? Log it now before closing today.</p>
                  <Button
                    onClick={() => router.push("/dashboard/sales")}
                    className="w-full h-10 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl text-[13px]"
                  >
                    + Log Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Sales Modal */}
          {editSalesTarget && (
            <EditSalesModal
              item={editSalesTarget}
              result={editSalesResult}
              onSave={handleEditSaleItem}
              onClose={() => { setEditSalesTarget(null); setEditSalesResult(null); }}
            />
          )}
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 z-10 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-slate-900">Ready to complete sales review?</p>
            <p className="text-[12px] text-slate-400">Please ensure all sales data are logged accurately.</p>
          </div>
          <Button
            onClick={handleMarkSalesDone}
            className="h-11 px-6 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl text-[14px] flex items-center gap-2"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── REVIEW EXPENSES SCREEN ───────────────────────────────────────────────
  if (view === "review-expenses") {
    const filtered = expenses;
    const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
    const cogsPct = expenseStats && expenseStats.total_expenses > 0
      ? Math.round((expenseStats.cogs / expenseStats.total_expenses) * 100)
      : 0;
    const opsPct = expenseStats && expenseStats.total_expenses > 0
      ? Math.round((expenseStats.overhead / expenseStats.total_expenses) * 100)
      : 0;

    return (
      <div className="mt-4 pb-20 px-4 lg:px-0">
        <div className="lg:max-w-6xl lg:mx-auto">
          {/* Back button */}
          <button
            onClick={() => setView("checklist")}
            className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-800 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {/* Dark navy header card */}
          <div
            className="rounded-2xl p-6 mb-4"
            style={{ background: "linear-gradient(135deg, #091558 0%, #3851dd 50%, #091558 100%)" }}
          >
            <h1 className="text-[20px] font-bold text-white mb-0.5">Daily Expenses Summary</h1>
            <p className="text-[13px] text-white/60 mb-4">{formattedDate}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "TODAY'S TOTAL EXPENSES", value: `RWF ${(expenseStats?.total_expenses || 0).toLocaleString()}`, sub: `${expenses.length} item${expenses.length !== 1 ? "s" : ""} logged`, color: "text-red-400" },
                { label: "TODAY'S TOTAL COGS", value: `RWF ${(expenseStats?.cogs || 0).toLocaleString()}`, sub: `${cogsPct}% of total expenses`, color: "text-[#3B59DA]" },
                { label: "TODAY'S OPERATIONAL COST", value: `RWF ${(expenseStats?.overhead || 0).toLocaleString()}`, sub: `${opsPct}% of total expenses`, color: "text-slate-700" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="bg-white rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                  <p className={cn("text-[18px] lg:text-[20px] font-black leading-tight", color)}>{value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main card: table + right panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-[16px] font-bold text-[#1E293B]">Review Today's Expense Data</p>
              <button
                onClick={() => toast({ title: "Export coming soon", description: "Report export will be available soon." })}
                className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors"
              >
                <Download className="h-4 w-4" /> Export Report
              </button>
            </div>

            <div className="lg:grid lg:grid-cols-[1fr_260px]">
              {/* Table */}
              <div className="overflow-x-auto lg:border-r lg:border-slate-100">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Expense Name</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Source</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-slate-400">
                          No expenses logged yet today.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800 max-w-[140px] truncate">{expense.item_name}</td>
                          <td className="px-4 py-3 text-slate-500 text-[12px]">{expense.category || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[11px] font-semibold rounded-full px-2.5 py-1",
                              expense.expense_type === "INGREDIENT" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                            )}>
                              {expense.expense_type === "INGREDIENT" ? "COGS" : "Overhead"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[12px]">{expense.source || "Manual Entry"}</td>
                          <td className="px-4 py-3 text-slate-600">{expense.quantity ? `${expense.quantity} ${expense.unit || ""}`.trim() : "—"}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">RWF {expense.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setEditExpenseTarget(expense); setEditExpenseResult(null); }}
                              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-colors"
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">Total</td>
                        <td /><td /><td /><td />
                        <td className="px-4 py-3 font-black text-slate-900">RWF {totalAmount.toLocaleString()}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Right panel */}
              <div className="p-5 space-y-5 border-t lg:border-t-0 border-slate-100">
                <div>
                  <p className="text-[14px] font-bold text-[#1E293B] mb-3">By Expense Type</p>
                  <div className="space-y-2.5">
                    {expenseStats ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-[13px] text-slate-600">COGS</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900">RWF {expenseStats.cogs.toLocaleString()}</span>
                            <span className="text-[12px] text-slate-400">{cogsPct}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span className="text-[13px] text-slate-600">Operating Costs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900">RWF {expenseStats.overhead.toLocaleString()}</span>
                            <span className="text-[12px] text-slate-400">{opsPct}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                          <span className="text-[13px] font-bold text-slate-900">Total</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900">RWF {expenseStats.total_expenses.toLocaleString()}</span>
                            <span className="text-[12px] text-slate-400">100%</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-[12px] text-slate-400">No expense data available.</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <p className="text-[12px] text-slate-500">Forgot something? Log it now before closing today.</p>
                  <Button
                    onClick={() => router.push("/dashboard/expenses")}
                    className="w-full h-10 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl text-[13px]"
                  >
                    + Log Expenses
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Expense Modal */}
          {editExpenseTarget && (
            <EditExpenseModal
              expense={editExpenseTarget}
              result={editExpenseResult}
              onSave={handleEditExpenseItem}
              onClose={() => {
                setEditExpenseTarget(null);
                setEditExpenseResult(null);
              }}
            />
          )}
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 z-10 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-slate-900">Ready to complete expenses review?</p>
            <p className="text-[12px] text-slate-400">Please ensure all expenses are logged accurately.</p>
          </div>
          <Button
            onClick={handleMarkExpensesDone}
            className="h-11 px-6 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl text-[14px] flex items-center gap-2"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── FINAL REVIEW SCREEN ──────────────────────────────────────────────────
  if (view === "final-review") {
    const netBalance =
      (todayStats?.today_revenue || 0) - (expenseStats?.total_expenses || 0);
    const bothDone = salesReviewed && expensesReviewed;

    return (
      <div className="mt-8 pb-32 lg:pb-8 px-4 lg:px-0">
        <div className="lg:max-w-5xl lg:mx-auto">
          <div className="space-y-4 lg:grid lg:grid-cols-[5fr_7fr] lg:gap-6 lg:space-y-0 lg:items-start">

            {/* Left column: centered status card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center relative">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h1 className="text-[26px] font-black text-[#1E293B] leading-tight">
                  You ran a good operation{" "}
                  <span className="text-[#3B59DA]">today.</span>
                </h1>
                <p className="text-[13px] text-slate-400 mt-2 max-w-[260px] mx-auto leading-relaxed">
                  Here's how the day adds up. Review and close when you're ready.
                </p>
              </div>
            </div>

            {/* Right column: stats + checklist + CTA */}
            <div className="space-y-4">
              {/* Net Daily Balance hero */}
              <div
                className="rounded-2xl p-6 text-white"
                style={{ background: "linear-gradient(135deg, #091558 0%, #3851dd 50%, #091558 100%)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1">
                  Net Daily Balance
                </p>
                <p className="text-[36px] font-black leading-none">RWF {netBalance.toLocaleString()}</p>
                {checksCompleteAt && (
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold bg-white/10 rounded-full px-3 py-1 text-white/80">
                    ↑ All checks complete · {checksCompleteAt}
                  </span>
                )}
              </div>

              {/* Sales + Expenses grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Sales */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Sales</p>
                  </div>
                  <p className="text-[24px] font-black text-[#1E293B]">
                    RWF {(todayStats?.today_revenue || 0).toLocaleString()}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    {todayStats?.dishes_sold || salesOrders.length} dishes sold today
                  </p>
                  {todayStats?.channels && (
                    <>
                      <div className="flex h-1.5 rounded-full overflow-hidden mt-3 gap-0.5">
                        <div className="bg-yellow-400 rounded-full" style={{ flex: todayStats.channels.dine_in.pct }} />
                        <div className="bg-green-400 rounded-full" style={{ flex: todayStats.channels.takeaway.pct }} />
                        <div className="bg-orange-400 rounded-full" style={{ flex: todayStats.channels.delivery.pct }} />
                      </div>
                      <div className="grid grid-cols-3 gap-1 mt-3">
                        {[
                          { key: "dine_in", label: "Dine-in", dot: "bg-yellow-400" },
                          { key: "takeaway", label: "Takeaway", dot: "bg-green-400" },
                          { key: "delivery", label: "Delivery", dot: "bg-orange-400" },
                        ].map(({ key, label, dot }) => {
                          const ch = todayStats.channels![key as keyof typeof todayStats.channels];
                          return (
                            <div key={key}>
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide truncate">{label}</span>
                              </div>
                              <p className="text-[13px] font-bold text-[#1E293B]">RWF {ch.revenue.toLocaleString()}</p>
                              <p className="text-[11px] text-slate-400">{ch.count} sales</p>
                              <p className="text-[11px] text-[#3B59DA] font-semibold">{ch.pct}% of total</p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Today's Total Expenses */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Today's Total Expenses</p>
                  </div>
                  <p className="text-[24px] font-black text-red-500">
                    RWF {(expenseStats?.total_expenses || 0).toLocaleString()}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-0.5">across all categories</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Total COGS</p>
                      <p className="text-[14px] font-bold text-[#1E293B] mt-0.5">RWF {(expenseStats?.cogs || 0).toLocaleString()}</p>
                      <p className="text-[11px] text-slate-400">Across all categories</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Total Operational Cost</p>
                      <p className="text-[14px] font-bold text-[#1E293B] mt-0.5">RWF {(expenseStats?.overhead || 0).toLocaleString()}</p>
                      <p className="text-[11px] text-slate-400">Across all categories</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready to Review checklist */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                <div className="px-5 py-4">
                  <p className="text-[16px] font-bold text-[#1E293B]">Ready to Review</p>
                </div>
                {[
                  { label: "Review Sales Summary", icon: <BarChart2 className="h-4 w-4 text-[#3B59DA]" />, done: salesReviewed, onEdit: enterReviewSales },
                  { label: "Review Expenses Summary", icon: <CreditCard className="h-4 w-4 text-[#3B59DA]" />, done: expensesReviewed, onEdit: enterReviewExpenses },
                ].map(({ label, icon, done, onEdit }) => (
                  <div key={label} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-lg bg-[#3B59DA]/5 border border-[#3B59DA]/10 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <span className="flex-1 text-[14px] font-semibold text-[#1E293B]">{label}</span>
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-green-500 rounded-full px-2.5 py-1 shrink-0">
                        <Check className="h-3 w-3" /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 shrink-0">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                    <button
                      onClick={onEdit}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  </div>
                ))}
              </div>

              {/* Amber notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-amber-700">
                  Forgot something? You have 24 hours after closing to log entries. They'll be marked as late but counted in today's record.
                </p>
              </div>

              {/* Confirm & Close CTA */}
              <Button
                onClick={handleWrapUp}
                disabled={isSubmitting}
                className={cn(
                  "w-full h-12 font-bold rounded-xl text-white",
                  bothDone ? "bg-[#091558] hover:bg-[#3851dd]" : "bg-slate-300 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : bothDone ? (
                  "That's a wrap — close today"
                ) : (
                  "Complete all checks to close"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile sticky footer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-10">
          <div className="max-w-xl mx-auto">
            <Button
              onClick={handleWrapUp}
              disabled={isSubmitting}
              className={cn(
                "w-full h-12 font-bold rounded-xl text-white",
                bothDone ? "bg-[#091558] hover:bg-[#3851dd]" : "bg-slate-300 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : bothDone ? (
                "That's a wrap — close today"
              ) : (
                "Complete all checks to close"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CLOSED SUCCESS SCREEN ────────────────────────────────────────────────
  return (
    <div className="mt-8 pb-8 px-4 lg:px-0">
      <div className="lg:max-w-5xl lg:mx-auto space-y-4">
        <div className="space-y-4 lg:grid lg:grid-cols-[5fr_7fr] lg:gap-6 lg:space-y-0 lg:items-start">

          {/* Left column — success card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
            {/* Header: org name + date */}
            <div>
              <p className="text-[15px] font-bold text-[#1E293B]">{orgName || "Restaurant"}</p>
              <p className="text-[13px] text-slate-500 mt-0.5">{formattedDate}</p>
            </div>
            {/* Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> CLOSED
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 border border-slate-100 bg-slate-50 rounded-full px-3 py-1">
                <Store className="h-3 w-3" /> {location || "Kigali, Rwanda"}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 border border-slate-100 bg-slate-50 rounded-full px-3 py-1">
                <Clock className="h-3 w-3" /> {formattedTime}
              </span>
            </div>
            {/* Glowing checkmark */}
            <div className="flex justify-center py-2">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-green-300/20 animate-ping" style={{ animationDelay: "0.3s" }} />
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center relative">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
              </div>
            </div>
            {/* Heading + subtitle */}
            <div className="text-center">
              <h1 className="text-[24px] font-black text-[#1E293B] leading-tight">Kitchen Closed Successfully!</h1>
              <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
                You have completed reviewing your sales and expenses data for today and are closed for the day.
              </p>
            </div>
          </div>

          {/* Right column — white stat cards */}
          <div className="space-y-4">
            {/* Total Sales */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Sales</p>
              </div>
              <p className="text-[24px] font-black text-[#1E293B]">
                RWF {(todayStats?.today_revenue || 0).toLocaleString()}
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {todayStats?.dishes_sold || salesOrders.length} dishes sold today
              </p>
              {todayStats?.channels && (
                <>
                  <div className="flex h-1.5 rounded-full overflow-hidden mt-3 gap-0.5">
                    <div className="bg-yellow-400 rounded-full" style={{ flex: todayStats.channels.dine_in.pct }} />
                    <div className="bg-green-400 rounded-full" style={{ flex: todayStats.channels.takeaway.pct }} />
                    <div className="bg-orange-400 rounded-full" style={{ flex: todayStats.channels.delivery.pct }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { key: "dine_in", label: "Dine-in", dot: "bg-yellow-400" },
                      { key: "takeaway", label: "Takeaway", dot: "bg-green-400" },
                      { key: "delivery", label: "Delivery", dot: "bg-orange-400" },
                    ].map(({ key, label, dot }) => {
                      const ch = todayStats.channels![key as keyof typeof todayStats.channels];
                      return (
                        <div key={key}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide truncate">{label}</span>
                          </div>
                          <p className="text-[13px] font-bold text-[#1E293B]">RWF {ch.revenue.toLocaleString()}</p>
                          <p className="text-[11px] text-slate-400">{ch.count} sales</p>
                          <p className="text-[11px] text-[#3B59DA] font-semibold">{ch.pct}% of total</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Today's Total Expenses */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Today's Total Expenses</p>
              </div>
              <p className="text-[24px] font-black text-red-500">
                RWF {(expenseStats?.total_expenses || 0).toLocaleString()}
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5">across all categories</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Total COGS</p>
                  <p className="text-[14px] font-bold text-[#1E293B] mt-0.5">RWF {(expenseStats?.cogs || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400">Across all categories</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Total Operational Cost</p>
                  <p className="text-[14px] font-bold text-[#1E293B] mt-0.5">RWF {(expenseStats?.overhead || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400">Across all categories</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reopen notice — full width below both columns */}
        {openingTime && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <Clock className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-[13px] font-semibold text-amber-700">
              {orgName || "Restaurant"} will reopen at {openingTime} tomorrow for service.
            </p>
          </div>
        )}

        {/* CTA buttons — full width below amber notice */}
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 h-12 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl"
          >
            <Home className="h-4 w-4 mr-2" /> Return to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "Coming soon", description: "Report download will be available soon." })}
            className="flex-1 h-12 rounded-xl font-bold"
          >
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT SALES MODAL ─────────────────────────────────────────────────────────
function EditSalesModal({
  item,
  result,
  onSave,
  onClose,
}: {
  item: TodayOrderItem;
  result: OrderItemUpdateResult | null;
  onSave: (quantity: number, unit_price: number) => Promise<void>;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [unitPrice, setUnitPrice] = useState(item.unit_price.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(Number(quantity), Number(unitPrice));
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-xl lg:shadow-2xl p-6 space-y-5">
        {!result ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-slate-900">Edit Sales Data</h3>
                <p className="text-[13px] text-slate-400">Fill in the details below</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[16px] font-bold text-slate-900">{item.menu_item_name}</p>
                <p className="text-[13px] text-slate-400">Dish details</p>
              </div>
              <p className="text-[14px] font-bold text-[#3B59DA]">
                RWF {item.unit_price.toLocaleString()} / plate
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">
                  Quantity Sold
                </label>
                <Input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  type="number"
                  className="h-12 rounded-xl"
                  placeholder="45 plates"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">
                  Sales Revenue
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-[13px] font-semibold text-slate-500">
                    RWF
                  </span>
                  <Input
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    type="number"
                    className="h-12 rounded-l-none rounded-r-xl"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Sales Data"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-slate-900">Edit Sales Data</h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="text-center space-y-3 py-2">
              <p className="text-[14px] font-semibold text-slate-600">Sales data updated!</p>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-[16px] font-bold text-slate-900">{item.menu_item_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-[13px] text-slate-500">Updated Price</p>
                <p className="text-[13px] font-semibold text-slate-800">
                  RWF {result.old.line_total.toLocaleString()} → RWF{" "}
                  {result.new.line_total.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-[13px] text-slate-500">Quantity Sold</p>
                <p className="text-[13px] font-semibold text-slate-800">
                  {result.old.quantity} plates → {result.new.quantity} plates
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              className="w-full h-12 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl"
            >
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── EDIT EXPENSE MODAL ───────────────────────────────────────────────────────
function EditExpenseModal({
  expense,
  result,
  onSave,
  onClose,
}: {
  expense: TodayExpenseItem;
  result: ExpenseUpdateResult | null;
  onSave: (payload: any) => Promise<void>;
  onClose: () => void;
}) {
  const [itemName, setItemName] = useState(expense.item_name);
  const [quantity, setQuantity] = useState(expense.quantity || "");
  const [amount, setAmount] = useState(expense.amount.toString());
  const [expenseType, setExpenseType] = useState(expense.expense_type);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      item_name: itemName,
      quantity,
      amount: Number(amount),
      expense_type: expenseType,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-xl lg:shadow-2xl p-6 space-y-5">
        {!result ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-slate-900">Edit Expense Data</h3>
                <p className="text-[13px] text-slate-400">Fill in the details below</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">
                  Expense Name
                </label>
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">
                    Quantity
                  </label>
                  <Input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-12 rounded-xl"
                    placeholder="25 kg"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">
                    Expense Cost
                  </label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-[13px] font-semibold text-slate-500">
                      RWF
                    </span>
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      className="h-12 rounded-l-none rounded-r-xl"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-2 block">
                  Select Expense Type
                </label>
                <div className="flex gap-2">
                  {["INGREDIENT", "OVERHEAD"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setExpenseType(t)}
                      className={cn(
                        "flex-1 h-10 rounded-xl border text-[13px] font-semibold transition-all",
                        expenseType === t
                          ? "bg-[#3B59DA] border-[#3B59DA] text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {t === "INGREDIENT" ? "COGS (Ingredients)" : "Ops"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Expenses Data"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-slate-900">Edit Expense Data</h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="text-center space-y-3 py-2">
              <p className="text-[14px] font-semibold text-slate-600">Expense data updated</p>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-[16px] font-bold text-slate-900">{expense.item_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-[13px] text-slate-500">Cost</p>
                <p className="text-[13px] font-semibold text-slate-800">
                  RWF {result.old.amount.toLocaleString()} → RWF{" "}
                  {result.new.amount.toLocaleString()}
                </p>
              </div>
              {result.old.expense_type !== result.new.expense_type && (
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-[13px] text-slate-500">Expense Type</p>
                  <p className="text-[13px] font-semibold text-slate-800">
                    {result.old.expense_type} → {result.new.expense_type}
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={onClose}
              className="w-full h-12 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl"
            >
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
