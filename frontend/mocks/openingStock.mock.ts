export interface OpeningStockItem {
  id: string;
  name: string;
  yesterdayClosing: number;
  todayOpening: number | null;
  amountAddedToday: number | null;
  totalOpening: number | null;
  category: string;
  level: "low" | "normal" | "critical";
  unit: string;
  isConfirmed?: boolean;
  imageUrl?: string;
}

export const openingStockItems: OpeningStockItem[] = [
  {
    id: "os-001",
    name: "Organic Tomatoes",
    yesterdayClosing: 10,
    todayOpening: 10,
    amountAddedToday: 0,
    totalOpening: 10,
    unit: "units",
    category: "Vegetables",
    level: "normal",
    isConfirmed: true,
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "os-002",
    name: "Red Onions",
    yesterdayClosing: 15,
    todayOpening: 15,
    amountAddedToday: 5,
    totalOpening: 20,
    unit: "kg",
    category: "Vegetables",
    level: "normal",
    isConfirmed: true,
    imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "os-003",
    name: "Fresh Garlic",
    yesterdayClosing: 2,
    todayOpening: 2,
    amountAddedToday: 0,
    totalOpening: 2,
    unit: "kg",
    category: "Spices",
    level: "critical",
    isConfirmed: true,
  },
  {
    id: "os-004",
    name: "Milk (Whole)",
    yesterdayClosing: 12,
    todayOpening: 12,
    amountAddedToday: 6,
    totalOpening: 18,
    unit: "L",
    category: "Dairy",
    level: "low",
    isConfirmed: true,
  },
  {
    id: "os-005",
    name: "Heavy Cream",
    yesterdayClosing: 5,
    todayOpening: 5,
    amountAddedToday: 0,
    totalOpening: 5,
    unit: "L",
    category: "Dairy",
    level: "normal",
    isConfirmed: true,
  },
  {
    id: "os-006",
    name: "Cheddar Cheese",
    yesterdayClosing: 8,
    todayOpening: 8,
    amountAddedToday: 0,
    totalOpening: 8,
    unit: "kg",
    category: "Dairy",
    level: "normal",
    isConfirmed: true,
  },
  {
    id: "os-007",
    name: "All-Purpose Flour",
    yesterdayClosing: 50,
    todayOpening: null,
    amountAddedToday: null,
    totalOpening: null,
    unit: "kg",
    category: "Pantry",
    level: "normal",
    isConfirmed: false,
  },
  {
    id: "os-008",
    name: "Granulated Sugar",
    yesterdayClosing: 20,
    todayOpening: null,
    amountAddedToday: null,
    totalOpening: null,
    unit: "kg",
    category: "Pantry",
    level: "normal",
    isConfirmed: false,
  },
  {
    id: "os-009",
    name: "Cooking Oil",
    yesterdayClosing: 25,
    todayOpening: null,
    amountAddedToday: null,
    totalOpening: null,
    unit: "L",
    category: "Pantry",
    level: "normal",
    isConfirmed: false,
  },
];
