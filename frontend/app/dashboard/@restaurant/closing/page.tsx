"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  Search,
  Trash2,
  Clock,
  Package,
  Info,
  AlertTriangle,
  Loader2 as Loader2Icon,
  MapPin,
  TrendingUp,
  Home,
  Download,
  BarChart2,
  ClipboardCheck,
  Calendar,
  ChevronDown,
  ChevronRight,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { restaurantOpsService, InventoryItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { InventoryUpdateItemModal } from "@/components/inventory/InventoryUpdateItemModal";
import { motion } from "framer-motion";
import {
  UnifiedErrorBanner,
  AppContainer,
  InriaHeading,
  FigtreeText,
  UnifiedListRow,
  PrimarySurfaceCard,
} from "@/components/ui/dosteon-ui";
import { useBrand } from "@/context/BrandContext";
import axiosInstance from "@/lib/axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ClosingState = "INCOMPLETE" | "CHECKLIST_COMPLETE_KITCHEN_OPEN" | "READY_TO_CLOSE";

interface ClosingStatus {
  closing_state: ClosingState;
  verified_count: number;
  total_count: number;
  can_close: boolean;
}

interface TodayStats {
  today_revenue: number;
  today_cogs: number;
  today_gross_profit: number;
  categories_count?: number;
}

interface OrgSettings {
  name?: string;
  city?: string;
  opening_time?: string;
  closing_time?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmt = (n: number) =>
  Math.round(n).toLocaleString("en-US");

const formatClosedDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ClosingPage() {
  const router = useRouter();
  const lifecycle = useRestaurantDayLifecycle();
  const { isOpen, isClosing, isClosed, status } = lifecycle;
  const { activeBrand } = useBrand();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [closingIndicators, setClosingIndicators] = useState({ itemsUsed: 0, itemsWasted: 0 });
  const [closingStatus, setClosingStatus] = useState<ClosingStatus | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [orgSettings, setOrgSettings] = useState<OrgSettings | null>(null);
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStockCount, setShowStockCount] = useState(false);

  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [verifiedItemIds, setVerifiedItemIds] = useState<Set<string>>(new Set());
  const [closingCounts, setClosingCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleCountChange = (itemId: string, value: number) => {
    setClosingCounts((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleEditCount = (item: InventoryItem) => {
    setSelectedItemForEdit(item);
    setIsEditModalOpen(true);
  };

  const handleVerifyItem = (itemId: string) => {
    setVerifiedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const refreshClosingStatus = async () => {
    try {
      const s = await restaurantOpsService.getClosingStatus();
      setClosingStatus(s as ClosingStatus);
    } catch {
      // non-fatal
    }
  };

  const handleSaveDraft = async () => {
    try {
      await restaurantOpsService.saveClosingChecklistDraft({
        confirmedIds: Array.from(verifiedItemIds),
        counts: closingCounts,
      });
      toast({ title: "Progress Saved", description: "Your closing progress has been saved." });
      await refreshClosingStatus();
    } catch {
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    }
  };

  const handleWrapUp = async () => {
    setIsSubmitting(true);
    try {
      await restaurantOpsService.closeKitchen();
      await restaurantOpsService.submitClosingChecklist({
        confirmedIds: Array.from(verifiedItemIds),
        counts: closingCounts,
      });
      setIsDayClosed(true);
      toast({ title: "Restaurant Closed!", description: "Great job today. See you tomorrow." });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Failed to close. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventory, indicators, cs, stats, settings] = await Promise.all([
          restaurantOpsService.getInventoryItems(),
          restaurantOpsService.getClosingIndicators(),
          restaurantOpsService.getClosingStatus(),
          axiosInstance.get("sales/stats/today").then((r) => r.data).catch(() => null),
          restaurantOpsService.getSettings().catch(() => null),
        ]);
        setItems(inventory);
        setClosingIndicators(indicators);
        setClosingStatus(cs as ClosingStatus);
        setTodayStats(stats);
        setOrgSettings(settings);
      } catch (err) {
        console.error("Failed to fetch closing data:", err);
        setError("We couldn't load your closing data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Resume from draft
  useEffect(() => {
    if (status?.metadata?.closing_draft_confirmed_ids && items.length > 0) {
      setVerifiedItemIds(new Set(status.metadata.closing_draft_confirmed_ids));
    }
  }, [status?.metadata?.closing_draft_confirmed_ids, items.length]);

  // Auto-refresh status when verified items change
  useEffect(() => {
    if (items.length > 0) refreshClosingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedItemIds.size, items.length]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  if (isLoading && !items.length && !error) return <ClosingSkeleton />;

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aV = verifiedItemIds.has(a.id);
    const bV = verifiedItemIds.has(b.id);
    if (aV === bV) return 0;
    return aV ? 1 : -1;
  });

  const progressCount = verifiedItemIds.size;
  const totalCount = items.length;

  const showClosingModule = isClosing || closingStatus?.closing_state === "READY_TO_CLOSE";
  const closingState: ClosingState = closingStatus?.closing_state ?? "INCOMPLETE";

  const stockCountDone =
    closingState !== "INCOMPLETE" ||
    (totalCount > 0 && progressCount >= totalCount);

  const sharedProps = {
    todayStats,
    closingState,
    stockCountDone,
    showStockCount,
    setShowStockCount,
    sortedItems,
    search,
    setSearch,
    verifiedItemIds,
    closingCounts,
    handleCountChange,
    handleVerifyItem,
    handleEditCount,
    handleSaveDraft,
    progressCount,
    totalCount,
    router,
  };

  return (
    <AppContainer className="pb-8">
      {error && <UnifiedErrorBanner message={error} />}

      {/* Screen 2 — Closed success */}
      {(isClosed || isDayClosed) && (
        <ClosedSuccessScreen
          todayStats={todayStats}
          orgSettings={orgSettings}
          activeBrandName={activeBrand?.name}
          router={router}
          toast={toast}
        />
      )}

      {/* Locked card */}
      {!isClosed && !isDayClosed && !showClosingModule && (
        <div className="flex items-center justify-center py-4 min-h-[calc(100vh-88px)]">
          <ClosingLockedCard lifecycle={lifecycle} />
        </div>
      )}

      {/* 3-screen machine */}
      {!isClosed && !isDayClosed && showClosingModule && (
        <>
          {closingState === "INCOMPLETE" && (
            <IncompleteScreen {...sharedProps} />
          )}
          {(closingState === "CHECKLIST_COMPLETE_KITCHEN_OPEN" ||
            closingState === "READY_TO_CLOSE") && (
            <ChecklistCompleteScreen
              {...sharedProps}
              onWrapUp={handleWrapUp}
              isSubmitting={isSubmitting}
            />
          )}
        </>
      )}

      <InventoryUpdateItemModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        item={selectedItemForEdit}
        onUpdate={async () => {
          const inventory = await restaurantOpsService.getInventoryItems();
          setItems(inventory);
        }}
      />
    </AppContainer>
  );
}

// ---------------------------------------------------------------------------
// Shared financial summary cards
// ---------------------------------------------------------------------------
function SalesSummaryCard({
  todayStats,
  dark,
}: {
  todayStats: TodayStats | null;
  dark?: boolean;
}) {
  const cardCls = dark
    ? "bg-white rounded-[20px] p-6 flex flex-col gap-3"
    : "bg-white border border-slate-100 rounded-[20px] p-6 flex flex-col gap-3 shadow-sm";

  return (
    <div className={cardCls}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-[8px] bg-indigo-50 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-[#3B59DA]" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
          Total Sales
        </span>
      </div>
      <div>
        <p className="text-[28px] font-black text-[#1E293B] leading-none font-figtree">
          RWF {fmt(todayStats?.today_revenue ?? 0)}
        </p>
        <p className="text-[12px] font-medium text-slate-400 mt-1">
          Today's total revenue
        </p>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            Total COGS
          </span>
          <span className="text-[13px] font-black text-slate-600 font-figtree">
            RWF {fmt(todayStats?.today_cogs ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ExpensesSummaryCard({
  todayStats,
  dark,
}: {
  todayStats: TodayStats | null;
  dark?: boolean;
}) {
  const cardCls = dark
    ? "bg-white rounded-[20px] p-6 flex flex-col gap-3"
    : "bg-white border border-slate-100 rounded-[20px] p-6 flex flex-col gap-3 shadow-sm";

  return (
    <div className={cardCls}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-[8px] bg-rose-50 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-rose-500" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
          Today's Total Expenses
        </span>
      </div>
      <div>
        <p className="text-[28px] font-black text-rose-500 leading-none font-figtree">
          RWF {fmt(todayStats?.today_cogs ?? 0)}
        </p>
        <p className="text-[12px] font-medium text-slate-400 mt-1">
          Cost of goods sold today
        </p>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            Operational Cost
          </span>
          <span className="text-[11px] font-medium text-slate-300 italic">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ready to Review checklist
// ---------------------------------------------------------------------------
function ReadyToReviewChecklist({
  closingState,
  stockCountDone,
  showStockCount,
  setShowStockCount,
  router,
}: {
  closingState: ClosingState;
  stockCountDone: boolean;
  showStockCount: boolean;
  setShowStockCount: (v: boolean | ((p: boolean) => boolean)) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const rows = [
    {
      id: "stock",
      icon: ClipboardCheck,
      label: "Complete Daily Stock Count",
      optional: true,
      done: stockCountDone,
      onEdit: () => setShowStockCount((v) => !v),
    },
    {
      id: "sales",
      icon: BarChart2,
      label: "Review Sales Summary",
      optional: false,
      done: true,
      onEdit: () => router.push("/dashboard/sales"),
    },
    {
      id: "expenses",
      icon: Calendar,
      label: "Review Expenses Summary",
      optional: false,
      done: true,
      onEdit: () => {},
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-[20px] overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <p className="text-[13px] font-black text-[#1E293B] uppercase tracking-wide">
          Ready to Review
        </p>
      </div>
      <div className="divide-y divide-slate-50">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-[10px] bg-indigo-50 border border-indigo-100/80 flex items-center justify-center shrink-0">
              <row.icon className="h-4.5 w-4.5 text-[#3B59DA]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-bold text-[#1E293B]">{row.label}</span>
                {row.optional && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
                    OPTIONAL
                  </span>
                )}
              </div>
            </div>
            {row.done ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold shrink-0">
                <CheckCircle2 className="h-3 w-3" /> Done
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold shrink-0">
                <Circle className="h-3 w-3" /> Pending
              </span>
            )}
            <button
              onClick={row.onEdit}
              className="flex items-center gap-1 h-9 px-4 rounded-[8px] border border-slate-200 text-[13px] font-bold text-slate-600 hover:border-[#3B59DA] hover:text-[#3B59DA] transition-all shrink-0 bg-white shadow-sm"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared two-column layout (Screens 1 & 3)
// ---------------------------------------------------------------------------
interface TwoColumnProps {
  todayStats: TodayStats | null;
  closingState: ClosingState;
  stockCountDone: boolean;
  showStockCount: boolean;
  setShowStockCount: (v: boolean | ((p: boolean) => boolean)) => void;
  sortedItems: InventoryItem[];
  search: string;
  setSearch: (v: string) => void;
  verifiedItemIds: Set<string>;
  closingCounts: Record<string, number>;
  handleCountChange: (id: string, v: number) => void;
  handleVerifyItem: (id: string) => void;
  handleEditCount: (item: InventoryItem) => void;
  handleSaveDraft: () => void;
  progressCount: number;
  totalCount: number;
  router: ReturnType<typeof useRouter>;
}

function TwoColumnLayout({
  children,
  todayStats,
  closingState,
  stockCountDone,
  showStockCount,
  setShowStockCount,
  sortedItems,
  search,
  setSearch,
  verifiedItemIds,
  closingCounts,
  handleCountChange,
  handleVerifyItem,
  handleEditCount,
  handleSaveDraft,
  progressCount,
  totalCount,
  router,
  cta,
}: TwoColumnProps & { children?: React.ReactNode; cta: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left — motivational card */}
        <div className="bg-white border border-slate-100 rounded-[20px] p-8 flex flex-col items-center justify-center text-center gap-6 shadow-sm lg:w-[340px] xl:w-[380px] shrink-0 min-h-[480px]">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-32 w-32 rounded-full bg-emerald-400/15 animate-pulse" />
            <div className="absolute h-24 w-24 rounded-full bg-emerald-400/20" />
            <div className="relative h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_60px_20px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="h-10 w-10 text-white stroke-[2.5px]" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-[28px] md:text-[32px] font-black text-[#1E293B] leading-tight font-figtree">
              You ran a good<br />operation{" "}
              <span className="text-[#3B59DA]">today.</span>
            </h2>
            <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-[260px] mx-auto">
              Here's how the day adds up. Review and close when you're ready.
            </p>
          </div>
          {children}
        </div>

        {/* Right — financial + checklist */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* NET DAILY BALANCE hero */}
          <div className="bg-gradient-to-br from-[#1E3A8A] via-[#3B59DA] to-[#1E3A8A] rounded-[20px] p-7 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">
              Net Daily Balance
            </p>
            <p className="text-[40px] md:text-[48px] font-black leading-none font-figtree">
              RWF {fmt(todayStats?.today_gross_profit ?? 0)}
            </p>
            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 w-fit">
              <TrendingUp className="h-3.5 w-3.5 opacity-80" />
              <span className="text-[12px] font-bold opacity-80">
                Revenue minus cost of goods
              </span>
            </div>
          </div>

          {/* Sales + Expenses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SalesSummaryCard todayStats={todayStats} />
            <ExpensesSummaryCard todayStats={todayStats} />
          </div>

          {/* Checklist */}
          <ReadyToReviewChecklist
            closingState={closingState}
            stockCountDone={stockCountDone}
            showStockCount={showStockCount}
            setShowStockCount={setShowStockCount}
            router={router}
          />

          {/* Amber notice */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200/80 rounded-[12px] p-4">
            <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium text-amber-700 leading-relaxed">
              Forgot something? You have 24 hours after closing to log entries.
              They'll be marked as late but counted in today's record.
            </p>
          </div>

          {/* CTA */}
          {cta}
        </div>
      </div>

      {/* Inline stock count — toggleable */}
      {showStockCount && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-[20px] p-6 md:p-8 space-y-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-black text-[#1E293B] font-figtree">
              Daily Stock Count
            </h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="h-10 px-5 rounded-[8px] border-indigo-100 font-bold text-[#3B59DA] hover:bg-indigo-50 text-[13px] font-figtree"
              >
                Save Draft
              </Button>
            </div>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search items..."
              className="pl-12 h-[48px] border-slate-200 rounded-[8px] bg-slate-50/50 text-sm font-semibold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            {sortedItems.length === 0 ? (
              <p className="text-[14px] text-slate-400 font-medium py-6 text-center">
                No items match your search.
              </p>
            ) : (
              sortedItems.map((item) => (
                <ClosingCountRow
                  key={item.id}
                  item={item}
                  onEdit={handleEditCount}
                  onVerify={handleVerifyItem}
                  isVerified={verifiedItemIds.has(item.id)}
                  physicalCount={closingCounts[item.id] ?? item.currentStock}
                  onCountChange={handleCountChange}
                />
              ))
            )}
          </div>
          <p className="text-[12px] font-bold text-slate-400 text-center">
            {progressCount} / {totalCount} items verified
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen 1 — INCOMPLETE
// ---------------------------------------------------------------------------
function IncompleteScreen(props: TwoColumnProps) {
  return (
    <TwoColumnLayout
      {...props}
      cta={
        <Button
          disabled
          className="w-full h-14 bg-slate-100 text-slate-400 rounded-[12px] font-black text-[15px] cursor-not-allowed border-none"
        >
          Complete all checks to close
        </Button>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Screen 3 — CHECKLIST_COMPLETE_KITCHEN_OPEN / READY_TO_CLOSE
// ---------------------------------------------------------------------------
function ChecklistCompleteScreen(
  props: TwoColumnProps & { onWrapUp: () => void; isSubmitting: boolean }
) {
  return (
    <TwoColumnLayout
      {...props}
      cta={
        <Button
          onClick={props.onWrapUp}
          disabled={props.isSubmitting}
          className="w-full h-14 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[12px] font-black text-[15px] shadow-[0_8px_24px_rgba(59,89,218,0.25)] gap-3 active:scale-[0.98] transition-all font-figtree"
        >
          {props.isSubmitting ? (
            <>
              <Loader2Icon className="h-5 w-5 animate-spin" /> Closing…
            </>
          ) : (
            "That's a wrap — close today"
          )}
        </Button>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Screen 2 — Closed success
// ---------------------------------------------------------------------------
function ClosedSuccessScreen({
  todayStats,
  orgSettings,
  activeBrandName,
  router,
  toast,
}: {
  todayStats: TodayStats | null;
  orgSettings: OrgSettings | null;
  activeBrandName?: string;
  router: ReturnType<typeof useRouter>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const displayName = orgSettings?.name ?? activeBrandName ?? "Your Restaurant";
  const openingTime = orgSettings?.opening_time ?? "07:00 AM";

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-[#0B1437] via-[#162660] to-[#0B1437] rounded-[24px] p-6 md:p-8 flex flex-col gap-5">
      {/* Two-column */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1">
        {/* Left white card */}
        <div className="bg-white rounded-[20px] p-7 flex flex-col gap-5 lg:w-[320px] xl:w-[360px] shrink-0">
          <div>
            <h3 className="text-[20px] font-black text-[#1E293B] font-figtree">{displayName}</h3>
            <p className="text-[14px] font-bold text-slate-600 mt-1">{formatClosedDate()}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {orgSettings?.city && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {orgSettings.city}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-500">
                <Clock className="h-3 w-3" />
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Glowing checkmark */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="relative">
              <div className="absolute h-28 w-28 rounded-full bg-emerald-400/20 animate-pulse top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_60px_24px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="h-10 w-10 text-white stroke-[2.5px]" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[26px] font-black text-[#1E293B] leading-tight font-figtree">
              Kitchen Closed<br />Successfully!
            </h2>
            <p className="text-[13px] font-medium text-slate-500 mt-2 leading-relaxed">
              You have completed reviewing your sales and expenses data for today
              and are closed for the day.
            </p>
          </div>
        </div>

        {/* Right — white cards on blue bg */}
        <div className="flex-1 flex flex-col gap-4">
          <SalesSummaryCard todayStats={todayStats} dark />
          <ExpensesSummaryCard todayStats={todayStats} dark />
        </div>
      </div>

      {/* Amber notice */}
      <div className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/20 rounded-[14px] px-5 py-4">
        <Clock className="h-4 w-4 text-amber-400 shrink-0" />
        <p className="text-[13px] font-bold text-amber-300">
          {displayName} will reopen at {openingTime} tomorrow for service.
        </p>
      </div>

      {/* Bottom buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => router.push("/dashboard")}
          className="flex-1 h-14 bg-white text-[#1E293B] hover:bg-slate-50 rounded-[12px] font-bold gap-2 text-[15px]"
        >
          <Home className="h-4 w-4" /> Return to Home
        </Button>
        <Button
          onClick={() =>
            toast({ title: "Coming soon", description: "Report download will be available shortly." })
          }
          variant="outline"
          className="flex-1 h-14 border-white/20 text-white hover:bg-white/10 rounded-[12px] font-bold gap-2 text-[15px]"
        >
          <Download className="h-4 w-4" /> Download Report
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stock count row (reused from original)
// ---------------------------------------------------------------------------
function ClosingCountRow({
  item,
  onEdit,
  onVerify,
  isVerified,
  physicalCount,
  onCountChange,
}: {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onVerify: (id: string) => void;
  isVerified: boolean;
  physicalCount: number;
  onCountChange: (itemId: string, value: number) => void;
}) {
  return (
    <UnifiedListRow className="p-4 md:p-5 transition-all hover:bg-[#F8FAFF]">
      <div className="flex flex-col xl:flex-row xl:items-center gap-6 justify-between w-full">
        <div className="flex items-center gap-5 w-full xl:w-auto min-w-[280px]">
          <div className="h-16 w-16 rounded-full border border-slate-100 bg-white shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-7 w-7 text-slate-300" />
            )}
          </div>
          <div className="space-y-1 overflow-hidden">
            <InriaHeading className="text-[18px] font-bold truncate text-[#1E293B]">
              {item.name}
            </InriaHeading>
            <FigtreeText className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Opening: <span className="text-[#1E293B]">{item.currentStock} {item.unit}</span>
            </FigtreeText>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-5 items-center xl:border-l border-slate-50 xl:pl-6">
          <div className="space-y-1">
            <FigtreeText className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Today's Wastage
            </FigtreeText>
            <p className="text-[17px] font-black text-[#1E293B] font-figtree tabular-nums">
              0.00 <span className="text-[12px] font-bold text-slate-300">{item.unit}</span>
            </p>
          </div>
          <div className="space-y-1">
            <FigtreeText className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Total Consumption
            </FigtreeText>
            <p className="text-[17px] font-black text-[#1E293B] font-figtree tabular-nums">
              0.00 <span className="text-[12px] font-bold text-slate-300">{item.unit}</span>
            </p>
          </div>
          <div className="flex flex-col space-y-1">
            <FigtreeText className="text-[10px] font-black text-[#3B59DA] uppercase tracking-[0.15em]">
              Physical Count
            </FigtreeText>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step="any"
                value={physicalCount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) onCountChange(item.id, val);
                }}
                className="w-24 h-9 text-[16px] font-black text-[#3B59DA] font-figtree tabular-nums border-[#3B59DA]/20 bg-indigo-50/30 rounded-[8px] px-3"
              />
              <span className="text-[12px] font-bold text-[#3B59DA]/40 uppercase">
                {item.unit}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 border-t xl:border-t-0 pt-4 xl:pt-0 xl:border-l border-slate-50 xl:pl-6">
          <Button
            variant="outline"
            onClick={() => onEdit(item)}
            className="h-10 px-4 rounded-[8px] border-slate-200 font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] text-[13px] flex-1 xl:flex-none bg-white"
          >
            Edit
          </Button>
          <Button
            onClick={() => onVerify(item.id)}
            className={cn(
              "h-10 px-6 rounded-[8px] font-black text-[13px] flex-1 xl:flex-none min-w-[120px] active:scale-95 transition-all border-none",
              isVerified
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-[#3B59DA] hover:bg-[#2D46B2] text-white"
            )}
          >
            {isVerified ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
              </span>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </div>
    </UnifiedListRow>
  );
}

// ---------------------------------------------------------------------------
// Locked card (unchanged logic)
// ---------------------------------------------------------------------------
function ClosingLockedCard({ lifecycle }: { lifecycle: any }) {
  const { currentTime, targetClosingTime, isClosingTimeReached, startClosing, isClosed, isOpen } =
    lifecycle;

  return (
    <PrimarySurfaceCard className="w-full max-w-[680px] mx-auto p-6 md:p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 bg-white rounded-[20px] shadow-[0_32px_120px_rgba(15,23,42,0.08)]">
      <div className="h-14 w-14 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 shadow-sm">
        <Lock className="h-7 w-7 text-slate-400 stroke-[2px]" />
      </div>

      <div className="text-center space-y-2 mb-6">
        <h2 className="text-[24px] md:text-[28px] font-bold text-[#1E293B] font-figtree uppercase tracking-tight">
          {isClosed ? "Day is Closed" : isClosingTimeReached && isOpen ? "Closing is Ready" : "Closing Locked"}
        </h2>
        <FigtreeText className="text-[14px] text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
          {isClosed
            ? "The operations day has ended and reports have been finalized."
            : isClosingTimeReached && isOpen
            ? "The operations day has ended. You can now start the final stock reconciliation."
            : "The closing workflow is not yet available. Ensure all daily prerequisites are met."}
        </FigtreeText>
      </div>

      <div className="w-full bg-white border border-slate-100 rounded-[12px] p-5 space-y-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <FigtreeText className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Requirements
          </FigtreeText>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex gap-4 items-center">
            <div className="h-10 w-10 bg-emerald-50 rounded-[8px] flex items-center justify-center border border-emerald-100 shrink-0">
              <ClipboardCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1E293B] font-figtree">Complete Daily Stock Count</h3>
              <FigtreeText className="text-[12px] text-slate-400 font-medium">Requirement met at opening</FigtreeText>
            </div>
          </div>
          <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex gap-4 items-center">
            <div className={cn(
              "h-10 w-10 rounded-[8px] flex items-center justify-center border shrink-0",
              isClosingTimeReached ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
            )}>
              <Clock className={cn("h-4 w-4", isClosingTimeReached ? "text-emerald-500" : "text-slate-400")} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1E293B] font-figtree">Wait until {targetClosingTime}</h3>
              <FigtreeText className="text-[12px] text-slate-400 font-medium">Currently {currentTime}</FigtreeText>
            </div>
          </div>
          {isClosingTimeReached && isOpen ? (
            <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
          ) : (
            <div className="h-7 w-7 rounded-full border-2 border-slate-100 shrink-0" />
          )}
        </div>

        <div className="p-3 bg-slate-50 rounded-[8px] flex gap-3 items-center border border-slate-100">
          <div className="h-9 w-9 bg-white rounded-[6px] flex items-center justify-center shrink-0 shadow-sm">
            <Info className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <FigtreeText className="text-[13px] font-bold text-[#1E293B]">Store Management</FigtreeText>
            <FigtreeText className="text-[12px] text-slate-500 font-medium leading-relaxed">
              Closing hours can be adjusted by admins in Settings.
            </FigtreeText>
          </div>
        </div>
      </div>

      <Button
        onClick={startClosing}
        disabled={!isClosingTimeReached || isClosed || !isOpen}
        className={cn(
          "w-full h-13 rounded-[10px] font-bold text-[15px] transition-all font-figtree",
          isClosingTimeReached && isOpen && !isClosed
            ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-[0_20px_40px_-15px_rgba(59,89,218,0.3)] border-none"
            : "bg-slate-100 text-slate-400 border-none cursor-not-allowed"
        )}
      >
        {isClosed ? "Day is Closed" : isClosingTimeReached && isOpen ? "Start Final Stock Count" : "Closing Unavailable"}
      </Button>
    </PrimarySurfaceCard>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function ClosingSkeleton() {
  return (
    <div className="p-8 space-y-8 min-h-screen bg-white font-figtree">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <div className="flex gap-6">
        <Skeleton className="h-[480px] w-[360px] rounded-[20px]" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-[140px] w-full rounded-[20px]" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[140px] rounded-[20px]" />
            <Skeleton className="h-[140px] rounded-[20px]" />
          </div>
          <Skeleton className="h-[200px] rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}
