"use client";

import { useState } from "react";
import { X, AlertTriangle, Clock } from "lucide-react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { 
    InriaHeading, 
    FigtreeText
} from "@/components/ui/dosteon-ui";

interface ReviewClosingChecklistModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: any[];
    summary: {
        itemsChecked: number;
        itemsTotal: number;
        alerts: number;
        closingTime: string;
    };
}

export function ReviewClosingChecklistModal({ 
    open, 
    onOpenChange, 
    summary,
    items
}: ReviewClosingChecklistModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { forceClose } = useRestaurantDayLifecycle();

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            // 1. Submit to backend first — if this fails the day stays OPEN (correct)
            await restaurantOpsService.submitClosingChecklist({ summary, items });

            // 2. Only transition UI to CLOSED after backend confirms
            await forceClose();

            toast({
                title: "Kitchen Closed",
                description: "Closing checklist submitted. Restaurant operations are closed for today.",
            });

            onOpenChange(false);
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Failed to close kitchen:", error);
            const detail = error?.response?.data?.detail || "";
            toast({
                title: "Cannot Close Kitchen",
                description: detail || "Failed to submit closing checklist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] rounded-[10px] p-0 overflow-hidden border-none shadow-[0_32px_120px_rgba(15,23,42,0.15)] bg-white [&>button]:hidden font-figtree">
                <div className="p-10 space-y-8">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <DialogTitle asChild>
                                    <InriaHeading className="text-[28px] font-bold text-[#1E293B] tracking-tight leading-none">Review Closing Checklist</InriaHeading>
                                </DialogTitle>
                                <FigtreeText className="text-[14px] font-bold text-slate-500 max-w-sm leading-relaxed">
                                    Confirm today's inventory reconciliation to finalize local operations.
                                </FigtreeText>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-full hover:bg-slate-50 transition-all" 
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-6 w-6 text-slate-400" />
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* Banner Alert */}
                    <div className="p-8 rounded-[8px] border border-yellow-200 bg-[#FFFBEB] flex items-center gap-6 shadow-sm">
                        <div className="h-14 w-14 rounded-full bg-[#FDE68A] flex items-center justify-center border border-yellow-300 shrink-0">
                            <AlertTriangle className="h-7 w-7 text-[#92400E] stroke-[2.5px]" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <h4 className="text-[18px] font-bold text-[#92400E] font-figtree tracking-tight leading-none">Attention Needed</h4>
                            <FigtreeText className="text-[#B45309] text-[14px] font-medium leading-relaxed">
                                {summary.alerts} item(s) are marked as low stock. This may affect kitchen service.
                            </FigtreeText>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatBox 
                            label="Items Checked Today" 
                            value={`${summary.itemsChecked} / ${summary.itemsTotal}`} 
                        />
                        <StatBox 
                            label="Verification Rate" 
                            value="100%" 
                            valueColor="text-emerald-500" 
                        />
                        <StatBox 
                            label="Critical Alerts" 
                            value={summary.alerts.toString()} 
                            valueColor="text-rose-500" 
                        />
                        <StatBox 
                            label="Closing Timestamp" 
                            value={summary.closingTime} 
                        />
                    </div>
 
                    {/* Final Submission Form Area */}
                    <div className="bg-[#F8FAFC] border border-slate-100 rounded-[8px] p-6 space-y-4">
                        <div className="space-y-2">
                           <FigtreeText className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none ml-1">Closing Operational Notes</FigtreeText>
                           <textarea 
                             placeholder="Add any final notes about today's service, stock adjustments, or equipment status..."
                             className="w-full h-24 bg-white border border-slate-200 rounded-[8px] p-4 text-[14px] font-medium text-[#1E293B] font-figtree placeholder:text-slate-300 focus:ring-[#3B59DA]/10 focus:border-[#3B59DA]/20 transition-all shadow-none resize-none"
                           />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-5 pt-4 border-t border-slate-100">
                        <Button 
                            variant="outline" 
                            className="h-14 px-10 rounded-[8px] border-slate-200 font-bold text-slate-500 hover:text-slate-900 transition-all font-figtree text-[15px] shadow-sm bg-white active:scale-95"
                            onClick={() => onOpenChange(false)}
                        >
                            Back
                        </Button>
                        <Button 
                            className="h-14 px-12 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold transition-all border-none font-figtree text-[16px] shadow-lg shadow-indigo-100 active:scale-95"
                            disabled={isSubmitting}
                            onClick={handleConfirm}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 animate-spin" /> Submitting...
                                </span>
                            ) : "Confirm & Close Kitchen"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StatBox({ label, value, valueColor = "text-[#1E293B]" }: { label: string, value: string, valueColor?: string }) {
    return (
        <div className="p-5 rounded-[8px] border border-slate-200 bg-white shadow-none flex flex-col items-center justify-center gap-1.5 text-center min-h-[100px] transition-all hover:border-indigo-100">
            <FigtreeText className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">{label}</FigtreeText>
            <span className={cn("text-[20px] font-black tracking-tighter tabular-nums leading-none font-figtree", valueColor)}>{value}</span>
        </div>
    );
}
