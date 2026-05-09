export interface DayStatus {
  openingCompleted: boolean;
  itemsNeedCounting: number;
  totalInventoryItems: number;
  criticalCount: number;
  lowStockCount: number;
  healthyStockCount: number;
  shiftStatus: "Inactive" | "Active";
  staffName: string;
  dateLabel: string;
}

export const mockDayStatus: DayStatus = {
  openingCompleted: false,
  itemsNeedCounting: 16,
  totalInventoryItems: 24,
  criticalCount: 6,
  lowStockCount: 6,
  healthyStockCount: 12,
  shiftStatus: "Inactive",
  staffName: "Sherry Harper",
  dateLabel: "Tuesday, Jan 24, 2026",
};
