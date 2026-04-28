"use client";

import { useState, useEffect } from "react";
import { X, Check, ArrowRight, Package } from "lucide-react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InventoryItem, restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { useToast } from "@/hooks/use-toast";

interface UpdateInventoryItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InventoryItem | null;
    onSuccess?: () => void;
}

export function UpdateInventoryItemModal({ 
    open, 
    onOpenChange, 
    item,
    onSuccess 
}: UpdateInventoryItemModalProps) {
    const [newQuantity, setNewQuantity] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (item) {
            setNewQuantity(item.currentStock.toString());
        }
    }, [item, open]);

    const handleConfirm = async () => {
        if (!item || !newQuantity) return;
        const val = parseFloat(newQuantity);
        if (val === item.currentStock) {
            onOpenChange(false);
            return;
        }

        setIsSubmitting(true);
        try {
            await restaurantOpsService.updateItemStock(item.id, val);
            toast({
                title: "Stock Updated",
                description: `${item.name} stock level updated to ${val} ${item.unit}.`
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update stock level.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!item) return null;

    const isUnchanged = parseFloat(newQuantity) === item.currentStock;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="p-8 space-y-8">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-black text-[#1E293B]">Update Item</DialogTitle>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-slate-100" 
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </Button>
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                            Manually adjust the inventory level for <span className="text-slate-600 font-bold">Dosteon Restaurant</span>
                        </p>
                    </DialogHeader>

                    {/* Item Summary Card */}
                    <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-white">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-100">
                                        <Package className="h-8 w-8 text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-[#1E293B] text-lg">{item.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.sku}</span>
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <Badge variant="outline" className="bg-white text-[10px] font-black uppercase tracking-wider text-slate-500 rounded-md border-slate-200">
                                        {item.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Quantity</span>
                            <span className="text-xl font-black text-[#1E293B] tabular-nums">{item.currentStock} {item.unit}</span>
                        </div>
                    </div>

                    {/* Inputs Section */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Incoming Quantity</label>
                            <div className="relative">
                                <Input 
                                    value={`${item.currentStock} ${item.unit}`} 
                                    disabled 
                                    className="h-14 font-black text-slate-400 bg-slate-50 border-[#E2E8F0] rounded-xl px-5"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-primary uppercase tracking-widest">New Quantity</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    className="h-14 font-black text-[#1E293B] border-[#10B981] rounded-xl px-5 focus-visible:ring-green-100"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                                    <Check className="h-3.5 w-3.5 text-[#10B981] stroke-[4px]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Strip */}
                    <div className="p-4 rounded-xl border-2 border-dashed border-blue-100 bg-blue-50/30 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            Stock will update from {item.currentStock} {item.unit} to <span className="text-primary font-black underline decoration-2 underline-offset-4">{newQuantity || '0'} {item.unit}</span>
                        </p>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-4 pt-2">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-14 rounded-2xl border-[#E2E8F0] font-black text-[#64748B] hover:bg-slate-50"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black shadow-xl shadow-primary/20"
                            disabled={isSubmitting || isUnchanged || !newQuantity}
                            onClick={handleConfirm}
                        >
                            {isSubmitting ? "Updating..." : "Confirm Update"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
