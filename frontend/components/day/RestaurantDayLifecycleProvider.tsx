"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useRestaurantDayStatus } from "@/lib/dayLifecycle/useRestaurantDayStatus";

type DayLifecycleContextType = ReturnType<typeof useRestaurantDayStatus>;

const RestaurantDayLifecycleContext = createContext<DayLifecycleContextType & {
  isUserUnlocked: boolean;
  setIsUserUnlocked: (val: boolean) => void;
} | undefined>(undefined);

export function RestaurantDayLifecycleProvider({ children }: { children: ReactNode }) {
  const dayStatus = useRestaurantDayStatus();
  const [isUserUnlocked, setIsUserUnlocked] = React.useState(false);

  // If the day actually opens, reset the manual unlock
  React.useEffect(() => {
    if (dayStatus.isOpen) {
      setIsUserUnlocked(false);
    }
  }, [dayStatus.isOpen]);

  return (
    <RestaurantDayLifecycleContext.Provider value={{ ...dayStatus, isUserUnlocked, setIsUserUnlocked }}>
      {children}
    </RestaurantDayLifecycleContext.Provider>
  );
}

export function useRestaurantDayLifecycle() {
  const context = useContext(RestaurantDayLifecycleContext);
  if (context === undefined) {
    throw new Error("useRestaurantDayLifecycle must be used within a RestaurantDayLifecycleProvider");
  }
  return context;
}
