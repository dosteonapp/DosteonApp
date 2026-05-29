"use client";

import { useState, useCallback, useEffect, useRef, useId } from "react";
import { ShoppingBasket, Wrench, MoreHorizontal, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { expenseService, ExpenseType } from "@/lib/services/expenseService";
import { inventoryApi, InventoryProduct } from "@/lib/services/inventoryService";
import { useBrand } from "@/context/BrandContext";
import { QK } from "@/lib/queryKeys";
import { toast } from "@/hooks/use-toast";
import { cleanFloatInput } from "@/lib/numberInputUtils";
import { ActionConfirmationDialog } from "@/components/ui/action-confirmation-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UIExpenseType = "ingredient" | "operational" | "other";

export interface FormState {
  uiType: UIExpenseType;
  itemName: string;
  supplier: string;
  unit: string;
  quantity: string;
  unitCost: string;
  transportCost: string;
  category: string;
  amount: string;
}

const EMPTY_FORM: FormState = {
  uiType: "ingredient",
  itemName: "",
  supplier: "",
  unit: "",
  quantity: "",
  unitCost: "",
  transportCost: "",
  category: "",
  amount: "",
};

interface Props {
  onFormChange?: (form: FormState) => void;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Static constants
// ---------------------------------------------------------------------------

const SUPPLIER_CHIPS = ["Local Market", "Wholesale", "Direct Farm", "Importer"];
const UNIT_OPTIONS = ["kg", "g", "Liter (L)", "ml", "Bundle", "Crate", "meter (m)", "Carton (ct)", "units"];
const UNIT_VALUES  = ["kg", "g", "L",         "ml", "Bundle", "Crate", "m",         "ct",           "units"];
const CATEGORY_CHIPS = ["Packaging", "Utilities", "Rent", "Salaries", "Equipment", "Marketing", "Licenses"];

// ---------------------------------------------------------------------------
// Type selector card config
// ---------------------------------------------------------------------------

const TYPE_CARDS: {
  id: UIExpenseType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "ingredient",  label: "Ingredient",      description: "Raw food items purchased",   icon: ShoppingBasket },
  { id: "operational", label: "Operational Cost", description: "Utilities, packaging, etc.", icon: Wrench },
  { id: "other",       label: "Other",            description: "Any other expense",          icon: MoreHorizontal },
];

// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border font-figtree whitespace-nowrap",
        active
          ? "bg-[#3B59DA] text-white border-[#3B59DA]"
          : "bg-white text-slate-500 border-slate-200 hover:border-[#3B59DA] hover:text-[#3B59DA]"
      )}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Inventory item name autocomplete
// ---------------------------------------------------------------------------

function ItemNameField({
  value,
  onChange,
  inventoryItems,
}: {
  value: string;
  onChange: (name: string, unit?: string, category?: string) => void;
  inventoryItems: InventoryProduct[];
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dropdown suggestions: filter by what's typed
  const query = value.trim().toLowerCase();
  const suggestions = query.length >= 1
    ? inventoryItems.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 8)
    : [];

  // Quick-select chips: top 6 inventory items (alphabetical)
  const quickChips = inventoryItems.slice(0, 6);

  const showDropdown = focused && suggestions.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selectItem = (item: InventoryProduct) => {
    onChange(item.name, item.unit, item.category);
    setOpen(false);
    setFocused(false);
  };

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Input */}
      <div className="relative">
        <Input
          placeholder="Search or type an item name…"
          value={value}
          onChange={(e) => { onChange(e.target.value, undefined, ""); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px] pr-10"
          autoComplete="off"
        />
        {inventoryItems.length > 0 && (
          <Package className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden">
            {suggestions.map((item) => {
              const isSelected = value === item.name;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectItem(item); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-indigo-50/60 transition-colors",
                    isSelected && "bg-indigo-50"
                  )}
                >
                  <div className="w-7 h-7 rounded-[6px] bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-700 font-figtree truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-bold font-figtree">
                      {item.category} · {item.unit} · stock: {item.current_stock}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#3B59DA] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick chips — from inventory */}
      {quickChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((item) => (
            <Chip
              key={item.id}
              label={item.name}
              active={value === item.name}
              onClick={() => onChange(item.name, item.unit, item.category)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ExpenditureLogForm({ onFormChange, onSuccess }: Props) {
  const [form, setFormRaw] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingForm, setPendingForm] = useState<FormState | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const idKey = useId();

  // Fetch inventory products for the autocomplete
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventoryProducts", activeBrand?.id ?? null],
    queryFn: () => inventoryApi.getProducts(),
    staleTime: 5 * 60_000,
  });

  const setForm = useCallback(
    (updater: Partial<FormState> | ((prev: FormState) => FormState)) => {
      setFormRaw((prev) =>
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
      );
    },
    []
  );

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  // Computed total for ingredient type
  const computedTotal = (() => {
    const qty = parseFloat(form.quantity) || 0;
    const uc  = parseFloat(form.unitCost)  || 0;
    const tc  = parseFloat(form.transportCost) || 0;
    return qty * uc + tc;
  })();

  const displayAmount =
    form.uiType === "ingredient" ? computedTotal : parseFloat(form.amount) || 0;

  const canSubmit = (() => {
    if (!form.itemName.trim()) return false;
    if (form.uiType === "ingredient") {
      return parseFloat(form.quantity) > 0 && parseFloat(form.unitCost) > 0;
    }
    return parseFloat(form.amount) > 0;
  })();

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    setPendingForm(form);
    setShowConfirmation(true);
    setConfirmationError(null);
  };

  const handleConfirmExpense = async () => {
    if (!pendingForm) return;
    setSubmitting(true);
    try {
      const apiType: ExpenseType = pendingForm.uiType === "ingredient" ? "INGREDIENT" : "OVERHEAD";
      const displayAmount = pendingForm.uiType === "ingredient"
        ? (parseFloat(pendingForm.quantity) || 0) * (parseFloat(pendingForm.unitCost) || 0) + (parseFloat(pendingForm.transportCost) || 0)
        : parseFloat(pendingForm.amount) || 0;

      const payload = {
        item_name: pendingForm.itemName.trim(),
        expense_type: apiType,
        source:
          pendingForm.uiType === "ingredient"
            ? pendingForm.supplier || undefined
            : pendingForm.uiType === "operational"
            ? pendingForm.category || undefined
            : undefined,
        amount: displayAmount,
        quantity: pendingForm.uiType === "ingredient" ? parseFloat(pendingForm.quantity) || undefined : undefined,
        unit: pendingForm.uiType === "ingredient" ? (pendingForm.unit || undefined) : undefined,
        idempotency_key: `${idKey}-${Date.now()}`,
      };

      await expenseService.createExpense(payload);
      toast({ title: "Expense logged", description: `${pendingForm.itemName} — RWF ${displayAmount.toLocaleString()}` });
      setForm(EMPTY_FORM);
      setShowConfirmation(false);
      setPendingForm(null);
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: QK.expenseWeekStats(activeBrand?.id ?? null) });
      queryClient.invalidateQueries({ queryKey: QK.expenseHistory(activeBrand?.id ?? null) });
      queryClient.invalidateQueries({ queryKey: QK.expenseStats(activeBrand?.id ?? null) });
    } catch (error) {
      let errorMsg = "Could not log expense. Please try again.";
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.detail) {
          errorMsg = axiosError.response.data.detail;
        } else {
          errorMsg = error.message;
        }
      }
      setConfirmationError(errorMsg);
      console.error("Expense confirmation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingForm(null);
    setConfirmationError(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* Type selector */}
      <div className="grid grid-cols-3 gap-3">
        {TYPE_CARDS.map((card) => {
          const isActive = form.uiType === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setForm({ ...EMPTY_FORM, uiType: card.id })}
              className={cn(
                "flex flex-col items-center gap-2 p-3 md:p-4 rounded-[12px] border-2 transition-all text-center",
                isActive
                  ? "border-[#3B59DA] bg-indigo-50/60"
                  : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/20"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors",
                isActive ? "bg-[#3B59DA]" : "bg-slate-100"
              )}>
                <card.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
              </div>
              <div>
                <p className={cn("text-[11px] md:text-[12px] font-black font-figtree leading-tight", isActive ? "text-[#3B59DA]" : "text-slate-600")}>
                  {card.label}
                </p>
                <p className="text-[10px] text-slate-400 font-bold font-figtree mt-0.5 hidden md:block">
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Ingredient fields ── */}
      {form.uiType === "ingredient" && (
        <>
          <Field label="Item Name">
            <ItemNameField
              value={form.itemName}
              inventoryItems={inventoryItems}
              onChange={(name, unit, category) =>
                setForm((prev) => ({
                  ...prev,
                  itemName: name,
                  category: category ?? (name !== prev.itemName ? "" : prev.category),
                  ...(unit && !prev.unit ? { unit } : {}),
                }))
              }
            />
            {form.category && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-slate-400 font-bold font-figtree">Category:</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-[#3B59DA] text-[11px] font-bold font-figtree rounded-full">
                  {form.category}
                </span>
              </div>
            )}
          </Field>

          <Field label="Supplier (optional)">
            <Input
              placeholder="e.g. Local Market"
              value={form.supplier}
              onChange={(e) => setForm({ supplier: e.target.value })}
              className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px]"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUPPLIER_CHIPS.map((c) => (
                <Chip key={c} label={c} active={form.supplier === c} onClick={() => setForm({ supplier: c })} />
              ))}
            </div>
          </Field>

          <Field label="Unit of Measure">
            <div className="flex flex-wrap gap-1.5">
              {UNIT_OPTIONS.map((label, i) => (
                <Chip
                  key={label}
                  label={label}
                  active={form.unit === UNIT_VALUES[i]}
                  onClick={() => setForm({ unit: UNIT_VALUES[i] })}
                />
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity">
              <Input
                type="number" min="0" step="1.0" placeholder="0"
                value={form.quantity}
                onFocus={(e) => e.target.value === "0" && setForm({ quantity: "" })}
                onChange={(e) => setForm({ quantity: cleanFloatInput(e.target.value).toString() })}
                className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px]"
              />
            </Field>
            <Field label="Unit Cost (RWF)">
              <Input
                type="number" min="0" step="1.0" placeholder="0"
                value={form.unitCost}
                onFocus={(e) => e.target.value === "0" && setForm({ unitCost: "" })}
                onChange={(e) => setForm({ unitCost: cleanFloatInput(e.target.value).toString() })}
                className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px]"
              />
            </Field>
          </div>

          <Field label="Transport Cost (optional)">
            <Input
              type="number" min="0" step="1.0" placeholder="0"
              value={form.transportCost}
              onFocus={(e) => e.target.value === "0" && setForm({ transportCost: "" })}
              onChange={(e) => setForm({ transportCost: cleanFloatInput(e.target.value).toString() })}
              className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px]"
            />
          </Field>
        </>
      )}

      {/* ── Operational Cost fields ── */}
      {form.uiType === "operational" && (
        <>
          <Field label="Category">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_CHIPS.map((c) => (
                <Chip key={c} label={c} active={form.category === c} onClick={() => setForm({ category: c })} />
              ))}
            </div>
          </Field>

          <Field label="Expense Name">
            <Input
              placeholder="e.g. Monthly electricity bill"
              value={form.itemName}
              onChange={(e) => setForm({ itemName: e.target.value })}
              className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px]"
            />
          </Field>

          <Field label="Amount (RWF)">
            <Input
              type="number" min="0" step="1.0" placeholder="0"
              value={form.amount}
              onFocus={(e) => e.target.value === "0" && setForm({ amount: "" })}
              onChange={(e) => setForm({ amount: cleanFloatInput(e.target.value).toString() })}
              className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px]"
            />
          </Field>
        </>
      )}

      {/* ── Other fields ── */}
      {form.uiType === "other" && (
        <>
          <Field label="Expense Name">
            <Input
              placeholder="e.g. Staff uniforms"
              value={form.itemName}
              onChange={(e) => setForm({ itemName: e.target.value })}
              className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px]"
            />
          </Field>

          <Field label="Amount (RWF)">
            <Input
              type="number" min="0" step="1.0" placeholder="0"
              value={form.amount}
              onFocus={(e) => e.target.value === "0" && setForm({ amount: "" })}
              onChange={(e) => setForm({ amount: cleanFloatInput(e.target.value).toString() })}
              className="h-11 rounded-[10px] border-slate-200 font-figtree text-[13px]"
            />
          </Field>
        </>
      )}

      {/* Total display */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-[10px] border border-slate-100">
        <span className="text-[13px] font-bold text-slate-500 font-figtree">
          {form.uiType === "ingredient" ? "Calculated Total" : "Total Amount"}
        </span>
        <span className="text-[18px] font-black text-[#1E293B] font-figtree">
          RWF {displayAmount > 0
            ? displayAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
            : "—"}
        </span>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full h-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black text-[14px] font-figtree transition-all active:scale-[0.98] disabled:opacity-40"
      >
        {submitting ? "Logging…" : "Log Expense"}
      </Button>

      {/* Confirmation Dialog */}
      {pendingForm && (
        <ActionConfirmationDialog
          isOpen={showConfirmation}
          onClose={handleCancelConfirmation}
          onConfirm={handleConfirmExpense}
          title="Confirm Expense"
          description="Please review the expense details before logging"
          summaryItems={(() => {
            const items: import("@/components/ui/action-confirmation-dialog").SummaryItem[] = [
              { label: "Item Name", value: pendingForm.itemName },
            ];

            if (pendingForm.uiType === "ingredient") {
              items.push(
                { label: "Quantity", value: `${pendingForm.quantity} ${pendingForm.unit || "units"}` },
                { label: "Unit Cost", value: `RWF ${parseFloat(pendingForm.unitCost || "0").toLocaleString()}` }
              );

              if (parseFloat(pendingForm.transportCost || "0") > 0) {
                items.push({
                  label: "Transport Cost",
                  value: `RWF ${parseFloat(pendingForm.transportCost).toLocaleString()}`,
                });
              }

              const total =
                (parseFloat(pendingForm.quantity) || 0) * (parseFloat(pendingForm.unitCost) || 0) +
                (parseFloat(pendingForm.transportCost) || 0);
              items.push({
                label: "Total",
                value: `RWF ${total.toLocaleString()}`,
                variant: "positive",
              });

              if (pendingForm.supplier) {
                items.push({ label: "Supplier", value: pendingForm.supplier });
              }
            } else {
              const amount = parseFloat(pendingForm.amount || "0");
              items.push({
                label: "Amount",
                value: `RWF ${amount.toLocaleString()}`,
                variant: "positive",
              });

              if (pendingForm.uiType === "operational" && pendingForm.category) {
                items.push({ label: "Category", value: pendingForm.category });
              }
            }

            return items;
          })()}
          confirmText="Log Expense"
          cancelText="Cancel"
          variant="default"
          isLoading={submitting}
          error={confirmationError}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-black text-slate-500 uppercase tracking-wide font-figtree">
        {label}
      </label>
      {children}
    </div>
  );
}
