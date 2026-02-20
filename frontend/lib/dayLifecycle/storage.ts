import { DayStatus, Role } from "./types";

export const restaurantDayStorage = {
  getKey: (orgId: string, businessDate: string) => {
    return `dosteon:dayStatus:${orgId}:${businessDate}`;
  },

  saveStatus: (orgId: string, status: DayStatus) => {
    if (typeof window === "undefined") return;
    const key = restaurantDayStorage.getKey(orgId, status.businessDate);
    localStorage.setItem(key, JSON.stringify(status));
  },

  getStatus: (orgId: string, businessDate: string): DayStatus | null => {
    if (typeof window === "undefined") return null;
    const key = restaurantDayStorage.getKey(orgId, businessDate);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  },

  clearStatus: (orgId: string, businessDate: string) => {
    if (typeof window === "undefined") return;
    const key = restaurantDayStorage.getKey(orgId, businessDate);
    localStorage.removeItem(key);
  }
};
