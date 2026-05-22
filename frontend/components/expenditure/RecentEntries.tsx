"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBasket, Wrench, MoreHorizontal, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { expenseService, ExpenseHistoryItem, ExpenseType } from "@/lib/services/expenseService";
import { useBrand } from "@/context/BrandContext";
import { useUser } from "@/context/UserContext";
import { QK } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";

const TYPE_META: Record<ExpenseType, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  INGREDIENT: { label: "Ingredient",      color: "text-emerald-700", bg: "bg-emerald-50",  icon: ShoppingBasket },
  OPERATIONAL_COST: { label: "Operational",     color: "text-amber-700",   bg: "bg-amber-50",    icon: Wrench },
  OTHER: { label: "Other",                color: "text-slate-700",   bg: "bg-slate-100",   icon: MoreHorizontal },
};

interface Props {
  refreshKey?: number;
}

export function RecentEntries({ refreshKey }: Props) {
  const { activeBrand } = useBrand();
  const { user } = useUser();
  const brandId = activeBrand?.id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: [...QK.expenseHistory(brandId), "recent", refreshKey],
    queryFn: () => expenseService.getHistory({ page: 1, limit: 5, days: 1 }),
    staleTime: 30_000,
  });

  const workspaceSlug = user?.workspace_slug;
  const historyHref = workspaceSlug ? `/${workspaceSlug}/dashboard/expenditure/history` : "/dashboard/expenditure/history";

  const items = data?.items ?? [];

  return (
    <div className="rounded-[12px] border border-slate-100 overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[13px] font-black text-slate-700 font-figtree">Today&apos;s Entries</span>
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-300" />}
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-[12px] text-slate-400 font-bold font-figtree">No expenses logged today yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {items.map((item) => (
            <EntryRow key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-t border-slate-50">
        <Link
          href={historyHref}
          className="flex items-center gap-1.5 text-[12px] font-bold text-[#3B59DA] hover:underline font-figtree group"
        >
          View Full Expense History
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function EntryRow({ item }: { item: ExpenseHistoryItem }) {
  const type = item.expense_type as ExpenseType;
  const meta = TYPE_META[type] ?? { label: "Other", color: "text-slate-700", bg: "bg-slate-100", icon: MoreHorizontal };
  const Icon = meta.icon;

  const time = item.occurred_at
    ? new Date(item.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={cn("w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0", meta.bg)}>
        <Icon className={cn("h-3.5 w-3.5", meta.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-700 font-figtree truncate">{item.item_name}</p>
        <p className="text-[11px] text-slate-400 font-bold font-figtree">{meta.label}{item.source ? ` · ${item.source}` : ""}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-black text-slate-800 font-figtree">
          RWF {item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        {time && <p className="text-[11px] text-slate-400 font-bold font-figtree">{time}</p>}
      </div>
    </div>
  );
}
