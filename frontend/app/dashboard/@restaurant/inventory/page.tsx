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
  Calendar
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
      {!isOpen && <InventoryLockedOverlay />}

      {/* Modern Search & Date Header (Outside Box) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-2 pb-6 mb-0">
        <div className="flex flex-col gap-1 shrink-0">
            <FigtreeText className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Inventory Management</FigtreeText>
            <InriaHeading className="text-[34px] font-bold text-[#1E293B] tracking-tight leading-none">Dashboard</InriaHeading>
        </div>
        <div className="flex items-center gap-6 flex-1">
             <div className="relative w-full">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 transition-colors group-focus-within:text-[#3B59DA]" />
                <Input placeholder="Search inventory items..." className="pl-16 h-[72px] bg-white border-slate-200 rounded-2xl w-full text-lg font-black text-slate-700 placeholder:text-slate-300 placeholder:font-black focus-visible:ring-[#3B59DA]/5 focus-visible:border-[#3B59DA]/30 transition-all shadow-none focus:shadow-xl focus:shadow-indigo-500/5" />
             </div>
        </div>
        <div className="bg-white border border-slate-100 px-8 h-[72px] rounded-2xl flex items-center gap-4 text-[#3B59DA] shadow-sm shrink-0 hover:border-[#3B59DA]/20 transition-all cursor-default group">
             <Calendar className="h-5 w-5 text-slate-400 group-hover:text-[#3B59DA] transition-colors" />
             <FigtreeText className="text-[14px] font-black tabular-nums text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">Tuesday, Jan 24, 2026</FigtreeText>
        </div>
      </div>

      {/* Hero Section / Main Stats Card */}
      <UnifiedHeroSurface
        title={isOpen ? "Inventory Control" : "Opening Prep"}
        subtitle={isOpen ? "Manage your item stock levels, categories, and inventory performance." : "Do your opening stock count before starting your restaurant operations."}
        isLocked={!isOpen}
        badge={!isOpen ? (
            <div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#EF4444] w-fit shadow-lg shadow-red-900/20">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <FigtreeText className="text-[11px] font-black text-white uppercase tracking-[0.1em]">16 items need counting</FigtreeText>
            </div>
        ) : undefined}
        action={
            <div className="flex flex-wrap items-center gap-5">
                {isOpen ? (
                    <>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-[#1E293B] bg-white hover:bg-slate-50 font-bold gap-3 text-base transition-all shadow-md active:scale-95 font-figtree">
                            <RefreshIcon className="h-5 w-5" /> Update Count
                        </Button>
                        <Button className="h-14 px-10 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-2xl font-black gap-3 text-[17px] transition-all border-none shadow-2xl shadow-indigo-900/10 active:scale-95 font-figtree" asChild>
                            <Link href="/dashboard/inventory/new">
                                <PlusIcon className="h-5 w-5" /> Add Product
                            </Link>
                        </Button>
                    </>
                ) : (
                    <Button className="h-16 px-12 bg-white text-[#3B59DA] hover:bg-slate-50 rounded-2xl font-black gap-4 text-[18px] shadow-2xl shadow-indigo-900/20 border-none transition-all active:scale-95 group font-figtree" asChild>
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                )}
            </div>
        }
      >
        <UnifiedStatCard label="Total Products" value="1.2k" icon={PackageIcon} variant="neutral" />
        <UnifiedStatCard label="Healthy Stock" value="560" icon={SuccessIcon} variant="green" />
        <UnifiedStatCard label="Low Stock" value="23" icon={WarningIcon} variant="amber" />
        <UnifiedStatCard label="Out of Stock" value="04" icon={AlertIcon} variant="red" />
      </UnifiedHeroSurface>

      {/* What's Running Low Section */}
      <div className="mt-4">
        <RunningLowPanel items={runningLowItems} />
      </div>

      {/* See All Items Redirection */}
      <div className="flex justify-end mt-10 mb-10">
          <Button 
            className="h-16 px-12 rounded-[22px] bg-[#F8FAFC] border-2 border-slate-100 text-[#3B59DA] hover:bg-[#3B59DA] hover:text-white hover:border-[#3B59DA] font-black transition-all shadow-md text-[16px] font-figtree active:scale-95"
            asChild
          >
            <Link href="/dashboard/inventory/items">
                See Master Product Registry
            </Link>
          </Button>
      </div>
    </AppContainer>
  );
}

function RunningLowPanel({ items }: { items: RunningLowItem[] }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-slate-100 bg-white overflow-hidden shadow-sm p-8 md:p-10 mt-4"
        >
            <div className="flex items-end justify-between mb-8 px-2">
                <div className="space-y-1">
                    <FigtreeText className="text-[13px] font-black text-red-400 uppercase tracking-[0.2em] leading-none">Stock Warning</FigtreeText>
                    <InriaHeading className="text-[32px] md:text-[38px] font-bold tracking-tight text-[#1E293B]">What's Running Low</InriaHeading>
                </div>
                <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-100/50">
                    <WarningIcon className="h-7 w-7 stroke-[2.5px]" />
                </div>
            </div>
            
            <div className="space-y-4">
                {items.slice(0, 3).map((item) => (
                    <div 
                        key={item.id}
                        className="p-5 flex items-center justify-between bg-[#F8FAFC] border border-slate-50 rounded-[28px] transition-all group hover:border-[#3B59DA]/20 hover:bg-white hover:shadow-xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
                    >
                        <div className="flex items-center gap-8">
                            <div className="h-20 w-20 rounded-[20px] overflow-hidden border-2 border-white bg-white shrink-0 flex items-center justify-center text-slate-100 shadow-lg group-hover:scale-105 transition-transform">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <PackageIcon className="h-10 w-10" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <InriaHeading className="text-[22px] font-bold text-[#1E293B] group-hover:text-[#3B59DA] transition-colors">{item.name}</InriaHeading>
                                <div className="flex items-center gap-4">
                                    <FigtreeText className="text-[15px] font-black text-slate-400 tabular-nums uppercase tracking-tight">{item.unitsLeftLabel} left</FigtreeText>
                                    <div className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100/50">
                                        RESTOCK {item.needLabel || '10kg'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <Button variant="outline" className="h-14 px-10 rounded-[20px] border-slate-200 bg-white font-black text-[#1E293B]/70 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all text-[15px] font-figtree active:scale-95 shadow-sm" asChild>
                            <Link href={`/dashboard/inventory/${item.id}`}>
                                View Details
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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden rounded-[28px]">
            <div 
                className="absolute inset-0 backdrop-blur-[24px] bg-white/20" 
                style={{ 
                    maskImage: 'linear-gradient(to bottom, transparent 340px, rgba(0,0,0,0.1) 360px, rgba(0,0,0,0.4) 450px, rgba(0,0,0,0.8) 800px, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 340px, rgba(0,0,0,0.1) 360px, rgba(0,0,0,0.4) 450px, rgba(0,0,0,0.8) 800px, black 100%)'
                }}
            />
            
            <div className="relative z-50 flex flex-col items-center justify-center mt-[420px] bg-white border border-slate-100 p-12 rounded-[28px] shadow-2xl animate-in zoom-in-95 duration-500 scale-90 md:scale-100">
                <div className="w-16 h-16 bg-[#F3F4F6] border border-slate-100 rounded-[20px] flex items-center justify-center mb-8 shadow-inner">
                    <LockIcon className="h-6 w-6 text-slate-400" />
                </div>
                
                <div className="space-y-4 max-w-sm">
                    <InriaHeading className="text-[28px] font-bold text-[#1E293B] tracking-tight leading-none">Kitchen Service is Locked</InriaHeading>
                    <FigtreeText className="text-slate-400 text-[15px] leading-relaxed font-semibold max-w-[300px] mx-auto">
                        The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                    </FigtreeText>
                </div>

                <div className="mt-10">
                    <Button 
                        className="h-14 px-10 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-xl font-bold gap-3 shadow-xl shadow-indigo-900/10 transition-all active:scale-95 group border-none text-[15px] font-figtree" 
                        asChild
                    >
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
