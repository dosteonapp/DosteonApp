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
            <DialogContent className="sm:max-w-3xl rounded-[10px] p-0 border-none shadow-2xl overflow-hidden bg-white font-figtree [&>button]:hidden">
                {/* Header */}
                <div className="px-8 md:px-12 py-8 border-b border-slate-50 relative">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-[28px] md:text-[32px] font-bold text-[#1E293B] tracking-tight font-figtree">Update Item</DialogTitle>
                            <p className="text-[14px] font-medium text-slate-400 font-figtree">
                                Manually adjust the inventory level for <span className="text-[#1E293B] font-bold">{restaurantName}</span>
                            </p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-full hover:bg-slate-50 text-slate-400 transition-all"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-7 w-7" />
                        </Button>
                    </div>
                </div>

                <div className="px-8 md:px-12 py-10 space-y-10">

                    {/* Product Preview Card */}
                    <div className="bg-white border border-slate-100 rounded-[10px] p-8 flex items-center justify-between shadow-sm group">
                        <div className="flex items-center gap-8">
                            <div className="h-32 w-32 rounded-[8px] overflow-hidden border border-slate-50 bg-white shrink-0 shadow-lg transition-transform group-hover:scale-105 duration-500">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-100">
                                        <Package className="h-14 w-14" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-[28px] font-bold text-[#1E293B] tracking-tight font-figtree group-hover:text-[#3B59DA] transition-colors">{item.name}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest font-figtree leading-none">SKU ID: {item.sku || '001ABC'}</span>
                                    <span className="text-slate-200 text-xs font-bold leading-none">•</span>
                                    <Badge variant="outline" className="text-slate-500 font-bold text-[11px] px-4 py-1.5 rounded-[6px] border-slate-200 shadow-none font-figtree">
                                        {item.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest font-figtree mb-2">Current Quantity</p>
                            <p className="text-[36px] font-black text-[#1E293B] tabular-nums font-figtree tracking-tighter leading-none">{item.currentStock} <span className="text-[20px] font-bold text-slate-400 ml-1">{item.unit}</span></p>
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
                                className="h-16 rounded-[8px] border-slate-100 bg-white px-8 font-bold text-[#1E293B] text-xl focus-visible:ring-indigo-50 placeholder:text-slate-300 shadow-sm font-figtree transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[13px] font-bold text-[#10B981] font-figtree ml-1">New Quantity</label>
                            <div className="relative">
                                <Input 
                                    readOnly
                                    value={`${newQuantity} ${item.unit}`}
                                    className="h-16 rounded-[8px] border-[#10B981]/30 bg-white px-8 font-bold text-[#1E293B] text-xl shadow-sm font-figtree transition-all"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981]">
                                    <Check className="h-4 w-4 stroke-[3px]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Info Box */}
                    <div className="border border-dashed border-[#3B59DA]/30 rounded-[8px] p-6 bg-[#f8faff] flex items-center gap-5 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#3B59DA] shadow-md shrink-0 border border-[#3B59DA]/10 ring-4 ring-[#f5f8ff]">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                        <p className="text-[16px] font-bold text-slate-500 font-figtree">
                            Stock will update from <span className="text-slate-400">{item.currentStock} {item.unit}</span> to 
                            <span className="text-[#3B59DA] font-black ml-1.5">{newQuantity} {item.unit}</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 md:px-12 py-8 bg-slate-50/30 border-t border-slate-50">
                    <div className="flex items-center justify-end gap-6">
                        <Button 
                            variant="outline" 
                            className="h-16 px-12 rounded-[8px] border-slate-200 bg-white font-bold text-slate-500 hover:bg-slate-50 transition-all text-[17px] font-figtree shadow-sm active:scale-95"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            disabled={isSubmitting || !incomingQuantity}
                            className={cn(
                                "h-16 px-14 rounded-[8px] font-black text-[17px] shadow-2xl transition-all border-none text-white font-figtree active:scale-95",
                                incomingQuantity ? "bg-[#3B59DA] hover:bg-[#2D46B2] shadow-indigo-900/20" : "bg-slate-100 text-slate-300 cursor-not-allowed"
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
