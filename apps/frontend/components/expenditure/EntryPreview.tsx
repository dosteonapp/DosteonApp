"use client";

import { ShoppingBasket, Wrench, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormState, UIExpenseType } from "./ExpenditureLogForm";

const TYPE_META: Record<UIExpenseType, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  ingredient:   { label: "Ingredient",      color: "text-emerald-700", bg: "bg-emerald-50",   icon: ShoppingBasket },
  operational:  { label: "Operational Cost", color: "text-amber-700",   bg: "bg-amber-50",     icon: Wrench },
  other:        { label: "Other",            color: "text-slate-700",   bg: "bg-slate-100",    icon: MoreHorizontal },
};

interface Props {
  form: FormState;
}

export function EntryPreview({ form }: Props) {
  const meta = TYPE_META[form.uiType];
  const Icon = meta.icon;

  const computedTotal = (() => {
    if (form.uiType === "ingredient") {
      const qty = parseFloat(form.quantity) || 0;
      const uc = parseFloat(form.unitCost) || 0;
      const tc = parseFloat(form.transportCost) || 0;
      return qty * uc + tc;
    }
    return parseFloat(form.amount) || 0;
  })();

  const isEmpty = !form.itemName.trim() && computedTotal === 0;

  return (
    <div className="rounded-[12px] border border-slate-100 bg-slate-50/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[12px] font-black uppercase tracking-wider text-slate-400 font-figtree">
          Entry Preview
        </span>
        <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-figtree", meta.bg, meta.color)}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>

      {isEmpty ? (
        <div className="px-4 py-8 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Icon className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-[12px] text-slate-400 font-bold font-figtree">Fill in the form to see a preview</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          <PreviewRow label="Item" value={form.itemName || "—"} />

          {form.uiType === "ingredient" && (
            <>
              {form.supplier && <PreviewRow label="Supplier" value={form.supplier} />}
              {form.unit && <PreviewRow label="Unit" value={form.unit} />}
              {form.quantity && (
                <PreviewRow label="Quantity" value={`${form.quantity}${form.unit ? ` ${form.unit}` : ""}`} />
              )}
              {form.unitCost && (
                <PreviewRow label="Unit Cost" value={`RWF ${parseFloat(form.unitCost).toLocaleString()}`} />
              )}
              {form.transportCost && parseFloat(form.transportCost) > 0 && (
                <PreviewRow label="Transport" value={`RWF ${parseFloat(form.transportCost).toLocaleString()}`} />
              )}
            </>
          )}

          {form.uiType === "operational" && form.category && (
            <PreviewRow label="Category" value={form.category} />
          )}

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[12px] font-black text-slate-500 font-figtree">Total</span>
            <span className="text-[20px] font-black text-[#1E293B] font-figtree">
              RWF {computedTotal > 0 ? computedTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] text-slate-400 font-bold font-figtree shrink-0">{label}</span>
      <span className="text-[13px] font-bold text-slate-700 font-figtree text-right truncate">{value}</span>
    </div>
  );
}
