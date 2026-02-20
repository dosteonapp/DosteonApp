"use client";

import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Search, 
  Package, 
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  LayoutGrid,
  History,
  AlertTriangle,
  Lock,
  Utensils,
  Sun,
  X,
  PlusCircle,
  AlertCircle,
  Terminal,
  ChevronRight,
  ChefHat,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { restaurantOpsService, InventoryItem } from "@/lib/services/restaurantOpsService";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function KitchenServicePage() {
  const { isOpen, isLocked } = useRestaurantDayLifecycle();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logType, setLogType] = useState<'usage' | 'waste'>('usage');
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await restaurantOpsService.getInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isOpen]);

  const handleLogClick = (item: InventoryItem, type: 'usage' | 'waste') => {
    setSelectedItem(item);
    setLogType(type);
    setAmount("");
    setLogModalOpen(true);
  };

  const handleSubmitLog = async () => {
    if (!selectedItem || !amount) return;
    
    setIsSubmitting(true);
    try {
      const val = parseFloat(amount);
      if (logType === 'usage') {
        await restaurantOpsService.createUsageLog(selectedItem.id, val);
      } else {
        await restaurantOpsService.createWasteLog(selectedItem.id, val, "Kitchen service log");
      }
      
      toast({
        title: "Success",
        description: `Successfully logged ${logType} for ${selectedItem.name}`,
      });
      
      setLogModalOpen(false);
      // Refresh items
      const items = await restaurantOpsService.getInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <KitchenSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 bg-white min-h-screen pb-20 px-4 space-y-6">

        {/* Hero Variant Toggle */}
        {isOpen ? <KitchenServiceOpenHeader /> : <KitchenServiceLockedHero />}

        {/* Track Product Usage Section */}
        <div className="space-y-8 bg-white border border-slate-200 rounded-[32px] p-10 relative overflow-hidden shadow-sm">
            <div className="flex items-end justify-between mb-8">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-[#1E293B] tracking-tight">Track Product Usage</h3>
                    <p className="text-sm text-slate-400 font-bold">Enter how much of each product you've used, or use +/- buttons to adjust</p>
                </div>
                <Button variant="ghost" className="text-slate-500 hover:text-[#4F46E5] font-black text-sm" asChild>
                    <Link href="/dashboard/kitchen-service/history">View Log History</Link>
                </Button>
            </div>

            <div className="flex items-center gap-6 mb-10">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Search for an item..." 
                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-[#F8FAFC]/50 font-bold focus-visible:ring-indigo-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="relative">
                <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10", !isOpen && "opacity-20 pointer-events-none")}>
                    {filteredItems.map((item) => (
                        <Card key={item.id} className="group border border-slate-100 rounded-[32px] overflow-hidden bg-white hover:border-[#3B59DA]/10 hover:shadow-[0_20px_50px_-12px_rgba(59,89,218,0.1)] transition-all duration-500 shadow-sm">
                            <CardContent className="p-8 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-[22px] text-[#1E293B] group-hover:text-[#3B59DA] transition-colors font-inria tracking-tight leading-none italic">{item.name}</h4>
                                        <p className="text-[13px] font-bold text-slate-400">{item.currentStock} units remaining</p>
                                    </div>
                                    <Badge className={cn(
                                        "rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border-none shrink-0",
                                        item.status === 'Critical' ? "bg-red-50 text-red-500" : 
                                        item.status === 'Low' ? "bg-amber-50 text-amber-500" : 
                                        "bg-emerald-50 text-emerald-500"
                                    )}>
                                        {item.status}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all group/btn shadow-sm"
                                        onClick={() => handleLogClick(item, 'usage')}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                            <ChefHat className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Log Usage</span>
                                    </button>
                                    <button 
                                        className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all group/btn shadow-sm"
                                        onClick={() => handleLogClick(item, 'waste')}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                            <Trash2 className="h-5 w-5 text-red-500" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Log Waste</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {!isOpen && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-md rounded-[48px] p-16 shadow-[0_32px_128px_rgba(0,0,0,0.1)] border border-indigo-50 flex flex-col items-center text-center max-w-lg space-y-10">
                            <div className="h-20 w-20 rounded-[28px] bg-slate-100 text-[#1E293B] flex items-center justify-center shadow-inner">
                                <Lock className="h-9 w-9" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Kitchen Service is Locked</h2>
                                <p className="text-slate-500 text-lg font-bold leading-relaxed px-4">
                                    The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                                </p>
                            </div>
                            <Button className="h-16 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-2xl font-black gap-3 text-lg shadow-xl shadow-indigo-100 transition-all border-none group" asChild>
                                <Link href="/dashboard/inventory/daily-stock-count">
                                    Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Log Modal */}
        <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
            <DialogContent className="sm:max-w-md rounded-[40px] p-10 border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black text-[#1E293B] tracking-tight">
                        {logType === 'usage' ? 'Log Usage' : 'Log Waste'}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-8 space-y-8">
                    <div className="flex items-center justify-between p-6 bg-[#F8FAFC] rounded-3xl border border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                <Package className="h-6 w-6 text-[#4F46E5]" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900">{selectedItem?.name}</h4>
                                <p className="text-xs font-bold text-slate-400 capitalize">{selectedItem?.category}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</p>
                            <p className="text-lg font-black text-[#1E293B]">{selectedItem?.currentStock} {selectedItem?.unit}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Amount to Log</label>
                        <div className="relative">
                            <Input 
                                type="number"
                                placeholder={`Enter amount in ${selectedItem?.unit}`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-16 rounded-[24px] border-slate-200 bg-white font-black text-xl pl-6 focus-visible:ring-indigo-100"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                                {selectedItem?.unit}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between gap-4">
                    <Button 
                        variant="ghost" 
                        size="lg" 
                        className="rounded-2xl h-14 px-8 font-black text-slate-500 hover:bg-slate-50"
                        onClick={() => setLogModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        disabled={isSubmitting || !amount}
                        className={cn(
                            "grow h-14 rounded-2xl px-10 font-black transition-all shadow-xl shadow-indigo-100",
                            logType === 'usage' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                        )}
                        onClick={handleSubmitLog}
                    >
                        {isSubmitting ? "Processing..." : `Confirm ${logType === 'usage' ? 'Usage' : 'Waste'}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

function KitchenServiceOpenHeader() {
    return (
        <div className="relative overflow-hidden rounded-[20px] p-8 lg:p-10 border border-[#3B59DA]/20 bg-white flex flex-col lg:flex-row gap-10 items-center justify-start min-h-[220px]">
            {/* Live Service Badge - Precisely positioned top-right */}
            <div className="absolute top-6 right-6 lg:top-8 lg:right-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#10B981] bg-white text-[#10B981] font-bold text-[13px] tracking-tight shadow-sm shrink-0">
                <div className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                Live Service
            </div>

            <div className="space-y-4 max-w-full lg:max-w-xs shrink-0 text-left">
                <h2 className="text-[28px] font-bold text-[#1E293B] tracking-tight">Kitchen Service</h2>
                <p className="text-[#94A3B8] font-medium text-[15px] leading-relaxed max-w-[220px]">
                    Manage your kitchen service here, including ingredient usage as you prepare food for your customers.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5 items-stretch lg:items-center w-full lg:w-auto">
                <KitchenSummaryCard 
                    label="Kitchen Health" 
                    value="Healthy" 
                    subtext="Lunch service in progress"
                    icon={<Utensils className="h-4 w-4 text-[#10B981]" />}
                    accentColor="#F0FDF4"
                />
                <KitchenSummaryCard 
                    label="Critical Ingredients" 
                    value="0" 
                    subtext="Nothing urgent right now"
                    icon={<AlertCircle className="h-4 w-4 text-[#10B981]" />}
                    accentColor="#F0FDF4"
                />
            </div>
        </div>
    );
}

function KitchenSummaryCard({ label, value, subtext, icon, accentColor }: { label: string, value: string, subtext: string, icon: any, accentColor: string }) {
    return (
        <div className="bg-white rounded-[16px] p-6 w-full lg:w-[220px] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between items-start space-y-6 hover:shadow-md transition-all h-[170px]">
            <div className="flex items-center gap-3">
                <div 
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: accentColor }}
                >
                    {icon}
                </div>
                <div className="text-[14px] font-bold text-slate-700 tracking-tight whitespace-nowrap">
                    {label}
                </div>
            </div>
            <div className="space-y-3">
                <div className="text-[28px] font-extrabold text-[#10B981] tracking-tight leading-none">{value}</div>
                <div className="text-[12px] font-medium text-[#94A3B8] tracking-tight">{subtext}</div>
            </div>
        </div>
    );
}

function KitchenServiceLockedHero() {
    return (
        <div className="relative overflow-hidden rounded-[48px] p-12 lg:p-14 shadow-2xl bg-gradient-to-r from-[#030712] via-[#2F29A3] to-[#8B31FF] text-white min-h-[340px] flex items-center">
            {/* Design Pattern Watermark */}
            <div className="absolute -bottom-12 -right-12 opacity-[0.08] pointer-events-none scale-150">
                <ChefHat className="h-[280px] w-[280px] -rotate-12" />
            </div>

            <div className="flex flex-col lg:flex-row gap-16 relative z-10 w-full items-center justify-between">
                <div className="flex-1 space-y-8 text-left">
                    <div className="space-y-6">
                        <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            Hello, <span className="font-inria italic font-medium opacity-90">Sherry</span>
                        </h2>
                        <p className="text-indigo-50/80 text-xl font-bold max-w-md leading-relaxed">
                            Do your opening stock count before starting your restaurant operations.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-2xl border border-white/10 w-fit backdrop-blur-sm">
                            <ClipboardList className="h-4 w-4" />
                            <span className="text-[11px] font-black uppercase tracking-[0.18em]">16 items need counting</span>
                        </div>
                    </div>
                    <Button className="h-16 px-10 bg-white text-[#3B59DA] hover:bg-slate-50 rounded-2xl font-black gap-3 text-lg shadow-xl shadow-indigo-900/20 transition-all border-none group" asChild>
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function KitchenSkeleton() {
    return (
        <div className="max-w-7xl mx-auto w-full p-10 space-y-12">
            
            <div className="h-80 w-full bg-slate-50 rounded-[48px] animate-pulse" />
            
            <div className="space-y-8">
                <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-64 bg-slate-50 rounded-[32px] animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
