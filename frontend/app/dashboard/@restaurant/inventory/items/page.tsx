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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
            <Button 
                variant="outline" 
                size="sm" 
                className="h-14 w-14 p-0 rounded-2xl border-slate-200 bg-white shadow-md hover:bg-slate-50 transition-all active:scale-95"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-6 w-6 text-slate-400" />
            </Button>
            <div className="space-y-1">
                <FigtreeText className="text-[14px] font-bold text-slate-400 uppercase tracking-widest leading-none">Inventory Registry</FigtreeText>
                <InriaHeading className="text-[38px] md:text-[46px] font-bold text-[#1E293B] tracking-tight leading-none">All Products</InriaHeading>
            </div>
        </div>
        <div className="flex items-center gap-4">
          <Button className="h-16 px-10 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-2xl font-black gap-4 text-lg shadow-2xl shadow-indigo-900/10 border-none transition-all active:scale-95 font-figtree" asChild>
            <Link href="/dashboard/inventory/new">
              <PlusIcon className="h-6 w-6" /> Create New Product
            </Link>
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PrimarySurfaceCard className="p-10 md:p-12 space-y-12">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                <div className="relative w-full max-w-[520px]">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <Input placeholder="Search your product registry..." className="pl-16 h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] focus:ring-slate-100 placeholder:text-slate-400 font-bold text-[17px] font-figtree shadow-inner transition-all" />
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <Select defaultValue="all">
                        <SelectTrigger className="h-[72px] border-slate-200 rounded-2xl w-full sm:w-60 bg-white font-black text-slate-500 text-sm shadow-md px-8">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 p-2">
                            <SelectItem value="all" className="font-bold py-3">All Categories</SelectItem>
                            <SelectItem value="produce" className="font-bold py-3">Produce</SelectItem>
                            <SelectItem value="meat" className="font-bold py-3">Meat & Poultry</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-[72px] border-slate-200 rounded-2xl w-full sm:w-60 bg-white font-black text-slate-500 text-sm shadow-md px-8">
                            <SelectValue placeholder="All Stock Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 p-2">
                            <SelectItem value="all" className="font-bold py-3">All Status</SelectItem>
                            <SelectItem value="healthy" className="font-bold py-3">Healthy</SelectItem>
                            <SelectItem value="low" className="font-bold py-3 text-amber-500">Low Stock</SelectItem>
                            <SelectItem value="critical" className="font-bold py-3 text-red-500">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border border-slate-100 rounded-[28px] overflow-hidden bg-white shadow-inner">
                <Table>
                    <TableHeader className="bg-[#F8FAFC]">
                        <TableRow className="border-b border-slate-100/50 hover:bg-transparent uppercase h-20">
                            <TableHead className="font-black text-slate-400 text-[11px] tracking-[0.2em] py-5 pl-10 font-figtree">Product Information</TableHead>
                            <TableHead className="font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree">Category</TableHead>
                            <TableHead className="font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree text-center">Brand</TableHead>
                            <TableHead className="font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree text-center">Unit</TableHead>
                            <TableHead className="font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree text-right">Current Stock</TableHead>
                            <TableHead className="font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree text-center">Status</TableHead>
                            <TableHead className="font-black text-slate-400 text-[11px] tracking-[0.2em] font-figtree text-right pr-10">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                        {inventoryItems.map((item) => (
                            <TableRow key={item.id} className="border-slate-50 hover:bg-[#F8FAFF] transition-all group h-[110px]">
                                <TableCell className="pl-10">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-[22px] border-2 border-white bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="p-4 text-slate-100">
                                                    <PackageIcon className="h-full w-full" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <InriaHeading className="font-bold text-[#1E293B] text-[20px] group-hover:text-[#3B59DA] transition-colors">{item.name}</InriaHeading>
                                            <FigtreeText className="text-[12px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">{item.sku}</FigtreeText>
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
                                            "border-none rounded-lg font-black text-[10px] px-3.5 py-1.5 uppercase tracking-[0.15em] font-figtree shadow-sm",
                                            item.status === 'Healthy' ? "bg-[#DCFCE7] text-[#166534]" : 
                                            item.status === 'Low' ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#FEE2E2] text-[#991B1B]"
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
