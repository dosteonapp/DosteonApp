"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  StickyNote
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMocks } from "@/lib/flags";
import axiosInstance from "@/lib/axios";
import { FigtreeText, InriaHeading } from "@/components/ui/dosteon-ui";

interface ReviewOpeningChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "item" | "final";
  summary: {
    itemsCounted: number;
    itemsTotal: number;
    notesTotal: number;
    openingTime: string;
    staffName: string;
    date: string;
  };
  onConfirm?: () => void;
}

export function ReviewOpeningChecklistModal({
  open,
  onOpenChange,
  mode = "final",
  summary,
  onConfirm,
}: ReviewOpeningChecklistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        if (useMocks) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log("Mock submission successfull", summary);
        } else {
          await axiosInstance.post("/restaurant/opening-checklist/submit", {
            date: summary.date,
            openingTime: summary.openingTime,
            staffName: summary.staffName,
            itemsCounted: summary.itemsCounted,
            itemsTotal: summary.itemsTotal,
            notesCount: summary.notesTotal,
          });
        }
      }

      if (mode === "final") {
        toast({
          title: "Kitchen Unlocked",
          description: "Opening checklist submitted. Kitchen Service mode is now active.",
        });
        onOpenChange(false);
        router.push("/dashboard/kitchen-service");
      } else {
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response: { data: { message: string } } }).response.data.message
          : "Something went wrong while submitting the checklist.";
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-[10px] p-0 overflow-hidden border-none shadow-[0_32px_120px_rgba(15,23,42,0.15)] bg-white [&>button]:hidden font-figtree">
        <DialogHeader className="p-8 md:p-10 flex flex-row items-center justify-between border-b border-slate-100 space-y-0">
          <DialogTitle asChild>
            <InriaHeading className="text-[28px] font-bold text-[#1E293B] tracking-tight leading-none">Review Opening Checklist</InriaHeading>
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full hover:bg-slate-50 transition-all font-figtree" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6 text-slate-400" />
          </Button>
        </DialogHeader>

        <div className="p-8 md:p-10 space-y-10">
          {/* Readiness Banner */}
          <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-[8px] p-8 flex items-center gap-6 shadow-sm">
            <div className="h-14 w-14 rounded-full bg-[#DBEAFE] flex items-center justify-center border border-[#BFDBFE] shrink-0">
               <CheckCircle2 className="h-8 w-8 text-[#3B59DA]" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-[20px] font-bold text-[#1E293B] font-figtree tracking-tight leading-none">
                {mode === 'final' ? 'Ready to Open?' : 'Confirm Item Stock'}
              </h3>
              <FigtreeText className="text-slate-500 text-[14px] font-medium leading-relaxed">
                {mode === 'final' 
                  ? `Submitting this will unlock Kitchen Service mode and log stock levels for ${summary.date}.`
                  : `Confirming this item will verify the opening stock level for ${summary.date}.`
                }
              </FigtreeText>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest pl-1">Summary Stats</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Items Counted" value={`${summary.itemsCounted} / ${summary.itemsTotal}`} />
              <StatCard label="Notes Added" value={`${summary.notesTotal} ${summary.notesTotal === 1 ? 'Note' : 'Notes'}`} />
              <StatCard label="Opening Time" value={summary.openingTime} />
              <StatCard label="Staff" value={summary.staffName} />
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 md:p-10 bg-slate-50/20 border-t border-slate-100 flex flex-row items-center justify-end gap-5">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-14 px-10 rounded-[8px] font-bold border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-all font-figtree text-[15px] shadow-sm active:scale-95"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button 
            onClick={handleConfirm}
            className="h-14 px-12 font-bold rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-lg shadow-indigo-100 transition-all font-figtree text-[16px] active:scale-95"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 animate-spin" /> {mode === 'final' ? 'Submitting...' : 'Confirming...'}
              </span>
            ) : (mode === 'final' ? "Confirm & Open Kitchen" : "Confirm Item")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[8px] p-6 flex flex-col items-start justify-center space-y-2.5 shadow-none transition-all hover:border-indigo-100 group min-h-[110px]">
      <FigtreeText className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</FigtreeText>
      <p className="text-[20px] font-black text-[#1E293B] tabular-nums leading-none font-figtree">{value}</p>
    </div>
  );
}
