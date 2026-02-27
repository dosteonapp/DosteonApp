"use client";

import { useState, useEffect } from "react";
import { 
    X, 
    Check, 
    Package,
    ArrowRight
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { InventoryItem, restaurantOpsService } from "@/lib/services/restaurantOpsService";

interface InventoryUpdateItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InventoryItem | null;
    restaurantName?: string;
    onUpdate?: () => void;
}

export function InventoryUpdateItemModal({
    open,
    onOpenChange,
    item,
    restaurantName = "{insert food business name}",
    onUpdate
}: InventoryUpdateItemModalProps) {
    const [incomingQuantity, setIncomingQuantity] = useState<string>("");
    const [newQuantity, setNewQuantity] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (item) {
            const incoming = parseFloat(incomingQuantity) || 0;
            const current = typeof item.currentStock === 'number' ? item.currentStock : parseFloat(item.currentStock as any) || 0;
            setNewQuantity(current + incoming);
        }
    }, [incomingQuantity, item]);

    if (!item) return null;

    const handleConfirm = async () => {
        if (!incomingQuantity) return;
        
        setIsSubmitting(true);
        try {
            await restaurantOpsService.updateItemStock(item.id, newQuantity);
            toast({
                title: "Stock Updated Successfully",
                description: `${item.name} quantity updated from ${item.currentStock}${item.unit} to ${newQuantity}${item.unit}.`
            });
            onUpdate?.();
            onOpenChange(false);
            setIncomingQuantity("");
        } catch (err) {
            toast({
                title: "Update Failed",
                description: "Failed to update stock level. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl rounded-[28px] p-0 border-none shadow-2xl overflow-hidden bg-white font-figtree">
                <div className="p-8 md:p-10 space-y-8">
                    <div className="space-y-1">
                        <DialogTitle className="text-[28px] font-bold text-[#1E293B] tracking-tight">Update Item</DialogTitle>
                        <p className="text-[13px] font-medium text-slate-400">
                            Manually adjust the inventory level for <span className="text-slate-900 font-bold">{restaurantName}</span>
                        </p>
                    </div>

                    {/* Product Preview Card */}
                    <div className="bg-[#F8FAFF] border border-indigo-100/50 rounded-[20px] p-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="h-20 w-20 rounded-xl overflow-hidden border border-white bg-white shrink-0 shadow-sm">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-200">
                                        <Package className="h-10 w-10" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-xl font-bold text-[#1E293B] tracking-tight">{item.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {item.sku || '001ABC'}</span>
                                    <Badge className="bg-white text-indigo-500 font-bold text-[9px] px-2 py-0.5 rounded-md border-indigo-50">
                                        {item.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current</p>
                            <p className="text-2xl font-bold text-[#1E293B] tabular-nums">{item.currentStock} <span className="text-sm font-bold text-slate-400 uppercase">{item.unit}</span></p>
                        </div>
                    </div>

                    {/* Inputs Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Incoming</label>
                            <Input 
                                type="number"
                                placeholder={`0 ${item.unit}`}
                                value={incomingQuantity}
                                onChange={(e) => setIncomingQuantity(e.target.value)}
                                className="h-14 rounded-xl border-slate-100 bg-slate-50/50 px-6 font-bold text-[#1E293B] text-lg focus-visible:ring-indigo-100 placeholder:text-slate-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest ml-1">New Total</label>
                            <div className="relative">
                                <Input 
                                    readOnly
                                    value={`${newQuantity} ${item.unit}`}
                                    className="h-14 rounded-xl border-emerald-100 bg-white px-6 font-bold text-[#1E293B] text-lg focus-visible:ring-emerald-50 shadow-sm"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                    <Check className="h-3 w-3 stroke-[3px]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Info Box */}
                    <div className="border border-indigo-100/50 rounded-xl p-4 bg-indigo-50/30 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#3B59DA] shadow-sm shrink-0">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                        <p className="text-[13px] font-bold text-slate-500">
                            Updating stock from <span className="text-[#1E293B] font-black">{item.currentStock}</span> to 
                            <span className="text-[#3B59DA] font-black ml-1.5">{newQuantity} {item.unit}</span>
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-4 pt-2">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            disabled={isSubmitting || !incomingQuantity}
                            className={cn(
                                "flex-1 h-12 rounded-xl font-bold text-sm shadow-xl transition-all border-none text-white",
                                incomingQuantity ? "bg-[#3B59DA] hover:bg-[#2D46B2] shadow-indigo-900/10" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
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
