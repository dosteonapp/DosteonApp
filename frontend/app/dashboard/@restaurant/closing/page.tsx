"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Search,
  ChevronDown,
  Trash2,
  ChevronRight,
  ClipboardCheck, 
  Clock,
  Bell,
  Utensils,
  Circle,
  Info,
  Activity,
  Package,
  AlertTriangle,
  History,
  TrendingDown,
  Plus,
  Droplets,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { restaurantOpsService, InventoryItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ReviewClosingChecklistModal } from "@/components/kitchen/ReviewClosingChecklistModal";
import { InventoryUpdateItemModal } from "@/components/inventory/InventoryUpdateItemModal";
import { motion, AnimatePresence } from "framer-motion";
import {
    UnifiedHeroSurface,
    UnifiedStatCard,
    UnifiedErrorBanner,
    AppContainer,
    InriaHeading,
    FigtreeText,
    UnifiedListRow,
    PrimarySurfaceCard
} from "@/components/ui/dosteon-ui";
import { BrandSwitcherCard } from "@/components/BrandSwitcherCard";

export default function ClosingPage() {
  const lifecycle = useRestaurantDayLifecycle();
  const { isOpen, isClosing, isClosed, status } = lifecycle;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [closingIndicators, setClosingIndicators] = useState({ itemsUsed: 0, itemsWasted: 0 });
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [verifiedItemIds, setVerifiedItemIds] = useState<Set<string>>(new Set());
  const [closingCounts, setClosingCounts] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);

  const handleCountChange = (itemId: string, value: number) => {
    setClosingCounts(prev => ({ ...prev, [itemId]: value }));
  };

  const handleEditCount = (item: InventoryItem) => {
    setSelectedItemForEdit(item);
    setIsEditModalOpen(true);
  };

  const handleVerifyItem = (itemId: string) => {
    setVerifiedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventory, indicators] = await Promise.all([
          restaurantOpsService.getInventoryItems(),
          restaurantOpsService.getClosingIndicators()
        ]);
        setItems(inventory);
        setClosingIndicators(indicators);
      } catch (err) {
        console.error("Failed to fetch data for closing:", err);
                setError("We couldn't load your closing checklist data. Please try again or refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Resume from draft
  useEffect(() => {
    if (status?.metadata?.closing_draft_confirmed_ids && items.length > 0) {
        const draftIds = status.metadata.closing_draft_confirmed_ids;
        setVerifiedItemIds(new Set(draftIds));
    }
  }, [status?.metadata?.closing_draft_confirmed_ids, items.length]);

    if (isLoading && !items.length && !error) {
    return <ClosingSkeleton />;
  }

  const closingSummary = {
    itemsChecked: verifiedItemIds.size,
    itemsTotal: items.length,
    alerts: items.filter(i => i.status === 'Low' || i.status === 'Critical').length,
    closingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const handleSaveDraft = async () => {
    try {
        await restaurantOpsService.saveClosingChecklistDraft({
            confirmedIds: Array.from(verifiedItemIds),
            counts: closingCounts
        });
        toast({
            title: "Progress Saved",
            description: "Your closing progress has been saved as a draft."
        });
    } catch (err) {
        toast({
            title: "Error Saving",
            description: "Failed to persist draft. Please try again.",
            variant: "destructive"
        });
    }
  };

  // Dynamic Sorting: Unverified items at top, verified at bottom
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aVer = verifiedItemIds.has(a.id);
    const bVer = verifiedItemIds.has(b.id);
    if (aVer === bVer) return 0;
    return aVer ? 1 : -1;
  });

  const progressCount = verifiedItemIds.size;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((progressCount / totalCount) * 100) : 0;

  return (
    <AppContainer className="pb-32">
        <div className="flex items-center justify-between gap-4 px-1">
          <BrandSwitcherCard />
        </div>
        {error && <UnifiedErrorBanner message={error} />}
        <ReviewClosingChecklistModal
            open={isReviewModalOpen}
            onOpenChange={setIsReviewModalOpen}
            summary={closingSummary}
            items={items.map(item => ({
                ...item,
                physicalCount: closingCounts[item.id] ?? item.currentStock
            }))}
        />


        {/* Hero Section or Locked State */}
        <div className="w-full">
            {isClosing ? (
                <div className="space-y-12">
                    <UnifiedHeroSurface
                        variant="closing"
                        centerContent={false}
                        centerStats={false}
                        padding="p-8 md:pl-14 md:pr-8 md:pt-8 md:pb-12"
                        minHeight="min-h-[380px]"
                        title="End of Day Count"
                        subtitle="Verify remaining stock to finalize daily usage reports."
                        isLocked={false}
                        badge={
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm w-fit">
                                <Clock className="h-3.5 w-3.5 text-white" />
                                <FigtreeText className="text-[12px] font-semibold text-white uppercase tracking-[0.1em]">CLOSING IN PROGRESS</FigtreeText>
                            </div>
                        }
                        action={
                            <div className="flex items-center gap-8 mt-4">
                                <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                                    <svg className="h-full w-full -rotate-90">
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="40%"
                                            stroke="rgba(255,255,255,0.1)"
                                            strokeWidth="10"
                                            fill="transparent"
                                        />
                                        <motion.circle
                                            initial={{ strokeDashoffset: 251 }}
                                            animate={{ strokeDashoffset: 251 - (251 * progressPercent) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            cx="50%"
                                            cy="50%"
                                            r="40%"
                                            stroke="white"
                                            strokeWidth="10"
                                            fill="transparent"
                                            strokeDasharray={251}
                                            strokeLinecap="round"
                                            className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FigtreeText className="text-[20px] font-black text-white leading-none">{progressPercent}%</FigtreeText>
                                    </div>
                                </div>
                                <div className="space-y-1.5 pt-1">
                                    <FigtreeText className="text-[22px] font-black text-white tracking-tight leading-none">Progress: {progressCount} of {totalCount} Items Counted</FigtreeText>
                                    <FigtreeText className="text-white/60 font-medium text-[15px] leading-relaxed max-w-[420px]">Finish closing stock count to complete your restaurant operations for the day</FigtreeText>
                                </div>
                            </div>
                        }
                    >
                        <div className="flex flex-col sm:flex-row gap-8 mb-8 xl:mb-0">
                            <UnifiedStatCard 
                              label="Items Used" 
                              value={closingIndicators.itemsUsed} 
                              subtext="Usage intensity" 
                              icon={Package}
                              variant="indigo"
                              className="w-[220px] md:w-[260px] lg:w-[300px] h-[180px] md:h-[200px] bg-white border-0 shadow-[0_12px_44px_rgba(0,0,0,0.08)] ring-1 ring-white/10"
                              valueClassName="text-[36px] font-black"
                            />
                            <UnifiedStatCard 
                              label="Items Wasted" 
                              value={closingIndicators.itemsWasted} 
                              icon={Trash2}
                              variant="red"
                              className="w-[220px] md:w-[260px] lg:w-[300px] h-[180px] md:h-[200px] bg-white border-0 shadow-[0_12px_44px_rgba(0,0,0,0.08)] ring-1 ring-white/10"
                              valueClassName="text-[36px] font-black"
                            />
                        </div>
                    </UnifiedHeroSurface>
                    
                    {/* Items Section */}
                    <PrimarySurfaceCard className="p-8 md:p-10 space-y-10">
                        {/* Toolbar */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                            <div className="relative w-full xl:max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search items..." 
                                    className="pl-12 h-[52px] border-slate-200 rounded-[8px] bg-slate-50/50 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus-visible:ring-indigo-500/10 transition-all shadow-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                                <Select>
                                    <SelectTrigger className="h-[52px] border-slate-200 rounded-[8px] w-full sm:w-[200px] bg-white font-semibold text-slate-600 text-sm shadow-sm px-5 hover:border-indigo-100 transition-all focus:ring-0">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                </Select>
                                <Select>
                                    <SelectTrigger className="h-[52px] border-slate-200 rounded-[8px] w-full sm:w-[200px] bg-white font-semibold text-slate-600 text-sm shadow-sm px-5 hover:border-indigo-100 transition-all focus:ring-0">
                                        <SelectValue placeholder="All Levels" />
                                    </SelectTrigger>
                                </Select>
                            </div>
                        </div>

                        {/* List - Wrapped in local horizontal scroll to prevent page overflow issues */}
                        <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-6 -mx-2 px-2">
                            <div className="space-y-4 min-w-[1000px] xl:min-w-0">
                                {sortedItems.length === 0 && !isLoading && !error ? (
                                    <div className="w-full py-10 flex items-center justify-center">
                                        <FigtreeText className="text-slate-500 font-medium text-[14px]">
                                            No inventory items match your search for closing. Try adjusting your search term.
                                        </FigtreeText>
                                    </div>
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
                        </div>
                    </PrimarySurfaceCard>
                </div>
            ) : (
                <div className="flex items-center justify-center py-4 min-h-[calc(100vh-80px)]">
                    <ClosingLockedCard lifecycle={lifecycle} />
                </div>
            )}
        </div>

        {/* Fixed Closing Action Footer */}
        {isClosing && (
            <div
                className="fixed bottom-0 right-0 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-500 z-[100] bg-white/95 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]"
            >
                <div className="w-full px-4 sm:px-8 py-4 flex items-center justify-end gap-3 sm:gap-4">
                    <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        className="h-11 px-6 sm:px-8 rounded-[8px] border-indigo-100 bg-white font-bold text-[#3B59DA] hover:bg-indigo-50 transition-all text-[13px] sm:text-[14px] font-figtree shadow-sm active:scale-95"
                    >
                        Save draft
                    </Button>
                    <Button
                        className="h-11 px-8 sm:px-10 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[8px] font-black gap-3 shadow-[0_8px_24px_rgba(59,89,218,0.25)] border-none text-[13px] sm:text-[15px] transition-all active:scale-95 font-figtree"
                        onClick={() => {
                            if (!verifiedItemIds.size) {
                                toast({
                                    variant: "destructive",
                                    title: "Nothing to review yet",
                                    description: "Verify at least one item before reviewing your closing summary.",
                                });
                                return;
                            }
                            setIsReviewModalOpen(true);
                        }}
                    >
                        Review & Close <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
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

function ClosingCountRow({
    item,
    onEdit,
    onVerify,
    isVerified,
    physicalCount,
    onCountChange
}: {
    item: InventoryItem,
    onEdit: (item: InventoryItem) => void,
    onVerify: (id: string) => void,
    isVerified: boolean,
    physicalCount: number,
    onCountChange: (itemId: string, value: number) => void
}) {
    return (
        <UnifiedListRow className="p-5 md:p-6 transition-all hover:bg-[#F8FAFF]">
            <div className="flex flex-col xl:flex-row xl:items-center gap-8 justify-between w-full">
                <div className="flex items-center gap-8 w-full xl:w-auto min-w-[340px]">
                    <div className="h-20 w-20 rounded-full border border-slate-100 bg-white shadow-sm shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-slate-50 p-6 text-slate-100 flex items-center justify-center">
                                <Package className="h-8 w-8 text-slate-300" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-1.5 overflow-hidden">
                        <InriaHeading className="text-[22px] md:text-[24px] font-bold truncate leading-none text-[#1E293B] group-hover:text-[#3B59DA] transition-colors">{item.name}</InriaHeading>
                        <FigtreeText className="text-[12px] font-black uppercase tracking-[0.2em] leading-none text-slate-400">
                            OPENING: <span className="text-[#1E293B]">{item.currentStock} {item.unit}</span>
                        </FigtreeText>
                    </div>
                </div>

                {/* Metrics column */}
                <div className="flex-1 w-auto grid grid-cols-2 lg:grid-cols-3 gap-8 items-center border-l-0 xl:border-l border-slate-50 xl:pl-8">
                    <div className="space-y-1.5">
                        <FigtreeText className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Today's Wastage</FigtreeText>
                        <p className="text-[20px] font-black text-[#1E293B] font-figtree leading-none tabular-nums">0.00 <span className="text-[13px] font-bold text-slate-300 uppercase ml-0.5">{item.unit}</span></p>
                    </div>
                    <div className="space-y-1.5">
                        <FigtreeText className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Total Consumption</FigtreeText>
                        <p className="text-[20px] font-black text-[#1E293B] font-figtree leading-none tabular-nums">0.00 <span className="text-[13px] font-bold text-slate-300 uppercase ml-0.5">{item.unit}</span></p>
                    </div>
                    <div className="flex flex-col text-left space-y-1.5">
                        <FigtreeText className="text-[11px] font-black text-[#3B59DA] uppercase tracking-[0.2em] leading-none">Physical Count</FigtreeText>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={0}
                                step="any"
                                value={physicalCount}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val >= 0) onCountChange(item.id, val);
                                }}
                                className="w-28 h-10 text-[18px] font-black text-[#3B59DA] font-figtree tabular-nums border-[#3B59DA]/20 focus-visible:ring-indigo-500/20 bg-indigo-50/30 rounded-[8px] px-3"
                            />
                            <span className="text-[13px] font-bold text-[#3B59DA]/40 uppercase">{item.unit}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full xl:w-auto shrink-0 border-t xl:border-t-0 pt-6 xl:pt-0 xl:border-l border-slate-50 xl:pl-8">
                    <Button 
                        variant="outline" 
                        onClick={() => onEdit(item)}
                        className="h-12 px-6 rounded-[8px] border-slate-200 font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all font-figtree shadow-sm text-[14px] flex-1 xl:flex-none active:scale-95 bg-white"
                    >
                        Edit Amount
                    </Button>
                    <Button 
                        onClick={() => onVerify(item.id)}
                        className={cn(
                            "h-12 px-8 rounded-[8px] font-black transition-all border-none font-figtree shadow-lg text-[14px] flex-1 xl:flex-none min-w-[140px] active:scale-95",
                            isVerified 
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/10" 
                                : "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-indigo-900/10"
                        )}
                    >
                        {isVerified ? (
                            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Confirmed</span>
                        ) : "Confirm"}
                    </Button>
                </div>
            </div>
        </UnifiedListRow>
    );
}

function ClosingLockedCard({ lifecycle }: { lifecycle: any }) {
    const { currentTime, targetClosingTime, isClosingTimeReached, startClosing, isClosed, isOpen } = lifecycle;
    const isReady = isClosingTimeReached && isOpen && !isClosed;
    const isWhiteState = isReady || isClosed;
    
    return (
        <PrimarySurfaceCard className={cn(
            "w-full max-w-[720px] mx-auto p-5 md:p-7 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden font-figtree rounded-[10px]",
            "bg-white text-[#1E293B] shadow-[0_32px_120px_rgba(15,23,42,0.08)]"
        )}>
            {/* Header Lock Icon */}
            <div className={cn(
                "h-14 w-14 rounded-[8px] flex items-center justify-center mb-4 shadow-sm border relative z-10 transition-transform hover:scale-105 duration-300",
                "bg-slate-50 border-slate-100"
            )}>
                <Lock className={cn("h-7 w-7 stroke-[2px]", "text-slate-400")} />
            </div>

            <div className="text-center space-y-2 mb-4 relative z-10">
                <h2 className={cn(
                    "text-[24px] md:text-[28px] font-bold leading-none font-figtree uppercase tracking-tight",
                    "text-[#1E293B]"
                )}>
                    {isClosed ? "Day is Closed" : (isClosingTimeReached && isOpen ? "Closing is Ready" : "Closed")}
                </h2>
                <FigtreeText className={cn(
                    "font-medium text-[13px] md:text-[14px] max-w-sm mx-auto leading-relaxed",
                    "text-slate-500"
                )}>
                    {isClosed
                        ? "The operations day has ended and reports have been finalized."
                        : (isClosingTimeReached && isOpen
                            ? "The operations day has ended. You can now start the final stock reconciliation."
                            : "The closing workflow is not yet available. Please ensure all daily prerequisites are met."
                        )
                    }
                </FigtreeText>
            </div>

            <div className="w-full bg-white border border-slate-100 rounded-[8px] p-4 space-y-3 mb-4 relative z-10 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <FigtreeText className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Requirements</FigtreeText>
                </div>

                <div className="flex items-center justify-between group py-1">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 bg-emerald-50 rounded-[8px] flex items-center justify-center border border-emerald-100 transition-transform group-hover:scale-110 duration-300 shrink-0">
                            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[14px] font-bold text-[#1E293B] font-figtree">Complete Daily Stock Count</h3>
                            <FigtreeText className="text-[12px] font-medium text-slate-400">Requirement met at opening</FigtreeText>
                        </div>
                    </div>
                    <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                </div>

                <div className="flex items-center justify-between group py-1">
                    <div className="flex gap-4 items-center">
                        <div className={cn(
                            "h-10 w-10 rounded-[8px] flex items-center justify-center border transition-transform group-hover:scale-110 duration-300 shrink-0",
                            isClosingTimeReached ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
                        )}>
                            <Clock className={cn("h-4 w-4", isClosingTimeReached ? "text-emerald-500" : "text-slate-400")} />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[14px] font-bold text-[#1E293B] font-figtree">Wait until {targetClosingTime}</h3>
                            <FigtreeText className="text-[12px] font-medium text-slate-400">Currently {currentTime}</FigtreeText>
                        </div>
                    </div>
                    {(isClosingTimeReached && isOpen) ? (
                        <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                    ) : (
                        <div className="h-7 w-7 rounded-full border-2 border-slate-100 flex items-center justify-center shrink-0" />
                    )}
                </div>

                <div className="p-3 bg-slate-50/50 rounded-[8px] flex gap-3 items-center border border-slate-100 transition-colors hover:bg-slate-50">
                    <div className="h-9 w-9 bg-white rounded-[6px] flex items-center justify-center shrink-0 shadow-sm">
                        <Info className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                        <FigtreeText className="text-[13px] font-bold text-[#1E293B]">Store Management</FigtreeText>
                        <FigtreeText className="text-[12px] font-medium leading-relaxed text-slate-500">Closing hours and reset times can be adjusted by admins in Settings.</FigtreeText>
                    </div>
                </div>
            </div>

            <Button
                onClick={startClosing}
                disabled={!isClosingTimeReached || isClosed || !isOpen}
                className={cn(
                    "w-full h-13 rounded-[8px] font-bold text-[16px] transition-all active:scale-95 group relative z-10 font-figtree",
                    (isClosingTimeReached && isOpen && !isClosed)
                        ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-[0_20px_40px_-15px_rgba(59,89,218,0.3)] border-none"
                        : "bg-slate-100 text-slate-400 border-none shadow-none cursor-not-allowed"
                )}
            >
                {isClosed ? "Day is Closed" : ((isClosingTimeReached && isOpen) ? "Start Final Stock Count" : "Closing Unavailable")}
            </Button>
        </PrimarySurfaceCard>
    );
}

function ClosingSkeleton() {
    return (
        <div className="p-10 space-y-12 min-h-screen bg-white font-figtree">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-[360px] w-full rounded-2xl" />
            <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
