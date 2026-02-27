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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { restaurantOpsService, Activity as ActivityType } from "@/lib/services/restaurantOpsService";
import { DayState } from "@/lib/dayLifecycle/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { LockedActionOverlay } from "@/components/day/LockedActionOverlay";
import { dayModeStyles } from "@/lib/dayLifecycle/dayModeStyles";
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
    <div className="space-y-8 w-full pb-20 transition-all duration-500 max-w-[1850px] mx-auto px-1 md:px-2">
      {/* Hero Variant Selection */}
      <div className="w-full">
        {isOpen ? (
            <HomeHeroActive name="Sherry" />
        ) : (
            <HomeHeroOpening name="Sherry" />
        )}
      </div>

      {/* Recent Activities Section */}
      <div className="space-y-8 w-full">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-2">
            <h2 className="text-[clamp(22px,2.5vw,30px)] font-bold text-[#1E293B] tracking-tight font-outfit">Recent Activities</h2>
            <p className="text-slate-400 font-medium text-[clamp(12px,1.2vw,15px)]">Your most recent procurement orders</p>
          </div>
          <Button variant="link" className="text-slate-400 font-bold hover:text-[#3B59DA] transition-colors text-xs md:text-sm" asChild>
              <Link href="/dashboard/activities">View All</Link>
          </Button>
        </div>
        
        <div className="flex flex-col gap-4 w-full">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-white border border-slate-100 rounded-[24px] p-6 lg:p-8 flex items-center gap-6 transition-all hover:shadow-md hover:border-indigo-100 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#F8FAFF] flex items-center justify-center shrink-0 border border-indigo-50/50 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-[#3B59DA]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#1E293B] text-[clamp(15px,1.6vw,17px)] tracking-tight leading-tight group-hover:text-[#3B59DA] transition-colors">{activity.title}</h4>
                <p className="text-[clamp(12px,1.3vw,14px)] font-medium text-slate-500 mt-1 line-clamp-1">{activity.description}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-wider">{activity.time}</p>
              </div>
              {activity.actionLabel && (
                <div className="shrink-0 ml-4">
                  <LockedActionOverlay label="Open the day to resolve stock alerts">
                    <Button 
                      className="rounded-xl h-11 px-5 font-bold bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-md shadow-indigo-100 transition-all active:scale-95 text-xs md:text-sm"
                    >
                      {activity.actionLabel}
                    </Button>
                  </LockedActionOverlay>
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
    <div className="relative overflow-hidden rounded-none p-6 md:p-10 lg:p-12 border border-white/10 bg-gradient-to-r from-[#2B46CC] via-[#4A3AFF] to-[#7C3AED] text-white min-h-[280px] md:min-h-[320px] flex items-center w-full shadow-2xl transition-all duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 relative z-10 w-full items-start justify-between">
        <div className="flex flex-col gap-3 md:gap-5 text-left w-full lg:w-[35%] xl:w-[32%] shrink-0">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-[clamp(32px,5.5vw,72px)] font-black tracking-tighter leading-[0.9] font-inria italic">
              Welcome back, <br className="hidden xl:block" /> {name}
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#EF4444]/10 text-[#EF4444] px-4 py-1.5 rounded-none border border-[#EF4444]/20 font-bold text-xs shadow-sm w-fit transition-transform hover:scale-105">
                <div className="h-4 w-4 bg-[#EF4444] rounded-none flex items-center justify-center text-[10px] font-bold text-white">!</div>
                <span className="uppercase tracking-widest text-[10px]">16 items need counting</span>
            </div>
            <p className="text-white/70 text-[clamp(12px,1.2vw,14px)] font-medium leading-relaxed max-w-sm">
              Do your opening stock count before starting your restaurant operations for today.
            </p>
          </div>
          <div className="flex justify-start">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Button className="h-10 md:h-12 px-6 md:px-8 bg-white text-[#3B59DA] hover:bg-slate-50 rounded-none font-black gap-3 text-xs md:text-sm shadow-xl shadow-indigo-900/10 transition-all group font-figtree border-none active:scale-95" asChild>
                <Link href="/dashboard/inventory/daily-stock-count">
                    Count Daily Stock <ArrowRight className="h-4 w-4 md:h-5 md:w-5 stroke-[2.5px] group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4 gap-3 md:gap-4 flex-1 w-full lg:min-w-0">
          <HeroStatCard label="Total Inventory" value="24" icon={Package} accent="#3B59DA" />
          <HeroStatCard label="Critical Items" value="6" icon={AlertCircle} accent="#EF4444" />
          <HeroStatCard label="Low Stock" value="6" icon={AlertTriangle} accent="#F59E0B" />
          <HeroStatCard label="Shift Status" value="Inactive" icon={Clock} accent="#10B981" />
        </div>
      </div>
    </div>
  );
}

function HomeHeroActive({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-none p-6 md:p-10 lg:p-12 border border-white/10 bg-gradient-to-r from-[#2B46CC] via-[#4A3AFF] to-[#7C3AED] text-white min-h-[280px] md:min-h-[320px] flex items-center w-full shadow-2xl group/hero">
      {/* Enhanced decorative background elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-50/70 via-indigo-50/30 to-transparent pointer-events-none transition-all duration-1000 group-hover/hero:opacity-80" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-200/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 relative z-10 w-full items-start justify-between">
        <div className="flex flex-col gap-3 md:gap-5 text-left w-full lg:w-[35%] xl:w-[32%] shrink-0">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-[clamp(32px,5.5vw,72px)] font-black tracking-tighter leading-[0.9] font-inria italic">
              Welcome back, <br className="hidden xl:block" /> Sherry
            </h1>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-none border border-white/10 font-bold text-[clamp(10px,1vw,12px)] shadow-sm w-fit transition-transform hover:scale-105">
                <Lock className="h-3 w-3" />
                Opening Prep Locked
            </div>
            <p className="text-white/70 text-[clamp(12px,1.2vw,14px)] font-medium leading-relaxed max-w-sm">
              Closing Stock Count will be enabled at 7 PM. To change the time, your admin can change it in settings.
            </p>
          </div>
          <div className="flex justify-start">
            <Button variant="outline" className="h-10 md:h-12 px-6 md:px-8 border-indigo-200 text-[#3B59DA] hover:bg-[#3B59DA] hover:text-white rounded-xl font-bold gap-3 text-xs md:text-sm transition-all group font-outfit shadow-sm bg-white/50 backdrop-blur-sm active:scale-95" asChild>
              <Link href="/dashboard/kitchen-service">
                Proceed to Kitchen Service <ArrowRight className="h-4 w-4 md:h-5 md:w-5 stroke-[2.5px] group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4 gap-3 md:gap-4 flex-1 w-full lg:min-w-0">
          <HeroStatCard label="Total Inventory Items" value="24" icon={Package} accent="#3B59DA" />
          <HeroStatCard label="Critical Stock Items" value="6" icon={AlertCircle} accent="#EF4444" />
          <HeroStatCard label="Low Stock Items" value="6" icon={AlertTriangle} accent="#F59E0B" />
          <HeroStatCard label="Shift Status" value="Inactive" icon={Clock} accent="#10B981" />
        </div>
      </div>
    </div>
  );
}

function HeroStatCard({ label, value, icon: Icon, accent, trend }: { label: string, value: string, icon: any, accent: string, trend?: string }) {
  return (
    <div className="rounded-none p-6 h-[150px] md:h-[160px] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:shadow-lg group relative overflow-hidden active:scale-[0.98] font-figtree">
      <div className="flex items-center gap-3">
        <div 
          className="h-9 w-9 rounded-none flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}10`, color: accent }}
        >
            <Icon className="h-4 w-4 stroke-[2.5px]" />
        </div>
        <span className="text-[11px] md:text-[12px] font-bold text-slate-400 uppercase tracking-tight">
          {label}
        </span>
      </div>
      <div>
        <p className="text-[clamp(28px,4vw,36px)] font-bold text-[#1E293B] tracking-tighter leading-none mb-1">
          {value}
        </p>
        <div className="flex items-center gap-1.5 text-[#10B981] font-bold text-[10px]">
          <ArrowRight className="h-3 w-3 -rotate-45" />
          <span>{trend || "up by 8% from last week"}</span>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto w-full p-10 space-y-16">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-[440px] w-full rounded-[48px]" />
      <div className="space-y-8">
          <Skeleton className="h-12 w-80 rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-[32px]" />
          <Skeleton className="h-32 w-full rounded-[32px]" />
      </div>
    </div>
  );
}

