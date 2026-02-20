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
            <DialogContent className="sm:max-w-[800px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className="p-10 space-y-10">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-[32px] font-black text-[#1E293B] font-inria tracking-tight">Review Closing Checklist</DialogTitle>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-full hover:bg-slate-50" 
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-6 w-6 text-slate-400" />
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* Banner Alert */}
                    <div className="p-8 rounded-[24px] border-2 border-[#FACA15] bg-[#FEFCE8] flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-[#FACA15] flex items-center justify-center shrink-0 shadow-lg shadow-yellow-200/50">
                            <AlertTriangle className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <h4 className="font-black text-[#854D0E] text-2xl tracking-tight leading-none">Attention Needed</h4>
                            <p className="text-base font-bold text-[#A16207]/80 leading-relaxed">
                                {summary.alerts} item is marked as low stock. This may affect kitchen service.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <StatBox 
                            label="Items Checked" 
                            value={`${summary.itemsChecked} / ${summary.itemsTotal}`} 
                        />
                        <StatBox 
                            label="Completion" 
                            value="100%" 
                            valueColor="text-[#10B981]" 
                        />
                        <StatBox 
                            label="Alerts" 
                            value={summary.alerts.toString()} 
                            valueColor="text-[#EF4444]" 
                        />
                        <StatBox 
                            label="Closing Time" 
                            value={summary.closingTime} 
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-4 pt-6">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-[72px] rounded-2xl border-2 border-slate-200 font-black text-xl text-slate-600 hover:bg-slate-50 transition-all"
                            onClick={() => onOpenChange(false)}
                        >
                            Back
                        </Button>
                        <Button 
                            className="flex-[1.5] h-[72px] rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black text-xl shadow-2xl shadow-indigo-200 transition-all border-none"
                            disabled={isSubmitting}
                            onClick={handleConfirm}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Clock className="h-6 w-6 animate-spin" /> Closing...
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
        <div className="p-8 rounded-[24px] border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center gap-4 text-center min-h-[160px] group hover:border-indigo-100 transition-all hover:shadow-md">
            <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
            <span className={cn("text-[44px] font-black tracking-tighter tabular-nums leading-none", valueColor)}>{value}</span>
        </div>
    );
}
