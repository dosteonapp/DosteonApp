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
            className="bg-[#F8FAFF] border border-[#EEF2FF] rounded-[24px] p-8 lg:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-10"
        >
            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Item Image */}
                <div className="h-44 w-44 rounded-[20px] overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-sm relative group">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="text-slate-200">
                            <Package className="h-20 w-20" />
                        </div>
                    )}
                </div>

                <div className="space-y-4 text-center md:text-left">
                    <div className="space-y-1">
                        <h1 className="text-[28px] font-bold text-[#475569] tracking-tight">{item.name || 'Organic Tomatoes'}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <Badge className="bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7] font-bold text-[10px] px-2 py-0.5 rounded-md border-none uppercase">
                                In Stock
                            </Badge>
                            <Badge variant="outline" className="text-slate-400 font-medium text-[10px] px-2 py-0.5 rounded-md border-slate-300 bg-white">
                                {item.category || 'Vegetables'}
                            </Badge>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SKU-ID-{item.sku?.slice(-4).toUpperCase() || '0002'}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <Button variant="outline" className="h-11 px-6 rounded-lg border-slate-300 bg-white font-semibold text-[#475569] gap-2 hover:bg-slate-50 transition-all text-sm" asChild>
                            <Link href={`/dashboard/inventory/new?edit=${item.id}`}>
                                <Settings className="h-4 w-4" /> Edit Item Details
                            </Link>
                        </Button>
                        <Button 
                            className="h-11 px-6 rounded-lg bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-semibold gap-2 shadow-sm transition-all border-none text-sm"
                            onClick={() => setIsUpdateModalOpen(true)}
                        >
                            <RotateCcw className="h-4 w-4" /> Restock Now
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Right Side Stats */}
            <div className="grid grid-cols-2 gap-4 xl:w-[420px]">
                <StatBox label="Current Stock" value={item.currentStock || '45'} unit={item.unit || 'units'} />
                <StatBox label="Avg Market Price" value={item.avgPrice || '3000'} unit="/kg" prefix="RWF" />
                <StatBox label="Minimum Stock" value={item.minLevel || '20'} unit={item.unit || 'units'} />
                <StatBox label="Reorder Point" value={item.restockPoint || '24'} unit={item.unit || 'units'} />
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
            className="bg-white border border-slate-100 rounded-[24px] p-6 lg:p-8 space-y-6 shadow-sm"
        >
            <div className="space-y-4">
                <h2 className="text-[18px] font-bold text-[#475569]">Stock Activity History</h2>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search stock history..." 
                            className="pl-11 h-12 rounded-lg border-slate-200 bg-white font-medium text-slate-600 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-44 h-12 rounded-lg border-slate-200 bg-white font-medium text-slate-500 text-sm">
                                <SelectValue placeholder="All Activities" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                <SelectItem value="all">All Activities</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-44 h-12 rounded-lg border-slate-200 bg-white font-medium text-slate-500 text-sm">
                                <SelectValue placeholder="All Time" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-[#F1F5F9]">
                        <TableRow className="border-none hover:bg-transparent uppercase">
                            <TableHead className="py-4 pl-6 font-semibold text-slate-500 text-[11px] tracking-tight">Action</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-500 text-[11px] tracking-tight">Quantity Change</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-500 text-[11px] tracking-tight">Performed By</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-500 text-[11px] tracking-tight">Status</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-500 text-[11px] tracking-tight">Activity</TableHead>
                            <TableHead className="py-4 pr-6 font-semibold text-slate-500 text-[11px] tracking-tight">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                        {activities.map((act, idx) => (
                            <TableRow 
                                key={act.id}
                                className="border-b border-slate-100 hover:bg-slate-50/50 transition-all font-medium text-[13px]"
                            >
                                <TableCell className="py-4 pl-6">
                                    <Badge className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-md border-none flex items-center gap-1.5 w-fit",
                                        act.action === 'Updated' ? "bg-[#EEF2FF] text-[#3B59DA]" :
                                        act.action === 'Received' ? "bg-[#F0FDF4] text-[#16A34A]" :
                                        act.action === 'Removed' ? "bg-[#FEF2F2] text-[#EF4444]" :
                                        act.action === 'Auto-Alert' ? "bg-[#FFFBEB] text-[#D97706]" :
                                        "bg-[#F1F5F9] text-slate-500"
                                    )}>
                                        <div className="h-3 w-3 flex items-center justify-center">
                                            {act.action === 'Updated' ? <Settings className="h-full w-full" /> :
                                             act.action === 'Received' ? <TrendingUp className="h-full w-full" /> :
                                             act.action === 'Removed' ? <Trash2 className="h-full w-full" /> :
                                             <AlertTriangle className="h-full w-full" />}
                                        </div>
                                        {act.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-[#475569]">
                                    {act.change === '-' || act.change === '0' ? '-' : act.change}
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-md border-none flex items-center gap-2 w-fit bg-[#F8FAFC] text-slate-500 border border-slate-200",
                                        act.performer === 'System Agent' ? "bg-slate-100 text-slate-500" : 
                                        act.performer === 'Kitchen Staff' ? "bg-[#FEF3C7] text-[#92400E]" :
                                        "bg-[#EDE9FE] text-[#5B21B6]"
                                    )}>
                                        {act.performer === 'Kitchen Staff' ? <Utensils className="h-3 w-3" /> : 
                                         act.performer === 'System Agent' ? <RefreshCcw className="h-3 w-3" /> : 
                                         <ShieldCheck className="h-3 w-3" />}
                                        {act.performer}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-[#16A34A] font-bold">
                                        <CheckCircle2 className="h-4 w-4 fill-[#16A34A] text-white" />
                                        Verified
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 max-w-[200px] truncate">{act.activity}</TableCell>
                                <TableCell className="pr-6 text-slate-400">Oct 06, 2025; 14:32</TableCell>
                            </TableRow>
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm transition-all hover:border-slate-300">
            <p className="text-[13px] font-medium text-slate-400 mb-2">{label}</p>
            <div className="flex items-baseline gap-1">
                {prefix && <span className="text-sm font-bold text-slate-900">{prefix}</span>}
                <span className="text-[24px] font-bold text-[#475569] tracking-tight">{value}</span>
                {unit && <span className="text-xs font-medium text-slate-400 ml-1">{unit}</span>}
            </div>
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
