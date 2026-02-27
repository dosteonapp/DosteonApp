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
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { restaurantOpsService, InventoryItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReviewClosingChecklistModal } from "@/components/kitchen/ReviewClosingChecklistModal";
import { motion } from "framer-motion";

export default function ClosingPage() {
  const { isOpen } = useRestaurantDayLifecycle();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventory = await restaurantOpsService.getInventoryItems();
        setItems(inventory);
      } catch (err) {
        console.error("Failed to fetch inventory for closing:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <ClosingSkeleton />;
  }

  const closingSummary = {
    itemsChecked: items.length,
    itemsTotal: items.length,
    alerts: items.filter(i => i.status === 'Low' || i.status === 'Critical').length,
    closingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  return (
    <div className="flex flex-col gap-8 bg-white min-h-screen pb-48 w-full relative font-figtree">
        <ReviewClosingChecklistModal 
            open={isReviewModalOpen}
            onOpenChange={setIsReviewModalOpen}
            summary={closingSummary}
        />

        {/* Page Header Outside Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-0 mt-2 mb-2">
            <div className="space-y-1">
                <h2 className="text-[26px] md:text-[32px] font-semibold text-[#1E293B] tracking-tight leading-none font-inria italic">Closing</h2>
            </div>
        </div>

        {/* Hero Section or Locked State */}
        <div className="w-full">
            {!isOpen ? (
                <div className="flex justify-center items-center py-20 min-h-[70vh]">
                     <ClosingLockedCard />
                </div>
            ) : (
                <>
                    <ClosingHeroOpen summary={closingSummary} />
                    
                    <div className="space-y-1.5 mt-10 px-0">
                        <h2 className="text-[22px] md:text-[26px] font-semibold text-[#1E293B] tracking-tight">Review Shift Stock</h2>
                        <p className="text-slate-400 font-semibold text-xs md:text-sm">Final count verification before closing today's service</p>
                    </div>

                    <div className="mt-6 space-y-8 bg-white border border-slate-100 rounded-[28px] p-6 md:p-10 relative overflow-hidden shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input 
                                    placeholder="Search items..." 
                                    className="pl-11 h-12 md:h-13 border-slate-100 rounded-xl bg-slate-50/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-200 font-bold text-slate-500 gap-2 text-xs md:text-sm">
                                    All Categories <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-200 font-bold text-slate-500 gap-2 text-xs md:text-sm">
                                    All Levels <ChevronDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {items.slice(0, 5).map((item) => (
                                <ClosingCountRow key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Sticky Closing Action Footer */}
        {isOpen && (
            <div 
                className="fixed bottom-0 right-0 z-40 p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 transition-[left] duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
                style={{ left: 'var(--sidebar-width)' }}
            >
                <div className="max-w-[1850px] mx-auto flex items-center justify-between gap-6">
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Items Checked</span>
                            <span className="text-xl font-bold text-[#1E293B]">{items.length}/{items.length}</span>
                        </div>
                        <div className="h-10 w-px bg-slate-100" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Current Time</span>
                            <span className="text-xl font-bold text-[#1E293B]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    <Button 
                        className="h-14 px-10 md:px-14 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-xl font-semibold gap-3 shadow-[0_15px_30px_rgba(59,89,218,0.2)] border-none text-base transition-all active:scale-95"
                        onClick={() => setIsReviewModalOpen(true)}
                    >
                        Review & Close Kitchen <CheckCircle2 className="h-6 w-6 stroke-[2.5px]" />
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
}

function ClosingHeroOpen({ summary }: { summary: any }) {
    return (
        <div className="relative rounded-[28px] p-8 md:p-10 lg:p-12 border border-white/10 bg-gradient-to-r from-[#1b32b8] via-[#761dc3] to-[#091558] text-white flex flex-col lg:flex-row gap-8 items-center justify-between shadow-2xl transition-all duration-700 w-full min-h-[254px] overflow-hidden">
             <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20 z-0">
                 <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-white/20 rounded-full blur-[150px]" />
             </div>

            <div className="flex flex-col gap-6 md:gap-10 text-left w-full lg:w-[45%] shrink-0 z-10">
                <div className="space-y-4 md:space-y-6">
                    <h2 className="text-[clamp(36px,5vw,56px)] font-semibold tracking-tight leading-none italic font-inria">Closing Review</h2>
                    <p className="text-white/80 text-[clamp(14px,1.4vw,17px)] font-semibold leading-relaxed max-w-sm">
                        Please review and confirm the final stock counts for today's shift. Your accuracy ensures smooth planning for tomorrow.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 flex-1 w-full lg:min-w-0 z-10">
                <HeroStatSmall label="Items Pending" value="0" icon={ClipboardCheck} />
                <HeroStatSmall label="Stock Alerts" value={summary.alerts} icon={Bell} />
                <HeroStatSmall label="Kitchen Staff" value="8" icon={Utensils} />
                <HeroStatSmall label="Service Time" value="11.5h" icon={Clock} />
            </div>
        </div>
    );
}

function HeroStatSmall({ label, value, icon: Icon }: { label: string, value: any, icon: any }) {
    return (
        <div className="bg-white rounded-2xl p-6 h-[160px] md:h-[180px] border border-slate-100 shadow-xl flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden font-figtree">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3B59DA]">
                    <Icon className="h-4 w-4 stroke-[2.5px]" />
                </div>
                <span className="text-[12px] md:text-[13px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className="text-[32px] md:text-[38px] lg:text-[44px] font-bold tracking-tight text-[#1E293B] leading-none mb-1">{value}</div>
        </div>
    );
}

function ClosingCountRow({ item }: { item: InventoryItem }) {
    return (
        <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-all group">
            <div className="flex items-center gap-6 md:gap-8 flex-1 min-w-0">
                <div className="h-14 w-14 md:h-16 md:w-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                    <Utensils className="h-6 w-6 md:h-7 md:w-7 text-[#3B59DA] stroke-[1.5px]" />
                </div>
                <div className="space-y-1.5 min-w-0">
                    <h4 className="text-lg md:text-xl font-bold text-[#1E293B] truncate">{item.name}</h4>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                        <Badge className="bg-slate-50 text-slate-400 border-none rounded-full px-3 py-1 text-[10px] uppercase font-semibold tracking-widest">{item.category}</Badge>
                        <span>Expected: <span className="text-[#1E293B]">{item.currentStock}{item.unit}</span></span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-40">
                    <Input className="h-12 md:h-14 rounded-xl bg-slate-50 border-slate-100 text-center font-semibold text-lg focus:ring-indigo-100" defaultValue={item.currentStock} />
                </div>
                <Button className="h-12 w-12 md:h-14 md:w-14 p-0 rounded-xl bg-indigo-50 text-[#3B59DA] hover:bg-indigo-100 border-none transition-all active:scale-90">
                    <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
                </Button>
            </div>
        </div>
    );
}

function ClosingLockedCard() {
    return (
        <div className="w-full max-w-[600px] bg-white border border-slate-100 rounded-3xl p-10 md:p-14 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-slate-100">
                <Lock className="h-10 w-10 text-slate-300 stroke-[1.5px]" />
            </div>
            
            <h3 className="text-3xl font-bold text-[#1E293B] mb-4">Closing is Locked</h3>
            <p className="text-slate-500 font-semibold text-center mb-10 max-w-xs leading-relaxed">
                The closing workflow is not yet available. Please ensure all daily prerequisites are met.
            </p>
            
            <div className="w-full space-y-4 mb-10">
                <div className="p-6 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <ClipboardCheck className="h-5 w-5 text-[#10B981]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#1E293B]">Complete Daily Stock Count</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reviewed and completed</p>
                        </div>
                    </div>
                    <CheckCircle2 className="h-7 w-7 text-[#10B981] fill-emerald-50" />
                </div>
                
                <div className="p-6 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#1E293B]">Wait until 7:00 PM</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Currently 4:15 PM</p>
                        </div>
                    </div>
                    <Circle className="h-7 w-7 text-slate-200 stroke-[2.5px]" />
                </div>
                
                <div className="p-6 bg-slate-50/50 rounded-2xl flex gap-5 items-center border border-dashed border-slate-200">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Info className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-[#1E293B]">Store Management</p>
                        <p className="text-[11px] font-semibold text-slate-400 leading-normal">Closing hours and reset times can be adjusted by admins in Settings.</p>
                    </div>
                </div>
            </div>
            
            <Button className="w-full h-16 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-2xl font-semibold text-lg shadow-2xl shadow-indigo-900/20 border-none transition-all active:scale-95 group" asChild>
                <Link href="/dashboard">
                    Return to Home <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Link>
            </Button>
        </div>
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
