"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Search, 
  ChevronRight,
  Bell,
  Calendar as CalendarIcon,
  Search as SearchIcon,
  RotateCcw,
  CheckCircle2,
  Package,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { OpeningStockItem } from "@/mocks/openingStock.mock";
import { useToast } from "@/hooks/use-toast";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

export default function DailyStockCountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isLocked } = useRestaurantDayLifecycle();
  const [items, setItems] = useState<OpeningStockItem[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await restaurantOpsService.getOpeningChecklistItems();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch opening items:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConfirm = (id: string) => {
    setConfirmedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const handleSaveDraft = async () => {
    toast({
        title: "Draft Saved",
        description: "Your progress has been saved locally."
    });
  };

  const handleComplete = async () => {
    router.push("/dashboard/opening");
  };

  const progressCount = confirmedIds.size;
  const totalCount = items.length || 9; // Fallback to 9 as per design
  const progressPercent = Math.round((progressCount / totalCount) * 100);

  if (isLoading) return <OpeningSkeleton />;

  return (
    <div className="flex flex-col gap-10 bg-white min-h-screen pb-48">
      <div className="space-y-10 px-6 mt-6">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <Button 
                variant="outline" 
                className="h-12 px-6 rounded-2xl border-slate-200 bg-white font-black text-slate-500 gap-2 hover:bg-slate-50 shadow-sm transition-all w-fit"
                onClick={() => router.back()}
            >
                <ArrowRight className="h-4 w-4 rotate-180" /> Back to Dashboard
            </Button>
        </motion.div>

        {/* Progress Header Box - Premium Overhaul */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[56px] bg-[#1E293B] p-12 lg:p-16 flex flex-col xl:flex-row items-center gap-16 shadow-2xl shadow-indigo-500/10 relative overflow-hidden text-white"
        >
            {/* Animated Background Decor */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 45, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        x: [0, -30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px]" 
                />
            </div>
            
            <CircularProgress percentage={progressPercent} />
            
            <div className="space-y-8 flex-1 relative z-10 text-center xl:text-left">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                         <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                         <span className="text-[11px] font-black uppercase tracking-widest text-white/70 italic">Operations Registry</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-[56px] font-black tracking-tighter font-inria italic leading-none">Daily Asset Registry</h1>
                        <p className="text-xl font-bold text-slate-400 max-w-2xl mx-auto xl:mx-0">Verify physical stock levels to synchronize the digital infrastructure for today&apos;s service.</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-6 justify-center xl:justify-start">
                    <div className="bg-white/5 px-8 py-5 rounded-[28px] border border-white/10 backdrop-blur-md">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Completion Check</p>
                         <p className="text-3xl font-black text-white font-inria italic">{progressCount} <span className="text-slate-600 text-lg">/ {totalCount} Assets</span></p>
                    </div>
                    <div className="bg-white/5 px-8 py-5 rounded-[28px] border border-white/10 backdrop-blur-md">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Avg Validation Time</p>
                         <p className="text-3xl font-black text-white font-inria italic">4m 20s</p>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* List Grid Header */}
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-[#1E293B] tracking-tight font-inria italic">Pending Validations</h2>
                    <p className="text-sm font-bold text-slate-400">Inventory assets requiring manual verification</p>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                         <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                         <Input 
                            placeholder="Filter registry..." 
                            className="pl-14 h-16 rounded-[24px] border-slate-100 bg-white font-bold text-[#1E293B] focus-visible:ring-indigo-100 shadow-sm"
                         />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-16 lg:w-48 rounded-[24px] border-slate-100 bg-white font-black text-slate-500 hover:shadow-md transition-all">
                            <SelectValue placeholder="All Assets" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                            <SelectItem value="all">All Assets</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-20">
                <AnimatePresence mode="popLayout" initial={false}>
                    {items.map((item, idx) => (
                        <StockRow 
                            key={item.id} 
                            item={item} 
                            idx={idx}
                            isConfirmed={confirmedIds.has(item.id)}
                            onConfirm={() => handleConfirm(item.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </div>

      {/* Sticky Bottom Bar - Enhanced Glassmorphism */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-8 z-50">
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#1E293B]/95 backdrop-blur-3xl border border-white/10 rounded-[44px] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] flex items-center justify-between"
        >
            <Button 
                variant="ghost" 
                className="h-14 px-10 rounded-[20px] text-slate-400 hover:text-white hover:bg-white/5 font-black transition-all"
                onClick={handleSaveDraft}
            >
                Save Temporary Draft
            </Button>
            
            <div className="flex items-center gap-10">
                <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Synchronized State</p>
                    <p className="text-white font-black font-inria text-xl tracking-tight italic">{progressPercent}% Calibrated</p>
                </div>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button 
                        className={cn(
                            "h-18 px-14 rounded-[28px] font-black gap-3 transition-all border-none pr-10 group text-lg",
                            progressPercent === 100 
                                ? "bg-emerald-500 hover:bg-emerald-600 shadow-[0_20px_40px_-5px_rgba(16,185,129,0.3)]" 
                                : "bg-[#3B59DA] hover:bg-[#2D46B2] shadow-[0_20px_40px_-5px_rgba(59,89,218,0.3)]"
                        )}
                        onClick={handleComplete}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Finalizing Registry..." : "Finalize & Sign Entries"}
                        <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Button>
                </motion.div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}

function StockRow({ item, isConfirmed, onConfirm, idx }: { item: OpeningStockItem, isConfirmed: boolean, onConfirm: () => void, idx: number }) {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
                duration: 0.5, 
                delay: Math.min(idx * 0.08, 0.4),
                ease: [0.16, 1, 0.3, 1]
            }}
            className={cn(
                "rounded-[44px] border-2 p-10 flex flex-col xl:flex-row items-center justify-between gap-10 transition-all group relative overflow-hidden",
                isConfirmed 
                    ? "bg-emerald-50/10 border-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.04)]" 
                    : "bg-white border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            )}
        >
            <div className="flex items-center gap-10 w-full xl:w-auto self-start xl:self-center">
                <motion.button 
                    onClick={onConfirm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        "h-24 w-24 rounded-[36px] border-4 flex items-center justify-center transition-all shrink-0 relative overflow-hidden shadow-inner",
                        isConfirmed ? "bg-emerald-500 border-emerald-100 text-white shadow-xl shadow-emerald-500/20" : "bg-slate-50 border-white text-slate-200"
                    )}
                >
                    {isConfirmed ? (
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            className="flex items-center justify-center"
                        >
                            <CheckCircle2 className="h-12 w-12" />
                        </motion.div>
                    ) : (
                        <div className="h-4 w-4 rounded-full bg-slate-200" />
                    )}
                </motion.button>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="text-[28px] font-black text-[#1E293B] tracking-tight font-inria italic group-hover:text-[#3B59DA] transition-colors">{item.name}</h4>
                        <div className="flex items-center gap-3">
                             <Badge variant="secondary" className="bg-slate-50 text-slate-400 font-bold border border-slate-100 px-4 py-1 rounded-xl uppercase tracking-wider text-[10px]">Beverage Asset</Badge>
                             <span className="h-1 w-1 rounded-full bg-slate-200" />
                             <p className="text-xs font-black text-slate-300 font-mono tracking-widest uppercase">ID: {item.id.split('-')[0].toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 gap-y-10 w-full xl:w-auto px-6 border-l-2 border-slate-50/50 xl:ml-auto">
                <StatSlot label="Prior Exit" value="10 units" />
                <StatSlot label="Physical Entry" value="10 units" />
                <StatSlot label="Operational Gain" value="--" italic />
                <StatSlot label="Total Liquidity" value="10 units" valueColor="text-[#3B59DA]" />
            </div>

            <div className="flex items-center gap-6 w-full xl:w-auto justify-end pt-6 xl:pt-0 border-t xl:border-none border-slate-50">
                <Button variant="ghost" className="h-16 px-10 rounded-[28px] font-black text-slate-400 hover:text-[#3B59DA] hover:bg-indigo-50 transition-all font-inria text-lg italic">Modify</Button>
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Button 
                        className={cn(
                            "h-16 px-12 rounded-[28px] font-black transition-all font-inria text-xl italic group/btn",
                            isConfirmed 
                                ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-100" 
                                : "bg-[#1E293B] hover:bg-[#0F172A] text-white shadow-xl shadow-slate-900/10 border-none"
                        )}
                        onClick={onConfirm}
                    >
                        {isConfirmed ? (
                            <span className="flex items-center gap-2">Signed <CheckCircle2 className="h-5 w-5" /></span>
                        ) : "Validate Asset"}
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}

function StatSlot({ label, value, valueColor = "text-slate-900", italic = false }: { label: string, value: string, valueColor?: string, italic?: boolean }) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">{label}</p>
            <p className={cn("text-2xl font-black tracking-tighter font-inria group-hover:scale-105 transition-transform origin-left", valueColor, italic && "italic opacity-30")}>{value}</p>
        </div>
    );
}

function CircularProgress({ percentage }: { percentage: number }) {
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative h-48 w-48 flex items-center justify-center bg-white/5 rounded-[48px] shadow-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
            <svg className="h-40 w-40 -rotate-90 overflow-visible">
                {/* Background path */}
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-white/5"
                />
                {/* Progress path */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    className="text-indigo-500"
                    strokeLinecap="round"
                    style={{
                        filter: "drop-shadow(0 0 12px rgba(99, 102, 241, 0.8))"
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[44px] font-black text-white font-inria italic leading-none">{percentage}%</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Status</span>
            </div>
        </div>
    );
}

function OpeningSkeleton() {
    return (
        <div className="p-10 space-y-12 bg-[#F8FAFC] min-h-screen">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-[280px] w-full rounded-[48px]" />
            <div className="space-y-6">
                 <Skeleton className="h-32 w-full rounded-[32px]" />
                 <Skeleton className="h-32 w-full rounded-[32px]" />
                 <Skeleton className="h-32 w-full rounded-[32px]" />
            </div>
        </div>
    );
}
