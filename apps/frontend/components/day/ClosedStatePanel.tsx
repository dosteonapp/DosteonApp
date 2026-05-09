"use client";

import React from "react";
import { Lock, Sun, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRestaurantDayLifecycle } from "./RestaurantDayLifecycleProvider";

interface ClosedStatePanelProps {
  title: string;
  description: string;
  checklistPreview?: string[];
}

export function ClosedStatePanel({ title, description, checklistPreview }: ClosedStatePanelProps) {
  const { startOpening } = useRestaurantDayLifecycle();

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
                    <h2 className="text-4xl font-black text-[#1E293B] tracking-tight">{title}</h2>
                    <p className="text-slate-500 font-bold text-lg max-w-xl leading-relaxed">
                        {description}
                    </p>
                </div>
                
                {checklistPreview && (
                  <div className="bg-slate-50/80 p-6 rounded-3xl space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Required to unlock:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {checklistPreview.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                          <div className="h-2 w-2 rounded-full bg-slate-300" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <Button 
                        onClick={startOpening}
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
                        <Link href="/dashboard">Return to Home <ArrowRight className="h-5 w-5" /></Link>
                    </Button>
                </div>
            </div>
        </div>
    </Card>
  );
}
