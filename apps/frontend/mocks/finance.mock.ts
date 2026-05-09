/**
 * Mock data for the Finance domain.
 */

export const revenueData = [
  { month: "Jan", revenue: 14500000, expenses: 9800000, profit: 4700000 },
  { month: "Feb", revenue: 15200000, expenses: 10100000, profit: 5100000 },
  { month: "Mar", revenue: 16800000, expenses: 11200000, profit: 5600000 },
  { month: "Apr", revenue: 17500000, expenses: 11800000, profit: 5700000 },
  { month: "May", revenue: 18750000, expenses: 12650000, profit: 6100000 },
];

export const categorySalesData = [
  {
    month: "Jan",
    produce: 5200000,
    meat: 4100000,
    dairy: 3500000,
    dryGoods: 1700000,
  },
  {
    month: "Feb",
    produce: 5400000,
    meat: 4300000,
    dairy: 3600000,
    dryGoods: 1900000,
  },
  {
    month: "Mar",
    produce: 6300000,
    meat: 5000000,
    dairy: 3550000,
    dryGoods: 1950000,
  },
  {
    month: "Apr",
    produce: 6450000,
    meat: 5200000,
    dairy: 3700000,
    dryGoods: 2150000,
  },
  {
    month: "May",
    produce: 6800000,
    meat: 5500000,
    dairy: 3800000,
    dryGoods: 2650000,
  },
];

export const sales = [
  {
    id: "sale-001",
    date: "May 3, 2023",
    customer: "Bistro Bella",
    orderId: "ORD-7891",
    amount: 245500,
    status: "Processing",
  },
  {
    id: "sale-002",
    date: "May 2, 2023",
    customer: "Cafe Milano",
    orderId: "ORD-7890",
    amount: 320750,
    status: "Completed",
  },
  {
    id: "sale-003",
    date: "May 1, 2023",
    customer: "The Green Plate",
    orderId: "ORD-7889",
    amount: 178250,
    status: "Completed",
  },
  {
    id: "sale-004",
    date: "Apr 30, 2023",
    customer: "Spice Garden",
    orderId: "ORD-7888",
    amount: 210000,
    status: "Completed",
  },
  {
    id: "sale-005",
    date: "Apr 29, 2023",
    customer: "Taste of Asia",
    orderId: "ORD-7887",
    amount: 145500,
    status: "Completed",
  },
];

export const invoices = [
  {
    id: "INV-001",
    customer: "Bistro Bella",
    issueDate: "May 3, 2023",
    dueDate: "Jun 2, 2023",
    amount: 245500,
    status: "Pending",
  },
  {
    id: "INV-002",
    customer: "Cafe Milano",
    issueDate: "May 2, 2023",
    dueDate: "Jun 1, 2023",
    amount: 320750,
    status: "Pending",
  },
  {
    id: "INV-003",
    customer: "The Green Plate",
    issueDate: "May 1, 2023",
    dueDate: "May 31, 2023",
    amount: 178250,
    status: "Pending",
  },
  {
    id: "INV-004",
    customer: "Spice Garden",
    issueDate: "Apr 30, 2023",
    dueDate: "May 30, 2023",
    amount: 210000,
    status: "Paid",
  },
  {
    id: "INV-005",
    customer: "Taste of Asia",
    issueDate: "Apr 29, 2023",
    dueDate: "May 29, 2023",
    amount: 145500,
    status: "Paid",
  },
];

export const expenses = [
  {
    id: "exp-001",
    date: "May 5, 2023",
    description: "Warehouse rent",
    category: "Rent",
    amount: 850000,
    status: "Paid",
  },
  {
    id: "exp-002",
    date: "May 4, 2023",
    description: "Utility bills",
    category: "Utilities",
    amount: 120000,
    status: "Paid",
  },
  {
    id: "exp-003",
    date: "May 3, 2023",
    description: "Delivery vehicle maintenance",
    category: "Transportation",
    amount: 85000,
    status: "Pending",
  },
  {
    id: "exp-004",
    date: "May 2, 2023",
    description: "Staff salaries",
    category: "Payroll",
    amount: 2500000,
    status: "Paid",
  },
  {
    id: "exp-005",
    date: "May 1, 2023",
    description: "Packaging materials",
    category: "Supplies",
    amount: 150000,
    status: "Paid",
  },
];
