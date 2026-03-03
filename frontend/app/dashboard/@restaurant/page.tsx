"use client";

import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  Lock, 
  Clock, 
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

export default function RestaurantDashboardPage() {
  const { isOpen, isLoading: isStatusLoading } = useRestaurantDayLifecycle();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  // In a real app, this would come from a user context
  const name = "Sherry"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        await restaurantOpsService.getRecentActivities();
        // Matching design's specific activities for the demo
        setActivities([
          {
            id: "1",
            title: "Daily Stock Confirmed",
            description: "Sherry from Kitchen confirmed today's closing stock",
            time: "2 hours ago",
            type: "stock"
          },
          {
            id: "2",
            title: "Manual stock update",
            description: "Jules added 5.5 kg of Fresh Tomato manually",
            time: "2 hours ago",
            type: "stock"
          },
          {
            id: "3",
            title: "Stock Discrepancy Alert",
            description: "Inventory mismatch flagged for Whole Milk",
            time: "2 hours ago",
            type: "alert",
            actionLabel: "Fix Inventory",
            actionHref: "/dashboard/inventory"
          },
          {
            id: "4",
            title: "Stock Review Reminder",
            description: "📦 Don't forget to confirm today's closing stock. This keeps your inventory accurate.",
            time: "2 hours ago",
            type: "remind",
            actionLabel: "Review Inventory",
            actionHref: "/dashboard/inventory"
          }
        ]);
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
                    title={`Welcome back, ${name}`}
                    subtitle="Closing Stock Count will be enabled at 7 PM. To change the Closing Stock Count time, your admin can change it in the store management settings."
                    isLocked={false}
                    badge={
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm w-fit">
                            <Lock className="h-3.5 w-3.5 text-[#3B59DA]" />
                            <FigtreeText className="text-[11px] font-black text-[#3B59DA] uppercase tracking-[0.1em]">OPERATIONS ACTIVE</FigtreeText>
                        </div>
                    }
                    action={
                        <Button className="w-fit h-14 px-10 rounded-2xl border-2 border-[#3B59DA] bg-white hover:bg-slate-50 text-[#3B59DA] font-black gap-4 transition-all shadow-xl shadow-indigo-900/5 font-figtree active:scale-95 group text-lg" asChild>
                            <Link href="/dashboard/kitchen-service">
                                Kitchen Service Dashboard <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                            </Link>
                        </Button>
                    }
                >
                    <UnifiedStatCard label="Total Products" value="1.2k" icon={Package} variant="neutral" />
                    <UnifiedStatCard label="Critical Items" value="06" icon={AlertCircle} variant="red" />
                    <UnifiedStatCard label="Low Stock" value="12" icon={AlertTriangle} variant="amber" />
                    <UnifiedStatCard label="Shift Status" value="Active" icon={Clock} variant="green" />
                </UnifiedHeroSurface>
            ) : (
                <UnifiedHeroSurface
                    title={`Welcome back, ${name}`}
                    subtitle="Do your opening stock count before starting your restaurant operations."
                    isLocked={true}
                    badge={
                        <div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#EF4444] w-fit shadow-2xl shadow-red-900/40">
                            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            <FigtreeText className="text-[11px] font-black text-white uppercase tracking-[0.1em]">16 items need counting</FigtreeText>
                        </div>
                    }
                    action={
                        <Button className="w-fit h-16 px-12 rounded-2xl bg-white text-[#3B59DA] hover:bg-slate-50 font-black gap-4 transition-all shadow-2xl shadow-indigo-900/20 font-figtree border-none active:scale-95 group text-xl" asChild>
                            <Link href="/dashboard/inventory/daily-stock-count">
                                Count Daily Stock <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-3" />
                            </Link>
                        </Button>
                    }
                >
                    <UnifiedStatCard label="Total Products" value="1.2k" icon={Package} variant="neutral" />
                    <UnifiedStatCard label="Critical Items" value="06" icon={AlertCircle} variant="red" />
                    <UnifiedStatCard label="Low Stock" value="12" icon={AlertTriangle} variant="amber" />
                    <UnifiedStatCard label="Shift Status" value="Inactive" icon={Clock} variant="neutral" />
                </UnifiedHeroSurface>
            )}
        </div>

        {/* Recent Activities Section - Wrapped in a single integrated card as per Design Mockup */}
        <PrimarySurfaceCard className="p-8 md:p-12">
            <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-8">
                    <div className="space-y-1.5">
                        <InriaHeading className="text-[26px] md:text-[28px] font-bold tracking-tight text-[#1E293B]">Recent Activities</InriaHeading>
                        <FigtreeText className="text-[15px] font-semibold text-slate-400">Your most recent procurement orders</FigtreeText>
                    </div>
                    <Button variant="link" className="text-[#3B59DA] font-black hover:underline transition-all text-[15px] font-figtree p-0 h-fit w-fit" asChild>
                        <Link href="/dashboard/activities">View All</Link>
                    </Button>
                </div>
                
                <div className="flex flex-col gap-5 w-full">
                {activities.map((activity) => (
                    <div 
                        key={activity.id} 
                        className="bg-white border border-slate-100/80 rounded-[28px] p-6 md:p-8 flex items-center gap-7 transition-all hover:border-[#3B59DA]/20 hover:shadow-[0_20px_60px_rgba(59,89,218,0.05)] hover:bg-white group shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                    >
                        <div className="h-14 w-14 rounded-[18px] bg-indigo-50/50 flex items-center justify-center shrink-0 border border-indigo-100/50 group-hover:bg-indigo-50 transition-all group-hover:scale-105">
                            <Package className="h-7 w-7 text-[#3B59DA]/70 group-hover:text-[#3B59DA] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <InriaHeading className="font-bold text-[20px] tracking-tight group-hover:text-[#3B59DA] transition-colors leading-tight">{activity.title}</InriaHeading>
                            <FigtreeText className="text-[15px] font-bold text-slate-500 line-clamp-1 leading-relaxed opacity-80">{activity.description}</FigtreeText>
                            <FigtreeText className="text-[11px] font-black text-slate-300 mt-2.5 uppercase tracking-[0.2em] leading-none block">{activity.time}</FigtreeText>
                        </div>
                        {activity.actionLabel && (
                            <div className="shrink-0 ml-6 hidden lg:block">
                                <Button 
                                    className="h-14 px-10 rounded-2xl font-black bg-[#3B59DA] text-white hover:bg-[#2D46B2] shadow-xl shadow-indigo-900/10 transition-all active:scale-95 text-[15px] font-figtree border-none"
                                    asChild
                                >
                                    <Link href={activity.actionHref || "#"}>
                                        {activity.actionLabel}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
                </div>
            </div>
        </PrimarySurfaceCard>
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
