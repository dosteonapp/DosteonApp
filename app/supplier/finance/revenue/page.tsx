"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Menu,
  Download,
  ArrowLeft,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
} from "lucide-react"
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
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SupplierRevenueDetailsPage() {
  const [timeframe, setTimeframe] = useState("month")

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Revenue Details</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/supplier/finance">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Finance
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Revenue Details</h1>
            <p className="text-muted-foreground">Comprehensive analysis of your business revenue</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" asChild>
              <Link href="#">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 18,750,000</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-green-500">+12% from last month</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 265,000</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-green-500">+8% from last month</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-green-500">+5 from last month</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue per Customer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 446,428</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-green-500">+3% from last month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-customer">By Customer</TabsTrigger>
            <TabsTrigger value="by-product">By Product</TabsTrigger>
            <TabsTrigger value="by-location">By Location</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Your revenue trends over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
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
                    <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        strokeWidth={2}
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Product Category</CardTitle>
                  <CardDescription>Breakdown of revenue by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `RWF ${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Payment Method</CardTitle>
                  <CardDescription>Breakdown of revenue by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentMethodData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `RWF ${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="by-customer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Customer</CardTitle>
                <CardDescription>Breakdown of revenue by customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>% of Total</TableHead>
                        <TableHead>Growth</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerRevenueData.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.orders}</TableCell>
                          <TableCell>RWF {customer.revenue.toLocaleString()}</TableCell>
                          <TableCell>{customer.percentage}%</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {customer.growth > 0 ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="text-green-500">+{customer.growth}%</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                  <span className="text-red-500">{customer.growth}%</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/supplier/customers/${customer.id}`}>
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

            <Card>
              <CardHeader>
                <CardTitle>Customer Revenue Trends</CardTitle>
                <CardDescription>Revenue trends for your top 5 customers</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    customer1: {
                      label: "Bistro Bella",
                      color: "hsl(var(--chart-1))",
                    },
                    customer2: {
                      label: "Cafe Milano",
                      color: "hsl(var(--chart-2))",
                    },
                    customer3: {
                      label: "The Green Plate",
                      color: "hsl(var(--chart-3))",
                    },
                    customer4: {
                      label: "Spice Garden",
                      color: "hsl(var(--chart-4))",
                    },
                    customer5: {
                      label: "Taste of Asia",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={customerTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="customer1" stroke="var(--color-customer1)" name="Bistro Bella" />
                      <Line type="monotone" dataKey="customer2" stroke="var(--color-customer2)" name="Cafe Milano" />
                      <Line
                        type="monotone"
                        dataKey="customer3"
                        stroke="var(--color-customer3)"
                        name="The Green Plate"
                      />
                      <Line type="monotone" dataKey="customer4" stroke="var(--color-customer4)" name="Spice Garden" />
                      <Line type="monotone" dataKey="customer5" stroke="var(--color-customer5)" name="Taste of Asia" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-product" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product</CardTitle>
                <CardDescription>Breakdown of revenue by product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Units Sold</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>% of Total</TableHead>
                        <TableHead>Profit Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productRevenueData.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            {product.unitsSold.toLocaleString()} {product.unit}
                          </TableCell>
                          <TableCell>RWF {product.revenue.toLocaleString()}</TableCell>
                          <TableCell>{product.percentage}%</TableCell>
                          <TableCell>{product.profitMargin}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Revenue Trends</CardTitle>
                <CardDescription>Revenue trends for your top product categories</CardDescription>
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
                    <BarChart data={categorySalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="produce" fill="var(--color-produce)" name="Produce" />
                      <Bar dataKey="meat" fill="var(--color-meat)" name="Meat & Poultry" />
                      <Bar dataKey="dairy" fill="var(--color-dairy)" name="Dairy" />
                      <Bar dataKey="dryGoods" fill="var(--color-dryGoods)" name="Dry Goods" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Location</CardTitle>
                <CardDescription>Breakdown of revenue by customer location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Customers</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>% of Total</TableHead>
                        <TableHead>Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locationRevenueData.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell>{location.customers}</TableCell>
                          <TableCell>{location.orders}</TableCell>
                          <TableCell>RWF {location.revenue.toLocaleString()}</TableCell>
                          <TableCell>{location.percentage}%</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {location.growth > 0 ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="text-green-500">+{location.growth}%</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                  <span className="text-red-500">{location.growth}%</span>
                                </>
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

            <Card>
              <CardHeader>
                <CardTitle>Location Revenue Distribution</CardTitle>
                <CardDescription>Visual representation of revenue by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {locationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `RWF ${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Sample data
const revenueData = [
  { month: "Dec", revenue: 13800000, target: 14000000 },
  { month: "Jan", revenue: 14500000, target: 14500000 },
  { month: "Feb", revenue: 15200000, target: 15000000 },
  { month: "Mar", revenue: 16800000, target: 15500000 },
  { month: "Apr", revenue: 17500000, target: 16000000 },
  { month: "May", revenue: 18750000, target: 16500000 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

const categoryData = [
  { name: "Produce", value: 6800000 },
  { name: "Meat & Poultry", value: 5500000 },
  { name: "Dairy", value: 3800000 },
  { name: "Dry Goods", value: 2650000 },
]

const paymentMethodData = [
  { name: "Bank Transfer", value: 8500000 },
  { name: "Mobile Money", value: 6250000 },
  { name: "Cash on Delivery", value: 2500000 },
  { name: "Credit Card", value: 1500000 },
]

const customerRevenueData = [
  {
    id: "customer-001",
    name: "Bistro Bella",
    orders: 32,
    revenue: 3250000,
    percentage: 17.3,
    growth: 15,
  },
  {
    id: "customer-002",
    name: "Cafe Milano",
    orders: 28,
    revenue: 2850000,
    percentage: 15.2,
    growth: 8,
  },
  {
    id: "customer-003",
    name: "The Green Plate",
    orders: 25,
    revenue: 2450000,
    percentage: 13.1,
    growth: 12,
  },
  {
    id: "customer-004",
    name: "Spice Garden",
    orders: 22,
    revenue: 2150000,
    percentage: 11.5,
    growth: -3,
  },
  {
    id: "customer-005",
    name: "Taste of Asia",
    orders: 20,
    revenue: 1950000,
    percentage: 10.4,
    growth: 5,
  },
  {
    id: "customer-006",
    name: "Urban Eats",
    orders: 18,
    revenue: 1750000,
    percentage: 9.3,
    growth: 7,
  },
  {
    id: "customer-007",
    name: "Fresh Bites",
    orders: 15,
    revenue: 1450000,
    percentage: 7.7,
    growth: -2,
  },
  {
    id: "customer-008",
    name: "Harvest Table",
    orders: 14,
    revenue: 1350000,
    percentage: 7.2,
    growth: 10,
  },
  {
    id: "customer-009",
    name: "Seaside Grill",
    orders: 12,
    revenue: 1150000,
    percentage: 6.1,
    growth: 4,
  },
  {
    id: "customer-010",
    name: "Mountain View Restaurant",
    orders: 10,
    revenue: 950000,
    percentage: 5.1,
    growth: 6,
  },
]

const customerTrendsData = [
  {
    month: "Dec",
    customer1: 2800000,
    customer2: 2500000,
    customer3: 2100000,
    customer4: 1900000,
    customer5: 1700000,
  },
  {
    month: "Jan",
    customer1: 2850000,
    customer2: 2550000,
    customer3: 2150000,
    customer4: 1950000,
    customer5: 1750000,
  },
  {
    month: "Feb",
    customer1: 2950000,
    customer2: 2600000,
    customer3: 2200000,
    customer4: 1900000,
    customer5: 1800000,
  },
  {
    month: "Mar",
    customer1: 3050000,
    customer2: 2700000,
    customer3: 2300000,
    customer4: 2000000,
    customer5: 1850000,
  },
  {
    month: "Apr",
    customer1: 3150000,
    customer2: 2750000,
    customer3: 2350000,
    customer4: 2050000,
    customer5: 1900000,
  },
  {
    month: "May",
    customer1: 3250000,
    customer2: 2850000,
    customer3: 2450000,
    customer4: 2150000,
    customer5: 1950000,
  },
]

const productRevenueData = [
  {
    id: "product-001",
    name: "Tomatoes",
    category: "Produce",
    unitsSold: 5200,
    unit: "kg",
    revenue: 1300000,
    percentage: 6.9,
    profitMargin: 35,
  },
  {
    id: "product-002",
    name: "Chicken Breast",
    category: "Meat & Poultry",
    unitsSold: 3800,
    unit: "kg",
    revenue: 3610000,
    percentage: 19.3,
    profitMargin: 28,
  },
  {
    id: "product-003",
    name: "Onions",
    category: "Produce",
    unitsSold: 4500,
    unit: "kg",
    revenue: 810000,
    percentage: 4.3,
    profitMargin: 40,
  },
  {
    id: "product-004",
    name: "Milk",
    category: "Dairy",
    unitsSold: 7200,
    unit: "liter",
    revenue: 1080000,
    percentage: 5.8,
    profitMargin: 32,
  },
  {
    id: "product-005",
    name: "Ground Beef",
    category: "Meat & Poultry",
    unitsSold: 2800,
    unit: "kg",
    revenue: 2296000,
    percentage: 12.2,
    profitMargin: 25,
  },
  {
    id: "product-006",
    name: "Potatoes",
    category: "Produce",
    unitsSold: 6500,
    unit: "kg",
    revenue: 1430000,
    percentage: 7.6,
    profitMargin: 38,
  },
  {
    id: "product-007",
    name: "Cheese",
    category: "Dairy",
    unitsSold: 2200,
    unit: "kg",
    revenue: 1760000,
    percentage: 9.4,
    profitMargin: 30,
  },
  {
    id: "product-008",
    name: "Rice",
    category: "Dry Goods",
    unitsSold: 3800,
    unit: "kg",
    revenue: 1520000,
    percentage: 8.1,
    profitMargin: 42,
  },
  {
    id: "product-009",
    name: "Eggs",
    category: "Dairy",
    unitsSold: 8500,
    unit: "dozen",
    revenue: 935000,
    percentage: 5.0,
    profitMargin: 35,
  },
  {
    id: "product-010",
    name: "Flour",
    category: "Dry Goods",
    unitsSold: 2800,
    unit: "kg",
    revenue: 1120000,
    percentage: 6.0,
    profitMargin: 45,
  },
]

const categorySalesData = [
  { month: "Jan", produce: 5200000, meat: 4100000, dairy: 3500000, dryGoods: 1700000 },
  { month: "Feb", produce: 5400000, meat: 4300000, dairy: 3600000, dryGoods: 1900000 },
  { month: "Mar", produce: 6300000, meat: 5000000, dairy: 3550000, dryGoods: 1950000 },
  { month: "Apr", produce: 6450000, meat: 5200000, dairy: 3700000, dryGoods: 2150000 },
  { month: "May", produce: 6800000, meat: 5500000, dairy: 3800000, dryGoods: 2650000 },
]

const locationRevenueData = [
  {
    id: "location-001",
    name: "Kigali City Center",
    customers: 15,
    orders: 85,
    revenue: 8500000,
    percentage: 45.3,
    growth: 12,
  },
  {
    id: "location-002",
    name: "Nyarutarama",
    customers: 8,
    orders: 45,
    revenue: 4250000,
    percentage: 22.7,
    growth: 15,
  },
  {
    id: "location-003",
    name: "Kimihurura",
    customers: 6,
    orders: 32,
    revenue: 2850000,
    percentage: 15.2,
    growth: 8,
  },
  {
    id: "location-004",
    name: "Gikondo",
    customers: 5,
    orders: 25,
    revenue: 1750000,
    percentage: 9.3,
    growth: -3,
  },
  {
    id: "location-005",
    name: "Remera",
    customers: 4,
    orders: 18,
    revenue: 1400000,
    percentage: 7.5,
    growth: 5,
  },
]

const locationChartData = [
  { name: "Kigali City Center", value: 8500000 },
  { name: "Nyarutarama", value: 4250000 },
  { name: "Kimihurura", value: 2850000 },
  { name: "Gikondo", value: 1750000 },
  { name: "Remera", value: 1400000 },
]
