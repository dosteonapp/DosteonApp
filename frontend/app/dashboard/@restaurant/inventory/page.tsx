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
        variant="standard"
        className="shadow-[0_20px_60px_rgba(59,89,218,0.04)]"
        padding="px-8 py-8 md:px-10 md:py-10"
        minHeight="min-h-[260px]"
        backgroundColor={!isOpen ? undefined : "bg-[#f5f6ff]"}
        borderColor={!isOpen ? undefined : "border-[#98a6f9]"}
        title={!isOpen ? "Opening Prep" : "Inventory"}
        subtitle={isOpen ? "Manage your item stock levels and categories" : undefined}
        isLocked={!isOpen}
        bgIcon={!isOpen ? <ChefHat className="h-64 w-64 text-white" /> : undefined}
        badge={!isOpen ? (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 border-[#EF4444] bg-white w-fit shadow-sm">
                <ClipboardList className="h-4 w-4 text-[#EF4444]" />
                <FigtreeText className="text-[12px] font-semibold text-[#EF4444] uppercase tracking-[0.05em]">16 items need counting</FigtreeText>
            </div>
        ) : undefined}
        topAction={isOpen ? (
            <div className="flex items-center gap-4">
                <Button variant="outline" className="h-10 px-5 rounded-[8px] border-slate-200 text-[#3B59DA] bg-white hover:bg-slate-50 font-bold gap-2.5 transition-all shadow-sm active:scale-95 font-figtree text-sm">
                    <RefreshIcon className="h-4 w-4" /> Update Inventory
                </Button>
                <Button className="h-10 px-6 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-[8px] font-bold gap-2.5 transition-all border-none shadow-lg shadow-indigo-100 active:scale-95 font-figtree text-sm" asChild>
                    <Link href="/dashboard/inventory/new">
                        <PlusIcon className="h-4 w-4" /> Add New Product
                    </Link>
                </Button>
            </div>
        ) : undefined}
        action={!isOpen ? (
            <Button className="w-fit h-14 px-10 rounded-[8px] bg-white text-[#3B59DA] hover:bg-slate-50 font-semibold gap-4 transition-all shadow-xl shadow-indigo-900/5 font-figtree active:scale-95 group text-[18px] md:text-[20px]" asChild>
                <Link href="/dashboard/inventory/daily-stock-count">
                    Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Link>
            </Button>
        ) : undefined}
      >
        <div className="flex flex-col xl:flex-row items-end justify-between w-full gap-10">
            {isOpen && (
                <div className="max-w-[400px] mb-2 shrink-0">
                    <FigtreeText className="text-slate-400 font-medium text-[15px] leading-relaxed">
                        Closing Stock Count will be enabled at 7 PM. If you want to change the Closing Stock Count time, your can admin change it in the store management settings.
                    </FigtreeText>
                </div>
            )}
            {!isOpen && (
                <div className="max-w-xl pb-2">
                    <FigtreeText className="text-white/70 font-medium text-[15px] leading-relaxed">
                        Do your opening stock count before starting your restaurant operations.
                    </FigtreeText>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full xl:w-auto">
                <UnifiedStatCard label="Total Inventory" value="100" subtext="up by 8% from last week" icon={PackageIcon} variant="indigo" className="hover:shadow-lg hover:shadow-indigo-900/5" />
                <UnifiedStatCard label="Healthy Stock" value="56" subtext="up by 8% from last week" icon={SuccessIcon} variant="green" className="hover:shadow-lg hover:shadow-indigo-900/5" />
                <UnifiedStatCard label="Low Stock" value="23" subtext="up by 8% from last week" icon={WarningIcon} variant="amber" className="hover:shadow-lg hover:shadow-indigo-900/5" />
                <UnifiedStatCard label="Critical" value="4" subtext="up by 8% from last week" icon={AlertIcon} variant="red" className="hover:shadow-lg hover:shadow-indigo-900/5" />
            </div>
        </div>
      </UnifiedHeroSurface>

      {/* What's Running Low Section */}
      <div className="mt-12 relative">
        <div className={cn(
            "relative",
            !isOpen && "blur-xl grayscale scale-[0.96] opacity-80 pointer-events-none"
        )}>
          <RunningLowPanel items={runningLowItems} />
          
          {/* See All Items Redirection inside the blurred area */}
          <div className="flex justify-end mt-12 mb-12">
              <Button 
                className="h-11 px-8 rounded-[8px] bg-[#F0F4FF] text-[#3B59DA] hover:bg-[#3B59DA] hover:text-white font-bold transition-all shadow-sm text-sm font-figtree active:scale-95 border border-indigo-100"
                asChild
              >
                <Link href="/dashboard/inventory/items">
                    See All Items
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
            className="rounded-[10px] border border-red-500 bg-white overflow-hidden shadow-sm p-8 md:p-10 mt-6"
        >
            <div className="flex items-center gap-3 mb-6 px-1">
                <WarningIcon className="h-5 w-5 text-red-500 stroke-[2.5px]" />
                <h3 className="text-base font-bold text-red-500 font-figtree tracking-tight">What's Running Low</h3>
            </div>
            
            <div className="space-y-4">
                {items.slice(0, 3).map((item) => (
                    <div 
                        key={item.id}
                        className="p-6 flex items-center justify-between bg-white border border-slate-100 rounded-[8px] transition-all shadow-sm hover:shadow-md hover:border-[#3B59DA]/20 active:scale-[0.98] group cursor-pointer"
                    >
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-[8px] overflow-hidden border border-slate-100 shrink-0">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-slate-50 flex items-center justify-center">
                                        <PackageIcon className="h-6 w-6 text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[18px] font-bold text-[#1E293B] font-figtree leading-none">{item.name}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-[13px] font-medium text-slate-400 font-figtree">{item.unitsLeftLabel} units left</span>
                                    <span className="text-slate-300">•</span>
                                    <Badge className="bg-rose-50 text-rose-500 font-bold text-[10px] px-2 py-0.5 rounded-[6px] border-none shadow-none uppercase font-figtree">
                                        Need {item.needLabel || '10kg'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        
                        <Button variant="outline" className="h-12 px-6 rounded-[8px] border-slate-200 bg-white font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all text-sm font-figtree active:scale-95" asChild>
                            <Link href={`/dashboard/inventory/${item.id}`}>
                                View Item
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
        <div className="absolute inset-x-0 top-0 bottom-0 z-[60] flex flex-col items-center justify-center select-none rounded-[10px] overflow-hidden">
            {/* Blurriness that integrates with the items behind */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[12px]" />
            
            <div className="relative z-[70] flex flex-col items-center justify-center max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 bg-slate-900/10 backdrop-blur-3xl rounded-[10px] flex items-center justify-center mb-8 border border-white/20 shadow-sm">
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
                        className="h-16 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[8px] font-semibold gap-4 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 group font-figtree text-[17px]" 
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
                <Skeleton className="h-12 w-64 rounded-[8px]" />
                <Skeleton className="h-14 w-80 rounded-[8px]" />
            </div>
            <Skeleton className="h-[440px] w-full rounded-[10px]" />
        </div>
    );
}
