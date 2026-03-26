import axiosInstance from "@/lib/axios";
import { useMocks } from "@/lib/flags";
import { openingStockItems, OpeningStockItem } from "@/mocks/openingStock.mock";
import { mockDayStatus, DayStatus } from "@/mocks/dayStatus.mock";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  unit: string;
  currentStock: number;
  minLevel: number;
  restockPoint: number;
  costPerUnit: number;
  status: "Healthy" | "Low" | "Critical";
  lastUpdated: string;
  imageUrl?: string;
  location?: string;
  avgPrice?: number;
  canonicalId?: string;
}

export interface InventoryActivity {
  id: string;
  action: string;
  change: string;
  performer: string;
  activity: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: string;
  action: string;
  activity: string;
  title: string;
  description: string;
  time: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface KitchenItem {
  id: string;
  name: string;
  remainingUnits: number;
  unit: string;
  status: "Critical" | "Healthy" | "Running Low";
  imageUrl?: string;
}

export interface RunningLowItem {
  id: string;
  name: string;
  imageUrl?: string;
  unitsLeftLabel: string;
  needLabel: string;
}

export interface OpeningChecklistDraftPayload {
  confirmedIds: string[];
  counts: Record<string, number>;
}

export interface OpeningChecklistSubmitPayload {
  counts: Record<string, number>;
}

export interface InventoryItemCreatePayload {
  name: string;
  category?: string;
  currentStock?: number;
  unit?: string;
  location?: string;
  imageUrl?: string;
  canonicalId?: string;
}

export interface InventoryItemUpdatePayload {
  name?: string;
  currentStock?: number;
  unit?: string;
  location?: string;
  imageUrl?: string;
}

export interface KitchenUsageLogPayload {
  itemId: string;
  amount: number;
}

export interface KitchenWasteLogPayload {
  itemId: string;
  amount: number;
  reason?: string;
}

export const restaurantOpsService = {
  getStats: async (): Promise<{ totalItems: number; countedItems: number; healthy: number; low: number; critical: number }> => {
    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { totalItems: 24, countedItems: 6, healthy: 12, low: 6, critical: 6 };
    }
    const { data } = await axiosInstance.get("restaurant/stats");
    return data;
  },

  getOpeningChecklistItems: async (): Promise<OpeningStockItem[]> => {
    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return openingStockItems;
    }
    const { data } = await axiosInstance.get("restaurant/opening-checklist/items");
    return data;
  },

  saveOpeningChecklistDraft: async (payload: OpeningChecklistDraftPayload): Promise<{ success: boolean }> => {
    if (useMocks) return { success: true };
    const { data } = await axiosInstance.post("restaurant/opening-checklist/save-draft", payload);
    return data;
  },

  saveClosingChecklistDraft: async (payload: OpeningChecklistDraftPayload): Promise<{ success: boolean }> => {
    if (useMocks) return { success: true };
    const { data } = await axiosInstance.post("restaurant/closing/save-draft", payload);
    return data;
  },

  submitOpeningChecklist: async (payload: OpeningChecklistSubmitPayload): Promise<{ success: boolean }> => {
    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (typeof window !== 'undefined') {
        const current = localStorage.getItem('mock_day_status');
        const status = current ? JSON.parse(current) : { ...mockDayStatus };
        status.openingCompleted = true;
        status.shiftStatus = "Active";
        status.state = "OPEN";
        localStorage.setItem('mock_day_status', JSON.stringify(status));
      }
      return { success: true };
    }
    const { data } = await axiosInstance.post("restaurant/opening-checklist/submit", payload);
    return data;
  },

  getSystemState: async (): Promise<{
    systemState: "LOCKED" | "UNLOCKED";
    canStartOpening: boolean;
    openingAvailableAt: string | null;
  }> => {
    if (useMocks) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('mock_day_status');
        if (saved) {
          const s = JSON.parse(saved);
          return { systemState: s.state === "OPEN" ? "UNLOCKED" : "LOCKED", canStartOpening: true, openingAvailableAt: null };
        }
      }
      return { systemState: "LOCKED", canStartOpening: true, openingAvailableAt: null };
    }
    const { data } = await axiosInstance.get("restaurant/system-state");
    return data;
  },

  getDayStatus: async (): Promise<any> => {
    if (useMocks) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('mock_day_status');
        if (saved) return JSON.parse(saved);
      }
      return mockDayStatus;
    }
    const { data } = await axiosInstance.get("restaurant/day-status");
    return data;
  },

  getRecentActivities: async (params?: { offset?: number; limit?: number }): Promise<Activity[]> => {
    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return [
        { id: "act-1", type: "confirm", action: "Updated", activity: "Daily Stock Confirmed", title: "Daily Stock Confirmed", description: "Kitchen team confirmed today's closing stock", time: "2 hours ago" },
        { id: "act-2", type: "manual", action: "Updated", activity: "Manual stock update", title: "Manual stock update", description: "Admin added 5.5 kg of Fresh Tomato manually", time: "2 hours ago" },
        { id: "act-3", type: "alert", action: "Removed", activity: "Stock Discrepancy Alert", title: "Stock Discrepancy Alert", description: "Inventory mismatch flagged for Whole Milk", time: "2 hours ago", actionLabel: "Fix Inventory", actionHref: "/dashboard/inventory" },
        { id: "act-4", type: "reminder", action: "Updated", activity: "Stock Review Reminder", title: "Stock Review Reminder", description: "Don't forget to confirm today's closing stock.", time: "2 hours ago", actionLabel: "Review Inventory", actionHref: "/dashboard/inventory" }
      ];
    }
    const { data } = await axiosInstance.get("restaurant/recent-activities", { params });
    return data;
  },

  getRunningLowItems: async (): Promise<RunningLowItem[]> => {
    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return [
        { id: "1", name: "Tomatoes", imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop", unitsLeftLabel: "5 units left", needLabel: "Need 10kg" },
        { id: "2", name: "Purple Onions", imageUrl: "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=100&h=100&fit=crop", unitsLeftLabel: "2 units left", needLabel: "Need 5kg" },
        { id: "3", name: "White Rice", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop", unitsLeftLabel: "10 units left", needLabel: "Need 20kg" },
      ];
    }
    const { data } = await axiosInstance.get("restaurant/inventory/running-low");
    return data;
  },

  getKitchenItems: async (search: string = ""): Promise<KitchenItem[]> => {
    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const allItems: KitchenItem[] = [
        { id: "k-1", name: "Purple Onions", remainingUnits: 12, unit: "units", status: "Critical" },
        { id: "k-2", name: "White Rice", remainingUnits: 45, unit: "units", status: "Healthy" },
      ];
      return allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    }
    const { data } = await axiosInstance.get("restaurant/kitchen/items", { params: { search } });
    return data;
  },

  getKitchenServiceSummary: async () => {
    if (useMocks) {
      return { health: "Healthy", healthSubtext: "Lunch service in progress", criticalIngredients: 0, criticalSubtext: "Nothing urgent right now" };
    }
    const { data } = await axiosInstance.get("restaurant/kitchen/summary");
    return data;
  },

  createUsageLog: async (itemId: string, amount: number): Promise<{ success: boolean }> => {
    if (useMocks) return { success: true };
    const { data } = await axiosInstance.post("restaurant/kitchen/log-usage", { itemId, amount });
    return data;
  },

  createWasteLog: async (itemId: string, amount: number, reason: string): Promise<{ success: boolean }> => {
    if (useMocks) return { success: true };
    const { data } = await axiosInstance.post("restaurant/kitchen/log-waste", { itemId, amount, reason });
    return data;
  },

  updateItemStock: async (itemId: string, newQuantity: number): Promise<{ success: boolean }> => {
    if (useMocks) return { success: true };
    const { data } = await axiosInstance.post("restaurant/inventory/update-stock", { itemId, newQuantity });
    return data;
  },

  getClosingIndicators: async () => {
    if (useMocks) return { itemsUsed: 17, itemsWasted: 5 };
    const { data } = await axiosInstance.get("restaurant/closing/indicators");
    return data;
  },

  getClosingStatus: async () => {
    if (useMocks) {
      return {
        isLocked: true,
        prerequisites: [
          { id: 1, label: "Complete Daily Stock Count", completed: true },
          { id: 2, label: "Wait until 7:00 PM", completed: false, currentInfo: "Currently 4:15 PM" }
        ]
      };
    }
    const { data } = await axiosInstance.get("restaurant/closing/status");
    return data;
  },

  submitClosingChecklist: async (payload: any): Promise<{ success: boolean }> => {
    if (useMocks) {
      if (typeof window !== 'undefined') {
        const current = localStorage.getItem('mock_day_status');
        const status = current ? JSON.parse(current) : { ...mockDayStatus };
        status.openingCompleted = false;
        status.shiftStatus = "Closed";
        status.state = "CLOSED";
        localStorage.setItem('mock_day_status', JSON.stringify(status));
      }
      return { success: true };
    }
    const { data } = await axiosInstance.post("restaurant/closing/submit", payload);
    return data;
  },

  addItem: async (itemData: InventoryItemCreatePayload): Promise<{ success: boolean; item?: InventoryItem }> => {
    if (useMocks) return { success: true };
    const { data } = await axiosInstance.post("restaurant/inventory/items", itemData);
    return data;
  },

  updateItem: async (id: string, itemData: InventoryItemUpdatePayload): Promise<{ success: boolean }> => {
    if (useMocks) return { success: true };
    const { data } = await axiosInstance.patch(`restaurant/inventory/items/${id}`, itemData);
    return data;
  },

  getInventoryItems: async ({ search, category, level }: { search?: string, category?: string, level?: string } = {}): Promise<InventoryItem[]> => {
    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      let allItems: InventoryItem[] = [
        { id: "1", name: "Tomatoes", sku: "TOM-001", category: "Vegetables", brand: "FreshFarm", unit: "kg", currentStock: 2.5, minLevel: 5, restockPoint: 10, costPerUnit: 1200, status: "Critical", lastUpdated: "Today, 8:30 AM" },
      ];
      if (search) allItems = allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
      if (category && category !== "all") allItems = allItems.filter(i => i.category === category);
      if (level && level !== "all") allItems = allItems.filter(i => i.status.toLowerCase() === level.toLowerCase());
      return allItems;
    }
    const { data } = await axiosInstance.get("restaurant/inventory/items", { params: { search, category, level } });
    return data;
  },

  getInventoryItemById: async (id: string): Promise<InventoryItem> => {
    if (useMocks) {
      const items = await restaurantOpsService.getInventoryItems();
      const item = items.find(i => i.id === id);
      if (item) return item;
      throw new Error("Item not found");
    }
    const { data } = await axiosInstance.get(`restaurant/inventory/items/${id}`);
    return data;
  },

  getItemActivities: async (id: string): Promise<InventoryActivity[]> => {
    if (useMocks) {
      return [
        { id: "1", action: "Updated", change: "-", performer: "Procurement Officer", activity: "Manual (Inventory Setup)", timestamp: "Oct 06, 2025; 14:32" },
      ];
    }
    const { data } = await axiosInstance.get(`restaurant/inventory/items/${id}/activities`);
    return data;
  },

  getSettings: async () => {
    if (useMocks) return { name: "Gatete Restaurant", email: "food@restaurant.com", opening_time: "09:00 AM", closing_time: "11:00 PM" };
    const { data } = await axiosInstance.get("restaurant/settings");
    return data;
  },

  updateSettings: async (settings: any) => {
    if (useMocks) return { success: true };
    const { data } = await axiosInstance.patch("restaurant/settings", settings);
    return data;
  },

  getNotifications: async (params?: { offset?: number; limit?: number }): Promise<any[]> => {
    if (useMocks) {
      return [
        { id: "1", type: "success", title: "Daily Stock Confirmed", description: "Daily stock count has been successfully confirmed for all 18 items.", time: "2 hours ago", unread: true },
        { id: "2", type: "alert", title: "Critical Stock Level", description: "Item 'Tomatoes' has reached critical stock level (0.5kg remaining).", time: "4 hours ago", unread: true },
      ];
    }
    const { data } = await axiosInstance.get("restaurant/notifications", { params });

    const rawList: any[] = Array.isArray(data) ? data : [];

    // Normalize backend notifications (which currently return
    // `{ id, type: "critical"|"warning", message }`) into the
    // richer shape expected by the restaurant notifications UI.
    return rawList.map((n, index) => {
      // If the backend is already returning the rich shape, keep it.
      if (n.title || n.description) {
        return n;
      }

      const backendType = String(n.type || "info").toLowerCase();
      let mappedType: string = "info";
      if (backendType === "critical") mappedType = "alert";
      else if (backendType === "warning") mappedType = "warning";

      const message: string = n.message || "Notification from your inventory";

      return {
        id: String(n.id ?? index),
        type: mappedType,
        title: mappedType === "alert"
          ? "Action required in inventory"
          : mappedType === "warning"
          ? "Check stock levels"
          : "Inventory update",
        description: message,
        time: n.time || n.timestamp || "Just now",
        unread: true,
      };
    });
  },

  getMenu: async (): Promise<any[]> => {
    if (useMocks) {
      return [
        { id: "m1", name: "Cafe Latte", description: "Rich espresso with steamed milk", price: 3500, category: "Coffee", image_url: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f" },
        { id: "m2", name: "Iced Oat Latte", description: "Chilled espresso with creamy oat milk", price: 4000, category: "Coffee", image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735" }
      ];
    }
    const { data } = await axiosInstance.get("pos/menu");
    return data;
  },

  getCanonicalCatalog: async (): Promise<any[]> => {
    if (useMocks) return [];
    try {
        const { data } = await axiosInstance.get("inventory/catalog");
        return data;
    } catch (e) {
        return [];
    }
  },

  searchCanonicalCatalog: async (query: string): Promise<any[]> => {
    if (useMocks) return [];
    try {
        const { data } = await axiosInstance.get(`inventory/catalog/search?q=${query}`);
        return data;
    } catch (e) {
        return [];
    }
  },

  placeOrder: async (menuItemId: string, quantity: number = 1): Promise<any> => {
    if (useMocks) {
      return { status: "success", deductions: [] };
    }
    const { data } = await axiosInstance.post("pos/order", { menu_item_id: menuItemId, quantity });
    return data;
  }
}
