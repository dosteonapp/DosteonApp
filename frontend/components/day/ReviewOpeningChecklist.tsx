"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, X, AlertTriangle, Clock, Activity, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
    InriaHeading, 
    FigtreeText, 
    PrimarySurfaceCard 
} from "@/components/ui/dosteon-ui";

interface ReviewOpeningChecklistProps {
  onBack: () => void;
  onConfirm?: () => void;
}

export function ReviewOpeningChecklist({ onBack, onConfirm }: ReviewOpeningChecklistProps) {
  const router = useRouter();
  const { finishOpening } = useRestaurantDayLifecycle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await restaurantOpsService.submitOpeningChecklist({});
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
    <div className="w-full max-w-[720px] rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.16)] border-none overflow-hidden bg-white animate-in zoom-in-95 duration-500 font-figtree">
      {/* Header */}
      <div className="p-8 md:p-10 flex items-center justify-between border-b border-slate-50">
        <InriaHeading className="text-[32px] font-bold text-[#1E293B] tracking-tight">
          Review Opening Checklist
        </InriaHeading>
        <Button variant="ghost" className="h-12 w-12 p-0 rounded-full hover:bg-slate-50 transition-all" onClick={onBack}>
            <X className="h-8 w-8 text-slate-300" />
        </Button>
      </div>

      <div className="p-10 space-y-10">
        {/* Attention Banner */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[24px] p-8 flex items-center gap-6 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-[#FCD34D] flex items-center justify-center border border-[#F59E0B] shadow-lg shadow-yellow-200/50 shrink-0">
             <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-[22px] font-black text-[#92400E] font-figtree tracking-tight leading-none">Attention Needed</h3>
            <FigtreeText className="text-[#B45309] text-base font-bold leading-relaxed">
              1 item is marked as low stock. This may affect kitchen service.
            </FigtreeText>
          </div>
        </div>

        {/* 4 Summary Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
           <SummaryCard 
                label="Items Checked" 
                value="24 / 24" 
                icon={ShieldCheck}
                color="text-[#1E293B]"
           />
           <SummaryCard 
                label="Completion" 
                value="100%" 
                icon={Activity}
                color="text-[#10B981]"
           />
           <SummaryCard 
                label="Alerts" 
                value="1" 
                icon={AlertTriangle}
                color="text-[#EF4444]"
           />
           <SummaryCard 
                label="Opening Time" 
                value={currentTime} 
                icon={Clock}
                color="text-[#1E293B]"
           />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-10 md:p-12 bg-slate-50/20 border-t border-slate-50 flex items-center justify-end gap-6">
        <Button 
          variant="outline" 
          className="h-16 px-12 rounded-2xl border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all text-[17px] flex-1 font-figtree shadow-sm"
          onClick={onBack}
        >
          Cancel and Back
        </Button>
        <Button 
          className="h-16 px-14 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black transition-all border-none text-[18px] shadow-2xl shadow-indigo-900/10 flex-[2] font-figtree active:scale-95 duration-300"
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Opening..." : "Confirm & Open Kitchen"}
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[24px] p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm transition-all hover:border-indigo-100 group min-h-[160px]">
      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-500 shadow-inner">
         <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
          <p className={cn("text-[38px] font-black tracking-tighter tabular-nums leading-none", color)}>{value}</p>
          <FigtreeText className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{label}</FigtreeText>
      </div>
    </div>
  );
}
