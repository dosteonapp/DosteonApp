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
            <DialogContent className="sm:max-w-3xl rounded-[32px] p-0 border-none shadow-2xl overflow-hidden bg-white">
                <div className="relative p-12 space-y-10">
                    <button 
                        onClick={() => onOpenChange(false)}
                        className="absolute right-10 top-10 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <div className="space-y-1">
                        <DialogTitle className="text-[32px] font-black text-[#1E293B] tracking-tight">Update Item</DialogTitle>
                        <p className="text-sm font-bold text-slate-400">
                            Manually adjust the inventory level for <span className="text-slate-900 font-extrabold">{restaurantName}</span>
                        </p>
                    </div>

                    {/* Product Preview Card */}
                    <div className="bg-white border border-slate-100 rounded-[24px] p-8 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="h-24 w-24 rounded-2xl overflow-hidden border border-slate-50 bg-slate-50 shrink-0">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                        <Package className="h-10 w-10" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-[#1E293B] tracking-tight">{item.name}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SKU ID: {item.sku || '001ABC'}</span>
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[11px] px-4 py-1 rounded-full">
                                        {item.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-sm font-bold text-slate-400">Current Quantity</p>
                            <p className="text-[28px] font-black text-[#1E293B] tabular-nums">{item.currentStock} <span className="text-lg font-bold text-slate-400 uppercase">{item.unit}</span></p>
                        </div>
                    </div>

                    {/* Inputs Row */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[14px] font-bold text-slate-500 ml-1">Incoming Quantity</label>
                            <Input 
                                type="number"
                                placeholder={`0 ${item.unit}`}
                                value={incomingQuantity}
                                onChange={(e) => setIncomingQuantity(e.target.value)}
                                className="h-[76px] rounded-[24px] border-slate-100 bg-[#F8FAFC] px-8 font-black text-[#1E293B] text-xl focus-visible:ring-indigo-100 placeholder:text-slate-300"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[14px] font-bold text-emerald-500 ml-1">New Quantity</label>
                            <div className="relative">
                                <Input 
                                    readOnly
                                    value={`${newQuantity} ${item.unit}`}
                                    className="h-[76px] rounded-[24px] border-emerald-500 bg-white px-8 font-black text-[#1E293B] text-xl focus-visible:ring-emerald-100"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                    <Check className="h-4 w-4 stroke-[4px]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Info Box */}
                    <div className="border-2 border-dashed border-[#E0E7FF] rounded-[20px] p-6 bg-[#F8FAFF] flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white border border-[#E0E7FF] flex items-center justify-center text-[#3B59DA] shadow-sm">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                        <p className="text-base font-bold text-slate-500 leading-none">
                            Stock will update from <span className="text-[#1E293B] font-black">{item.currentStock} {item.unit}</span> to 
                            <span className="text-[#3B59DA] font-black ml-1.5">{newQuantity} {item.unit}</span>
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-6 pt-4">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-[76px] rounded-[24px] border-slate-200 font-black text-lg text-slate-500 hover:bg-slate-50 transition-all"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            disabled={isSubmitting || !incomingQuantity}
                            className={cn(
                                "flex-1 h-[76px] rounded-[24px] font-black text-lg shadow-[0_20px_50px_rgba(59,89,218,0.2)] transition-all border-none text-white",
                                incomingQuantity ? "bg-[#3B59DA] hover:bg-[#2D46B2]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                            onClick={handleConfirm}
                        >
                            {isSubmitting ? "Updating Registry..." : "Confirm Update"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
