"use client";

import {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import {
  ArrowLeft, Plus, Pencil, Search, Check,
  ChevronDown, ChevronRight, ImagePlus, UtensilsCrossed, RefreshCw, Trash2, AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { UnifiedModal, UnifiedErrorBanner } from "@/components/ui/dosteon-ui";
import {
  salesService, MenuItem, MenuCategory, MenuStats, RecipeIngredient, OrgMenuCategory,
} from "@/lib/services/salesService";
import { inventoryApi, InventoryProduct } from "@/lib/services/inventoryService";
import { toast } from "sonner";
import { useMenuEditor } from "@/context/MenuEditorContext";
import { useUser } from "@/context/UserContext";
import { QK } from "@/lib/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
// Types / constants
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


function flatItems(cats: MenuCategory[]): MenuItem[] {
  return cats.flatMap((c) => c.items);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabMenuManagement() {
  const { setEditorOpen } = useMenuEditor();
  const { user } = useUser();
  const orgId = user?.organization_id ?? null;
  const queryClient = useQueryClient();

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
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [pickerRetry, setPickerRetry] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Inline category creation (editor)
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  // Grid state
  const [gridSearch, setGridSearch] = useState("");
  const [gridCategory, setGridCategory] = useState("all");
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  // Org-level menu categories
  const { data: orgCategories = [], refetch: refetchOrgCategories } = useQuery({
    queryKey: QK.menuCategories(orgId),
    queryFn: () => salesService.getCategories(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    enabled: !!orgId,
  });

  // Sidebar search
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
    setRecipeError(null);
    try {
      const ing = await salesService.getRecipe(itemId);
      setRecipe(ing);
    } catch {
      setRecipe([]);
      setRecipeError("Could not load this dish's recipe. Check your connection and try again.");
    } finally {
      setRecipeLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  function openEditor(item: MenuItem | null) {
    // null → default empty state (no selection)
    setSelectedItemId(item ? item.id : null);
    setIsNewDish(false);
    if (item) {
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
      setForm({ ...EMPTY_FORM, category: orgCategories[0]?.name ?? "Signature" });
      setImagePreview(null);
      setImageFile(null);
      setRecipe([]);
    }
    setSidebarSearch("");
    setView("editor");
    setEditorOpen(true);
  }

  function openNewDish() {
    setSelectedItemId(null);
    setIsNewDish(true);
    setForm({ ...EMPTY_FORM, category: orgCategories[0]?.name ?? "Signature" });
    setImagePreview(null);
    setImageFile(null);
    setRecipe([]);
    setSidebarSearch("");
    setView("editor");
    setEditorOpen(true);
  }

  function backToGrid() {
    setView("grid");
    setSelectedItemId(null);
    setIsNewDish(false);
    setEditorOpen(false);
  }

  function selectSidebarItem(item: MenuItem) {
    if (isSaving || item.id === selectedItemId) return;
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
  // Image
  // -------------------------------------------------------------------------

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Dish name is required"); return; }
    const price = parseFloat(form.price) || 0;
    if (price < 0) { toast.error("Price must be non-negative"); return; }

    setIsSaving(true);
    try {
      let finalImageUrl: string | undefined = form.image_url || undefined;
      if (imageFile && !isNewDish && selectedItemId) {
        finalImageUrl = await salesService.uploadMenuItemImage(selectedItemId, imageFile);
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

      toast.success(isNewDish ? "Dish created!" : "Changes saved!");
      await loadMenu();
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
    setPickerError(null);
    inventoryApi.getProducts({ search: pickerSearch }).then((products) => {
      if (!cancelled) {
        setPickerProducts(products.filter((p) => !existingProductIds.has(p.id)));
        setPickerLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setPickerLoading(false);
        setPickerError("Could not load inventory items. Please try again.");
      }
    });
    return () => { cancelled = true; };
  }, [pickerOpen, pickerSearch, existingProductIds, pickerRetry]);

  function togglePickerProduct(product: InventoryProduct) {
    setPickerSelected((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }

  function confirmPickerSelection() {
    setRecipe((prev) => [
      ...prev,
      ...pickerSelected.map((p) => ({
        id: "",
        contextual_product_id: p.id,
        product_name: p.name,
        quantity_per_unit: 1,
        unit: p.unit,
        unit_cost: p.latest_unit_cost ?? 0,
      })),
    ]);
    setPickerSelected([]);
    setPickerSearch("");
    setPickerOpen(false);
  }

  // -------------------------------------------------------------------------
  // Recipe row edits
  // -------------------------------------------------------------------------

  function updateRecipeRow(idx: number, field: keyof RecipeIngredient, value: string | number) {
    setRecipe((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  function removeRecipeRow(idx: number) {
    setRecipe((prev) => prev.filter((_, i) => i !== idx));
  }

  // -------------------------------------------------------------------------
  // Derived values
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
  // Loading state
  // -------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  // =========================================================================
  // GRID VIEW
  // =========================================================================

  if (view === "grid") {
    return (
      <div className="space-y-4 mt-8">
        {error && <UnifiedErrorBanner message={error} />}

        {/* Single white card — header + filter + grid all inside with consistent padding */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

          {/* Header row */}
          <div className="flex items-start justify-between px-6 pt-6 pb-5">
            <div>
              <h2 className="text-[17px] font-bold text-[#1E293B] font-figtree">Menu Management</h2>
              <p className="text-[13px] text-slate-400 font-figtree mt-0.5">
                Manage all your restaurant dishes, edit, and add as you see fit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-[13px] font-figtree h-9 border-slate-200 gap-1.5"
                onClick={() => openEditor(null)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Recipes
              </Button>
              <Button
                size="sm"
                className="text-[13px] font-figtree h-9 bg-blue-600 hover:bg-blue-700 gap-1"
                onClick={openNewDish}
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Dish
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Filter row: category chips left, search right */}
          <div className="flex items-center gap-3 px-6 py-4 flex-wrap">
            <button
              onClick={() => setGridCategory("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-semibold font-figtree border transition-colors",
                gridCategory === "all"
                  ? "bg-[#1E293B] text-white border-[#1E293B]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              All
            </button>
            {orgCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setGridCategory(cat.name)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-semibold font-figtree border transition-colors",
                  gridCategory === cat.name
                    ? "bg-[#1E293B] text-white border-[#1E293B]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="px-6 pb-6">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-figtree">
                {totalDishes === 0 ? "No dishes yet — add your first one!" : "No dishes match your filters."}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCategories.map((cat) => (
                  <div key={cat.category}>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          </div>
        </div>

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

  // =========================================================================
  // EDITOR VIEW
  // =========================================================================

  const hasSelection = selectedItemId !== null || isNewDish;

  return (
    <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-100 p-6">
      <div className="flex gap-4">
        {/* ---------------------------------------------------------------- */}
        {/* LEFT SIDEBAR                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
          {/* Back nav */}
          <button
            onClick={backToGrid}
            className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800 font-figtree transition-colors w-fit"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Menu Management
          </button>
          <div className="border-b border-slate-100 -mx-4" />
          {/* Stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-bold text-slate-700 font-figtree">Menu Items</span>
              <span className="text-[12px] font-semibold text-slate-500 font-figtree">
                {availableDishes}/{totalDishes}
              </span>
            </div>
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
              placeholder="Search dishes..."
              className="w-full pl-8 pr-3 h-9 text-[13px] font-figtree border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white"
            />
          </div>

          {/* New dish button */}
          <button
            onClick={openNewDish}
            className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg border-2 border-dashed border-slate-200 text-[12px] text-slate-400 hover:border-slate-400 hover:text-slate-600 font-figtree transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Dish
          </button>

          {/* Dish list */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-440px)] pr-1">
            {isNewDish && (
              <div className="px-2 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="text-[12px] font-semibold text-indigo-700 font-figtree">New Dish</span>
              </div>
            )}
            {sidebarItems.map((cat) => (
              <div key={cat.category}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-figtree px-1 mb-1.5">
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
                          ? "bg-[#3B55E6] text-white"
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        item.status === "active" ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      <span className="text-[12px] font-figtree flex-1 truncate">{item.name}</span>
                      <span className={cn(
                        "text-[11px] font-figtree shrink-0",
                        selectedItemId === item.id ? "text-blue-200" : "text-slate-400"
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
          </div> {/* bg-white sidebar card */}
        </div>   {/* w-56 shrink-0 */}

        {/* ---------------------------------------------------------------- */}
        {/* CENTER PANEL                                                      */}
        {/* ---------------------------------------------------------------- */}
        {!hasSelection ? (
          /* Default empty state */
          <div className="flex-1 min-w-0 bg-slate-100 rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center px-8">
              <div className="bg-white rounded-full p-5 shadow-sm">
                <UtensilsCrossed className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-[17px] font-bold text-[#1E293B] font-figtree mt-1">
                Select a dish to edit
              </p>
              <p className="text-[13px] text-slate-500 font-figtree max-w-xs leading-relaxed">
                Pick any dish from the left to update its details and build its recipe.
              </p>
            </div>
          </div>
        ) : (
          /* Dish form */
          <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">

            {/* Dish Details Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-bold text-[#1E293B] font-figtree">Dish Details</h3>
                  <p className="text-[12px] text-slate-400 font-figtree mt-0.5">
                    Update how this dish appears on the menu and how the team identifies it during service.
                  </p>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold font-figtree border shrink-0 ml-4",
                  form.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {form.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Image + upload */}
              <div className="flex gap-5 mb-5">
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="w-40 h-40 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors overflow-hidden shrink-0 bg-slate-50"
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt="" width={160} height={160} className="object-cover w-full h-full" priority />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-[11px] font-figtree">Upload photo</span>
                    </div>
                  )}
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                <div className="flex flex-col justify-center gap-2">
                  <p className="text-[14px] font-bold text-[#1E293B] font-figtree">Dish image</p>
                  <p className="text-[12px] text-slate-500 font-figtree leading-relaxed">
                    Use a clear square photo for menus, reports, and<br />kitchen references. Recommended: 1200 × 1200.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit text-[12px] font-figtree mt-1 h-8"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    Replace image
                  </Button>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 font-figtree mb-1">
                    Dish Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Grilled Chicken"
                    className="h-9 text-[13px] font-figtree"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 font-figtree mb-1">
                    Selling Price
                  </label>
                  <div className="flex items-center border border-input rounded-md overflow-hidden h-9 bg-background">
                    <span className="px-2.5 text-[12px] text-slate-500 font-figtree bg-slate-50 border-r border-input h-full flex items-center shrink-0">
                      RWF
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="0"
                      className="flex-1 px-2.5 text-[13px] font-figtree focus:outline-none bg-transparent h-full"
                      onFocus={(e) => { if (e.target.value === "0") e.target.select(); }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 font-figtree mb-1">
                    Menu Category
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="h-9 w-full pl-3 pr-7 text-[13px] font-figtree border border-input rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                    >
                      {orgCategories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                      {orgCategories.length === 0 && (
                        <option value={form.category}>{form.category}</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Add Custom Category */}
              {showNewCat ? (
                <div className="flex items-center gap-2 mb-4">
                  <input
                    autoFocus
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const name = newCatInput.trim();
                        if (!name) return;
                        setSavingCat(true);
                        try {
                          const created = await salesService.createCategory(name);
                          queryClient.invalidateQueries({ queryKey: QK.menuCategories(orgId) });
                          setForm((f) => ({ ...f, category: created.name }));
                          setShowNewCat(false);
                          setNewCatInput("");
                        } catch {
                          toast.error("Failed to create category");
                        } finally {
                          setSavingCat(false);
                        }
                      }
                      if (e.key === "Escape") {
                        setShowNewCat(false);
                        setNewCatInput("");
                      }
                    }}
                    placeholder="Category name…"
                    className="flex-1 h-8 px-3 text-[13px] font-figtree border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300"
                  />
                  <button
                    disabled={savingCat || !newCatInput.trim()}
                    onClick={async () => {
                      const name = newCatInput.trim();
                      if (!name) return;
                      setSavingCat(true);
                      try {
                        const created = await salesService.createCategory(name);
                        queryClient.invalidateQueries({ queryKey: QK.menuCategories(orgId) });
                        setForm((f) => ({ ...f, category: created.name }));
                        setShowNewCat(false);
                        setNewCatInput("");
                      } catch {
                        toast.error("Failed to create category");
                      } finally {
                        setSavingCat(false);
                      }
                    }}
                    className="h-8 px-3 text-[12px] font-semibold font-figtree bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {savingCat ? "…" : "Add"}
                  </button>
                  <button
                    onClick={() => { setShowNewCat(false); setNewCatInput(""); }}
                    className="h-8 px-2 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewCat(true)}
                  className="flex items-center gap-1 text-[12px] text-blue-600 font-figtree font-semibold hover:text-blue-800 transition-colors mb-4"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Custom Category
                </button>
              )}

              {/* Dish Availability */}
              <div className="flex items-center justify-between py-4 border-t border-slate-100">
                <div>
                  <p className="text-[13px] font-bold text-[#1E293B] font-figtree">Dish Availability</p>
                  <p className="text-[12px] text-slate-400 font-figtree mt-0.5">
                    Choose whether or not this dish is available on the menu
                  </p>
                </div>
                <Switch
                  checked={form.status === "active"}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, status: checked ? "active" : "inactive" }))
                  }
                />
              </div>
            </div>

            {/* Bill of Materials Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[15px] font-bold text-[#1E293B] font-figtree">Bill of Materials</h3>
                    {recipe.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-figtree">
                        {recipe.length} ingredients
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-400 font-figtree">
                    Link ingredients from your inventory. Cost per plate updates automatically when you log expenses.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[12px] font-figtree h-8 border-blue-200 text-blue-600 hover:bg-blue-50 shrink-0 ml-4 gap-1"
                  onClick={() => { setPickerSelected([]); setPickerSearch(""); setPickerOpen(true); }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add ingredient
                </Button>
              </div>

              {recipeLoading ? (
                <div className="space-y-2 mt-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
                </div>
              ) : recipeError ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center mt-2">
                  <div className="bg-red-50 rounded-full p-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-600 font-figtree">Failed to load recipe</p>
                    <p className="text-[12px] text-slate-400 font-figtree mt-1 max-w-xs leading-relaxed">
                      {recipeError}
                    </p>
                  </div>
                  <button
                    onClick={() => selectedItemId && loadRecipe(selectedItemId)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3B59DA] font-figtree hover:underline"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                </div>
              ) : recipe.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="bg-slate-100 rounded-full p-3">
                    <UtensilsCrossed className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-[14px] font-bold text-slate-600 font-figtree">No ingredients yet</p>
                  <p className="text-[12px] text-slate-400 font-figtree max-w-xs leading-relaxed">
                    Add ingredients to automatically track inventory depletion and calculate food cost per plate.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-[12px] font-figtree">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingredient</th>
                        <th className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-20">Quantity</th>
                        <th className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-28">Unit Measure</th>
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
                            <td className="py-3 pr-3">
                              <p className="font-semibold text-[13px] text-slate-700">{ing.product_name}</p>
                              <p className="text-[11px] text-slate-400">No price logged yet</p>
                            </td>
                            <td className="py-3 pr-3">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={ing.quantity_per_unit}
                                onChange={(e) => updateRecipeRow(idx, "quantity_per_unit", parseFloat(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded px-2 h-8 text-[12px] focus:outline-none focus:ring-1 focus:ring-slate-300"
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium h-9 w-20 justify-center">
                                {ing.unit || "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex items-center border border-slate-200 rounded overflow-hidden h-8">
                                <span className="px-2 text-[11px] text-slate-400 bg-slate-50 border-r border-slate-200 h-full flex items-center shrink-0">
                                  RWF
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={ing.unit_cost ?? 0}
                                  onChange={(e) => updateRecipeRow(idx, "unit_cost", parseFloat(e.target.value) || 0)}
                                  className="flex-1 px-2 text-[12px] focus:outline-none bg-transparent h-full min-w-0"
                                />
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-[13px] font-medium text-slate-600">
                              RWF {fmtMoney(lineCost)}
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => removeRecipeRow(idx)}
                                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td colSpan={4} className="py-3 text-[13px] font-semibold text-slate-700 font-figtree">
                          Est. Total Food Cost
                        </td>
                        <td className="py-3 text-[14px] font-bold text-blue-600 font-figtree">
                          RWF {fmtMoney(totalFoodCost)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <span className="text-[13px] text-slate-400 font-figtree">Unsaved changes</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={backToGrid} className="font-figtree">
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#1E293B] hover:bg-slate-700 font-figtree gap-1"
                >
                  {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT PANEL                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className={cn(
          "shrink-0 flex flex-col gap-1 transition-all duration-200",
          rightCollapsed ? "w-8" : "w-72"
        )}>
          {rightCollapsed ? (
            <button
              onClick={() => setRightCollapsed(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Expand panel"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)]">
              {/* Live Preview */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setRightCollapsed(true)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Collapse panel"
                  >
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                  </button>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-figtree">
                    Live Preview
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden bg-slate-100 w-full aspect-square mb-3">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt=""
                      width={288}
                      height={288}
                      className="object-cover w-full h-full"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlus className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <p className="text-[16px] font-bold text-[#1E293B] font-figtree">
                  {form.name || "--"}
                </p>
                {sellingPrice > 0 ? (
                  <p className="text-[13px] text-slate-600 font-figtree">
                    RWF {fmtMoney(sellingPrice)}
                    <span className="text-slate-400 text-[12px]"> / serving</span>
                  </p>
                ) : (
                  <p className="text-[13px] text-slate-400 font-figtree">--</p>
                )}
                {form.category && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 font-figtree">
                    {form.category}
                  </span>
                )}
                <p className="text-[11px] text-slate-400 font-figtree mt-3">
                  Live menu preview for cashiers and service staff.
                </p>
              </div>

              {/* Pricing Summary */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-figtree mb-2">
                  Pricing Summary
                </p>
                <p className="text-[13px] font-bold text-[#1E293B] font-figtree">
                  Financial effect of this recipe
                </p>
                <p className="text-[11px] text-slate-400 font-figtree mb-4">
                  Based on last logged ingredient prices.
                </p>
                <div className="space-y-2.5">
                  <PricingRow
                    label="Selling price"
                    value={sellingPrice > 0 ? `RWF ${fmtMoney(sellingPrice)}` : "--"}
                  />
                  <PricingRow
                    label="Est. Food Cost"
                    value={recipe.length > 0 ? `RWF ${fmtMoney(totalFoodCost)}` : "--"}
                  />
                  <div className="border-t border-slate-100 pt-2.5 space-y-2.5">
                    <PricingRow
                      label="Gross profit / plate"
                      value={sellingPrice > 0 ? `RWF ${fmtMoney(grossProfit)}` : "--"}
                      bold
                      valueClass={sellingPrice > 0 ? marginColor(grossMargin) : "text-slate-400"}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-500 font-figtree">Gross Profit Margin</span>
                      <span className={cn(
                        "text-[13px] font-bold font-figtree",
                        sellingPrice > 0 ? marginColor(grossMargin) : "text-slate-400"
                      )}>
                        {sellingPrice > 0 ? `${grossMargin.toFixed(0)}%` : "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>  {/* flex gap-4 — 3-panel row */}
    </div>    {/* mt-8 bg-slate-50 outer */}

      {/* ------------------------------------------------------------------ */}
      {/* INGREDIENT PICKER MODAL                                             */}
      {/* ------------------------------------------------------------------ */}
      <UnifiedModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add Ingredients"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] text-slate-400 font-figtree">Select ingredients from the left</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(false)}
                className="font-figtree"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={pickerSelected.length === 0}
                onClick={confirmPickerSelection}
                className="bg-[#1E293B] hover:bg-slate-700 font-figtree"
              >
                Add Selected Items
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4" style={{ minHeight: "400px" }}>
          {/* Full-width search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-11 pr-4 h-11 text-[14px] font-figtree border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Two-column split */}
          <div className="flex gap-4 flex-1 min-h-0" style={{ height: "340px" }}>
            {/* Left: product list */}
            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
              {pickerLoading ? (
                <div className="space-y-2 p-3">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
                </div>
              ) : pickerError ? (
                <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                  <AlertCircle className="h-6 w-6 text-red-300" />
                  <p className="text-[13px] font-semibold text-slate-600 font-figtree">Failed to load inventory</p>
                  <p className="text-[12px] text-slate-400 font-figtree">{pickerError}</p>
                  <button
                    onClick={() => { setPickerError(null); setPickerRetry((c) => c + 1); }}
                    className="text-[12px] font-semibold text-[#3B59DA] font-figtree hover:underline mt-1"
                  >
                    Retry
                  </button>
                </div>
              ) : pickerProducts.length === 0 ? (
                <p className="text-[13px] text-slate-400 font-figtree text-center py-10">
                  {pickerSearch ? "No matches found" : "No inventory items available"}
                </p>
              ) : (
                pickerProducts.map((p) => {
                  const isSelected = pickerSelected.some((s) => s.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePickerProduct(p)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors",
                        isSelected && "bg-blue-50 hover:bg-blue-50"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                        isSelected ? "bg-[#1E293B] border-[#1E293B]" : "border-slate-300 bg-white"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-[14px] font-semibold text-slate-700 font-figtree flex-1">
                        {p.name}
                      </span>
                      <span className="text-[12px] text-slate-400 font-figtree shrink-0">
                        {fmt(p.current_stock)} / {p.unit}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right: selected items */}
            <div className="w-56 shrink-0 flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-figtree">
                Selected Items
              </p>
              {pickerSelected.length === 0 ? (
                <p className="text-[14px] font-semibold text-blue-500 font-figtree">None Selected</p>
              ) : (
                <div className="space-y-2 overflow-y-auto flex-1">
                  {pickerSelected.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex items-start justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1E293B] font-figtree truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-figtree">{p.unit}</p>
                      </div>
                      <button
                        onClick={() => togglePickerProduct(p)}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </UnifiedModal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid card
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
  const fmtLocal = (n: number) =>
    new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="w-full h-44 bg-slate-100">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            width={320}
            height={320}
            className="object-cover w-full h-full"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-slate-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2 mb-1 min-w-0">
          <p className="text-[14px] font-bold text-[#1E293B] font-figtree truncate flex-1 min-w-0">{item.name}</p>
          <p className="text-[12px] text-slate-500 font-figtree shrink-0 whitespace-nowrap">
            RWF {fmtLocal(item.price)} / serving
          </p>
        </div>
        <p className="text-[12px] italic text-slate-400 font-figtree mb-4">{item.category} Food</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-[13px] font-figtree text-red-500 border-red-300 hover:bg-red-50 hover:text-red-600 hover:border-red-400"
            onClick={onArchive}
          >
            Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-[13px] font-figtree"
            onClick={onEdit}
          >
            Edit Dish
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pricing row
// ---------------------------------------------------------------------------

function PricingRow({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-slate-500 font-figtree">{label}</span>
      <span className={cn(
        "text-[13px] font-figtree",
        bold ? "font-bold" : "",
        valueClass ?? "text-slate-700"
      )}>
        {value}
      </span>
    </div>
  );
}
