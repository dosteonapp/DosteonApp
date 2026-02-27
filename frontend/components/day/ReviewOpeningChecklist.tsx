"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
      // Background submission
      restaurantOpsService.submitOpeningChecklist({});
      // Instant UI transition
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[20px] p-7 space-y-2.5 transition-all hover:border-indigo-100/50 shadow-sm">
      <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-3xl font-black text-[#1E293B] tracking-tight">{value}</p>
    </div>
  );
}
