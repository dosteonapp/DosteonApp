"use client";

import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Search, 
  Package, 
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  History,
  Lock,
  ChevronRight,
  ChefHat,
  ClipboardList,
  PlusCircle,
  AlertCircle,
  Utensils,
  Users,
  ClipboardCheck
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { restaurantOpsService, InventoryItem } from "@/lib/services/restaurantOpsService";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function KitchenServicePage() {
  const { isOpen } = useRestaurantDayLifecycle();
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
      toast({ title: "Success", description: `Successfully logged ${logType} for ${selectedItem.name}` });
      setLogModalOpen(false);
      const items = await restaurantOpsService.getInventoryItems();
      setInventoryItems(items);
    } catch (err) {
      toast({ title: "Error", description: "Failed to log usage. Please try again.", variant: "destructive" });
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
    <div className="flex flex-col gap-2 w-full pb-8 relative font-figtree">
      

      {/* Page Header Outside Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-0 mt-0 mb-4">
        <div className="space-y-1">
          <h2 className="text-[24px] md:text-[30px] font-semibold text-[#1E293B] tracking-tight leading-none font-inria italic">Kitchen Service</h2>
          <p className="text-[14px] font-semibold text-slate-400">Service not started</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 font-bold text-[11px] shadow-sm uppercase tracking-wider">
          <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
          Closed Service
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full">
        {isOpen ? <KitchenServiceOpenHeader /> : <KitchenServiceLockedHero />}
      </div>

      {/* Track Product Usage Section */}
      <div className="w-full mt-8">
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 pb-[14px] md:pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-40">
            <div className="space-y-1.5">
              <h2 className="text-[22px] md:text-[26px] font-semibold text-[#1E293B] tracking-tight font-figtree">Track Product Usage</h2>
              <p className="text-slate-400 font-semibold text-[13px] md:text-sm font-figtree">Enter how much of each product you've used, or use +/- buttons to adjust</p>
            </div>
            <Button variant="link" className="text-slate-400 font-bold hover:text-[#3B59DA] transition-colors text-xs uppercase tracking-widest font-figtree" asChild>
              <Link href="/dashboard/kitchen-service/history">View Log History</Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-40">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search items..." 
                className="pl-12 h-12 md:h-[52px] border-slate-100 rounded-xl bg-slate-50/50 focus:ring-indigo-100 placeholder:font-semibold placeholder:text-slate-400" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
            {filteredItems.map((item) => (
              <Card key={item.id} className="rounded-[24px] border border-slate-100 overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#1E293B] text-[18px] md:text-[20px] leading-tight group-hover:text-[#3B59DA] transition-colors">{item.name}</h4>
                      <p className="text-[13px] text-slate-400 font-semibold">{item.currentStock} {item.unit}s remaining</p>
                    </div>
                    <Badge className={cn(
                      "border-none rounded-full font-bold text-[10px] px-3 py-1 uppercase tracking-wider",
                      item.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" : 
                      item.status === 'Low' || item.status === 'Running Low' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    )}>
                      {item.status === 'Low' ? 'Critical' : item.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="flex flex-col items-center justify-center gap-3 py-6 rounded-[20px] bg-slate-50 border border-slate-100/50 cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 transition-all duration-300 group/action" 
                      onClick={() => handleLogClick(item, 'usage')}
                    >
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover/action:bg-white shadow-sm transition-colors">
                        <ChefHat className="h-5 w-5 text-emerald-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight group-hover/action:text-emerald-600">Log Usage</span>
                    </div>
                    <div 
                      className="flex flex-col items-center justify-center gap-3 py-6 rounded-[20px] bg-slate-50 border border-slate-100/50 cursor-pointer hover:bg-red-50 hover:border-red-100 transition-all duration-300 group/action" 
                      onClick={() => handleLogClick(item, 'waste')}
                    >
                      <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center group-hover/action:bg-white shadow-sm transition-colors">
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight group-hover/action:text-red-600">Log Waste</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>


      {/* Modals & Dialogs */}
      <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className={cn("p-10 text-white", logType === 'usage' ? "bg-[#3B59DA]" : "bg-red-500")}>
            <DialogTitle className="text-3xl font-semibold italic font-inria tracking-tight">
              Log {logType === 'usage' ? 'Usage' : 'Waste'}
            </DialogTitle>
            <p className="text-white/80 font-bold text-sm mt-2 uppercase tracking-widest">
              Recording logs for {selectedItem?.name}
            </p>
          </DialogHeader>
          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Enter Amount ({selectedItem?.unit})</label>
              <Input 
                type="number"
                placeholder="0.00"
                className="h-16 md:h-20 text-3xl font-semibold border-slate-100 bg-slate-50/50 rounded-2xl focus:ring-[#3B59DA] px-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 gap-4">
            <Button variant="ghost" onClick={() => setLogModalOpen(false)} className="rounded-xl font-bold h-14 px-8 flex-1">Cancel</Button>
            <Button 
              className={cn("rounded-xl font-semibold h-14 px-10 border-none flex-[2] text-lg shadow-xl animate-in zoom-in-95", logType === 'usage' ? "bg-[#3B59DA] hover:bg-[#2D46B2] shadow-indigo-900/10" : "bg-red-500 hover:bg-red-600 shadow-red-900/10")}
              onClick={handleSubmitLog}
              disabled={isSubmitting || !amount}
            >
              {isSubmitting ? "Logging..." : `Confirm ${logType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KitchenServiceLockedOverlay() {
    return (
        <div className="absolute -left-6 -right-6 top-0 bottom-0 z-50 flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden">
            {/* Gradient Blur Background - Clear at top (header area), foggy at cards, blurry at bottom */}
            <div 
                className="absolute inset-0 backdrop-blur-[44px] bg-white/20" 
                style={{ 
                    maskImage: 'linear-gradient(to bottom, transparent 0px, transparent 420px, rgba(0,0,0,0.1) 480px, rgba(0,0,0,0.8) 700px, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, transparent 420px, rgba(0,0,0,0.1) 480px, rgba(0,0,0,0.8) 700px, black 100%)'
                }}
            />
            
            {/* Content Container (Sharp) - Positioned over the grid area */}
            <div className="relative z-50 flex flex-col items-center justify-center mt-[450px]">
                <div className="w-20 h-20 bg-[#D1D5DB]/80 rounded-[24px] flex items-center justify-center mb-6 shadow-sm backdrop-blur-md">
                    <Lock className="h-8 w-8 text-slate-600" />
                </div>
                
                <div className="space-y-4 max-w-sm">
                    <h3 className="text-[24px] md:text-[28px] font-bold text-[#111827] tracking-tight font-figtree">Kitchen Service is Locked</h3>
                    <p className="text-slate-500 text-[14px] md:text-sm leading-relaxed font-semibold max-w-[300px] mx-auto font-figtree">
                        The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                    </p>
                </div>

                <div className="mt-8">
                    <Button 
                        className="h-12 px-8 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-xl font-bold gap-3 shadow-lg shadow-indigo-900/10 transition-all active:scale-95 group border-none font-figtree" 
                        asChild
                    >
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function KitchenServiceLockedHero() {
    return (
        <div className="relative rounded-[24px] p-8 md:p-10 border border-slate-100 bg-white text-[#1E293B] flex flex-col lg:flex-row items-center justify-between shadow-sm transition-all duration-700 w-full overflow-hidden group">
            <div className="flex flex-col justify-between text-left w-full lg:w-[60%] shrink-0 z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Prep</span>
                    </div>
                    <h2 className="text-[32px] md:text-[40px] font-bold tracking-tight leading-none text-[#1E293B]">Hello, Sherry</h2>
                    <p className="text-slate-400 text-[15px] font-medium leading-relaxed max-w-sm">
                        Do your opening stock count before starting your restaurant operations.
                    </p>
                </div>
                
                <div className="flex flex-col gap-6 mt-8">
                    <div className="w-fit inline-flex items-center gap-2 text-slate-500 font-bold text-[13px]">
                        <ClipboardCheck className="h-4 w-4 text-[#3B59DA]" />
                        <span>16 items need counting</span>
                    </div>

                    <Button className="w-fit h-11 px-10 bg-[#3B59DA] text-white hover:bg-[#2D46B2] transition-all rounded-xl font-bold gap-3 text-sm shadow-sm border-none active:scale-95 group/btn" asChild>
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
            
            <div className="hidden lg:flex flex-1 items-center justify-center p-8">
                 <div className="h-56 w-56 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100/50">
                    <ChefHat className="h-28 w-28 text-slate-200 stroke-[1px]" />
                 </div>
            </div>
        </div>
    );
}

function KitchenServiceOpenHeader() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[24px] p-8 md:p-10 border border-slate-100 bg-white text-[#1E293B] flex flex-col lg:flex-row items-center justify-between shadow-sm transition-all duration-700 w-full overflow-hidden"
        >
            <div className="flex flex-col gap-4 text-left w-full lg:w-[48%] shrink-0 z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Service Active</span>
                    </div>
                    <h2 className="text-[28px] md:text-[36px] font-bold tracking-tight leading-tight text-[#1E293B]">Welcome back! Kitchen service is now in progress.</h2>
                    <p className="text-slate-400 text-[14px] font-medium leading-relaxed max-w-sm">
                        Service is active. Monitor ingredient usage and track production in real-time. Keep your kitchen efficient.
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 flex-1 w-full lg:min-w-0 z-10 mt-8 lg:mt-0">
                <KitchenSummaryCard label="Kitchen Status" value="Live" subtext="In Production" icon={<Clock className="h-4 w-4 text-emerald-500" />} />
                <KitchenSummaryCard label="Staff on Duty" value="08" subtext="Staff Members" icon={<Users className="h-4 w-4 text-[#3B59DA]" />} />
                <KitchenSummaryCard label="Ingredients Used" value="45" subtext="Items Today" icon={<Package className="h-4 w-4 text-orange-400" />} />
                <KitchenSummaryCard label="Production Count" value="120" subtext="Units Produced" icon={<Utensils className="h-4 w-4 text-indigo-400" />} />
            </div>
        </motion.div>
    );
}

function KitchenSummaryCard({ label, value, subtext, icon }: { label: string, value: string, subtext: string, icon: React.ReactNode }) {
    return (
        <div className="rounded-[20px] border border-slate-100 bg-[#FBFDFF] p-5 flex flex-col justify-between h-[130px] shadow-sm hover:border-indigo-100 transition-all group font-figtree">
            <div className="flex items-start justify-between">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 shadow-xs">
                    {icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
            </div>
            <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-[#1E293B] group-hover:text-[#3B59DA] transition-colors">{value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subtext}</div>
            </div>
        </div>
    );
}

function KitchenSkeleton() {
    return (
        <div className="p-10 space-y-12 min-h-screen bg-white">
            <Skeleton className="h-[360px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
