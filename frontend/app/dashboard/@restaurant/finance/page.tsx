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
import { Menu, Download, ArrowUpRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
              <FileText className="h-4 w-4" />
              Daily Reports
            </Button>
            <Button variant="outline" className="gap-2 flex-1 sm:flex-none h-11 rounded-xl border-slate-200 font-bold text-xs md:text-sm" asChild>
              <Link href="/dashboard/finance/export">
                <Download className="h-4 w-4" />
                Export
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Spend (MTD)" value="RWF 12,450,000" subtext="+8% from last month" />
          <StatCard label="Outstanding Payments" value="RWF 3,250,000" subtext="5 invoices pending" />
          <StatCard label="Average Order Value" value="RWF 245,000" subtext="+12% from last month" />
          <StatCard label="Payment Due" value="RWF 1,800,000" subtext="Due in 7 days" />
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="bg-slate-100 p-1 rounded-xl flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="rounded-lg py-2 flex-1 min-w-[100px] font-bold text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg py-2 flex-1 min-w-[100px] font-bold text-xs md:text-sm">Transactions</TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-lg py-2 flex-1 min-w-[100px] font-bold text-xs md:text-sm">Invoices</TabsTrigger>
            <TabsTrigger value="budget" className="rounded-lg py-2 flex-1 min-w-[100px] font-bold text-xs md:text-sm">Budget</TabsTrigger>
            <TabsTrigger value="petty-cash" className="rounded-lg py-2 flex-1 min-w-[100px] font-bold text-xs md:text-sm">Petty Cash</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Spending Overview</CardTitle>
                  <CardDescription>Your spending trends over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ChartContainer
                    config={{
                      spending: { label: "Spending", color: "hsl(var(--chart-1))" },
                      budget: { label: "Budget", color: "hsl(var(--chart-2))" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spendingData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="spending" stroke="var(--color-spending)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="budget" stroke="var(--color-budget)" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Spending by Category</CardTitle>
                  <CardDescription>Breakdown of your spending by category</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ChartContainer
                    config={{
                      produce: { label: "Produce", color: "hsl(var(--chart-1))" },
                      meat: { label: "Meat & Poultry", color: "hsl(var(--chart-2))" },
                      dairy: { label: "Dairy", color: "hsl(var(--chart-3))" },
                      dryGoods: { label: "Dry Goods", color: "hsl(var(--chart-4))" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="produce" fill="var(--color-produce)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="meat" fill="var(--color-meat)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="dairy" fill="var(--color-dairy)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="dryGoods" fill="var(--color-dryGoods)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="transactions" className="outline-none">
            <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
                <CardDescription>Your recent payment activity</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold py-4">Date</TableHead>
                        <TableHead className="font-bold py-4">Supplier</TableHead>
                        <TableHead className="font-bold py-4">Order ID</TableHead>
                        <TableHead className="font-bold py-4">Amount</TableHead>
                        <TableHead className="font-bold py-4">Status</TableHead>
                        <TableHead className="text-right font-bold py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-xs md:text-sm">{transaction.date}</TableCell>
                          <TableCell className="font-bold text-slate-700 text-xs md:text-sm">{transaction.supplier}</TableCell>
                          <TableCell className="text-slate-500 font-mono text-[10px] md:text-xs">{transaction.orderId}</TableCell>
                          <TableCell className="font-black text-xs md:text-sm text-slate-900">RWF {transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full px-2.5 md:px-3 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none whitespace-nowrap",
                              transaction.status === "Paid" ? "bg-emerald-50 text-emerald-600" : 
                              transaction.status === "Pending" ? "bg-amber-50 text-amber-600" : 
                              "bg-red-50 text-red-600"
                            )}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 rounded-full" asChild>
                              <Link href={`/dashboard/finance/transactions/${transaction.id}`}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="invoices" className="outline-none">
            <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Invoices</CardTitle>
                <CardDescription>Manage your invoices</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold py-4">Invoice #</TableHead>
                        <TableHead className="font-bold py-4">Supplier</TableHead>
                        <TableHead className="font-bold py-4">Issue Date</TableHead>
                        <TableHead className="font-bold py-4">Due Date</TableHead>
                        <TableHead className="font-bold py-4">Amount</TableHead>
                        <TableHead className="font-bold py-4">Status</TableHead>
                        <TableHead className="text-right font-bold py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono text-[10px] md:text-xs font-bold text-indigo-600 uppercase tracking-wider">{invoice.id}</TableCell>
                          <TableCell className="font-bold text-slate-700 text-xs md:text-sm">{invoice.supplier}</TableCell>
                          <TableCell className="text-slate-500 text-xs md:text-sm">{invoice.issueDate}</TableCell>
                          <TableCell className="text-slate-500 font-bold text-xs md:text-sm">{invoice.dueDate}</TableCell>
                          <TableCell className="font-black text-slate-900 text-xs md:text-sm">RWF {invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full px-2.5 md:px-3 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none whitespace-nowrap",
                              invoice.status === "Paid" ? "bg-emerald-50 text-emerald-600" : 
                              invoice.status === "Pending" ? "bg-amber-50 text-amber-600" : 
                              "bg-red-50 text-red-600"
                            )}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8 md:h-9 px-3 md:px-4 rounded-lg border-slate-200 font-bold text-[10px] md:text-xs">
                                View
                              </Button>
                              {invoice.status === "Pending" && (
                                <Button size="sm" className="h-8 md:h-9 px-3 md:px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] md:text-xs shadow-md shadow-indigo-100 text-white" onClick={() => guard(() => console.log("Pay invoice"), { actionName: "invoice payment" })}>Pay</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="budget" className="outline-none space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[24px] border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Monthly Budget</h4>
                  <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-200 font-bold text-indigo-600">83% Used</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-black text-[#1E293B]">RWF 15,000,000</div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400">RWF 12,450,000 spent this month</p>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-1000" style={{ width: "83%" }}></div>
                </div>
              </Card>
              <Card className="rounded-[24px] border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Annual Budget</h4>
                  <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-200 font-bold text-indigo-600">36% Used</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-black text-[#1E293B]">RWF 180,000,000</div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400">RWF 65,230,000 spent this year</p>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: "36%" }}></div>
                </div>
              </Card>
            </div>

            <Card className="rounded-[24px] border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Budget by Category</CardTitle>
                <CardDescription>Track spending against budget by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BudgetProgress label="Produce" current={3500000} total={5000000} color="bg-emerald-500" />
                <BudgetProgress label="Meat & Poultry" current={4200000} total={5000000} color="bg-amber-500" />
                <BudgetProgress label="Dairy" current={1800000} total={2500000} color="bg-blue-500" />
                <BudgetProgress label="Dry Goods" current={2950000} total={2500000} color="bg-red-500" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="petty-cash" className="outline-none space-y-6">
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Current Balance" value="RWF 125,000" subtext="Last updated: Today" />
              <StatCard label="Monthly Expenses" value="RWF 350,000" subtext="In May 2023" />
              <StatCard label="Last Replenishment" value="RWF 200,000" subtext="May 15, 2023" />
              <StatCard label="Pending Approvals" value="3" subtext="Awaiting approval" />
            </div>

            <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">Petty Cash Transactions</CardTitle>
                  <CardDescription>Track and manage your petty cash expenses</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 font-bold text-[10px] md:text-xs flex-1 sm:flex-none" onClick={() => guard(() => console.log("Add expense"), { actionName: "petty cash expense" })}>
                    Add Expense
                  </Button>
                  <Button className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] md:text-xs flex-1 sm:flex-none shadow-md shadow-indigo-100 text-white" onClick={() => guard(() => console.log("Replenish"), { actionName: "petty cash replenishment" })}>
                    Replenish
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold py-4">Date</TableHead>
                        <TableHead className="font-bold py-4">Description</TableHead>
                        <TableHead className="font-bold py-4">Category</TableHead>
                        <TableHead className="font-bold py-4">Amount</TableHead>
                        <TableHead className="font-bold py-4">Recorded By</TableHead>
                        <TableHead className="font-bold py-4">Status</TableHead>
                        <TableHead className="text-right font-bold py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pettyCashTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-slate-50/50">
                          <TableCell className="text-slate-500 font-medium text-xs md:text-sm">{transaction.date}</TableCell>
                          <TableCell className="font-bold text-slate-700 max-w-[200px] truncate text-xs md:text-sm">{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-lg bg-slate-50 text-slate-500 font-bold border-slate-200 text-[9px] md:text-[10px] whitespace-nowrap">{transaction.category}</Badge>
                          </TableCell>
                          <TableCell className="font-black text-xs md:text-sm text-slate-900">RWF {transaction.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-slate-500 text-xs md:text-sm">{transaction.recordedBy}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full px-2.5 md:px-3 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none whitespace-nowrap",
                              transaction.status === "Approved" ? "bg-emerald-50 text-emerald-600" : 
                              transaction.status === "Pending" ? "bg-amber-50 text-amber-600" : 
                              "bg-red-50 text-red-600"
                            )}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 rounded-full">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <DailyReportsModal
          open={reportsModalOpen}
          onOpenChange={setReportsModalOpen}
          type="finance"
        />
      </main>
    </div>
  );
}

function StatCard({ label, value, subtext }: { label: string, value: string, subtext: string }) {
  return (
    <Card className="rounded-[24px] md:rounded-[28px] border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] p-6 md:p-8 space-y-4 bg-white hover:border-indigo-100 hover:shadow-xl transition-all group active:scale-[0.98]">
      <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] group-hover:text-indigo-500 transition-colors">{label}</h4>
      <div className="space-y-1.5">
        <div className="text-[clamp(20px,2vw,30px)] font-black text-[#1E293B] tracking-tight leading-none">{value}</div>
        <p className="text-[clamp(10px,1.1vw,12px)] font-bold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-wider">{subtext}</p>
      </div>
    </Card>
  );
}

function BudgetProgress({ label, current, total, color }: { label: string, current: number, total: number, color: string }) {
  const percentage = Math.min((current / total) * 100, 100);
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="font-bold text-[#1E293B] text-sm md:text-[15px]">{label}</span>
        <div className="text-left sm:text-right">
          <span className="text-xs md:text-sm font-black text-slate-900">RWF {current.toLocaleString()}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 mx-1">/</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400">RWF {total.toLocaleString()}</span>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={cn(color, "h-full rounded-full transition-all duration-1000")} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

// Sample data
const spendingData = [
  { month: "Jan", spending: 10500, budget: 12000 },
  { month: "Feb", spending: 11200, budget: 12000 },
  { month: "Mar", spending: 10800, budget: 12000 },
  { month: "Apr", spending: 11500, budget: 12000 },
  { month: "May", spending: 12450, budget: 15000 },
];

const categoryData = [
  { month: "Jan", produce: 3200, meat: 4100, dairy: 1500, dryGoods: 1700 },
  { month: "Feb", produce: 3400, meat: 4300, dairy: 1600, dryGoods: 1900 },
  { month: "Mar", produce: 3300, meat: 4000, dairy: 1550, dryGoods: 1950 },
  { month: "Apr", produce: 3450, meat: 4200, dairy: 1700, dryGoods: 2150 },
  { month: "May", produce: 3500, meat: 4200, dairy: 1800, dryGoods: 2950 },
];

const transactions = [
  {
    id: "tx-001",
    date: "May 3, 2023",
    supplier: "Fresh Farms Inc.",
    orderId: "ORD-7891",
    amount: 245.5,
    status: "Pending",
  },
  {
    id: "tx-002",
    date: "May 2, 2023",
    supplier: "Metro Meats",
    orderId: "ORD-7890",
    amount: 320.75,
    status: "Paid",
  },
  {
    id: "tx-003",
    date: "May 1, 2023",
    supplier: "Global Grocers",
    orderId: "ORD-7889",
    amount: 178.25,
    status: "Paid",
  },
  {
    id: "tx-004",
    date: "Apr 30, 2023",
    supplier: "Organic Supplies Co.",
    orderId: "ORD-7888",
    amount: 210.0,
    status: "Paid",
  },
  {
    id: "tx-005",
    date: "Apr 29, 2023",
    supplier: "Dairy Delights",
    orderId: "ORD-7887",
    amount: 145.5,
    status: "Paid",
  },
];

const invoices = [
  {
    id: "INV-001",
    supplier: "Fresh Farms Inc.",
    issueDate: "May 3, 2023",
    dueDate: "Jun 2, 2023",
    amount: 245.5,
    status: "Pending",
  },
  {
    id: "INV-002",
    supplier: "Metro Meats",
    issueDate: "May 2, 2023",
    dueDate: "Jun 1, 2023",
    amount: 320.75,
    status: "Pending",
  },
  {
    id: "INV-003",
    supplier: "Global Grocers",
    issueDate: "May 1, 2023",
    dueDate: "May 31, 2023",
    amount: 178.25,
    status: "Pending",
  },
  {
    id: "INV-004",
    supplier: "Organic Supplies Co.",
    issueDate: "Apr 30, 2023",
    dueDate: "May 30, 2023",
    amount: 210.0,
    status: "Paid",
  },
  {
    id: "INV-005",
    supplier: "Dairy Delights",
    issueDate: "Apr 29, 2023",
    dueDate: "May 29, 2023",
    amount: 145.5,
    status: "Paid",
  },
];

const pettyCashTransactions = [
  {
    id: "pc-001",
    date: "May 5, 2023",
    description: "Emergency plumbing repair",
    category: "Maintenance",
    amount: 45000,
    recordedBy: "John Doe",
    status: "Approved",
  },
  {
    id: "pc-002",
    date: "May 4, 2023",
    description: "Staff transportation reimbursement",
    category: "Transportation",
    amount: 12000,
    recordedBy: "Jane Smith",
    status: "Approved",
  },
  {
    id: "pc-003",
    date: "May 3, 2023",
    description: "Office supplies",
    category: "Supplies",
    amount: 8500,
    recordedBy: "John Doe",
    status: "Pending",
  },
  {
    id: "pc-004",
    date: "May 2, 2023",
    description: "Staff meal during inventory",
    category: "Meals",
    amount: 25000,
    recordedBy: "Jane Smith",
    status: "Approved",
  },
  {
    id: "pc-005",
    date: "May 1, 2023",
    description: "Cleaning supplies",
    category: "Supplies",
    amount: 15000,
    recordedBy: "John Doe",
    status: "Rejected",
  },
];
