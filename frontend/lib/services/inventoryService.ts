import axiosInstance from "@/lib/axios";

// ---------------------------------------------------------------------------
// Types — new inventory API (Phase 4 / Phase 5)
// ---------------------------------------------------------------------------

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  brand_name: string | null;
  unit: string;
  current_stock: number;
  min_level: number;
  status_class: "healthy" | "low" | "critical";
  updated_at: string;
}

export interface StatCard {
  value: number;
  vs_last_week_pct: number | null;
}

export interface InventoryStats {
  items_in_stock: StatCard;
  healthy_stock:  StatCard;
  low_stock:      StatCard;
  critical:       StatCard;
}

export interface StockUsageStats {
  most_used_item:    string | null;
  consumption_today: number;
  waste_today:       number;
  most_wasted_item:  string | null;
}

export interface StockUsageEvent {
  id:                 string;
  product_id:         string;
  product_name:       string;
  event_type:         "USED" | "WASTED";
  quantity:           number;
  unit:               string;
  consumption_reason: string | null;
  waste_reason:       string | null;
  occurred_at:        string;
}

// ---------------------------------------------------------------------------
// New inventory service object
// ---------------------------------------------------------------------------

export const inventoryApi = {
  getProducts: async (params?: { search?: string; category?: string }): Promise<InventoryProduct[]> => {
    const res = await axiosInstance.get("/inventory/products", { params });
    return res.data;
  },

  getStats: async (): Promise<InventoryStats> => {
    const res = await axiosInstance.get("/inventory/stats");
    return res.data;
  },

  getStockUsageStats: async (): Promise<StockUsageStats> => {
    const res = await axiosInstance.get("/inventory/stock-usage/stats");
    return res.data;
  },

  getStockUsageHistory: async (limit = 10): Promise<StockUsageEvent[]> => {
    const res = await axiosInstance.get("/inventory/stock-usage/history", { params: { limit } });
    return res.data;
  },

  logConsumption: async (data: {
    product_id: string;
    quantity: number;
    consumption_reason: string;
  }) => {
    const res = await axiosInstance.post("/inventory/stock-usage/consumption", data);
    return res.data;
  },

  logWaste: async (data: {
    product_id: string;
    quantity: number;
    waste_reason: string;
  }) => {
    const res = await axiosInstance.post("/inventory/stock-usage/waste", data);
    return res.data;
  },
};

export async function deleteInventoryItem(id: string) {
  const response = await axiosInstance.delete(`/restaurant/inventory/${id}`);
  return response.data;
}
export async function updateInventoryItem(
  id: string,
  data: {
    name?: string;
    category?: string;
    currentStock?: number;
    unit?: string;
    minimumLevel?: number;
    preferredSuppliers?: string[];
    storageLocation?: string;
    expiryDate?: string;
  }
) {
  const response = await axiosInstance.patch(
    `/restaurant/inventory/${id}`,
    data
  );
  return response.data;
}


export async function addInventoryItem(data: {
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minimumLevel: number;
  preferredSuppliers?: string[];
  storageLocation?: string;
  expiryDate?: string;
}) {
  const response = await axiosInstance.post("/inventory", data);
  return response.data;
}

export async function getInventoryItem(id: string) {
  const response = await axiosInstance.get(`/restaurant/inventory/${id}`);
  return response.data;
}
