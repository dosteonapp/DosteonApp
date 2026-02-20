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
    if (path.startsWith("/dashboard/settings")) return ["Settings"];
    if (path.startsWith("/dashboard/orders")) return ["Orders"];
    if (path.startsWith("/dashboard/finance")) return ["Finance"];
    if (path.startsWith("/dashboard/suppliers")) return ["Suppliers"];
    if (path.startsWith("/dashboard/analytics")) return ["Analytics"];
    return [];
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="bg-white border-b border-[#F1F5F9] px-10 py-5 flex items-center justify-between sticky top-0 z-40 h-[100px]">
      <div className="flex items-center gap-14 flex-1">
        <div className="flex items-center gap-6 min-w-fit">
          {breadcrumbs.length > 1 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all active:scale-95"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-300" />}
                <span className={cn(
                  "text-sm font-black tracking-tight",
                  idx === breadcrumbs.length - 1 ? "text-slate-900" : "text-slate-400"
                )}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-[#3B59DA] transition-colors" />
            <Input 
              placeholder="Search" 
              className="pl-16 h-14 bg-white border border-slate-100 rounded-2xl w-full text-lg font-bold text-[#1E293B] focus-visible:ring-indigo-100/50 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <DayStatusBadge />
        
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <Calendar className="h-5 w-5 text-[#3B59DA]" />
          <div className="flex items-center gap-3 text-sm font-black text-[#3B59DA]">
            <span>Tuesday, Jan 24, 2026</span>
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-200" />
            <span className="tabular-nums italic font-inria">09:43:23 AM</span>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="h-[52px] w-[52px] rounded-2xl bg-white border border-slate-100 relative group shadow-sm hover:border-indigo-100">
          <Bell className="h-6 w-6 text-slate-400 group-hover:text-[#3B59DA] transition-colors" />
          <span className="absolute top-3.5 right-3.5 h-3 w-3 bg-[#EF4444] border-2 border-white rounded-full shadow-sm" />
        </Button>
      </div>
    </div>
  );
}
