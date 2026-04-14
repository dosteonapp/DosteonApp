"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Plus,
  RotateCcw,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { FigtreeText, InriaHeading } from "@/components/ui/dosteon-ui";
import { inventoryApi, InventoryProduct, InventoryStats } from "@/lib/services/inventoryService";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en").format(n);
}

// ---------------------------------------------------------------------------
// Trend indicator shown in stat card subtext
// ---------------------------------------------------------------------------

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null || pct === undefined) {
    return <span className="text-slate-400 text-[11px] font-semibold font-figtree">— no data yet</span>;
  }
  const abs = Math.abs(pct);
  if (pct > 0) {
    return (
      <span className="flex items-center gap-1 text-emerald-500 text-[11px] font-bold font-figtree">
        <TrendingUp className="h-3 w-3" /> +{abs}% vs last week
      </span>
    );
  }
  if (pct < 0) {
    return (
      <span className="flex items-center gap-1 text-rose-500 text-[11px] font-bold font-figtree">
        <TrendingDown className="h-3 w-3" /> {abs}% vs last week
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-slate-400 text-[11px] font-semibold font-figtree">
      <Minus className="h-3 w-3" /> no change
    </span>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  healthy:  { label: "Healthy",  className: "bg-emerald-50 text-emerald-600 border-emerald-100/60" },
  low:      { label: "Low",      className: "bg-amber-50 text-amber-600 border-amber-100/60"       },
  critical: { label: "Critical", className: "bg-rose-50 text-rose-600 border-rose-100/60"          },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, className: "bg-slate-50 text-slate-400" };
  return (
    <Badge
      className={cn(
        "border rounded-[6px] font-bold text-[11px] px-2.5 py-0.5 font-figtree shadow-none",
        meta.className
      )}
    >
      {meta.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Opening Prep hero banner (CLOSED state)
// ---------------------------------------------------------------------------

function OpeningPrepBanner({
  stats,
  totalItems,
}: {
  stats: InventoryStats | null;
  totalItems: number;
}) {
  const cards = [
    {
      label:   "Items in Stock",
      value:   stats?.items_in_stock.value ?? 0,
      pct:     stats?.items_in_stock.vs_last_week_pct ?? null,
      icon:    Package,
      color:   "text-[#3B59DA]",
      iconBg:  "bg-indigo-100/60",
    },
    {
      label:   "Healthy",
      value:   stats?.healthy_stock.value ?? 0,
      pct:     stats?.healthy_stock.vs_last_week_pct ?? null,
      icon:    CheckCircle2,
      color:   "text-emerald-400",
      iconBg:  "bg-emerald-100/40",
    },
    {
      label:   "Low Stock",
      value:   stats?.low_stock.value ?? 0,
      pct:     stats?.low_stock.vs_last_week_pct ?? null,
      icon:    AlertTriangle,
      color:   "text-amber-300",
      iconBg:  "bg-amber-100/40",
    },
    {
      label:   "Critical",
      value:   stats?.critical.value ?? 0,
      pct:     stats?.critical.vs_last_week_pct ?? null,
      icon:    AlertCircle,
      color:   "text-rose-400",
      iconBg:  "bg-rose-100/40",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-[#3B59DA] to-[#2540B8] p-6 md:p-8">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">

        {/* Left: text + CTA */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center gap-2.5 w-fit px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
            <ClipboardList className="h-3.5 w-3.5 text-white/80" />
            <FigtreeText className="text-[12px] font-bold text-white/90 leading-none">
              {fmt(totalItems)} items need counting
            </FigtreeText>
          </div>

          <InriaHeading className="text-[26px] md:text-[32px] font-bold text-white leading-tight">
            Opening Prep
          </InriaHeading>

          <FigtreeText className="text-white/70 text-[14px] md:text-[15px] leading-relaxed max-w-sm">
            Complete your daily opening stock count to track stock levels and unlock full operations.
          </FigtreeText>

          <Button
            className="w-fit h-12 px-8 bg-white text-[#3B59DA] hover:bg-slate-100 rounded-[8px] font-black gap-3 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-95 group font-figtree text-[14px] border-none"
            asChild
          >
            <Link href="/dashboard/inventory/daily-stock-count">
              Count Daily Stock
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Right: 2×2 stat cards */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[380px]">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-[10px] p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className={cn("h-7 w-7 rounded-[6px] flex items-center justify-center", card.iconBg)}>
                  <card.icon className={cn("h-3.5 w-3.5 stroke-[2.5px]", card.color)} />
                </div>
                <span className="text-white/70 text-[11px] font-semibold font-figtree leading-tight">
                  {card.label}
                </span>
              </div>
              <div className="text-white font-black text-[22px] font-figtree leading-none">
                {fmt(card.value)}
              </div>
              <div className="text-white/50 text-[10px] font-semibold font-figtree">
                {card.pct === null
                  ? "— no data"
                  : card.pct > 0
                  ? `↑ ${Math.abs(card.pct)}% vs last week`
                  : card.pct < 0
                  ? `↓ ${Math.abs(card.pct)}% vs last week`
                  : "no change"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live banner (OPEN state)
// ---------------------------------------------------------------------------

function LiveBanner({
  stats,
  onRefresh,
  isRefreshing,
}: {
  stats: InventoryStats | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const cards = [
    { label: "Items in Stock", value: stats?.items_in_stock.value ?? 0, pct: stats?.items_in_stock.vs_last_week_pct ?? null, icon: Package,      color: "text-[#3B59DA]",   iconBg: "bg-indigo-100/60" },
    { label: "Healthy",        value: stats?.healthy_stock.value  ?? 0, pct: stats?.healthy_stock.vs_last_week_pct  ?? null, icon: CheckCircle2, color: "text-emerald-400", iconBg: "bg-emerald-100/40" },
    { label: "Low Stock",      value: stats?.low_stock.value      ?? 0, pct: stats?.low_stock.vs_last_week_pct      ?? null, icon: AlertTriangle, color: "text-amber-300",  iconBg: "bg-amber-100/40" },
    { label: "Critical",       value: stats?.critical.value       ?? 0, pct: stats?.critical.vs_last_week_pct       ?? null, icon: AlertCircle,  color: "text-rose-400",    iconBg: "bg-rose-100/40" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-[#3B59DA] to-[#2540B8] p-6 md:p-8">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top row: heading + buttons */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <InriaHeading className="text-[24px] md:text-[28px] font-bold text-white leading-tight">
              Inventory
            </InriaHeading>
            <FigtreeText className="text-white/70 text-[13px] md:text-[14px]">
              Complete your closing stock count before end of service.
            </FigtreeText>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 px-4 rounded-[8px] bg-white/10 border-white/20 text-white font-bold text-[12px] font-figtree hover:bg-white/20 gap-2 transition-all active:scale-95"
            >
              <RotateCcw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              <span className="hidden sm:block">Update Inventory</span>
            </Button>
            <Button
              className="h-9 px-4 rounded-[8px] bg-white text-[#3B59DA] hover:bg-slate-100 font-bold text-[12px] font-figtree gap-2 transition-all active:scale-95 shadow-sm border-none"
              asChild
            >
              <Link href="/dashboard/inventory/new">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:block">Add New Product</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-[10px] p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className={cn("h-7 w-7 rounded-[6px] flex items-center justify-center", card.iconBg)}>
                  <card.icon className={cn("h-3.5 w-3.5 stroke-[2.5px]", card.color)} />
                </div>
                <span className="text-white/70 text-[11px] font-semibold font-figtree">{card.label}</span>
              </div>
              <div className="text-white font-black text-[22px] font-figtree leading-none">
                {fmt(card.value)}
              </div>
              <div className="text-white/50 text-[10px] font-semibold font-figtree">
                {card.pct === null
                  ? "— no data"
                  : card.pct > 0
                  ? `↑ ${Math.abs(card.pct)}% vs last week`
                  : card.pct < 0
                  ? `↓ ${Math.abs(card.pct)}% vs last week`
                  : "no change"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// What's Running Low section
// ---------------------------------------------------------------------------

function RunningLowSection({ products }: { products: InventoryProduct[] }) {
  const lowItems = products.filter((p) => p.status_class === "critical" || p.status_class === "low");
  if (lowItems.length === 0) return null;

  return (
    <div className="rounded-[10px] border border-rose-200 bg-white p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-[6px] bg-rose-50 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-4 w-4 text-rose-500 stroke-[2.5px]" />
        </div>
        <div>
          <span className="text-[14px] font-bold text-[#1E293B] font-figtree">What's Running Low</span>
          <span className="text-[12px] font-semibold text-rose-500 font-figtree ml-2">— needs restocking</span>
        </div>
      </div>

      <div className="space-y-2">
        {lowItems.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 py-3 px-4 rounded-[8px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-rose-100 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-[8px] bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                <Package className="h-4 w-4 text-slate-300" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#1E293B] font-figtree truncate">{item.name}</div>
                <div className="text-[11px] text-slate-400 font-medium font-figtree">
                  {fmt(item.current_stock)} {item.unit} left · min {fmt(item.min_level)} {item.unit}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={item.status_class} />
              <Button
                variant="outline"
                className="h-8 w-8 p-0 rounded-[6px] border-slate-200 text-slate-400 hover:text-[#3B59DA] hover:border-[#3B59DA]/30 transition-all"
                asChild
              >
                <Link href={`/dashboard/inventory/${item.id}`}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product table
// ---------------------------------------------------------------------------

function ProductTable({
  products,
  isLoading,
}: {
  products: InventoryProduct[];
  isLoading: boolean;
}) {
  return (
    <div className="border border-slate-100 rounded-[8px] overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-slate-50/60">
          <TableRow className="border-b border-slate-100 hover:bg-transparent h-14">
            <TableHead className="font-bold text-slate-500 text-[12px] py-4 pl-6 font-figtree">Item Name / SKU</TableHead>
            <TableHead className="font-bold text-slate-500 text-[12px] font-figtree">Category</TableHead>
            <TableHead className="font-bold text-slate-500 text-[12px] font-figtree">Brand</TableHead>
            <TableHead className="font-bold text-slate-500 text-[12px] font-figtree">Stock Unit</TableHead>
            <TableHead className="font-bold text-slate-500 text-[12px] font-figtree">Current Stock</TableHead>
            <TableHead className="font-bold text-slate-500 text-[12px] font-figtree">Min. Level</TableHead>
            <TableHead className="font-bold text-slate-500 text-[12px] font-figtree">Status</TableHead>
            <TableHead className="font-bold text-slate-500 text-[12px] font-figtree">Last Updated</TableHead>
            <TableHead className="font-bold text-slate-500 text-[12px] font-figtree text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && products.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400 font-figtree text-sm">
                  <RotateCcw className="h-4 w-4 animate-spin" /> Loading products…
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && products.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-slate-400 text-sm font-figtree">
                No products match your search.
              </TableCell>
            </TableRow>
          )}
          {products.map((item) => (
            <TableRow
              key={item.id}
              className="border-slate-50 hover:bg-[#f8f9ff] transition-colors h-[80px]"
            >
              <TableCell className="pl-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[8px] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-slate-300" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-slate-700 font-figtree leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium font-figtree uppercase tracking-tight">
                      {item.sku ?? "—"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-slate-600 font-medium text-[13px] font-figtree">{item.category}</TableCell>
              <TableCell className="text-slate-600 font-medium text-[13px] font-figtree">{item.brand_name ?? "—"}</TableCell>
              <TableCell className="text-slate-600 font-medium text-[13px] font-figtree">{item.unit}</TableCell>
              <TableCell className="text-slate-700 font-bold text-[13px] font-figtree">
                {fmt(item.current_stock)} {item.unit}
              </TableCell>
              <TableCell className="text-slate-600 font-medium text-[13px] font-figtree">
                {fmt(item.min_level)} {item.unit}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status_class} />
              </TableCell>
              <TableCell className="text-slate-500 font-medium text-[12px] font-figtree">
                {relativeTime(item.updated_at)}
              </TableCell>
              <TableCell className="text-right pr-6">
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 rounded-[8px] border-slate-200 text-slate-400 hover:bg-[#3B59DA] hover:text-white hover:border-[#3B59DA] transition-all active:scale-95"
                  asChild
                >
                  <Link href={`/dashboard/inventory/${item.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main tab component
// ---------------------------------------------------------------------------

export function TabProductCatalog() {
  const { isOpen } = useRestaurantDayLifecycle();

  const [products, setProducts]   = useState<InventoryProduct[]>([]);
  const [stats, setStats]         = useState<InventoryStats | null>(null);
  const [search, setSearch]       = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const [products, stats] = await Promise.all([
        inventoryApi.getProducts({ search: search || undefined }),
        inventoryApi.getStats(),
      ]);
      setProducts(products);
      setStats(stats);
    } catch {
      // errors handled by axios interceptor
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  const totalItems = stats?.items_in_stock.value ?? products.length;

  return (
    <div className="p-5 md:p-7 space-y-5">

      {/* ── Banner (state-dependent) ── */}
      {!isOpen ? (
        <OpeningPrepBanner stats={stats} totalItems={totalItems} />
      ) : (
        <LiveBanner
          stats={stats}
          onRefresh={() => load(true)}
          isRefreshing={isRefreshing}
        />
      )}

      {/* ── What's Running Low (LIVE state only) ── */}
      {isOpen && <RunningLowSection products={products} />}

      {/* ── Controls row ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
          <Input
            placeholder="Search products or SKUs…"
            className="pl-10 h-10 border-slate-200 rounded-[8px] bg-white font-medium text-[13px] font-figtree placeholder:text-slate-300 focus:ring-[#3B59DA]/10 focus:border-[#3B59DA]/30 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Buttons — only shown in CLOSED state; in LIVE state they live in the banner */}
        {!isOpen && (
          <>
            <Button
              variant="outline"
              onClick={() => load(true)}
              disabled={isRefreshing}
              className="h-10 px-4 rounded-[8px] border-slate-200 text-[#3B59DA] font-bold text-[13px] font-figtree hover:bg-slate-50 gap-2 transition-all active:scale-95"
            >
              <RotateCcw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              Update Inventory
            </Button>
            <Button
              className="h-10 px-4 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold text-[13px] font-figtree gap-2 shadow-[0_4px_14px_rgba(59,89,218,0.3)] active:scale-95 transition-all border-none"
              asChild
            >
              <Link href="/dashboard/inventory/new">
                <Plus className="h-3.5 w-3.5" />
                Add New Product
              </Link>
            </Button>
          </>
        )}
      </div>

      {/* ── Product table ── */}
      <ProductTable products={products} isLoading={isLoading} />

    </div>
  );
}
