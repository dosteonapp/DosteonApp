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
  <h1 className={cn("font-figtree tracking-tight text-[#1E293B]", className)} {...props}>
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
  <div className={cn("w-full space-y-8", className)}>
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

  const textColors = {
    indigo: "text-[#3B59DA]",
    green: "text-emerald-600",
    red: "text-rose-600",
    amber: "text-amber-600",
    neutral: "text-[#1E293B]"
  };

  return (
    <div className={cn(
      "bg-white rounded-[24px] p-5 md:p-7 min-h-[120px] border border-slate-100 transition-all font-figtree w-full min-w-0 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] active:scale-[0.98] flex flex-col justify-between overflow-hidden",
      className
    )}>
      <div className="flex items-center gap-3 shrink-0">
        <div className={cn("h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center shadow-sm shrink-0", colors[variant])}>
          <Icon className="h-4 w-4 md:h-5 md:w-5 stroke-[2px]" />
        </div>
        <span className="text-[12px] md:text-[14px] font-semibold text-slate-500 leading-tight line-clamp-1">{label}</span>
      </div>

      <div className="flex flex-col gap-2 py-2">
        <div className={cn(
        "relative z-10 w-full flex flex-col h-full",
        textColors[variant], // This was originally textColors[variant]
        "font-semibold tracking-tight leading-none",
        "text-[18px] md:text-[20px]"
      )}>
          {value}
        </div>
        {subtext && (
          <div className="text-[12px] font-normal text-slate-400 leading-tight mt-1 line-clamp-1">
            {subtext}
          </div>
        )}
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
  description,
  children, 
  badge, 
  action,
  topAction,
  isLocked = false,
  className,
  size = 'default',
  alignItems = 'start',
  variant = 'standard',
  centerContent = false,
  centerStats = false,
  padding,
  minHeight,
  backgroundColor,
  borderColor,
  bgIcon
}: { 
  title: string, 
  subtitle?: string, 
  description?: string,
  children?: React.ReactNode, 
  badge?: React.ReactNode, 
  action?: React.ReactNode,
  topAction?: React.ReactNode,
  isLocked?: boolean,
  className?: string,
  size?: 'default' | 'dense',
  alignItems?: 'start' | 'center',
  variant?: 'standard' | 'split' | 'inline',
  centerContent?: boolean,
  centerStats?: boolean,
  padding?: string,
  minHeight?: string,
  backgroundColor?: string,
  borderColor?: string,
  bgIcon?: React.ReactNode
}) => {
  const isDense = size === 'dense';
  const isSplit = variant === 'split';
  const isInline = variant === 'inline';

  return (
    <div className={cn(
      "relative rounded-[28px] border transition-all duration-700 w-full flex overflow-hidden",
      padding ? padding : (isDense ? "p-4 md:p-6" : "p-6 md:p-10"),
      minHeight ? minHeight : (isDense ? "min-h-[300px]" : "min-h-[340px]"),
      isInline && !isDense && !padding && "lg:pr-6", // Getting that 24px right margin on desktop
      alignItems === 'center' ? "items-center" : "items-stretch",
      backgroundColor ? backgroundColor : (isLocked 
        ? "bg-gradient-to-br from-[#2E46BA] via-[#6366F1] to-[#7C3AED] text-white shadow-2xl" 
        : "bg-white text-[#1E293B] shadow-sm"),
      borderColor ? borderColor : (isLocked ? "border-white/10" : "border-indigo-100"),
      className
    )}>
      {/* Background Decor */}
      {isLocked && (
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0 overflow-hidden">
           <div className="absolute -top-1/4 -right-1/6 w-[600px] h-[600px] bg-white opacity-[0.1] rounded-full blur-[120px]" />
           <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-white/[0.05] to-transparent" />
           <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-200 opacity-[0.1] rounded-full blur-[140px]" />
           
           {/* Chef Hat / Background Icon Watermark */}
           {bgIcon && (
             <div className="absolute right-[5%] top-1/2 -translate-y-1/2 opacity-[0.07] scale-[2] pointer-events-none">
               {bgIcon}
             </div>
           )}
        </div>
      )}

      {/* Inline Layout (Kitchen/Home Style) */}
      {isInline ? (
        <div className={cn(
          "relative flex flex-col md:flex-row w-full flex-1 z-10 gap-5 md:gap-8 lg:gap-14",
          (alignItems === 'center' || isLocked) ? "items-center justify-center h-full" : (padding ? "items-start pt-0" : "items-start pt-2 md:pt-4")
        )}>
           {/* Section 1: Text */}
           <div className="flex flex-col space-y-4 max-w-[320px] shrink-0">
              <div className="space-y-3">
                 <h1 className={cn(
                   "font-figtree text-[18px] md:text-[20px] font-semibold tracking-tight leading-tight",
                   isLocked ? "text-white" : "text-[#1E293B]"
                 )}>{title}</h1>
                 {badge && <div className="w-fit">{badge}</div>}
              </div>
              
              {description && (
                <FigtreeText className={cn(
                  "font-normal leading-relaxed text-[12px] md:text-[14px]",
                  isLocked ? "text-white/60" : "text-slate-400"
                )}>{description}</FigtreeText>
              )}

              {action && <div className="w-fit pt-2">{action}</div>}
           </div>

           {/* Section 2: Cards next to text */}
           <div className={cn(
             "flex flex-col sm:flex-row flex-wrap gap-2 flex-1 justify-start",
             alignItems === 'center' ? "items-center" : "items-start"
           )}>
              {children}
           </div>

           {/* Section 3: Status Badge Fallback */}
           {topAction && (
             <div className="absolute top-6 right-6 md:top-8 md:right-10 z-20">
               {topAction}
             </div>
           )}
        </div>
      ) : (
        /* Standard & Split Layouts */
        <div className="relative flex flex-col justify-between w-full flex-1 z-10">
          
          {/* Row 1: Header (Title, Subtitle, Badge, TopAction) */}
          <div className={cn(
            "flex flex-col md:flex-row items-start justify-between w-full gap-8",
            padding ? "pt-0" : (isSplit ? "pt-12 md:pt-16" : "pt-2")
          )}>
             <div className="flex flex-col items-start space-y-3">
                <h1 className={cn(
                  "font-figtree leading-[1.1] font-semibold tracking-tight", 
                  "text-[18px] md:text-[20px]",
                  isLocked ? "text-white" : "text-[#1E293B]"
                )}>{title}</h1>
                
                {/* Standard Variant: Badge below title */}
                {!isSplit && badge && <div className="py-1">{badge}</div>}
                
                <FigtreeText className={cn(
                  "font-semibold leading-tight", 
                  "text-[14px]",
                  isLocked ? "text-white/60" : "text-slate-400"
                )}>{subtitle}</FigtreeText>
             </div>

             {/* Top Right Content */}
             {(topAction || (isSplit && badge)) && (
               <div className="flex items-center gap-3 shrink-0 pt-2">
                 {topAction}
                 {isSplit && badge && <div className="shrink-0">{badge}</div>}
               </div>
             )}
          </div>

          {/* Special Layer: Independent Centered Cards (Only if centerContent is true) */}
          {centerContent && !isSplit && children && (
            <div className="absolute inset-0 hidden lg:flex items-center justify-end pointer-events-none pr-10">
              <div className={cn(
                "flex flex-col sm:flex-row flex-wrap gap-4 pointer-events-auto",
                centerStats ? "justify-center" : "justify-end"
              )}>
                {children}
              </div>
            </div>
          )}

          {/* Row 2: Bottom Content Area (Description/Action on Left, Stats on Right) */}
          <div className={cn(
            "mt-auto flex flex-col lg:flex-row gap-10 w-full justify-between items-end",
            padding ? "pb-0 mb-0" : (isSplit ? "pb-4 mb-0" : "pb-4 mb-2")
          )}>
             {/* Left Bottom: Description and Action */}
             {(description || action) && (
                <div className={cn(
                  "flex flex-col space-y-6 shrink-0",
                  isSplit ? "mb-[50px] max-w-[180px] sm:max-w-xs" : (padding ? "max-w-xl mb-0" : "max-w-xl mb-2")
                )}>
                   {description && (
                      <FigtreeText className={cn(
                        "font-normal leading-relaxed text-[12px] md:text-[14px]", 
                        isLocked ? "text-white/80" : "text-slate-500"
                      )}>{description}</FigtreeText>
                   )}
                   {action && <div className="w-fit">{action}</div>}
                </div>
             )}

             {/* Right Bottom: Stat Cards (Only if NOT centered via absolute layer) */}
             {children && (!centerContent || isSplit) && (
                <div className={cn(
                  "flex flex-col sm:flex-row flex-wrap gap-4 flex-1 w-full lg:w-auto justify-start lg:justify-end items-end"
                )}>
                    {children}
                </div>
             )}
             
             {/* Mobile/Tablet Fallback for Centered Cards (stays in flow) */}
             {children && centerContent && !isSplit && (
                <div className="flex lg:hidden flex-col sm:flex-row flex-wrap gap-4 w-full justify-start items-end">
                    {children}
                </div>
             )}
          </div>
        </div>
      )}
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
            <DialogTitle className="text-[28px] sm:text-[36px] font-black text-[#1E293B] font-figtree tracking-tight leading-tight">{title}</DialogTitle>
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
