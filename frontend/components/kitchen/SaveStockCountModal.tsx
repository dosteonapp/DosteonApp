"use client";

import { ClipboardCheck } from "lucide-react";
import { 
    Dialog, 
    DialogContent 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SaveStockCountModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SaveStockCountModal({ open, onOpenChange }: SaveStockCountModalProps) {
    const router = useRouter();

    const handleReturnToDashboard = () => {
        onOpenChange(false);
        router.push("/dashboard");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] rounded-[40px] p-10 border-none shadow-2xl flex flex-col items-center text-center gap-8">
                <div className="h-20 w-20 rounded-[32px] bg-blue-50 flex items-center justify-center border border-blue-100/50">
                    <ClipboardCheck className="h-10 w-10 text-primary" />
                </div>
                
                <div className="space-y-3">
                    <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Progress Saved!</h2>
                    <p className="text-slate-500 font-bold leading-relaxed text-sm px-4">
                        Your stock count has been saved as a draft. You can come back at any time to finish your opening prep.
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <Button 
                        className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black shadow-xl shadow-primary/20 w-full text-base"
                        onClick={handleReturnToDashboard}
                    >
                        Return to Dashboard
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-14 rounded-2xl border-[#E2E8F0] font-black text-[#64748B] hover:bg-slate-50 w-full text-base"
                        onClick={() => onOpenChange(false)}
                    >
                        Continue Editing
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
