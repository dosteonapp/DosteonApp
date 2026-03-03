"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus as PlusIcon, 
  Search as SearchIcon, 
  Package as PackageIcon, 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { restaurantOpsService, InventoryItem } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
    AppContainer, 
    InriaHeading, 
    FigtreeText, 
    PrimarySurfaceCard 
} from "@/components/ui/dosteon-ui";

export default function AllInventoryItemsPage() {
  const router = useRouter();
  const { isLocked } = useRestaurantDayLifecycle();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await restaurantOpsService.getInventoryItems();
        setInventoryItems(items);
      } catch (err) {
        console.error("Failed to fetch inventory data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <InventoryItemsSkeleton />;
  }

  return (
    <AppContainer className="pb-24">


      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PrimarySurfaceCard className="p-10 md:p-12 space-y-12">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-[72px] w-[72px] shrink-0 p-0 rounded-[22px] border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-6 w-6 text-slate-400" />
                    </Button>
                    <div className="relative flex-1 min-w-0">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
                        <Input placeholder="Search your product registry..." className="pl-16 h-[72px] border-slate-200 rounded-[22px] bg-white focus:ring-[#3B59DA]/5 focus:border-[#3B59DA]/30 placeholder:text-slate-300 placeholder:font-black font-black text-[17px] font-figtree shadow-none focus:shadow-xl focus:shadow-indigo-500/5 transition-all outline-none" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <Select defaultValue="all">
                        <SelectTrigger className="h-[72px] border-slate-200 rounded-[22px] w-full sm:w-56 bg-white font-black text-slate-500 text-sm shadow-sm px-8 hover:border-[#3B59DA]/20 transition-all">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 p-2 shadow-2xl">
                            <SelectItem value="all" className="font-bold py-3">All Categories</SelectItem>
                            <SelectItem value="produce" className="font-bold py-3 text-emerald-600">Produce</SelectItem>
                            <SelectItem value="meat" className="font-bold py-3 text-red-600">Meat & Poultry</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Button className="h-[72px] px-8 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-[22px] font-black gap-4 text-base shadow-xl shadow-indigo-900/10 border-none transition-all active:scale-95 font-figtree shrink-0" asChild>
                        <Link href="/dashboard/inventory/new">
                        <PlusIcon className="h-6 w-6" /> Create Product
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-[#F8FAFC]">
                        <TableRow className="border-b border-slate-50 hover:bg-transparent uppercase h-24">
                            <TableHead className="font-black text-slate-400 text-[10px] tracking-[0.25em] py-5 pl-10 font-figtree">Product Information</TableHead>
                            <TableHead className="font-black text-slate-400 text-[10px] tracking-[0.25em] font-figtree">Category</TableHead>
                            <TableHead className="font-black text-slate-400 text-[10px] tracking-[0.25em] font-figtree text-center">Brand</TableHead>
                            <TableHead className="font-black text-slate-400 text-[10px] tracking-[0.25em] font-figtree text-center">Unit</TableHead>
                            <TableHead className="font-black text-slate-400 text-[10px] tracking-[0.25em] font-figtree text-right">Current Stock</TableHead>
                            <TableHead className="font-black text-slate-400 text-[10px] tracking-[0.25em] font-figtree text-center">Status</TableHead>
                            <TableHead className="font-black text-slate-400 text-[10px] tracking-[0.25em] font-figtree text-right pr-10">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                        {inventoryItems.map((item) => (
                            <TableRow key={item.id} className="border-slate-50 hover:bg-[#F8FAFF] transition-all group h-[110px]">
                                <TableCell className="pl-10">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-full border border-slate-100 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="p-5 text-slate-100 h-full w-full flex items-center justify-center bg-slate-50">
                                                    <PackageIcon className="h-8 w-8 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <InriaHeading className="font-bold text-[#1E293B] text-[22px] group-hover:text-[#3B59DA] transition-colors leading-none tracking-tight">{item.name}</InriaHeading>
                                            <FigtreeText className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em] leading-none">{item.sku}</FigtreeText>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-[#64748B] font-black text-sm font-figtree uppercase tracking-wider">{item.category}</TableCell>
                                <TableCell className="text-[#64748B] font-black text-sm font-figtree text-center">{item.brand || '—'}</TableCell>
                                <TableCell className="text-[#64748B] font-black text-xs uppercase font-figtree tracking-widest text-center">{item.unit}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                        <FigtreeText className="font-black text-[#1E293B] text-[20px] tabular-nums leading-none">{item.currentStock}</FigtreeText>
                                        <FigtreeText className="text-[11px] font-black text-slate-300 uppercase tracking-widest mt-1">{item.unit}</FigtreeText>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge 
                                        className={cn(
                                            "border-none rounded-lg font-black text-[9px] px-3.5 py-1.5 uppercase tracking-[0.2em] font-figtree shadow-sm",
                                            item.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" : 
                                            item.status === 'Low' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                        )}
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-10">
                                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-white hover:shadow-2xl text-slate-200 hover:text-[#3B59DA] transition-all active:scale-90 border border-transparent hover:border-slate-50" asChild>
                                        <Link href={`/dashboard/inventory/${item.id}`}>
                                            <ChevronRight className="h-6 w-6" />
                                        </Link>
                                    </Button>
                                </TableCell>
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

function InventoryItemsSkeleton() {
    return (
        <div className="p-10 space-y-10 min-h-screen bg-white">
            <Skeleton className="h-12 w-1/3 rounded-xl" />
            <Skeleton className="h-[600px] w-full rounded-[32px]" />
        </div>
    );
}
