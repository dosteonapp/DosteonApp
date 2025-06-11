"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package, Menu, Download, AlertTriangle } from "lucide-react"
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
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ForecastingPage() {
  const [timeframe, setTimeframe] = useState("weekly")
  const [productCategory, setProductCategory] = useState("all")

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Demand Forecasting</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Demand Forecasting</h1>
            <p className="text-muted-foreground">AI-powered predictions to optimize your inventory and production</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly View</SelectItem>
                <SelectItem value="monthly">Monthly View</SelectItem>
                <SelectItem value="quarterly">Quarterly View</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Forecast Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timeframe === "weekly" ? "32" : timeframe === "monthly" ? "128" : "384"}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeframe === "weekly" ? "Next 7 days" : timeframe === "monthly" ? "Next 30 days" : "Next 90 days"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recommended Production</CardTitle>
              <Package className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timeframe === "weekly" ? "1,250 kg" : timeframe === "monthly" ? "5,100 kg" : "15,300 kg"}
              </div>
              <p className="text-xs text-muted-foreground">Based on projected demand</p>
            </CardContent>
          </Card>

          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timeframe === "weekly" ? "RWF 8.2M" : timeframe === "monthly" ? "RWF 32.5M" : "RWF 97.8M"}
              </div>
              <p className="text-xs text-muted-foreground">Projected revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prediction Confidence</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timeframe === "weekly" ? "92%" : timeframe === "monthly" ? "85%" : "78%"}
              </div>
              <p className="text-xs text-muted-foreground">AI model confidence score</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-product">By Product</TabsTrigger>
            <TabsTrigger value="by-customer">By Customer</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecast Overview</CardTitle>
                <CardDescription>Projected order volume for the next period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={
                      timeframe === "weekly"
                        ? weeklyForecastData
                        : timeframe === "monthly"
                          ? monthlyForecastData
                          : quarterlyForecastData
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      name="Projected Orders"
                    />
                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual Orders" />
                    <Line
                      type="monotone"
                      dataKey="lastPeriod"
                      stroke="#6b7280"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="Last Period"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Note:</span> Projections are based on historical data, seasonal
                  patterns, and market trends.
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  AI-Powered Prediction
                </Badge>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demand Drivers</CardTitle>
                <CardDescription>Factors influencing projected demand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Impact Factors</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={demandDrivers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="factor" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="impact" fill="#0ea5e9" name="Impact Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Demand Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={demandDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {demandDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-product" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Product Demand Forecast</h2>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="meat">Meat & Poultry</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="dry-goods">Dry Goods</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Demand Forecast</CardTitle>
                <CardDescription>Projected demand by product for the next period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Projected Demand</TableHead>
                        <TableHead>Recommended Production</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productForecast
                        .filter(
                          (product) =>
                            productCategory === "all" ||
                            product.category.toLowerCase().replace(/\s+/g, "-") === productCategory,
                        )
                        .map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>
                              {product.currentStock} {product.unit}
                            </TableCell>
                            <TableCell>
                              {product.projectedDemand} {product.unit}
                            </TableCell>
                            <TableCell>
                              {product.recommendedProduction} {product.unit}
                              {product.currentStock < product.projectedDemand && (
                                <Badge variant="destructive" className="ml-2">
                                  Low Stock
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  product.confidence >= 90
                                    ? "bg-green-50 text-green-700"
                                    : product.confidence >= 75
                                      ? "bg-yellow-50 text-yellow-700"
                                      : "bg-red-50 text-red-700"
                                }
                              >
                                {product.confidence}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-customer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Demand Forecast</CardTitle>
                <CardDescription>Projected orders by customer for the next period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Order Frequency</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Projected Next Order</TableHead>
                        <TableHead>Projected Value</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerForecast.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.orderFrequency}</TableCell>
                          <TableCell>{customer.lastOrder}</TableCell>
                          <TableCell>{customer.projectedNextOrder}</TableCell>
                          <TableCell>RWF {customer.projectedValue.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                customer.confidence >= 90
                                  ? "bg-green-50 text-green-700"
                                  : customer.confidence >= 75
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-red-50 text-red-700"
                              }
                            >
                              {customer.confidence}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Trends</CardTitle>
                <CardDescription>Demand patterns throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="produce" stroke="#10b981" strokeWidth={2} name="Produce" />
                    <Line type="monotone" dataKey="meat" stroke="#ef4444" strokeWidth={2} name="Meat & Poultry" />
                    <Line type="monotone" dataKey="dairy" stroke="#0ea5e9" strokeWidth={2} name="Dairy" />
                    <Line type="monotone" dataKey="dryGoods" stroke="#f59e0b" strokeWidth={2} name="Dry Goods" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Note:</span> Seasonal patterns are based on historical data and may be
                  affected by holidays, events, and weather patterns.
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Seasonal Events</CardTitle>
                <CardDescription>Events that may impact demand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seasonalEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <h3 className="font-medium">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                        <p className="text-sm mt-1">{event.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            event.impactLevel === "High"
                              ? "bg-red-50 text-red-700"
                              : event.impactLevel === "Medium"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-blue-50 text-blue-700"
                          }
                        >
                          {event.impactLevel} Impact
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.impactLevel === "High"
                            ? "+40-60% demand"
                            : event.impactLevel === "Medium"
                              ? "+20-40% demand"
                              : "+5-20% demand"}
                        </p>
                      </div>
                    </div>
                  ))}
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
const weeklyForecastData = [
  { period: "Mon", projected: 12, actual: 10, lastPeriod: 9 },
  { period: "Tue", projected: 15, actual: 14, lastPeriod: 12 },
  { period: "Wed", projected: 18, actual: 19, lastPeriod: 15 },
  { period: "Thu", projected: 16, actual: 15, lastPeriod: 14 },
  { period: "Fri", projected: 22, actual: 21, lastPeriod: 18 },
  { period: "Sat", projected: 26, actual: null, lastPeriod: 22 },
  { period: "Sun", projected: 18, actual: null, lastPeriod: 16 },
]

const monthlyForecastData = [
  { period: "Week 1", projected: 32, actual: 30, lastPeriod: 28 },
  { period: "Week 2", projected: 36, actual: 35, lastPeriod: 30 },
  { period: "Week 3", projected: 30, actual: 28, lastPeriod: 26 },
  { period: "Week 4", projected: 30, actual: null, lastPeriod: 25 },
]

const quarterlyForecastData = [
  { period: "Month 1", projected: 128, actual: 125, lastPeriod: 115 },
  { period: "Month 2", projected: 136, actual: null, lastPeriod: 120 },
  { period: "Month 3", projected: 120, actual: null, lastPeriod: 110 },
]

const demandDrivers = [
  { factor: "Seasonality", impact: 85 },
  { factor: "Holidays", impact: 70 },
  { factor: "Weather", impact: 60 },
  { factor: "Promotions", impact: 50 },
  { factor: "Market Trends", impact: 40 },
]

const demandDistribution = [
  { name: "Regular Orders", value: 65 },
  { name: "Seasonal Demand", value: 20 },
  { name: "Special Events", value: 10 },
  { name: "New Customers", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const productForecast = [
  {
    id: "prod-1",
    name: "Tomatoes",
    category: "Produce",
    currentStock: 150,
    projectedDemand: 220,
    recommendedProduction: 100,
    unit: "kg",
    confidence: 92,
  },
  {
    id: "prod-2",
    name: "Onions",
    category: "Produce",
    currentStock: 200,
    projectedDemand: 180,
    recommendedProduction: 0,
    unit: "kg",
    confidence: 95,
  },
  {
    id: "prod-3",
    name: "Potatoes",
    category: "Produce",
    currentStock: 300,
    projectedDemand: 250,
    recommendedProduction: 0,
    unit: "kg",
    confidence: 90,
  },
  {
    id: "prod-4",
    name: "Chicken Breast",
    category: "Meat & Poultry",
    currentStock: 80,
    projectedDemand: 120,
    recommendedProduction: 50,
    unit: "kg",
    confidence: 88,
  },
  {
    id: "prod-5",
    name: "Ground Beef",
    category: "Meat & Poultry",
    currentStock: 60,
    projectedDemand: 90,
    recommendedProduction: 40,
    unit: "kg",
    confidence: 85,
  },
  {
    id: "prod-6",
    name: "Milk",
    category: "Dairy",
    currentStock: 100,
    projectedDemand: 150,
    recommendedProduction: 60,
    unit: "liter",
    confidence: 93,
  },
  {
    id: "prod-7",
    name: "Cheese",
    category: "Dairy",
    currentStock: 40,
    projectedDemand: 60,
    recommendedProduction: 30,
    unit: "kg",
    confidence: 87,
  },
  {
    id: "prod-8",
    name: "Rice",
    category: "Dry Goods",
    currentStock: 250,
    projectedDemand: 200,
    recommendedProduction: 0,
    unit: "kg",
    confidence: 96,
  },
]

const customerForecast = [
  {
    id: "cust-1",
    name: "Bistro Bella",
    orderFrequency: "Weekly",
    lastOrder: "May 1, 2023",
    projectedNextOrder: "May 8, 2023",
    projectedValue: 245000,
    confidence: 95,
  },
  {
    id: "cust-2",
    name: "Cafe Milano",
    orderFrequency: "Bi-weekly",
    lastOrder: "Apr 28, 2023",
    projectedNextOrder: "May 12, 2023",
    projectedValue: 320000,
    confidence: 92,
  },
  {
    id: "cust-3",
    name: "The Green Plate",
    orderFrequency: "Weekly",
    lastOrder: "May 2, 2023",
    projectedNextOrder: "May 9, 2023",
    projectedValue: 178000,
    confidence: 88,
  },
  {
    id: "cust-4",
    name: "Spice Garden",
    orderFrequency: "Monthly",
    lastOrder: "Apr 15, 2023",
    projectedNextOrder: "May 15, 2023",
    projectedValue: 450000,
    confidence: 80,
  },
  {
    id: "cust-5",
    name: "Taste of Asia",
    orderFrequency: "Weekly",
    lastOrder: "May 3, 2023",
    projectedNextOrder: "May 10, 2023",
    projectedValue: 210000,
    confidence: 90,
  },
]

const seasonalTrends = [
  { month: "Jan", produce: 80, meat: 90, dairy: 85, dryGoods: 70 },
  { month: "Feb", produce: 85, meat: 85, dairy: 80, dryGoods: 75 },
  { month: "Mar", produce: 90, meat: 80, dairy: 85, dryGoods: 80 },
  { month: "Apr", produce: 100, meat: 85, dairy: 90, dryGoods: 85 },
  { month: "May", produce: 110, meat: 90, dairy: 95, dryGoods: 90 },
  { month: "Jun", produce: 120, meat: 100, dairy: 100, dryGoods: 95 },
  { month: "Jul", produce: 115, meat: 110, dairy: 105, dryGoods: 100 },
  { month: "Aug", produce: 110, meat: 105, dairy: 100, dryGoods: 95 },
  { month: "Sep", produce: 105, meat: 100, dairy: 95, dryGoods: 90 },
  { month: "Oct", produce: 95, meat: 95, dairy: 90, dryGoods: 85 },
  { month: "Nov", produce: 90, meat: 110, dairy: 95, dryGoods: 95 },
  { month: "Dec", produce: 100, meat: 120, dairy: 110, dryGoods: 110 },
]

const seasonalEvents = [
  {
    id: "event-1",
    name: "Independence Day",
    date: "July 1-4, 2023",
    description: "National holiday with increased restaurant activity and special menus.",
    impactLevel: "High",
  },
  {
    id: "event-2",
    name: "Restaurant Week",
    date: "May 15-22, 2023",
    description: "Annual event where restaurants offer special prix fixe menus to attract customers.",
    impactLevel: "Medium",
  },
  {
    id: "event-3",
    name: "Summer Tourism Season",
    date: "June 1 - August 31, 2023",
    description: "Increased tourism leads to higher restaurant traffic and demand for fresh ingredients.",
    impactLevel: "High",
  },
  {
    id: "event-4",
    name: "Local Food Festival",
    date: "May 28-29, 2023",
    description: "Weekend event celebrating local cuisine and ingredients.",
    impactLevel: "Low",
  },
]

// Import for DollarSign icon
import { DollarSign } from "lucide-react"
