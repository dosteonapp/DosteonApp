"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Zap } from "lucide-react";

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
import { QK } from "@/lib/queryKeys";
import { expenseService, ExpenseType } from "@/lib/services/expenseService";
import { cn } from "@/lib/utils";

const UNITS = ["kg", "g", "L", "mL", "units", "pieces", "bags", "boxes", "litres"];
const SOURCES = ["Supplier", "Market", "Wholesale", "Other"];

interface FormState {
  item_name: string;
  expense_type: ExpenseType;
  amount: string;
  quantity: string;
  unit: string;
  source: string;
}

const EMPTY: FormState = {
  item_name: "",
  expense_type: "INGREDIENT",
  amount: "",
  quantity: "",
  unit: "",
  source: "",
};

export function ExpenseForm() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? null;
  const queryClient = useQueryClient();
  const idempotencyKey = useRef<string>(crypto.randomUUID());

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.item_name.trim()) next.item_name = "Item name is required";
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) next.amount = "Enter a valid amount > 0";
    if (form.quantity) {
      const qty = parseFloat(form.quantity);
      if (isNaN(qty) || qty <= 0) next.quantity = "Quantity must be > 0";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () =>
      expenseService.createExpense({
        item_name: form.item_name.trim(),
        expense_type: form.expense_type,
        amount: parseFloat(form.amount),
        quantity: form.quantity ? parseFloat(form.quantity) : undefined,
        unit: form.unit || undefined,
        source: form.source || undefined,
        idempotency_key: idempotencyKey.current,
      }),
    onSuccess: (data) => {
      // Invalidate all affected caches
      queryClient.invalidateQueries({ queryKey: QK.expenseStats(brandId) });
      queryClient.invalidateQueries({ queryKey: QK.expenseWeekStats(brandId) });
      queryClient.invalidateQueries({ queryKey: QK.expenseHistory(brandId) });
      queryClient.invalidateQueries({ queryKey: QK.inventoryStats(brandId) });
      queryClient.invalidateQueries({ queryKey: QK.todayStats(brandId) });

      const baseMsg = `Expense logged — RWF ${data.amount.toLocaleString()}`;
      if (data.inventory_updated) {
        toast.success(baseMsg, {
          description: `Stock updated for "${data.item_name}"`,
        });
      } else if (data.note) {
        toast.success(baseMsg, { description: data.note });
      } else {
        toast.success(baseMsg);
      }

      // Reset form + generate fresh idempotency key
      setForm(EMPTY);
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
    <div className="bg-white border border-slate-100 rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden">
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
        {/* Expense type toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
            Expense Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["INGREDIENT", "OVERHEAD"] as ExpenseType[]).map((type) => {
              const isActive = form.expense_type === type;
              const Icon = type === "INGREDIENT" ? ShoppingCart : Zap;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("expense_type", type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-[8px] border text-sm font-semibold font-figtree transition-all",
                    isActive
                      ? type === "INGREDIENT"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-rose-50 border-rose-300 text-rose-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {type === "INGREDIENT" ? "Ingredient (COGS)" : "Overhead"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Item name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
            Item Name
          </label>
          <Input
            value={form.item_name}
            onChange={(e) => set("item_name", e.target.value)}
            placeholder="e.g. Gas, Transport, Beef, Chicken…"
            className={cn(
              "h-11 font-figtree text-sm",
              errors.item_name && "border-red-300 focus-visible:ring-red-200"
            )}
          />
          {errors.item_name && (
            <p className="text-xs text-red-500 mt-1 font-figtree">{errors.item_name}</p>
          )}
        </div>

        {/* Source */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
            Source
          </label>
          <Select value={form.source} onValueChange={(v) => set("source", v)}>
            <SelectTrigger className="h-11 font-figtree text-sm">
              <SelectValue placeholder="e.g. Manual Entry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Entry</SelectItem>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s.toLowerCase()}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount + Quantity/Unit row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
              Amount (RWF)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-[8px] border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-figtree">
                RWF
              </span>
              <Input
                type="number"
                min="0.01"
                step="any"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="0"
                className={cn(
                  "h-11 rounded-l-none font-figtree text-sm",
                  errors.amount && "border-red-300 focus-visible:ring-red-200"
                )}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1 font-figtree">{errors.amount}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
              Quantity{" "}
              <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <Input
              type="number"
              min="0.01"
              step="any"
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              placeholder="e.g. 6"
              className={cn(
                "h-11 font-figtree text-sm",
                errors.quantity && "border-red-300 focus-visible:ring-red-200"
              )}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500 mt-1 font-figtree">{errors.quantity}</p>
            )}
          </div>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 font-figtree mb-1.5 uppercase tracking-wide">
            Unit <span className="text-slate-400 normal-case font-normal">(optional)</span>
          </label>
          <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
            <SelectTrigger className="h-11 font-figtree text-sm">
              <SelectValue placeholder="e.g. Kg" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-11 bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold font-figtree rounded-[8px] shadow-[0_4px_14px_rgba(59,89,218,0.3)] active:scale-95 transition-all mt-2"
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
  );
}
