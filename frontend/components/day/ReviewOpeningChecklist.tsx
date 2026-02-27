"use client";

import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { useToast } from "@/hooks/use-toast";

interface ReviewOpeningChecklistProps {
  onBack: () => void;
  onConfirm?: () => void;
}

export function ReviewOpeningChecklist({ onBack, onConfirm }: ReviewOpeningChecklistProps) {
  const router = useRouter();
  const { finishOpening } = useRestaurantDayLifecycle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      restaurantOpsService.submitOpeningChecklist({});
      finishOpening();
      
      toast({
        title: "Kitchen Opened",
        description: "Your restaurant operations are now live and all features are unlocked.",
      });

      if (onConfirm) {
        onConfirm();
      } else {
        router.push("/dashboard");
      }
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
    <Card className="w-full max-w-[620px] rounded-[28px] shadow-2xl border-none overflow-hidden bg-white animate-in zoom-in-95 duration-300 font-figtree">
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50">
        <h1 className="text-[22px] font-bold text-[#1E293B] tracking-tight">
          Review & Complete Opening
        </h1>
        <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-slate-50" onClick={onBack}>
            <X className="h-5 w-5 text-slate-400" />
        </Button>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Status Box */}
        <div className="bg-[#3B59DA] rounded-[20px] p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-900/10">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight">Opening Checklist</h3>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Shift ID: #12245 | Oct 24, 2025</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 font-bold text-[14px]">
            Day 122
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Items Counted" value="24" subtext="All confirmed" />
          <StatCard label="Discrepancy" value="02" subtext="Needs Review" isAlert />
          <StatCard label="Total Value" value="1.2M" subtext="RWF Estimated" />
        </div>

        {/* Mini Table Summary */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Verification Summary
            </div>
            <div className="divide-y divide-slate-50 max-h-[200px] overflow-y-auto">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-[13px] font-bold text-slate-700">Item Name {i}</span>
                        </div>
                        <span className="text-[13px] font-bold text-slate-400">12kg</span>
                    </div>
                ))}
                <div className="px-5 py-3 flex items-center justify-between bg-amber-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-[13px] font-bold text-slate-700">Tomatoes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-amber-600 uppercase">Conflict</span>
                        <span className="text-[13px] font-bold text-slate-400">1.5kg</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/10 border-t border-slate-50 flex items-center justify-end gap-4">
        <Button 
          variant="outline" 
          className="h-12 px-8 rounded-xl border-slate-200 font-bold text-slate-400 hover:bg-white hover:text-slate-600 transition-all text-sm"
          onClick={onBack}
        >
          Go Back
        </Button>
        <Button 
          className="h-12 px-8 rounded-xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold transition-all border-none text-sm shadow-xl shadow-indigo-900/10"
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Review & Confirm"}
        </Button>
      </div>
    </Card>
  );
}

function StatCard({ label, value, subtext, isAlert }: { label: string; value: string, subtext: string, isAlert?: boolean }) {
  return (
    <div className={cn(
        "bg-white border rounded-[20px] p-5 space-y-1 shadow-sm transition-all",
        isAlert ? "border-red-100 bg-red-50/30" : "border-slate-100"
    )}>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className={cn("text-2xl font-bold tracking-tight", isAlert ? "text-red-500" : "text-[#1E293B]")}>{value}</p>
      <p className="text-[10px] font-bold text-slate-400 opacity-60 uppercase">{subtext}</p>
    </div>
  );
}
