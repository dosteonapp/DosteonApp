"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Zap, Box } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrand } from "@/context/BrandContext";
import { useUser } from "@/context/UserContext";
import { QK } from "@/lib/queryKeys";
import { expenseService, ExpenseType } from "@/lib/services/expenseService";
import { cn } from "@/lib/utils";

const UNITS = ["kg", "L", "ml", "Bundle", "Crate", "meter roll", "Carton (sr)"];
const SUPPLIERS = ["Supplier", "Market", "Wholesale", "Other"];
const INGREDIENT_CATEGORIES = ["White Rice", "Sunflower Oil", "Tomatoes", "Beef", "Chicken"];
const OP_COST_CATEGORIES = ["Packaging", "Utilities", "Rent", "Salaries", "Equipment", "Marketing", "Licenses"];

interface FormState {
  item_name: string;
  expense_type: ExpenseType;
  supplier: string;
  unit: string;
  quantity: string;
  unit_cost: string;
  transport_cost: string;
  category: string;
  amount: string;
  brand_id: string;
}

const EMPTY: FormState = {
  item_name: "",
  expense_type: "INGREDIENT",
  supplier: "",
  unit: "",
  quantity: "",
  unit_cost: "",
  transport_cost: "",
  category: "",
  amount: "",
  brand_id: "",
};

export function ExpenseForm() {
  const { activeBrand, brands } = useBrand();
  const { user } = useUser();
  const orgId = user?.organization_id ?? null;
  const queryClient = useQueryClient();
  const idempotencyKey = useRef<string>(crypto.randomUUID());

  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    brand_id: activeBrand?.id ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.item_name.trim()) next.item_name = "Item name is required";

    if (form.expense_type === "INGREDIENT") {
      if (!form.unit) next.unit = "Unit of measure is required";
      const qty = parseFloat(form.quantity);
      if (!form.quantity || isNaN(qty) || qty <= 0) next.quantity = "Quantity must be > 0";
      const cost = parseFloat(form.unit_cost);
      if (!form.unit_cost || isNaN(cost) || cost <= 0) next.unit_cost = "Unit cost must be > 0";
    } else if (form.expense_type === "OPERATIONAL_COST") {
      if (!form.category) next.category = "Category is required";
      const amt = parseFloat(form.amount);
      if (!form.amount || isNaN(amt) || amt <= 0) next.amount = "Amount must be > 0";
    } else {
      const amt = parseFloat(form.amount);
      if (!form.amount || isNaN(amt) || amt <= 0) next.amount = "Amount must be > 0";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const quantity = parseFloat(form.quantity) || 0;
  const unitCost = parseFloat(form.unit_cost) || 0;
  const transportCost = parseFloat(form.transport_cost) || 0;
  const calculatedTotal = form.expense_type === "INGREDIENT"
    ? (quantity * unitCost) + transportCost
    : parseFloat(form.amount) || 0;

  const mutation = useMutation({
    mutationFn: () => {
      if (form.expense_type === "INGREDIENT") {
        return expenseService.createExpense({
          item_name: form.item_name.trim(),
          expense_type: form.expense_type,
          amount: calculatedTotal,
          quantity: quantity || undefined,
          unit: form.unit || undefined,
          supplier: form.supplier || undefined,
          unit_cost: unitCost || undefined,
          transport_cost: transportCost || undefined,
          idempotency_key: idempotencyKey.current,
        });
      } else {
        return expenseService.createExpense({
          item_name: form.item_name.trim(),
          expense_type: form.expense_type,
          amount: calculatedTotal,
          idempotency_key: idempotencyKey.current,
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QK.expenseStats(form.brand_id) });
      queryClient.invalidateQueries({ queryKey: QK.expenseWeekStats(form.brand_id) });
      queryClient.invalidateQueries({ queryKey: QK.expenseHistory(form.brand_id) });
      queryClient.invalidateQueries({ queryKey: QK.inventoryStats(orgId) });
      queryClient.invalidateQueries({ queryKey: QK.todayStats(form.brand_id) });

      const baseMsg = `Expense logged — RWF ${calculatedTotal.toLocaleString()}`;
      if (data.inventory_updated) {
        toast.success(baseMsg, {
          description: `Stock updated for "${data.item_name}"`,
        });
      } else if (data.note) {
        toast.success(baseMsg, { description: data.note });
      } else {
        toast.success(baseMsg);
      }

      setForm({ ...EMPTY, brand_id: form.brand_id });
      setErrors({});
      idempotencyKey.current = crypto.randomUUID();
    },
    onError: (err: any) => {
      if (err?.response?.status === 409) {
        toast.error("Duplicate expense — already recorded");
        idempotencyKey.current = crypto.randomUUID();
        return;
      }
      toast.error(err?.response?.data?.detail ?? "Failed to log expense. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Expenditure Log Form */}
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-figtree mb-0.5">
              Expenditure Log
            </p>
            <p className="text-xs text-slate-400 font-figtree">
              {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Expense type toggle with descriptions */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 font-figtree mb-2.5 uppercase tracking-wide">
              Expense Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["INGREDIENT", "OPERATIONAL_COST", "OTHER"] as ExpenseType[]).map((type) => {
                const isActive = form.expense_type === type;
                const Icon = type === "INGREDIENT" ? ShoppingCart : type === "OPERATIONAL_COST" ? Zap : Box;
                const label = type === "INGREDIENT" ? "Ingredient" : type === "OPERATIONAL_COST" ? "Operational Cost" : "Other";
                const desc = type === "INGREDIENT" ? "Raw food & beverage inputs for dishes" : type === "OPERATIONAL_COST" ? "Rent, utilities, salaries, packaging" : "Anything that doesn't fit above";
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => set("expense_type", type)}
                    className={cn(
                      "flex flex-col items-center gap-2 px-4 py-4 rounded-[12px] border-2 text-center transition-all",
                      isActive
                        ? type === "INGREDIENT"
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                          : type === "OPERATIONAL_COST"
                          ? "bg-blue-50 border-blue-400 text-blue-700"
                          : "bg-amber-50 border-amber-400 text-amber-700"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isActive
                        ? type === "INGREDIENT" ? "bg-indigo-100" : type === "OPERATIONAL_COST" ? "bg-blue-100" : "bg-amber-100"
                        : "bg-slate-100"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional fields based on expense type */}
          {form.expense_type === "INGREDIENT" ? (
            <>
              {/* Ingredient-specific fields */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                  Ingredient Name
                </label>
                <Input
                  value={form.item_name}
                  onChange={(e) => set("item_name", e.target.value)}
                  placeholder="e.g. White Rice, Beef, Chicken, etc."
                  className={cn(
                    "h-11 font-figtree text-sm",
                    errors.item_name && "border-red-300 focus-visible:ring-red-200"
                  )}
                />
                {errors.item_name && (
                  <p className="text-xs text-red-500 mt-1 font-figtree">{errors.item_name}</p>
                )}
                {form.item_name.length === 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {INGREDIENT_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => set("item_name", cat)}
                        className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                  Supplier
                </label>
                <Select value={form.supplier} onValueChange={(v) => set("supplier", v)}>
                  <SelectTrigger className="h-11 font-figtree text-sm">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLIERS.map((s) => (
                      <SelectItem key={s} value={s.toLowerCase()}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                  Unit of Measure
                </label>
                <div className="flex gap-2 flex-wrap">
                  {UNITS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => set("unit", u)}
                      className={cn(
                        "px-3 py-1.5 rounded-[8px] border text-xs font-semibold transition-all",
                        form.unit === u
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                {errors.unit && <p className="text-xs text-red-500 mt-1 font-figtree">{errors.unit}</p>}
              </div>

              {/* Quantity, Unit Cost, Transport Cost - 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    placeholder="e.g. 2"
                    className={cn(
                      "h-11 font-figtree text-sm",
                      errors.quantity && "border-red-300 focus-visible:ring-red-200"
                    )}
                  />
                  {errors.quantity && (
                    <p className="text-xs text-red-500 mt-1 font-figtree">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                    Unit Cost (RWF)
                  </label>
                  <Input
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.unit_cost}
                    onChange={(e) => set("unit_cost", e.target.value)}
                    placeholder="e.g. 500"
                    className={cn(
                      "h-11 font-figtree text-sm",
                      errors.unit_cost && "border-red-300 focus-visible:ring-red-200"
                    )}
                  />
                  {errors.unit_cost && (
                    <p className="text-xs text-red-500 mt-1 font-figtree">{errors.unit_cost}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                    Transport Cost (RWF)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={form.transport_cost}
                    onChange={(e) => set("transport_cost", e.target.value)}
                    placeholder="Optional"
                    className="h-11 font-figtree text-sm"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Operational Cost / Other fields */}
              {form.expense_type === "OPERATIONAL_COST" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-figtree mb-2 uppercase tracking-wide">
                    Expense Category
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {OP_COST_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => set("category", cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-[8px] border text-xs font-semibold transition-all",
                          form.category === cat
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {errors.category && <p className="text-xs text-red-500 mt-1 font-figtree">{errors.category}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                  {form.expense_type === "OPERATIONAL_COST" ? "Expense Name" : "Item Name"}
                </label>
                <Input
                  value={form.item_name}
                  onChange={(e) => set("item_name", e.target.value)}
                  placeholder={form.expense_type === "OPERATIONAL_COST" ? "e.g. Gas, Transport, electricity bill, etc." : "e.g. Miscellaneous item"}
                  className={cn(
                    "h-11 font-figtree text-sm",
                    errors.item_name && "border-red-300 focus-visible:ring-red-200"
                  )}
                />
                {errors.item_name && (
                  <p className="text-xs text-red-500 mt-1 font-figtree">{errors.item_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                    Amount (RWF)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-500 font-semibold text-sm">RWF</span>
                    <Input
                      type="number"
                      min="0.01"
                      step="any"
                      value={form.amount}
                      onChange={(e) => set("amount", e.target.value)}
                      placeholder="0"
                      className={cn(
                        "h-11 font-figtree text-sm pl-12",
                        errors.amount && "border-red-300 focus-visible:ring-red-200"
                      )}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-red-500 mt-1 font-figtree">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                    Brand
                  </label>
                  <Select value={form.brand_id} onValueChange={(v) => set("brand_id", v)}>
                    <SelectTrigger className="h-11 font-figtree text-sm">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Calculated total */}
          <div className="bg-slate-50 rounded-[8px] p-4 flex items-center justify-between border border-slate-100">
            <span className="text-xs font-semibold text-slate-600 font-figtree">Calculated Total</span>
            <span className="text-lg font-bold text-slate-900">
              RWF {calculatedTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Brand - only show for INGREDIENT type */}
          {form.expense_type === "INGREDIENT" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
                Brand
              </label>
              <Select value={form.brand_id} onValueChange={(v) => set("brand_id", v)}>
                <SelectTrigger className="h-11 font-figtree text-sm">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-11 bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold font-figtree rounded-[8px] shadow-[0_4px_14px_rgba(59,89,218,0.3)] active:scale-95 transition-all"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging…
              </span>
            ) : (
              "Log Expense"
            )}
          </Button>
        </form>
      </div>

      {/* Right: Entry Preview */}
      <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-figtree">
            Entry Preview
          </p>
        </div>

        {/* Preview content */}
        <div className="p-5 space-y-4 text-sm">
          {form.expense_type === "INGREDIENT" ? (
            <>
              {/* Item name or placeholder */}
              {form.item_name ? (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ingredient</p>
                  <p className="font-semibold text-slate-900">{form.item_name}</p>
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic">No item selected</div>
              )}

              {/* Supplier */}
              {form.supplier && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Supplier</p>
                  <p className="font-semibold text-slate-900">{form.supplier}</p>
                </div>
              )}

              {/* Quantity */}
              {form.quantity && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Quantity</p>
                  <p className="font-semibold text-slate-900">
                    {form.quantity} {form.unit || "—"}
                  </p>
                </div>
              )}

              {/* Unit Cost */}
              {form.unit_cost && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Unit Cost</p>
                  <p className="font-semibold text-slate-900">
                    RWF {parseFloat(form.unit_cost).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Transport */}
              {form.transport_cost && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Transport</p>
                  <p className="font-semibold text-slate-900">
                    RWF {parseFloat(form.transport_cost).toLocaleString()}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Operational Cost / Other preview */}
              {form.expense_type === "OPERATIONAL_COST" && form.category && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Category</p>
                  <p className="font-semibold text-slate-900">{form.category}</p>
                </div>
              )}

              {form.item_name && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">{form.expense_type === "OPERATIONAL_COST" ? "Expense Name" : "Item"}</p>
                  <p className="font-semibold text-slate-900">{form.item_name}</p>
                </div>
              )}

              {form.amount && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Amount</p>
                  <p className="font-semibold text-slate-900">
                    RWF {parseFloat(form.amount).toLocaleString()}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Total Cost */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 mb-2">Total Cost</p>
            <p className="text-xl font-bold text-[#3B59DA]">
              RWF {calculatedTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
