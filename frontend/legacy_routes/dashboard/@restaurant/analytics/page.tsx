"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DailyReportsModal } from "@/components/daily-reports-modal";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-10 w-full pb-20 transition-all duration-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-[28px] md:text-3xl font-semibold text-[#1E293B] tracking-tight font-figtree">Analytics</h2>
            <p className="text-[13px] md:text-sm font-semibold text-slate-400">Track consumption, wastage, and predictive trends</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] md:w-[180px] h-11 rounded-xl border-slate-200 font-bold text-xs md:text-sm">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2 h-11 rounded-xl border-slate-200 font-bold text-xs md:text-sm px-4 md:px-5"
              onClick={() => setReportsModalOpen(true)}
            >
              Daily Reports
            </Button>
            <Button variant="outline" className="gap-2 h-11 rounded-xl border-slate-200 font-bold text-xs md:text-sm px-4 md:px-5">
              Export
            </Button>
          </div>
        </div>

        {/* Tabs and chart mock content preserved as legacy */}
      </main>
      <DailyReportsModal
        open={reportsModalOpen}
        onOpenChange={setReportsModalOpen}
        type="analytics"
      />
    </div>
  );
}
