"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus as PlusIcon, 
  Search as SearchIcon, 
  RotateCcw as RefreshIcon, 
  Package as PackageIcon, 
  AlertCircle as AlertIcon, 
  AlertTriangle as WarningIcon, 
  CheckCircle2 as SuccessIcon, 
  Lock as LockIcon, 
  ArrowRight,
  TrendingUp as TrendUpIcon,
  Calendar,
  ClipboardList,
  ChefHat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { restaurantOpsService, RunningLowItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { motion } from "framer-motion";
import { 
    UnifiedHeroSurface, 
    UnifiedStatCard, 
    AppContainer, 
    InriaHeading, 
    FigtreeText 
} from "@/components/ui/dosteon-ui";

export default function InventoryPage() {
  const { isOpen } = useRestaurantDayLifecycle();
  const [runningLowItems, setRunningLowItems] = useState<RunningLowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lowItems = await restaurantOpsService.getRunningLowItems();
        setRunningLowItems(lowItems);
      } catch (err) {
        console.error("Failed to fetch inventory data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <InventorySkeleton />;
  }

  return (
    <AppContainer className="pb-24">
      {/* Hero Section / Main Stats Card */}
      <UnifiedHeroSurface
        variant="split"
        padding="px-6 py-4 md:px-10 md:py-4"
        minHeight="min-h-[240px]"
        backgroundColor={!isOpen ? undefined : "bg-[#f5f6ff]"}
        borderColor={!isOpen ? undefined : "border-[#98a6f9]"}
        title={!isOpen ? "Opening Prep" : "Inventory"}
        subtitle={isOpen ? "Manage your item stock levels and categories" : undefined}
        description="Do your opening stock count before starting your restaurant operations."
        isLocked={!isOpen}
        bgIcon={!isOpen ? <ChefHat className="h-64 w-64 text-white" /> : undefined}
        size="dense"
        badge={!isOpen ? (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 border-[#EF4444] bg-white w-fit shadow-sm">
                <ClipboardList className="h-4 w-4 text-[#EF4444]" />
                <FigtreeText className="text-[12px] font-semibold text-[#EF4444] uppercase tracking-[0.05em]">16 items need counting</FigtreeText>
            </div>
        ) : undefined}
        action={!isOpen ? (
            <Button className="w-fit h-14 px-10 rounded-2xl bg-white text-[#3B59DA] hover:bg-slate-50 font-semibold gap-4 transition-all shadow-xl shadow-indigo-900/5 font-figtree active:scale-95 group text-[18px] md:text-[20px]" asChild>
                <Link href="/dashboard/inventory/daily-stock-count">
                    Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Link>
            </Button>
        ) : undefined}
        topAction={isOpen ? (
            <div className="flex items-center gap-3">
                <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-[#3B59DA] bg-white hover:bg-slate-50 font-semibold gap-2.5 transition-all shadow-sm active:scale-95 font-figtree">
                    <RefreshIcon className="h-4 w-4" /> Update Inventory
                </Button>
                <Button className="h-12 px-8 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-xl font-semibold gap-2.5 transition-all border-none shadow-indigo-200 active:scale-95 font-figtree" asChild>
                    <Link href="/dashboard/inventory/new">
                        <PlusIcon className="h-4 w-4" /> Add New Product
                    </Link>
                </Button>
            </div>
        ) : undefined}
      >
        <UnifiedStatCard label="Total Inventory Items" value="100" subtext="up by 8% from last week" icon={PackageIcon} variant="neutral" className="flex-1 min-w-[200px]" />
        <UnifiedStatCard label="Healthy Stock" value="56" subtext="up by 8% from last week" icon={SuccessIcon} variant="green" className="flex-1 min-w-[200px]" />
        <UnifiedStatCard label="Low Stock" value="23" subtext="up by 8% from last week" icon={WarningIcon} variant="amber" className="flex-1 min-w-[200px]" />
        <UnifiedStatCard label="Critical" value="4" subtext="up by 8% from last week" icon={AlertIcon} variant="red" className="flex-1 min-w-[200px]" />
      </UnifiedHeroSurface>

      {/* What's Running Low Section */}
      <div className="mt-8 relative">
        <div className={cn(
            "relative",
            !isOpen && "blur-xl grayscale scale-[0.96] opacity-80 pointer-events-none"
        )}>
          <RunningLowPanel items={runningLowItems} />
          
          {/* See All Items Redirection inside the blurred area */}
          <div className="flex justify-end mt-12 mb-12">
              <Button 
                className="h-16 px-12 rounded-[22px] bg-white border-2 border-slate-100 text-[#3B59DA] hover:bg-[#3B59DA] hover:text-white hover:border-[#3B59DA] font-black transition-all shadow-sm text-[16px] font-figtree active:scale-95"
                asChild
              >
                <Link href="/dashboard/inventory/items">
                    See Master Product Registry
                </Link>
              </Button>
          </div>
        </div>

        {!isOpen && <InventoryLockedOverlay />}
      </div>
    </AppContainer>
  );
}

function RunningLowPanel({ items }: { items: RunningLowItem[] }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-sm p-8 md:p-10 mt-6"
        >
            <div className="flex items-end justify-between mb-10 px-2">
                <div className="space-y-1.5 pt-2">
                    <FigtreeText className="text-[12px] font-black text-red-500 uppercase tracking-[0.25em] leading-none mb-2">Operational Analytics</FigtreeText>
                    <InriaHeading className="text-[34px] md:text-[38px] font-bold tracking-tight text-[#1E293B]">What's Running Low</InriaHeading>
                </div>
                <div className="h-16 w-16 bg-red-50 rounded-[22px] flex items-center justify-center text-red-500 shadow-sm border border-red-100/30">
                    <WarningIcon className="h-7 w-7 stroke-[2.5px]" />
                </div>
            </div>
            
            <div className="space-y-4">
                {items.slice(0, 3).map((item) => (
                    <div 
                        key={item.id}
                        className="p-5 flex items-center justify-between bg-white border border-slate-50 rounded-[32px] transition-all group hover:border-[#3B59DA]/20 hover:bg-[#F8FAFF] hover:shadow-xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
                    >
                        <div className="flex items-center gap-8">
                            <div className="h-20 w-20 rounded-full border border-slate-100 bg-white shadow-sm shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-slate-50 p-6 text-slate-100 flex items-center justify-center">
                                        <PackageIcon className="h-8 w-8 text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5 overflow-hidden">
                                <InriaHeading className="text-[22px] md:text-[24px] font-bold truncate leading-none text-[#1E293B] group-hover:text-[#3B59DA] transition-colors">{item.name}</InriaHeading>
                                <div className="flex items-center gap-4">
                                    <FigtreeText className="text-[13px] font-black text-slate-400 tabular-nums uppercase tracking-[0.1em]">{item.unitsLeftLabel} REMAINING</FigtreeText>
                                    <div className="px-3 py-1 bg-red-100 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-200/50">
                                        CRITICAL {item.needLabel || 'REFRESH'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <Button variant="outline" className="h-14 px-10 rounded-[20px] border-slate-200 bg-white font-black text-[#1E293B]/70 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all text-[15px] font-figtree active:scale-95 shadow-sm" asChild>
                            <Link href={`/dashboard/inventory/${item.id}`}>
                                View Stats
                            </Link>
                        </Button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function InventoryLockedOverlay() {
    return (
        <div className="absolute inset-x-0 top-0 bottom-0 z-[60] flex flex-col items-center justify-center select-none rounded-[40px] overflow-hidden">
            {/* Blurriness that integrates with the items behind */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[12px]" />
            
            <div className="relative z-[70] flex flex-col items-center justify-center max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 bg-slate-900/10 backdrop-blur-3xl rounded-[20px] flex items-center justify-center mb-8 border border-white/20 shadow-sm">
                    <LockIcon className="h-9 w-9 text-slate-800 stroke-[2px]" />
                </div>
                
                <div className="space-y-4 max-w-[420px] text-center">
                    <h2 className="text-[28px] md:text-[34px] font-semibold text-[#1E293B] tracking-tight leading-none font-figtree">Inventory Service is Locked</h2>
                    <FigtreeText className="text-slate-600/80 text-[14px] md:text-[16px] leading-relaxed font-medium max-w-[340px] mx-auto">
                        The Inventory Service workflow is not yet available. Please do your daily stock count before you proceed.
                    </FigtreeText>
                </div>
 
                <div className="mt-10 w-full flex justify-center px-6">
                    <Button 
                        className="h-16 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[20px] font-semibold gap-4 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 group font-figtree text-[17px]" 
                        asChild
                    >
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function InventorySkeleton() {
    return (
        <div className="p-10 space-y-12 min-h-screen bg-white">
            <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-64 rounded-2xl" />
                <Skeleton className="h-14 w-80 rounded-2xl" />
            </div>
            <Skeleton className="h-[440px] w-full rounded-2xl" />
        </div>
    );
}
