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
    <div className="flex flex-col gap-10 bg-white min-h-screen pb-20 max-w-[1700px] mx-auto w-full">

        {/* Hero Variant Toggle */}
        {isOpen ? <KitchenServiceOpenHeader /> : <KitchenServiceLockedHero />}

        {/* Track Product Usage Section */}
        <div className="space-y-6 md:space-y-8 bg-white border border-slate-200 rounded-[28px] md:rounded-[32px] p-6 md:p-10 relative overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-4 md:mb-8">
                <div className="space-y-1 md:space-y-2">
                    <h3 className="text-2xl md:text-3xl font-black text-[#1E293B] tracking-tight leading-none">Track Product Usage</h3>
                    <p className="text-xs md:text-sm text-slate-400 font-bold leading-relaxed">Enter how much of each product you've used, or use +/- buttons to adjust</p>
                </div>
                <Button variant="ghost" className="text-slate-500 hover:text-[#4F46E5] font-black text-xs md:text-sm p-0 md:p-2" asChild>
                    <Link href="/dashboard/kitchen-service/history">View Log History</Link>
                </Button>
            </div>

            <div className="flex items-center gap-6 mb-6 md:mb-10">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Search for an item..." 
                        className="pl-11 h-12 md:h-14 rounded-xl md:rounded-2xl border-slate-100 bg-[#F8FAFC]/50 font-bold focus-visible:ring-indigo-100 text-sm md:text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="relative">
                <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10", !isOpen && "opacity-20 pointer-events-none")}>
                    {filteredItems.map((item) => (
                        <Card key={item.id} className="group border border-slate-100 rounded-[24px] md:rounded-[32px] overflow-hidden bg-white hover:border-[#3B59DA]/10 hover:shadow-[0_20px_50px_-12px_rgba(59,89,218,0.1)] transition-all duration-500 shadow-sm">
                            <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
                                <div className="flex items-start justify-between min-h-[48px]">
                                    <div className="space-y-1 flex-1 min-w-0 pr-2">
                                        <h4 className="font-black text-[18px] md:text-[22px] text-[#1E293B] group-hover:text-[#3B59DA] transition-colors font-inria tracking-tight leading-tight italic truncate">{item.name}</h4>
                                        <p className="text-[11px] md:text-[13px] font-bold text-slate-400">{item.currentStock} {item.unit} remaining</p>
                                    </div>
                                    <Badge className={cn(
                                        "rounded-lg px-2 py-0.5 md:px-2.5 md:py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest border-none shrink-0",
                                        item.status === 'Critical' ? "bg-red-50 text-red-500" : 
                                        item.status === 'Low' ? "bg-amber-50 text-amber-500" : 
                                        "bg-emerald-50 text-emerald-500"
                                    )}>
                                        {item.status}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <button 
                                        className="flex flex-col items-center justify-center gap-2 md:gap-3 h-28 md:h-32 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all group/btn shadow-sm"
                                        onClick={() => handleLogClick(item, 'usage')}
                                    >
                                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-[#F0FDF4] flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                            <ChefHat className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Log Usage</span>
                                    </button>
                                    <button 
                                        className="flex flex-col items-center justify-center gap-2 md:gap-3 h-28 md:h-32 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all group/btn shadow-sm"
                                        onClick={() => handleLogClick(item, 'waste')}
                                    >
                                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-[#FEF2F2] flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                            <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Log Waste</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {!isOpen && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
                        <div className="bg-white/95 backdrop-blur-md rounded-[32px] md:rounded-[48px] p-8 md:p-16 shadow-[0_32px_128px_rgba(0,0,0,0.1)] border border-indigo-50 flex flex-col items-center text-center max-w-lg space-y-8 md:space-y-10">
                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[28px] bg-slate-100 text-[#1E293B] flex items-center justify-center shadow-inner">
                                <Lock className="h-7 w-7 md:h-9 md:w-9" />
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] tracking-tight">Kitchen Service is Locked</h2>
                                <p className="text-slate-500 text-base md:text-lg font-bold leading-relaxed px-4">
                                    The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                                </p>
                            </div>
                            <Button className="h-14 md:h-16 w-full sm:w-auto px-8 md:px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-xl md:rounded-2xl font-black gap-2 md:gap-3 text-base md:text-lg shadow-xl shadow-indigo-100 transition-all border-none group" asChild>
                                <Link href="/dashboard/inventory/daily-stock-count">
                                    Count Daily Stock <ArrowRight className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Log Modal */}
        <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
            <DialogContent className="sm:max-w-md rounded-[32px] md:rounded-[40px] p-6 md:p-10 border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl md:text-3xl font-black text-[#1E293B] tracking-tight">
                        {logType === 'usage' ? 'Log Usage' : 'Log Waste'}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-6 md:py-8 space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between p-4 md:p-6 bg-[#F8FAFC] rounded-2xl md:rounded-3xl border border-slate-50">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 mr-2">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                <Package className="h-5 w-5 md:h-6 md:w-6 text-[#4F46E5]" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-black text-slate-900 truncate">{selectedItem?.name}</h4>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 capitalize truncate">{selectedItem?.category}</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</p>
                            <p className="text-base md:text-lg font-black text-[#1E293B]">{selectedItem?.currentStock} {selectedItem?.unit}</p>
                        </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <label className="text-[11px] md:text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Amount to Log</label>
                        <div className="relative">
                            <Input 
                                type="number"
                                placeholder={`Enter amount in ${selectedItem?.unit}`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-14 md:h-16 rounded-xl md:rounded-[24px] border-slate-200 bg-white font-black text-lg md:text-xl pl-5 md:pl-6 focus-visible:ring-indigo-100"
                            />
                            <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs md:text-base">
                                {selectedItem?.unit}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-3 md:gap-4">
                    <Button 
                        variant="ghost" 
                        size="lg" 
                        className="rounded-xl h-12 md:h-14 px-6 md:px-8 font-black text-slate-500 hover:bg-slate-50 w-full sm:w-auto text-xs md:text-base"
                        onClick={() => setLogModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        disabled={isSubmitting || !amount}
                        className={cn(
                            "grow h-12 md:h-14 rounded-xl md:rounded-2xl px-8 md:px-10 font-black transition-all shadow-xl shadow-indigo-100 w-full sm:w-auto text-xs md:text-base",
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
        <div className="relative overflow-hidden rounded-[20px] p-6 md:p-8 lg:p-10 border border-[#3B59DA]/20 bg-white flex flex-col lg:flex-row gap-8 md:gap-10 items-center justify-start min-h-[220px]">
            {/* Live Service Badge - Precisely positioned top-right */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full border border-[#10B981] bg-white text-[#10B981] font-bold text-[11px] md:text-[13px] tracking-tight shadow-sm shrink-0">
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                Live Service
            </div>

            <div className="space-y-2 md:space-y-4 max-w-full lg:max-w-xs shrink-0 text-center lg:text-left mt-6 lg:mt-0">
                <h2 className="text-[24px] md:text-[28px] font-bold text-[#1E293B] tracking-tight leading-none">Kitchen Service</h2>
                <p className="text-[#94A3B8] font-medium text-[13px] md:text-[15px] leading-relaxed max-w-[280px] mx-auto lg:mx-0">
                    Manage your kitchen service here, including ingredient usage as you prepare food for your customers.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 items-stretch lg:items-center w-full lg:w-auto">
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
        <div className="bg-white rounded-[24px] md:rounded-[28px] p-6 lg:p-8 w-full lg:w-[260px] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between items-start space-y-6 md:space-y-8 hover:shadow-xl hover:border-indigo-100 transition-all h-[180px] md:h-[200px] lg:h-[220px] group active:scale-[0.98]">
            <div className="flex items-center gap-3 md:gap-4">
                <div 
                    className="h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: accentColor }}
                >
                    {icon}
                </div>
                <div className="text-[clamp(11px,1.2vw,14px)] font-bold text-slate-500 tracking-tight whitespace-nowrap group-hover:text-slate-700 transition-colors">
                    {label}
                </div>
            </div>
            <div className="space-y-2 md:space-y-3">
                <div className="text-[clamp(24px,2.5vw,36px)] font-black text-[#10B981] tracking-tight leading-none group-hover:translate-x-1 transition-transform">{value}</div>
                <div className="text-[clamp(10px,1.1vw,12px)] font-bold text-slate-400 tracking-tight leading-tight uppercase group-hover:text-slate-500 transition-colors">{subtext}</div>
            </div>
        </div>
    );
}

function KitchenServiceLockedHero() {
    return (
        <div className="relative overflow-hidden rounded-[32px] md:rounded-[48px] p-8 md:p-12 lg:p-14 shadow-2xl bg-gradient-to-r from-[#030712] via-[#2F29A3] to-[#8B31FF] text-white min-h-[300px] md:min-h-[340px] flex items-center">
            {/* Design Pattern Watermark */}
            <div className="hidden md:block absolute -bottom-12 -right-12 opacity-[0.08] pointer-events-none scale-150">
                <ChefHat className="h-[280px] w-[280px] -rotate-12" />
            </div>

            <div className="flex flex-col lg:flex-row gap-10 md:gap-16 relative z-10 w-full items-center justify-between">
                <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
                    <div className="space-y-4 md:space-y-6">
                        <h2 className="text-[36px] md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            Hello, <span className="font-inria italic font-medium opacity-90">Sherry</span>
                        </h2>
                        <p className="text-indigo-50/80 text-lg md:text-xl font-bold max-w-md mx-auto lg:mx-0 leading-relaxed">
                            Do your opening stock count before starting your restaurant operations.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/10 w-fit backdrop-blur-sm mx-auto lg:mx-0">
                            <ClipboardList className="h-4 w-4" />
                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em]">16 items need counting</span>
                        </div>
                    </div>
                    <Button className="h-14 md:h-16 px-8 md:px-10 bg-white text-[#3B59DA] hover:bg-slate-50 rounded-xl md:rounded-2xl font-black gap-2 md:gap-3 text-base md:text-lg shadow-xl shadow-indigo-900/20 transition-all border-none group w-full sm:w-auto" asChild>
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
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
