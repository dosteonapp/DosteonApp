"use client";

import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  Lock, 
  Clock, 
  ChefHat,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { restaurantOpsService, Activity as ActivityType } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { 
    UnifiedHeroSurface, 
    UnifiedStatCard, 
    AppContainer, 
    InriaHeading, 
    FigtreeText,
    PrimarySurfaceCard
} from "@/components/ui/dosteon-ui";
import { Badge } from "@/components/ui/badge";
import { cn, formatUserName } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

export default function RestaurantDashboardPage() {
  const { isOpen, isLoading: isStatusLoading, isClosingTimeReached, targetClosingTime } = useRestaurantDayLifecycle();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, countedItems: 0, healthy: 0, low: 0, critical: 0 });
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  const { user } = useUser();
  const name = formatUserName(user?.first_name, user?.last_name);

  useEffect(() => {
    const fetchData = async () => {
      try {
                const [acts, dashboardStats] = await Promise.all([
                    restaurantOpsService.getRecentActivities({ offset: 0, limit: 5 }),
          restaurantOpsService.getStats()
        ]);
        setActivities(acts);
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsActivitiesLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isStatusLoading || isActivitiesLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <AppContainer className="pb-24">
        {/* Responsive Header Container */}
        <div className="w-full">
            {isOpen ? (
                <UnifiedHeroSurface
                    variant="inline"
                    alignItems="start"
                    padding="px-6 py-6 md:px-10 md:py-6"
                    minHeight="min-h-[260px]"
                    backgroundColor="bg-[#f5f6ff]"
                    borderColor="border-[#98a6f9]"
                    title={`Welcome back, ${name}`}
                    description={isClosingTimeReached 
                        ? `Closing Stock Count is now enabled. You can now proceed to finalize your daily operations.`
                        : `Closing Stock Count will be enabled at ${targetClosingTime}. To change this, your admin can adjust it in settings.`
                    }
                    isLocked={false}
                    badge={
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm w-fit">
                            <Lock className="h-3.5 w-3.5 text-[#3B59DA]" />
                            <FigtreeText className="text-[12px] font-semibold text-[#3B59DA] uppercase tracking-[0.1em]">Operations Active</FigtreeText>
                        </div>
                    }
                    action={
                        <Button className="w-fit h-14 px-10 rounded-[8px] border-2 border-[#3B59DA] bg-white hover:bg-slate-50 text-[#3B59DA] font-semibold gap-4 transition-all shadow-xl shadow-indigo-900/5 font-figtree active:scale-95 group text-[18px] md:text-[20px]" asChild>
                            <Link href="/dashboard/kitchen-service">
                                Proceed to Kitchen Service <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                            </Link>
                        </Button>
                    }
                >
                    <UnifiedStatCard label="Total Inventory Items" value={stats.totalItems.toString()} icon={Package} variant="indigo" className="flex-1 min-w-[150px] h-[160px] md:h-[190px]" />
                    <UnifiedStatCard label="Critical Stock Items" value={stats.critical.toString()} icon={AlertCircle} variant="red" className="flex-1 min-w-[150px] h-[160px] md:h-[190px]" />
                    <UnifiedStatCard label="Low Stock Items" value={stats.low.toString()} icon={AlertTriangle} variant="amber" className="flex-1 min-w-[150px] h-[160px] md:h-[190px]" />
                    <UnifiedStatCard label="Shift Status" value="Active" icon={Clock} variant="green" className="flex-1 min-w-[150px] h-[160px] md:h-[190px]" />
                </UnifiedHeroSurface>
            ) : (
                <UnifiedHeroSurface
                    variant="inline"
                    alignItems="start"
                    padding="px-6 py-6 md:px-10 md:py-6"
                    minHeight="min-h-[260px]"
                    title={`Welcome back, ${name}`}
                    description="Do your opening stock count before starting your restaurant operations."
                    isLocked={true}
                    bgIcon={<ChefHat className="h-64 w-64 text-white" />}
                    badge={
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm w-fit">
                            <ClipboardList className="h-3.5 w-3.5 text-white" />
                            <FigtreeText className="text-[11px] font-bold text-white uppercase tracking-[0.1em]">
                                {stats.countedItems || 0} of {stats.totalItems} Items counted ({Math.round(((stats.countedItems || 0) / (stats.totalItems || 1)) * 100)}%)
                            </FigtreeText>
                        </div>
                    }
                    action={
                        <Button className="w-fit h-14 px-10 rounded-[8px] bg-white text-[#3B59DA] hover:bg-slate-50 font-semibold gap-4 transition-all shadow-xl shadow-indigo-900/5 font-figtree active:scale-95 group text-[18px] md:text-[20px]" asChild>
                            <Link href="/dashboard/inventory/daily-stock-count">
                                Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                            </Link>
                        </Button>
                    }
                >
                    <UnifiedStatCard label="Total Inventory Items" value={stats.totalItems.toString()} icon={Package} variant="indigo" className="flex-1 min-w-[150px] h-[160px] md:h-[190px]" />
                    <UnifiedStatCard label="Critical Stock Items" value={stats.critical.toString()} icon={AlertCircle} variant="red" className="flex-1 min-w-[150px] h-[160px] md:h-[190px]" />
                    <UnifiedStatCard label="Low Stock Items" value={stats.low.toString()} icon={AlertTriangle} variant="amber" className="flex-1 min-w-[150px] h-[160px] md:h-[190px]" />
                    <UnifiedStatCard label="Shift Status" value="Inactive" icon={Clock} variant="neutral" className="flex-1 min-w-[150px] h-[160px] md:h-[190px]" />
                </UnifiedHeroSurface>
            )}
        </div>

        {/* Recent Activities Section - Wrapped in a single integrated card as per Design Mockup */}
        <div className="relative mt-8">
            <div>
                <PrimarySurfaceCard className="p-8 md:p-12">
                    <div className="space-y-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-8">
                            <div className="space-y-1.5">
                                <FigtreeText className="text-[26px] md:text-[28px] font-bold tracking-tight text-[#1E293B]">Recent Stock Activities</FigtreeText>
                                <FigtreeText className="text-[15px] font-semibold text-slate-400">Recent stock movements across your inventory</FigtreeText>
                            </div>
                            <Button variant="link" className="text-[#3B59DA] font-black hover:underline transition-all text-[15px] font-figtree p-0 h-fit w-fit" asChild>
                                <Link href="/dashboard/activities">View All</Link>
                            </Button>
                        </div>
                        
                        <div className="flex flex-col gap-5 w-full">
                        {activities.length === 0 ? (
                            <div className="w-full py-16 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                                <FigtreeText className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 font-figtree">
                                    No recent stock activity yet
                                </FigtreeText>
                                <FigtreeText className="text-[14px] font-medium text-slate-500 max-w-md leading-relaxed font-figtree">
                                    Once you start updating inventory, receiving deliveries, or logging usage, your recent stock activity will appear here.
                                </FigtreeText>
                            </div>
                        ) : (
                          activities.map((activity) => (
                            <div 
                                key={activity.id} 
                                className="bg-white border border-slate-100/80 rounded-[8px] p-6 md:p-8 flex items-center gap-7 transition-all hover:border-[#3B59DA]/20 hover:shadow-[0_20px_60px_rgba(59,89,218,0.05)] hover:bg-white group shadow-[0_4px_12px_rgba(0,0,0,0.01)] active:scale-[0.98] cursor-pointer"
                            >
                                <div className="h-14 w-14 rounded-[8px] bg-indigo-50/50 flex items-center justify-center shrink-0 border border-indigo-100/50 group-hover:bg-indigo-50 transition-all group-hover:scale-105">
                                    <Package className="h-7 w-7 text-[#3B59DA]/70 group-hover:text-[#3B59DA] transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-3">
                                        <Badge className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-[6px] border-none flex items-center gap-2 w-fit uppercase font-figtree tracking-widest leading-none",
                                            activity.action === 'Updated' ? "bg-indigo-50 text-indigo-600 font-figtree" :
                                            activity.action === 'Received' ? "bg-emerald-50 text-emerald-600 font-figtree" :
                                            "bg-rose-50 text-rose-600 font-figtree"
                                        )}>
                                            {activity.action}
                                        </Badge>
                                        <FigtreeText className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-0 font-figtree">{activity.time}</FigtreeText>
                                    </div>
                                    <FigtreeText className="font-bold text-[20px] tracking-tight group-hover:text-[#3B59DA] transition-colors leading-tight font-figtree">{activity.activity}</FigtreeText>
                                    <FigtreeText className="text-[15px] font-bold text-slate-500 line-clamp-1 leading-relaxed opacity-80 italic font-figtree">{activity.description}</FigtreeText>
                                </div>
                                <div className="shrink-0 ml-6 hidden lg:block">
                                    <Button 
                                        variant="outline"
                                        className="h-12 px-8 rounded-[8px] font-bold border-slate-100 text-[#3B59DA] hover:bg-[#3B59DA] hover:text-white transition-all active:scale-95 text-[14px] font-figtree"
                                        asChild
                                    >
                                        <Link href={`/dashboard/activities`}>
                                            View Logs
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                          ))
                        )}
                        </div>
                    </div>
                </PrimarySurfaceCard>
            </div>
            
        </div>
    </AppContainer>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen bg-white">
      <Skeleton className="h-[420px] w-full rounded-[32px]" />
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
