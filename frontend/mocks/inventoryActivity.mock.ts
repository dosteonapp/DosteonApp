import { Inventory } from "@/types/restaurant";

export interface StockActivity {
  id: string;
  itemId: string;
  action: "Updated" | "Received" | "Removed" | "Auto-Alert" | "System Sync";
  quantityChange?: string;
  performedBy: string;
  performedByRole: string;
  status: "Verified" | "Pending" | "Flagged";
  activity: string;
  timestamp: string;
}

export const inventoryActivities: StockActivity[] = [
  {
    id: "act-001",
    itemId: "prod-1", // Tomatoes
    action: "Updated",
    performedBy: "Sherry Harper",
    performedByRole: "Admin Manager",
    status: "Verified",
    activity: "Manual (Inventory Setup)",
    timestamp: "Oct 06, 2025; 14:32",
  },
  {
    id: "act-002",
    itemId: "prod-1",
    action: "Received",
    quantityChange: "+25kg",
    performedBy: "Procurement Officer",
    performedByRole: "Procurement Officer",
    status: "Verified",
    activity: "Delivery",
    timestamp: "Oct 06, 2025; 14:32",
  },
  {
    id: "act-003",
    itemId: "prod-1",
    action: "Received",
    quantityChange: "+25kg",
    performedBy: "Procurement Officer",
    performedByRole: "Procurement Officer",
    status: "Verified",
    activity: "Delivery",
    timestamp: "Oct 06, 2025; 14:32",
  },
  {
    id: "act-004",
    itemId: "prod-1",
    action: "Updated",
    performedBy: "Procurement Officer",
    performedByRole: "Procurement Officer",
    status: "Verified",
    activity: "Updated supplier unit price from 3,500 -> 3,800 RWF.",
    timestamp: "Oct 06, 2025; 14:32",
  },
  {
    id: "act-005",
    itemId: "prod-1",
    action: "Removed",
    quantityChange: "-10kg",
    performedBy: "Kitchen Staff",
    performedByRole: "Kitchen Staff",
    status: "Verified",
    activity: "Waste Management",
    timestamp: "Oct 06, 2025; 14:32",
  },
  {
    id: "act-006",
    itemId: "prod-1",
    action: "Auto-Alert",
    quantityChange: "-10kg (discrepancy)",
    performedBy: "System Agent",
    performedByRole: "System Agent",
    status: "Verified",
    activity: "System Forecast",
    timestamp: "Oct 06, 2025; 14:32",
  },
  {
    id: "act-007",
    itemId: "prod-1",
    action: "Removed",
    quantityChange: "-10kg",
    performedBy: "Kitchen Staff",
    performedByRole: "Kitchen Staff",
    status: "Verified",
    activity: "Waste Management",
    timestamp: "Oct 06, 2025; 14:32",
  },
  {
    id: "act-008",
    itemId: "prod-1",
    action: "System Sync",
    performedBy: "System Agent",
    performedByRole: "System Agent",
    status: "Verified",
    activity: "POS Integration",
    timestamp: "Oct 06, 2025; 14:32",
  },
  {
    id: "act-009",
    itemId: "prod-1",
    action: "Received",
    quantityChange: "+25kg",
    performedBy: "Procurement Officer",
    performedByRole: "Procurement Officer",
    status: "Verified",
    activity: "Delivery",
    timestamp: "Oct 06, 2025; 14:32",
  },
];
