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
  items: any[];
  onBack: () => void;
  onConfirm?: () => void;
}

export function ReviewOpeningChecklist({ items, onBack, onConfirm }: ReviewOpeningChecklistProps) {
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
      // Get items from state (passed through checklist context or props if needed)
      // Since this modal is inside DailyStockCountPage, we'll give it the items
      await restaurantOpsService.submitOpeningChecklist({ items });
      await finishOpening();
      
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
    <div className="w-full max-w-[700px] rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden bg-white animate-in zoom-in-95 duration-500 font-figtree">
      {/* Header */}
      <div className="p-8 md:p-10 flex items-center justify-between border-b border-slate-100">
        <InriaHeading className="text-[28px] font-bold text-[#1E293B] tracking-tight">
          Review Opening Checklist
        </InriaHeading>
        <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-slate-50 transition-all" onClick={onBack}>
            <X className="h-6 w-6 text-slate-400" />
        </Button>
      </div>

      <div className="p-8 md:p-10 space-y-10">
        {/* Readiness Banner */}
        <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-[8px] p-8 flex items-center gap-6 shadow-sm">
          <div className="h-14 w-14 rounded-full bg-[#DBEAFE] flex items-center justify-center border border-[#BFDBFE] shrink-0">
             <CheckCircle2 className="h-8 w-8 text-[#3B59DA]" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-[20px] font-bold text-[#1E293B] font-figtree tracking-tight leading-none">Ready to Open?</h3>
            <FigtreeText className="text-slate-500 text-[14px] font-medium leading-relaxed">
              Submitting this will unlock Kitchen Service mode and log stock levels for {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
            </FigtreeText>
          </div>
        </div>

        <div className="space-y-6">
           <FigtreeText className="text-[14px] font-bold text-slate-400 uppercase tracking-widest ml-1">Summary Stats</FigtreeText>
           
            <div className="grid grid-cols-2 gap-4">
               <SummaryBox label="Items Counted" value={`${items.filter(i => i.isConfirmed).length} / ${items.length}`} />
               <SummaryBox label="Healthy Stock" value={items.filter(i => i.status === 'Healthy').length.toString()} />
               <SummaryBox label="Opening Time" value={currentTime} />
               <SummaryBox label="Current Day" value={new Date().toLocaleDateString('en-US', { weekday: 'short' })} />
            </div>
        </div>
      </div>

      <div className="p-8 md:p-10 bg-slate-50/20 border-t border-slate-100 flex items-center justify-end gap-6">
        <Button 
          variant="outline" 
          className="h-14 px-10 rounded-[8px] border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm font-figtree shadow-sm"
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          className="h-14 px-12 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold transition-all border-none text-sm shadow-lg shadow-indigo-100 font-figtree active:scale-95 duration-300"
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Opening..." : "Confirm & Open Kitchen"}
        </Button>
      </div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[8px] p-6 flex flex-col items-start justify-center space-y-2.5 shadow-none transition-all hover:border-indigo-100 group min-h-[110px]">
      <FigtreeText className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</FigtreeText>
      <p className="text-[20px] font-black text-[#1E293B] tabular-nums leading-none font-figtree">{value}</p>
    </div>
  );
}
