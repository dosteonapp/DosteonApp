"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Pencil,
  Archive,
  Package,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  Award,
  Tag,
  Percent,
  TrendingUp,
  TrendingDown,
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
import { SalesStatsBanner } from "@/components/sales/SalesStatsBanner";
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

// ---------------------------------------------------------------------------
// Form state type
// ---------------------------------------------------------------------------

interface DishForm {
  name: string;
  price: string;
  cost: string;
  category: string;
  status: string;
}

const EMPTY_FORM: DishForm = { name: "", price: "", cost: "", category: "Signature", status: "active" };

function formToPayload(f: DishForm) {
  return {
    name: f.name.trim(),
    price: parseFloat(f.price) || 0,
    cost: parseFloat(f.cost) || 0,
    category: f.category.trim() || "Signature",
    status: f.status,
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
      toast.success("Dish added!", { description: addForm.name });
      load(true); // fire-and-forget
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
      status: item.status,
    });
  };

  const handleEdit = async () => {
    if (!editingItem || !editForm.name.trim()) return;
    setIsSubmitting(true);
    try {
      await salesService.updateMenuItem(editingItem.id, formToPayload(editForm));
      // Optimistic inline update — dish reflects new values immediately
      const { name, price: priceStr, cost: costStr } = editForm;
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((it) =>
            it.id === editingItem.id
              ? { ...it, name, price: parseFloat(priceStr) || it.price, cost: parseFloat(costStr) || it.cost }
              : it
          ),
        }))
      );
      setEditingItem(null);
      toast.success("Dish updated!", { description: editForm.name });
      load(true); // fire-and-forget
    } catch {
      load(true); // restore correct state on error
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
      // Optimistic removal — dish disappears instantly
      setCategories((prev) =>
        prev
          .map((cat) => ({ ...cat, items: cat.items.filter((it) => it.id !== item.id) }))
          .filter((cat) => cat.items.length > 0)
      );
      setConfirmArchiveId(null);
      toast.success("Dish archived.", { description: `"${item.name}" has been removed from the menu.` });
      load(true); // fire-and-forget
    } catch {
      load(true); // restore correct state on error
      toast.error("Could not archive dish. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (isLoading) return <MenuManagementSkeleton />;

  const s = menuStats ?? { total_dishes: 0, top_selling_dish: null, avg_selling_price: 0, avg_gross_margin: 0 };

  return (
    <div>
      {/* ── Menu stats banner (dark gradient, 4 white cards) ── */}
      <div className="bg-gradient-to-r from-[#091558] via-[#3851dd] to-[#091558] px-5 md:px-7 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <MenuStatCard
            label="Total Dishes"
            value={String(s.total_dishes)}
            caption={s.total_dishes > 0 ? `Across ${categories.length} ${categories.length === 1 ? "category" : "categories"}` : "No dishes yet"}
            icon={BookOpen} iconBg="bg-indigo-100" iconColor="text-[#3B59DA]"
          />
          <MenuStatCard
            label="Top Selling Dish"
            value={s.top_selling_dish ?? "—"}
            caption={s.top_selling_dish ? "most ordered dish" : "No sales data yet"}
            icon={Award} iconBg="bg-amber-100" iconColor="text-amber-500"
          />
          <MenuStatCard
            label="Avg Selling Price"
            value={s.avg_selling_price > 0 ? `RWF ${fmt(s.avg_selling_price)}` : "—"}
            caption="RWF per plate"
            icon={Tag} iconBg="bg-blue-100" iconColor="text-blue-600"
          />
          <MenuStatCard
            label="Avg Gross Margin"
            value={s.avg_gross_margin > 0 ? `${s.avg_gross_margin.toFixed(1)}%` : "—"}
            caption={categories.length > 0 ? `Across ${categories.length} ${categories.length === 1 ? "category" : "categories"}` : undefined}
            positive={s.avg_gross_margin >= 50 ? true : s.avg_gross_margin >= 20 ? undefined : s.avg_gross_margin > 0 ? false : undefined}
            icon={Percent} iconBg="bg-emerald-100" iconColor="text-emerald-600"
          />
        </div>
      </div>

      <div className="p-5 md:p-7 space-y-5">
        {error && <UnifiedErrorBanner message={error} />}

        {/* Section header: "All Dishes" + dropdown + Add button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-[20px] font-black text-[#1E293B] font-figtree">All Dishes</h2>

          <div className="flex items-center gap-3 shrink-0">
            {/* Category dropdown */}
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="appearance-none h-10 pl-4 pr-9 text-[13px] font-semibold border border-slate-200 rounded-[8px] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-indigo-400/20 font-figtree cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category} value={c.category}>{c.category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
            {/* Add button */}
            <Button
              className="h-10 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold text-[13px] font-figtree gap-2 px-5 shadow-[0_2px_10px_rgba(59,89,218,0.25)] active:scale-95 transition-all"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4" />
              Add New Dish
            </Button>
          </div>
        </div>

        {/* Dish grid */}
        {visibleItems.length === 0 ? (
          <EmptyMenuState onAdd={openAdd} hasMenu={allItems.length > 0} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          isEdit
        />
      </UnifiedModal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Menu stat card (banner)
// ---------------------------------------------------------------------------

function MenuStatCard({
  label, value, caption, positive, icon: Icon, iconBg, iconColor,
}: {
  label: string; value: string; caption?: string; positive?: boolean;
  icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string;
}) {
  const isText = isNaN(parseFloat(value.replace(/[^0-9.]/g, ""))) || value === "—";
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
        "font-black font-figtree leading-tight",
        isText ? "text-[16px] md:text-[18px] line-clamp-2" : "text-[22px] md:text-[26px]",
        positive === true ? "text-emerald-600" : positive === false ? "text-rose-500" : "text-[#1E293B]"
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
  const margin = item.price > 0 ? ((item.price - item.cost) / item.price) * 100 : null;
  const profit = item.price > 0 && item.cost > 0 ? item.price - item.cost : null;

  const marginColor =
    margin === null ? "text-slate-400" :
    margin >= 50    ? "text-emerald-600" :
    margin >= 20    ? "text-amber-600"   : "text-rose-500";

  return (
    <div className={cn(
      "rounded-[12px] border bg-white flex flex-col overflow-hidden transition-all",
      isConfirmingArchive
        ? "border-rose-200 shadow-[0_2px_12px_rgba(244,63,94,0.08)]"
        : "border-slate-200 hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    )}>
      {/* Card body */}
      <div className="p-5 flex flex-col gap-1 flex-1">
        {/* Name */}
        <div className="text-[15px] font-black text-[#1E293B] font-figtree leading-tight">
          {item.name}
        </div>
        {/* Category */}
        <div className="text-[12px] italic text-slate-400 font-figtree mb-2">
          {item.category}
        </div>

        {/* Price */}
        <div className="text-[18px] font-black text-[#1E293B] font-figtree tabular-nums">
          RWF {fmt(item.price)} / plate
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 my-3" />

        {/* Stats 2×2 grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] font-figtree">Est. Cost</div>
            <div className="text-[13px] font-bold text-[#1E293B] font-figtree tabular-nums mt-0.5">
              {item.cost > 0 ? `RWF ${fmt(item.cost)}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] font-figtree">Margin</div>
            <div className={cn("text-[13px] font-bold tabular-nums mt-0.5 font-figtree", marginColor)}>
              {margin !== null ? `${margin.toFixed(0)}%` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] font-figtree">Profit/Plate</div>
            <div className="text-[13px] font-bold text-[#1E293B] font-figtree tabular-nums mt-0.5">
              {profit !== null ? `RWF ${fmt(profit)}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] font-figtree">Source</div>
            <div className="text-[13px] font-bold text-[#1E293B] font-figtree mt-0.5 capitalize">
              {item.source ?? "Manual"}
            </div>
          </div>
        </div>
      </div>

      {/* Action strip */}
      {isConfirmingArchive ? (
        <div className="bg-rose-50 border-t border-rose-100 px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-rose-600 font-figtree flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" /> Archive this dish?
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold font-figtree transition-all active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 h-9 rounded-[8px] border border-slate-200 text-[12px] font-bold text-[#1E293B] font-figtree hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Dish
          </button>
          <button
            onClick={onRequestArchive}
            className="flex-1 h-9 rounded-[8px] border border-rose-200 text-[12px] font-bold text-rose-500 font-figtree hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
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
  isEdit,
}: {
  form: DishForm;
  onChange: (f: DishForm) => void;
  existingCategories: string[];
  isEdit?: boolean;
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
            onFocus={(e) => e.target.select()}
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
            onFocus={(e) => e.target.select()}
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

      {/* Status — edit mode only */}
      {isEdit && (
        <FormField label="Status">
          <select
            value={form.status}
            onChange={(e) => onChange({ ...form, status: e.target.value })}
            className="w-full h-12 px-3 text-[15px] font-semibold border border-slate-200 rounded-[8px] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-indigo-400/20 font-figtree"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </FormField>
      )}
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
      <div className="bg-gradient-to-r from-[#091558] via-[#3851dd] to-[#091558] px-5 md:px-7 py-6 md:py-8 grid grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
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
      <div className="p-6 md:p-7">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-7 w-32 rounded-[8px]" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36 rounded-[8px]" />
            <Skeleton className="h-10 w-36 rounded-[8px]" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
