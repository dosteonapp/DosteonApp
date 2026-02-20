import { DayState } from "./types";

export interface ModuleAccess {
  path: string;
  allowReadOnly: boolean;
  requiresOpen: boolean;
  hasCustomLockedUI?: boolean;
}

export const RESTAURANT_MODULE_CONFIG: Record<string, ModuleAccess> = {
  "/dashboard": { path: "/dashboard", allowReadOnly: true, requiresOpen: false, hasCustomLockedUI: true },
  "/dashboard/kitchen-service": { path: "/dashboard/kitchen-service", allowReadOnly: true, requiresOpen: true, hasCustomLockedUI: true },
  "/dashboard/inventory": { path: "/dashboard/inventory", allowReadOnly: true, requiresOpen: true, hasCustomLockedUI: true },
  "/dashboard/closing": { path: "/dashboard/closing", allowReadOnly: true, requiresOpen: true, hasCustomLockedUI: true },
  "/dashboard/orders": { path: "/dashboard/orders", allowReadOnly: false, requiresOpen: true },
  "/dashboard/finance": { path: "/dashboard/finance", allowReadOnly: false, requiresOpen: true },
  "/dashboard/analytics": { path: "/dashboard/analytics", allowReadOnly: true, requiresOpen: false },
};

export function isModuleLocked(path: string, state: DayState): boolean {
  if (state === DayState.OPEN) return false;

  const config = getModuleConfig(path);
  if (!config) return false;

  return config.requiresOpen;
}

export function shouldBlockModuleAccess(path: string, state: DayState): boolean {
  if (state === DayState.OPEN) return false;

  const config = getModuleConfig(path);
  if (!config) return false;

  if (config.hasCustomLockedUI) return false;

  return config.requiresOpen && !config.allowReadOnly;
}

function getModuleConfig(path: string): ModuleAccess | undefined {
  return Object.values(RESTAURANT_MODULE_CONFIG).find(
    (c) => path === c.path || path.startsWith(c.path + "/")
  );
}

export function canPerformAction(actionType: string, state: DayState): { allowed: boolean; message?: string } {
  if (state === DayState.OPEN) return { allowed: true };

  const blockedStates = [DayState.PRE_OPEN, DayState.OPENING_IN_PROGRESS, DayState.CLOSING_IN_PROGRESS, DayState.CLOSED];
  
  if (blockedStates.includes(state)) {
    return { 
      allowed: false, 
      message: `Open the day to perform ${actionType}.` 
    };
  }

  return { allowed: true };
}
