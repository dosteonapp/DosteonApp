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
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="h-10 px-6 rounded-xl border-slate-200 bg-white text-slate-600 hover:text-[#3B59DA] font-semibold gap-2 transition-all shadow-sm active:scale-95 font-figtree"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Main Content Container */}
      <div className={cn(
        "relative flex flex-col gap-4 px-0 transition-all duration-500 w-full",
        showReview && "blur-2xl scale-[0.98] pointer-events-none"
      )}>

        {/* Hero Progress Header */}
        <UnifiedHeroSurface
            backgroundColor="bg-[#f5f6ff]"
            borderColor="border-[#98a6f9]"
            title=""
            description=""
            padding="px-8 py-8 md:px-12 md:py-10"
            isLocked={false}
        >
            <div className="flex flex-col gap-8 w-full">
                <div className="space-y-3">
                    <h1 className="text-[28px] md:text-[32px] font-bold text-[#1E293B] tracking-tight leading-none font-figtree">Daily Stock Count</h1>
                    <p className="text-slate-500 font-medium text-[15px] max-w-lg leading-relaxed font-figtree">
                        Check each product and confirm the quantity in stock to unlock Kitchen Service dashboard.
                    </p>
                </div>

                <div className="flex items-center gap-6 justify-start">
                    <CircularProgress percentage={progressPercent} />
                    <div className="space-y-1 text-left">
                        <h2 className="text-[17px] md:text-[19px] font-bold text-[#1E293B] tracking-tight font-figtree">Progress: {progressCount} of {totalCount} Items Counted</h2>
                        <FigtreeText className="text-slate-400 font-medium text-[14px]">Finish counts to verify inventory levels.</FigtreeText>
                    </div>
                </div>
            </div>
        </UnifiedHeroSurface>

        {/* Items List Card */}
        <PrimarySurfaceCard className="border-black/5 shadow-sm p-4 md:p-8 space-y-8">
            {/* Toolbar inside card */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative w-full md:max-w-md">
                    <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Search items..." 
                        className="pl-14 h-[60px] border-slate-200 rounded-xl bg-white focus:ring-indigo-100 placeholder:text-slate-400 font-medium text-[15px] font-figtree shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Select defaultValue="all">
                        <SelectTrigger className="h-[60px] border-slate-200 rounded-xl w-full sm:w-[200px] bg-white font-semibold text-slate-500 text-[15px] px-8 shadow-sm">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="fresh">Fresh Products</SelectItem>
                            <SelectItem value="dry">Dry Stock</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-[60px] border-slate-200 rounded-xl w-full sm:w-[200px] bg-white font-semibold text-slate-500 text-[15px] px-8 shadow-sm">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="healthy">Healthy Stock</SelectItem>
                            <SelectItem value="low">Low Stock</SelectItem>
                        </SelectContent>
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
            className="w-full flex items-center justify-end gap-6"
          >
              <Button 
                  variant="outline" 
                  className="h-16 px-12 rounded-2xl border-[#3B59DA] text-[#3B59DA] hover:bg-slate-50 font-semibold transition-all text-[17px] shadow-sm font-figtree"
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
                "transition-all p-4 md:p-8",
                isConfirmed && "bg-[#F8FAFF] border-blue-100/30 shadow-none ring-1 ring-blue-50/50"
            )}
        >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 justify-between w-full">
                {/* Product Info */}
                <div className="flex items-center gap-8 flex-1 min-w-[280px]">
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-sm">
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
                        <p className="text-[18px] md:text-[20px] font-bold text-[#1E293B] font-figtree leading-none">--</p>
                    </div>
                    <div className="space-y-2 md:pl-10 border-l border-slate-200 col-span-2 md:col-span-1">
                        <FigtreeText className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.1em] leading-none">Total Opening Stock:</FigtreeText>
                        <p className="text-[18px] md:text-[20px] font-black text-[#3B59DA] font-figtree leading-none">{item.totalOpening || (item.todayOpening ?? '10')} units</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
                    <Button 
                        variant="outline" 
                        className="h-14 px-8 rounded-2xl border-slate-200 font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all text-[15px] flex-1 lg:flex-none font-figtree bg-white shadow-sm"
                        onClick={onEdit}
                    >
                        Edit Amount
                    </Button>
                    <Button 
                        className={cn(
                            "h-14 px-10 rounded-2xl font-black transition-all flex-1 lg:flex-none min-w-[140px] font-figtree text-[15px] border-none",
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
