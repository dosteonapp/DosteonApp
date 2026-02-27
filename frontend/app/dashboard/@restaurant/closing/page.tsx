"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Lock, 
  CheckCircle2, 
  Circle, 
  Info, 
  ArrowRight,
  ClipboardCheck,
  Clock,
  Search,
  Calendar,
  Bell,
  Trash2,
  Utensils,
  ChevronDown,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { restaurantOpsService, InventoryItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRestaurantDayActionGuard } from "@/lib/dayLifecycle/useRestaurantDayActionGuard";

import { ReviewClosingChecklistModal } from "@/components/kitchen/ReviewClosingChecklistModal";

export default function ClosingPage() {
  const { status, isOpen, isLocked } = useRestaurantDayLifecycle();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { guardAction } = useRestaurantDayActionGuard();

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
    itemsChecked: items.filter(i => true).length, // Assuming all for now
    itemsTotal: items.length,
    alerts: items.filter(i => i.status === 'Low' || i.status === 'Critical').length,
    closingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  return (
    <div className="flex flex-col gap-8 bg-white min-h-screen pb-48 w-full">
        <ReviewClosingChecklistModal 
            open={isReviewModalOpen}
            onOpenChange={setIsReviewModalOpen}
            summary={closingSummary}
        />
    <div className="space-y-10 max-w-[1850px] mx-auto w-full pb-48 px-1 md:px-2">
        {/* State Conditional Render */}
        {!isOpen ? (
          <ClosingLockedUI />
        ) : (
          <>
            <ClosingHeroOpen />
            <div className="space-y-6 bg-white border border-slate-100 rounded-none p-5 md:p-8 lg:p-10 relative overflow-hidden shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input 
                            placeholder="Search items..." 
                            className="pl-11 h-12 md:h-14 rounded-none border-slate-100 bg-[#F8FAFC] shadow-sm font-medium focus-visible:ring-indigo-100 text-sm md:text-base"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="h-10 md:h-12 px-4 md:px-5 rounded-none border-slate-200 font-bold text-slate-500 gap-2 text-xs md:text-sm">
                            All Categories <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="h-10 md:h-12 px-4 md:px-5 rounded-none border-slate-200 font-bold text-slate-500 gap-2 text-xs md:text-sm">
                            All Levels <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {items.map((item) => (
                        <ClosingCountRow key={item.id} item={item} />
                    ))}
                </div>
            </div>

            {/* Sticky Bottom Bar - Pinned to Bottom, Responding to Sidebar */}
            <div 
                className="fixed bottom-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] transition-all duration-500"
                style={{ left: 'var(--sidebar-width, 300px)' }}
            >
                <div className="w-full px-4 md:px-10 h-20 md:h-24 lg:h-32 flex items-center justify-end gap-3 md:gap-4 max-w-[1850px] mx-auto">
                    <Button variant="outline" className="h-12 md:h-14 px-6 md:px-8 rounded-none border-[#3B59DA]/20 text-[#3B59DA] font-bold hover:bg-slate-50 shadow-sm transition-all text-sm md:text-base">
                        Save a draft
                    </Button>
                    <Button 
                        className="h-12 md:h-14 px-6 md:px-10 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-none font-bold gap-2 md:gap-3 shadow-lg shadow-indigo-100 transition-all border-none text-sm md:text-base font-figtree"
                        onClick={() => setIsReviewModalOpen(true)}
                    >
                        Review & Close Kitchen <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClosingLockedUI() {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 min-h-[500px] md:min-h-[600px]">
            <Card className="w-full max-w-[650px] border border-slate-100 shadow-[0_32px_80px_rgba(0,0,0,0.06)] rounded-[32px] md:rounded-[48px] overflow-hidden bg-white p-8 md:p-16 space-y-8 md:space-y-10 flex flex-col items-center text-center">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl md:rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-400">
                    <Lock className="h-10 w-10 md:h-12 md:w-12 stroke-[2.5px]" />
                </div>
                
                <div className="space-y-3 md:space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">Closing is Locked</h2>
                    <p className="text-slate-500 font-bold text-base md:text-lg max-w-md mx-auto leading-relaxed">
                        The closing workflow is not yet available. Please ensure all daily prerequisites are met.
                    </p>
                </div>

                <div className="w-full bg-slate-50/50 rounded-[24px] md:rounded-[32px] border border-slate-100 p-6 md:p-8 text-left space-y-4 md:space-y-6">
                    <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Requirements</h3>
                    <div className="space-y-4">
                        <RequirementRow 
                            title="Complete Daily Stock Count"
                            subtitle="Must be reviewed and completed"
                            completed={true}
                        />
                        <div className="h-px bg-slate-100 mx-2" />
                        <RequirementRow 
                            title="Wait until 7:00 PM"
                            subtitle="Currently 4:15 PM"
                            completed={false}
                        />
                    </div>
                </div>

                <div className="w-full bg-[#F8FAFC] rounded-xl md:rounded-2xl p-4 md:p-6 flex items-start gap-3 md:gap-4 text-left border border-slate-100">
                    <div className="h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-lg md:rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                        <Info className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                        <p className="font-black text-slate-800 text-xs md:text-sm">Store Management</p>
                        <p className="text-slate-500 text-[10px] md:text-xs font-bold leading-relaxed">
                            Closing hours and reset times can be adjusted by admins in Settings.
                        </p>
                    </div>
                </div>

                <Button className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-lg md:text-xl shadow-xl shadow-indigo-100 transition-all font-outfit" asChild>
                    <Link href="/dashboard">Return to Home</Link>
                </Button>
            </Card>
        </div>
    );
}

function RequirementRow({ title, subtitle, completed }: { title: string, subtitle: string, completed: boolean }) {
    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 md:gap-4">
                <div className={cn(
                    "h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center",
                    completed ? "bg-green-50 text-green-500" : "bg-white border border-slate-200 text-slate-200"
                )}>
                    {completed ? <ClipboardCheck className="h-5 w-5 md:h-6 md:w-6" /> : <Clock className="h-5 w-5 md:h-6 md:w-6" />}
                </div>
                <div className="space-y-0.5">
                    <p className={cn("font-black text-base md:text-lg tracking-tight", completed ? "text-slate-800" : "text-slate-400")}>{title}</p>
                    <p className="text-[11px] md:text-sm font-bold text-slate-400">{subtitle}</p>
                </div>
            </div>
            {completed ? (
                <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                </div>
            ) : (
                <div className="h-6 w-6 md:h-7 md:w-7 rounded-full border-2 border-slate-200" />
            )}
        </div>
    );
}

function ClosingHeroOpen() {
    return (
        <div className="relative overflow-hidden rounded-none p-6 md:p-10 lg:p-14 shadow-2xl bg-gradient-to-r from-[#2B46CC] via-[#4A3AFF] to-[#7C3AED] text-white min-h-[300px] md:min-h-[340px] flex items-center w-full">
            {/* Design Watermark hide on mobile */}
            <div className="hidden md:block absolute -bottom-20 -right-20 opacity-[0.05] pointer-events-none scale-150">
                <ClipboardCheck className="h-[400px] w-[400px] -rotate-12" />
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 relative z-10 w-full items-center justify-between">
                <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
                    <div className="space-y-3 md:space-y-4">
                        <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-black tracking-tight leading-none font-inria">End of Day Count</h1>
                        <p className="text-indigo-100/80 text-base md:text-lg font-medium max-w-md mx-auto lg:mx-0">
                            Verify remaining stock to finalize daily usage reports.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 justify-center lg:justify-start">
                        <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
                            <svg className="h-full w-full -rotate-90">
                                <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                                <circle cx="56" cy="56" r="48" fill="none" stroke="#F8FAFC" strokeWidth="10" strokeDasharray="301.59" strokeDashoffset="211.11" strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-[18px] md:text-[22px] font-black">30%</span>
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <p className="text-[20px] md:text-[24px] font-black tracking-tight font-inria">Progress: 6 of 9 Items Counted</p>
                            <p className="text-indigo-100/60 font-medium text-[12px] md:text-sm max-w-[340px]">
                                Finish closing stock count to complete your restaurant operations for the day
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 md:gap-5 w-full sm:w-auto shrink-0">
                    <HeroStatSmall label="Items Used" value="17" description="Usage intensity" accent="#3B59DA" />
                    <HeroStatSmall label="Items Wasted" value="5" description="Total waste today" accent="#EF4444" />
                </div>
            </div>
        </div>
    );
}

function HeroStatSmall({ label, value, description, accent }: { label: string, value: string, description: string, accent: string }) {
    return (
        <div className="bg-white rounded-none p-5 md:p-6 w-full sm:w-[180px] md:w-[200px] lg:w-[220px] h-[160px] md:h-[180px] lg:h-[200px] shadow-lg flex flex-col justify-between group hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex items-center gap-3">
                <div 
                    className="h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-50 shadow-sm"
                    style={{ backgroundColor: `${accent}10`, color: accent }}
                >
                    {label.includes('Used') ? <Utensils className="h-4 w-4 md:h-5 md:w-5" /> : <Trash2 className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <span className="text-[11px] md:text-[12px] font-bold text-slate-500 font-outfit truncate">{label}</span>
            </div>
            <div className="space-y-0.5 md:space-y-1">
                <p className="text-[32px] md:text-[38px] lg:text-[42px] font-black text-[#1E293B] tracking-tight leading-none font-outfit">{value}</p>
                <p className="text-[11px] md:text-[12px] font-medium text-slate-400 min-h-[16px]">{description}</p>
            </div>
        </div>
    );
}

function ClosingCountRow({ item }: { item: InventoryItem }) {
    return (
        <div className="p-5 md:p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between bg-white border border-slate-100 rounded-none hover:shadow-sm transition-all group gap-6 md:gap-8">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 flex-1 w-full">
                {/* Product Info Section */}
                <div className="flex items-center gap-4 lg:gap-8 min-w-full lg:min-w-[260px]">
                    <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full border-[4px] lg:border-[6px] border-[#F8FAFC] flex items-center justify-center bg-white shadow-sm shrink-0">
                        <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-slate-100" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-[16px] lg:text-[20px] font-bold text-[#1E293B] tracking-tight leading-tight">{item.name}</h4>
                        <p className="text-[11px] lg:text-[12px] font-medium text-slate-400">Opening: <span className="text-slate-600 font-bold">10 units</span></p>
                    </div>
                </div>

                {/* Metrics Section */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-10 flex-1 w-full lg:w-auto">
                    <div className="space-y-0.5">
                        <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-tight">Today's Opening</p>
                        <p className="text-[14px] lg:text-[16px] font-bold text-[#1E293B]">10 units</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-tight">Today's Wastage</p>
                        <p className="text-[14px] lg:text-[16px] font-bold text-slate-300">--</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-tight">Amount Added Today</p>
                        <p className="text-[14px] lg:text-[16px] font-bold text-slate-300">--</p>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 lg:gap-8 shrink-0 w-full md:w-auto md:border-l border-slate-100 md:pl-8 pt-4 md:pt-0 border-t md:border-t-0">
                <div className="flex flex-col md:block text-center md:text-left min-w-[100px] md:min-w-[120px]">
                    <p className="text-[10px] lg:text-[11px] font-bold text-[#3B59DA] uppercase tracking-tight">Total Closing Stock:</p>
                    <p className="text-[18px] lg:text-[20px] font-black text-[#3B59DA]">10 units</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none h-10 md:h-12 px-4 md:px-6 rounded-none border-slate-200 font-bold text-[#1E293B]/70 hover:bg-slate-50 text-xs md:text-sm">
                        Edit Amount
                    </Button>
                    <Button className="flex-1 sm:flex-none h-10 md:h-12 px-6 md:px-8 rounded-none bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold shadow-md shadow-indigo-100/30 text-xs md:text-sm">
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
}

function ClosingSkeleton() {
    return (
        <div className="p-10 space-y-12 bg-white min-h-screen">
            <div className="flex justify-between items-center px-4">
                <Skeleton className="h-12 w-64 rounded-2xl" />
                <Skeleton className="h-14 w-[400px] rounded-2xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-[48px]" />
            <div className="space-y-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-[32px]" />)}
            </div>
        </div>
    );
}
