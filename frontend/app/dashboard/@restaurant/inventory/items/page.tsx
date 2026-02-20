"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  PlusIcon,
  Search, 
  RotateCcw, 
  ChevronLeft,
  Filter,
  ArrowRight,
  MoreVertical,
  ArrowUpRight,
  RefreshCcw,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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

import { motion, AnimatePresence } from "framer-motion";
import { InventoryUpdateItemModal } from "@/components/inventory/InventoryUpdateItemModal";

export default function InventoryItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    fetchItems();
  }, [search, categoryFilter, levelFilter]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await restaurantOpsService.getInventoryItems({
        search,
        category: categoryFilter,
        level: levelFilter
      });
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch inventory items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 bg-white min-h-screen pb-40">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
            variant="outline"
            className="h-12 px-8 rounded-2xl border-slate-200 bg-white font-bold text-slate-600 gap-2 hover:bg-slate-50 transition-all w-fit shadow-sm"
            asChild
        >
            <Link href="/dashboard/inventory">
                <ChevronLeft className="h-4 w-4" /> Back
            </Link>
        </Button>
      </motion.div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] p-10 border border-indigo-100 bg-white space-y-10 shadow-sm"
      >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3">
                  <h1 className="text-[32px] font-black text-[#1E293B] tracking-tight font-inria leading-none">Inventory</h1>
                  <p className="text-base font-bold text-slate-400">Below is a list of all items in your restaurant inventory</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                  <Button variant="outline" className="h-[52px] px-8 rounded-2xl border-indigo-200 bg-white text-[#3B59DA] hover:bg-slate-50 font-black gap-3 transition-all shadow-sm">
                      <RefreshCcw className="h-4 w-4" /> Update Inventory
                  </Button>
                  <Button
                      className="h-[52px] px-8 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black gap-3 shadow-lg shadow-indigo-100 transition-all border-none group"
                      asChild
                  >
                      <Link href="/dashboard/inventory/new">
                          <Plus className="h-5 w-5" /> Add New Product
                      </Link>
                  </Button>
              </div>
          </div>
      </motion.div>

      {/* Filters & Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-100 rounded-[32px] p-8 lg:p-10 shadow-sm space-y-8"
      >
          {/* Filter Bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2">
              <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search items, SKUs, or brand..."
                    className="pl-14 h-14 rounded-2xl border-slate-100 bg-[#F8FAFC] font-bold text-slate-600 focus-visible:ring-indigo-100"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-56 h-14 rounded-2xl border-slate-100 bg-white font-black text-slate-500 shadow-sm">
                          <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100">
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="produce">Produce</SelectItem>
                          <SelectItem value="Beverage">Beverage</SelectItem>
                      </SelectContent>
                  </Select>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-56 h-14 rounded-2xl border-slate-100 bg-white font-black text-slate-500 shadow-sm">
                          <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100">
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="low">Low Stock</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>

          <div className="border border-slate-50 rounded-[28px] overflow-hidden bg-white">
              <Table>
                  <TableHeader className="bg-[#F8FAFC]">
                      <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="py-7 pl-10 font-bold text-slate-500 text-[13px]">Item Name</TableHead>
                          <TableHead className="py-7 font-bold text-slate-500 text-[13px]">Category</TableHead>
                          <TableHead className="py-7 font-bold text-slate-500 text-[13px]">Brand</TableHead>
                          <TableHead className="py-7 font-bold text-slate-500 text-[13px]">Stock Unit</TableHead>
                          <TableHead className="py-7 font-bold text-slate-500 text-[13px]">Current Stock</TableHead>
                          <TableHead className="py-7 font-bold text-slate-500 text-[13px]">Min. Level</TableHead>
                          <TableHead className="py-7 font-bold text-slate-500 text-[13px]">Status</TableHead>
                          <TableHead className="py-7 font-bold text-slate-500 text-[13px]">Last Updated</TableHead>
                          <TableHead className="text-right py-7 pr-10 font-bold text-slate-500 text-[13px]">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <AnimatePresence mode="popLayout">
                      {isLoading ? (
                          [1, 2, 3, 4, 5].map(i => (
                              <TableRow key={i} className="border-b border-slate-50">
                                  <TableCell colSpan={9} className="py-10 pl-10 pr-10"><Skeleton className="h-14 w-full rounded-xl" /></TableCell>
                              </TableRow>
                          ))
                      ) : items.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={9} className="h-80 text-center">
                                  <div className="space-y-4">
                                      <p className="text-slate-400 font-bold text-lg italic font-inria">No items found matching your search</p>
                                      <Button variant="link" className="text-indigo-600" onClick={() => { setSearch(""); setCategoryFilter("all"); setLevelFilter("all"); }}>Clear all filters</Button>
                                  </div>
                              </TableCell>
                          </TableRow>
                      ) : (
                          items.map((item, idx) => (
                              <motion.tr
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-b border-slate-50 hover:bg-slate-50/50 group transition-all"
                              >
                                  <TableCell className="py-6 pl-10">
                                      <div className="flex items-center gap-4">
                                          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                              {item.imageUrl ? (
                                                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                              ) : (
                                                  <Plus className="h-4 w-4 opacity-20 text-slate-400" />
                                              )}
                                          </div>
                                          <div className="space-y-0.5">
                                              <h4 className="font-bold text-[#1E293B] text-base">{item.name || 'Tomatoes'}</h4>
                                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">SKU ID</p>
                                          </div>
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-sm font-bold text-slate-500 capitalize">{item.category}</TableCell>
                                  <TableCell className="text-sm font-bold text-slate-500">{item.brand || 'Brand Name'}</TableCell>
                                  <TableCell className="text-sm font-bold text-slate-400 uppercase">{item.unit}</TableCell>
                                  <TableCell className="text-[15px] font-black text-[#1E293B] tabular-nums">
                                      {item.currentStock} <span className="text-[11px] font-bold text-slate-400 font-sans">{item.unit}</span>
                                  </TableCell>
                                  <TableCell className="text-sm font-bold text-slate-500">{item.minLevel || '5'} <span className="text-[11px] text-slate-400 ml-0.5">{item.unit}</span></TableCell>
                                  <TableCell>
                                      <Badge className={cn(
                                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none",
                                          item.status === 'Critical' ? "bg-red-50 text-red-500" :
                                          item.status === 'Low' ? "bg-amber-50 text-amber-500" :
                                          "bg-emerald-50 text-emerald-500"
                                      )}>
                                          {item.status}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm font-bold text-slate-400 italic">Today, 8:30 AM</TableCell>
                                  <TableCell className="text-right pr-10">
                                      <div className="flex items-center justify-end gap-2">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm group-hover:bg-white"
                                            title="Quick Update"
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setIsUpdateModalOpen(true);
                                            }}
                                          >
                                              <RefreshCcw className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400 group-hover:text-[#3B59DA] transition-colors" />
                                          </Button>
                                          <Button variant="outline" size="icon" className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm group-hover:bg-white" asChild title="Edit Item">
                                              <Link href={`/dashboard/inventory/new?edit=${item.id}`}>
                                                  <Settings className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                              </Link>
                                          </Button>
                                          <Button variant="outline" size="icon" className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm group-hover:bg-white" asChild title="View Details">
                                              <Link href={`/dashboard/inventory/${item.id}`}>
                                                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                              </Link>
                                          </Button>
                                      </div>
                                  </TableCell>
                              </motion.tr>
                          ))
                      )}
                      </AnimatePresence>
                  </TableBody>
              </Table>
          </div>
      </motion.div>

      <InventoryUpdateItemModal
          open={isUpdateModalOpen}
          onOpenChange={setIsUpdateModalOpen}
          item={selectedItem}
          onUpdate={() => {
              fetchItems();
          }}
      />
    </div>
  );
}
