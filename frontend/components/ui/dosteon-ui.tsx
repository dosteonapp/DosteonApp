"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { X, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";

/**
 * DOS 01: Typography Contract
 * Inria Serif -> TITLES
 * Figtree -> BODY/UI
 */
export const InriaHeading = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={cn("font-inria tracking-tight text-[#1E293B]", className)} {...props}>
    {children}
  </h1>
);

export const FigtreeText = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("font-figtree text-slate-500", className)} {...props}>
    {children}
  </p>
);

/**
 * DOS 02: Spacing & Grid Layout
 */
export const AppContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("w-full space-y-10 md:space-y-12", className)}>
    {children}
  </div>
);

/**
 * DOS 03: Surface Standard
 * rounded-[28px] + Shadow-2xl
 */
export const PrimarySurfaceCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white border border-slate-100 rounded-[28px] shadow-[0_12px_44px_rgba(0,0,0,0.03)] overflow-hidden", className)}>
    {children}
  </div>
);

/**
 * DOS 04: Stat Card System (Identical Height & Spacing)
 */
export const UnifiedStatCard = ({ 
  label, 
  value, 
  subtext, 
  icon: Icon, 
  variant = 'indigo',
  className 
}: { 
  label: string, 
  value: string | number, 
  subtext?: string, 
  icon: any, 
  variant?: 'indigo' | 'green' | 'red' | 'amber' | 'neutral',
  className?: string
}) => {
  const colors = {
    indigo: "bg-[#F8F9FF] text-[#3B59DA] border-[#D0D7FF]/50",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
    red: "bg-rose-50 text-rose-600 border-rose-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100/50",
    neutral: "bg-slate-50 text-slate-400 border-slate-100"
  };

  return (
    <div className={cn(
      "bg-white rounded-[20px] p-4 pt-4 pb-2 h-[112px] border border-slate-100 transition-all font-figtree w-full min-w-0 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] active:scale-[0.98] flex flex-col gap-2",
      className
    )}>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shadow-sm", colors[variant])}>
          <Icon className="h-4 w-4 stroke-[2.5px]" />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-tight line-clamp-1">{label}</span>
      </div>
      <div className="flex items-baseline justify-between overflow-hidden">
        <div className={cn("text-[32px] md:text-[34px] font-black tracking-tighter leading-none truncate", variant === 'neutral' ? "text-[#1E293B]" : colors[variant].split(' ')[1])}>
          {value}
        </div>
        {subtext && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate opacity-60 pb-0.5">{subtext}</div>}
      </div>
    </div>
  );
};

/**
 * DOS 05: Hero Surface (Locked vs Unlocked)
 */
export const UnifiedHeroSurface = ({ 
  title, 
  subtitle, 
  children, 
  badge, 
  action,
  isLocked = false,
  className 
}: { 
  title: string, 
  subtitle: string, 
  children?: React.ReactNode, 
  badge?: React.ReactNode, 
  action?: React.ReactNode,
  isLocked?: boolean,
  className?: string
}) => {
  return (
    <div className={cn(
      "relative rounded-[28px] p-8 md:px-12 md:py-10 border transition-all duration-700 w-full min-h-[380px] flex items-center",
      isLocked 
        ? "bg-gradient-to-br from-[#3B59DA] via-[#7C3AED] to-[#1E3A8A] border-indigo-400/20 text-white shadow-2xl" 
        : "bg-white border-indigo-100 text-[#1E293B] shadow-sm",
      className
    )}>
      {/* Background Decor */}
      {isLocked && (
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.1] z-0">
           <div className="absolute -top-1/4 -right-1/4 w-[900px] h-[900px] bg-white rounded-full blur-[160px]" />
           <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-300 rounded-full blur-[140px]" />
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-center justify-between gap-8 w-full z-10">
          <div className="space-y-8 flex flex-col justify-center text-left max-w-lg shrink-0">
             <div className="space-y-4">
                {badge && <div className="w-fit">{badge}</div>}
                <InriaHeading className={cn("text-[38px] md:text-[42px] lg:text-[44px] leading-[1.1] font-bold tracking-tight", isLocked && "text-white")}>{title}</InriaHeading>
                <FigtreeText className={cn("text-[15px] md:text-[16px] font-semibold leading-relaxed max-w-sm ml-0.5", isLocked && "text-white/80")}>{subtitle}</FigtreeText>
             </div>
             {action && <div className="mt-2">{action}</div>}
          </div>
          {children && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 w-full items-center">
                {children}
            </div>
          )}
      </div>
    </div>
  );
};

/**
 * DOS 06: List Row Card (Consistency check for Inventory/Closing/Kitchen)
 */
export const UnifiedListRow = ({ 
  children, 
  className,
  onClick 
}: { 
  children: React.ReactNode, 
  className?: string,
  onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className={cn(
      "p-6 md:p-8 bg-white border border-slate-100 rounded-[24px] flex flex-col xl:flex-row items-center justify-between gap-8 transition-all group hover:border-[#3B59DA]/20 hover:shadow-md cursor-pointer",
      className
    )}
  >
    {children}
  </div>
);

/**
 * DOS 07: Standardized Modal System
 */
export const UnifiedModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer,
  className 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  subtitle?: React.ReactNode, 
  children: React.ReactNode, 
  footer: React.ReactNode,
  className?: string
}) => (
  <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
    <DialogContent className={cn("w-[95vw] sm:max-w-[800px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white font-figtree", className)}>
      <div className="p-8 sm:p-12 space-y-10">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 text-left">
          <div className="space-y-2 pr-4">
            <DialogTitle className="text-[28px] sm:text-[36px] font-black text-[#1E293B] font-inria tracking-tight leading-tight">{title}</DialogTitle>
            {subtitle && <FigtreeText className="text-[15px] sm:text-[17px] font-semibold leading-relaxed">{subtitle}</FigtreeText>}
          </div>
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-slate-50 text-slate-300 shrink-0" onClick={onClose}>
            <X className="h-7 w-7" />
          </Button>
        </DialogHeader>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          {children}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-5 pt-8 border-t border-slate-50">
           {footer}
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
);
