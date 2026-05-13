"use client";

import {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import {
  ArrowLeft, Plus, Pencil, Archive, Search, X, Check,
  ChevronDown, ImagePlus, UtensilsCrossed, RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { UnifiedModal, UnifiedErrorBanner } from "@/components/ui/dosteon-ui";
import {
  salesService, MenuItem, MenuCategory, MenuStats, RecipeIngredient,
} from "@/lib/services/salesService";
import { inventoryApi, InventoryProduct } from "@/lib/services/inventoryService";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function marginColor(margin: number): string {
  if (margin >= 60) return "text-emerald-600";
  if (margin >= 30) return "text-amber-600";
  return "text-red-600";
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type View = "grid" | "editor";

interface DishForm {
  name: string;
  price: string;
  category: string;
  status: string;
  image_url: string;
}

const EMPTY_FORM: DishForm = {
  name: "", price: "", category: "Signature", status: "active", image_url: "",
};

const CATEGORIES = ["Signature", "Main", "Starter", "Dessert", "Beverage", "Side", "Special"];

// Flatten all items from categories
function flatItems(categories: MenuCategory[]): MenuItem[] {
  return categories.flatMap((c) => c.items);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabMenuManagement() {
  const [view, setView] = useState<View>("grid");
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuStats, setMenuStats] = useState<MenuStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isNewDish, setIsNewDish] = useState(false);
  const [form, setForm] = useState<DishForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Grid state
  const [gridSearch, setGridSearch] = useState("");
  const [gridCategory, setGridCategory] = useState("all");
  const [activeChannel, setActiveChannel] = useState("All");
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  // Editor sidebar state
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Ingredient picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerProducts, setPickerProducts] = useState<InventoryProduct[]>([]);
  const [pickerSelected, setPickerSelected] = useState<InventoryProduct[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  const loadMenu = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [menuData, statsData] = await Promise.all([
        salesService.getMenu(),
        salesService.getMenuStats().catch(() => null),
      ]);
      setCategories(menuData.categories);
      if (statsData) setMenuStats(statsData);
    } catch {
      setError("Failed to load menu. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  // -------------------------------------------------------------------------
  // Recipe loading
  // -------------------------------------------------------------------------

  const loadRecipe = useCallback(async (itemId: string) => {
    setRecipeLoading(true);
    try {
      const ing = await salesService.getRecipe(itemId);
      setRecipe(ing);
    } catch {
      setRecipe([]);
    } finally {
      setRecipeLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Navigation helpers
  // -------------------------------------------------------------------------

  function openEditor(item: MenuItem | null) {
    if (item) {
      setSelectedItemId(item.id);
      setIsNewDish(false);
      setForm({
        name: item.name,
        price: item.price.toString(),
        category: item.category,
        status: item.status,
        image_url: item.image_url ?? "",
      });
      setImagePreview(item.image_url ?? null);
      setImageFile(null);
      loadRecipe(item.id);
    } else {
      setSelectedItemId(null);
      setIsNewDish(true);
      setForm(EMPTY_FORM);
      setImagePreview(null);
      setImageFile(null);
      setRecipe([]);
    }
    setSidebarSearch("");
    setView("editor");
  }

  function backToGrid() {
    setView("grid");
    setSelectedItemId(null);
    setIsNewDish(false);
  }

  // -------------------------------------------------------------------------
  // Sidebar dish click
  // -------------------------------------------------------------------------

  function selectSidebarItem(item: MenuItem) {
    if (isSaving) return;
    if (item.id === selectedItemId) return;
    setSelectedItemId(item.id);
    setIsNewDish(false);
    setForm({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      status: item.status,
      image_url: item.image_url ?? "",
    });
    setImagePreview(item.image_url ?? null);
    setImageFile(null);
    loadRecipe(item.id);
  }

  // -------------------------------------------------------------------------
  // Image handling
  // -------------------------------------------------------------------------

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  // -------------------------------------------------------------------------
  // Save (create or update)
  // -------------------------------------------------------------------------

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Dish name is required"); return; }
    const price = parseFloat(form.price) || 0;
    if (price < 0) { toast.error("Price must be non-negative"); return; }

    setIsSaving(true);
    try {
      // Upload image if changed
      let finalImageUrl: string | undefined = form.image_url || undefined;
      if (imageFile) {
        if (isNewDish || !selectedItemId) {
          // Create first, then upload
        } else {
          finalImageUrl = await salesService.uploadMenuItemImage(selectedItemId, imageFile);
        }
      }

      const totalFoodCost = recipe.reduce(
        (sum, ing) => sum + ing.quantity_per_unit * (ing.unit_cost ?? 0), 0
      );

      const payload = {
        name: form.name.trim(),
        price,
        cost: totalFoodCost,
        category: form.category || "Signature",
        status: form.status,
        ...(finalImageUrl ? { image_url: finalImageUrl } : {}),
      };

      let savedItem: MenuItem;
      if (isNewDish) {
        savedItem = await salesService.createMenuItem(payload) as unknown as MenuItem;
        // Upload image for newly created item
        if (imageFile) {
          try {
            const imgUrl = await salesService.uploadMenuItemImage(savedItem.id, imageFile);
            await salesService.updateMenuItem(savedItem.id, { image_url: imgUrl });
            savedItem = { ...savedItem, image_url: imgUrl };
          } catch { /* non-fatal */ }
        }
        setSelectedItemId(savedItem.id);
        setIsNewDish(false);
      } else {
        savedItem = await salesService.updateMenuItem(selectedItemId!, payload) as unknown as MenuItem;
      }

      // Save recipe
      if (recipe.length > 0 || !isNewDish) {
        try {
          await salesService.setRecipe(
            savedItem.id,
            recipe.map((r) => ({
              contextual_product_id: r.contextual_product_id,
              quantity_per_unit: r.quantity_per_unit,
              unit: r.unit,
              unit_cost: r.unit_cost,
            }))
          );
        } catch { /* non-fatal */ }
      }

      toast.success(isNewDish ? "Dish created!" : "Changes saved!");
      await loadMenu();
      // Refresh form with saved data
      setForm({
        name: savedItem.name,
        price: savedItem.price.toString(),
        category: savedItem.category,
        status: savedItem.status,
        image_url: savedItem.image_url ?? "",
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  // -------------------------------------------------------------------------
  // Archive
  // -------------------------------------------------------------------------

  async function handleArchive(itemId: string) {
    try {
      await salesService.archiveMenuItem(itemId);
      toast.success("Dish archived");
      setConfirmArchiveId(null);
      await loadMenu();
      if (selectedItemId === itemId) backToGrid();
    } catch {
      toast.error("Failed to archive");
    }
  }

  // -------------------------------------------------------------------------
  // Ingredient picker
  // -------------------------------------------------------------------------

  const existingProductIds = useMemo(
    () => new Set(recipe.map((r) => r.contextual_product_id)),
    [recipe]
  );

  useEffect(() => {
    if (!pickerOpen) return;
    let cancelled = false;
    setPickerLoading(true);
    inventoryApi.getProducts({ search: pickerSearch }).then((products) => {
      if (!cancelled) {
        setPickerProducts(products.filter((p) => !existingProductIds.has(p.id)));
        setPickerLoading(false);
      }
    }).catch(() => { if (!cancelled) setPickerLoading(false); });
    return () => { cancelled = true; };
  }, [pickerOpen, pickerSearch, existingProductIds]);

  function togglePickerProduct(product: InventoryProduct) {
    setPickerSelected((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }

  function confirmPickerSelection() {
    const newIngredients: RecipeIngredient[] = pickerSelected.map((p) => ({
      id: "",
      contextual_product_id: p.id,
      product_name: p.name,
      quantity_per_unit: 1,
      unit: p.unit,
      unit_cost: 0,
    }));
    setRecipe((prev) => [...prev, ...newIngredients]);
    setPickerSelected([]);
    setPickerSearch("");
    setPickerOpen(false);
  }

  // -------------------------------------------------------------------------
  // Recipe row updates
  // -------------------------------------------------------------------------

  function updateRecipeRow(idx: number, field: keyof RecipeIngredient, value: string | number) {
    setRecipe((prev) =>
      prev.map((r, i) => i === idx ? { ...r, [field]: value } : r)
    );
  }

  function removeRecipeRow(idx: number) {
    setRecipe((prev) => prev.filter((_, i) => i !== idx));
  }

  // -------------------------------------------------------------------------
  // Derived values for editor
  // -------------------------------------------------------------------------

  const sellingPrice = parseFloat(form.price) || 0;
  const totalFoodCost = recipe.reduce(
    (sum, ing) => sum + ing.quantity_per_unit * (ing.unit_cost ?? 0), 0
  );
  const grossProfit = sellingPrice - totalFoodCost;
  const grossMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

  // -------------------------------------------------------------------------
  // Grid filters
  // -------------------------------------------------------------------------

  const CHANNELS = ["All", "Dine-in", "Takeaway", "Delivery"];

  const filteredCategories = useMemo(() => {
    if (!gridSearch && gridCategory === "all") return categories;
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter((item) => {
          const matchSearch = !gridSearch || item.name.toLowerCase().includes(gridSearch.toLowerCase());
          const matchCat = gridCategory === "all" || c.category === gridCategory;
          return matchSearch && matchCat;
        }),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, gridSearch, gridCategory]);

  const allItems = flatItems(categories);
  const totalDishes = allItems.length;
  const availableDishes = allItems.filter((i) => i.status === "active").length;

  // Sidebar filtered items
  const sidebarItems = useMemo(() => {
    const q = sidebarSearch.toLowerCase();
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => !q || i.name.toLowerCase().includes(q)),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, sidebarSearch]);

  // -------------------------------------------------------------------------
  // Render: loading
  // -------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: grid view
  // -------------------------------------------------------------------------

  if (view === "grid") {
    return (
      <div className="space-y-5">
        {error && <UnifiedErrorBanner message={error} />}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-[#1E293B] font-figtree">Menu</h2>
            {menuStats && (
              <p className="text-[12px] text-slate-500 font-figtree mt-0.5">
                {menuStats.total_dishes} dishes · Avg {fmt(menuStats.avg_selling_price)} Ksh · {menuStats.avg_gross_margin}% margin
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-[13px] font-figtree h-8 border-slate-200"
              onClick={() => {
                const first = allItems[0];
                openEditor(first ?? null);
              }}
              disabled={allItems.length === 0}
            >
              <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
              Edit Recipes
            </Button>
            <Button
              size="sm"
              className="text-[13px] font-figtree h-8 bg-[#1E293B] hover:bg-slate-700"
              onClick={() => openEditor(null)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add New Dish
            </Button>
          </div>
        </div>

        {/* Channel pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={cn(
                "px-3 py-1 rounded-full text-[12px] font-semibold font-figtree border transition-colors",
                activeChannel === ch
                  ? "bg-[#1E293B] text-white border-[#1E293B]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              {ch}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={gridSearch}
                onChange={(e) => setGridSearch(e.target.value)}
                placeholder="Search dishes…"
                className="pl-8 pr-3 h-8 text-[13px] font-figtree border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>
            {/* Category filter */}
            <div className="relative">
              <select
                value={gridCategory}
                onChange={(e) => setGridCategory(e.target.value)}
                className="h-8 pl-2 pr-7 text-[12px] font-figtree border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.category} value={c.category}>{c.category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dish grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-figtree">
            {totalDishes === 0
              ? "No dishes yet — add your first one!"
              : "No dishes match your filters."}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <div key={cat.category}>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-figtree mb-3">
                  {cat.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {cat.items.map((item) => (
                    <GridCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEditor(item)}
                      onArchive={() => setConfirmArchiveId(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Archive confirm */}
        <UnifiedModal
          isOpen={!!confirmArchiveId}
          onClose={() => setConfirmArchiveId(null)}
          title="Archive Dish?"
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmArchiveId(null)}>Cancel</Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => confirmArchiveId && handleArchive(confirmArchiveId)}
              >
                Archive
              </Button>
            </div>
          }
        >
          <p className="text-[13px] text-slate-600 font-figtree">
            This dish will be hidden from the menu. You can restore it later.
          </p>
        </UnifiedModal>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: editor view
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Back nav */}
      <button
        onClick={backToGrid}
        className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800 font-figtree transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Menu
      </button>

      <div className="flex gap-4 min-h-0 flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* LEFT SIDEBAR                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="w-56 shrink-0 flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-slate-700 font-figtree uppercase tracking-wide">
                Menu Items
              </span>
              <span className="text-[11px] text-slate-400 font-figtree">
                {availableDishes}/{totalDishes}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: totalDishes > 0 ? `${(availableDishes / totalDishes) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-8 pr-3 h-8 text-[12px] font-figtree border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white"
            />
          </div>

          {/* New dish button */}
          <button
            onClick={() => openEditor(null)}
            className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg border-2 border-dashed border-slate-200 text-[12px] text-slate-400 hover:border-slate-400 hover:text-slate-600 font-figtree transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Dish
          </button>

          {/* Dish list */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-320px)] pr-1">
            {isNewDish && (
              <div className="px-2 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="text-[12px] font-semibold text-indigo-700 font-figtree">New Dish</span>
              </div>
            )}
            {sidebarItems.map((cat) => (
              <div key={cat.category}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-figtree px-1 mb-1">
                  {cat.category}
                </p>
                <div className="space-y-0.5">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectSidebarItem(item)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors",
                        selectedItemId === item.id
                          ? "bg-[#1E293B] text-white"
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        item.status === "active" ? "bg-emerald-400" : "bg-slate-300"
                      )} />
                      <span className="text-[12px] font-figtree flex-1 truncate">{item.name}</span>
                      <span className={cn(
                        "text-[11px] font-figtree shrink-0",
                        selectedItemId === item.id ? "text-slate-300" : "text-slate-400"
                      )}>
                        {fmt(item.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {sidebarItems.length === 0 && !isNewDish && (
              <p className="text-[11px] text-slate-400 font-figtree text-center py-4">No dishes found</p>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* CENTER PANEL                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
          {/* Dish Details Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-[14px] font-bold text-[#1E293B] font-figtree mb-4">Dish Details</h3>
            <div className="flex gap-4">
              {/* Image upload */}
              <div
                onClick={() => imageInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors overflow-hidden shrink-0 bg-slate-50"
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="" width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px] font-figtree">Photo</span>
                  </div>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 font-figtree mb-1 uppercase tracking-wide">Dish Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Grilled Chicken"
                    className="h-8 text-[13px] font-figtree"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-500 font-figtree mb-1 uppercase tracking-wide">Selling Price (Ksh)</label>
                    <Input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="0"
                      className="h-8 text-[13px] font-figtree"
                      onFocus={(e) => { if (e.target.value === "0") e.target.select(); }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-500 font-figtree mb-1 uppercase tracking-wide">Category</label>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="h-8 w-full pl-2 pr-7 text-[13px] font-figtree border border-input rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                      >
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.status === "active"}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, status: checked ? "active" : "inactive" }))}
                    id="available-toggle"
                  />
                  <label htmlFor="available-toggle" className="text-[13px] text-slate-600 font-figtree cursor-pointer">
                    {form.status === "active" ? "Available on menu" : "Hidden from menu"}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bill of Materials */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="h-4 w-4 text-slate-400" />
              <h3 className="text-[14px] font-bold text-[#1E293B] font-figtree">Bill of Materials</h3>
              <span className="text-[11px] text-slate-400 font-figtree">— ingredient cost breakdown</span>
            </div>

            {recipeLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] font-figtree">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingredient</th>
                      <th className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-20">Qty</th>
                      <th className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-24">Unit</th>
                      <th className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-28">Unit Cost</th>
                      <th className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-24">Line Cost</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.map((ing, idx) => {
                      const lineCost = ing.quantity_per_unit * (ing.unit_cost ?? 0);
                      return (
                        <tr key={idx} className="border-b border-slate-50">
                          <td className="py-2 pr-3 font-medium text-slate-700">{ing.product_name}</td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={ing.quantity_per_unit}
                              onChange={(e) => updateRecipeRow(idx, "quantity_per_unit", parseFloat(e.target.value) || 0)}
                              className="w-full border border-slate-200 rounded px-2 h-7 text-[12px] focus:outline-none focus:ring-1 focus:ring-slate-300"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="text"
                              value={ing.unit ?? ""}
                              onChange={(e) => updateRecipeRow(idx, "unit", e.target.value)}
                              placeholder="kg"
                              className="w-full border border-slate-200 rounded px-2 h-7 text-[12px] focus:outline-none focus:ring-1 focus:ring-slate-300"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 text-[11px] shrink-0">Ksh</span>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={ing.unit_cost ?? 0}
                                onChange={(e) => updateRecipeRow(idx, "unit_cost", parseFloat(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded px-2 h-7 text-[12px] focus:outline-none focus:ring-1 focus:ring-slate-300"
                              />
                            </div>
                          </td>
                          <td className="py-2 pr-3 text-slate-600 font-medium">
                            Ksh {fmtMoney(lineCost)}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => removeRecipeRow(idx)}
                              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Add ingredient row */}
                    <tr>
                      <td colSpan={6} className="py-2">
                        <button
                          onClick={() => { setPickerSelected([]); setPickerSearch(""); setPickerOpen(true); }}
                          className="flex items-center gap-1.5 text-[12px] text-indigo-600 hover:text-indigo-800 font-figtree font-semibold transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Ingredient
                        </button>
                      </td>
                    </tr>
                    {/* Total row */}
                    {recipe.length > 0 && (
                      <tr className="border-t-2 border-slate-200">
                        <td colSpan={4} className="py-2.5 text-[12px] font-bold text-slate-700 font-figtree">
                          Est. Total Food Cost
                        </td>
                        <td className="py-2.5 text-[13px] font-bold text-[#1E293B] font-figtree">
                          Ksh {fmtMoney(totalFoodCost)}
                        </td>
                        <td />
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pb-4">
            <Button variant="ghost" size="sm" onClick={backToGrid} className="font-figtree">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#1E293B] hover:bg-slate-700 font-figtree"
            >
              {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT PANEL                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="w-64 shrink-0 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* Live Preview */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-figtree mb-3">
              Live Preview
            </p>
            <div className="flex gap-3 items-start">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt=""
                  width={56}
                  height={56}
                  className="rounded-lg object-cover w-14 h-14 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center">
                  <UtensilsCrossed className="h-5 w-5 text-slate-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#1E293B] font-figtree truncate">
                  {form.name || "Dish Name"}
                </p>
                <p className="text-[13px] text-slate-600 font-figtree">
                  Ksh {fmtMoney(sellingPrice)} / serving
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 font-figtree">
                  {form.category || "Signature"}
                </span>
              </div>
            </div>
            <div className="mt-2 flex">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold font-figtree",
                form.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              )}>
                {form.status === "active" ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-figtree mb-3">
              Pricing Summary
            </p>
            <div className="space-y-2">
              <PricingRow label="Selling Price" value={`Ksh ${fmtMoney(sellingPrice)}`} />
              <PricingRow label="Est. Food Cost" value={`Ksh ${fmtMoney(totalFoodCost)}`} />
              <div className="border-t border-slate-100 my-1" />
              <PricingRow label="Gross Profit / Plate" value={`Ksh ${fmtMoney(grossProfit)}`} bold />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-500 font-figtree">Gross Profit Margin</span>
                <span className={cn("text-[13px] font-bold font-figtree", marginColor(grossMargin))}>
                  {grossMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* INGREDIENT PICKER MODAL                                          */}
      {/* --------------------------------------------------------------- */}
      <UnifiedModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add Ingredients"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPickerOpen(false)} className="font-figtree">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={pickerSelected.length === 0}
              onClick={confirmPickerSelection}
              className="bg-[#1E293B] hover:bg-slate-700 font-figtree"
            >
              Add Selected Items ({pickerSelected.length})
            </Button>
          </div>
        }
      >
        <div className="flex gap-4 h-80">
          {/* Left: product list */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search inventory…"
                className="w-full pl-8 pr-3 h-8 text-[13px] font-figtree border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>
            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg">
              {pickerLoading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
                </div>
              ) : pickerProducts.length === 0 ? (
                <p className="text-[12px] text-slate-400 font-figtree text-center py-8">
                  {pickerSearch ? "No matches" : "No inventory items available"}
                </p>
              ) : (
                pickerProducts.map((p) => {
                  const isSelected = pickerSelected.some((s) => s.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePickerProduct(p)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors",
                        isSelected && "bg-indigo-50"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-colors",
                        isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-[13px] font-figtree text-slate-700 flex-1">{p.name}</span>
                      <span className="text-[11px] text-slate-400 font-figtree shrink-0">{p.unit}</span>
                      <span className={cn(
                        "text-[10px] font-semibold font-figtree shrink-0",
                        p.status_class === "healthy" ? "text-emerald-600" :
                        p.status_class === "low" ? "text-amber-600" : "text-red-600"
                      )}>
                        {fmt(p.current_stock)} {p.unit}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: selected list */}
          <div className="w-48 shrink-0 flex flex-col gap-2">
            <p className="text-[12px] font-bold text-slate-600 font-figtree">
              Selected ({pickerSelected.length})
            </p>
            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg">
              {pickerSelected.length === 0 ? (
                <p className="text-[12px] text-slate-400 font-figtree text-center py-8 px-2">
                  No items selected
                </p>
              ) : (
                pickerSelected.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 border-b border-slate-50 last:border-b-0">
                    <span className="text-[12px] font-figtree text-slate-700 flex-1">{p.name}</span>
                    <button
                      onClick={() => togglePickerProduct(p)}
                      className="p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </UnifiedModal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid card sub-component
// ---------------------------------------------------------------------------

function GridCard({
  item,
  onEdit,
  onArchive,
}: {
  item: MenuItem;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const margin = item.price > 0 ? ((item.price - (item.cost ?? 0)) / item.price) * 100 : null;
  const fmtLocal = (n: number) =>
    new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            width={56}
            height={56}
            className="rounded-lg object-cover w-14 h-14 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-slate-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#1E293B] font-figtree truncate">{item.name}</p>
          <p className="text-[13px] text-slate-600 font-figtree">Ksh {fmtLocal(item.price)}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 font-figtree">
              {item.category}
            </span>
            {margin !== null && (
              <span className={cn("text-[10px] font-semibold font-figtree", marginColor(margin))}>
                {margin.toFixed(0)}% margin
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-7 text-[11px] font-figtree text-slate-500 border border-slate-100"
          onClick={onArchive}
        >
          <Archive className="h-3 w-3 mr-1" />
          Archive
        </Button>
        <Button
          size="sm"
          className="flex-1 h-7 text-[11px] font-figtree bg-[#1E293B] hover:bg-slate-700"
          onClick={onEdit}
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit Dish
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pricing row sub-component
// ---------------------------------------------------------------------------

function PricingRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-slate-500 font-figtree">{label}</span>
      <span className={cn("text-[12px] font-figtree", bold ? "font-bold text-[#1E293B]" : "text-slate-700")}>
        {value}
      </span>
    </div>
  );
}
