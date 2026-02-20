"use client";

import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { DayState } from "@/lib/dayLifecycle/types";
import { toast } from "sonner";

export function useRestaurantDayActionGuard() {
  const { status } = useRestaurantDayLifecycle();

  const guardAction = <T,>(action: () => T, actionName?: string): T | undefined => {
    if (status?.state !== DayState.OPEN) {
      toast.error(
        actionName 
          ? `You must open the day first to ${actionName}.` 
          : "You must open the day first."
      );
      return undefined;
    }
    return action();
  };

  return { 
    guardAction,
    isLocked: status?.state !== DayState.OPEN,
    state: status?.state
  };
}
