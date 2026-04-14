import axiosInstance from "@/lib/axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  status: string;
  source: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface TodayStats {
  today_revenue: number;
  today_cogs: number;
  today_gross_profit: number;
  categories_count: number;
}

export interface WeekStats {
  week_revenue: number;
  week_revenue_pct: number | null;
  avg_daily_revenue: number;
  best_day: string | null;
  avg_gross_margin: number;
  avg_gross_margin_pts: number | null;
}

export interface MenuStats {
  total_dishes: number;
  top_selling_dish: string | null;
  avg_selling_price: number;
  avg_gross_margin: number;
}

export interface SaleOrder {
  id: string;
  channel: string;
  status: string;
  total_revenue: number;
  total_cogs: number;
  gross_profit: number;
  items_count: number;
  occurred_at: string;
  business_date: string;
}

export interface SaleOrderDetail extends SaleOrder {
  items: {
    id: string;
    menu_item_id: string;
    menu_item_name: string;
    quantity: number;
    unit_price: number;
    unit_cogs: number;
    line_total: number;
  }[];
}

export interface SalesHistory {
  total: number;
  page: number;
  limit: number;
  pages: number;
  orders: SaleOrder[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const salesService = {
  async getMenu(search?: string): Promise<{ categories: MenuCategory[] }> {
    const { data } = await axiosInstance.get("/sales/menu", {
      params: search ? { search } : {},
    });
    return data;
  },

  async createMenuItem(payload: {
    name: string;
    price: number;
    cost?: number;
    category?: string;
  }): Promise<MenuItem> {
    const { data } = await axiosInstance.post("/sales/menu", payload);
    return data;
  },

  async updateMenuItem(
    id: string,
    payload: Partial<{ name: string; price: number; cost: number; category: string }>
  ): Promise<MenuItem> {
    const { data } = await axiosInstance.patch(`/sales/menu/${id}`, payload);
    return data;
  },

  async archiveMenuItem(id: string): Promise<void> {
    await axiosInstance.post(`/sales/menu/${id}/archive`);
  },

  async getTodayStats(): Promise<TodayStats> {
    const { data } = await axiosInstance.get("/sales/stats/today");
    return data;
  },

  async getWeekStats(): Promise<WeekStats> {
    const { data } = await axiosInstance.get("/sales/stats/week");
    return data;
  },

  async getMenuStats(): Promise<MenuStats> {
    const { data } = await axiosInstance.get("/sales/stats/menu");
    return data;
  },

  async logSale(payload: {
    channel: string;
    items: { menu_item_id: string; quantity: number }[];
  }): Promise<SaleOrder> {
    const { data } = await axiosInstance.post("/sales/log", payload);
    return data;
  },

  async getHistory(params?: {
    date?: string;
    channel?: string;
    page?: number;
    limit?: number;
  }): Promise<SalesHistory> {
    const { data } = await axiosInstance.get("/sales/history", { params });
    return data;
  },

  async getOrderDetail(orderId: string): Promise<SaleOrderDetail> {
    const { data } = await axiosInstance.get(`/sales/history/${orderId}`);
    return data;
  },
};
