"use client";

import React from "react";
import { useRestaurantDayLifecycle } from "./RestaurantDayLifecycleProvider";
import { DayState } from "@/lib/dayLifecycle/types";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const DayStatusBadge = () => {
  const { status } = useRestaurantDayLifecycle();

  if (!status) return null;

  const state = status.state;

  const configMap: Record<DayState, { label: string, icon: any, className: string }> = {
    [DayState.PRE_OPEN]: {
      label: "Pre-Open",
      icon: Clock,
      className: "bg-slate-100 text-slate-500 border-slate-200",
    },
    [DayState.OPENING_IN_PROGRESS]: {
      label: "Opening",
      icon: Circle,
      className: "bg-amber-50 text-amber-600 border-amber-200 animate-pulse",
    },
    [DayState.OPEN]: {
      label: "Open / Active",
      icon: CheckCircle2,
      className: "bg-green-50 text-green-600 border-green-200",
    },
    [DayState.CLOSING_IN_PROGRESS]: {
      label: "Closing",
      icon: Circle,
      className: "bg-orange-50 text-orange-600 border-orange-200 animate-pulse",
    },
    [DayState.CLOSED]: {
      label: "Closed",
      icon: Lock,
      className: "bg-red-50 text-red-600 border-red-200",
    },
  };

  const config = configMap[state] || configMap[DayState.PRE_OPEN];

  const Icon = config.icon;

  return (
    <Badge className={cn("px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-black shadow-sm transition-all border", config.className)}>
      <Icon className="h-3 w-3 stroke-[3px]" />
      {config.label}
    </Badge>
  );
};
