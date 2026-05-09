"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Analytics</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/analytics/export">Export Data</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Track your sales performance over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    sales: {
                      label: "Sales",
                      color: "hsl(var(--chart-1))",
                    },
                    target: {
                      label: "Target",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="var(--color-sales)"
                        name="Sales"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="var(--color-target)"
                        name="Target"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
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
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                  Your best performing products by sales volume
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    sales: {
                      label: "Sales",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProductsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        dataKey="sales"
                        fill="var(--color-sales)"
                        name="Sales"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Growth rate of your products</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    growth: {
                      label: "Growth",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productGrowthData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        dataKey="growth"
                        fill="var(--color-growth)"
                        name="Growth %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="customers" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Customer Analytics</h2>
              <Button asChild>
                <Link href="/dashboard/analytics/customer-engagement">
                  View Customer Engagement
                </Link>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your customer base
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {customerDistributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} customers`,
                          name,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
                <CardDescription>
                  Monthly customer retention rate
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    retention: {
                      label: "Retention Rate",
                      color: "hsl(var(--chart-1))",
                    },
                    target: {
                      label: "Target",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={retentionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="retention"
                        stroke="var(--color-retention)"
                        name="Retention Rate"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="var(--color-target)"
                        name="Target"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Sample data
const salesData = [
  { date: "Jan", sales: 4000, target: 4500 },
  { date: "Feb", sales: 4200, target: 4500 },
  { date: "Mar", sales: 5800, target: 5000 },
  { date: "Apr", sales: 5200, target: 5000 },
  { date: "May", sales: 6000, target: 5500 },
];

const categorySalesData = [
  { month: "Jan", produce: 1200, meat: 1800, dairy: 400, dryGoods: 600 },
  { month: "Feb", produce: 1300, meat: 1700, dairy: 500, dryGoods: 700 },
  { month: "Mar", produce: 1800, meat: 2500, dairy: 700, dryGoods: 800 },
  { month: "Apr", produce: 1600, meat: 2200, dairy: 600, dryGoods: 800 },
  { month: "May", produce: 1900, meat: 2400, dairy: 800, dryGoods: 900 },
];

const topProductsData = [
  { name: "Tomatoes", sales: 45 },
  { name: "Chicken Breast", sales: 38 },
  { name: "Milk", sales: 32 },
  { name: "Onions", sales: 30 },
  { name: "Olive Oil", sales: 28 },
];

const productGrowthData = [
  { name: "Tomatoes", growth: 15 },
  { name: "Chicken Breast", growth: 22 },
  { name: "Milk", growth: 8 },
  { name: "Onions", growth: 12 },
  { name: "Olive Oil", growth: 18 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const customerDistributionData = [
  { name: "Fine Dining", value: 8 },
  { name: "Casual Dining", value: 12 },
  { name: "Fast Casual", value: 5 },
  { name: "Cafes", value: 4 },
  { name: "Food Trucks", value: 3 },
];

const retentionData = [
  { month: "Jan", retention: 85, target: 90 },
  { month: "Feb", retention: 88, target: 90 },
  { month: "Mar", retention: 92, target: 90 },
  { month: "Apr", retention: 90, target: 90 },
  { month: "May", retention: 94, target: 90 },
];
