/**
 * Mock data for Inventory Logs.
 */

export const dummyStockLogs = [
  {
    itemId: "1",
    name: "Tomatoes",
    logs: [
      { date: "2025-08-07", opening: 100, used: 20, closing: 80 },
      { date: "2025-08-08", opening: 80, used: 10, closing: 70 },
      { date: "2025-08-09", opening: 70, used: 15, closing: 55 },
    ],
    unit: "kg",
  },
  {
    itemId: "2",
    name: "Cheese",
    logs: [
      { date: "2025-08-08", opening: 50, used: 5, closing: 45 },
      { date: "2025-08-09", opening: 45, used: 7, closing: 38 },
    ],
    unit: "kg",
  },
];
