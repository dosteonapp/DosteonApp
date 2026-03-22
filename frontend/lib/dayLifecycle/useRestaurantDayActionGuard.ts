"use client";

import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { canPerformAction } from "@/lib/dayLifecycle/restaurantModuleAccess";
import { DayState } from "@/lib/dayLifecycle/types";
import { toast } from "@/hooks/use-toast";

export function useRestaurantDayActionGuard() {
  const { status } = useRestaurantDayLifecycle();

  const guardAction = <T,>(action: () => T, actionName?: string): T | undefined => {
    if (status) {
      const result = canPerformAction(actionName || "this action", status.state);
      if (!result.allowed) {
        toast({
          variant: "destructive",
          title: "Action blocked",
          description: result.message,
        });
        return undefined;
      }
    }
    return action();
  };

  return { 
    guardAction,
    isLocked: status?.state !== DayState.OPEN,
    state: status?.state
  };
}
