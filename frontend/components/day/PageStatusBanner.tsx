"use client";

import React from "react";
import { useRestaurantDayLifecycle } from "./RestaurantDayLifecycleProvider";
import { DayState } from "@/lib/dayLifecycle/types";
import { dayModeStyles } from "@/lib/dayLifecycle/dayModeStyles";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2, Info, Sun, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageStatusBannerProps {
  module: "Home" | "Kitchen" | "Inventory" | "Closing";
}

export function PageStatusBanner({ module }: PageStatusBannerProps) {
  const { status, isOpen, startOpening, startNextDay } = useRestaurantDayLifecycle();
  
  if (!status) return null;

  const styles = dayModeStyles.getStatusColors(status.state);
  const isClosed = !isOpen;

  return (
    <div className={cn(
      "mb-8 p-6 rounded-[24px] border-2 transition-all flex items-center justify-between shadow-sm",
      isClosed ? "bg-white border-[#4F46E5]/10" : "bg-emerald-50/20 border-emerald-500/5"
    )}>
      <div className="flex items-center gap-6">
        <div className={cn(
          "px-4 py-2 rounded-full border-2 flex items-center gap-2 font-black text-[11px] uppercase tracking-widest",
          styles.bg, styles.text, styles.border
        )}>
          <div className={cn("h-2 w-2 rounded-full", styles.dot, isOpen && "animate-pulse")} />
          {isClosed ? (status.state === DayState.CLOSED ? "FINISHED" : "CLOSED") : "OPEN"}
        </div>
        
        <div className="h-10 w-px bg-slate-100" />
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
              <span className="font-black text-slate-900 text-lg">{module}</span>
              {isClosed && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Info className="h-3 w-3 text-[#4F46E5]" />
                  Read-only
                </div>
              )}
          </div>
          <span className="text-slate-400 text-sm font-bold flex items-center gap-2">
            {isClosed ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                This module is locked until the day is opened.
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                This module is active and ready.
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {status.state === DayState.PRE_OPEN && (
          <Button 
            onClick={startOpening}
            className="h-12 px-6 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-black gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            Start Opening Process
            <Sun className="h-4 w-4" />
          </Button>
        )}
        {status.state === DayState.CLOSED && (
          <Button 
            onClick={startNextDay}
            className="h-12 px-6 bg-slate-900 hover:bg-black text-white rounded-xl font-black gap-2 shadow-lg transition-all active:scale-95"
          >
            Prepare for Next Day
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {isClosed && (
          <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
            <Lock className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
