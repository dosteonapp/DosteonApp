"use client";

import React from "react";
import { Search, Bell, Calendar, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DayStatusBadge } from "./day/DayStatusBadge";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const getBreadcrumbs = (path: string) => {
    // Inventory Breadcrumbs
    if (path === "/dashboard/inventory/daily-stock-count") {
      return ["Inventory", "Opening Count"];
    }
    if (path === "/dashboard/inventory/new") {
      const isEdit = searchParams.get("edit");
      return ["Inventory", isEdit ? "Edit Item" : "Add New Item"];
    }
    if (path === "/dashboard/inventory/items") {
      return ["Inventory", "Master Registry"];
    }
    if (path.startsWith("/dashboard/inventory/") && 
        path !== "/dashboard/inventory/items") {
      return ["Inventory", "Item Details"];
    }

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
      
      if (path.includes("/profile")) parts.push("Profile");
      if (path.includes("/security")) parts.push("Security");
      if (path.includes("/preferences")) parts.push("Preferences");
      if (path.includes("/team")) parts.push("Team Management");
      if (path.includes("/operations")) parts.push("Operations");
      
      return parts;
    }
    if (path.startsWith("/dashboard/orders")) return ["Orders"];
    if (path.startsWith("/dashboard/finance")) return ["Finance"];
    if (path.startsWith("/dashboard/suppliers")) return ["Suppliers"];
    if (path.startsWith("/dashboard/analytics")) return ["Analytics"];
    return [];
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="bg-white border-b border-slate-50 px-6 h-[90px] flex items-center justify-between sticky top-0 z-40 transition-all font-figtree">
      <div className="flex items-center gap-12 flex-1">
        <div className="flex items-center gap-6 min-w-fit">
          {breadcrumbs.length > 1 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-12 rounded-[20px] hover:bg-slate-50 text-slate-400 hover:text-[#3B59DA] transition-all active:scale-95 border border-slate-100/50 shadow-sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-6 w-6 stroke-[3px]" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-200 stroke-[4px]" />}
                <span className={cn(
                  "text-[17px] font-semibold tracking-tight transition-colors font-figtree",
                  idx === breadcrumbs.length - 1 ? "text-[#1E293B]" : "text-slate-300 hover:text-slate-400 cursor-default"
                )}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto px-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#3B59DA] transition-all" />
            <Input 
              placeholder="Search anything..." 
              className="pl-16 h-[60px] bg-slate-50/50 border-slate-100/80 rounded-[22px] w-full text-lg font-bold text-slate-700 focus-visible:ring-[#3B59DA]/5 focus-visible:bg-white focus-visible:border-[#3B59DA]/30 transition-all placeholder:text-slate-300 placeholder:font-bold shadow-none focus:shadow-xl focus:shadow-indigo-500/5"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-4 bg-indigo-50/30 px-6 py-3.5 rounded-[22px] border border-indigo-100/30 shadow-sm hover:bg-white hover:border-indigo-100 transition-all group cursor-default">
          <Calendar className="h-5 w-5 text-[#3B59DA] group-hover:scale-110 transition-transform stroke-[2.5px]" />
          <div className="flex items-center gap-3 text-[14px] font-semibold text-slate-500 font-figtree">
            <span className="group-hover:text-slate-900 transition-colors">Tuesday, Jan 24, 2026</span>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-[#3B59DA] transition-colors" />
            <span className="tabular-nums text-[#3B59DA] group-hover:scale-105 transition-transform">09:43:23 AM</span>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-[22px] bg-white border border-slate-100 relative group shadow-sm hover:shadow-md hover:border-[#3B59DA]/20 transition-all active:scale-95 shrink-0">
          <Bell className="h-6 w-6 text-slate-400 group-hover:text-[#3B59DA] transition-colors stroke-[2.5px]" />
          <span className="absolute top-4 right-4 h-3 w-3 bg-[#EF4444] border-[3px] border-white rounded-full shadow-sm animate-pulse" />
        </Button>
      </div>
    </div>
  );
}
