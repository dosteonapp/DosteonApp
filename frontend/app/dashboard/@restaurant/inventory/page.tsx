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
  const [stats, setStats] = useState<any>({ totalItems: 0, healthy: 0, low: 0, critical: 0, changes: { total: 0, healthy: 0, low: 0, critical: 0 } });
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lowItems, dashboardStats] = await Promise.all([
          restaurantOpsService.getRunningLowItems(),
          restaurantOpsService.getStats()
        ]);
        setRunningLowItems(lowItems);
        setStats(dashboardStats);
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
      {/* Top Header Region (Only visible when locked) */}
      {!isOpen && (
        <div className="space-y-6 mb-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
              <span>Inventory</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                  <InriaHeading className="text-[32px] md:text-[38px] font-bold tracking-tight text-[#1E293B]">Inventory</InriaHeading>
                  <FigtreeText className="text-slate-400 font-semibold text-[15px]">Manage your item stock levels and categories</FigtreeText>
              </div>
              
              <div className="flex items-center gap-3">
                  <Button variant="outline" className="h-11 px-6 rounded-[8px] border-slate-200 text-[#3B59DA] bg-white hover:bg-slate-50 font-bold gap-3 shadow-none transition-all active:scale-95 font-figtree text-[14px]">
                      <RefreshIcon className="h-4 w-4" /> Update Inventory
                  </Button>
                  <Button className="h-11 px-7 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-[8px] font-bold gap-3 transition-all border-none shadow-xl shadow-indigo-100 active:scale-95 font-figtree text-[14px]" asChild>
                      <Link href="/dashboard/inventory/new">
                          <PlusIcon className="h-4 w-4" /> Add New Product
                      </Link>
                  </Button>
              </div>
          </div>
        </div>
      )}

      {/* Hero Section / Main Stats Card */}
      <UnifiedHeroSurface
        variant={!isOpen ? "inline" : "standard"}
        className="shadow-[0_20px_60px_rgba(59,89,218,0.04)]"
        padding={!isOpen ? "px-8 pt-4 pb-12 md:px-14 md:pt-4 md:pb-16" : "px-8 py-8 md:px-10 md:py-10"}
        minHeight={!isOpen ? "min-h-[380px]" : "min-h-[260px]"}
        backgroundColor={!isOpen ? undefined : "bg-[#f5f6ff]"}
        borderColor={!isOpen ? undefined : "border-[#98a6f9]"}
        title={!isOpen ? "Closed" : "Inventory"}
        subtitle={isOpen ? "Manage your item stock levels and categories" : undefined}
        description={!isOpen ? "Do your opening stock count before starting your restaurant operations." : undefined}
        isLocked={!isOpen}
        bgIcon={!isOpen ? <PackageIcon className="h-64 w-64 text-white" /> : undefined}
        badge={!isOpen ? (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 bg-white shadow-sm w-fit">
                <ClipboardList className="h-4 w-4 text-[#3B59DA]" />
                <FigtreeText className="text-[12px] font-bold text-[#3B59DA] tracking-tight uppercase">{stats.totalItems} items need counting</FigtreeText>
            </div>
        ) : undefined}
        topAction={isOpen && (
            <div className="flex items-center gap-3">
                <Button variant="outline" className="h-10 px-5 rounded-[8px] border-slate-200 text-[#3B59DA] bg-white hover:bg-slate-50 font-bold gap-2.5 transition-all shadow-sm active:scale-95 font-figtree text-sm">
                    <RefreshIcon className="h-4 w-4" /> Update Inventory
                </Button>
                <Button className="h-10 px-6 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-[8px] font-bold gap-2.5 transition-all border-none shadow-lg shadow-indigo-100 active:scale-95 font-figtree text-sm" asChild>
                    <Link href="/dashboard/inventory/new">
                        <PlusIcon className="h-4 w-4" /> Add New Product
                    </Link>
                </Button>
            </div>
        )}
        action={!isOpen ? (
            <Button className="w-fit h-14 px-10 rounded-[8px] bg-white text-[#3B59DA] hover:bg-slate-50 font-bold gap-4 transition-all shadow-xl shadow-indigo-900/10 font-figtree active:scale-95 group text-[18px] border-none" asChild>
                <Link href="/dashboard/inventory/daily-stock-count">
                    Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Link>
            </Button>
        ) : undefined}
      >
        <div className={cn(
            "w-full h-full",
            !isOpen ? "flex flex-col lg:flex-row items-start justify-between gap-10" : "flex flex-col xl:flex-row items-end justify-between gap-10"
        )}>
            {isOpen && (
                <div className="max-w-[400px] mb-2 shrink-0">
                    <FigtreeText className="text-slate-400 font-medium text-[15px] leading-relaxed">
                        Closing Stock Count will be enabled at 7 PM. If you want to change the Closing Stock Count time, your can admin change it in the store management settings.
                    </FigtreeText>
                </div>
            )}
            
            <div className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full flex-1",
                isOpen ? "xl:w-auto" : ""
            )}>
                <UnifiedStatCard 
                    label="Total Inventory Items" 
                    value={stats.totalItems.toString()} 
                    subtext={
                        <span className={cn(
                            "flex items-center gap-1.5 font-bold text-[11px]",
                            (stats.changes?.total || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            <TrendUpIcon className={cn("h-3.5 w-3.5", (stats.changes?.total || 0) < 0 && "rotate-180")} /> 
                            {Math.abs(stats.changes?.total || 0)}% from last week
                        </span>
                    } 
                    icon={PackageIcon} 
                    variant="indigo" 
                    className="h-[160px] md:h-[190px] w-full shadow-sm" 
                />
                <UnifiedStatCard 
                    label="Healthy Stock" 
                    value={stats.healthy.toString()} 
                    subtext={
                        <span className={cn(
                            "flex items-center gap-1.5 font-bold text-[11px]",
                            (stats.changes?.healthy || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            <TrendUpIcon className={cn("h-3.5 w-3.5", (stats.changes?.healthy || 0) < 0 && "rotate-180")} /> 
                            {Math.abs(stats.changes?.healthy || 0)}% from last week
                        </span>
                    } 
                    icon={SuccessIcon} 
                    variant="green" 
                    className="h-[160px] md:h-[190px] w-full shadow-sm" 
                />
                <UnifiedStatCard 
                    label="Low Stock" 
                    value={stats.low.toString()} 
                    subtext={
                        <span className={cn(
                            "flex items-center gap-1.5 font-bold text-[11px]",
                            (stats.changes?.low || 0) >= 0 ? "text-rose-500" : "text-emerald-500" // Low stock going up is usually bad
                        )}>
                            <TrendUpIcon className={cn("h-3.5 w-3.5", (stats.changes?.low || 0) < 0 && "rotate-180")} /> 
                            {Math.abs(stats.changes?.low || 0)}% from last week
                        </span>
                    } 
                    icon={WarningIcon} 
                    variant="amber" 
                    className="h-[160px] md:h-[190px] w-full shadow-sm" 
                />
                <UnifiedStatCard 
                    label="Critical" 
                    value={stats.critical.toString()} 
                    subtext={
                        <span className={cn(
                            "flex items-center gap-1.5 font-bold text-[11px]",
                            (stats.changes?.critical || 0) >= 0 ? "text-rose-500" : "text-emerald-500"
                        )}>
                            <TrendUpIcon className={cn("h-3.5 w-3.5", (stats.changes?.critical || 0) < 0 && "rotate-180")} /> 
                            {Math.abs(stats.changes?.critical || 0)}% from last week
                        </span>
                    } 
                    icon={AlertIcon} 
                    variant="red" 
                    className="h-[160px] md:h-[190px] w-full shadow-sm" 
                />

            </div>
        </div>
      </UnifiedHeroSurface>

      <div className="mt-8 relative">
          <div className={cn(
            "bg-white border border-slate-100 rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all duration-700 overflow-hidden",
            !isOpen && "blur-[4px] grayscale-[0.2] opacity-90 pointer-events-none select-none"
          )}>
            {isOpen ? (
                /* ACTUAL CONTENT: Running Low Panel & Actions when unlocked */
                <div className="p-8 md:p-10">
                    <RunningLowPanel items={runningLowItems} />
                    
                    <div className="flex justify-end mt-12 mb-4">
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
            ) : (
                /* GHOST CONTENT: Darker elements to remain visible through the blur */
                <div className="p-8 md:p-12 space-y-10">
                    {/* Ghost Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-5">
                        <div className="h-12 bg-slate-100 rounded-[8px] flex-1 border border-slate-200" />
                        <div className="h-12 bg-slate-100 rounded-[8px] w-full md:w-48 border border-slate-200" />
                        <div className="h-12 bg-slate-100 rounded-[8px] w-full md:w-48 border border-slate-200" />
                    </div>
                    
                    {/* Ghost Table Headers */}
                    <div className="w-full border border-slate-100 rounded-[10px] overflow-hidden">
                        <div className="bg-slate-50 h-14 flex items-center px-8 gap-12 border-b border-slate-200">
                            <div className="w-40 h-4 bg-slate-200 rounded-full" />
                            <div className="w-28 h-4 bg-slate-200 rounded-full" />
                            <div className="w-28 h-4 bg-slate-200 rounded-full" />
                            <div className="w-20 h-4 bg-slate-200 rounded-full" />
                        </div>
                        
                        {/* Ghost Table Rows */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-24 flex items-center px-8 gap-12 border-b border-slate-100 last:border-none">
                                <div className="h-12 w-12 bg-slate-200 rounded-[8px] shrink-0" />
                                <div className="space-y-3 flex-1">
                                    <div className="w-[50%] h-4 bg-slate-300 rounded-full" />
                                    <div className="w-[20%] h-3 bg-slate-100 rounded-full" />
                                </div>
                                <div className="w-28 h-4 bg-slate-200 rounded-full hidden md:block" />
                                <div className="w-28 h-4 bg-slate-200 rounded-full hidden md:block" />
                                <div className="w-20 h-8 bg-slate-200 rounded-[6px] shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto rounded-[12px] overflow-hidden">
            {/* Real Frosted glass effect - Reduced opacity and controlled blur */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
            
            <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-white/80 backdrop-blur-xl rounded-[16px] flex items-center justify-center mb-10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white">
                    <LockIcon className="h-9 w-9 text-slate-900/80 stroke-[2px]" />
                </div>
                
                <div className="space-y-4 max-w-[440px] text-center mb-12">
                    <h2 className="text-[30px] md:text-[36px] font-bold text-[#1E293B] tracking-tight leading-tight font-inria">Kitchen Service is Closed</h2>
                    <FigtreeText className="text-slate-600/90 text-[15px] md:text-[17px] leading-relaxed font-bold max-w-[360px] mx-auto opacity-80">
                        The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                    </FigtreeText>
                </div>
 
                <Button 
                    className="h-16 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-bold gap-4 shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 group font-figtree text-[18px] border-none" 
                    asChild
                >
                    <Link href="/dashboard/inventory/daily-stock-count">
                        Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Link>
                </Button>
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
