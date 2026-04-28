"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChefHat,
  Trash2,
  Package,
  Lock,
  RotateCcw,
  Clock,
  Activity,
  X,
  Minus,
  Plus,
  Droplets,
  FlameKindling,
  BadgeAlert,
  CalendarX,
  Thermometer,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FigtreeText } from "@/components/ui/dosteon-ui";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
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

const WASTE_REASONS = [
  { value: "SPOILED_EXPIRED",   label: "Expired",  icon: CalendarX      },
  { value: "SPILLED_DROPPED",   label: "Spilled",  icon: Droplets       },
  { value: "QUALITY_ISSUE",     label: "Quality",  icon: BadgeAlert     },
  { value: "OVERCOOKED_BURNED", label: "Burned",   icon: FlameKindling  },
  { value: "DAMAGED_PACKAGING", label: "Damaged",  icon: Thermometer    },
  { value: "OTHER",             label: "Other",    icon: HelpCircle     },
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
  const hrs  = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en").format(n);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    healthy:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    low:      "bg-amber-100  text-amber-700  border-amber-200",
    critical: "bg-rose-100   text-rose-700   border-rose-200",
  };
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold font-figtree capitalize",
      map[status] ?? map.healthy
    )}>
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stepper input
// ---------------------------------------------------------------------------

function Stepper({
  value,
  onChange,
  unit,
  color,
}: {
  value: string;
  onChange: (v: string) => void;
  unit: string;
  color: "blue" | "red";
}) {
  const btnClass = cn(
    "h-10 w-10 rounded-[8px] flex items-center justify-center shrink-0 font-black text-lg transition-all active:scale-95",
    color === "blue"
      ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white"
      : "bg-[#C0392B] hover:bg-[#a93226] text-white"
  );

  const step = (delta: number) => {
    const cur = parseFloat(value) || 0;
    const next = Math.max(0, parseFloat((cur + delta).toFixed(2)));
    onChange(String(next));
  };

  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btnClass} onClick={() => step(-0.5)}>
        <Minus className="h-4 w-4 stroke-[3px]" />
      </button>
      <div className="flex-1 relative">
        <input
          type="number"
          min="0"
          step="0.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-full h-10 rounded-[8px] border border-slate-200 bg-white px-3 pr-10 text-[15px] font-black text-[#1E293B] font-figtree text-center focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-[#3B59DA]/40 transition-all"
          placeholder="0"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400 font-figtree pointer-events-none">
          {unit}
        </span>
      </div>
      <button type="button" className={btnClass} onClick={() => step(0.5)}>
        <Plus className="h-4 w-4 stroke-[3px]" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Log Usage Modal
// ---------------------------------------------------------------------------

function LogUsageModal({
  open,
  onClose,
  products,
  onSubmitted,
}: {
  open:        boolean;
  onClose:     () => void;
  products:    InventoryProduct[];
  onSubmitted: () => void;
}) {
  const [productId, setProductId] = useState("");
  const [quantity,  setQuantity]  = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const selected = products.find((p) => p.id === productId);

  // Reset on open
  useEffect(() => {
    if (open) { setProductId(""); setQuantity("1"); }
  }, [open]);

  const handleConfirm = async () => {
    const qty = parseFloat(quantity);
    if (!productId || isNaN(qty) || qty <= 0) return;
    setSubmitting(true);
    try {
      await inventoryApi.logConsumption({
        product_id: productId,
        quantity: qty,
        consumption_reason: "CUSTOMER_SERVICE",
      });
      toast.success("Usage logged", {
        description: `${qty} ${selected?.unit ?? "units"} of ${selected?.name} recorded.`,
      });
      onSubmitted();
      onClose();
    } catch {
      // handled by axios interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent hideCloseButton className="p-0 gap-0 max-w-[400px] rounded-[16px] overflow-hidden border-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <DialogTitle className="sr-only">Log Usage</DialogTitle>
        {/* Blue header */}
        <div className="bg-[#3B59DA] px-5 pt-5 pb-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-white font-black text-[20px] font-figtree leading-tight">
              Log Usage
            </span>
            <DialogClose className="h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0 mt-0.5">
              <X className="h-4 w-4 text-white stroke-[2.5px]" />
            </DialogClose>
          </div>

          {/* Product selector inside header */}
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full h-9 rounded-[8px] bg-white/15 border border-white/20 px-3 text-[13px] font-bold text-white placeholder-white/50 font-figtree focus:outline-none focus:bg-white/20 transition-all appearance-none"
            style={{ colorScheme: "dark" }}
          >
            <option value="" className="text-slate-700 bg-white">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} className="text-slate-700 bg-white">
                {p.name}
              </option>
            ))}
          </select>

          {selected && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-white/80 text-[12px] font-semibold font-figtree">
                ({fmt(selected.current_stock)} {selected.unit} remaining)
              </span>
              <StatusBadge status={selected.status_class} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="bg-white px-5 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.1em] font-figtree">
              Enter Amount
            </label>
            <Stepper
              value={quantity}
              onChange={setQuantity}
              unit={selected?.unit ?? "units"}
              color="blue"
            />
          </div>

          {selected && parseFloat(quantity) > 0 && (
            <p className="text-[11px] text-slate-400 font-semibold font-figtree">
              Will deduct{" "}
              <span className="text-[#3B59DA] font-bold">
                {quantity} {selected.unit}
              </span>{" "}
              from {fmt(selected.current_stock)} remaining.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-5 pb-5 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-[8px] border-slate-200 text-slate-500 font-bold font-figtree"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black font-figtree shadow-[0_4px_14px_rgba(59,89,218,0.3)] active:scale-95 transition-all border-none"
            disabled={!productId || !quantity || parseFloat(quantity) <= 0 || submitting}
            onClick={handleConfirm}
          >
            {submitting ? <RotateCcw className="h-4 w-4 animate-spin" /> : "Confirm Usage"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Log Wastage Modal
// ---------------------------------------------------------------------------

function LogWastageModal({
  open,
  onClose,
  products,
  onSubmitted,
}: {
  open:        boolean;
  onClose:     () => void;
  products:    InventoryProduct[];
  onSubmitted: () => void;
}) {
  const [productId, setProductId] = useState("");
  const [quantity,  setQuantity]  = useState("1");
  const [reason,    setReason]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected = products.find((p) => p.id === productId);

  useEffect(() => {
    if (open) { setProductId(""); setQuantity("1"); setReason(""); }
  }, [open]);

  const handleConfirm = async () => {
    const qty = parseFloat(quantity);
    if (!productId || !reason || isNaN(qty) || qty <= 0) return;
    setSubmitting(true);
    try {
      await inventoryApi.logWaste({
        product_id:   productId,
        quantity:     qty,
        waste_reason: reason,
      });
      toast.success("Wastage logged", {
        description: `${qty} ${selected?.unit ?? "units"} of ${selected?.name} recorded.`,
      });
      onSubmitted();
      onClose();
    } catch {
      // handled by axios interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent hideCloseButton className="p-0 gap-0 max-w-[400px] rounded-[16px] overflow-hidden border-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <DialogTitle className="sr-only">Log Wastage</DialogTitle>
        {/* Red header */}
        <div className="bg-[#C0392B] px-5 pt-5 pb-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-white font-black text-[20px] font-figtree leading-tight">
              Log Wastage
            </span>
            <DialogClose className="h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0 mt-0.5">
              <X className="h-4 w-4 text-white stroke-[2.5px]" />
            </DialogClose>
          </div>

          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full h-9 rounded-[8px] bg-white/15 border border-white/20 px-3 text-[13px] font-bold text-white font-figtree focus:outline-none focus:bg-white/20 transition-all appearance-none"
            style={{ colorScheme: "dark" }}
          >
            <option value="" className="text-slate-700 bg-white">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} className="text-slate-700 bg-white">
                {p.name}
              </option>
            ))}
          </select>

          {selected && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-white/80 text-[12px] font-semibold font-figtree">
                ({fmt(selected.current_stock)} {selected.unit} remaining)
              </span>
              <StatusBadge status={selected.status_class} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="bg-white px-5 py-5 space-y-5">
          {/* Waste reason icons */}
          <div className="space-y-2">
            <div>
              <p className="text-[13px] font-bold text-[#1E293B] font-figtree">Log Waste Reason</p>
              <p className="text-[11px] text-slate-400 font-semibold font-figtree mt-0.5">
                Choose why this item is being discarded
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {WASTE_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 px-2 rounded-[10px] border-2 transition-all active:scale-95",
                    reason === r.value
                      ? "border-[#C0392B] bg-rose-50"
                      : "border-slate-100 bg-slate-50 hover:border-rose-200 hover:bg-rose-50/50"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-[8px] flex items-center justify-center",
                    reason === r.value ? "bg-[#C0392B]" : "bg-white border border-slate-200"
                  )}>
                    <r.icon className={cn(
                      "h-4 w-4 stroke-[2px]",
                      reason === r.value ? "text-white" : "text-slate-400"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold font-figtree",
                    reason === r.value ? "text-[#C0392B]" : "text-slate-500"
                  )}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stepper */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.1em] font-figtree">
              Enter Amount
            </label>
            <Stepper
              value={quantity}
              onChange={setQuantity}
              unit={selected?.unit ?? "units"}
              color="red"
            />
          </div>

          {selected && parseFloat(quantity) > 0 && (
            <p className="text-[11px] text-slate-400 font-semibold font-figtree">
              Will discard{" "}
              <span className="text-rose-500 font-bold">
                {quantity} {selected.unit}
              </span>{" "}
              from {fmt(selected.current_stock)} remaining.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-5 pb-5 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-[8px] border-slate-200 text-slate-500 font-bold font-figtree"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11 rounded-[8px] bg-[#C0392B] hover:bg-[#a93226] text-white font-black font-figtree shadow-[0_4px_14px_rgba(192,57,43,0.3)] active:scale-95 transition-all border-none"
            disabled={!productId || !reason || !quantity || parseFloat(quantity) <= 0 || submitting}
            onClick={handleConfirm}
          >
            {submitting ? <RotateCcw className="h-4 w-4 animate-spin" /> : "Confirm Wastage"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Stats banner
// ---------------------------------------------------------------------------

function StatsBanner({ stats }: { stats: StockUsageStats | null }) {
  const cards = [
    {
      label:    "Most Used Item",
      value:    stats?.most_used_item ?? "—",
      sub:      "Most used today",
      icon:     TrendingUp,
      iconBg:   "bg-emerald-100",
      iconColor:"text-emerald-600",
      isText:   true,
    },
    {
      label:    "Consumption Today",
      value:    stats ? fmt(stats.consumption_today) : "—",
      sub:      "Units used in the kitchen",
      icon:     Activity,
      iconBg:   "bg-blue-100",
      iconColor:"text-blue-600",
      isText:   false,
    },
    {
      label:    "Waste Today",
      value:    stats ? fmt(stats.waste_today) : "—",
      sub:      "Units wasted",
      icon:     Trash2,
      iconBg:   "bg-rose-100",
      iconColor:"text-rose-600",
      isText:   false,
    },
    {
      label:    "Most Wasted Item",
      value:    stats?.most_wasted_item ?? "—",
      sub:      "Most wasted today",
      icon:     Package,
      iconBg:   "bg-rose-100",
      iconColor:"text-rose-600",
      isText:   true,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-[#091558] via-[#3851dd] to-[#091558] px-5 md:px-7 py-6 md:py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-[12px] p-4 md:p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-2">
              <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0", card.iconBg)}>
                <card.icon className={cn("h-3.5 w-3.5 stroke-[2px]", card.iconColor)} />
              </div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.08em] font-figtree leading-tight">
                {card.label}
              </span>
            </div>
            <div className={cn(
              "font-black text-[#1E293B] font-figtree leading-tight",
              card.isText ? "text-[15px] md:text-[16px] line-clamp-2" : "text-[24px] md:text-[28px]"
            )}>
              {card.value}
            </div>
            <p className="text-[11px] text-slate-400 font-semibold font-figtree -mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action cards (left panel)
// ---------------------------------------------------------------------------

function ActionCards({ onUsage, onWastage }: { onUsage: () => void; onWastage: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={onUsage}
        className="flex flex-col items-center justify-center gap-3 rounded-[12px] border border-slate-100 bg-white hover:border-[#3B59DA]/30 hover:bg-indigo-50/20 transition-all active:scale-[0.98] py-10 px-4 group"
      >
        <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-[#3B59DA] transition-colors">
          <ChefHat className="h-7 w-7 text-[#3B59DA] group-hover:text-white stroke-[2px] transition-colors" />
        </div>
        <span className="text-[14px] font-black text-[#1E293B] font-figtree group-hover:text-[#3B59DA] transition-colors">
          Log Consumption
        </span>
      </button>

      <button
        onClick={onWastage}
        className="flex flex-col items-center justify-center gap-3 rounded-[12px] border border-slate-100 bg-white hover:border-rose-200 hover:bg-rose-50/20 transition-all active:scale-[0.98] py-10 px-4 group"
      >
        <div className="h-14 w-14 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-[#C0392B] transition-colors">
          <Trash2 className="h-6 w-6 text-rose-500 group-hover:text-white stroke-[2px] transition-colors" />
        </div>
        <span className="text-[14px] font-black text-[#1E293B] font-figtree group-hover:text-rose-600 transition-colors">
          Log Waste
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Locked panel
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
// History feed
// ---------------------------------------------------------------------------

function HistoryFeed({ events, isRefreshing }: { events: StockUsageEvent[]; isRefreshing: boolean }) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-[15px] font-black text-[#1E293B] font-figtree">Kitchen Service History</div>
          <p className="text-[12px] text-slate-400 font-medium font-figtree mt-0.5">
            Recent waste and consumption entries captured for this shift.
          </p>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium font-figtree shrink-0 mt-1">
            <RotateCcw className="h-3 w-3 animate-spin" />
          </div>
        )}
      </div>

      <div className="mt-4 flex-1">
        {events.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-[13px] font-medium font-figtree">
            No activity yet today.
          </div>
        )}
        {events.map((event, i) => {
          const isUsed = event.event_type === "USED";
          return (
            <div
              key={event.id}
              className={cn(
                "flex items-center gap-3 py-3",
                i < events.length - 1 && "border-b border-slate-50"
              )}
            >
              {/* Icon circle */}
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                {isUsed
                  ? <ChefHat className="h-4 w-4 text-slate-400 stroke-[2px]" />
                  : <Trash2  className="h-4 w-4 text-slate-400 stroke-[2px]" />
                }
              </div>

              {/* Name + time + badge */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-[#1E293B] font-figtree truncate">
                  {event.product_name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-400 font-figtree">
                    {relativeTime(event.occurred_at)}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full font-figtree",
                    isUsed
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-rose-500 text-white"
                  )}>
                    {isUsed ? "Consumption" : "Marked as Waste"}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div className={cn(
                "text-[13px] font-black font-figtree shrink-0",
                isUsed ? "text-[#1E293B]" : "text-rose-500"
              )}>
                {!isUsed && "- "}{fmt(event.quantity)} {event.unit}
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

export function TabStockUsage() {
  const { isOpen } = useRestaurantDayLifecycle();

  const [stats,   setStats]   = useState<StockUsageStats | null>(null);
  const [history, setHistory] = useState<StockUsageEvent[]>([]);
  const [products,setProducts]= useState<InventoryProduct[]>([]);
  const [isHistoryRefreshing, setIsHistoryRefreshing] = useState(false);

  const [usageOpen,   setUsageOpen]   = useState(false);
  const [wastageOpen, setWastageOpen] = useState(false);

  const loadHistory = useCallback(async (silent = false) => {
    if (silent) setIsHistoryRefreshing(true);
    try {
      const [s, h] = await Promise.all([
        inventoryApi.getStockUsageStats(),
        inventoryApi.getStockUsageHistory(10),
      ]);
      setStats(s);
      setHistory(h);
    } catch { /* handled by axios interceptor */ } finally {
      setIsHistoryRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [s, h, p] = await Promise.all([
          inventoryApi.getStockUsageStats(),
          inventoryApi.getStockUsageHistory(10),
          inventoryApi.getProducts(),
        ]);
        setStats(s); setHistory(h); setProducts(p);
      } catch { /* handled by axios interceptor */ }
    };
    init();
  }, []);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => loadHistory(true), 5_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loadHistory]);

  const handleSubmitted = useCallback(() => { loadHistory(true); }, [loadHistory]);

  return (
    <div>

      {/* Dark stats banner — flush to card edges */}
      <StatsBanner stats={stats} />

      {/* Content area */}
      <div className="p-5 md:p-6 flex flex-col lg:flex-row gap-5">

        {/* Left panel */}
        <div className="flex-1 min-w-0 bg-white border border-slate-100 rounded-[12px] p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          {!isOpen ? (
            <LockedPanel />
          ) : (
            <>
              <div className="mb-5">
                <div className="text-[15px] font-black text-[#1E293B] font-figtree">Log Stock Usage</div>
                <p className="text-[12px] text-slate-400 font-medium font-figtree mt-0.5">
                  Select whether to log usage or waste.
                </p>
              </div>
              <ActionCards
                onUsage={() => setUsageOpen(true)}
                onWastage={() => setWastageOpen(true)}
              />
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 bg-white border border-slate-100 rounded-[12px] p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <HistoryFeed events={history} isRefreshing={isHistoryRefreshing} />
        </div>
      </div>

      <LogUsageModal
        open={usageOpen}
        onClose={() => setUsageOpen(false)}
        products={products}
        onSubmitted={handleSubmitted}
      />
      <LogWastageModal
        open={wastageOpen}
        onClose={() => setWastageOpen(false)}
        products={products}
        onSubmitted={handleSubmitted}
      />
    </div>
  );
}
