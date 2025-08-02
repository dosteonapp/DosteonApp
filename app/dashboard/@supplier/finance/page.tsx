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
import {
  Menu,
  Download,
  ArrowUpRight,
  FileText,
  BarChart3,
} from "lucide-react";
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
import { DailyReportsModal } from "@/components/daily-reports-modal";

export default function SupplierFinancePage() {
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Finance</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-1"
              onClick={() => setReportsModalOpen(true)}
            >
              <FileText className="h-4 w-4" />
              Daily Reports
            </Button>
            {/* <Button variant="outline" asChild>
              <Link href="/supplier/finance/export">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Link>
            </Button> */}
            {/* <Button variant="default" asChild>
              <Link href="/supplier/finance/revenue">
                <BarChart3 className="mr-2 h-4 w-4" />
                Revenue Details
              </Link>
            </Button> */}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sale's Revenue (July)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 18,750,000</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Outstanding Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 4,250,000</div>
              <p className="text-xs text-muted-foreground">
                8 invoices pending
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 265,000</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
          {/* <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profit Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32.5%</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last month
              </p>
            </CardContent>
          </Card> */}
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Your revenue trends over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                    expenses: {
                      label: "Expenses",
                      color: "hsl(var(--chart-2))",
                    },
                    profit: {
                      label: "Profit",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="var(--color-expenses)"
                        name="Expenses"
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="var(--color-profit)"
                        name="Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Product Category</CardTitle>
                <CardDescription>
                  Breakdown of your sales by product category
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    produce: {
                      label: "Produce",
                      color: "hsl(var(--chart-1))",
                    },
                    meat: {
                      label: "Meat & Poultry",
                      color: "hsl(var(--chart-2))",
                    },
                    dairy: {
                      label: "Dairy",
                      color: "hsl(var(--chart-3))",
                    },
                    dryGoods: {
                      label: "Dry Goods",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categorySalesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        dataKey="produce"
                        fill="var(--color-produce)"
                        name="Produce"
                      />
                      <Bar
                        dataKey="meat"
                        fill="var(--color-meat)"
                        name="Meat & Poultry"
                      />
                      <Bar
                        dataKey="dairy"
                        fill="var(--color-dairy)"
                        name="Dairy"
                      />
                      <Bar
                        dataKey="dryGoods"
                        fill="var(--color-dryGoods)"
                        name="Dry Goods"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Your recent sales activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell>{sale.customer}</TableCell>
                          <TableCell>{sale.orderId}</TableCell>
                          <TableCell>
                            RWF {sale.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                sale.status === "Completed"
                                  ? "bg-green-500 text-white"
                                  : sale.status === "Processing"
                                  ? "bg-blue-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {sale.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/supplier/finance/sales/${sale.id}`}>
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
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Manage your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.id}</TableCell>
                          <TableCell>{invoice.customer}</TableCell>
                          <TableCell>{invoice.issueDate}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell>
                            RWF {invoice.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                invoice.status === "Paid"
                                  ? "bg-green-500 text-white"
                                  : invoice.status === "Pending"
                                  ? "bg-blue-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link
                                  href={`/supplier/finance/invoices/${invoice.id}`}
                                >
                                  View
                                </Link>
                              </Button>
                              <Button size="sm">Send Reminder</Button>
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
          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>
                  Track and manage your business expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>
                            RWF {expense.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                expense.status === "Paid"
                                  ? "bg-green-500 text-white"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              {expense.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" asChild>
                              <Link
                                href={`/supplier/finance/expenses/${expense.id}`}
                              >
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
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Access and generate financial reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Profit & Loss
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View your profit and loss statement for any time period
                      </p>
                      <Button className="mt-4" variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Balance Sheet
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View your company's assets, liabilities, and equity
                      </p>
                      <Button className="mt-4" variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Cash Flow
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Track the flow of cash in and out of your business
                      </p>
                      <Button className="mt-4" variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Sales Tax
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View and export sales tax reports for tax filing
                      </p>
                      <Button className="mt-4" variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Customer Statements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Generate statements for your customers
                      </p>
                      <Button className="mt-4" variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Inventory Valuation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View the current value of your inventory
                      </p>
                      <Button className="mt-4" variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
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

// Sample data
const revenueData = [
  { month: "Jan", revenue: 14500000, expenses: 9800000, profit: 4700000 },
  { month: "Feb", revenue: 15200000, expenses: 10100000, profit: 5100000 },
  { month: "Mar", revenue: 16800000, expenses: 11200000, profit: 5600000 },
  { month: "Apr", revenue: 17500000, expenses: 11800000, profit: 5700000 },
  { month: "May", revenue: 18750000, expenses: 12650000, profit: 6100000 },
];

const categorySalesData = [
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

const sales = [
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

const invoices = [
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

const expenses = [
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
