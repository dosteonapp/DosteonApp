"use client";

import React from "react";

export function RestaurantDayRouteGuard({ children }: { children: React.ReactNode }) {
  // Navigation is always allowed. Each page renders its own locked-state UI.
  return <>{children}</>;
}
