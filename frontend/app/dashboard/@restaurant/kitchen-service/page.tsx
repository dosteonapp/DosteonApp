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
  Calendar,
  ClipboardList
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
import { KitchenLogModals } from "@/components/kitchen/KitchenLogModals";

export default function KitchenServicePage() {
  const { isOpen, isLoading: isStatusLoading } = useRestaurantDayLifecycle();
  const name = "Sherry"; // Mocking for now
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logType, setLogType] = useState<'usage' | 'waste'>('usage');
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
    setLogModalOpen(true);
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
                 title={`Hello, ${name}`}
                 description="Do your opening stock count before starting your restaurant operations."
                 isLocked={true}
                 bgIcon={<ChefHat className="h-64 w-64 text-white" />}
                 badge={
                     <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 border-[#EF4444] bg-white w-fit shadow-sm">
                         <ClipboardList className="h-4 w-4 text-[#EF4444]" />
                         <FigtreeText className="text-[12px] font-semibold text-[#EF4444] uppercase tracking-[0.05em]">16 items need counting</FigtreeText>
                     </div>
                 }
                 action={
                     <Button className="w-fit h-14 px-10 rounded-2xl bg-white text-[#3B59DA] hover:bg-slate-50 font-semibold gap-4 transition-all shadow-xl shadow-indigo-900/5 font-figtree active:scale-95 group text-[18px] md:text-[20px]" asChild>
                         <Link href="/dashboard/inventory/daily-stock-count">
                             Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-3" />
                         </Link>
                     </Button>
                 }
             />
        )}
      </div>

      {/* Main Track Section */}
      <div className="w-full relative mt-8">
        <div className={cn(
          "bg-white border border-slate-100 rounded-[40px] p-8 md:p-12 shadow-[0_32px_120px_rgba(15,23,42,0.025)] space-y-12 transition-all duration-700",
          !isOpen && "blur-xl grayscale scale-[0.96] opacity-80 pointer-events-none"
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
              <Card key={item.id} className="rounded-[24px] border border-slate-100 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all group p-5 flex flex-col justify-between space-y-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-bold text-[#1E293B] text-[17px] tracking-tight font-figtree truncate">{item.name}</h3>
                      <FigtreeText className="text-[13px] text-slate-400 font-medium">{item.currentStock} units remaining</FigtreeText>
                    </div>
                    <Badge className={cn(
                      "border-none rounded-lg font-bold text-[10px] px-2.5 py-1 uppercase tracking-tight font-figtree shrink-0 shadow-sm",
                      item.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" : 
                      item.status === 'Low' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {item.status}
                    </Badge>
                  </div>
 
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-slate-100 bg-white hover:bg-emerald-50/50 hover:border-emerald-100 transition-all duration-300 group/btn active:scale-95" 
                      onClick={() => handleLogClick(item, 'usage')}
                    >
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                        <Package className="h-5 w-5 text-emerald-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 group-hover/btn:text-emerald-600">Log Usage</span>
                    </button>
                    <button 
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-slate-100 bg-white hover:bg-rose-50/50 hover:border-rose-100 transition-all duration-300 group/btn active:scale-95" 
                      onClick={() => handleLogClick(item, 'waste')}
                    >
                      <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                        <Trash2 className="h-5 w-5 text-rose-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 group-hover/btn:text-rose-600">Log Waste</span>
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
      <KitchenLogModals
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        item={selectedItem}
        type={logType}
        isSubmitting={isSubmitting}
        onSubmit={async (amount, reason) => {
            if (!selectedItem) return;
            setIsSubmitting(true);
            try {
                if (logType === 'usage') {
                    await restaurantOpsService.createUsageLog(selectedItem.id, amount);
                } else {
                    await restaurantOpsService.createWasteLog(selectedItem.id, amount, reason || "Kitchen service log");
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
        }}
      />
    </AppContainer>
  );
}

function KitchenServiceLockedOverlay() {
    return (
        <div className="absolute inset-x-0 top-0 bottom-0 z-[60] flex flex-col items-center justify-center select-none rounded-[40px] overflow-hidden">
            {/* Blurriness that integrates with the items behind */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[12px]" />
            
            <div className="relative z-[70] flex flex-col items-center justify-center max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 bg-slate-900/10 backdrop-blur-3xl rounded-[20px] flex items-center justify-center mb-8 border border-white/20 shadow-sm">
                    <Lock className="h-9 w-9 text-slate-800 stroke-[2px]" />
                </div>
                
                <div className="space-y-4 max-w-[420px] text-center">
                    <h2 className="text-[28px] md:text-[34px] font-semibold text-[#1E293B] tracking-tight leading-none font-figtree">Kitchen Service is Locked</h2>
                    <FigtreeText className="text-slate-600/80 text-[14px] md:text-[16px] leading-relaxed font-medium max-w-[340px] mx-auto">
                        The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                    </FigtreeText>
                </div>
 
                <div className="mt-10 w-full flex justify-center px-6">
                    <Button 
                        className="h-16 px-12 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[20px] font-semibold gap-4 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 group font-figtree text-[17px]" 
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
