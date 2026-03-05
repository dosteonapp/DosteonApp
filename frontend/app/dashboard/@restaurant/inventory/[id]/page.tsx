"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft,
  ChevronDown,
  RotateCcw,
  Settings,
  Package,
  Plus,
  ArrowRight,
  User,
  Utensils,
  Bot,
  CheckCircle2,
  TrendingUp,
  Trash2,
  AlertTriangle,
  Search as SearchIcon,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRightLeft
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
import { 
    AppContainer, 
    InriaHeading, 
    FigtreeText, 
    UnifiedStatCard,
    PrimarySurfaceCard 
} from "@/components/ui/dosteon-ui";
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
    <AppContainer className="pb-40">

        <div className="mb-8">
            <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="h-14 px-8 rounded-xl border-slate-200 bg-white font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all font-figtree shadow-sm text-[15px] active:scale-95 flex items-center gap-3"
            >
                <ArrowLeft className="h-5 w-5" /> Back
            </Button>
        </div>

        {/* Header: Item Summary Card */}
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <PrimarySurfaceCard className="p-8 lg:p-10 flex flex-col xl:flex-row items-center gap-10 bg-[#f5f6ff] border-[#98a6f9] shadow-sm relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
                    {/* Item Image */}
                    <div className="h-44 w-44 md:h-56 md:w-56 rounded-[32px] overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                            <Package className="h-16 w-16 text-slate-200" />
                        )}
                    </div>

                    <div className="space-y-6 text-center md:text-left flex-1">
                        <div className="space-y-3">
                            <h1 className="text-[32px] md:text-[40px] font-bold text-[#1E293B] leading-tight font-figtree tracking-tight">{item.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                                <Badge className="bg-[#DCFCE7] text-[#166534] font-bold text-[11px] px-3 py-1 rounded-lg border-none uppercase font-figtree">In Stock</Badge>
                                <Badge variant="outline" className="text-slate-500 font-bold text-[11px] px-3 py-1 rounded-lg border-slate-200 bg-white uppercase font-figtree">{item.category}</Badge>
                            </div>
                            <p className="text-slate-400 font-bold text-[12px] uppercase tracking-wider font-figtree">SKU-ID: {item.sku}</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                            <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white font-bold text-slate-500 gap-2 hover:text-[#3B59DA] hover:shadow-sm transition-all text-sm font-figtree active:scale-95" asChild>
                                <Link href={`/dashboard/inventory/new?edit=${item.id}`}>
                                    <Settings className="h-4 w-4" /> Edit Item Details
                                </Link>
                            </Button>
                            <Button 
                                className="h-12 px-8 bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold gap-2 shadow-lg shadow-indigo-100 transition-all border-none text-sm font-figtree active:scale-95"
                                onClick={() => setIsUpdateModalOpen(true)}
                            >
                                <RotateCcw className="h-4 w-4" /> Restock Now
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* Right Side Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-[480px]">
                    <StatBox label="Current Stock" value={item.currentStock || '45'} unit="units" />
                    <StatBox label="Avg Market Price" value={item.avgPrice || '3000'} unit="/kg" prefix="RWF" />
                    <StatBox label="Minimum Stock" value={item.minLevel || '20'} unit="units" />
                    <StatBox label="Reorder Point" value={item.restockPoint || '24'} unit="units" />
                </div>
            </PrimarySurfaceCard>
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
            className="mt-12"
        >
            <PrimarySurfaceCard className="p-8 md:p-10 space-y-8">
                <div className="space-y-6">
                    <InriaHeading className="text-[28px] font-bold text-[#1E293B] tracking-tight">Stock Activity History</InriaHeading>
                    
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-[420px]">
                            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <Input 
                                placeholder="Search stock history..." 
                                className="pl-14 h-14 rounded-xl border-slate-200 bg-white font-medium text-slate-600 text-[15px] font-figtree shadow-none"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-44 h-14 rounded-xl border-slate-200 bg-white font-bold text-slate-500 text-sm shadow-sm px-6">
                                    <SelectValue placeholder="All Activities" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 p-2 shadow-2xl">
                                    <SelectItem value="all" className="font-bold py-2.5">All Activities</SelectItem>
                                    <SelectItem value="received" className="font-bold py-2.5">Received</SelectItem>
                                    <SelectItem value="removed" className="font-bold py-2.5">Removed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="all">
                                <SelectTrigger className="w-44 h-14 rounded-xl border-slate-200 bg-white font-bold text-slate-500 text-sm shadow-sm px-6">
                                    <SelectValue placeholder="All Time" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 p-2 shadow-2xl">
                                    <SelectItem value="all" className="font-bold py-2.5">All Time</SelectItem>
                                    <SelectItem value="today" className="font-bold py-2.5">Today</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b border-slate-100 hover:bg-transparent h-16">
                                <TableHead className="py-4 pl-8 font-bold text-slate-500 text-[13px] font-figtree">Action</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-[13px] font-figtree">Quantity Change</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-[13px] font-figtree">Performed By</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-[13px] font-figtree">Status</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-[13px] font-figtree">Activity</TableHead>
                                <TableHead className="py-4 pr-8 font-bold text-slate-500 text-[13px] font-figtree">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                            {activities.map((act) => (
                                <TableRow 
                                    key={act.id}
                                    className="border-b border-slate-50 hover:bg-slate-50/30 transition-all h-20"
                                >
                                    <TableCell className="pl-8">
                                        <Badge className={cn(
                                            "text-[10px] font-bold px-2.5 py-1 rounded-lg border-none flex items-center gap-2 w-fit uppercase font-figtree",
                                            act.action === 'Updated' ? "bg-[#EFF6FF] text-[#3B59DA]" :
                                            act.action === 'Received' ? "bg-[#ECFDF5] text-[#16A34A]" :
                                            act.action === 'Removed' ? "bg-[#FEF2F2] text-[#EF4444]" :
                                            act.action === 'Auto-Alert' ? "bg-[#FFFBEB] text-[#D97706]" :
                                            "bg-slate-50 text-slate-500"
                                        )}>
                                            {act.action === 'Updated' ? <Settings className="h-3.5 w-3.5" /> :
                                             act.action === 'Received' ? <TrendingUp className="h-3.5 w-3.5" /> :
                                             act.action === 'Removed' ? <Trash2 className="h-3.5 w-3.5" /> :
                                             <AlertTriangle className="h-3.5 w-3.5" />}
                                            {act.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-700 font-bold font-figtree tabular-nums">
                                        {act.change === '-' || act.change === '0' ? '-' : act.change}
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit",
                                            act.performer === 'Procurement Officer' ? "bg-purple-50 text-purple-600" :
                                            act.performer === 'Kitchen Staff' ? "bg-orange-50 text-orange-600" :
                                            "bg-slate-50 text-slate-600"
                                        )}>
                                            {act.performer === 'Kitchen Staff' ? <Utensils className="h-3.5 w-3.5" /> : 
                                             act.performer === 'System Agent' ? <Bot className="h-3.5 w-3.5" /> : 
                                             <User className="h-3.5 w-3.5" />}
                                            <span className="text-[11px] font-bold uppercase tracking-wider font-figtree">{act.performer}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-[#10B981] font-bold font-figtree text-[13px]">
                                            <div className="bg-emerald-50 h-5 w-5 rounded-full flex items-center justify-center border border-emerald-100">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            </div>
                                            Verified
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 max-w-[280px] truncate font-medium font-figtree text-sm">{act.activity}</TableCell>
                                    <TableCell className="pr-8 text-slate-400 font-medium tabular-nums text-[13px] font-figtree">Oct 06, 2025; 14:32</TableCell>
                                </TableRow>
                            ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </PrimarySurfaceCard>
        </motion.div>
    </AppContainer>
  );
}

function StatBox({ label, value, unit, prefix }: { label: string, value: string | number, unit?: string, prefix?: string }) {
    return (
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 h-[140px] md:h-[155px] flex flex-col justify-between shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:border-indigo-100 active:scale-[0.98] font-figtree group overflow-hidden">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight line-clamp-1">{label}</p>
            <div className="mt-auto overflow-hidden">
                <div className="flex items-baseline gap-1">
                    {prefix && <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">{prefix}</span>}
                    <span className="text-[32px] md:text-[38px] lg:text-[42px] font-bold text-[#1E293B] group-hover:text-[#3B59DA] transition-colors tracking-tighter leading-none truncate">{value}</span>
                    {unit && <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-tight ml-1 truncate">{unit}</span>}
                </div>
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
