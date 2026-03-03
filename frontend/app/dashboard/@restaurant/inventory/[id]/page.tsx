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
        <div className="flex items-center mb-8">
            <Button 
                variant="outline" 
                className="h-12 px-6 rounded-xl font-bold border-slate-200 text-[#1E293B] hover:bg-slate-50 transition-all gap-3 shadow-sm font-figtree"
                onClick={() => router.back()}
            >
                <ChevronLeft className="h-5 w-5" /> Back
            </Button>
        </div>

        {/* Header: Item Summary Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <PrimarySurfaceCard className="p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden bg-[#F8FAFF] border-[#EEF2FF]">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.03] z-0">
                    <Utensils className="absolute bottom-[-40px] right-[40px] h-64 w-64 stroke-[1px]" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-10 lg:w-[60%] z-10">
                    {/* Item Image */}
                    <div className="h-44 w-44 md:h-56 md:w-56 rounded-[32px] overflow-hidden border-2 border-white bg-white flex items-center justify-center shrink-0 shadow-2xl relative group">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="text-slate-100 p-10">
                                <Package className="h-full w-full" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 text-center md:text-left">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Badge className="bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7] font-black text-[10px] px-3.5 py-1 rounded-lg border-none uppercase tracking-[0.15em] font-figtree shadow-sm">
                                    Healthy Stock
                                </Badge>
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                <FigtreeText className="text-slate-400 font-bold text-[11px] tracking-[0.15em] uppercase">SKU ID: {item.sku?.toUpperCase() || '001ABC'}</FigtreeText>
                            </div>
                            <InriaHeading className="text-[42px] md:text-[52px] font-bold text-[#1E293B] tracking-tight leading-[1.05] mb-2">{item.name || 'Organic Tomatoes'}</InriaHeading>
                            <Badge variant="outline" className="text-slate-400 font-bold text-[11px] px-4 py-2 rounded-xl border-slate-200 bg-white uppercase tracking-[0.15em] font-figtree shadow-sm w-fit border-none shadow-indigo-900/5">
                                Category: {item.category || 'Produce'}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-2">
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white font-bold text-slate-500 gap-3 hover:text-[#3B59DA] transition-all text-base font-figtree shadow-md active:scale-95" asChild>
                                <Link href={`/dashboard/inventory/new?edit=${item.id}`}>
                                    <Settings className="h-5 w-5" /> Edit Details
                                </Link>
                            </Button>
                            <Button 
                                className="h-14 px-10 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black gap-3 shadow-2xl shadow-indigo-900/10 transition-all border-none text-[17px] font-figtree active:scale-95 group"
                                onClick={() => setIsUpdateModalOpen(true)}
                            >
                                <RotateCcw className="h-5 w-5 transition-transform group-hover:rotate-180 duration-700" /> Restock Now
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* Right Side Stats */}
                <div className="grid grid-cols-2 gap-4 lg:w-[38%] z-10 w-full lg:mb-auto mt-4 lg:mt-0">
                    <UnifiedStatCard label="Current Stock" value={String(item.currentStock || '45')} subtext={item.unit || 'units'} icon={Package} variant="neutral" />
                    <UnifiedStatCard label="Market Price" value={String(item.avgPrice || '3000')} subtext="RWF / kg" icon={TrendingUp} variant="neutral" />
                    <UnifiedStatCard label="Minimum Stock" value={String(item.minLevel || '20')} subtext={item.unit || 'units'} icon={ShieldCheck} variant="neutral" />
                    <UnifiedStatCard label="Reorder Point" value={String(item.restockPoint || '24')} subtext={item.unit || 'units'} icon={Zap} variant="neutral" />
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
            <PrimarySurfaceCard className="p-8 lg:p-12 space-y-10">
                <div className="space-y-6">
                    <InriaHeading className="text-[34px] font-bold text-[#1E293B] tracking-tight">Stock Activity History</InriaHeading>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-[420px]">
                            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input 
                                placeholder="Search stock history..." 
                                className="pl-14 h-[64px] rounded-2xl border-slate-200 bg-[#F8FAFC] font-bold text-slate-600 text-[15px] font-figtree shadow-sm focus:ring-slate-100 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-52 h-[64px] rounded-2xl border-slate-200 bg-white font-bold text-slate-500 text-sm shadow-sm px-6">
                                    <SelectValue placeholder="All Activities" />
                                </SelectTrigger>
                            </Select>
                            <Select defaultValue="all">
                                <SelectTrigger className="w-52 h-[64px] rounded-2xl border-slate-200 bg-white font-bold text-slate-500 text-sm shadow-sm px-6">
                                    <SelectValue placeholder="All Time" />
                                </SelectTrigger>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-white shadow-inner">
                    <Table>
                        <TableHeader className="bg-[#F8FAFC]">
                            <TableRow className="border-b border-slate-100/50 hover:bg-transparent uppercase">
                                <TableHead className="py-6 pl-8 font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree">Action Status</TableHead>
                                <TableHead className="py-6 font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree">Quantity Change</TableHead>
                                <TableHead className="py-6 font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree">Performed By</TableHead>
                                <TableHead className="py-6 font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree">Verification</TableHead>
                                <TableHead className="py-6 font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree">Activity Details</TableHead>
                                <TableHead className="py-6 pr-8 font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                            {activities.map((act, idx) => (
                                <TableRow 
                                    key={act.id}
                                    className="border-b border-slate-50 hover:bg-[#F8FAFF] transition-all font-bold text-[15px] h-20"
                                >
                                    <TableCell className="py-2 pl-8">
                                        <Badge className={cn(
                                            "text-[10px] font-black px-3 py-1.5 rounded-lg border-none flex items-center gap-2 w-fit uppercase tracking-widest font-figtree shadow-sm",
                                            act.action === 'Updated' ? "bg-[#EFF6FF] text-[#3B59DA]" :
                                            act.action === 'Received' ? "bg-[#ECFDF5] text-[#16A34A]" :
                                            act.action === 'Removed' ? "bg-[#FEF2F2] text-[#EF4444]" :
                                            act.action === 'Auto-Alert' ? "bg-[#FFFBEB] text-[#D97706]" :
                                            "bg-[#F8FAFC] text-slate-500"
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
                                    <TableCell className="text-[#1E293B] font-black font-figtree tabular-nums">
                                        {act.change === '-' || act.change === '0' ? '-' : act.change}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                                {act.performer === 'Kitchen Staff' ? <Utensils className="h-4 w-4" /> : 
                                                 act.performer === 'System Agent' ? <RefreshCcw className="h-4 w-4" /> : 
                                                 <User className="h-4 w-4" />}
                                            </div>
                                            <FigtreeText className="text-slate-500 font-bold text-sm tracking-tight">{act.performer}</FigtreeText>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-[#10B981] font-black font-figtree text-[13px] uppercase tracking-wider">
                                            <div className="bg-[#ECFDF5] h-6 w-6 rounded-full flex items-center justify-center border border-[#D1FAE5]">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            Verified
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 max-w-[280px] truncate font-medium font-figtree">{act.activity}</TableCell>
                                    <TableCell className="pr-8 text-slate-400 font-bold tabular-nums text-sm font-figtree">Tuesday, Oct 06, 2025; 14:32</TableCell>
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
        <div className="bg-white border border-slate-100 rounded-[18px] p-6 h-[140px] md:h-[155px] flex flex-col justify-between shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:border-indigo-100 active:scale-[0.98] font-figtree group overflow-hidden">
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
