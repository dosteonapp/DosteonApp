"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { motion } from "framer-motion";

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
    <div className="flex flex-col gap-8 w-full pb-20 font-figtree">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-0">
        <div className="flex items-center gap-4">
            <Button 
                variant="outline" 
                size="sm" 
                className="h-10 w-10 p-0 rounded-xl"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
                <h2 className="text-[24px] md:text-[28px] font-bold text-[#1E293B] tracking-tight leading-none">All Inventory Items</h2>
                <p className="text-[13px] font-medium text-slate-400">View and manage your entire product registry</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-6 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-xl font-bold gap-2 text-sm shadow-sm border-none" asChild>
            <Link href="/dashboard/inventory/new">
              <PlusIcon className="h-4 w-4" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm space-y-8"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative w-full max-w-md">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input placeholder="Search records..." className="pl-12 h-12 border-slate-100 rounded-xl bg-slate-50/30 focus:ring-indigo-100 placeholder:text-slate-400 font-medium text-sm" />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select defaultValue="all">
                    <SelectTrigger className="h-12 border-slate-100 rounded-xl w-full sm:w-40 bg-white font-bold text-slate-500 text-xs">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                        <SelectItem value="all">Category: All</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="all">
                    <SelectTrigger className="h-12 border-slate-100 rounded-xl w-full sm:w-40 bg-white font-bold text-slate-500 text-xs">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                        <SelectItem value="all">Status: All</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-50 bg-[#FBFDFF] hover:bg-[#FBFDFF]">
                        <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest py-5 pl-8">Item Name</TableHead>
                        <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Category</TableHead>
                        <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Brand</TableHead>
                        <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Stock Unit</TableHead>
                        <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Current Stock</TableHead>
                        <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
                        <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right pr-8">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inventoryItems.map((item) => (
                        <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50 transition-all group">
                            <TableCell className="py-5 pl-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <PackageIcon className="h-5 w-5 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[#1E293B] text-sm">{item.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.sku}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-500 font-bold text-xs">{item.category}</TableCell>
                            <TableCell className="text-slate-500 font-bold text-xs">{item.brand}</TableCell>
                            <TableCell className="text-slate-500 font-bold text-xs uppercase">{item.unit}</TableCell>
                            <TableCell className="font-bold text-[#1E293B] text-sm">{item.currentStock}</TableCell>
                            <TableCell>
                                <Badge 
                                    className={cn(
                                        "border-none rounded-full font-bold text-[9px] px-2.5 py-0.5 uppercase tracking-tight",
                                        item.status === 'Healthy' ? "bg-emerald-100 text-emerald-600" : 
                                        item.status === 'Low' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                                    )}
                                >
                                    {item.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-[#F1F5F9] text-slate-300 hover:text-[#3B59DA] transition-all" asChild>
                                    <Link href={`/dashboard/inventory/${item.id}`}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </motion.div>
    </div>
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
