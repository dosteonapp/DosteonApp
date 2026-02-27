"use client";

import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  ClipboardList, 
  Lock, 
  Utensils, 
  Clock, 
  Users,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { restaurantOpsService, Activity as ActivityType } from "@/lib/services/restaurantOpsService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { LockedActionOverlay } from "@/components/day/LockedActionOverlay";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function RestaurantDashboardPage() {
  const { status, isOpen, isLoading: isStatusLoading } = useRestaurantDayLifecycle();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activityData = await restaurantOpsService.getRecentActivities();
        // Matching design's specific activities for the demo
        setActivities([
          {
            id: "1",
            title: "Daily Stock Confirmed",
            description: "[User Name] [sub-team, e.g., Kitchen] confirmed today's closing stock",
            time: "2 hours ago",
            type: "stock"
          },
          {
            id: "2",
            title: "Manual stock update",
            description: "[User Name] added [x][quantity] of [product name] manually",
            time: "2 hours ago",
            type: "stock"
          },
          {
            id: "3",
            title: "Stock Discrepancy Alert",
            description: "Inventory mismatch flagged for [product name]",
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
    <div className="space-y-10 w-full pb-20 transition-all duration-500 font-figtree">
        {/* Responsive Header Container */}
        <div className="w-full">
            {isOpen ? <HomeHeroActive name="Sherry" /> : <HomeHeroOpening name="Sherry" />}
        </div>

        {/* Recent Activities Section */}
        <div className="w-full mt-6 space-y-6">
            <div className="flex items-end justify-between px-0">
                <div className="space-y-1">
                    <h2 className="text-[22px] md:text-[24px] font-bold text-[#1E293B] tracking-tight">Recent Activities</h2>
                    <p className="text-slate-400 font-medium text-[13px]">Your most recent procurement orders</p>
                </div>
                <Button variant="link" className="text-slate-400 font-bold hover:text-[#3B59DA] transition-colors text-xs" asChild>
                    <Link href="/dashboard/activities">View All</Link>
                </Button>
            </div>
            
            <div className="flex flex-col gap-3 w-full">
                {activities.map((activity) => (
                    <div 
                        key={activity.id} 
                        className="bg-white border border-slate-100 rounded-[20px] p-5 md:p-6 flex items-center gap-6 transition-all hover:border-[#3B59DA]/20 group shadow-sm"
                    >
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                            <Package className="h-5 w-5 text-slate-400 group-hover:text-[#3B59DA] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[#1E293B] text-[15px] tracking-tight transition-colors">{activity.title}</h4>
                            <p className="text-[13px] font-medium text-slate-500 mt-0.5 line-clamp-1">{activity.description}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">{activity.time}</p>
                        </div>
                        {activity.actionLabel && (
                            <div className="shrink-0 ml-4 hidden sm:block">
                                <Button 
                                    className="rounded-xl h-10 px-5 font-bold bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-sm transition-all active:scale-95 border-none text-[12px]"
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
    </div>
  );
}

function HomeHeroOpening({ name }: { name: string }) {
  return (
    <div className="relative rounded-[24px] p-8 md:p-10 border border-[#D0D7FF] bg-[#F8FAFF] text-[#1E293B] flex flex-col lg:flex-row gap-10 items-stretch justify-between shadow-sm transition-all duration-700 w-full min-h-[320px] font-figtree">
      <div className="flex flex-col justify-between text-left w-full lg:w-[25%] shrink-0 z-10 py-2">
        <div className="space-y-6">
             <div className="space-y-2.5">
                <h2 className="text-[34px] md:text-[40px] font-bold text-[#1E293B] font-inria italic tracking-tight leading-tight">Welcome back, Sherry</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-100 bg-white w-fit shadow-sm">
                    <Lock className="h-3.5 w-3.5 text-[#3B59DA]" />
                    <span className="text-[11px] font-bold text-[#3B59DA] uppercase tracking-wider">Opening Prep Locked</span>
                </div>
             </div>
             <p className="text-slate-500 text-[14px] md:text-[15px] font-medium leading-relaxed">
                Closing Stock Count will be enabled at 7 PM. To change the Closing Stock Count time, your admin can change it in the store management settings.
             </p>
        </div>
        <div className="mt-8">
            <Button className="w-fit h-12 px-8 rounded-xl border-2 border-[#3B59DA] bg-white hover:bg-slate-50 text-[#3B59DA] font-bold gap-3 transition-all shadow-sm" asChild>
                <Link href="/dashboard/kitchen-service">
                    Proceed to Kitchen Service <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full z-10 self-center">
          <StatCardWhite label="Total Inventory Items" value="24" icon={Package} accent="#3B59DA" />
          <StatCardWhite label="Critical Stock Items" value="6" icon={AlertCircle} accent="#EF4444" />
          <StatCardWhite label="Low Stock Items" value="6" icon={AlertTriangle} accent="#F59E0B" />
          <StatCardWhite label="Shift Status" value="Active" icon={Clock} accent="#10B981" />
      </div>
    </div>
  );
}

function HomeHeroActive({ name }: { name: string }) {
  // Same theme as Opening, just content difference
  return <HomeHeroOpening name={name} />;
}

function StatCardWhite({ label, value, icon: Icon, accent, valueColor }: { label: string, value: string, icon: any, accent: string, valueColor?: string }) {
  return (
    <div className="bg-white rounded-[16px] p-6 h-[160px] border border-slate-100 shadow-sm flex flex-col group relative overflow-hidden transition-all hover:border-indigo-100 hover:shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-50 transition-colors shadow-sm"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <Icon className="h-4 w-4 stroke-[2.5px]" />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
          {label}
        </span>
      </div>
      <div className="mt-auto">
        <p className={cn(
            "text-[38px] font-bold tracking-tighter text-[#1E293B] leading-none transition-transform duration-500 origin-left group-hover:scale-105",
            valueColor
        )}>
            {value}
        </p>
      </div>
    </div>
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
