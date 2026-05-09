"use client";

import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { canPerformAction } from "@/lib/dayLifecycle/restaurantModuleAccess";
import { toast } from "@/hooks/use-toast";

export function useRestaurantDayActionGuard() {
  const { status } = useRestaurantDayLifecycle();

  const guard = (
    action: () => void, 
    options: { requiresOpen?: boolean; message?: string; actionName?: string } = {}
  ) => {
    if (!status) {
      action();
      return;
    }

    const { requiresOpen = true, message, actionName = "this action" } = options;

    if (requiresOpen) {
      const result = canPerformAction(actionName, status.state);
      if (!result.allowed) {
        toast({
          variant: "destructive",
          title: "Action blocked",
          description: message || result.message,
        });
        return;
      }
    }

    // If allowed, perform action
    action();
  };

  return { guard };
}
