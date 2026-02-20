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
  Bell as BellIcon,
  Calendar as CalendarIcon,
  Utensils,
  Info,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { restaurantOpsService, RunningLowItem, InventoryItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayActionGuard } from "@/lib/dayLifecycle/useRestaurantDayActionGuard";
import { LockedActionOverlay } from "@/components/day/LockedActionOverlay";
import { DayState } from "@/lib/dayLifecycle/types";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { useRouter } from "next/navigation";
import { InventoryUpdateItemModal } from "@/components/inventory/InventoryUpdateItemModal";

import { motion, AnimatePresence } from "framer-motion";

export default function InventoryPage() {
  const { status, isOpen, isLocked, isUserUnlocked } = useRestaurantDayLifecycle();
  
  // Real functional logic should skip lock if user manually unlocked for viewing
  const effectiveIsLocked = isLocked && !isUserUnlocked;
  const [runningLowItems, setRunningLowItems] = useState<RunningLowItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { guardAction } = useRestaurantDayActionGuard();
  const router = useRouter();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lowItems, allItems] = await Promise.all([
          restaurantOpsService.getRunningLowItems(),
          restaurantOpsService.getInventoryItems()
        ]);
        setRunningLowItems(lowItems);
        setInventoryItems(allItems);
      } catch (err) {
        console.error("Failed to fetch inventory data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateClick = (item: InventoryItem | null = null) => {
    setSelectedItem(item || (inventoryItems.length > 0 ? inventoryItems[0] : null));
    setIsUpdateModalOpen(true);
  };

  if (isLoading) {
    return <InventorySkeleton />;
  }

  return (
    <div className="flex flex-col gap-10 bg-white min-h-screen pb-20">
        {/* Responsive Content Area */}
        <div className="space-y-10">
            {!isOpen ? (
                /* Locked Hero - Pre-Open State */
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-[48px] p-8 lg:p-12 shadow-2xl bg-[#0F172A] text-white flex flex-col xl:flex-row items-stretch gap-10"
                >
                    {/* Abstract Background Design */}
                    <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
                         <motion.div 
                            animate={{ 
                                x: [0, 50, 0],
                                y: [0, 30, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#3B59DA] rounded-full blur-[120px]" 
                         />
                    </div>

                    <div className="space-y-8 max-w-sm shrink-0 flex flex-col justify-center relative z-10">
                        <div className="space-y-5">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-5xl font-black tracking-tight font-inria italic mb-2">Opening Prep</h2>
                                <p className="text-slate-300 text-base font-bold leading-relaxed">
                                    Do your opening stock count before starting your restaurant operations.
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 w-fit"
                            >
                                <ClipboardList className="h-4 w-4 text-indigo-400" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-white">16 items need counting</span>
                            </motion.div>
                        </div>
                        
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button className="h-14 px-8 bg-white text-[#3B59DA] hover:bg-slate-50 rounded-2xl font-black gap-3 text-base shadow-xl transition-all border-none group w-fit" asChild>
                                <Link href="/dashboard/inventory/daily-stock-count">
                                    Count Daily Stock <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 relative z-10">
                        <HeroStockCard label="Total Inventory" value="100" icon={PackageIcon} accent="#4F46E5" delay={0.3} />
                        <HeroStockCard label="Healthy Stock" value="56" icon={SuccessIcon} accent="#10B981" delay={0.4} />
                        <HeroStockCard label="Low Stock" value="23" icon={WarningIcon} accent="#F59E0B" delay={0.5} />
                        <HeroStockCard label="Critical" value="4" icon={AlertIcon} accent="#EF4444" delay={0.6} />
                    </div>
                </motion.div>
            ) : (
                /* Unlocked Header - Active Service State */
                <InventoryHeaderUnlocked />
            )}

            {isOpen && <RunningLowPanel items={runningLowItems} />}
        </div>

        {/* Global Action - See All Items at Bottom Right */}
        <div className="flex justify-end pr-4 mt-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                    className="h-[52px] px-10 bg-[#E0E7FF]/60 text-[#3B59DA] hover:bg-[#E0E7FF] rounded-2xl font-black text-sm transition-all border-none shadow-none" 
                    asChild
                >
                    <Link href="/dashboard/inventory/items">
                        See All Items
                    </Link>
                </Button>
            </motion.div>
        </div>
    </div>
  );
}

function InventoryTableView({ items, isLocked, isLoading }: { items: InventoryItem[], isLocked: boolean, isLoading: boolean }) {
    // This is no longer used but I'll keep it for reference or remove if safe
    return null;
}

function InventoryHeroClosed() {
    return null; // Integrated into main render
}

function InventoryHeaderUnlocked() {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[24px] p-6 lg:p-10 border border-[#3B59DA]/10 bg-white space-y-10 shadow-sm"
        >
            {/* Header Lane: Title Left, Buttons Right */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h2 className="text-[28px] lg:text-[32px] font-bold text-[#1E293B] tracking-tight">Inventory</h2>
                    <p className="text-[14px] lg:text-[15px] font-medium text-slate-400">Manage your item stock levels and categories</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                    <Button variant="outline" className="h-[48px] lg:h-[54px] px-5 lg:px-8 rounded-[12px] lg:rounded-[18px] border-[#3B59DA]/20 bg-white text-[#3B59DA] hover:bg-slate-50 font-bold gap-2.5 transition-all shadow-sm text-sm lg:text-base">
                         <RefreshIcon className="h-4 w-4 lg:h-5 lg:w-5" /> Update Inventory
                    </Button>
                    <Button className="h-[48px] lg:h-[54px] px-5 lg:px-8 rounded-[12px] lg:rounded-[18px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold gap-2.5 shadow-lg shadow-indigo-100 transition-all border-none text-sm lg:text-base" asChild>
                        <Link href="/dashboard/inventory/new">
                            <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5" /> Add New Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Content Lane: Description Left, Cards Right */}
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 items-start xl:items-center">
                <div className="w-full xl:w-[250px] shrink-0">
                    <p className="text-[15px] lg:text-[16px] font-medium text-slate-500 leading-relaxed">
                        Closing Stock Count will be enabled at <span className="text-slate-900 font-extrabold whitespace-nowrap">7 PM</span>. If you want to change the Closing Stock Count time, your can admin change it in the store management settings.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 w-full">
                    <InventoryStatCard label="Total Inventory Items" value="100" icon={PackageIcon} accent="#4F46E5" />
                    <InventoryStatCard label="Healthy Stock" value="56" icon={SuccessIcon} accent="#10B981" />
                    <InventoryStatCard label="Low Stock" value="23" icon={WarningIcon} accent="#F59E0B" />
                    <InventoryStatCard label="Critical" value="4" icon={AlertIcon} accent="#EF4444" />
                </div>
            </div>
        </motion.div>
    );
}

function RunningLowPanel({ items }: { items: RunningLowItem[] }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] border border-[#EF4444] bg-white overflow-hidden p-8 relative"
        >
            <div className="flex items-center gap-3 text-[#EF4444] mb-8 px-2">
                <WarningIcon className="h-5 w-5 stroke-[2.5px]" />
                <h2 className="text-[18px] font-black text-red-600">What's Running Low</h2>
            </div>

            <div className="space-y-4">
                {items.slice(0, 3).map((item, idx) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 flex items-center justify-between bg-white border border-slate-100 rounded-[16px] hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-[12px] overflow-hidden border border-slate-100 bg-slate-50">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                        <PackageIcon className="h-8 w-8" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[18px] font-black text-[#1E293B]">{item.name}</h4>
                                <div className="flex items-center gap-3 font-bold text-slate-400 text-sm">
                                    <span>{item.unitsLeftLabel} left</span>
                                    <Badge className="bg-red-50 text-red-500 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                                        {item.needLabel || 'Need 10kg'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50" asChild>
                            <Link href={`/dashboard/inventory/${item.id}`}>View Item</Link>
                        </Button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

function InventoryStatCard({ label, value, icon: Icon, accent }: { label: string, value: string, icon: any, accent: string }) {
    return (
        <div className="bg-white rounded-[16px] lg:rounded-[20px] p-5 lg:p-6 flex flex-col justify-between border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-md transition-all h-[160px] lg:h-[180px]">
            <div className="space-y-4 lg:space-y-5">
                <div className="flex items-start lg:items-center gap-3">
                    <div 
                        className="h-8 w-8 lg:h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 lg:mt-0"
                        style={{ backgroundColor: `${accent}10`, color: accent }}
                    >
                        <Icon className="h-4 w-4 lg:h-5 text-current" />
                    </div>
                    <span className="text-[12px] lg:text-[14px] font-bold text-slate-600 tracking-tight leading-tight">
                        {label}
                    </span>
                </div>
                <p className="text-[28px] lg:text-[36px] font-bold tracking-tight text-[#1E293B] leading-none">{value}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[#10B981] font-bold text-[10px] lg:text-[12px] tracking-tight">
                <TrendUpIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                <span className="whitespace-nowrap">up by 8% from last week</span>
            </div>
        </div>
    );
}

function HeroStockCard({ label, value, icon: Icon, accent, delay = 0 }: { label: string, value: string, icon: any, accent: string, delay?: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 h-full border border-white/10 flex flex-col justify-between group transition-all hover:bg-white/15 hover:border-white/20"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                        style={{ backgroundColor: `${accent}`, color: "white" }}
                    >
                        <Icon className="h-5 w-5 stroke-[2.5px]" />
                    </div>
                </div>
                <div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                        {label}
                    </span>
                    <p className="text-4xl font-black tracking-tight text-white leading-tight font-inria italic">{value}</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] pt-4 uppercase tracking-widest">
                <TrendUpIcon className="h-3 w-3" />
                <span>+8.2%</span>
            </div>
        </motion.div>
    );
}

function InventoryLockedTableOverlay() {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-8 overflow-hidden">
            {/* Deep frosted glass background */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/40 backdrop-blur-[12px]" 
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 backdrop-blur-3xl p-10 lg:p-14 rounded-[56px] border border-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.08),0_10px_30px_rgba(0,0,0,0.04)] flex flex-col items-center text-center space-y-8 max-w-lg mx-auto relative z-10"
            >
                <div className="relative">
                    <motion.div 
                        animate={{ 
                            y: [0, -8, 0],
                            rotate: [0, 2, -2, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="h-28 w-28 rounded-[36px] bg-gradient-to-br from-slate-50 to-white flex items-center justify-center text-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-white"
                    >
                        <LockIcon className="h-12 w-12 stroke-[1.5px]" />
                    </motion.div>
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full -z-10"
                    />
                    <div className="absolute -top-1 -right-1 h-9 w-9 rounded-full bg-red-500 border-4 border-white flex items-center justify-center shadow-lg">
                        <AlertIcon className="h-4 w-4 text-white" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h4 className="text-[36px] lg:text-[44px] font-black text-[#1E293B] tracking-tight font-inria leading-[1.05] italic">Kitchen Service <br/>is Locked</h4>
                    <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-sm mx-auto">
                        Please secure your <span className="text-[#3B59DA] font-black">Daily Asset Registry</span> to unlock operations for this session.
                    </p>
                </div>
                
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button className="h-[76px] px-14 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[24px] font-black gap-3 text-lg shadow-[0_20px_50px_rgba(59,89,218,0.3)] transition-all border-none group" asChild>
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Perform Daily Count <ArrowIcon className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </motion.div>
                
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Typical count time: 4m 20s
                    </span>
                </div>
            </motion.div>
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
            <Skeleton className="h-[440px] w-full rounded-[48px]" />
            <div className="space-y-10">
                <Skeleton className="h-80 w-full rounded-[40px]" />
                <Skeleton className="h-[500px] w-full rounded-[40px]" />
            </div>
        </div>
    );
}
