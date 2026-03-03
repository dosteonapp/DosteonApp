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
                variant="inline"
                padding="px-6 py-4 md:px-10 md:py-4"
                minHeight="min-h-[240px]"
                backgroundColor="bg-[#f5f6ff]"
                borderColor="border-[#98a6f9]"
                title="Kitchen Service"
                description="Manage your kitchen service here, including ingredient usage as you prepare food for your customers."
                isLocked={false}
                topAction={
                    <div className="flex items-center gap-2.5 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-600 shadow-sm border-none backdrop-blur-sm">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <FigtreeText className="font-semibold text-[12px] uppercase tracking-[0.15em] leading-none text-emerald-600">Live Service</FigtreeText>
                    </div>
                }
            >
                <UnifiedStatCard 
                  label="Kitchen Health" 
                  value="Healthy" 
                  subtext="Lunch service in progress" 
                  icon={Utensils}
                  variant="green"
                  className="w-36 md:w-52 lg:w-60 h-[150px] md:h-[200px] lg:h-[240px] shadow-sm"
                />
                <UnifiedStatCard 
                  label="Critical Ingredients" 
                  value="0" 
                  subtext="Nothing urgent right now" 
                  icon={Package}
                  variant="neutral"
                  className="w-36 md:w-52 lg:w-60 h-[150px] md:h-[200px] lg:h-[240px] shadow-sm"
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
          <div className="flex flex-row items-start justify-between gap-4 px-1">
            <div className="space-y-1">
              <h2 className="text-[20px] md:text-[22px] font-bold text-[#1E293B] tracking-tight font-figtree">Track Product Usage</h2>
              <FigtreeText className="text-[13px] md:text-[14px] text-slate-400 font-medium">Enter how much of each product you&apos;ve used, or use +/- buttons to adjust</FigtreeText>
            </div>
            <Link href="/dashboard/kitchen-service/history" className="text-slate-500 font-bold hover:text-indigo-600 transition-colors text-[14px] font-figtree flex items-center shrink-0">
                View Log History
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative w-full xl:max-w-md my-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search items..." 
              className="pl-12 h-[52px] border-slate-200 rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus-visible:ring-indigo-500/10 transition-all shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Order Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="rounded-[24px] border border-slate-100 overflow-hidden bg-white shadow-sm hover:border-indigo-100 hover:shadow-xl transition-all group p-5 space-y-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-bold text-[#1E293B] text-[17px] md:text-[18px] tracking-tight font-figtree truncate">{item.name}</h3>
                      <FigtreeText className="text-[13px] text-slate-400 font-semibold">{item.currentStock} units remaining</FigtreeText>
                    </div>
                    <Badge className={cn(
                      "border-none rounded-lg font-bold text-[10px] px-2.5 py-1 uppercase tracking-tight font-figtree shrink-0 shadow-sm",
                      item.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" : 
                      item.status === 'Low' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {item.status}
                    </Badge>
                  </div>
 
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      className="flex flex-col items-center justify-center gap-3 py-6 rounded-2xl bg-slate-50/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 group/btn active:scale-95" 
                      onClick={() => handleLogClick(item, 'usage')}
                    >
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover/btn:scale-110 transition-transform">
                        <Package className="h-5 w-5 text-emerald-500" />
                      </div>
                      <FigtreeText className="text-[11px] font-bold text-slate-500 group-hover/btn:text-emerald-700">Log Usage</FigtreeText>
                    </button>
                    <button 
                      className="flex flex-col items-center justify-center gap-3 py-6 rounded-2xl bg-slate-50/80 hover:bg-rose-50 hover:text-rose-700 transition-all duration-300 group/btn active:scale-95" 
                      onClick={() => handleLogClick(item, 'waste')}
                    >
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover/btn:scale-110 transition-transform">
                        <Trash2 className="h-5 w-5 text-rose-500" />
                      </div>
                      <FigtreeText className="text-[11px] font-bold text-slate-500 group-hover/btn:text-rose-700">Log Waste</FigtreeText>
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
