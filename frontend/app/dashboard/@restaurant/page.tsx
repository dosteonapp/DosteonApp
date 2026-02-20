"use client";

import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Plus,
  ArrowUpRight,
  ClipboardList,
  Activity,
  User,
  History,
  Lock,
  Utensils,
  Bell,
  Clock,
  Calendar,
  Search,
  Sun,
  X
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

export default function RestaurantDashboardPage() {
  const { status, isOpen, isLocked, isUserUnlocked, setIsUserUnlocked, isLoading: isStatusLoading } = useRestaurantDayLifecycle();
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

  const showOverlay = !isOpen && !isUserUnlocked;

  return (
    <>
      {/* Opening Checklist Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <ReviewOpeningChecklistSection 
              onBack={() => {
                  setIsUserUnlocked(true);
              }} 
          />
        </div>
      )}

      <div className={cn(
        "space-y-12 max-w-7xl mx-auto w-full pb-20 transition-all duration-500",
        showOverlay && "blur-xl scale-[0.98] pointer-events-none"
      )}>
        {/* Hero Variant Selection */}
        {isOpen ? (
            <HomeHeroActive name="Sherry" />
        ) : (
            <HomeHeroOpening name="Sherry" />
        )}

        {/* Recent Activities Section */}
        <div className="space-y-8 bg-white border border-slate-100 rounded-[32px] p-10 lg:p-12">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <h2 className="text-[28px] font-bold text-[#1E293B] tracking-tight">Recent Activities</h2>
              <p className="text-slate-400 font-medium text-[15px]">Your most recent procurement orders</p>
            </div>
            <Button variant="ghost" className="text-slate-500 hover:text-[#3B59DA] font-bold text-[15px]" asChild>
                <Link href="/dashboard/activities">View All</Link>
            </Button>
          </div>
          
          <div className="grid gap-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border border-slate-100 rounded-3xl p-6 lg:p-8 bg-white flex items-center gap-8 group transition-all hover:bg-slate-50/50">
                <div className="h-14 w-14 rounded-2xl bg-[#F8FAFF] flex items-center justify-center shrink-0 border border-slate-50 group-hover:bg-indigo-50 transition-colors">
                  <Package className="h-6 w-6 text-[#3B59DA]" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h4 className="font-bold text-[#1E293B] text-[20px] tracking-tight">{activity.title}</h4>
                  <p className="text-[16px] font-medium text-slate-400 leading-relaxed">{activity.description}</p>
                  <p className="text-[12px] font-bold text-slate-300 uppercase tracking-widest pt-1">{activity.time}</p>
                </div>
                {activity.actionLabel && (
                  <LockedActionOverlay label="Open the day to resolve stock alerts">
                    <Button 
                      className={cn(
                        "rounded-2xl h-14 px-10 font-bold transition-all shadow-sm",
                        activity.actionLabel.includes('Fix') ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white" : "bg-white border-2 border-indigo-100 text-[#3B59DA] hover:bg-slate-50"
                      )}
                    >
                      {activity.actionLabel}
                    </Button>
                  </LockedActionOverlay>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function HomeHeroOpening({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-[48px] p-10 lg:p-12 shadow-2xl bg-gradient-to-r from-[#030712] via-[#2F29A3] to-[#8B31FF] text-white min-h-[320px] flex items-center">
      {/* Design Pattern Watermark */}
      <div className="absolute -bottom-16 -right-16 opacity-[0.05] pointer-events-none scale-150">
          <Utensils className="h-[300px] w-[300px] -rotate-12" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10 w-full items-center justify-between">
        <div className="space-y-6 text-left shrink">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[0.9]">
              Welcome <br /> back, <br />
              <span className="font-inria italic font-medium opacity-90 text-4xl lg:text-6xl block mt-2">{name}</span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#EF4444] px-4 py-1.5 rounded-full shadow-lg border border-white/10">
                <ClipboardList className="h-3 w-3" />
                <span className="text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap">16 items need counting</span>
            </div>
            <p className="text-indigo-50 text-xs lg:text-sm font-bold leading-relaxed opacity-80 max-w-[200px]">
              Do your opening stock count before starting your restaurant operations.
            </p>
          </div>
          <div className="flex justify-start">
            <Button className="h-12 px-8 bg-white text-[#4F46E5] hover:bg-slate-50 rounded-xl font-black gap-3 text-sm shadow-xl transition-all" asChild>
              <Link href="/dashboard/inventory/daily-stock-count">
                Count Daily Stock <ArrowRight className="h-4 w-4 stroke-[3px]" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto xl:flex-1">
          <HeroStatCard label="Total Inventory Items" value="24" icon={Package} accent="#4F46E5" />
          <HeroStatCard label="Critical Stock Items" value="6" icon={AlertCircle} accent="#EF4444" />
          <HeroStatCard label="Low Stock Items" value="6" icon={AlertTriangle} accent="#F59E0B" />
          <HeroStatCard label="Shift Status" value="Inactive" icon={Clock} accent="#10B981" />
        </div>
      </div>
    </div>
  );
}

function HomeHeroActive({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] p-8 lg:p-12 border border-[#3B59DA]/20 bg-[#F8FAFF] shadow-sm">
      <div className="flex flex-col lg:flex-row gap-8 relative z-10 w-full lg:items-stretch justify-between">
        <div className="flex flex-col justify-between text-left lg:max-w-[340px] shrink-0 py-2">
          <div className="space-y-5">
            <h1 className="text-[36px] lg:text-[42px] font-bold text-[#1E293B] tracking-tight font-inria italic leading-tight">
              Welcome back, {name}
            </h1>
            <div className="inline-flex items-center gap-2 bg-white text-[#3B59DA] px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                <Lock className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">Opening Prep Locked</span>
            </div>
            <p className="text-slate-500 text-[15px] font-medium leading-[1.6]">
              Closing Stock Count will be enabled at 7 PM. To change the Closing Stock Count time, your admin can change it in the store management settings.
            </p>
          </div>
          <div className="flex justify-start pt-8">
            <Button variant="outline" className="h-14 px-8 border-[#3B59DA] bg-white text-[#3B59DA] hover:bg-[#3B59DA]/5 rounded-[12px] font-bold gap-4 text-[15px] transition-all w-full lg:w-fit" asChild>
              <Link href="/dashboard/kitchen-service">
                Proceed to Kitchen Service <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 flex-1 min-w-0 self-center">
          <HeroStatCard label="Total Inventory Items" value="24" icon={Package} accent="#3B59DA" />
          <HeroStatCard label="Critical Stock Items" value="6" icon={AlertCircle} accent="#EF4444" />
          <HeroStatCard label="Low Stock Items" value="6" icon={AlertTriangle} accent="#F59E0B" />
          <HeroStatCard label="Shift Status" value="Active" icon={Clock} accent="#10B981" />
        </div>
      </div>
    </div>
  );
}

function HeroStatCard({ label, value, icon: Icon, accent }: { label: string, value: string, icon: any, accent: string }) {
  return (
    <div className="bg-white rounded-[12px] p-5 h-[150px] shadow-sm flex flex-col justify-between border border-slate-100 w-full transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div 
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}10`, color: accent }}
        >
            <Icon className="h-5 w-5 stroke-[2.5px]" />
        </div>
        <span className="text-[11px] font-bold text-slate-400 leading-tight">
          {label}
        </span>
      </div>
      <div>
        <p className="text-[32px] lg:text-[36px] font-bold tracking-tight text-[#333] leading-none">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[20px] p-7 space-y-2.5 transition-all hover:border-indigo-100/50 shadow-sm">
      <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-3xl font-black text-[#1E293B] tracking-tight">{value}</p>
    </div>
  );
}

function ReviewOpeningChecklistSection({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { finishOpening } = useRestaurantDayLifecycle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Background submission
      restaurantOpsService.submitOpeningChecklist({});
      // Instant UI transition
      finishOpening();
      
      toast({
        title: "Kitchen Opened",
        description: "Your restaurant operations are now live and all features are unlocked.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to open kitchen. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.18)] border border-white/20 overflow-hidden bg-white/95 backdrop-blur-sm animate-in zoom-in-95 duration-300">
      <div className="p-10 pb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#1E293B] tracking-tight">
          Review Opening Checklist
        </h1>
      </div>

      <CardContent className="px-10 py-6 space-y-10">
        <div className="bg-[#F8FAFF] border border-[#E9EFFF] rounded-3xl p-8 flex items-center gap-6">
          <div className="bg-white rounded-full p-4 shadow-sm border border-[#E9EFFF] shrink-0">
            <div className="bg-[#EEF2FF] rounded-full p-2">
              <CheckCircle2 className="h-7 w-7 text-[#4F46E5]" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-[#1E293B]">Ready to Open?</h3>
            <p className="text-slate-500 font-bold text-base leading-relaxed">
              Submitting this will unlock Kitchen Service mode and log stock levels for Oct 24.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.1em]">
            Summary Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="Items Counted" value="24 / 24" />
            <StatCard label="Notes Added" value="1 Note" />
            <StatCard label="Opening Time" value="08:45 AM" />
            <StatCard label="Staff" value="Sarah C." />
          </div>
        </div>
      </CardContent>

      <div className="p-10 pt-4 flex items-center justify-end gap-5">
        <Button 
          variant="outline" 
          className="h-[60px] px-10 rounded-2xl border-2 border-slate-200 font-black text-[#1E293B] hover:bg-slate-50 transition-all text-lg"
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          className="h-[60px] px-12 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black shadow-xl shadow-indigo-100 transition-all border-none text-lg"
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Opening Kitchen..." : "Confirm & Open Kitchen"}
        </Button>
      </div>
    </Card>
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
