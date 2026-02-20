"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Search, 
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  Package,
  Clock,
  ArrowRightLeft,
  Settings,
  MoreVertical,
  Plus,
  ArrowUpRight,
  Trash2,
  Utensils,
  SearchIcon,
  Filter,
  Calendar,
  AlertCircle,
  RefreshCcw,
  User,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  restaurantOpsService, 
  InventoryItem, 
  InventoryActivity 
} from "@/lib/services/restaurantOpsService";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryUpdateItemModal } from "@/components/inventory/InventoryUpdateItemModal";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function InventoryItemDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [activities, setActivities] = useState<InventoryActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemData, activityData] = await Promise.all([
          restaurantOpsService.getInventoryItemById(id),
          restaurantOpsService.getItemActivities(id)
        ]);
        setItem(itemData);
        setActivities(activityData);
      } catch (error) {
        console.error("Failed to fetch item details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading || !item) {
    return <DetailsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 bg-white min-h-screen pb-40">
        
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <Button 
                variant="outline" 
                className="h-12 px-8 rounded-xl border-slate-200 bg-white font-bold text-slate-600 gap-2 hover:bg-slate-50 shadow-sm transition-all w-fit"
                onClick={() => router.back()}
            >
                <ChevronLeft className="h-4 w-4" /> Back
            </Button>
        </motion.div>

        {/* Header: Item Summary Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-[32px] p-8 lg:p-12 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-10"
        >
            <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Item Image */}
                <div className="h-44 w-44 rounded-[40px] overflow-hidden border border-slate-50 bg-[#F8FAFC] flex items-center justify-center shrink-0 shadow-sm relative group">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="text-slate-200">
                            <Package className="h-20 w-20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="space-y-3 text-center md:text-left">
                    <h1 className="text-[32px] font-black text-[#1E293B] tracking-tight">{item.name || 'Organic Tomatoes'}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <Badge className="bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7] font-black text-[11px] px-3 py-1 rounded-lg border-none">
                            In Stock
                        </Badge>
                        <Badge variant="outline" className="text-slate-500 font-bold text-[11px] px-3 py-1 rounded-lg border-slate-200">
                            {item.category || 'Vegetables'}
                        </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-400 font-mono">SKU-ID-{item.sku?.slice(-4).toUpperCase() || '0002'}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white font-black text-slate-600 gap-3 hover:bg-slate-50 transition-all group" asChild>
                        <Link href={`/dashboard/inventory/new?edit=${item.id}`}>
                            <Settings className="h-5 w-5 text-slate-400 group-hover:rotate-45 transition-transform" /> Edit Item Details
                        </Link>
                    </Button>
                    <Button 
                        className="h-14 px-8 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black gap-3 shadow-lg shadow-indigo-100 transition-all border-none"
                        onClick={() => setIsUpdateModalOpen(true)}
                    >
                        <RefreshCcw className="h-5 w-5" /> Restock Now
                    </Button>
                </div>
            </div>
            
            {/* Right Side Stats */}
            <div className="grid grid-cols-2 gap-4 xl:w-[480px]">
                <StatBox label="Current Stock" value={item.currentStock || '0'} unit={item.unit} />
                <StatBox label="Reorder Point" value={item.restockPoint || '24'} unit={item.unit} />
                <StatBox label="Min level" value={item.minLevel || '5'} unit={item.unit} />
                <StatBox label="Restock Level" value={item.restockPoint || '24'} unit={item.unit} />
            </div>
        </motion.div>

        <InventoryUpdateItemModal 
            open={isUpdateModalOpen}
            onOpenChange={setIsUpdateModalOpen}
            item={item}
            onUpdate={() => {
                window.location.reload();
            }}
        />

        {/* Stock Activity History Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-100 rounded-[32px] p-8 lg:p-10 shadow-sm space-y-8"
        >
            <div className="flex flex-col gap-6">
                <h2 className="text-[20px] font-black text-[#1E293B]">Stock Activity History</h2>
                
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-lg">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input 
                            placeholder="Search stock history..." 
                            className="pl-14 h-14 rounded-2xl border-slate-100 bg-[#F8FAFC] font-bold text-slate-600 focus-visible:ring-indigo-100"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-48 h-14 rounded-2xl border-slate-100 bg-white font-black text-slate-500 shadow-sm">
                                <SelectValue placeholder="All Activities" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                                <SelectItem value="all">All Activities</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="removed">Removed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-48 h-14 rounded-2xl border-slate-100 bg-white font-black text-slate-500 shadow-sm">
                                <SelectValue placeholder="All Time" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-[#F8FAFC]">
                        <TableRow className="border-none hover:bg-transparent uppercase">
                            <TableHead className="py-6 pl-10 font-bold text-slate-500 text-[11px] tracking-wider">Action</TableHead>
                            <TableHead className="py-6 font-bold text-slate-500 text-[11px] tracking-wider">Quantity Change</TableHead>
                            <TableHead className="py-6 font-bold text-slate-500 text-[11px] tracking-wider">Performed By</TableHead>
                            <TableHead className="py-6 font-bold text-slate-500 text-[11px] tracking-wider">Status</TableHead>
                            <TableHead className="py-6 font-bold text-slate-500 text-[11px] tracking-wider">Activity</TableHead>
                            <TableHead className="py-6 pr-10 font-bold text-slate-500 text-[11px] tracking-wider">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                        {activities.map((act, idx) => (
                            <motion.tr 
                                key={act.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group"
                            >
                                <TableCell className="py-5 pl-10">
                                    <Badge className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-none flex items-center gap-1.5 w-fit shadow-xs",
                                        act.action === 'Updated' ? "bg-[#EEF2FF] text-[#3B59DA]" :
                                        act.action === 'Received' ? "bg-[#F0FDF4] text-[#16A34A]" :
                                        act.action === 'Removed' ? "bg-[#FEF2F2] text-[#EF4444]" :
                                        act.action === 'Auto-Alert' ? "bg-[#FFFBEB] text-[#D97706]" :
                                        "bg-[#F8FAFC] text-slate-400"
                                    )}>
                                        <div className="h-2.5 w-2.5 flex items-center justify-center">
                                            {act.action === 'Updated' ? <Settings className="h-full w-full" /> :
                                             act.action === 'Received' ? <TrendingUp className="h-full w-full" /> :
                                             act.action === 'Removed' ? <Trash2 className="h-full w-full" /> :
                                             <AlertTriangle className="h-full w-full" />}
                                        </div>
                                        {act.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold text-[#1E293B] text-[15px]">
                                    {act.change === '-' || act.change === '0' ? '-' : act.change}
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-none flex items-center gap-2 w-fit bg-[#F8FAFC] text-slate-500 shadow-xs border border-slate-100",
                                        act.performer === 'System Agent' ? "bg-slate-50 text-slate-400" : 
                                        act.performer === 'Kitchen Staff' ? "bg-amber-50 text-amber-600" :
                                        "bg-indigo-50 text-indigo-600"
                                    )}>
                                        {act.performer === 'Kitchen Staff' ? <Utensils className="h-3 w-3" /> : 
                                         act.performer === 'System Agent' ? <RefreshCcw className="h-3 w-3" /> : 
                                         <ShieldCheck className="h-3 w-3" />}
                                        {act.performer}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-[#16A34A] font-extrabold text-[12px]">
                                        <CheckCircle2 className="h-4 w-4 fill-emerald-500 text-white" />
                                        Verified
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-slate-600 text-sm max-w-[240px] truncate">{act.activity}</TableCell>
                                <TableCell className="pr-10 text-[13px] font-bold text-slate-400 tabular-nums">Oct 06, 2025; 14:32</TableCell>
                            </motion.tr>
                        ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>
        </motion.div>
    </div>
  );
}

function StatBox({ label, value, unit, prefix }: { label: string, value: string | number, unit?: string, prefix?: string }) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <p className="text-[12px] font-bold text-slate-400 leading-none mb-4">{label}</p>
            <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                    {prefix && <span className="text-lg font-bold text-slate-900">{prefix}</span>}
                    <span className="text-[28px] font-black text-[#1E293B] tracking-tight">{value}</span>
                    {unit && <span className="text-xs font-bold text-slate-400 ml-0.5">{unit}</span>}
                </div>
            </div>
            {/* Visual Decoration */}
            <div className="absolute top-0 right-0 w-24 h-full bg-slate-50/20 skew-x-[-20deg] translate-x-12' group-hover:translate-x-4 transition-transform duration-500" />
        </div>
    );
}

function DetailsSkeleton() {
    return (
        <div className="p-10 space-y-8 bg-[#F8FAFF] min-h-screen">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-xl" />
            <div className="flex flex-col xl:flex-row gap-8">
                <Skeleton className="h-80 flex-1 rounded-[32px]" />
                <div className="grid grid-cols-2 gap-4 w-[480px]">
                     <Skeleton className="h-36 rounded-2xl" />
                     <Skeleton className="h-36 rounded-2xl" />
                     <Skeleton className="h-36 rounded-2xl" />
                     <Skeleton className="h-36 rounded-2xl" />
                </div>
            </div>
            <Skeleton className="h-[600px] w-full rounded-[32px]" />
        </div>
    );
}
