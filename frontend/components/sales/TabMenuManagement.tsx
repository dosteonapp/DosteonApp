"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Pencil,
  Archive,
  Package,
  TrendingUp,
  Star,
  DollarSign,
  BarChart2,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FigtreeText,
  InriaHeading,
  UnifiedModal,
  UnifiedErrorBanner,
} from "@/components/ui/dosteon-ui";
import {
  salesService,
  MenuItem,
  MenuCategory,
  MenuStats,
} from "@/lib/services/salesService";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

function calcMargin(price: number, cost: number): number | null {
  if (price <= 0) return null;
  return ((price - cost) / price) * 100;
}

function MarginPill({ price, cost }: { price: number; cost: number }) {
  const m = calcMargin(price, cost);
  if (m === null) return <span className="text-[11px] font-semibold text-slate-300 font-figtree">No price</span>;

  const color =
    m >= 50 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
    m >= 20 ? "bg-amber-50 text-amber-600 border-amber-100" :
              "bg-rose-50 text-rose-500 border-rose-100";

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold font-figtree",
      color
    )}>
      <TrendingUp className="h-2.5 w-2.5" />
      {m.toFixed(1)}% margin
    </span>
  );
}

// ---------------------------------------------------------------------------
// Form state type
// ---------------------------------------------------------------------------

interface DishForm {
  name: string;
  price: string;
  cost: string;
  category: string;
}

const EMPTY_FORM: DishForm = { name: "", price: "", cost: "", category: "Signature" };

function formToPayload(f: DishForm) {
  return {
    name: f.name.trim(),
    price: parseFloat(f.price) || 0,
    cost: parseFloat(f.cost) || 0,
    category: f.category.trim() || "Signature",
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabMenuManagement() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuStats, setMenuStats]   = useState<MenuStats | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [search, setSearch]           = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const [addModalOpen, setAddModalOpen]   = useState(false);
  const [editingItem, setEditingItem]     = useState<MenuItem | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const [addForm, setAddForm]   = useState<DishForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<DishForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const [menuData, stats] = await Promise.all([
        salesService.getMenu(),
        salesService.getMenuStats(),
      ]);
      setCategories(menuData.categories);
      setMenuStats(stats);
    } catch {
      setError("Could not load menu items. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtered items ─────────────────────────────────────────────────────

  const allItems = useMemo(() => categories.flatMap((c) => c.items), [categories]);
  const existingCategories = useMemo(() => categories.map((c) => c.category), [categories]);

  const visibleItems = useMemo(() => {
    const pool = activeCategory === "all"
      ? allItems
      : (categories.find((c) => c.category === activeCategory)?.items ?? []);
    if (!search.trim()) return pool;
    const q = search.toLowerCase();
    return pool.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [allItems, categories, activeCategory, search]);

  // ── Add dish ──────────────────────────────────────────────────────────

  const openAdd = () => { setAddForm(EMPTY_FORM); setAddModalOpen(true); };

  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setIsSubmitting(true);
    try {
      await salesService.createMenuItem(formToPayload(addForm));
      setAddModalOpen(false);
      await load(true);
      toast.success("Dish added!", { description: addForm.name });
    } catch {
      toast.error("Could not add dish. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit dish ─────────────────────────────────────────────────────────

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      price: item.price > 0 ? String(item.price) : "",
      cost: item.cost > 0 ? String(item.cost) : "",
      category: item.category,
    });
  };

  const handleEdit = async () => {
    if (!editingItem || !editForm.name.trim()) return;
    setIsSubmitting(true);
    try {
      await salesService.updateMenuItem(editingItem.id, formToPayload(editForm));
      setEditingItem(null);
      await load(true);
      toast.success("Dish updated!", { description: editForm.name });
    } catch {
      toast.error("Could not update dish. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Archive dish ──────────────────────────────────────────────────────

  const handleArchive = async (item: MenuItem) => {
    setIsSubmitting(true);
    try {
      await salesService.archiveMenuItem(item.id);
      setConfirmArchiveId(null);
      await load(true);
      toast.success("Dish archived.", { description: `"${item.name}" has been removed from the menu.` });
    } catch {
      toast.error("Could not archive dish. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (isLoading) return <MenuManagementSkeleton />;

  return (
    <div>
      {/* Menu stats banner */}
      <MenuStatsBanner stats={menuStats} />

      <div className="p-5 md:p-7 space-y-5">
        {error && <UnifiedErrorBanner message={error} />}

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              <CategoryPill label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
              {categories.map((c) => (
                <CategoryPill
                  key={c.category}
                  label={c.category}
                  active={activeCategory === c.category}
                  onClick={() => setActiveCategory(c.category)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
              <Input
                placeholder="Search…"
                className="pl-9 h-9 w-36 sm:w-44 text-[13px] font-semibold border-slate-200 rounded-[8px] bg-slate-50 placeholder:text-slate-300 focus-visible:ring-indigo-400/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Add button */}
            <Button
              className="h-9 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold text-[13px] font-figtree gap-2 px-4 shadow-[0_2px_10px_rgba(59,89,218,0.25)] active:scale-95 transition-all"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4" />
              Add Dish
            </Button>
          </div>
        </div>

        {/* Dish grid */}
        {visibleItems.length === 0 ? (
          <EmptyMenuState onAdd={openAdd} hasMenu={allItems.length > 0} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {visibleItems.map((item) => (
              <DishCard
                key={item.id}
                item={item}
                isConfirmingArchive={confirmArchiveId === item.id}
                isSubmitting={isSubmitting}
                onEdit={() => openEdit(item)}
                onRequestArchive={() => setConfirmArchiveId(item.id)}
                onCancelArchive={() => setConfirmArchiveId(null)}
                onConfirmArchive={() => handleArchive(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Dish modal */}
      <UnifiedModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Dish"
        subtitle="Add a dish to your menu. Set a cost to track profit margins."
        footer={
          <>
            <Button
              variant="outline"
              className="h-12 px-8 rounded-[10px] border-slate-200 font-bold text-[14px] font-figtree"
              onClick={() => setAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="h-12 px-10 rounded-[10px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black text-[14px] font-figtree gap-2 shadow-[0_4px_14px_rgba(59,89,218,0.3)] active:scale-95 transition-all disabled:opacity-50"
              disabled={!addForm.name.trim() || isSubmitting}
              onClick={handleAdd}
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Dish
            </Button>
          </>
        }
      >
        <DishForm
          form={addForm}
          onChange={setAddForm}
          existingCategories={existingCategories}
        />
      </UnifiedModal>

      {/* Edit Dish modal */}
      <UnifiedModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Dish"
        subtitle={editingItem?.name}
        footer={
          <>
            <Button
              variant="outline"
              className="h-12 px-8 rounded-[10px] border-slate-200 font-bold text-[14px] font-figtree"
              onClick={() => setEditingItem(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="h-12 px-10 rounded-[10px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black text-[14px] font-figtree gap-2 shadow-[0_4px_14px_rgba(59,89,218,0.3)] active:scale-95 transition-all disabled:opacity-50"
              disabled={!editForm.name.trim() || isSubmitting}
              onClick={handleEdit}
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </>
        }
      >
        <DishForm
          form={editForm}
          onChange={setEditForm}
          existingCategories={existingCategories}
        />
      </UnifiedModal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Menu stats banner
// ---------------------------------------------------------------------------

function MenuStatsBanner({ stats }: { stats: MenuStats | null }) {
  const s = stats ?? { total_dishes: 0, top_selling_dish: null, avg_selling_price: 0, avg_gross_margin: 0 };

  const marginColor =
    s.avg_gross_margin >= 50 ? "text-emerald-600" :
    s.avg_gross_margin >= 20 ? "text-amber-600" :
    s.avg_gross_margin > 0   ? "text-rose-500" : "text-slate-400";

  return (
    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-indigo-50/20 px-5 md:px-8 py-5">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] font-figtree mb-4">
        Menu Overview
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-slate-200/60">
        <MenuStat
          icon={Package}
          label="Total Dishes"
          value={String(s.total_dishes)}
        />
        <MenuStat
          icon={Star}
          label="Top Seller (30d)"
          value={s.top_selling_dish ?? "—"}
          className="md:pl-6"
          valueClassName="text-[17px]"
        />
        <MenuStat
          icon={DollarSign}
          label="Avg Selling Price"
          value={fmt(s.avg_selling_price)}
          className="md:pl-6"
        />
        <MenuStat
          icon={BarChart2}
          label="Avg Gross Margin"
          value={`${s.avg_gross_margin.toFixed(1)}%`}
          className="md:pl-6"
          valueClassName={marginColor}
        />
      </div>
    </div>
  );
}

function MenuStat({
  icon: Icon,
  label,
  value,
  className,
  valueClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-400 font-figtree">{label}</span>
      </div>
      <div className={cn(
        "text-[22px] font-black text-[#1E293B] tracking-tight font-figtree leading-none truncate",
        valueClassName
      )}>
        {value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dish card
// ---------------------------------------------------------------------------

function DishCard({
  item,
  isConfirmingArchive,
  isSubmitting,
  onEdit,
  onRequestArchive,
  onCancelArchive,
  onConfirmArchive,
}: {
  item: MenuItem;
  isConfirmingArchive: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onRequestArchive: () => void;
  onCancelArchive: () => void;
  onConfirmArchive: () => void;
}) {
  return (
    <div className={cn(
      "rounded-[12px] border bg-white flex flex-col overflow-hidden transition-all",
      isConfirmingArchive
        ? "border-rose-200 shadow-[0_2px_12px_rgba(244,63,94,0.08)]"
        : "border-slate-100 hover:border-indigo-200/60 hover:shadow-[0_4px_16px_rgba(59,89,218,0.06)]"
    )}>
      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Category badge */}
        <span className="inline-block px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wide font-figtree max-w-full truncate w-fit">
          {item.category}
        </span>

        {/* Name */}
        <div className="text-[13px] font-bold text-[#1E293B] font-figtree leading-tight line-clamp-2 flex-1">
          {item.name}
        </div>

        {/* Price + cost */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-[16px] font-black text-[#3B59DA] font-figtree tabular-nums leading-none">
              {fmt(item.price)}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 font-figtree mt-0.5">
              cost {item.cost > 0 ? fmt(item.cost) : "—"}
            </div>
          </div>
          <MarginPill price={item.price} cost={item.cost} />
        </div>
      </div>

      {/* Action strip */}
      {isConfirmingArchive ? (
        <div className="bg-rose-50 border-t border-rose-100 px-3 py-2.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-rose-600 font-figtree flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" /> Archive?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancelArchive}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 font-figtree transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirmArchive}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold font-figtree transition-all active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Archive className="h-3 w-3" />}
              Archive
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="h-7 w-7 rounded-[6px] flex items-center justify-center text-slate-400 hover:text-[#3B59DA] hover:bg-indigo-50 transition-all active:scale-90"
            title="Edit dish"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRequestArchive}
            className="h-7 w-7 rounded-[6px] flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
            title="Archive dish"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dish form (shared between Add + Edit modals)
// ---------------------------------------------------------------------------

function DishForm({
  form,
  onChange,
  existingCategories,
}: {
  form: DishForm;
  onChange: (f: DishForm) => void;
  existingCategories: string[];
}) {
  const price  = parseFloat(form.price)  || 0;
  const cost   = parseFloat(form.cost)   || 0;
  const margin = calcMargin(price, cost);

  const marginColor =
    margin === null                    ? "text-slate-400" :
    margin >= 50                       ? "text-emerald-600" :
    margin >= 20                       ? "text-amber-600"   : "text-rose-500";

  const set = (key: keyof DishForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-8">
      {/* Name */}
      <FormField label="Dish Name" required>
        <Input
          placeholder="e.g. Grilled Salmon"
          value={form.name}
          onChange={set("name")}
          className="h-12 text-[15px] font-semibold border-slate-200 rounded-[8px] focus-visible:ring-indigo-400/20 font-figtree"
          autoFocus
        />
      </FormField>

      {/* Category */}
      <FormField label="Category">
        <Input
          placeholder="e.g. Signature, Drinks, Sides"
          value={form.category}
          onChange={set("category")}
          list="category-suggestions"
          className="h-12 text-[15px] font-semibold border-slate-200 rounded-[8px] focus-visible:ring-indigo-400/20 font-figtree"
        />
        <datalist id="category-suggestions">
          {existingCategories.map((c) => <option key={c} value={c} />)}
        </datalist>
      </FormField>

      {/* Price + Cost side by side */}
      <div className="grid grid-cols-2 gap-5">
        <FormField label="Selling Price">
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={form.price}
            onChange={set("price")}
            className="h-12 text-[15px] font-semibold border-slate-200 rounded-[8px] focus-visible:ring-indigo-400/20 font-figtree"
          />
        </FormField>
        <FormField label="Cost Price" hint="optional">
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={form.cost}
            onChange={set("cost")}
            className="h-12 text-[15px] font-semibold border-slate-200 rounded-[8px] focus-visible:ring-indigo-400/20 font-figtree"
          />
        </FormField>
      </div>

      {/* Live margin preview */}
      <div className="rounded-[10px] border border-slate-100 bg-slate-50/60 px-5 py-4 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] font-figtree">
            Margin Preview
          </div>
          <div className={cn("text-[26px] font-black font-figtree leading-none", marginColor)}>
            {margin !== null ? `${margin.toFixed(1)}%` : "—"}
          </div>
        </div>
        {price > 0 && cost > 0 && (
          <div className="text-right space-y-0.5">
            <div className="text-[11px] font-semibold text-slate-400 font-figtree">Profit per sale</div>
            <div className={cn("text-[18px] font-black font-figtree tabular-nums", marginColor)}>
              {fmt(price - cost)}
            </div>
          </div>
        )}
        {price > 0 && cost === 0 && (
          <FigtreeText className="text-[12px] text-slate-400 max-w-[150px] text-right leading-relaxed">
            Add a cost price to track your profit margin
          </FigtreeText>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-[13px] font-bold text-[#1E293B] font-figtree">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {hint && (
          <span className="text-[11px] font-semibold text-slate-400 font-figtree">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category pill
// ---------------------------------------------------------------------------

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyMenuState({ onAdd, hasMenu }: { onAdd: () => void; hasMenu: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="h-14 w-14 rounded-[14px] bg-slate-50 border border-slate-100 flex items-center justify-center">
        <Package className="h-6 w-6 text-slate-300" />
      </div>
      <div className="space-y-1.5">
        <InriaHeading className="text-[20px] font-bold">
          {hasMenu ? "No dishes match your search" : "No dishes yet"}
        </InriaHeading>
        <FigtreeText className="text-[13px] font-semibold text-slate-400 max-w-[220px] leading-relaxed">
          {hasMenu
            ? "Try a different search or category filter."
            : "Add your first dish to start tracking sales and margins."}
        </FigtreeText>
      </div>
      {!hasMenu && (
        <Button
          className="h-10 px-6 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold text-[13px] font-figtree gap-2 shadow-[0_4px_14px_rgba(59,89,218,0.3)] active:scale-95 transition-all mt-2"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          Add First Dish
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function MenuManagementSkeleton() {
  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50/80 px-8 py-6 space-y-4">
        <Skeleton className="h-3.5 w-36 rounded-full" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
