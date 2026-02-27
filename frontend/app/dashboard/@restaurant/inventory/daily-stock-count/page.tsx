"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Search as SearchIcon,
  RotateCcw,
  Package,
  ArrowRight,
  Lock,
  CheckCircle2,
  X,
  TrendingUp,
  History,
  Info,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { OpeningStockItem } from "@/mocks/openingStock.mock";
import { useToast } from "@/hooks/use-toast";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReviewOpeningChecklist } from "@/components/day/ReviewOpeningChecklist";

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
    
    // Update the item in the list as well
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
    <div className="min-h-screen bg-[#F8FAFC] font-figtree pb-48">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/10 rounded-full blur-[100px]" />
      </div>

      <div className={cn(
        "relative flex flex-col gap-8 px-6 py-6 transition-all duration-500 max-w-[1600px] mx-auto",
        showReview && "blur-xl scale-[0.98] pointer-events-none"
      )}>
        {/* Navigation */}
        <div className="flex items-center">
            <Button 
                variant="ghost" 
                className="h-10 px-4 rounded-xl font-bold bg-white border border-slate-200 shadow-sm transition-all hover:bg-slate-50 text-slate-600 gap-2"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </Button>
        </div>

        {/* Hero Progress Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#EEF2FF] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(238,242,255,0.4)] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden"
        >
            <CircularProgress percentage={progressPercent} count={progressCount} total={totalCount} />
            
            <div className="flex-1 space-y-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-[28px] font-semibold text-[#1E293B] tracking-tight">Daily Stock Count</h1>
                    <p className="text-slate-400 font-medium text-sm md:text-base">Check each product and confirm the quantity in stock</p>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-[17px] font-semibold text-[#1E293B]">Progress: {progressCount} of {totalCount} Items Counted</h3>
                    <p className="text-slate-400 font-medium text-[13px]">Finish stock counts to unlock Kitchen Service dashboard.</p>
                </div>
            </div>
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-0">
            <div className="relative w-full max-w-[340px]">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search items..." 
                    className="pl-11 h-12 border-slate-200 rounded-lg bg-white focus:ring-slate-100 placeholder:text-slate-400 text-sm"
                />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Select defaultValue="all">
                    <SelectTrigger className="h-12 border-slate-200 rounded-lg w-full md:w-[180px] bg-white font-medium text-slate-600 text-[13px] shadow-sm">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="all">All Categories</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="all">
                    <SelectTrigger className="h-12 border-slate-200 rounded-lg w-full md:w-[180px] bg-white font-medium text-slate-600 text-[13px] shadow-sm">
                        <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="all">All Levels</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Items Table Section */}
        <div className="bg-white border border-slate-100 rounded-[28px] overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <div className="h-6 w-6 rounded-md border-2 border-slate-200 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all">
                        <div className="h-3 w-3 rounded-sm bg-indigo-500 opacity-0" />
                    </div>
                    <span className="text-sm font-bold text-slate-500">Check All</span>
                </div>
                
                <div className="flex flex-col lg:flex-row items-center gap-4 flex-1 justify-end">
                    <div className="relative w-full max-w-[280px]">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search items..." 
                            className="pl-11 h-11 border-slate-100 rounded-xl bg-[#F8FAFC] focus:ring-slate-100 placeholder:text-slate-400 text-xs font-medium"
                        />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11 border-slate-100 rounded-xl w-full md:w-[160px] bg-[#F8FAFC] font-bold text-slate-500 text-xs shadow-none">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                            <SelectItem value="all">Category: All</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11 border-slate-100 rounded-xl w-full md:w-[140px] bg-[#F8FAFC] font-bold text-slate-500 text-xs shadow-none">
                            <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                            <SelectItem value="all">Level: All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-50 bg-[#FBFDFF] hover:bg-[#FBFDFF]">
                            <TableHead className="py-5 pl-8 w-[40px]"></TableHead>
                            <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest py-5">Item Name</TableHead>
                            <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Measurement Unit</TableHead>
                            <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Current Stock</TableHead>
                            <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
                            <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Updated On</TableHead>
                            <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, idx) => (
                            <TableRow 
                                key={item.id} 
                                className={cn(
                                    "border-slate-50 transition-colors group",
                                    confirmedIds.has(item.id) ? "bg-emerald-50/20" : "hover:bg-slate-50/50"
                                )}
                            >
                                <TableCell className="pl-8">
                                    <div 
                                        className={cn(
                                            "h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer",
                                            confirmedIds.has(item.id) 
                                                ? "bg-[#3B59DA] border-[#3B59DA]" 
                                                : "border-slate-200 hover:border-indigo-400 bg-white"
                                        )}
                                        onClick={() => handleConfirm(item.id)}
                                    >
                                        <CheckCircle2 className={cn("h-3 w-3 text-white transition-opacity", confirmedIds.has(item.id) ? "opacity-100" : "opacity-0")} />
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-slate-300">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#1E293B] text-sm">{item.name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.id}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 font-bold text-xs uppercase">{item.unit}</TableCell>
                                <TableCell className="font-bold text-[#1E293B] text-sm">
                                    {confirmedIds.has(item.id) ? item.totalOpening : (item.todayOpening ?? '--')}
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        className={cn(
                                            "border-none rounded-full font-bold text-[9px] px-2.5 py-0.5 uppercase tracking-tight",
                                            confirmedIds.has(item.id) ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                        )}
                                    >
                                        {confirmedIds.has(item.id) ? "Confirmed" : "Incomplete"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-400 text-[11px] font-bold">Oct 06, 2025; 14:32</TableCell>
                                <TableCell className="text-right pr-8">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 rounded-lg font-bold text-xs text-indigo-600 hover:bg-indigo-50 px-3"
                                            onClick={() => handleEditAmount(item)}
                                        >
                                            Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-50 text-slate-300 group-hover:text-[#3B59DA] transition-all">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div 
        className="fixed bottom-0 right-0 z-50 p-6 md:p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-[left] duration-300"
        style={{ left: 'var(--sidebar-width)' }}
      >
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
          >
              <div className="flex items-center gap-6">
                <Button 
                    variant="ghost" 
                    className="h-14 px-8 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-bold transition-all gap-2"
                    onClick={handleSaveDraft}
                >
                    <RotateCcw className="h-5 w-5" /> Save a draft
                </Button>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="hidden xl:block text-right">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Finalization Status</p>
                    <p className="text-[#1E293B] font-bold text-xl tracking-tight leading-none">{progressPercent}% Progress Counted</p>
                </div>
                <Button 
                    className={cn(
                        "h-16 px-12 rounded-2xl font-bold gap-3 transition-all border-none text-lg shadow-xl w-full md:w-auto",
                        progressPercent === 100 
                            ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20" 
                            : "bg-indigo-600/90 hover:bg-indigo-700 text-white/90"
                    )}
                    onClick={handleComplete}
                >
                    Review & Complete Opening
                    <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
          </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
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
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.3) }}
            className={cn(
                "group bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all overflow-hidden",
                isConfirmed && "bg-slate-50/50"
            )}
        >
            <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
                <div className="flex items-center gap-6 w-full lg:w-auto min-w-[280px]">
                    <div className="h-16 w-16 rounded-full border border-slate-200 bg-white shrink-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full border border-slate-100 bg-slate-50/50" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                        <h4 className="text-lg font-semibold text-[#1E293B] tracking-tight truncate">{item.name}</h4>
                        <p className="text-[13px] font-medium text-slate-400">
                            Yesterday's Closing: <span className="font-semibold text-slate-500">{item.yesterdayClosing} {item.unit}</span>
                        </p>
                    </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Today's Opening</p>
                        <p className="text-lg font-bold text-[#1E293B]">{item.todayOpening ?? '10'} <span className="text-sm font-semibold">{item.unit}</span></p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Amount Added Today</p>
                        <p className="text-lg font-bold text-[#1E293B]">{item.amountAddedToday ?? '--'}</p>
                    </div>
                    <div className="flex items-center gap-8 border-l-2 border-slate-100 pl-8">
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Total Opening Stock:</p>
                            <p className="text-lg font-bold text-[#3B59DA]">{item.totalOpening ?? '10'} <span className="text-sm font-semibold">{item.unit}</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 p-3 bg-[#F8FAFC] rounded-2xl">
                    <Button 
                        variant="ghost" 
                        className="h-11 px-6 rounded-xl border border-slate-200 font-bold bg-white hover:bg-slate-50 transition-all text-slate-600 flex-1 lg:flex-none"
                        onClick={onEdit}
                    >
                        Edit Amount
                    </Button>
                    <Button 
                        className={cn(
                            "h-11 px-8 rounded-xl font-bold shadow-md transition-all flex-1 lg:flex-none min-w-[110px] border-none",
                            isConfirmed 
                                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                                : "bg-[#3B59DA] hover:bg-[#2D46B2] text-white"
                        )}
                        onClick={onConfirm}
                    >
                        {isConfirmed ? (
                            <span className="flex items-center gap-2">Confirmed <CheckCircle2 className="h-4 w-4" /></span>
                        ) : "Confirm"}
                    </Button>
                </div>
            </div>
        </motion.div>
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95%] sm:max-w-[540px] p-0 rounded-2xl overflow-hidden border-none shadow-2xl bg-white font-figtree">
                <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <DialogTitle className="text-xl font-bold text-[#1E293B] tracking-tight">Update Item</DialogTitle>
                        <p className="text-slate-400 font-medium text-[13px]">Manually adjust the inventory level</p>
                    </div>
                </div>
                
                <div className="p-5 md:p-6 space-y-6">
                    <div className="bg-[#F8FAFF] border border-indigo-100/50 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-lg border border-white bg-white shadow-sm flex items-center justify-center shrink-0">
                                <Package className="h-6 w-6 text-indigo-200" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-lg font-bold text-[#1E293B]">{item.name}</h4>
                                <Badge className="bg-indigo-50 text-indigo-500 border-none font-bold text-[10px] rounded-full uppercase px-2 py-0">{item.category}</Badge>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current</p>
                             <p className="text-xl font-bold text-[#1E293B]">{item.yesterdayClosing} <span className="text-slate-400 text-xs">{item.unit}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Incoming</label>
                            <Input 
                                type="number"
                                value={incoming} 
                                onChange={(e) => handleIncomingChange(e.target.value)}
                                placeholder={`0 ${item.unit}`} 
                                className="h-12 text-xl font-bold border-slate-200 bg-[#F8FAFC] rounded-xl px-4 focus:ring-indigo-100 text-[#1E293B]" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">New Total</label>
                            <div className="h-12 border border-emerald-200 rounded-xl bg-white px-4 flex items-center justify-between">
                                <span className="text-xl font-bold text-emerald-500">{total} <span className="text-emerald-300 text-xs font-semibold">{item.unit}</span></span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3 flex items-center gap-3 text-indigo-600 font-bold text-[12px]">
                        <RotateCcw className="h-4 w-4 shrink-0" />
                        <p>Updating from <span className="font-black">{item.yesterdayClosing}</span> to <span className="font-black">{total} {item.unit}</span></p>
                    </div>
                </div>

                <DialogFooter className="p-4 md:p-5 bg-slate-50/50 border-t border-slate-100 gap-3">
                    <Button variant="ghost" onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-slate-500 hover:bg-white border-transparent hover:border-slate-200 flex-1">
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => onUpdate({
                            ...item,
                            amountAddedToday: parseFloat(incoming) || 0,
                            totalOpening: total,
                            todayOpening: item.todayOpening ?? item.yesterdayClosing
                        })} 
                        className="h-11 px-8 rounded-xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold text-[15px] shadow-sm flex-[1.5] border-none"
                    >
                        Confirm Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CircularProgress({ percentage }: { percentage: number, count: number, total: number }) {
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
                    stroke="#F1F5F9"
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
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[15px] font-bold text-[#1E293B] leading-none">{percentage}%</p>
            </div>
        </div>
    );
}

function OpeningSkeleton() {
    return (
        <div className="p-10 space-y-12 bg-[#F8FAFC] min-h-screen">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <Skeleton className="h-[240px] w-full rounded-[32px]" />
            <div className="space-y-6">
                 <Skeleton className="h-32 w-full rounded-[28px]" />
                 <Skeleton className="h-32 w-full rounded-[28px]" />
                 <Skeleton className="h-32 w-full rounded-[28px]" />
            </div>
        </div>
    );
}
