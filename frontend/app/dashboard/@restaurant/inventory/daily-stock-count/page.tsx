"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Package,
  ArrowRight,
  CheckCircle2,
  X,
  ArrowLeft,
  Search as SearchIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
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
  const { isLocked } = useRestaurantDayLifecycle();
  const [items, setItems] = useState<OpeningStockItem[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [editingItem, setEditingItem] = useState<OpeningStockItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await restaurantOpsService.getOpeningChecklistItems();
        setItems(data);
        const confirmed = new Set(data.filter(i => i.isConfirmed).map(i => i.id));
        setConfirmedIds(confirmed);
      } catch (err) {
        console.error("Failed to fetch opening items:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
    toast({
        title: "Draft Saved",
        description: "Your progress has been saved locally."
    });
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

  return (
    <AppContainer className="pb-48">
      {/* Main Content Container */}
      <div className={cn(
        "relative flex flex-col gap-10 px-0 transition-all duration-500 w-full",
        showReview && "blur-2xl scale-[0.98] pointer-events-none"
      )}>

        {/* Hero Progress Header */}
        <UnifiedHeroSurface
            title="Daily Stock Count"
            subtitle="Check each product and confirm the quantity in stock to unlock Kitchen Service dashboard."
            isLocked={true}
        >
            <div className="flex items-center gap-14 col-span-2">
                <CircularProgress percentage={progressPercent} />
                <div className="space-y-4">
                    <InriaHeading className="text-[34px] font-bold text-white tracking-tight leading-loose">Opening Checklist Progress</InriaHeading>
                    <FigtreeText className="text-white/60 font-semibold text-[17px] leading-relaxed max-w-sm">Complete all counts to verify inventory levels and start service operations.</FigtreeText>
                </div>
            </div>

            <UnifiedStatCard 
              label="Completed" 
              value={String(progressCount)} 
              subtext={`of ${totalCount} items`} 
              icon={CheckCircle2}
              variant="neutral"
            />
            <UnifiedStatCard 
              label="Remaining" 
              value={String(totalCount - progressCount)} 
              subtext="Needs counting" 
              icon={Package}
              variant="neutral"
            />
        </UnifiedHeroSurface>

        {/* Items List */}
        <PrimarySurfaceCard className="p-10 md:p-14 space-y-12">
            {/* Toolbar inside surface */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                <div className="relative w-full max-w-[500px]">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <Input 
                        placeholder="Filter items by name or SKU..." 
                        className="pl-16 h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] focus:ring-slate-100 placeholder:text-slate-400 font-bold text-[17px] font-figtree shadow-inner"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <Select defaultValue="all">
                        <SelectTrigger className="h-[72px] border-slate-200 rounded-2xl w-full sm:w-[240px] bg-white font-black text-slate-500 text-sm shadow-md px-8">
                            <SelectValue placeholder="Categories" />
                        </SelectTrigger>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-[72px] border-slate-200 rounded-2xl w-full sm:w-[240px] bg-white font-black text-slate-500 text-sm shadow-md px-8">
                            <SelectValue placeholder="Stock Level" />
                        </SelectTrigger>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                {items.map((item, idx) => (
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
        className="fixed bottom-0 right-0 z-[60] p-10 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-20px_60px_rgba(0,0,0,0.05)] transition-[left] duration-500"
        style={{ left: 'var(--sidebar-width)' }}
      >
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-[1600px] mx-auto flex items-center justify-end gap-6"
          >
              <Button 
                  variant="outline" 
                  className="h-16 px-12 rounded-2xl border-slate-200 text-slate-500 hover:text-[#3B59DA] font-bold transition-all text-[17px] shadow-md font-figtree"
                  onClick={handleSaveDraft}
              >
                  Save a draft
              </Button>
              <Button 
                  className={cn(
                      "h-16 px-14 rounded-2xl font-black gap-4 transition-all border-none text-[18px] shadow-2xl flex items-center bg-[#3B59DA] hover:bg-[#2D46B2] text-white"
                  )}
                  onClick={handleComplete}
              >
                  Review & Complete Opening
                  <ArrowRight className="h-6 w-6" />
              </Button>
          </motion.div>
      </div>

      {/* Overlay Modals */}
      <AnimatePresence>
        {showReview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                <ReviewOpeningChecklist 
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
                "transition-all",
                isConfirmed && "bg-[#F8FAFF] border-blue-100/50"
            )}
        >
            <div className="flex flex-col xl:flex-row xl:items-center gap-12 justify-between w-full">
                <div className="flex items-center gap-10 w-full xl:w-auto min-w-[380px]">
                    <div className="h-28 w-28 rounded-full border-4 border-white bg-white shadow-xl shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-slate-50 p-6 text-slate-100">
                                <Package className="h-full w-full" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-3 overflow-hidden">
                        <InriaHeading className="text-[28px] font-bold truncate leading-none mb-1 text-[#1E293B] group-hover:text-[#3B59DA] transition-colors">{item.name}</InriaHeading>
                        <FigtreeText className="text-[14px] font-black uppercase tracking-[0.15em] leading-none text-slate-400">
                            YESTERDAY: <span className="text-[#1E293B]">{item.yesterdayClosing} {item.unit}</span>
                        </FigtreeText>
                    </div>
                </div>

                <div className="flex-1 w-auto grid grid-cols-2 md:grid-cols-3 gap-12 items-center border-l-0 xl:border-l border-slate-100 xl:pl-12">
                    <div className="space-y-3">
                        <FigtreeText className="text-[12px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Today's Balance</FigtreeText>
                        <p className="text-[24px] font-black text-[#1E293B] font-figtree leading-none tabular-nums">{item.todayOpening ?? '10'} <span className="text-[15px] font-bold text-slate-400 uppercase ml-1">{item.unit}</span></p>
                    </div>
                    <div className="space-y-3">
                        <FigtreeText className="text-[12px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Amount Added</FigtreeText>
                        <p className="text-[24px] font-black text-[#1E293B] font-figtree leading-none tabular-nums">+{item.amountAddedToday ?? '0'} <span className="text-[15px] font-bold text-slate-400 uppercase ml-1">{item.unit}</span></p>
                    </div>
                    <div className="flex flex-col text-left space-y-3">
                        <FigtreeText className="text-[12px] font-black text-[#3B59DA] uppercase tracking-[0.2em] leading-none">Verified Total</FigtreeText>
                        <p className="text-[32px] font-black text-[#3B59DA] font-figtree leading-none tabular-nums">{item.totalOpening || (item.todayOpening ?? '10')} <span className="text-[16px] font-bold text-[#3B59DA]/40 uppercase ml-1">{item.unit}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-5 w-full xl:w-auto shrink-0 border-t xl:border-t-0 pt-8 xl:pt-0 xl:border-l border-slate-100 xl:pl-12">
                    <Button 
                        variant="outline" 
                        className="h-[72px] px-10 rounded-2xl border-slate-200 font-bold bg-white text-slate-600 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all text-[17px] flex-1 xl:flex-none font-figtree shadow-sm active:scale-95"
                        onClick={onEdit}
                    >
                        Edit Count
                    </Button>
                    <Button 
                        className={cn(
                            "h-[72px] px-14 rounded-2xl font-black shadow-2xl transition-all flex-1 xl:flex-none min-w-[180px] border-none font-figtree text-[18px] active:scale-95",
                            isConfirmed 
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/20" 
                                : "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-indigo-900/20"
                        )}
                        onClick={onConfirm}
                    >
                        {isConfirmed ? "Verified" : "Verify Stock"}
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
            setTotal(item.totalOpening || (item.todayOpening ?? 0));
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
                    <Button variant="outline" onClick={onClose} className="h-16 px-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 text-lg flex-1 font-figtree active:scale-95 transition-all shadow-md">
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => onUpdate({
                            ...item,
                            amountAddedToday: parseFloat(incoming) || 0,
                            totalOpening: total,
                            todayOpening: item.todayOpening ?? item.yesterdayClosing
                        })} 
                        className="h-16 px-16 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black text-[19px] shadow-2xl shadow-indigo-900/10 border-none flex-[2] font-figtree active:scale-95 transition-all"
                    >
                        Confirm Update
                    </Button>
                </>
            }
        >
            <div className="space-y-10">
                {/* Item Preview Card */}
                <div className="bg-white border border-slate-100 rounded-[24px] p-8 flex items-center justify-between gap-10 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="h-28 w-28 rounded-[24px] overflow-hidden border border-slate-50 shadow-xl shrink-0 transition-transform group-hover:scale-105 duration-500">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-200">
                                    <Package className="h-12 w-12" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <InriaHeading className="text-[28px] font-bold leading-none">{item.name}</InriaHeading>
                            <div className="flex items-center gap-3">
                                <FigtreeText className="text-[13px] font-bold uppercase tracking-widest leading-none">SKU ID: {item.id}</FigtreeText>
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                <Badge className="bg-[#EFF6FF] text-[#3B59DA] border-none font-bold text-[11px] rounded-lg uppercase px-3 py-1 font-figtree tracking-widest leading-none">{item.category}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="text-right shrink-0 relative z-10">
                         <FigtreeText className="text-[13px] font-black uppercase tracking-[0.2em] mb-2 leading-none">Current Quantity</FigtreeText>
                         <p className="text-[42px] font-black text-[#1E293B] tracking-tighter leading-none font-figtree">{item.yesterdayClosing} <span className="text-[20px] text-slate-300 ml-1">kg</span></p>
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
                            placeholder={`24 kg`} 
                            className="h-[72px] text-[24px] font-bold border-slate-200 bg-white rounded-[18px] px-8 focus:ring-[#3B59DA]/10 focus:border-[#3B59DA] text-[#1E293B] font-figtree transition-all shadow-sm" 
                        />
                    </div>
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold text-[#10B981] uppercase tracking-widest ml-1 leading-none">New Quantity</FigtreeText>
                        <div className="relative">
                            <Input 
                                readOnly
                                value={`${total} kg`} 
                                className="h-[72px] text-[24px] font-bold border-[#10B981] bg-white rounded-[18px] px-8 text-[#10B981] font-figtree shadow-sm border-2" 
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#ECFDF5] flex items-center justify-center border border-[#D1FAE5]">
                                <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Info */}
                <div className="bg-[#F5F8FF] border border-blue-200 border-dashed rounded-[24px] p-6 flex items-center gap-6 text-[#3B59DA] font-bold text-[18px] shadow-sm font-figtree relative overflow-hidden group/info">
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
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative h-[160px] w-[160px] flex items-center justify-center shrink-0">
            <svg className="h-[160px] w-[160px] -rotate-90">
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth="10"
                    fill="transparent"
                    className="opacity-40"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="white"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[42px] font-black text-white leading-none font-figtree">{percentage}%</p>
            </div>
        </div>
    );
}

function OpeningSkeleton() {
    return (
        <div className="p-10 space-y-12 bg-white min-h-screen">
            <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
            <Skeleton className="h-[360px] w-full rounded-[32px]" />
            <div className="space-y-6">
                 <Skeleton className="h-32 w-full rounded-[28px]" />
                 <Skeleton className="h-32 w-full rounded-[28px]" />
                 <Skeleton className="h-32 w-full rounded-[28px]" />
            </div>
        </div>
    );
}
