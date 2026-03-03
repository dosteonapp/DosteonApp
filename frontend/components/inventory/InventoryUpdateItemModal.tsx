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
                <div className="p-8 md:p-10 space-y-10">
                    <div className="space-y-1.5 flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-[32px] font-bold text-[#1E293B] tracking-tight font-inria">Update Item</DialogTitle>
                            <p className="text-[13px] font-medium text-slate-400 font-figtree">
                                Manually adjust the inventory level for <span className="text-[#3B59DA] font-bold">{restaurantName}</span>
                            </p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-full hover:bg-slate-50 text-slate-400 transition-all"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Product Preview Card */}
                    <div className="bg-[#FBFDFF] border border-slate-100 rounded-[28px] p-8 flex items-center justify-between shadow-sm group">
                        <div className="flex items-center gap-8">
                            <div className="h-28 w-28 rounded-[20px] overflow-hidden border border-white bg-white shrink-0 shadow-xl transition-transform group-hover:scale-105 duration-500">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-200">
                                        <Package className="h-14 w-14" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-[28px] font-bold text-[#1E293B] tracking-tight font-inria group-hover:text-[#3B59DA] transition-colors">{item.name}</h4>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-figtree">SKU ID: {item.sku || '001ABC'}</span>
                                    <span className="text-slate-200 text-xs font-bold">•</span>
                                    <Badge className="bg-white text-slate-500 font-bold text-[10px] px-4 py-1.5 rounded-xl border border-slate-100 shadow-sm font-figtree">
                                        {item.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-figtree">Current Quantity</p>
                            <p className="text-[34px] font-bold text-[#1E293B] tabular-nums font-figtree tracking-tighter">{item.currentStock} <span className="text-sm font-bold text-slate-400 uppercase ml-1">{item.unit}</span></p>
                        </div>
                    </div>

                    {/* Inputs Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[13px] font-bold text-slate-400 font-figtree ml-1">Incoming Quantity</label>
                            <Input 
                                type="number"
                                placeholder={`${item.currentStock} ${item.unit}`}
                                value={incomingQuantity}
                                onChange={(e) => setIncomingQuantity(e.target.value)}
                                className="h-16 rounded-[18px] border-slate-100 bg-white px-8 font-bold text-[#1E293B] text-xl focus-visible:ring-indigo-50 placeholder:text-slate-300 shadow-sm font-figtree transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[13px] font-bold text-[#10B981] font-figtree ml-1">New Quantity</label>
                            <div className="relative">
                                <Input 
                                    readOnly
                                    value={`${newQuantity} ${item.unit}`}
                                    className="h-16 rounded-[18px] border-[#10B981]/30 bg-white px-8 font-bold text-[#1E293B] text-xl shadow-sm font-figtree transition-all"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981]">
                                    <Check className="h-4 w-4 stroke-[3px]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Info Box */}
                    <div className="border border-dashed border-[#3B59DA]/20 rounded-[18px] p-6 bg-[#F5F8FF] flex items-center gap-5 shadow-inner">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#3B59DA] shadow-md shrink-0 border border-[#3B59DA]/10">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                        <p className="text-[15px] font-semibold text-slate-500 font-figtree">
                            Stock will update from <span className="text-[#1E293B] font-bold">{item.currentStock} {item.unit}</span> to 
                            <span className="text-[#3B59DA] font-extrabold ml-1.5">{newQuantity} {item.unit}</span>
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-6 pt-4">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-16 rounded-[18px] border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all text-base font-figtree shadow-sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            disabled={isSubmitting || !incomingQuantity}
                            className={cn(
                                "flex-1 h-16 rounded-[18px] font-bold text-base shadow-2xl transition-all border-none text-white font-figtree active:scale-95",
                                incomingQuantity ? "bg-[#3B59DA] hover:bg-[#2D46B2] shadow-indigo-900/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"
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
