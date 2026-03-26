"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Calendar, ChevronRight, ArrowLeft, Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleSidebar } = useSidebar();
  
  // Real-time Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };
  
  const getBreadcrumbs = (path: string) => {
    if (path === "/dashboard/inventory/daily-stock-count") return ["Inventory", "Daily Stock Count"];
    if (path === "/dashboard/inventory/new") {
      const isEdit = searchParams.get("edit");
      return ["Inventory", isEdit ? "Edit Item" : "Add New Item"];
    }
    if (path === "/dashboard/inventory/items") return ["Inventory", "Master Registry"];
    if (path.startsWith("/dashboard/inventory/") && path !== "/dashboard/inventory/items") return ["Inventory", "Item Details"];
    if (path === "/dashboard") return ["Home"];
    if (path.startsWith("/dashboard/kitchen-service")) return ["Kitchen Service"];
    if (path.startsWith("/dashboard/inventory")) return ["Inventory"];
    if (path.startsWith("/dashboard/closing")) return ["Closing"];
    if (path.startsWith("/dashboard/notifications")) return ["Notifications"];
    if (path.startsWith("/dashboard/settings")) {
      const parts = ["Settings"];
      if (path.includes("/personal")) parts.push("Personal Details");
      if (path.includes("/business")) parts.push("Business Settings");
      if (path.includes("/notifications")) parts.push("Notification Settings");
      return parts;
    }
    return [];
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="bg-white border-b border-slate-100 h-[72px] md:h-[88px] sticky top-0 z-40 transition-all font-figtree w-full">
      <div className="h-full px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4">
        {/* Left: menu toggle + breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 lg:hidden shrink-0"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5 stroke-[2.5px]" />
          </Button>

          {breadcrumbs.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-[14px] hover:bg-slate-50 text-slate-400 hover:text-[#3B59DA] transition-all active:scale-95 border border-slate-100/50 shadow-sm hidden sm:flex shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5 stroke-[3px]" />
            </Button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-200 stroke-[4px] shrink-0" />}
                <span className={cn(
                  "text-[15px] md:text-[16px] font-bold tracking-tight transition-colors font-figtree truncate",
                  idx === breadcrumbs.length - 1 ? "text-[#1E293B]" : "text-slate-300 hover:text-slate-400 cursor-default hidden sm:block"
                )}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Search — visible md+ */}
          <div className="flex-1 max-w-sm lg:max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#3B59DA] transition-all" />
              <Input
                placeholder="Search anything..."
                className="pl-11 h-[44px] bg-slate-50/60 border-slate-200/60 rounded-xl w-full text-[14px] font-semibold text-slate-700 focus-visible:ring-[#3B59DA]/5 focus-visible:bg-white focus-visible:border-[#3B59DA]/30 transition-all placeholder:text-slate-300 shadow-none"
              />
            </div>
          </div>
        </div>

        {/* Right: date/time + notifications */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Date/time — visible lg+ */}
          <div className="hidden lg:flex items-center gap-3 bg-indigo-50/30 px-4 py-2.5 rounded-[16px] border border-indigo-100/30 shadow-sm hover:bg-white hover:border-indigo-100 transition-all group cursor-default">
            <Calendar className="h-4 w-4 text-[#3B59DA] group-hover:scale-110 transition-transform stroke-[2.5px] shrink-0" />
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500 font-figtree">
              <span className="group-hover:text-slate-900 transition-colors uppercase hidden xl:block">{formatDate(currentTime)}</span>
              <span className="group-hover:text-slate-900 transition-colors uppercase xl:hidden">{formatDate(currentTime).split(",")[0]}</span>
              <div className="h-1 w-1 rounded-full bg-slate-200 group-hover:bg-[#3B59DA] transition-colors" />
              <span className="tabular-nums text-[#3B59DA]">{formatTime(currentTime)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:h-11 md:w-11 rounded-[14px] bg-white border border-slate-100 relative group shadow-sm hover:shadow-md hover:border-[#3B59DA]/20 transition-all active:scale-95 shrink-0"
          >
            <Bell className="h-5 w-5 text-slate-400 group-hover:text-[#3B59DA] transition-colors stroke-[2.5px]" />
            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-[#EF4444] border-2 border-white rounded-full shadow-sm animate-pulse" />
          </Button>
        </div>
      </div>
    </div>
  );
}
