"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  User, 
  PackageCheck, 
  ClipboardCheck,
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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMocks } from "@/lib/flags";
import axiosInstance from "@/lib/axios";

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
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error?.response?.data?.message || "Something went wrong while submitting the checklist.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-semibold">Review Opening Checklist</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{mode === 'final' ? 'Ready to Open?' : 'Confirm Item Stock'}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {mode === 'final' 
                  ? `Submitting this will unlock Kitchen Service mode and log stock levels for ${summary.date}.`
                  : `Confirming this item will verify the opening stock level for ${summary.date}.`
                }
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Summary Stats</h4>
            
            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-none border bg-muted/5 group hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ClipboardCheck className="h-4 w-4" />
                    <span className="text-xs font-medium">Items Counted</span>
                  </div>
                  <p className="text-xl font-bold">{summary.itemsCounted} / {summary.itemsTotal}</p>
                </CardContent>
              </Card>

              <Card className="shadow-none border bg-muted/5 group hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <StickyNote className="h-4 w-4" />
                    <span className="text-xs font-medium">Notes Added</span>
                  </div>
                  <p className="text-xl font-bold">{summary.notesTotal} {summary.notesTotal === 1 ? 'Note' : 'Notes'}</p>
                </CardContent>
              </Card>

              <Card className="shadow-none border bg-muted/5 group hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Opening Time</span>
                  </div>
                  <p className="text-xl font-bold">{summary.openingTime}</p>
                </CardContent>
              </Card>

              <Card className="shadow-none border bg-muted/5 group hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-medium">Staff</span>
                  </div>
                  <p className="text-xl font-bold">{summary.staffName}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t flex flex-row items-center justify-end gap-3 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 font-medium"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button 
            onClick={handleConfirm}
            className="h-11 px-8 font-semibold bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" /> {mode === 'final' ? 'Submitting...' : 'Confirming...'}
              </span>
            ) : (mode === 'final' ? "Confirm & Open Kitchen" : "Confirm Item")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
