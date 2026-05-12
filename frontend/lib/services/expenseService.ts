import axiosInstance from "@/lib/axios";

export type ExpenseType = "INGREDIENT" | "OVERHEAD";

export interface ExpenseCreatePayload {
  item_name: string;
  expense_type: ExpenseType;
  source?: string;
  amount: number;
  quantity?: number;
  unit?: string;
  idempotency_key?: string;
}

export interface ExpenseOut {
  id: string;
  organization_id: string;
  brand_id: string | null;
  item_name: string;
  expense_type: ExpenseType;
  source: string | null;
  amount: number;
  quantity: number | null;
  unit: string | null;
  contextual_product_id: string | null;
  business_date: string | null;
  occurred_at: string | null;
  logged_by: string | null;
  idempotency_key: string | null;
  created_at: string | null;
  inventory_updated: boolean;
  note: string | null;
}

export interface ExpenseStats {
  total_expenses: number;
  cogs: number;
  overhead: number;
  expense_count: number;
}

export interface ExpenseWeekStats {
  total: number;
  cogs: number;
  overhead: number;
  vs_last_week_pct: number | null;
  daily_breakdown: { date: string; total: number; cogs: number; overhead: number }[];
}

export interface ExpenseHistoryItem {
  id: string;
  item_name: string;
  expense_type: ExpenseType;
  source: string | null;
  amount: number;
  quantity: number | null;
  unit: string | null;
  brand_id: string | null;
  business_date: string | null;
  occurred_at: string | null;
}

export interface ExpenseHistoryPage {
  total: number;
  page: number;
  limit: number;
  pages: number;
  items: ExpenseHistoryItem[];
}

export interface ExpenseHistoryParams {
  page?: number;
  limit?: number;
  days?: number;
  expense_type?: ExpenseType;
}

export const expenseService = {
  async createExpense(payload: ExpenseCreatePayload): Promise<ExpenseOut> {
    const { data } = await axiosInstance.post<ExpenseOut>("/expenses", payload);
    return data;
  },

  async getTodayStats(): Promise<ExpenseStats> {
    const { data } = await axiosInstance.get<ExpenseStats>("/expenses/stats/today");
    return data;
  },

  async getWeekStats(): Promise<ExpenseWeekStats> {
    const { data } = await axiosInstance.get<ExpenseWeekStats>("/expenses/stats/week");
    return data;
  },

  async getHistory(params?: ExpenseHistoryParams): Promise<ExpenseHistoryPage> {
    const { data } = await axiosInstance.get<ExpenseHistoryPage>("/expenses/history", { params });
    return data;
  },
};
