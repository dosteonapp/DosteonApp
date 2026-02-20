"use client";

import React from "react";
import { useRestaurantDayLifecycle } from "./RestaurantDayLifecycleProvider";
import { usePathname } from "next/navigation";
import { isModuleLocked, shouldBlockModuleAccess } from "@/lib/dayLifecycle/restaurantModuleAccess";
import { Lock, ArrowRight, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function RestaurantDayRouteGuard({ children }: { children: React.ReactNode }) {
  const { status } = useRestaurantDayLifecycle();

  if (!status) return <>{children}</>;

  // Navigation is now always allowed as read-only. 
  // Per-page status banners and action guards handle restrictions.
  return <>{children}</>;
}

function LockedModuleCard({ onStart }: { onStart: () => void }) {
  return (
    <Card className="p-12 border-4 border-[#4F46E5]/10 shadow-2xl shadow-indigo-100/50 rounded-[48px] overflow-hidden bg-white relative">
        <div className="absolute top-0 right-0 p-12 text-[#EEF2FF] pointer-events-none">
            <Lock className="h-64 w-64 stroke-[4px]" />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 relative z-10 items-center text-center lg:text-left">
            <div className="h-24 w-24 rounded-[32px] bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shrink-0">
                <Lock className="h-10 w-10 stroke-[2.5px]" />
            </div>
            
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-[#1E293B] tracking-tight">Module is Locked</h2>
                    <p className="text-slate-500 font-bold text-lg max-w-xl leading-relaxed">
                        This operation module is currently locked. You need to complete your opening checklist to access and perform actions here.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button 
                        onClick={onStart}
                        size="lg" 
                        className="h-14 px-8 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black gap-3 shadow-xl shadow-indigo-200 w-full sm:w-auto"
                    >
                        Start Opening Process <Sun className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="lg" 
                        className="h-14 px-8 rounded-2xl border-2 border-slate-100 font-black text-slate-500 hover:bg-slate-50 gap-3 w-full sm:w-auto"
                        asChild
                    >
                        <Link href="/dashboard">Return to Dashboard <ArrowRight className="h-5 w-5" /></Link>
                    </Button>
                </div>
            </div>
        </div>
    </Card>
  );
}
