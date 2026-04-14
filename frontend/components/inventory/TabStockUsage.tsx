"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChefHat,
  Trash2,
  ArrowLeft,
  Package,
  Lock,
  RotateCcw,
  Clock,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FigtreeText, InriaHeading } from "@/components/ui/dosteon-ui";
import { toast } from "sonner";
import {
  inventoryApi,
  InventoryProduct,
  StockUsageStats,
  StockUsageEvent,
} from "@/lib/services/inventoryService";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONSUMPTION_REASONS = [
  { value: "CUSTOMER_SERVICE", label: "Customer Service" },
  { value: "STAFF_MEAL",       label: "Staff Meal"       },
  { value: "OTHER",            label: "Other"            },
];

const WASTE_REASONS = [
  { value: "SPOILED_EXPIRED",   label: "Spoiled / Expired"   },
  { value: "DAMAGED_PACKAGING", label: "Damaged Packaging"   },
  { value: "SPILLED_DROPPED",   label: "Spilled / Dropped"   },
  { value: "OVERCOOKED_BURNED", label: "Overcooked / Burned" },
  { value: "QUALITY_ISSUE",     label: "Quality Issue"       },
  { value: "OTHER",             label: "Other"               },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60)  return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en").format(n);
}

function reasonLabel(reason: string | null): string {
  if (!reason) return "";
  const all = [...CONSUMPTION_REASONS, ...WASTE_REASONS];
  return all.find((r) => r.value === reason)?.label ?? reason;
}

// ---------------------------------------------------------------------------
// Stats banner
// ---------------------------------------------------------------------------

function StatsBanner({ stats }: { stats: StockUsageStats | null }) {
  const cards = [
    {
      label: "Most Used Item",
      value: stats?.most_used_item ?? "—",
      icon:  ChefHat,
      isText: true,
    },
    {
      label: "Consumption Today",
      value: stats ? fmt(stats.consumption_today) : "—",
      icon:  Activity,
      isText: false,
    },
    {
      label: "Waste Today",
      value: stats ? fmt(stats.waste_today) : "—",
      icon:  Trash2,
      isText: false,
    },
    {
      label: "Most Wasted Item",
      value: stats?.most_wasted_item ?? "—",
      icon:  Package,
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-[#3B59DA] to-[#2540B8] p-4 md:p-5"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-[6px] bg-white/15 flex items-center justify-center shrink-0">
                <card.icon className="h-3.5 w-3.5 text-white/80 stroke-[2px]" />
              </div>
              <span className="text-white/70 text-[11px] font-semibold font-figtree leading-tight">
                {card.label}
              </span>
            </div>
            <div
              className={cn(
                "font-black text-white font-figtree leading-tight",
                card.isText ? "text-[14px] md:text-[15px] line-clamp-2" : "text-[22px] md:text-[26px]"
              )}
            >
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left panel — default selection state
// ---------------------------------------------------------------------------

function DefaultActionCards({
  onSelect,
}: {
  onSelect: (mode: "consumption" | "waste") => void;
}) {
  return (
    <div className="space-y-3">
      {/* Log Consumption */}
      <button
        onClick={() => onSelect("consumption")}
        className="w-full text-left rounded-[10px] border-2 border-slate-100 bg-white hover:border-[#3B59DA]/30 hover:bg-indigo-50/30 transition-all active:scale-[0.99] p-5 md:p-6 group"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-[10px] bg-indigo-50 border border-indigo-100/60 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#3B59DA] group-hover:border-[#3B59DA] transition-colors">
            <ChefHat className="h-6 w-6 text-[#3B59DA] group-hover:text-white stroke-[2px] transition-colors" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-black text-[#1E293B] font-figtree leading-tight group-hover:text-[#3B59DA] transition-colors">
              Log Consumption
            </div>
            <FigtreeText className="text-[12px] text-slate-400 font-medium mt-0.5">
              Record ingredients used for service
            </FigtreeText>
          </div>
        </div>
      </button>

      {/* Log Waste */}
      <button
        onClick={() => onSelect("waste")}
        className="w-full text-left rounded-[10px] border-2 border-slate-100 bg-white hover:border-rose-200 hover:bg-rose-50/20 transition-all active:scale-[0.99] p-5 md:p-6 group"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-[10px] bg-rose-50 border border-rose-100/60 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-rose-500 group-hover:border-rose-500 transition-colors">
            <Trash2 className="h-5 w-5 text-rose-500 group-hover:text-white stroke-[2px] transition-colors" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-black text-[#1E293B] font-figtree leading-tight group-hover:text-rose-600 transition-colors">
              Log Waste
            </div>
            <FigtreeText className="text-[12px] text-slate-400 font-medium mt-0.5">
              Record spoiled, damaged or unusable items
            </FigtreeText>
          </div>
        </div>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left panel — form
// ---------------------------------------------------------------------------

interface FormState {
  product_id: string;
  quantity:   string;
  reason:     string;
}

function UsageForm({
  mode,
  products,
  onBack,
  onSubmitted,
}: {
  mode:        "consumption" | "waste";
  products:    InventoryProduct[];
  onBack:      () => void;
  onSubmitted: () => void;
}) {
  const isConsumption = mode === "consumption";
  const reasons       = isConsumption ? CONSUMPTION_REASONS : WASTE_REASONS;

  const [form, setForm]           = useState<FormState>({ product_id: "", quantity: "", reason: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === form.product_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity || !form.reason) return;
    const qty = parseFloat(form.quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isConsumption) {
        await inventoryApi.logConsumption({
          product_id:          form.product_id,
          quantity:            qty,
          consumption_reason:  form.reason,
        });
        toast.success("Consumption logged", {
          description: `${qty} ${selectedProduct?.unit ?? "units"} of ${selectedProduct?.name ?? "item"} recorded.`,
        });
      } else {
        await inventoryApi.logWaste({
          product_id:   form.product_id,
          quantity:     qty,
          waste_reason: form.reason,
        });
        toast.success("Waste logged", {
          description: `${qty} ${selectedProduct?.unit ?? "units"} of ${selectedProduct?.name ?? "item"} recorded.`,
        });
      }
      onSubmitted();
    } catch {
      // errors handled by axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    "w-full h-10 rounded-[8px] border border-slate-200 bg-white px-3 text-[13px] font-medium font-figtree text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3B59DA]/10 focus:border-[#3B59DA]/30 transition-all appearance-none";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 hover:text-[#3B59DA] font-figtree transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-[8px] flex items-center justify-center shrink-0",
            isConsumption ? "bg-indigo-50 border border-indigo-100" : "bg-rose-50 border border-rose-100"
          )}
        >
          {isConsumption
            ? <ChefHat className="h-5 w-5 text-[#3B59DA] stroke-[2px]" />
            : <Trash2   className="h-5 w-5 text-rose-500 stroke-[2px]" />}
        </div>
        <div>
          <div className="text-[15px] font-black text-[#1E293B] font-figtree">
            {isConsumption ? "Log Consumption" : "Log Waste"}
          </div>
          <FigtreeText className="text-[11px] text-slate-400 font-medium">
            {isConsumption
              ? "Record items used during service"
              : "Record items that were wasted"}
          </FigtreeText>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-600 font-figtree">Product</label>
          <select
            className={selectClass}
            value={form.product_id}
            onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
            required
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-600 font-figtree">
            Quantity {selectedProduct ? `(${selectedProduct.unit})` : ""}
          </label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="h-10 rounded-[8px] border-slate-200 font-medium text-[13px] font-figtree focus:ring-[#3B59DA]/10 focus:border-[#3B59DA]/30"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            required
          />
          {selectedProduct && form.quantity && parseFloat(form.quantity) > 0 && (
            <FigtreeText className="text-[11px] text-slate-400">
              Will deduct{" "}
              <span className={cn("font-bold", isConsumption ? "text-[#3B59DA]" : "text-rose-500")}>
                {form.quantity} {selectedProduct.unit}
              </span>{" "}
              from current stock ({fmt(selectedProduct.current_stock)} {selectedProduct.unit} available)
            </FigtreeText>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-600 font-figtree">
            {isConsumption ? "Reason for use" : "Reason for waste"}
          </label>
          <select
            className={selectClass}
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            required
          >
            <option value="">Select reason…</option>
            {reasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || !form.product_id || !form.quantity || !form.reason}
          className={cn(
            "w-full h-11 rounded-[8px] font-black text-[13px] font-figtree gap-2 transition-all active:scale-95 border-none shadow-sm",
            isConsumption
              ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-[0_4px_14px_rgba(59,89,218,0.3)]"
              : "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.25)]"
          )}
        >
          {isSubmitting ? (
            <><RotateCcw className="h-3.5 w-3.5 animate-spin" /> Saving…</>
          ) : (
            isConsumption ? "Log Consumption" : "Log Waste"
          )}
        </Button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left panel — locked state
// ---------------------------------------------------------------------------

function LockedPanel() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 rounded-[10px] border border-slate-100 bg-slate-50/50">
      <div className="h-14 w-14 rounded-[14px] bg-white border border-slate-100 shadow-sm flex items-center justify-center">
        <Lock className="h-6 w-6 text-slate-400 stroke-[2px]" />
      </div>
      <div className="space-y-2 max-w-[260px]">
        <div className="text-[14px] font-black text-[#1E293B] font-figtree">Service Not Started</div>
        <FigtreeText className="text-[12px] text-slate-400 font-medium leading-relaxed">
          Complete your daily opening stock count to start logging consumption and waste.
        </FigtreeText>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right panel — Kitchen Service History feed
// ---------------------------------------------------------------------------

function HistoryFeed({
  events,
  isRefreshing,
}: {
  events:       StockUsageEvent[];
  isRefreshing: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[6px] bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Clock className="h-3.5 w-3.5 text-slate-400 stroke-[2px]" />
          </div>
          <span className="text-[13px] font-bold text-[#1E293B] font-figtree">Kitchen Service History</span>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium font-figtree">
            <RotateCcw className="h-3 w-3 animate-spin" /> refreshing
          </div>
        )}
      </div>

      {/* Event list */}
      <div className="space-y-2 flex-1">
        {events.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-[13px] font-medium font-figtree">
            No activity yet today.
          </div>
        )}
        {events.map((event) => {
          const isUsed = event.event_type === "USED";
          return (
            <div
              key={event.id}
              className="flex items-start justify-between gap-3 p-3 rounded-[8px] bg-slate-50/60 border border-slate-100/80 hover:bg-white hover:border-slate-200 transition-all"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Type badge */}
                <span
                  className={cn(
                    "shrink-0 mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-[4px] uppercase tracking-wide font-figtree",
                    isUsed
                      ? "bg-indigo-50 text-[#3B59DA] border border-indigo-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  )}
                >
                  {isUsed ? "Used" : "Wasted"}
                </span>

                {/* Name + reason */}
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-[#1E293B] font-figtree truncate">
                    {event.product_name}
                  </div>
                  {(event.consumption_reason || event.waste_reason) && (
                    <FigtreeText className="text-[11px] text-slate-400 font-medium">
                      {reasonLabel(event.consumption_reason ?? event.waste_reason)}
                    </FigtreeText>
                  )}
                </div>
              </div>

              {/* Quantity + time */}
              <div className="shrink-0 text-right space-y-0.5">
                <div
                  className={cn(
                    "text-[13px] font-black font-figtree",
                    isUsed ? "text-[#3B59DA]" : "text-rose-500"
                  )}
                >
                  {isUsed ? "+" : "−"}{fmt(event.quantity)} {event.unit}
                </div>
                <FigtreeText className="text-[10px] text-slate-400 font-medium">
                  {relativeTime(event.occurred_at)}
                </FigtreeText>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------

type PanelMode = "default" | "consumption" | "waste";

export function TabStockUsage() {
  const { isOpen } = useRestaurantDayLifecycle();

  const [stats, setStats]       = useState<StockUsageStats | null>(null);
  const [history, setHistory]   = useState<StockUsageEvent[]>([]);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [panel, setPanel]       = useState<PanelMode>("default");
  const [isHistoryRefreshing, setIsHistoryRefreshing] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const loadHistory = useCallback(async (silent = false) => {
    if (silent) setIsHistoryRefreshing(true);
    try {
      const [s, h] = await Promise.all([
        inventoryApi.getStockUsageStats(),
        inventoryApi.getStockUsageHistory(10),
      ]);
      setStats(s);
      setHistory(h);
    } catch {
      // handled by axios interceptor
    } finally {
      setIsHistoryRefreshing(false);
    }
  }, []);

  // Initial load: stats + history + products
  useEffect(() => {
    const init = async () => {
      try {
        const [s, h, p] = await Promise.all([
          inventoryApi.getStockUsageStats(),
          inventoryApi.getStockUsageHistory(10),
          inventoryApi.getProducts(),
        ]);
        setStats(s);
        setHistory(h);
        setProducts(p);
      } catch {
        // handled by axios interceptor
      }
    };
    init();
  }, []);

  // Auto-refresh history every 15 seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => loadHistory(true), 15_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadHistory]);

  // After a successful submission: reset panel, refresh data
  const handleSubmitted = useCallback(() => {
    setPanel("default");
    loadHistory(true);
  }, [loadHistory]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-5 md:p-7 space-y-5">

      {/* Stats banner */}
      <StatsBanner stats={stats} />

      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left panel ── */}
        <div className="flex-1 min-w-0 bg-white border border-slate-100 rounded-[10px] p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">

          {!isOpen ? (
            <LockedPanel />
          ) : panel === "default" ? (
            <DefaultActionCards onSelect={setPanel} />
          ) : (
            <UsageForm
              mode={panel}
              products={products}
              onBack={() => setPanel("default")}
              onSubmitted={handleSubmitted}
            />
          )}
        </div>

        {/* ── Right panel: history feed ── */}
        <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 bg-white border border-slate-100 rounded-[10px] p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <HistoryFeed events={history} isRefreshing={isHistoryRefreshing} />
        </div>

      </div>
    </div>
  );
}
