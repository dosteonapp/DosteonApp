"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  Package, 
  AlertTriangle,
  Clock,
  Droplets,
  ThumbsDown,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FigtreeText, InriaHeading } from "@/components/ui/dosteon-ui";
import { InventoryItem } from "@/lib/services/restaurantOpsService";

interface KitchenLogModalsProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
    type: 'usage' | 'waste';
    isSubmitting: boolean;
    onSubmit: (amount: number, reason?: string) => void;
}

export function KitchenLogModals({
    isOpen,
    onClose,
    item,
    type,
    isSubmitting,
    onSubmit
}: KitchenLogModalsProps) {
    const [amount, setAmount] = useState<number>(0);
    const [wasteReason, setWasteReason] = useState<'Expired' | 'Spilled' | 'Quality' | null>(null);

    useEffect(() => {
        if (isOpen) {
            setAmount(0);
            setWasteReason(null);
        }
    }, [isOpen, type]);

    if (!item) return null;

    const isUsage = type === 'usage';
    
    // Status color mapping
    const getStatusColors = (status: string) => {
        switch (status) {
            case 'Healthy': return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case 'Low': return "bg-amber-50 text-amber-600 border-amber-100";
            case 'Critical': return "bg-rose-50 text-rose-600 border-rose-100";
            default: return "bg-slate-50 text-slate-500 border-slate-100";
        }
    };

    const handleIncrement = () => setAmount(prev => +(prev + 0.5).toFixed(2));
    const handleDecrement = () => setAmount(prev => prev > 0 ? +(prev - 0.5).toFixed(2) : 0);

    const handleConfirm = () => {
        if (amount <= 0) return;
        if (!isUsage && !wasteReason) return;
        onSubmit(amount, isUsage ? undefined : wasteReason as string);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-[480px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl bg-white font-figtree [&>button]:hidden">
                {/* Header */}
                <div className={cn(
                    "p-8 pt-10 pb-12 relative flex flex-col items-center text-white",
                    isUsage ? "bg-[#1A237E]" : "bg-[#8B0000]"
                )}>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-none"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <DialogTitle asChild>
                        <InriaHeading className="text-[32px] font-black text-white mb-2 leading-none">
                            {isUsage ? "Log Usage" : "Log Wastage"}
                        </InriaHeading>
                    </DialogTitle>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 bg-white relative z-10">
                    {/* Item Info Card */}
                    <div className="flex flex-col items-center space-y-2">
                        <h3 className="text-[20px] font-bold text-[#1E293B] font-figtree">{item.name}</h3>
                        <div className="flex items-center gap-2">
                            <DialogDescription asChild>
                                <FigtreeText className="text-[14px] font-medium text-slate-400">
                                    ({item.currentStock} {item.unit} remaining)
                                </FigtreeText>
                            </DialogDescription>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <Badge className={cn(
                                "border-none shadow-none rounded-lg font-bold text-[10px] px-2 py-0.5 uppercase tracking-tight",
                                getStatusColors(item.status)
                            )}>
                                {item.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Waste Reason Selection */}
                    {!isUsage && (
                        <div className="space-y-4">
                            <FigtreeText className="text-[13px] font-bold text-slate-400 text-center">
                                Log Waste Reason
                                <span className="block font-medium text-[12px] opacity-70 mt-1">Choose why is this item being discarded</span>
                            </FigtreeText>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'Expired', icon: Clock, color: 'rose' },
                                    { id: 'Spilled', icon: Droplets, color: 'rose' },
                                    { id: 'Quality', icon: ThumbsDown, color: 'rose' }
                                ].map((reason) => (
                                    <button
                                        key={reason.id}
                                        onClick={() => setWasteReason(reason.id as any)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-[20px] border transition-all duration-200",
                                            wasteReason === reason.id 
                                                ? "bg-rose-50 border-rose-500 ring-1 ring-rose-500" 
                                                : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                                        )}
                                    >
                                        <reason.icon className={cn(
                                            "h-5 w-5",
                                            wasteReason === reason.id ? "text-rose-600" : "text-slate-400"
                                        )} />
                                        <span className={cn(
                                            "text-[12px] font-bold",
                                            wasteReason === reason.id ? "text-rose-600" : "text-slate-500"
                                        )}>{reason.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity Input Area */}
                    <div className="space-y-4">
                        <FigtreeText className="text-[13px] font-bold text-slate-400 text-center uppercase tracking-wider">
                            Enter Amount
                        </FigtreeText>
                        <div className="flex items-center justify-between gap-4">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={handleDecrement}
                                className={cn(
                                    "h-12 w-12 rounded-xl border-slate-100 shadow-sm transition-all active:scale-95",
                                    isUsage ? "hover:bg-blue-50 text-[#3B59DA]" : "hover:bg-rose-50 text-rose-500"
                                )}
                            >
                                <Minus className="h-5 w-5" />
                            </Button>
                            
                            <div className="flex-1 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center px-4">
                                <span className="text-[28px] font-black text-[#1E293B]">{amount}</span>
                                <span className="ml-2 text-[16px] font-bold text-slate-400">{item.unit}</span>
                            </div>

                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={handleIncrement}
                                className={cn(
                                    "h-12 w-12 rounded-xl border-none shadow-sm transition-all active:scale-95 text-white",
                                    isUsage ? "bg-[#3B59DA] hover:bg-blue-700" : "bg-rose-500 hover:bg-rose-600"
                                )}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-8 pt-0 flex flex-row gap-4 sm:justify-between sm:space-x-0">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="flex-1 h-14 rounded-2xl font-bold text-slate-400 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={isSubmitting || amount <= 0 || (!isUsage && !wasteReason)}
                        className={cn(
                            "flex-[1.5] h-14 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95",
                            isUsage ? "bg-[#3B59DA] hover:bg-blue-700 shadow-blue-500/10" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10"
                        )}
                    >
                        {isSubmitting ? "Processing..." : (isUsage ? "Confirm Usage" : "Confirm Wastage")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

