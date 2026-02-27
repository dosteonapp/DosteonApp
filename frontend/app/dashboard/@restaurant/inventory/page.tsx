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
    <div className="flex flex-col gap-8 bg-white min-h-screen pb-20 w-full max-w-[1850px] mx-auto px-1 md:px-2">
        {/* Responsive Content Area */}
        <div className="space-y-10 w-full mt-4">
            {!isOpen ? (
                /* Locked Hero - Pre-Open State */
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-none p-6 md:p-10 lg:p-12 border border-white/10 bg-gradient-to-r from-[#2B46CC] via-[#4A3AFF] to-[#7C3AED] text-white space-y-8 md:space-y-10 shadow-2xl min-h-[280px] md:min-h-[320px] flex flex-col justify-center relative overflow-hidden"
                >
                     {/* Decorative Elements matching Unlocked */}
                     <div className="absolute top-0 right-0 w-2/3 h-full bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />

                    {/* Header Lane: Title Left, Buttons Right (Structural Clone of Unlocked) */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                             <h2 className="text-[clamp(32px,4vw,48px)] font-black tracking-tighter leading-none font-inria italic">Opening Prep</h2>
                             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="inline-flex items-center gap-2 bg-[#EF4444]/20 text-white px-3 py-1 rounded-none border border-[#EF4444]/30 font-bold text-[10px] uppercase tracking-widest shadow-sm">
                                    <div className="h-3 w-3 bg-[#EF4444] rounded-none flex items-center justify-center text-[8px] font-bold">!</div>
                                    <span>16 items need counting</span>
                                </div>
                                <span className="text-[13px] md:text-[15px] font-medium text-indigo-100/60 font-figtree">Opening stock count required before service</span>
                             </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                                <Button className="h-[48px] md:h-[54px] w-full sm:w-auto px-6 md:px-10 bg-white text-[#3B59DA] hover:bg-slate-50 rounded-none font-black gap-3 text-sm md:text-base border-none shadow-xl shadow-indigo-900/10 group font-figtree" asChild>
                                    <Link href="/dashboard/inventory/daily-stock-count">
                                        Count Daily Stock <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Stat Grid (Structural Clone of Unlocked) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                        <InventoryStatCard label="Total Inventory" value="100" icon={PackageIcon} accent="#3B59DA" />
                        <InventoryStatCard label="Healthy Stock" value="56" icon={SuccessIcon} accent="#10B981" />
                        <InventoryStatCard label="Low Stock" value="23" icon={WarningIcon} accent="#F59E0B" />
                        <InventoryStatCard label="Critical" value="4" icon={AlertIcon} accent="#EF4444" />
                    </div>
                </motion.div>
            ) : (
                /* Unlocked Header - Active Service State */
                <InventoryHeaderUnlocked />
            )}

            {isOpen && <RunningLowPanel items={runningLowItems} />}
            
            <InventoryTableSection items={inventoryItems} isLocked={!isOpen} />
        </div>

        {/* Global Action - See All Items at Bottom Right */}
        <div className="flex justify-end pr-2 mt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button 
                    className="h-12 px-8 bg-[#E0E7FF]/60 text-[#3B59DA] hover:bg-[#E0E7FF] rounded-xl font-bold text-sm transition-all border-none shadow-none w-full sm:w-auto" 
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

function InventoryTableSection({ items, isLocked }: { items: InventoryItem[], isLocked: boolean }) {
    return (
        <div className="relative rounded-none border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className={cn("p-6 space-y-6 transition-all duration-500", isLocked && "blur-md pointer-events-none")}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search items..." className="pl-10 h-11 border-slate-200 rounded-none bg-slate-50/50" />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select defaultValue="all">
                            <SelectTrigger className="h-11 border-slate-200 rounded-none w-full sm:w-40">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="h-11 border-slate-200 rounded-none w-full sm:w-40">
                                <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="font-bold text-slate-500">Item Name</TableHead>
                                <TableHead className="font-bold text-slate-500">Category</TableHead>
                                <TableHead className="font-bold text-slate-500">Brand</TableHead>
                                <TableHead className="font-bold text-slate-500">Stock Unit</TableHead>
                                <TableHead className="font-bold text-slate-500">Current Stock</TableHead>
                                <TableHead className="font-bold text-slate-500">Min. Level</TableHead>
                                <TableHead className="font-bold text-slate-500">Status</TableHead>
                                <TableHead className="font-bold text-slate-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.slice(0, 8).map((item) => (
                                <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                                    <TableCell className="font-bold text-[#1E293B]">{item.name}</TableCell>
                                    <TableCell className="text-slate-500">Produce</TableCell>
                                    <TableCell className="text-slate-500">Best Farm</TableCell>
                                    <TableCell className="text-slate-500">kg</TableCell>
                                    <TableCell className="font-bold text-slate-700">120</TableCell>
                                    <TableCell className="text-slate-500">50</TableCell>
                                    <TableCell>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-none font-bold text-[10px] px-2 py-0.5 uppercase tracking-tight">Healthy</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none hover:bg-indigo-50 text-indigo-600">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {isLocked && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center p-6 sm:p-10 pointer-events-auto">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="h-16 w-16 bg-[#E2E8F0] rounded-none flex items-center justify-center mb-6 shadow-sm">
                            <LockIcon className="h-8 w-8 text-slate-600" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-[#1E293B] tracking-tight mb-3">Kitchen Service is Locked</h3>
                        <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-8">
                            The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                        </p>
                        <Button className="h-12 px-10 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-none font-bold gap-3 shadow-[0_10px_25px_rgba(59,89,218,0.2)]" asChild>
                            <Link href="/dashboard/inventory/daily-stock-count">
                                Count Daily Stock <ArrowIcon className="h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function InventoryHeaderUnlocked() {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-none p-6 md:p-10 lg:p-12 border border-white/10 bg-gradient-to-r from-[#2B46CC] via-[#4A3AFF] to-[#7C3AED] text-white space-y-8 md:space-y-10 shadow-2xl min-h-[280px] md:min-h-[320px] flex flex-col justify-center"
        >
            {/* Header Lane: Title Left, Buttons Right */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1.5 md:space-y-2">
                    <h2 className="text-[26px] md:text-[32px] font-bold text-[#1E293B] tracking-tight leading-none">Inventory</h2>
                    <p className="text-[13px] md:text-[15px] font-medium text-slate-400">Manage your item stock levels and categories</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="h-[48px] md:h-[54px] flex-1 sm:flex-none px-4 md:px-6 lg:px-8 rounded-none border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold gap-2 transition-all shadow-sm text-xs md:text-base">
                         <RefreshIcon className="h-4 w-4 md:h-5 md:w-5" /> Update Inventory
                    </Button>
                    <Button className="h-[48px] md:h-[54px] flex-1 sm:flex-none px-4 md:px-6 lg:px-8 rounded-none bg-white text-[#3B59DA] hover:bg-indigo-50 font-bold gap-2 shadow-lg transition-all border-none text-xs md:text-base" asChild>
                        <Link href="/dashboard/inventory/new">
                            <PlusIcon className="h-4 w-4 md:h-5 md:w-5" /> Add New Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Content Lane: Description Left, Cards Right */}
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 items-start xl:items-center">
                <div className="w-full xl:w-[260px] shrink-0">
                    <p className="text-white/70 text-[14px] md:text-[15px] font-medium leading-relaxed italic border-l-2 border-white/20 pl-4">
                        Closing Stock Count will be enabled at <span className="text-white font-extrabold whitespace-nowrap">7 PM</span>. Settings for reset times can be adjusted by admins in Store Settings.
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
            className="rounded-[24px] md:rounded-[32px] border border-[#EF4444] bg-white overflow-hidden p-6 md:p-8 relative"
        >
            <div className="flex items-center gap-2 md:gap-3 text-[#EF4444] mb-6 md:mb-8 px-1 overflow-hidden">
                <WarningIcon className="h-4 w-4 md:h-5 md:w-5 stroke-[2.5px] shrink-0" />
                <h2 className="text-[16px] md:text-[18px] font-black text-red-600 truncate uppercase tracking-tight">What's Running Low</h2>
            </div>

            <div className="space-y-4">
                {items.slice(0, 3).map((item, idx) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-slate-100 rounded-[16px] hover:shadow-sm transition-all group gap-4"
                    >
                        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                            <div className="h-14 w-14 md:h-16 md:w-16 rounded-[12px] overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                        <PackageIcon className="h-7 w-7 md:h-8 md:w-8" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 min-w-0">
                                <h4 className="text-[16px] md:text-[18px] font-black text-[#1E293B] truncate">{item.name}</h4>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 font-bold text-slate-400 text-[12px] md:text-sm">
                                    <span className="whitespace-nowrap">{item.unitsLeftLabel} left</span>
                                    <Badge className="bg-red-50 text-red-500 border-none font-black text-[9px] md:text-[10px] uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1 rounded-full shrink-0">
                                        {item.needLabel || 'Need 10kg'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="h-10 md:h-12 px-6 md:px-8 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 text-xs md:text-sm w-full sm:w-auto" asChild>
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
        <div className="bg-white rounded-none p-6 flex flex-col justify-between border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all h-[150px] md:h-[180px] group relative overflow-hidden active:scale-[0.98] font-figtree">
            <div className="flex items-center gap-3">
                <div 
                    className="h-9 w-9 rounded-none flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accent}10`, color: accent }}
                >
                    <Icon className="h-4 w-4 stroke-[2.5px]" />
                </div>
                <span className="text-[12px] md:text-[14px] font-bold text-slate-500 tracking-tight leading-tight">
                    {label}
                </span>
            </div>
            <div>
                <p className="text-[clamp(28px,4vw,36px)] font-bold tracking-tight text-[#1E293B] leading-none mb-3">{value}</p>
                <div className="flex items-center gap-1.5 text-[#10B981] font-bold text-[10px] md:text-[12px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    <TrendUpIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
                    <span className="truncate">up by 8% from last week</span>
                </div>
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
            className="bg-white/10 backdrop-blur-2xl rounded-none p-5 md:p-6 h-full border border-white/10 flex flex-col justify-between group transition-all hover:bg-white/15 hover:border-white/20 min-h-[140px]"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div 
                        className="h-9 w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                        style={{ backgroundColor: `${accent}`, color: "white" }}
                    >
                        <Icon className="h-4 w-4 md:h-5 md:w-5 stroke-[2.5px]" />
                    </div>
                </div>
                <div className="min-w-0">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block truncate">
                        {label}
                    </span>
                    <p className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight font-inria italic truncate">{value}</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] pt-3 md:pt-4 uppercase tracking-widest">
                <TrendUpIcon className="h-3 w-3" />
                <span>+8.2%</span>
            </div>
        </motion.div>
    );
}

function InventoryLockedTableOverlay() {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 md:p-8 overflow-hidden">
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
                className="bg-gradient-to-br from-[#1E3A8A] via-[#2D46B2] to-[#3B59DA] backdrop-blur-3xl p-8 md:p-14 lg:p-20 rounded-none border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.2)] flex flex-col items-center text-center space-y-6 md:space-y-10 w-full max-w-2xl mx-auto relative z-10 text-white"
            >
                <div className="relative">
                    <motion.div 
                        animate={{ 
                            y: [0, -8, 0],
                            rotate: [0, 2, -2, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="h-24 w-24 md:h-28 md:w-28 rounded-[28px] md:rounded-[36px] bg-gradient-to-br from-slate-50 to-white flex items-center justify-center text-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-white"
                    >
                        <LockIcon className="h-10 w-10 md:h-12 md:w-12 stroke-[1.5px]" />
                    </motion.div>
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full -z-10"
                    />
                    <div className="absolute -top-1 -right-1 h-8 w-8 md:h-9 md:w-9 rounded-full bg-red-500 border-4 border-white flex items-center justify-center shadow-lg">
                        <AlertIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                    </div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                    <h4 className="text-[32px] md:text-[36px] lg:text-[44px] font-black text-[#1E293B] tracking-tight font-inria leading-[1.05] italic">Kitchen Service <br/>is Locked</h4>
                    <p className="text-slate-500 font-bold text-base md:text-lg leading-relaxed max-w-sm mx-auto">
                        Please secure your <span className="text-[#3B59DA] font-black">Daily Asset Registry</span> to unlock operations for this session.
                    </p>
                </div>
                
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                >
                    <Button className="h-16 md:h-[76px] px-8 md:px-14 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-2xl md:rounded-[24px] font-black gap-3 text-base md:text-lg shadow-[0_20px_50px_rgba(59,89,218,0.3)] transition-all border-none group w-full" asChild>
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Perform Daily Count <ArrowIcon className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </motion.div>
                
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
