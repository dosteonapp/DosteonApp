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
import { useSearchParams } from "next/navigation";
import { DailyReportsModal } from "@/components/daily-reports-modal";

export default function FinancePage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Finance</h1>
        </div>
      </header> */}
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
            <Button variant="outline" asChild>
              <Link href="/dashboard/finance/export">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spend (MTD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 12,450,000</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Outstanding Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 3,250,000</div>
              <p className="text-xs text-muted-foreground">
                5 invoices pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 245,000</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 1,800,000</div>
              <p className="text-xs text-muted-foreground">Due in 7 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="petty-cash">Petty Cash</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spending Overview</CardTitle>
                <CardDescription>
                  Your spending trends over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    spending: {
                      label: "Spending",
                      color: "hsl(var(--chart-1))",
                    },
                    budget: {
                      label: "Budget",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={spendingData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="spending"
                        stroke="var(--color-spending)"
                        name="Spending"
                      />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        stroke="var(--color-budget)"
                        name="Budget"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Breakdown of your spending by category
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
                      data={categoryData}
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
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your recent payment activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.supplier}</TableCell>
                          <TableCell>{transaction.orderId}</TableCell>
                          <TableCell>
                            RWF {transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                transaction.status === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" asChild>
                              <Link
                                href={`/dashboard/finance/transactions/${transaction.id}`}
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
                        <TableHead>Supplier</TableHead>
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
                          <TableCell>{invoice.supplier}</TableCell>
                          <TableCell>{invoice.issueDate}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell>
                            RWF {invoice.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                invoice.status === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : invoice.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {invoice.status === "Pending" && (
                                <Button size="sm">Pay</Button>
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
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Planning</CardTitle>
                <CardDescription>
                  Manage your procurement budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Monthly Budget
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">RWF 15,000,000</div>
                        <p className="text-xs text-muted-foreground">
                          RWF 12,450,000 spent this month
                        </p>
                        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full"
                            style={{ width: "83%" }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          83% of budget used
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Annual Budget
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          RWF 180,000,000
                        </div>
                        <p className="text-xs text-muted-foreground">
                          RWF 65,230,000 spent this year
                        </p>
                        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full"
                            style={{ width: "36%" }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          36% of budget used
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Budget by Category</CardTitle>
                      <CardDescription>
                        Track spending against budget by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Produce</span>
                            <span>RWF 3,500,000 / RWF 5,000,000</span>
                          </div>
                          <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="bg-green-500 h-full"
                              style={{ width: "70%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Meat & Poultry</span>
                            <span>RWF 4,200,000 / RWF 5,000,000</span>
                          </div>
                          <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="bg-yellow-500 h-full"
                              style={{ width: "84%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Dairy</span>
                            <span>RWF 1,800,000 / RWF 2,500,000</span>
                          </div>
                          <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full"
                              style={{ width: "72%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Dry Goods</span>
                            <span>RWF 2,950,000 / RWF 2,500,000</span>
                          </div>
                          <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="bg-red-500 h-full"
                              style={{ width: "100%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="petty-cash" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Petty Cash Management</CardTitle>
                <CardDescription>
                  Track and manage your petty cash expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Current Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">RWF 125,000</div>
                      <p className="text-xs text-muted-foreground">
                        Last updated: Today
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Monthly Expenses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">RWF 350,000</div>
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Last Replenishment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">RWF 200,000</div>
                      <p className="text-xs text-muted-foreground">
                        May 15, 2023
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pending Approvals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-xs text-muted-foreground">
                        Expenses awaiting approval
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Recent Transactions</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Add Expense
                    </Button>
                    <Button variant="outline" size="sm">
                      Replenish
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Recorded By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pettyCashTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            RWF {transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{transaction.recordedBy}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                transaction.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">
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
