"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus as PlusIcon, 
  Search as SearchIcon, 
  RotateCcw as RefreshIcon,
  Package as PackageIcon, 
  ArrowRight,
  ArrowLeft,
  ChevronDown
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
    PrimarySurfaceCard,
    UnifiedHeroSurface
} from "@/components/ui/dosteon-ui";

export default function AllInventoryItemsPage() {
  const router = useRouter();
  const { isLocked } = useRestaurantDayLifecycle();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("all");
    const [level, setLevel] = useState<string>("all");

    const fetchData = async (params?: { search?: string; category?: string; level?: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await restaurantOpsService.getInventoryItems(params);
            setInventoryItems(items);
        } catch (err) {
            console.error("Failed to fetch inventory data:", err);
            setError("We couldn't load your full inventory list. Please try again or refresh the page.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData({
            search: search || undefined,
            category,
            level,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, category, level]);

    if (isLoading && !inventoryItems.length && !error) {
        return <InventoryItemsSkeleton />;
    }

  return (
    <AppContainer className="pb-24">

            {error && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}


      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="h-14 px-8 rounded-[8px] border-slate-200 bg-white font-bold text-slate-500 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all font-figtree shadow-sm text-[15px] active:scale-95 flex items-center gap-3"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </Button>
      </div>

      <UnifiedHeroSurface
        variant="inline"
        padding="px-8 py-8 md:px-10 md:py-8"
        minHeight="min-h-[160px]"
        backgroundColor="bg-[#f5f6ff]"
        borderColor="border-[#98a6f9]"
        title="Inventory"
        description="Below is a list of all items in your restaurant inventory"
        isLocked={false}
        topAction={
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    className={cn(
                        "h-12 px-6 rounded-[8px] border-slate-200 text-[#3B59DA] bg-white font-bold gap-3 transition-all shadow-sm font-figtree",
                        isLocked ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-slate-50 active:scale-95"
                    )}
                    onClick={() => fetchData({
                      search: search || undefined,
                      category,
                      level,
                    })}
                    disabled={isLoading || isLocked}
                >
                    <RefreshIcon className="h-4 w-4" /> {isLoading ? "Refreshing..." : "Update Inventory"}
                </Button>
                <Button className="h-12 px-8 bg-[#3B59DA] text-white hover:bg-[#2D46B2] rounded-[8px] font-bold gap-3 transition-all border-none shadow-lg shadow-indigo-100 active:scale-95 font-figtree" asChild>
                    <Link href="/dashboard/inventory/new">
                        <PlusIcon className="h-4 w-4" /> Add New Product
                    </Link>
                </Button>
            </div>
        }
      />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <PrimarySurfaceCard className="p-8 md:p-10">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4 flex-1 w-full max-w-2xl">
                    <div className="relative flex-1">
                                                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                                <Input
                                                    placeholder="Search items, SKUs, or brand..."
                                                    className="pl-14 h-14 border-slate-200 rounded-[8px] bg-white focus:ring-[#3B59DA]/5 focus:border-[#3B59DA]/30 placeholder:text-slate-300 font-medium text-base font-figtree shadow-none transition-all outline-none"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-14 border-slate-200 rounded-[8px] w-full sm:w-56 bg-white font-bold text-slate-500 text-sm shadow-sm px-6 hover:border-[#3B59DA]/20 transition-all">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[8px] border-slate-100 p-2 shadow-2xl">
                            <SelectItem value="all" className="font-bold py-2.5">All Categories</SelectItem>
                            <SelectItem value="produce" className="font-bold py-2.5 text-emerald-600">Produce</SelectItem>
                            <SelectItem value="meat" className="font-bold py-2.5 text-red-600">Meat & Poultry</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="h-14 border-slate-200 rounded-[8px] w-full sm:w-44 bg-white font-bold text-slate-500 text-sm shadow-sm px-6 hover:border-[#3B59DA]/20 transition-all">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[8px] border-slate-100 p-2 shadow-2xl">
                            <SelectItem value="all" className="font-bold py-2.5">All Levels</SelectItem>
                            <SelectItem value="healthy" className="font-bold py-2.5 text-emerald-600">Healthy</SelectItem>
                            <SelectItem value="low" className="font-bold py-2.5 text-amber-600">Low</SelectItem>
                            <SelectItem value="critical" className="font-bold py-2.5 text-red-600">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border border-slate-100 rounded-[8px] overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-b border-slate-100 hover:bg-transparent h-16">
                            <TableHead className="font-bold text-slate-500 text-[13px] py-4 pl-8 font-figtree">Item Name</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[13px] font-figtree">Category</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[13px] font-figtree">Brand</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[13px] font-figtree">Stock Unit</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[13px] font-figtree">Current Stock</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[13px] font-figtree">Min. Level</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[13px] font-figtree">Status</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[13px] font-figtree">Last Updated</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[13px] font-figtree text-right pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                                        <TableBody>
                                                <AnimatePresence mode="popLayout">
                                                {inventoryItems.length === 0 && !isLoading && !error && (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="py-10 text-center text-slate-400 font-medium font-figtree">
                                                            No inventory items match your filters yet.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {inventoryItems.map((item) => (
                            <TableRow key={item.id} className="border-slate-50 hover:bg-[#f8f9ff] transition-all group h-[88px] active:scale-[0.995] cursor-pointer">
                                <TableCell className="pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-[8px] border border-slate-100 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-slate-50">
                                                    <PackageIcon className="h-5 w-5 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                        <span className="font-bold text-slate-700 text-[16px] leading-tight font-figtree">{item.name}</span>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-[11px] text-slate-400 font-medium uppercase font-figtree tracking-tight">{item.sku || 'SKU ID'}</span>
                                                                                            {item.canonicalId && (
                                                                                                <Badge className="h-5 px-2 rounded-full bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold font-figtree tracking-tight">
                                                                                                    Linked to Catalog
                                                                                                </Badge>
                                                                                            )}
                                                                                        </div>
                                                                                </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-600 font-medium text-sm font-figtree">{item.category}</TableCell>
                                <TableCell className="text-slate-600 font-medium text-sm font-figtree">{item.brand || 'Brand Name'}</TableCell>
                                <TableCell className="text-slate-600 font-medium text-sm font-figtree">{item.unit || 'kg'}</TableCell>
                                <TableCell className="text-slate-700 font-bold text-sm font-figtree">{item.currentStock || '2.5'} {item.unit || 'kg'}</TableCell>
                                <TableCell className="text-slate-700 font-bold text-sm font-figtree">{item.minLevel || '5'} {item.unit || 'kg'}</TableCell>
                                <TableCell>
                                    <Badge 
                                        className={cn(
                                            "border-none rounded-[6px] font-bold text-[11px] px-2.5 py-1 font-figtree shadow-none",
                                            item.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" : 
                                            item.status === 'Low' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                        )}
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 font-medium text-sm font-figtree">Today, 8:30 AM</TableCell>
                                <TableCell className="text-right pr-8">
                                    <Button variant="outline" className="h-11 w-11 p-0 rounded-[8px] hover:bg-[#3B59DA] text-slate-400 hover:text-white transition-all active:scale-95 border-slate-200" asChild>
                                        <Link href={`/dashboard/inventory/${item.id}`}>
                                            <ArrowRight className="h-5 w-5" />
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
            <Skeleton className="h-12 w-1/3 rounded-[10px]" />
            <Skeleton className="h-[600px] w-full rounded-[10px]" />
        </div>
    );
}
