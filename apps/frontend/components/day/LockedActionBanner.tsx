"use client";

import React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockedActionBannerProps {
  message: string;
  className?: string;
}

export function LockedActionBanner({ message, className }: LockedActionBannerProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs backdrop-blur-sm",
      className
    )}>
      <Lock className="h-3 w-3" />
      {message}
    </div>
  );
}
