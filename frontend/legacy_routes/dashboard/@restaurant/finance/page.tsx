"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Link from "next/link";
import { useRestaurantDayActionGuard } from "@/hooks/useRestaurantDayActionGuard";
import { useSearchParams } from "next/navigation";
import { DailyReportsModal } from "@/components/daily-reports-modal";

export default function FinancePage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const { guard } = useRestaurantDayActionGuard();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 space-y-8 max-w-[1700px] mx-auto w-full pb-20 transition-all duration-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-[28px] md:text-3xl font-bold text-[#1E293B] tracking-tight">Finance</h2>
            <p className="text-[13px] md:text-sm font-medium text-slate-400">Track spending, invoices, and budgets</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="gap-2 flex-1 sm:flex-none h-11 rounded-xl border-slate-200 font-bold text-xs md:text-sm"
              onClick={() => guard(() => setReportsModalOpen(true), { actionName: "daily reports" })}
            >
              Daily Reports
            </Button>
            <Button variant="outline" className="gap-2 flex-1 sm:flex-none h-11 rounded-xl border-slate-200 font-bold text-xs md:text-sm" asChild>
              <Link href="/dashboard/finance/export">
                Export
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs and mock financial charts preserved as legacy UI */}
      </main>
      <DailyReportsModal
        open={reportsModalOpen}
        onOpenChange={setReportsModalOpen}
        type="finance"
      />
    </div>
  );
}
