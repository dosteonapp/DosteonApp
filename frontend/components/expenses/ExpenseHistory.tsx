"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/context/BrandContext";
import { QK } from "@/lib/queryKeys";
import { expenseService, ExpenseHistoryItem } from "@/lib/services/expenseService";
import { cn } from "@/lib/utils";

type DayFilter = 7 | 14 | 30;

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

function TypeBadge({ type }: { type: string }) {
  const isIngredient = type === "INGREDIENT";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-figtree uppercase tracking-wide",
        isIngredient
          ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
          : "bg-rose-50 text-rose-600 border border-rose-100"
      )}
    >
      {isIngredient ? "Ingredient" : "Overhead"}
    </span>
  );
}

function HistoryRow({ item }: { item: ExpenseHistoryItem }) {
  const date = item.occurred_at
    ? new Date(item.occurred_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "—";
  const qty = item.quantity != null ? `${item.quantity} ${item.unit ?? ""}`.trim() : "—";

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
      <td className="px-4 py-3 text-sm font-semibold text-slate-700 font-figtree max-w-[140px] truncate">
        {item.item_name}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 font-figtree whitespace-nowrap">{date}</td>
      <td className="px-4 py-3">
        <TypeBadge type={item.expense_type} />
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 font-figtree">{qty}</td>
      <td className="px-4 py-3 text-sm font-bold text-slate-800 font-figtree whitespace-nowrap text-right">
        RWF {fmt(item.amount)}
      </td>
    </tr>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50">
          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export function ExpenseHistory() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? null;
  const [days, setDays] = useState<DayFilter>(7);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: QK.expenseHistory(brandId, days, page),
    queryFn: () => expenseService.getHistory({ days, page, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  const handleDaysChange = (d: DayFilter) => {
    setDays(d);
    setPage(1);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <p className="text-sm font-bold text-slate-700 font-figtree">Expense History</p>
        <div className="flex gap-1.5">
          {([7, 14, 30] as DayFilter[]).map((d) => (
            <button
              key={d}
              onClick={() => handleDaysChange(d)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold font-figtree transition-all",
                days === d
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              {["ITEM", "DATE", "TYPE", "QUANTITY", "AMOUNT"].map((h) => (
                <th
                  key={h}
                  className={cn(
                    "px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-figtree",
                    h === "AMOUNT" && "text-right"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : data?.items.length ? (
              data.items.map((item) => <HistoryRow key={item.id} item={item} />)
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400 font-figtree">
                  No expenses logged in the last {days} days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-figtree">
            {data.total} expense{data.total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-[6px]"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-slate-500 font-figtree min-w-[60px] text-center">
              {page} / {data.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-[6px]"
              disabled={page === data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
