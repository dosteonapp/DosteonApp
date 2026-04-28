"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ArrowRight,
  CheckCircle2,
  X,
  ArrowLeft,
  Search as SearchIcon,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { OpeningStockItem } from "@/mocks/openingStock.mock";
import { useToast } from "@/hooks/use-toast";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReviewOpeningChecklist } from "@/components/day/ReviewOpeningChecklist";
import { 
    UnifiedHeroSurface, 
    UnifiedStatCard, 
    AppContainer, 
    InriaHeading, 
    FigtreeText,
    UnifiedListRow,
    UnifiedModal,
    PrimarySurfaceCard
} from "@/components/ui/dosteon-ui";

export default function DailyStockCountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { status, canStartOpening, openingAvailableAt, isOpen } = useRestaurantDayLifecycle();

  // Day already open — opening stock is no longer relevant
  useEffect(() => {
    if (isOpen) {
      router.replace("/dashboard/inventory");
    }
  }, [isOpen, router]);
  const [items, setItems] = useState<OpeningStockItem[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [editingItem, setEditingItem] = useState<OpeningStockItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Keep the countdown live — update every second while gap is active
  useEffect(() => {
    if (canStartOpening) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [canStartOpening]);

  const timeUntilOpen = useMemo(() => {
    if (!openingAvailableAt || canStartOpening) return null;
    const diff = new Date(openingAvailableAt).getTime() - now.getTime();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }, [openingAvailableAt, canStartOpening, now]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await restaurantOpsService.getOpeningChecklistItems();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch opening items:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Resume from draft
  useEffect(() => {
    if (status?.metadata?.draft_confirmed_ids && items.length > 0) {
        const draftIds = status.metadata.draft_confirmed_ids;
        setConfirmedIds(new Set(draftIds));
    }
  }, [status?.metadata?.draft_confirmed_ids, items.length]);

  const handleConfirm = (id: string) => {
    setConfirmedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
    
    setItems(current => current.map(item => 
        item.id === id ? { ...item, isConfirmed: !confirmedIds.has(id) } : item
    ));
  };

  const handleEditAmount = (item: OpeningStockItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleUpdateItem = (updatedItem: OpeningStockItem) => {
    setItems(current => current.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditModalOpen(false);
    toast({
        title: "Item Updated",
        description: `${updatedItem.name} inventory has been adjusted.`
    });
  };

  const handleSaveDraft = async () => {
    try {
        await restaurantOpsService.saveOpeningChecklistDraft({ 
            confirmedIds: Array.from(confirmedIds),
            counts: items.reduce((acc, item) => ({ ...acc, [item.id]: item.todayOpening }), {})
        });
        toast({
            title: "Draft Saved",
            description: "Your progress has been saved to the server."
        });
    } catch (err) {
        toast({
            title: "Error Saving",
            description: "Failed to persist draft. Please try again.",
            variant: "destructive"
        });
    }
  };

  const handleComplete = async () => {
    if (confirmedIds.size < items.length) {
      toast({
        title: "Checklist Incomplete",
        description: `Please confirm all ${items.length} items before finishing.`,
        variant: "destructive"
      });
      return;
    }
    setShowReview(true);
  };

  const progressCount = confirmedIds.size;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((progressCount / totalCount) * 100) : 0;

    if (isLoading) return <OpeningSkeleton />;

  // 6-hour gap — show a waiting screen until opening becomes available
  if (!canStartOpening) {
    const readableTime = openingAvailableAt
      ? new Date(openingAvailableAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : null;
    return (
      <AppContainer>
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-10 px-6 rounded-[8px] border-slate-200 bg-white text-slate-600 hover:text-[#3B59DA] font-semibold gap-2 transition-all shadow-sm active:scale-95 font-figtree"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8 px-4">
          <div className="h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <Clock className="h-12 w-12 text-[#3B59DA]" />
          </div>
          <div className="space-y-3 max-w-md">
            <h2 className="text-[28px] font-bold text-[#1E293B] tracking-tight font-figtree">
              Opening Not Available Yet
            </h2>
            <p className="text-slate-500 font-medium text-[15px] leading-relaxed font-figtree">
              A 6-hour rest period is required between closing and the next opening.
              {readableTime && (
                <> Opening Stock will be available at <span className="font-bold text-[#3B59DA]">{readableTime}</span>.</>
              )}
            </p>
          </div>
          {timeUntilOpen && (
            <div className="bg-[#f5f6ff] border border-[#98a6f9] rounded-[16px] px-10 py-6 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 font-figtree">Opens in</p>
              <p className="text-[40px] font-black text-[#3B59DA] font-figtree tabular-nums leading-none">
                {timeUntilOpen}
              </p>
            </div>
          )}
        </div>
      </AppContainer>
    );
  }

  // Dynamic Sorting: Unconfirmed items at top, confirmed at bottom
  const sortedItems = [...items].sort((a, b) => {
    const aConf = confirmedIds.has(a.id);
    const bConf = confirmedIds.has(b.id);
    if (aConf === bConf) return 0;
    return aConf ? 1 : -1;
  });

  return (
    <AppContainer className="pb-48">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="h-10 px-6 rounded-[8px] border-slate-200 bg-white text-slate-600 hover:text-[#3B59DA] font-semibold gap-2 transition-all shadow-sm active:scale-95 font-figtree"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

            {/* Main Content Container */}
      <div className={cn(
        "relative flex flex-col gap-4 px-0 transition-all duration-500 w-full",
        showReview && "blur-2xl scale-[0.98] pointer-events-none"
      )}>

                {/* Removed the yellow 'Day locked' banner to keep the layout clean and aligned with the premium design. */}

        {/* Hero Box */}
        <div className="bg-[#EEF2FF] rounded-[12px] border border-blue-100 shadow-sm px-8 py-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left — badge + title + description */}
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-2 bg-white border border-black/15 rounded-full px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[13px] font-semibold text-[#1E293B] font-figtree">Opening in Progress</span>
              </div>
              <h1 className="text-[26px] md:text-[30px] font-semibold text-[#1E293B] tracking-tight leading-tight font-figtree">
                Count today's opening stock
              </h1>
              <p className="text-slate-500 font-medium text-[14px] leading-relaxed font-figtree max-w-lg">
                Daily stock count for {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}. Prep must be completed before live service.
              </p>
            </div>

            {/* Right — three stat cards */}
            <div className="flex items-stretch gap-3 w-full lg:w-[560px] lg:shrink-0">
              <HeroStatCard
                label="Progress"
                value={`${progressCount} / ${totalCount}`}
                sub="Products counted so far"
                color="blue"
              />
              <HeroStatCard
                label="Pending"
                value={String(totalCount - progressCount)}
                sub="Products needing counting"
                color="yellow"
              />
              <HeroStatCard
                label="Counted"
                value={String(progressCount)}
                sub="Products counted"
                color="green"
              />
            </div>
          </div>
        </div>

        {/* Items List Card */}
        <PrimarySurfaceCard className="border-black/5 shadow-sm p-4 md:p-8 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search items..."
                        className="pl-11 h-11 border-slate-200 rounded-[8px] bg-white placeholder:text-slate-400 font-medium text-[14px] font-figtree"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11 border-slate-200 rounded-[8px] w-full sm:w-[180px] bg-white text-slate-600 font-medium text-[14px] font-figtree">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="fresh">Fresh Products</SelectItem>
                            <SelectItem value="dry">Dry Stock</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11 border-slate-200 rounded-[8px] w-full sm:w-[180px] bg-white text-slate-600 font-medium text-[14px] font-figtree">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                {sortedItems.map((item, idx) => (
                    <StockRow
                        key={item.id}
                        item={item}
                        isConfirmed={confirmedIds.has(item.id)}
                        onConfirm={() => handleConfirm(item.id)}
                        onEdit={() => handleEditAmount(item)}
                        idx={idx}
                    />
                ))}
            </div>
        </PrimarySurfaceCard>
      </div>

      {/* Sticky Bottom Bar */}
      <div
        className="fixed bottom-0 right-0 left-0 md:left-[var(--sidebar-width)] z-[60] px-4 sm:px-8 py-5 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-20px_60px_rgba(0,0,0,0.05)] transition-[left] duration-500"
      >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full flex items-center justify-between gap-3 sm:gap-4"
          >
              {/* Left — circular progress + count info */}
              <div className="flex items-center gap-4 shrink-0">
                <CircularProgress percentage={progressPercent} />
                <div className="hidden sm:block space-y-0.5">
                  <p className="text-[15px] font-bold text-[#1E293B] font-figtree leading-tight">
                    {progressCount} of {totalCount} Items Counted
                  </p>
                  <p className="text-[12px] text-slate-400 font-medium font-figtree leading-tight">
                    {totalCount - progressCount > 0
                      ? `${totalCount - progressCount} item${totalCount - progressCount !== 1 ? "s" : ""} still need counting`
                      : "All items counted — ready to complete!"}
                  </p>
                </div>
              </div>

              {/* Right — save + complete */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                    variant="outline"
                    className="h-12 px-6 sm:px-10 rounded-[8px] border-[#3B59DA] text-[#3B59DA] hover:bg-indigo-50 font-semibold transition-all text-[14px] sm:text-[15px] shadow-sm font-figtree active:scale-95"
                    onClick={handleSaveDraft}
                >
                    Save draft
                </Button>
                <Button
                    className={cn(
                        "h-12 px-8 sm:px-12 rounded-[8px] font-black gap-3 transition-all border-none text-[14px] sm:text-[16px] shadow-xl flex items-center active:scale-95",
                        confirmedIds.size >= items.length && items.length > 0
                            ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-indigo-900/20"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                    disabled={confirmedIds.size < items.length || items.length === 0}
                    onClick={handleComplete}
                >
                    Review & Complete Opening
                    <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
          </motion.div>
      </div>

      {/* Overlay Modals */}
      <AnimatePresence>
        {showReview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                <ReviewOpeningChecklist 
                    items={items}
                    onBack={() => setShowReview(false)} 
                    onConfirm={() => router.push("/dashboard")}
                />
            </div>
        )}
      </AnimatePresence>

      <UpdateItemModal 
        isOpen={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        item={editingItem} 
        onUpdate={handleUpdateItem}
      />
    </AppContainer>
  );
}

function HeroStatCard({ label, value, sub, color }: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "yellow" | "green";
}) {
  const colorMap = {
    blue:   { bg: "bg-white", border: "border-blue-300",   labelBg: "bg-blue-50",   labelText: "text-blue-600",   dot: "bg-blue-500"   },
    yellow: { bg: "bg-white", border: "border-yellow-300", labelBg: "bg-yellow-50", labelText: "text-yellow-600", dot: "bg-yellow-500" },
    green:  { bg: "bg-white", border: "border-emerald-300",labelBg: "bg-emerald-50",labelText: "text-emerald-600",dot: "bg-emerald-500" },
  };
  const c = colorMap[color];
  return (
    <div className={cn("flex flex-col justify-between gap-2 rounded-[10px] border px-4 py-3 flex-1 w-0 min-w-0", c.bg, c.border)}>
      <div className={cn("inline-flex items-center gap-1.5 self-start rounded-full px-2 py-1", c.labelBg)}>
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.dot)} />
        <span className={cn("text-[10px] font-bold uppercase tracking-widest font-figtree", c.labelText)}>{label}</span>
      </div>
      <p className="text-[20px] font-semibold leading-none font-figtree text-[#1E293B]">{value}</p>
      <p className="text-[11px] text-slate-400 font-medium font-figtree leading-tight">{sub}</p>
    </div>
  );
}

function StockRow({ item, isConfirmed, onConfirm, onEdit, idx }: {
    item: OpeningStockItem,
    isConfirmed: boolean,
    onConfirm: () => void,
    onEdit: () => void,
    idx: number
}) {
    return (
        <UnifiedListRow 
            className={cn(
                "transition-all p-4 md:p-8",
                isConfirmed && "bg-[#F8FAFF] border-blue-100/30 shadow-none ring-1 ring-blue-50/50"
            )}
        >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 justify-between w-full">
                {/* Product Info */}
                <div className="flex items-center gap-8 flex-1 min-w-[280px]">
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-sm transition-transform group-hover:scale-105">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                            <Package className="h-10 w-10 text-slate-200" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-[18px] md:text-[20px] font-bold text-[#1E293B] font-figtree leading-tight group-hover:text-[#3B59DA] transition-colors">{item.name}</h3>
                        <p className="text-[13px] font-medium text-slate-400 font-figtree">Yesterday's Closing: {item.yesterdayClosing} {item.unit}</p>
                    </div>
                </div>

                {/* Metrics with Vertical Lines */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-14 flex-[2] relative overflow-hidden">
                    <div className="space-y-2 md:pl-10 lg:border-l border-slate-200">
                        <FigtreeText className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] leading-none">Today's Opening</FigtreeText>
                        <p className="text-[18px] md:text-[20px] font-bold text-[#1E293B] font-figtree leading-none">{item.todayOpening ?? '--'} units</p>
                    </div>
                    <div className="space-y-2 md:pl-10 border-l border-slate-200">
                        <FigtreeText className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] leading-none">Amount Added Today</FigtreeText>
                        <p className="text-[18px] md:text-[20px] font-bold text-[#1E293B] font-figtree leading-none">{item.amountAddedToday ?? 0} {item.unit}</p>
                    </div>
                    <div className="space-y-2 md:pl-10 border-l border-slate-200 col-span-2 md:col-span-1">
                        <FigtreeText className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.1em] leading-none">Total Opening Stock:</FigtreeText>
                        <p className="text-[18px] md:text-[20px] font-black text-[#3B59DA] font-figtree leading-none">{item.totalOpening ?? item.todayOpening ?? '--'} {item.unit}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
                    <Button
                        variant="outline"
                        className="h-14 px-8 rounded-[8px] border-slate-200 font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all text-[15px] flex-1 lg:flex-none font-figtree bg-white shadow-sm"
                        onClick={onEdit}
                    >
                        Edit Amount Added
                    </Button>
                    <Button
                        className={cn(
                            "h-14 px-10 rounded-[8px] font-black transition-all flex-1 lg:flex-none min-w-[140px] font-figtree text-[15px] border-none",
                            isConfirmed
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-lg shadow-indigo-900/10"
                        )}
                        onClick={onConfirm}
                    >
                        {isConfirmed ? (
                            <span className="flex items-center gap-2">Confirmed <CheckCircle2 className="h-4 w-4" /></span>
                        ) : "Confirm"}
                    </Button>
                </div>
            </div>
        </UnifiedListRow>
    );
}

function UpdateItemModal({ isOpen, onClose, item, onUpdate }: { 
    isOpen: boolean, 
    onClose: () => void, 
    item: OpeningStockItem | null,
    onUpdate: (item: OpeningStockItem) => void
}) {
    const [incoming, setIncoming] = useState("");
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (item) {
            setIncoming(String(item.amountAddedToday || ""));
            setTotal(item.totalOpening ?? item.todayOpening ?? item.yesterdayClosing ?? 0);
        }
    }, [item, isOpen]);

    const handleIncomingChange = (val: string) => {
        setIncoming(val);
        const added = parseFloat(val) || 0;
        const base = item?.todayOpening ?? 0;
        setTotal(base + added);
    };

    if (!item) return null;

    return (
        <UnifiedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Item"
            subtitle={<>Manually adjust the inventory level for <b>Dosteon Restaurant</b></>}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="h-16 px-12 rounded-[8px] font-bold text-slate-500 hover:bg-slate-50 text-lg flex-1 font-figtree active:scale-95 transition-all shadow-md">
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => onUpdate({
                            ...item,
                            amountAddedToday: parseFloat(incoming) || 0,
                            totalOpening: total,
                            todayOpening: item.todayOpening ?? item.yesterdayClosing
                        })} 
                        className="h-16 px-16 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black text-[19px] shadow-2xl shadow-indigo-900/10 border-none flex-[2] font-figtree active:scale-95 transition-all"
                    >
                        Confirm Update
                    </Button>
                </>
            }
        >
            <div className="space-y-10">
                {/* Item Preview Card */}
                <div className="bg-white border border-slate-100 rounded-[10px] p-8 flex items-center justify-between shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center gap-8">
                        <div className="h-32 w-32 rounded-[8px] overflow-hidden border border-slate-50 bg-white shrink-0 shadow-lg transition-transform group-hover:scale-105 duration-500">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-100">
                                    <Package className="h-14 w-14" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[28px] font-bold text-[#1E293B] tracking-tight font-figtree group-hover:text-[#3B59DA] transition-colors">{item.name}</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest font-figtree leading-none">SKU ID: {item.id}</span>
                                <span className="text-slate-200 text-xs font-bold leading-none">•</span>
                                <Badge variant="outline" className="text-slate-500 font-bold text-[11px] px-4 py-1.5 rounded-xl border-slate-200 shadow-none font-figtree uppercase tracking-widest leading-none">
                                    {item.category}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                         <FigtreeText className="text-[13px] font-bold text-slate-300 uppercase tracking-widest font-figtree mb-2">Current Quantity</FigtreeText>
                         <p className="text-[36px] font-black text-[#1E293B] tracking-tighter leading-none font-figtree tabular-nums">{item.yesterdayClosing} <span className="text-[20px] font-bold text-slate-400 ml-1">kg</span></p>
                    </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold uppercase tracking-widest ml-1 leading-none">Incoming Quantity</FigtreeText>
                        <Input
                            type="number"
                            value={incoming}
                            onChange={(e) => handleIncomingChange(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder={`24 kg`}
                            className="h-[72px] text-[24px] font-bold border-slate-200 bg-white rounded-[8px] px-8 focus:ring-[#3B59DA]/10 focus:border-[#3B59DA] text-[#1E293B] font-figtree transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold text-[#10B981] uppercase tracking-widest ml-1 leading-none">New Quantity</FigtreeText>
                        <div className="relative">
                            <Input 
                                readOnly
                                value={`${total} kg`} 
                                className="h-[72px] text-[24px] font-bold border-[#10B981] bg-white rounded-[8px] px-8 text-[#10B981] font-figtree shadow-sm border-2" 
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#ECFDF5] flex items-center justify-center border border-[#D1FAE5]">
                                <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Info */}
                <div className="bg-[#F5F8FF] border border-blue-200 border-dashed rounded-[8px] p-6 flex items-center gap-6 text-[#3B59DA] font-bold text-[18px] shadow-sm font-figtree relative overflow-hidden group/info">
                    <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover/info:opacity-100 transition-opacity duration-500" />
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center border border-blue-100 shadow-md shrink-0 relative z-10">
                        <ArrowRight className="h-6 w-6 text-[#3B59DA]" />
                    </div>
                    <p className="relative z-10 leading-relaxed">Stock will update from <span className="text-slate-400">{item.yesterdayClosing} kg</span> to <span className="text-[#3B59DA] underline decoration-2 underline-offset-4 decoration-blue-200 font-black">{total} kg</span></p>
                </div>
            </div>
        </UnifiedModal>
    );
}

function CircularProgress({ percentage }: { percentage: number }) {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative h-[80px] w-[80px] flex items-center justify-center shrink-0">
            <svg className="h-[80px] w-[80px] -rotate-90">
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth="6"
                    fill="transparent"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#3B59DA"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_4px_rgba(59,89,218,0.2)]"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[20px] font-bold text-[#1E293B] leading-none font-figtree">{percentage}%</p>
            </div>
        </div>
    );
}

function OpeningSkeleton() {
    return (
        <div className="p-4 sm:p-6 md:p-10 space-y-8 min-h-screen">
            <Skeleton className="h-10 w-24 rounded-[8px]" />
            <Skeleton className="h-[260px] w-full rounded-[10px]" />
            <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded-[8px]" />
                <Skeleton className="h-28 w-full rounded-[8px]" />
                <Skeleton className="h-28 w-full rounded-[8px]" />
            </div>
        </div>
    );
}
