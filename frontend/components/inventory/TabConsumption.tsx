"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Trash2,
  Package,
  RotateCcw,
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
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const FILTER_PILLS = [
  { id: "all",            label: "All"                },
  { id: "sale_deduction", label: "Sales Deduction"    },
  { id: "consumption",    label: "Manual Consumption" },
  { id: "waste",          label: "Waste"              },
] as const;

type FilterType = (typeof FILTER_PILLS)[number]["id"];

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

function fmt(n: number) {
  return new Intl.NumberFormat("en").format(n);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatContext(event: StockUsageEvent): string {
  if (event.event_type === "USED" && event.actor_type === "sale") {
    return "Recipe deduction";
  }
  const crMap: Record<string, string> = {
    CUSTOMER_SERVICE: "Customer Service",
    STAFF_MEAL:       "Staff Meal",
    OTHER:            "Other",
  };
  const wrMap: Record<string, string> = {
    SPOILED_EXPIRED:   "Spoiled / Expired",
    DAMAGED_PACKAGING: "Damaged Packaging",
    SPILLED_DROPPED:   "Spilled / Dropped",
    OVERCOOKED_BURNED: "Overcooked / Burned",
    QUALITY_ISSUE:     "Quality Issue",
    OTHER:             "Other",
  };
  return (
    crMap[event.consumption_reason ?? ""] ||
    wrMap[event.waste_reason ?? ""] ||
    "—"
  );
}

// ---------------------------------------------------------------------------
// Status badge (for modal stock level display)
// ---------------------------------------------------------------------------

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
// Type badge (table)
// ---------------------------------------------------------------------------

function TypeBadge({ event }: { event: StockUsageEvent }) {
  if (event.event_type === "WASTED") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 whitespace-nowrap">
        Waste
      </span>
    );
  }
  if (event.actor_type === "sale") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 whitespace-nowrap">
        Sale Deduction
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 whitespace-nowrap">
      Consumption
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
      <button type="button" className={btnClass} onClick={() => step(-1)}>
        <Minus className="h-4 w-4 stroke-[3px]" />
      </button>
      <div className="flex-1 relative">
        <input
          type="number"
          min="0"
          step="1.0"
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
      <button type="button" className={btnClass} onClick={() => step(1)}>
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
  const [productId,  setProductId]  = useState("");
  const [quantity,   setQuantity]   = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const selected = products.find((p) => p.id === productId);

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
        <div className="bg-[#3B59DA] px-5 pt-5 pb-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-white font-black text-[20px] font-figtree leading-tight">
              Log Usage
            </span>
            <DialogClose className="h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0 mt-0.5">
              <X className="h-4 w-4 text-white stroke-[2.5px]" />
            </DialogClose>
          </div>
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
  const [productId,  setProductId]  = useState("");
  const [quantity,   setQuantity]   = useState("1");
  const [reason,     setReason]     = useState("");
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
        <div className="bg-white px-5 py-5 space-y-5">
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
// Stats banner (dark navy)
// ---------------------------------------------------------------------------

function StatsBanner({ stats }: { stats: StockUsageStats | null }) {
  const cards = [
    {
      label:     "Most Used Item",
      value:     stats?.most_used_item ?? "—",
      sub:       "Most used today",
      icon:      TrendingUp,
      iconBg:    "bg-emerald-100",
      iconColor: "text-emerald-600",
      isText:    true,
    },
    {
      label:     "Consumption Today",
      value:     stats ? fmt(stats.consumption_today) : "—",
      sub:       "Units used in the kitchen",
      icon:      Activity,
      iconBg:    "bg-blue-100",
      iconColor: "text-blue-600",
      isText:    false,
    },
    {
      label:     "Waste Today",
      value:     stats ? fmt(stats.waste_today) : "—",
      sub:       "Units wasted",
      icon:      Trash2,
      iconBg:    "bg-rose-100",
      iconColor: "text-rose-600",
      isText:    false,
    },
    {
      label:     "Most Wasted Item",
      value:     stats?.most_wasted_item ?? "—",
      sub:       "Most wasted today",
      icon:      Package,
      iconBg:    "bg-rose-100",
      iconColor: "text-rose-600",
      isText:    true,
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
// Main tab
// ---------------------------------------------------------------------------

export function TabConsumption() {
  const [stats,       setStats]       = useState<StockUsageStats | null>(null);
  const [history,     setHistory]     = useState<StockUsageEvent[]>([]);
  const [total,       setTotal]       = useState(0);
  const [products,    setProducts]    = useState<InventoryProduct[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filterType,  setFilterType]  = useState<FilterType>("all");
  const [page,        setPage]        = useState(0);
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [usageOpen,   setUsageOpen]   = useState(false);
  const [wastageOpen, setWastageOpen] = useState(false);

  // Load products once on mount — not dependent on filters
  useEffect(() => {
    inventoryApi.getProducts().then(setProducts).catch(() => {});
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [s, h] = await Promise.all([
        inventoryApi.getStockUsageStats(),
        inventoryApi.getStockUsageHistory({
          limit:       PAGE_SIZE,
          offset:      page * PAGE_SIZE,
          filter_type: filterType,
          start_date:  dateFrom || undefined,
          end_date:    dateTo   || undefined,
        }),
      ]);
      setStats(s);
      setHistory(h.events);
      setTotal(h.total);
    } catch {
      // handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }, [page, filterType, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => load(true), 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [load]);

  const handleSubmitted = useCallback(() => { load(true); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd   = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div>
      {/* Dark stats banner */}
      <StatsBanner stats={stats} />

      {/* Content area */}
      <div className="p-5 md:p-6 space-y-4">

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#1E293B] font-figtree">Consumption Activity</h2>
            <p className="text-slate-400 text-[12px] font-medium font-figtree mt-0.5">
              Recent waste &amp; consumption entries
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 text-[13px] font-bold font-figtree border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => setUsageOpen(true)}
            >
              Log Consumption
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 text-[13px] font-bold font-figtree bg-rose-500 hover:bg-rose-600 text-white border-none shadow-sm"
              onClick={() => setWastageOpen(true)}
            >
              Log Waste
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
          {/* Date range */}
          <div className="flex items-center gap-2 text-[12px]">
            <label className="text-slate-500 font-semibold font-figtree">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
              className="h-8 rounded-lg border border-slate-200 px-2 text-[12px] font-figtree bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <label className="text-slate-500 font-semibold font-figtree">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
              className="h-8 rounded-lg border border-slate-200 px-2 text-[12px] font-figtree bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill.id}
                onClick={() => { setFilterType(pill.id); setPage(0); }}
                className={cn(
                  "px-3 py-1 rounded-full text-[12px] font-bold font-figtree transition-all",
                  filterType === pill.id
                    ? "bg-[#1E293B] text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data table */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    Inventory Item
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    Qty Used
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    Cost Impact (RWF)
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    Context
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    Logged By
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3.5 bg-slate-100 rounded animate-pulse w-[80%]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : history.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 text-[12px] whitespace-nowrap font-figtree">
                      {formatDateTime(event.occurred_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1E293B] font-figtree">
                      {event.product_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#1E293B]">
                      {fmt(event.quantity)} {event.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-figtree">
                      —
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge event={event} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-figtree text-[12px]">
                      {formatContext(event)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-figtree text-[12px]">
                      {event.actor_type === "sale" ? "Auto (Sale)" : "Manual"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && history.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-[13px] font-medium font-figtree">
              No activity matches your filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-slate-400 font-figtree">
              Showing {rangeStart}–{rangeEnd} of {total} records
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 px-3 text-[12px] font-bold font-figtree gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 text-[12px] font-bold font-figtree gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

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
