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
import { Card, CardContent } from "@/components/ui/card";
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
import { ReviewClosingChecklistModal } from "@/components/kitchen/ReviewClosingChecklistModal";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";
import { 
    UnifiedHeroSurface, 
    UnifiedStatCard, 
    AppContainer, 
    InriaHeading, 
    FigtreeText,
    UnifiedListRow,
    PrimarySurfaceCard
} from "@/components/ui/dosteon-ui";

export default function ClosingPage() {
  const { isOpen } = useRestaurantDayLifecycle();
  const { isSidebarCollapsed } = useSidebar();
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
    itemsChecked: Math.floor(items.length * 0.6),
    itemsTotal: items.length,
    alerts: items.filter(i => i.status === 'Low' || i.status === 'Critical').length,
    closingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  return (
    <AppContainer className="pb-32">
        <ReviewClosingChecklistModal 
            open={isReviewModalOpen}
            onOpenChange={setIsReviewModalOpen}
            summary={closingSummary}
        />


        {/* Hero Section or Locked State */}
        <div className="w-full">
            {!isOpen ? (
                <div className="flex items-start py-20 min-h-[60vh]">
                     <ClosingLockedCard />
                </div>
            ) : (
                <div className="space-y-12">
                    <UnifiedHeroSurface
                        variant="standard"
                        centerContent={true}
                        padding="px-6 py-8 md:px-10 md:py-8"
                        minHeight="min-h-[320px]"
                        title="End of Day Count"
                        subtitle="Verify remaining stock to finalize daily usage reports."
                        isLocked={true}
                        badge={
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm w-fit">
                                <Clock className="h-3.5 w-3.5 text-white" />
                                <FigtreeText className="text-[12px] font-semibold text-white uppercase tracking-[0.1em]">CLOSING IN PROGRESS</FigtreeText>
                            </div>
                        }
                        action={
                            <div className="flex items-center gap-6">
                                <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                                    <svg className="h-full w-full -rotate-90">
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="40%"
                                            stroke="rgba(255,255,255,0.1)"
                                            strokeWidth="8"
                                            fill="transparent"
                                        />
                                        <motion.circle
                                            initial={{ strokeDashoffset: 251 }}
                                            animate={{ strokeDashoffset: 251 - (251 * 30) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            cx="50%"
                                            cy="50%"
                                            r="40%"
                                            stroke="white"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={251}
                                            strokeLinecap="round"
                                            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FigtreeText className="text-[18px] font-semibold text-white leading-none">30%</FigtreeText>
                                    </div>
                                </div>
                                <div className="space-y-1 align-middle">
                                    <FigtreeText className="text-[20px] font-semibold text-white tracking-tight leading-none whitespace-nowrap">Progress: 6 of 9 Items Counted</FigtreeText>
                                    <FigtreeText className="text-white/60 font-normal text-[14px] leading-relaxed lg:whitespace-nowrap">Finish closing stock count to complete your restaurant operations for the day</FigtreeText>
                                </div>
                            </div>
                        }
                    >
                        <UnifiedStatCard 
                          label="Items Used" 
                          value="17" 
                          subtext="Usage intensity" 
                          icon={Package}
                          variant="indigo"
                          className="flex-1 min-w-[280px] max-w-[450px] h-[180px] md:h-[220px] lg:h-[260px]"
                        />
                        <UnifiedStatCard 
                          label="Items Wasted" 
                          value="5" 
                          icon={Trash2}
                          variant="red"
                          className="flex-1 min-w-[280px] max-w-[450px] h-[180px] md:h-[220px] lg:h-[260px]"
                        />
                    </UnifiedHeroSurface>
                    
                    {/* Items Section */}
                    <PrimarySurfaceCard className="p-8 md:p-10 space-y-10">
                        {/* Toolbar */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                            <div className="relative w-full xl:max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search items..." 
                                    className="pl-12 h-[52px] border-slate-200 rounded-xl bg-slate-50/50 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus-visible:ring-indigo-500/10 transition-all shadow-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                                <Select>
                                    <SelectTrigger className="h-[52px] border-slate-200 rounded-xl w-full sm:w-[200px] bg-white font-semibold text-slate-600 text-sm shadow-sm px-5 hover:border-indigo-100 transition-all focus:ring-0">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                </Select>
                                <Select>
                                    <SelectTrigger className="h-[52px] border-slate-200 rounded-xl w-full sm:w-[200px] bg-white font-semibold text-slate-600 text-sm shadow-sm px-5 hover:border-indigo-100 transition-all focus:ring-0">
                                        <SelectValue placeholder="All Levels" />
                                    </SelectTrigger>
                                </Select>
                            </div>
                        </div>

                        {/* List - Wrapped in local horizontal scroll to prevent page overflow issues */}
                        <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-6 -mx-2 px-2">
                            <div className="space-y-4 min-w-[1000px] xl:min-w-0">
                                {items.slice(0, 6).map((item) => (
                                    <ClosingCountRow key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    </PrimarySurfaceCard>
                </div>
            )}
        </div>

        {/* Fixed Closing Action Footer */}
        {isOpen && (
            <div 
                className={cn(
                    "fixed bottom-0 right-0 left-0 transition-all duration-500 z-[100] p-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 flex items-center justify-end shadow-[0_-20px_50px_rgba(0,0,0,0.05)]",
                    isSidebarCollapsed ? "md:left-[90px]" : "md:left-[300px]"
                )}
            >
                <div className="w-full h-24 px-8 flex items-center justify-end gap-6">
                    <Button 
                        variant="outline"
                        className="h-16 px-12 rounded-[22px] border-slate-200 bg-white font-black text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all text-[16px] font-figtree shadow-sm active:scale-95"
                    >
                        Save a draft
                    </Button>
                    <Button 
                        className="h-16 px-14 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[22px] font-black gap-4 shadow-2xl shadow-indigo-900/10 border-none text-[18px] transition-all active:scale-95 font-figtree"
                        onClick={() => setIsReviewModalOpen(true)}
                    >
                        Review & Close Kitchen <ArrowRight className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        )}
    </AppContainer>
  );
}

function ClosingHeroOpen({ summary }: { summary: any }) {
    const progress = Math.round((summary.itemsChecked / summary.itemsTotal) * 100);
    
    return (
        <div className="relative rounded-[32px] p-10 md:p-14 lg:p-16 border border-[#3B59DA]/20 bg-gradient-to-br from-[#1E1B4B] via-[#3730A3] to-[#4F46E5] text-white flex flex-col lg:flex-row gap-12 items-center justify-between shadow-2xl w-full min-h-[400px] overflow-hidden">
            {/* Abstract Background Design */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.08] z-0">
                <div className="absolute -top-1/4 -right-1/4 w-[900px] h-[900px] bg-white rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[100px]" />
            </div>

            <div className="flex flex-col justify-center text-left max-w-xl shrink-0 z-10 space-y-12">
                <div className="space-y-4">
                     <h2 className="text-[44px] md:text-[54px] font-bold tracking-tight leading-none text-white font-inria">End of Day Count</h2>
                     <p className="text-white/80 text-[18px] md:text-[20px] font-medium leading-relaxed font-figtree">
                        Verify remaining stock to finalize daily usage reports.
                     </p>
                </div>
                
                <div className="flex items-center gap-10">
                    {/* Circular Progress from Screenshot 2 */}
                    <div className="relative h-32 w-32 shrink-0">
                        <svg className="h-full w-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="white"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={351.85}
                                strokeDashoffset={351.85 - (351.85 * 30) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-in-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[22px] font-black font-figtree">30%</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-[24px] font-bold text-white font-figtree">Progress: {summary.itemsChecked} of {summary.itemsTotal} Items Counted</h3>
                        <p className="text-white/60 font-medium text-[15px] font-figtree leading-relaxed">Finish closing stock count to complete your restaurant operations for the day</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1 w-full lg:max-w-xl z-10">
                <ClosingStatCard 
                  label="Items Used" 
                  value="17" 
                  subtext="Usage intensity" 
                  icon={Droplets}
                />
                <ClosingStatCard 
                  label="Items Wasted" 
                  value="5" 
                  subtext="Reduced today" 
                  icon={Trash2}
                />
            </div>
        </div>
    );
}

function ClosingStatCard({ label, value, subtext, icon: Icon }: { label: string, value: string, subtext: string, icon: any }) {
    return (
        <Card className="rounded-[28px] border-none bg-white p-8 space-y-6 shadow-xl hover:scale-[1.02] transition-all duration-300 group font-figtree">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-[18px] bg-[#F8F9FF] text-[#3B59DA] flex items-center justify-center transition-colors shadow-sm group-hover:bg-indigo-50">
                    <Icon className="h-6 w-6" />
                </div>
                <p className="text-[14px] font-bold text-[#64748B] font-figtree uppercase tracking-widest">{label}</p>
            </div>
            <div className="space-y-2 overflow-hidden">
                <div className="text-[44px] font-black tracking-tighter text-[#1E293B] group-hover:text-[#3B59DA] transition-all leading-none">{value}</div>
                <div className="text-[14px] font-semibold text-slate-400 font-figtree leading-relaxed">{subtext}</div>
            </div>
        </Card>
    );
}

function ClosingCountRow({ item }: { item: InventoryItem }) {
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
                        <FigtreeText className="text-[11px] font-black text-[#3B59DA] uppercase tracking-[0.2em] leading-none">Verified Closing Balance</FigtreeText>
                        <p className="text-[28px] font-black text-[#3B59DA] font-figtree leading-none tabular-nums truncate">1.2k <span className="text-[14px] font-bold text-[#3B59DA]/30 uppercase ml-0.5">{item.unit}</span></p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full xl:w-auto shrink-0 border-t xl:border-t-0 pt-6 xl:pt-0 xl:border-l border-slate-50 xl:pl-8">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all font-figtree shadow-sm text-[15px] flex-1 xl:flex-none active:scale-95 bg-white">
                        Edit Final Count
                    </Button>
                    <Button className="h-14 px-10 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black transition-all border-none font-figtree shadow-2xl shadow-indigo-900/10 text-[16px] flex-1 xl:flex-none min-w-[160px] active:scale-95">
                        Verify Closing
                    </Button>
                </div>
            </div>
        </UnifiedListRow>
    );
}

function ClosingLockedCard() {
    return (
        <PrimarySurfaceCard className="w-full p-12 md:p-16 flex flex-col items-start animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden font-figtree">
             {/* Header Lock Icon */}
            <div className="h-24 w-24 bg-[#F8FAFC] rounded-[28px] flex items-center justify-center mb-10 shadow-sm border border-slate-100 relative z-10">
                <Lock className="h-10 w-10 text-slate-300 stroke-[1.5px]" />
            </div>
            
            <div className="text-center space-y-4 mb-14 relative z-10">
                <InriaHeading className="text-[34px] font-bold leading-none">Closing is Locked</InriaHeading>
                <FigtreeText className="font-medium text-[16px] max-w-sm mx-auto leading-relaxed">
                    The closing workflow is not yet available. Please ensure all daily prerequisites are met.
                </FigtreeText>
            </div>
            
            <div className="w-full bg-[#F8FAFC]/50 border border-slate-100 rounded-[28px] p-8 md:p-10 space-y-8 mb-14 relative z-10">
                <div className="flex items-center justify-between pb-6 border-b border-slate-200/50">
                    <FigtreeText className="text-[13px] font-bold uppercase tracking-widest">Requirements</FigtreeText>
                </div>

                <div className="flex items-center justify-between group">
                    <div className="flex gap-6 items-center">
                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 transition-transform group-hover:scale-110 duration-300">
                            <ClipboardCheck className="h-6 w-6 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <InriaHeading className="text-[17px] font-black">Complete Daily Stock Count</InriaHeading>
                            <FigtreeText className="text-[14px] font-medium">Must be reviewed and completed</FigtreeText>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                </div>
                
                <div className="flex items-center justify-between group">
                    <div className="flex gap-6 items-center">
                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 transition-transform group-hover:scale-110 duration-300">
                            <Clock className="h-6 w-6 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <InriaHeading className="text-[17px] font-black">Wait until 7:00 PM</InriaHeading>
                            <FigtreeText className="text-[14px] font-medium">Currently 4:15 PM</FigtreeText>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-slate-200 flex items-center justify-center" />
                </div>
                
                <div className="mt-8 p-8 bg-white rounded-[24px] flex gap-6 items-center border border-slate-100 shadow-sm">
                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                        <Info className="h-6 w-6 text-slate-300" />
                    </div>
                    <div className="space-y-0.5">
                        <FigtreeText className="text-[16px] font-black text-[#1E293B]">Store Management</FigtreeText>
                        <FigtreeText className="text-[14px] font-medium leading-relaxed">Closing hours and reset times can be adjusted by admins in Settings.</FigtreeText>
                    </div>
                </div>
            </div>
            
            <Button className="w-full h-20 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[24px] font-black text-[19px] shadow-[0_25px_50px_-12px_rgba(59,89,218,0.4)] border-none transition-all active:scale-95 group relative z-10" asChild>
                <Link href="/dashboard">
                    Return to Home <ArrowRight className="ml-3 h-7 w-7 transition-transform group-hover:translate-x-3" />
                </Link>
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
