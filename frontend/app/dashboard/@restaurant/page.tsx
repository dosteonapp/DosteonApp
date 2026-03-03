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
    FigtreeText 
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

        {/* Recent Activities Section */}
        <div className="w-full mt-4 space-y-8">
            <div className="flex items-end justify-between px-0">
                <div className="space-y-2">
                    <FigtreeText className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Global Logs</FigtreeText>
                    <InriaHeading className="text-[34px] md:text-[42px] font-bold tracking-tight text-[#1E293B]">Recent Activities</InriaHeading>
                </div>
                <Button variant="link" className="text-[#3B59DA] font-black hover:underline transition-all text-[15px] font-figtree px-0" asChild>
                    <Link href="/dashboard/activities">View Full Registry</Link>
                </Button>
            </div>
            
            <div className="flex flex-col gap-4 w-full">
                {activities.map((activity) => (
                    <div 
                        key={activity.id} 
                        className="bg-white border border-slate-100 rounded-[32px] p-7 md:p-8 flex items-center gap-8 transition-all hover:border-[#3B59DA]/20 hover:shadow-2xl hover:bg-white group shadow-[0_10px_40px_rgba(0,0,0,0.02)]"
                    >
                        <div className="h-16 w-16 rounded-[20px] bg-[#F8FAFC] flex items-center justify-center shrink-0 border-2 border-white group-hover:bg-indigo-50 transition-all shadow-xl group-hover:scale-105">
                            <Package className="h-8 w-8 text-[#3B59DA]/40 group-hover:text-[#3B59DA] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <InriaHeading className="font-bold text-[22px] tracking-tight group-hover:text-[#3B59DA] transition-colors">{activity.title}</InriaHeading>
                            <FigtreeText className="text-[17px] font-semibold text-slate-500 line-clamp-1 leading-relaxed">{activity.description}</FigtreeText>
                            <FigtreeText className="text-[12px] font-black text-slate-300 mt-3 uppercase tracking-[0.2em] leading-none block">{activity.time}</FigtreeText>
                        </div>
                        {activity.actionLabel && (
                            <div className="shrink-0 ml-10 hidden xl:block">
                                <Button 
                                    className="h-16 px-12 rounded-[22px] font-black bg-[#F8FAFC] border-2 border-slate-100 text-[#3B59DA] hover:bg-[#3B59DA] hover:text-white hover:border-[#3B59DA] shadow-md transition-all active:scale-95 text-[16px] font-figtree"
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
