"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus as PlusIcon,
  RotateCcw as RefreshIcon,
  Package as PackageIcon,
  AlertCircle as AlertIcon,
  AlertTriangle as WarningIcon,
  CheckCircle2 as SuccessIcon,
  TrendingUp as TrendUpIcon,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { restaurantOpsService, RunningLowItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { useUser } from "@/context/UserContext";
import { canWriteInventory } from "@/lib/permissions";
import { motion } from "framer-motion";
import {
    UnifiedHeroSurface,
    UnifiedStatCard,
    AppContainer,
    InriaHeading,
    FigtreeText,
    UnifiedErrorBanner
} from "@/components/ui/dosteon-ui";

export default function InventoryPage() {
  const { isOpen } = useRestaurantDayLifecycle();
  const { user } = useUser();
  const hasInventoryWrite = canWriteInventory(user?.role);
  const [runningLowItems, setRunningLowItems] = useState<RunningLowItem[]>([]);
  const [stats, setStats] = useState<any>({ totalItems: 0, healthy: 0, low: 0, critical: 0, changes: { total: 0, healthy: 0, low: 0, critical: 0 } });
  const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


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
                setError("We couldn't load your inventory dashboard. Please try again or refresh the page.");
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
      {error && <UnifiedErrorBanner message={error} />}

      {/* Page Header — title + actions, always visible */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <InriaHeading className="text-[28px] md:text-[32px] font-bold tracking-tight">Inventory</InriaHeading>
          <FigtreeText className="text-slate-400 font-medium text-[14px]">Manage your item stock levels and categories</FigtreeText>
        </div>
        {hasInventoryWrite && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={!isOpen}
              className={cn(
                "h-11 px-6 rounded-[8px] border-slate-200 text-[#3B59DA] bg-white font-bold gap-2.5 transition-all shadow-sm font-figtree text-[14px]",
                !isOpen ? "opacity-40 cursor-not-allowed pointer-events-none" : "hover:bg-slate-50 active:scale-95"
              )}
            >
              <RefreshIcon className="h-4 w-4" /> Update Inventory
            </Button>
            <Button className="h-11 px-7 bg-[#3B59DA] text-white hover:bg-[#2F47AF] rounded-[8px] font-bold gap-2.5 transition-all border-none shadow-lg shadow-indigo-100 active:scale-95 font-figtree text-[14px]" asChild>
              <Link href="/dashboard/inventory/new">
                <PlusIcon className="h-4 w-4" /> Add New Product
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Hero Card */}
      {!isOpen ? (
        <UnifiedHeroSurface
          isLocked={true}
          padding="px-8 pt-6 pb-12 md:px-14 md:pt-6 md:pb-16"
          minHeight="min-h-[360px]"
          title="Opening Prep"
          description="Do your opening stock count before starting your restaurant operations."
          bgIcon={<PackageIcon className="h-64 w-64 text-white" />}
          badge={
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm w-fit mb-4">
              <ClipboardList className="h-4 w-4 text-white" />
              <FigtreeText className="text-[13px] font-bold text-white leading-none whitespace-nowrap">{stats.totalItems} items need counting</FigtreeText>
            </div>
          }
          action={
            <Button className="w-fit h-14 px-10 rounded-[10px] bg-white text-[#3B59DA] hover:bg-slate-50 font-black gap-4 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] font-figtree active:scale-95 group text-[18px] border-none" asChild>
              <Link href="/dashboard/inventory/daily-stock-count">
                Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Link>
            </Button>
          }
        >
          <UnifiedStatCard label="Total Inventory Items" value={stats.totalItems.toString()} subtext={<span className={cn("flex items-center gap-1.5 font-bold text-[12px]", (stats.changes?.total || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}><TrendUpIcon className={cn("h-4 w-4", (stats.changes?.total || 0) < 0 && "rotate-180")} /> up by {Math.abs(stats.changes?.total || 0)}% from last week</span>} icon={PackageIcon} variant="indigo" className="flex-1 min-w-[160px] h-[180px] md:h-[200px] bg-white border-none shadow-[0_12px_44px_rgba(0,0,0,0.06)]" />
          <UnifiedStatCard label="Healthy Stock" value={stats.healthy.toString()} subtext={<span className={cn("flex items-center gap-1.5 font-bold text-[12px]", (stats.changes?.healthy || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}><TrendUpIcon className={cn("h-4 w-4", (stats.changes?.healthy || 0) < 0 && "rotate-180")} /> up by {Math.abs(stats.changes?.healthy || 0)}% from last week</span>} icon={SuccessIcon} variant="green" className="flex-1 min-w-[160px] h-[180px] md:h-[200px] bg-white border-none shadow-[0_12px_44px_rgba(0,0,0,0.06)]" />
          <UnifiedStatCard label="Low Stock" value={stats.low.toString()} subtext={<span className={cn("flex items-center gap-1.5 font-bold text-[12px]", (stats.changes?.low || 0) >= 0 ? "text-rose-500" : "text-emerald-500")}><TrendUpIcon className={cn("h-4 w-4", (stats.changes?.low || 0) < 0 && "rotate-180")} /> up by {Math.abs(stats.changes?.low || 0)}% from last week</span>} icon={WarningIcon} variant="amber" className="flex-1 min-w-[160px] h-[180px] md:h-[200px] bg-white border-none shadow-[0_12px_44px_rgba(0,0,0,0.06)]" />
          <UnifiedStatCard label="Critical" value={stats.critical.toString()} subtext={<span className={cn("flex items-center gap-1.5 font-bold text-[12px]", (stats.changes?.critical || 0) >= 0 ? "text-rose-500" : "text-emerald-500")}><TrendUpIcon className={cn("h-4 w-4", (stats.changes?.critical || 0) < 0 && "rotate-180")} /> up by {Math.abs(stats.changes?.critical || 0)}% from last week</span>} icon={AlertIcon} variant="red" className="flex-1 min-w-[160px] h-[180px] md:h-[200px] bg-white border-none shadow-[0_12px_44px_rgba(0,0,0,0.06)]" />
        </UnifiedHeroSurface>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UnifiedStatCard label="Total Inventory Items" value={stats.totalItems.toString()} subtext={<span className={cn("flex items-center gap-1.5 font-bold text-[12px]", (stats.changes?.total || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}><TrendUpIcon className={cn("h-4 w-4", (stats.changes?.total || 0) < 0 && "rotate-180")} /> up by {Math.abs(stats.changes?.total || 0)}% from last week</span>} icon={PackageIcon} variant="indigo" className="h-[160px] md:h-[180px] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" />
          <UnifiedStatCard label="Healthy Stock" value={stats.healthy.toString()} subtext={<span className={cn("flex items-center gap-1.5 font-bold text-[12px]", (stats.changes?.healthy || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}><TrendUpIcon className={cn("h-4 w-4", (stats.changes?.healthy || 0) < 0 && "rotate-180")} /> up by {Math.abs(stats.changes?.healthy || 0)}% from last week</span>} icon={SuccessIcon} variant="green" className="h-[160px] md:h-[180px] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" />
          <UnifiedStatCard label="Low Stock" value={stats.low.toString()} subtext={<span className={cn("flex items-center gap-1.5 font-bold text-[12px]", (stats.changes?.low || 0) >= 0 ? "text-rose-500" : "text-emerald-500")}><TrendUpIcon className={cn("h-4 w-4", (stats.changes?.low || 0) < 0 && "rotate-180")} /> up by {Math.abs(stats.changes?.low || 0)}% from last week</span>} icon={WarningIcon} variant="amber" className="h-[160px] md:h-[180px] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" />
          <UnifiedStatCard label="Critical" value={stats.critical.toString()} subtext={<span className={cn("flex items-center gap-1.5 font-bold text-[12px]", (stats.changes?.critical || 0) >= 0 ? "text-rose-500" : "text-emerald-500")}><TrendUpIcon className={cn("h-4 w-4", (stats.changes?.critical || 0) < 0 && "rotate-180")} /> up by {Math.abs(stats.changes?.critical || 0)}% from last week</span>} icon={AlertIcon} variant="red" className="h-[160px] md:h-[180px] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" />
        </div>
      )}

      <div className="mt-8">
          <div className="bg-white border border-slate-100 rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden">
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
          </div>
      </div>
    </AppContainer>
  );
}

function RunningLowPanel({ items }: { items: RunningLowItem[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[10px] border border-rose-200/80 bg-white overflow-hidden shadow-sm p-6 md:p-8 mt-6"
        >
            <div className="flex items-center gap-3 mb-5 px-1">
                <div className="h-8 w-8 rounded-[6px] bg-rose-50 flex items-center justify-center shrink-0">
                    <WarningIcon className="h-4 w-4 text-rose-500 stroke-[2.5px]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#1E293B] font-figtree tracking-tight">Running Low</h3>
                <span className="text-[12px] font-semibold text-rose-500 font-figtree ml-1">— needs restocking</span>
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


function InventorySkeleton() {
    return (
        <div className="p-4 sm:p-6 md:p-10 space-y-8 min-h-screen">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48 rounded-[8px]" />
                <Skeleton className="h-11 w-64 rounded-[8px]" />
            </div>
            <Skeleton className="h-[360px] w-full rounded-[10px]" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[140px] rounded-[8px]" />
                ))}
            </div>
        </div>
    );
}
