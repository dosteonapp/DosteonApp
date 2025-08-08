export enum UnitType {
  // Weight units
  KILOGRAM = "kg",
  GRAM = "g",

  // Volume units
  LITER = "liter",
  MILLILITER = "ml",
  // CARTON = "carton",

  // Count units
  PIECE = "piece",
  BOX = "box",
  // create
}

export interface Inventory {
  name: string;
  _id: string;
  category: string | object; // Reference to product category
  currentStock: number; // Current stock level
  branded?: string; // Optional brand name
  brandName?: string; // Optional brand name
  unit: UnitType;
  minimumLevel: number; // Minimum stock level before warning
  //   prefferedSuppliers?: Types.ObjectId[]; // List of preferred suppliers
  storageLocation?: string; // Location of the inventory item
  //   user: Types.ObjectId; // The user who manages the inventory
  expiryDate?: Date; // Expiry date for perishable items
}

export interface Order {
  _id: string;
  customer: string | object; // Reference to customer
  items: Array<{
    product: string | object; // Reference to product
    quantity: number;
    price: number;
  }>;
  status: "pending" | "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}
