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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { restaurantOpsService, InventoryItem } from "@/lib/services/restaurantOpsService";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { DayState } from "@/lib/dayLifecycle/types";
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
    UnifiedModal,
    UnifiedErrorBanner
} from "@/components/ui/dosteon-ui";
import { KitchenLogModals } from "@/components/kitchen/KitchenLogModals";
import { formatUserName } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

export default function KitchenServicePage() {
  const { isOpen, isLoading: isStatusLoading, status } = useRestaurantDayLifecycle();
  const { user } = useUser();
  const name = formatUserName(user?.first_name, user?.last_name);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logType, setLogType] = useState<'usage' | 'waste'>('usage');
  const [kitchenSummary, setKitchenSummary] = useState({ health: "Healthy", healthSubtext: "Checking status...", criticalIngredients: 0, criticalSubtext: "..." });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [items, summary] = await Promise.all([
            restaurantOpsService.getInventoryItems(),
            restaurantOpsService.getKitchenServiceSummary()
        ]);
        setInventoryItems(items);
        setKitchenSummary(summary);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
        setError("We couldn't load your kitchen inventory. Please try again or refresh the page.");
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

  if (isLoading && !inventoryItems.length && !error) {
    return <KitchenSkeleton />;
  }

  return (
    <AppContainer className="pb-24">
      {error && <UnifiedErrorBanner message={error} />}
      {/* Page Header (Only visible when locked) */}
      {!isOpen && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1.5">
            <InriaHeading className="text-[32px] md:text-[38px] font-bold tracking-tight text-[#1E293B]">Kitchen Service</InriaHeading>
            <FigtreeText className="text-slate-400 font-semibold text-[15px]">Service not started</FigtreeText>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm w-fit">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <FigtreeText className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.1em]">Closed Service</FigtreeText>
              </div>
          </div>
        </div>
      )}

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
                    <div className="flex items-center gap-1.5 md:gap-2.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/10 shadow-sm border-none backdrop-blur-sm scale-90 md:scale-100 origin-right transition-transform">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <FigtreeText className="font-semibold text-[10px] md:text-[12px] uppercase tracking-[0.1em] md:tracking-[0.15em] leading-none text-emerald-600">Live Service</FigtreeText>
                    </div>
                }
            >
                <UnifiedStatCard 
                  label="Kitchen Health" 
                  value={kitchenSummary.health} 
                  subtext={kitchenSummary.healthSubtext} 
                  icon={Utensils}
                  variant={kitchenSummary.health === "Healthy" ? "green" : "red"}
                  className="flex-1 min-w-[150px] md:min-w-[180px] lg:min-w-[220px] h-[160px] md:h-[190px] shadow-sm"
                />
                <UnifiedStatCard 
                  label="Critical Ingredients" 
                  value={kitchenSummary.criticalIngredients.toString()} 
                  subtext={kitchenSummary.criticalSubtext} 
                  icon={Package}
                  variant={kitchenSummary.criticalIngredients > 0 ? "red" : "neutral"}
                  className="flex-1 min-w-[150px] md:min-w-[180px] lg:min-w-[220px] h-[160px] md:h-[190px] shadow-sm"
                />
            </UnifiedHeroSurface>
        ) : (
             <UnifiedHeroSurface
                 title={`Hello, ${name}`}
                 description="Do your opening stock count before starting your restaurant operations."
                 isLocked={true}
                 bgIcon={<ChefHat className="h-64 w-64 text-white" />}
                 badge={
                     <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm w-fit mb-4">
                         <ClipboardList className="h-4 w-4 text-white" />
                         <FigtreeText className="text-[13px] font-bold text-white leading-none whitespace-nowrap">Inventory items need counting</FigtreeText>
                     </div>
                 }
                 action={
                     <Button className="w-fit h-14 px-10 rounded-[10px] bg-white text-[#3B59DA] hover:bg-slate-50 font-black gap-4 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] font-figtree active:scale-95 group text-[18px] border-none" asChild>
                         <Link href="/dashboard/inventory/daily-stock-count">
                             Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                         </Link>
                     </Button>
                 }
             />
        )}
      </div>

      {/* Main Track Section */}
      <div className="w-full relative mt-8">
        <div className={cn(
          "bg-white border border-slate-100 rounded-[12px] p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-12 transition-all duration-1000 overflow-hidden relative",
          !isOpen ? "min-h-[600px] blur-[6px] grayscale-[0.1] opacity-95 pointer-events-none select-none" : ""
        )}>
          {/* Section Header */}
          <div className="flex flex-row items-start justify-between gap-4 px-1">
            <div className="space-y-1">
              <h2 className="text-[20px] md:text-[22px] font-bold text-[#1E293B] tracking-tight font-figtree">Track Product Usage</h2>
              <FigtreeText className="text-[13px] md:text-[14px] text-slate-400 font-medium">Enter how much of each product you&apos;ve used, or use +/- buttons to adjust</FigtreeText>
            </div>
            <Link href="/dashboard/activities" className="text-[#3B59DA] font-black hover:underline transition-all text-[15px] font-figtree flex items-center gap-2 shrink-0">
                <History className="h-4 w-4" /> View Log History
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative w-full xl:max-w-md my-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search items..." 
              className="pl-12 h-[52px] border-slate-200 rounded-[8px] bg-slate-50 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus-visible:ring-indigo-500/10 transition-all shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Order Grid / Ghost Content when locked */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {!isOpen ? (
                /* Ghost Skeleton Cards to provide height and blur depth */
                [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 rounded-[8px] border border-slate-100 bg-slate-50/50 flex flex-col p-6 gap-8">
                        <div className="flex justify-between">
                            <div className="space-y-3 flex-1">
                                <div className="h-4 w-3/4 bg-slate-200 rounded-full" />
                                <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                            </div>
                            <div className="h-6 w-16 bg-slate-200 rounded-md" />
                        </div>
                        <div className="mt-auto flex gap-3">
                            <div className="flex-1 h-20 bg-slate-100 rounded-md" />
                            <div className="flex-1 h-20 bg-slate-100 rounded-md" />
                        </div>
                    </div>
                ))
            ) : (
                filteredItems.length === 0 && !isLoading && !error ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <FigtreeText className="text-slate-500 font-medium text-[14px] max-w-md">
                      No kitchen items match your search yet. Try adjusting your search term, or add items from the Inventory section.
                    </FigtreeText>
                  </div>
                ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="rounded-[8px] border border-slate-100 overflow-hidden bg-white shadow-sm hover:shadow-[0_8px_24px_rgba(59,89,218,0.06)] hover:border-[#3B59DA]/20 active:scale-[0.98] transition-all group p-5 flex flex-col justify-between gap-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 overflow-hidden">
                          <h3 className="font-bold text-[#1E293B] text-[16px] tracking-tight font-figtree truncate">{item.name}</h3>
                          <FigtreeText className="text-[12px] text-slate-400 font-medium">
                            {item.currentStock} {item.unit || 'units'} remaining
                          </FigtreeText>
                        </div>
                        <Badge className={cn(
                          "border-none rounded-[6px] font-bold text-[10px] px-2 py-1 uppercase tracking-tight font-figtree shrink-0",
                          item.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" :
                          item.status === 'Low' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {item.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          className="flex-1 flex flex-col items-center justify-center gap-2 py-3.5 rounded-[8px] border border-slate-100 bg-white hover:bg-emerald-50/50 hover:border-emerald-200/80 transition-all duration-200 group/btn active:scale-95"
                          onClick={() => handleLogClick(item, 'usage')}
                        >
                          <div className="h-9 w-9 rounded-[6px] bg-emerald-50 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                            <Package className="h-4 w-4 text-emerald-500" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 group-hover/btn:text-emerald-600 transition-colors">Log Usage</span>
                        </button>
                        <button
                          className="flex-1 flex flex-col items-center justify-center gap-2 py-3.5 rounded-[8px] border border-slate-100 bg-white hover:bg-rose-50/50 hover:border-rose-200/80 transition-all duration-200 group/btn active:scale-95"
                          onClick={() => handleLogClick(item, 'waste')}
                        >
                          <div className="h-9 w-9 rounded-[6px] bg-rose-50 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 group-hover/btn:text-rose-600 transition-colors">Log Waste</span>
                        </button>
                      </div>
                  </div>
                ))
                )
            )}
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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto rounded-[12px] overflow-hidden">
            {/* Premium Frosted Glass with Depth */}
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[6px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
            
            <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-6 animate-in fade-in zoom-in-95 duration-1000">
                {/* 3D-effect Lock Icon */}
                <div className="w-20 h-20 bg-white shadow-[0_12px_44px_rgba(0,0,0,0.06)] rounded-[20px] flex items-center justify-center mb-10 border border-slate-100/50">
                    <Lock className="h-9 w-9 text-slate-800/80 stroke-[2.5px] drop-shadow-sm" />
                </div>
                
                <div className="space-y-4 max-w-[480px] text-center mb-12">
                    <h2 className="text-[34px] md:text-[40px] font-black text-[#1E293B] tracking-tight leading-tight font-figtree">Kitchen Service is Locked</h2>
                    <FigtreeText className="text-slate-500 text-[16px] md:text-[18px] leading-relaxed font-bold max-w-[360px] mx-auto opacity-70">
                        The Kitchen Service workflow is not yet available. Please do your daily stock count before you proceed to Kitchen Service.
                    </FigtreeText>
                </div>
 
                <Button 
                    className="h-16 px-14 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black gap-4 shadow-[0_20px_50px_rgba(59,89,218,0.25)] transition-all active:scale-95 group font-figtree text-[19px] border-none" 
                    asChild
                >
                    <Link href="/dashboard/inventory/daily-stock-count">
                        Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}



function KitchenSkeleton() {
    return (
        <div className="p-4 sm:p-6 md:p-10 space-y-8 min-h-screen">
            <Skeleton className="h-[260px] w-full rounded-[10px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-52 w-full rounded-[8px]" />
                ))}
            </div>
        </div>
    );
}
