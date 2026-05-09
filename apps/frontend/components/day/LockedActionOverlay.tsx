"use client";

import React from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRestaurantDayLifecycle } from "./RestaurantDayLifecycleProvider";

interface LockedActionOverlayProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function LockedActionOverlay({ 
  children, 
  label = "Open the day to use this action", 
  className,
  disabled 
}: LockedActionOverlayProps) {
  const { isOpen, isUserUnlocked } = useRestaurantDayLifecycle();
  
  // If explicitly disabled (even if day is open) or if the day is closed, we "lock" it
  // UNLESS the user has manually unlocked for viewing
  const isLocked = (!isOpen && !isUserUnlocked) || disabled;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      toast.error("Action Locked", {
        description: label,
        icon: <Lock className="h-4 w-4 text-[#EF4444]" />
      });
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "relative rounded-inherit transition-all",
        isLocked && "cursor-not-allowed",
        className
      )}
    >
      <div className={cn(
        "transition-all",
        isLocked && "pointer-events-none opacity-60 grayscale-[0.5]"
      )}>
        {children}
      </div>
      
      {/* Subtle lock indicator on top right if locked */}
      {isLocked && (
        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center shadow-sm z-10">
          <Lock className="h-3 w-3 text-slate-400" />
        </div>
      )}
    </div>
  );
}
