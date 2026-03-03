"use client";

import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Search, 
  History,
  Lock,
  ChefHat,
  Utensils,
  Package,
  Trash2,
  X,
  AlertTriangle,
  History as HistoryIcon,
  Activity,
  Droplets,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
    UnifiedHeroSurface, 
    UnifiedStatCard, 
    AppContainer, 
    InriaHeading, 
    FigtreeText,
    UnifiedModal
} from "@/components/ui/dosteon-ui";

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
    <AppContainer className="pb-24">

      {/* Hero / Header Area */}
      <div className="w-full">
        {isOpen ? (
            <UnifiedHeroSurface
                title="Live Operations In Progress"
                subtitle="Your kitchen is currently active. Record ingredient usage, track production, and manage waste in real-time."
                isLocked={false}
                badge={
                    <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-emerald-100 bg-white/80 backdrop-blur-sm w-fit shadow-md text-emerald-600">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <FigtreeText className="font-black text-[11px] uppercase tracking-widest leading-none">Live Service</FigtreeText>
                    </div>
                }
            >
                <UnifiedStatCard 
                  label="Kitchen Status" 
                  value="Healthy" 
                  subtext="Lunch shift running" 
                  icon={Activity}
                  variant="green"
                />
                <UnifiedStatCard 
                  label="Urgent Alerts" 
                  value="00" 
                  subtext="No issues detected" 
                  icon={AlertTriangle}
                  variant="neutral"
                />
                <UnifiedStatCard 
                  label="Usage Logs" 
                  value="124" 
                  subtext="Entries today" 
                  icon={HistoryIcon}
                  variant="neutral"
                />
            </UnifiedHeroSurface>
        ) : (
            <UnifiedHeroSurface
                title={`Welcome back, Sherry`}
                subtitle="The Kitchen Service workflow is currently locked. Complete your opening stock count to enable operations."
                isLocked={true}
                badge={
                    <div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#EF4444] w-fit shadow-2xl shadow-red-900/40">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <FigtreeText className="text-[11px] font-black text-white uppercase tracking-[0.1em]">16 items need counting</FigtreeText>
                    </div>
                }
                action={
                    <Button className="w-fit h-16 px-12 bg-white text-[#3B59DA] hover:bg-slate-50 transition-all rounded-2xl font-black gap-4 text-[20px] shadow-2xl shadow-indigo-950/20 border-none active:scale-95 group font-figtree" asChild>
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-3" />
                        </Link>
                    </Button>
                }
            >
                <div className="hidden xl:flex flex-1 items-center justify-end pr-10">
                     <div className="h-56 w-56 bg-white/5 backdrop-blur-3xl rounded-[44px] flex items-center justify-center border border-white/10 shadow-inner">
                        <ChefHat className="h-32 w-32 text-indigo-100/10 stroke-[1px]" />
                     </div>
                </div>
            </UnifiedHeroSurface>
        )}
      </div>

      {/* Main Track Section */}
      <div className="w-full relative mt-8">
        <div className={cn(
          "bg-white border border-slate-100 rounded-[40px] p-8 md:p-12 shadow-[0_32px_120px_rgba(15,23,42,0.025)] space-y-12 transition-all duration-700",
          !isOpen && "blur-2xl grayscale scale-[0.96] opacity-30 pointer-events-none"
        )}>
          {/* Section Header */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 px-4 pt-4">
            <div className="space-y-2.5">
              <FigtreeText className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mb-3">Manual Registry</FigtreeText>
              <InriaHeading className="text-[34px] md:text-[42px] font-bold text-[#1E293B] tracking-tight leading-none">Stock Consumption Tracker</InriaHeading>
            </div>
            <Button variant="link" className="text-[#3B59DA] font-black hover:text-[#2D46B2] transition-colors text-[15px] font-figtree p-0 h-auto gap-2" asChild>
              <Link href="/dashboard/kitchen-service/history">View Detailed Consumption History <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 px-0" />
            <Input 
              placeholder="Quick search products..." 
              className="pl-16 h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC]/50 focus:ring-[#3B59DA]/5 placeholder:text-slate-300 placeholder:font-black font-black text-[17px] font-figtree shadow-none focus:shadow-xl focus:shadow-indigo-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Order Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <Card key={item.id} className="rounded-[40px] border border-slate-100/50 overflow-hidden bg-white shadow-sm hover:border-[#3B59DA]/30 hover:shadow-2xl transition-all group p-8 space-y-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 overflow-hidden">
                      <InriaHeading className="font-bold text-[#1E293B] text-[26px] md:text-[28px] tracking-tight group-hover:text-[#3B59DA] transition-colors truncate">{item.name}</InriaHeading>
                      <div className="flex items-center gap-3">
                        <FigtreeText className="text-[14px] text-slate-400 font-bold tabular-nums uppercase tracking-tight">{item.currentStock} {item.unit} READY</FigtreeText>
                      </div>
                    </div>
                    <Badge className={cn(
                      "border-none rounded-lg font-black text-[9px] px-3.5 py-1.5 uppercase tracking-[0.2em] font-figtree shadow-inner",
                      item.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" : 
                      item.status === 'Low' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {item.status}
                    </Badge>
                  </div>
 
                  <div className="grid grid-cols-2 gap-5">
                    <button 
                      className="flex flex-col items-center justify-center gap-4 py-10 rounded-[28px] bg-[#F8FAFC] border border-slate-100/30 hover:bg-[#3B59DA] hover:text-white transition-all duration-500 group/btn shadow-sm active:scale-95" 
                      onClick={() => handleLogClick(item, 'usage')}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                        <Package className="h-7 w-7 text-[#3B59DA]" />
                      </div>
                      <FigtreeText className="text-[12px] font-black uppercase tracking-[0.15em] leading-none">Log Usage</FigtreeText>
                    </button>
                    <button 
                      className="flex flex-col items-center justify-center gap-4 py-10 rounded-[28px] bg-[#F8FAFC] border border-slate-100/30 hover:bg-rose-500 hover:text-white transition-all duration-500 group/btn shadow-sm active:scale-95" 
                      onClick={() => handleLogClick(item, 'waste')}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                        <Trash2 className="h-7 w-7 text-rose-500" />
                      </div>
                      <FigtreeText className="text-[12px] font-black uppercase tracking-[0.15em] leading-none">Log Waste</FigtreeText>
                    </button>
                  </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Locked State Blurred Overlay */}
        {!isOpen && <KitchenServiceLockedOverlay />}
      </div>

      {/* Modals */}
      <UnifiedModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title={`Log Product ${logType === 'usage' ? 'Usage' : 'Waste'}`}
        subtitle={`Recording ${logType} metrics for ${selectedItem?.name}`}
        footer={
            <>
                <Button variant="outline" onClick={() => setLogModalOpen(false)} className="rounded-2xl font-bold h-16 px-12 text-slate-500 hover:bg-slate-50 flex-1 font-figtree text-[18px] border-slate-200 shadow-md">Cancel</Button>
                <Button 
                    className={cn("rounded-2xl font-black h-16 px-16 border-none flex-[2] text-[20px] shadow-2xl transition-all active:scale-95 text-white", logType === 'usage' ? "bg-[#3B59DA] hover:bg-[#2D46B2] shadow-indigo-900/10" : "bg-rose-500 hover:bg-rose-600 shadow-rose-900/10")}
                    onClick={handleSubmitLog}
                    disabled={isSubmitting || !amount}
                >
                    {isSubmitting ? "Logging..." : `Confirm Log`}
                </Button>
            </>
        }
      >
        <div className="space-y-10">
          <div className="bg-[#F8FAFC] border border-slate-100 rounded-[28px] p-8 flex items-center justify-between gap-8 shadow-inner">
             <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[#3B59DA]">
                    {logType === 'usage' ? <Package className="h-10 w-10" /> : <Trash2 className="h-10 w-10 text-rose-500" />}
                </div>
                <div>
                    <InriaHeading className="text-[24px] font-bold leading-none mb-2">{selectedItem?.name}</InriaHeading>
                    <FigtreeText className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-400">Current Balance: {selectedItem?.currentStock} {selectedItem?.unit}</FigtreeText>
                </div>
             </div>
          </div>

          <div className="space-y-4 px-2">
            <FigtreeText className="text-[13px] font-black uppercase tracking-[0.25em] text-[#3B59DA] leading-none ml-2">Consumption Amount ({selectedItem?.unit})</FigtreeText>
            <Input 
              type="number"
              placeholder="0.00"
              className="h-[100px] text-[48px] font-black border-slate-200 bg-white rounded-[24px] focus:ring-[#3B59DA]/10 px-10 font-figtree text-[#1E293B] shadow-2xl shadow-indigo-500/5 placeholder:text-slate-200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          {amount && (
            <div className={cn(
                "p-6 rounded-[24px] border border-dashed flex items-center gap-4 font-black text-lg transition-all",
                logType === 'usage' ? "bg-blue-50 border-blue-200 text-[#3B59DA]" : "bg-rose-50 border-rose-200 text-rose-600"
            )}>
                {logType === 'usage' ? <Activity className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                <p>New balance will be: <span className="underline decoration-2 underline-offset-4">{(Number(selectedItem?.currentStock ?? 0) - parseFloat(amount)).toFixed(2)}</span> {selectedItem?.unit}</p>
            </div>
          )}
        </div>
      </UnifiedModal>
    </AppContainer>
  );
}

function KitchenServiceLockedOverlay() {
    return (
        <div className="absolute inset-x-0 -top-4 bottom-0 z-[60] flex flex-col items-center justify-center p-8 select-none overflow-visible">
            {/* Blurriness that fades from bottom to top consistent with design */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[48px]" />
            
            <div className="relative z-[70] flex flex-col items-center justify-center mt-64 bg-white border border-slate-100 py-16 px-12 rounded-[48px] shadow-[0_32px_120px_rgba(15,23,42,0.15)] max-w-lg mx-auto animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[28px] flex items-center justify-center mb-10 shadow-inner">
                    <Lock className="h-8 w-8 text-slate-400 stroke-[2.5px]" />
                </div>
                
                <div className="space-y-4 max-w-sm text-center">
                    <InriaHeading className="text-[34px] font-bold text-[#1E293B] tracking-tight leading-none">Kitchen Service is Locked</InriaHeading>
                    <FigtreeText className="text-slate-400 text-[16px] leading-relaxed font-bold max-w-[320px] mx-auto">
                        Your operational sequence is currently on hold. Complete your daily stock count to enable this module.
                    </FigtreeText>
                </div>
 
                <div className="mt-12 w-full flex justify-center">
                    <Button 
                        className="h-16 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[22px] font-black gap-4 shadow-2xl shadow-indigo-900/10 transition-all active:scale-95 group font-figtree text-[17px]" 
                        asChild
                    >
                        <Link href="/dashboard/inventory/daily-stock-count">
                            Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}



function KitchenSkeleton() {
    return (
        <div className="p-10 space-y-12 min-h-screen bg-white">
            <Skeleton className="h-[360px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-[28px]" />
                ))}
            </div>
        </div>
    );
}
