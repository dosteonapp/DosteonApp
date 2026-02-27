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
  ArrowRight as ArrowIcon,
  ArrowUpRight as TrendUpIcon,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { restaurantOpsService, RunningLowItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { motion } from "framer-motion";

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
    <div className="flex flex-col gap-6 w-full pb-20 relative font-figtree">
      {!isOpen && <InventoryLockedOverlay />}

      {/* Modern Search & Date Header (Outside Box) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-0 py-2">
        <div className="flex items-center gap-2 text-slate-400">
           <span className="text-sm font-semibold">Inventory</span>
        </div>
        <div className="flex items-center gap-6 flex-1 max-w-2xl px-4">
             <div className="relative w-full">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search" className="pl-11 h-12 border-slate-200 rounded-xl bg-white shadow-sm focus:ring-slate-100 placeholder:text-slate-400" />
             </div>
        </div>
        <div className="bg-[#EEF2FF] border border-blue-100 px-4 py-2.5 rounded-xl flex items-center gap-3 text-[#3B59DA] shadow-sm">
             <CalendarIcon className="h-4 w-4" />
             <span className="text-[13px] font-bold tabular-nums">Tuesday, Jan 24, 2026  •  09:43:23 AM</span>
        </div>
      </div>

      {/* Hero Section / Main Stats Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F8FAFF] border border-[#D0D7FF] shadow-sm rounded-[24px] overflow-hidden"
      >
        <div className="p-8 lg:p-10 space-y-10">
            {/* Box Header: Title & Buttons */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-1.5">
                    <h2 className="text-[28px] font-bold text-[#1E293B] tracking-tight">Inventory</h2>
                    <p className="text-slate-400 font-medium text-[13px]">Manage your item stock levels and categories</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-[#3B59DA] text-[#3B59DA] bg-white hover:bg-indigo-50 font-bold gap-2 text-sm transition-all shadow-none">
                        <RefreshIcon className="h-4 w-4" /> Update Inventory
                    </Button>
                    <Button className="h-11 px-6 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-xl font-bold gap-2 text-sm transition-all border-none shadow-xl shadow-indigo-900/10" asChild>
                        <Link href="/dashboard/inventory/new">
                            <PlusIcon className="h-4 w-4" /> Add New Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Box Body: Description & Stats Cards */}
            <div className="flex flex-col xl:flex-row gap-10 items-stretch">
                <div className="w-full xl:w-[22%]">
                    <p className="text-slate-500 font-medium text-[15px] leading-relaxed pt-2">
                        Closing Stock Count will be enabled at 7 PM. If you want to change the Closing Stock Count time, your can admin change it in the store management settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <Link href="/dashboard/inventory/items" className="block group h-full">
                        <InventoryStatCard label="Total Inventory Items" value="100" icon={PackageIcon} accent="#3B59DA" color="text-[#1E293B]" />
                    </Link>
                    <Link href="/dashboard/inventory/items" className="block group h-full">
                        <InventoryStatCard label="Healthy Stock" value="56" icon={SuccessIcon} accent="#10B981" color="text-[#1E293B]" />
                    </Link>
                    <Link href="/dashboard/inventory/items" className="block group h-full">
                        <InventoryStatCard label="Low Stock" value="23" icon={WarningIcon} accent="#F59E0B" color="text-[#1E293B]" />
                    </Link>
                    <Link href="/dashboard/inventory/items" className="block group h-full">
                        <InventoryStatCard label="Critical" value="4" icon={AlertIcon} accent="#EF4444" color="text-[#1E293B]" />
                    </Link>
                </div>
            </div>
        </div>
      </motion.div>

      {/* What's Running Low Section */}
      <div className="mt-4">
        <RunningLowPanel items={runningLowItems} />
      </div>

      {/* See All Items Redirection */}
      <div className="flex justify-end mt-4">
          <Button 
            className="h-12 px-10 rounded-xl bg-[#EEF2FF] text-[#3B59DA] hover:bg-indigo-100 font-bold transition-all border-none shadow-sm text-sm"
            asChild
          >
            <Link href="/dashboard/inventory/items">
                See All Items
            </Link>
          </Button>
      </div>
    </div>
  );
}

function HeaderActions() {
    return (
        <>
            <Button variant="outline" className="h-11 px-6 rounded-xl border-[#3B59DA] text-[#3B59DA] hover:bg-indigo-50 font-bold gap-2 text-sm transition-all shadow-none">
                <RefreshIcon className="h-4 w-4" /> Update Inventory
            </Button>
            <Button className="h-11 px-6 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-xl font-bold gap-2 text-sm transition-all border-none shadow-lg shadow-indigo-900/10" asChild>
                <Link href="/dashboard/inventory/new">
                    <PlusIcon className="h-4 w-4" /> Add New Product
                </Link>
            </Button>
        </>
    );
}

function RunningLowPanel({ items }: { items: RunningLowItem[] }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border-2 border-red-500/10 bg-white overflow-hidden shadow-sm"
        >
            <div className="p-8 pb-4 flex items-center gap-3 text-red-500">
                <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <WarningIcon className="h-5 w-5 stroke-[2.5px]" />
                </div>
                <h2 className="text-[20px] font-bold tracking-tight">What's Running Low</h2>
            </div>

            <div className="p-8 pt-4 space-y-4">
                {items.slice(0, 3).map((item) => (
                    <div 
                        key={item.id}
                        className="p-5 flex items-center justify-between bg-white border border-slate-100 rounded-[24px] transition-all group hover:border-red-100 shadow-sm"
                    >
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-2xl overflow-hidden border border-slate-50 bg-slate-50 shrink-0 flex items-center justify-center text-slate-200 shadow-inner">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <PackageIcon className="h-10 w-10" />
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-[19px] font-bold text-[#1E293B] group-hover:text-[#3B59DA] transition-colors">{item.name}</h4>
                                <div className="flex items-center gap-4">
                                    <span className="text-[14px] font-medium text-slate-400">{item.unitsLeftLabel} left</span>
                                    <Badge className="bg-red-50 text-red-500 border-none font-bold text-[11px] px-3 py-1 rounded-lg">
                                        Need {item.needLabel || '10kg'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        
                        <Button variant="outline" className="h-11 px-8 rounded-xl border-slate-200 font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all text-sm hover:bg-[#EEF2FF]/50" asChild>
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

function InventoryStatCard({ label, value, icon: Icon, accent, color }: { label: string, value: string, icon: any, accent: string, color: string }) {
    return (
        <div className="bg-white rounded-[12px] p-6 h-full flex flex-col border border-slate-100/50 shadow-sm transition-all relative overflow-hidden group hover:border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
                <div 
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-white border border-slate-50 transition-colors group-hover:bg-indigo-50"
                    style={{ color: accent }}
                >
                    <Icon className="h-4 w-4 stroke-[2px]" />
                </div>
                <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block leading-tight">{label}</span>
                </div>
            </div>
            
            <div className="mt-auto space-y-4">
                <p className={cn("text-[38px] font-bold tracking-tighter leading-none transition-transform duration-500 origin-left group-hover:scale-105", color)}>
                    {value}
                </p>
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px]">
                    <TrendUpIcon className="h-3 w-3" />
                    <span>up by 8% from last week</span>
                </div>
            </div>
        </div>
    );
}

function InventoryLockedOverlay() {
    return (
        <div className="absolute -left-6 -right-6 top-0 bottom-0 z-50 flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden">
            <div 
                className="absolute inset-0 backdrop-blur-[44px] bg-white/20" 
                style={{ 
                    maskImage: 'linear-gradient(to bottom, transparent 0px, transparent 535px, rgba(0,0,0,0.1) 550px, rgba(0,0,0,0.4) 650px, rgba(0,0,0,0.8) 1000px, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, transparent 535px, rgba(0,0,0,0.1) 550px, rgba(0,0,0,0.4) 650px, rgba(0,0,0,0.8) 1000px, black 100%)'
                }}
            />
            
            <div className="relative z-50 flex flex-col items-center justify-center mt-[620px]">
                <div className="w-16 h-16 bg-[#D1D5DB]/80 rounded-[24px] flex items-center justify-center mb-6 shadow-sm backdrop-blur-md">
                    <LockIcon className="h-6 w-6 text-slate-600" />
                </div>
                
                <div className="space-y-4 max-w-sm">
                    <h3 className="text-[24px] md:text-[28px] font-bold text-[#111827] tracking-tight">Kitchen Service is Locked</h3>
                    <p className="text-slate-500 text-[14px] md:text-sm leading-relaxed font-semibold max-w-[300px] mx-auto">
                        The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                    </p>
                </div>

                <div className="mt-8">
                    <Button 
                        className="h-12 px-8 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-xl font-bold gap-3 shadow-lg shadow-indigo-900/10 transition-all active:scale-95 group border-none" 
                        asChild
                    >
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
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
