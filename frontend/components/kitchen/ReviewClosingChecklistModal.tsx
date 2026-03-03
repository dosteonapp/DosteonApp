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
    FigtreeText,
    PrimarySurfaceCard 
} from "@/components/ui/dosteon-ui";

interface ReviewClosingChecklistModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
    summary 
}: ReviewClosingChecklistModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { finishClosing, startClosing, completeClosingStep, forceClose, status } = useRestaurantDayLifecycle();

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            // 1. Submit to backend
            const submitTask = restaurantOpsService.submitClosingChecklist(summary);
            
            // 2. Transition lifecycle immediately
            await forceClose();

            // Await backend before showing success
            await submitTask;

            toast({
                title: "Kitchen Closed",
                description: "Closing checklist submitted. Restaurant operations are closed for today.",
            });
            
            onOpenChange(false);
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Failed to close kitchen:", error);
            toast({
                title: "Submission Failed",
                description: "Failed to submit closing checklist.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] rounded-[48px] p-0 overflow-hidden border-none shadow-[0_32px_120px_rgba(15,23,42,0.15)] bg-white">
                <div className="p-10 space-y-10">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <DialogTitle asChild>
                                    <InriaHeading className="text-[32px] font-bold text-[#1E293B] tracking-tight leading-none">Review Closing Checklist</InriaHeading>
                                </DialogTitle>
                                <FigtreeText className="text-[15px] font-bold text-slate-500 max-w-sm leading-relaxed">
                                    Confirm today's inventory reconciliation to finalize local operations.
                                </FigtreeText>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-14 w-14 rounded-full hover:bg-slate-50 transition-all border border-slate-50" 
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-6 w-6 text-slate-400" />
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* Banner Alert */}
                    <div className="p-8 rounded-[32px] border border-amber-100 bg-amber-50/30 flex items-start gap-8 shadow-sm">
                        <div className="h-14 w-14 rounded-[22px] bg-amber-500 flex items-center justify-center border border-amber-600/10 shadow-lg shadow-amber-200/50 shrink-0">
                            <AlertTriangle className="h-7 w-7 text-white stroke-[2.5px]" />
                        </div>
                        <div className="space-y-2 flex-1 pt-1">
                            <h4 className="text-[20px] font-black text-[#92400E] font-figtree tracking-tight leading-none">Action Required (Alerts)</h4>
                            <FigtreeText className="text-base font-bold text-[#B45309]/80 leading-relaxed">
                                {summary.alerts} item(s) are marked as low stock. This may require an immediate purchase order to ensure availability.
                            </FigtreeText>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
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
                    <div className="bg-[#F8FAFC] border border-slate-100/50 rounded-[32px] p-8 md:p-10 space-y-6">
                        <div className="space-y-4">
                           <FigtreeText className="text-[12px] font-black text-[#1E293B] uppercase tracking-[0.2em] leading-none ml-1">Closing Operational Notes</FigtreeText>
                           <textarea 
                             placeholder="Add any final notes about today's service, stock adjustments, or equipment status..."
                             className="w-full h-32 bg-white border border-slate-200/50 rounded-2xl p-6 text-[15px] font-bold text-[#1E293B] font-figtree placeholder:text-slate-300 placeholder:font-black focus:ring-[#3B59DA]/10 focus:border-[#3B59DA]/20 transition-all shadow-none focus:shadow-xl focus:shadow-indigo-500/5 border-none resize-none"
                           />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-100">
                        <Button 
                            variant="outline" 
                            className="h-16 px-12 rounded-[22px] border-slate-200 font-bold text-slate-500 hover:text-slate-900 transition-all font-figtree text-[17px] shadow-sm bg-white active:scale-95"
                            onClick={() => onOpenChange(false)}
                        >
                            Review Again
                        </Button>
                        <Button 
                            className="h-16 px-14 rounded-[22px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black transition-all border-none font-figtree text-[18px] shadow-2xl shadow-indigo-900/10 active:scale-95"
                            disabled={isSubmitting}
                            onClick={handleConfirm}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-3">
                                    <Clock className="h-6 w-6 animate-spin" /> Submitting...
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
        <div className="p-6 rounded-[32px] border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center gap-3 text-center min-h-[140px] group hover:border-[#3B59DA]/20 transition-all hover:shadow-lg">
            <FigtreeText className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{label}</FigtreeText>
            <span className={cn("text-[32px] font-black tracking-tighter tabular-nums leading-none font-figtree", valueColor)}>{value}</span>
        </div>
    );
}
