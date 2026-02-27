"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Package,
  TrendingUp,
  Menu,
  ArrowUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function SupplierDashboard() {
  const [timeframe, setTimeframe] = useState("weekly");

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight font-inria italic">
            Supplier Dashboard
          </h1>
          <div className="flex items-center gap-2">
            {/* <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly View</SelectItem>
                <SelectItem value="monthly">Monthly View</SelectItem>
                <SelectItem value="quarterly">Quarterly View</SelectItem>
              </SelectContent>
            </Select> */}
            <Button asChild className="bg-primary hover:bg-primary-600">
              <Link href="/dashboard/products/new">
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Predictive Insights Section */}
        {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> */}
        {/* <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">
                Projected Orders (Next Week)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+15% from last week</span>
              </div>
            </CardContent>
          </Card> */}
        {/* 
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">
                Recommended Production
              </CardTitle>
              <Package className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250 kg</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+8% from last week</span>
              </div>
            </CardContent>
          </Card> */}
        {/* 
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">
                Expected Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 8.2M</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+12% from last week</span>
              </div>
            </CardContent>
          </Card> */}

        {/* <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Reliability Score</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+3% from last month</span>
              </div>
            </CardContent>
          </Card> */}
        {/* </div> */}

        {/* <div className="grid gap-4 md:grid-cols-7"> */}
        {/* Demand Forecasting */}
        {/* <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Demand Forecast</CardTitle>
              <CardDescription>
                Projected order volume for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
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
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Actual Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/forecasting">View Detailed Forecast</Link>
              </Button>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-50"
              >
                AI-Powered Prediction
              </Badge>
            </CardFooter>
          </Card> */}

        {/* Top Consistent Customers */}
        {/* <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Most Consistent Customers</CardTitle>
              <CardDescription>
                Restaurants with the most reliable ordering patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consistentCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-start justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <div className="flex items-center mt-1">
                        <Badge
                          variant="outline"
                          className="mr-2 bg-green-50 text-green-700 hover:bg-green-50"
                        >
                          {customer.orderFrequency}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {customer.avgOrderValue} avg. order
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {customer.consistencyScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        consistency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/customers">View All Customers</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Payment Calendar</CardTitle>
              <CardDescription>Upcoming and overdue payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentCalendar.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-start justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full p-1 ${
                          payment.status === "upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : payment.status === "due-today"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {payment.status === "upcoming" ? (
                          <Clock className="h-3 w-3" />
                        ) : payment.status === "due-today" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{payment.customer}</h3>
                        <p className="text-sm text-muted-foreground">
                          Invoice #{payment.invoiceId} • {payment.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        RWF {payment.amount.toLocaleString()}
                      </div>
                      <div
                        className={`text-xs ${
                          payment.status === "upcoming"
                            ? "text-blue-600"
                            : payment.status === "due-today"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {payment.status === "upcoming"
                          ? "Due in " + payment.daysRemaining + " days"
                          : payment.status === "due-today"
                          ? "Due today"
                          : "Overdue by " +
                            Math.abs(payment.daysRemaining) +
                            " days"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/payments">View Payment Calendar</Link>
              </Button>
            </CardFooter>
          </Card> */}
        {/* </div> */}

        {/* Payment Insights */}
        <div className="grid gap-4 md:grid-cols-7">
          {/* Performance Metrics */}
          {/* <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key reliability and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">
                    On-Time Delivery Rate
                  </div>
                  <div className="text-sm font-semibold">94%</div>
                </div>
                <Progress value={94} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">
                    Order Fulfillment Rate
                  </div>
                  <div className="text-sm font-semibold">98%</div>
                </div>
                <Progress value={98} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">
                    Customer Satisfaction
                  </div>
                  <div className="text-sm font-semibold">4.8/5</div>
                </div>
                <Progress value={96} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">
                    Product Quality Rating
                  </div>
                  <div className="text-sm font-semibold">4.7/5</div>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/performance">
                  View Detailed Performance
                </Link>
              </Button>
            </CardFooter>
          </Card> */}
        </div>

        <Tabs
          defaultValue="new-orders"
          className="[&_[data-state=active]]:text-primary-500 [&_[data-state=active]]:border-b-primary-500"
        >
          <TabsList>
            <TabsTrigger value="new-orders">New Orders</TabsTrigger>
            <TabsTrigger value="pending-delivery">Pending Delivery</TabsTrigger>
            {/* <TabsTrigger value="top-products">Top Products</TabsTrigger> */}
          </TabsList>
          <TabsContent value="new-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New Orders</CardTitle>
                <CardDescription>
                  Orders that need your confirmation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.restaurant} • {order.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{order.status}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="border-primary-500 text-primary-500 hover:bg-primary-50"
                        >
                          <Link href={`/dashboard/orders/${order.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending-delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Deliveries</CardTitle>
                <CardDescription>
                  Orders that need to be delivered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDeliveries.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.restaurant} • Confirmed:{" "}
                            {order.confirmedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            order.status === "Confirmed"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="border-primary-500 text-primary-500 hover:bg-primary-50"
                        >
                          <Link href={`/dashboard/orders/${order.id}`}>
                            Update
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="top-products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                  Your most popular products this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            RWF {product.price.toLocaleString()} /{" "}
                            {product.unit} • {product.orders} orders
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/dashboard/products/${product.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Sample data
const newOrders = [
  {
    id: "ORD-7891",
    restaurant: "Bistro Bella",
    date: "Today, 10:30 AM",
    status: "Pending",
  },
  {
    id: "ORD-7892",
    restaurant: "Cafe Milano",
    date: "Today, 9:15 AM",
    status: "Pending",
  },
  {
    id: "ORD-7893",
    restaurant: "The Green Plate",
    date: "Yesterday, 4:45 PM",
    status: "Pending",
  },
  {
    id: "ORD-7894",
    restaurant: "Spice Garden",
    date: "Yesterday, 2:30 PM",
    status: "Pending",
  },
];

const pendingDeliveries = [
  {
    id: "ORD-7885",
    restaurant: "Bistro Bella",
    confirmedDate: "May 2, 2023",
    status: "Confirmed",
  },
  {
    id: "ORD-7886",
    restaurant: "Cafe Milano",
    confirmedDate: "May 2, 2023",
    status: "Confirmed",
  },
  {
    id: "ORD-7887",
    restaurant: "The Green Plate",
    confirmedDate: "May 1, 2023",
    status: "In Transit",
  },
  {
    id: "ORD-7888",
    restaurant: "Spice Garden",
    confirmedDate: "May 1, 2023",
    status: "In Transit",
  },
];

const topProducts = [
  {
    id: "prod-1",
    name: "Tomatoes",
    price: 2.99,
    unit: "kg",
    orders: 45,
  },
  {
    id: "prod-4",
    name: "Chicken Breast",
    price: 8.99,
    unit: "kg",
    orders: 38,
  },
  {
    id: "prod-6",
    name: "Milk",
    price: 3.29,
    unit: "liter",
    orders: 32,
  },
  {
    id: "prod-2",
    name: "Onions",
    price: 1.49,
    unit: "kg",
    orders: 30,
  },
  {
    id: "prod-10",
    name: "Olive Oil",
    price: 9.99,
    unit: "liter",
    orders: 28,
  },
];

// New data for predictive insights
const demandForecastData = [
  { day: "Mon", projected: 12, actual: 10 },
  { day: "Tue", projected: 15, actual: 14 },
  { day: "Wed", projected: 18, actual: 19 },
  { day: "Thu", projected: 16, actual: 15 },
  { day: "Fri", projected: 22, actual: 21 },
  { day: "Sat", projected: 26, actual: null },
  { day: "Sun", projected: 18, actual: null },
];

const consistentCustomers = [
  {
    id: "cust-1",
    name: "Bistro Bella",
    orderFrequency: "Weekly",
    avgOrderValue: "RWF 245,000",
    consistencyScore: 95,
  },
  {
    id: "cust-2",
    name: "Cafe Milano",
    orderFrequency: "Bi-weekly",
    avgOrderValue: "RWF 320,000",
    consistencyScore: 92,
  },
  {
    id: "cust-3",
    name: "The Green Plate",
    orderFrequency: "Weekly",
    avgOrderValue: "RWF 178,000",
    consistencyScore: 88,
  },
];

const paymentCalendar = [
  {
    id: "pay-1",
    customer: "Bistro Bella",
    invoiceId: "INV-001",
    amount: 245500,
    date: "May 10, 2023",
    status: "upcoming",
    daysRemaining: 7,
  },
  {
    id: "pay-2",
    customer: "Cafe Milano",
    invoiceId: "INV-002",
    amount: 320750,
    date: "May 3, 2023",
    status: "due-today",
    daysRemaining: 0,
  },
  {
    id: "pay-3",
    customer: "The Green Plate",
    invoiceId: "INV-003",
    amount: 178250,
    date: "May 1, 2023",
    status: "overdue",
    daysRemaining: -2,
  },
  {
    id: "pay-4",
    customer: "Spice Garden",
    invoiceId: "INV-004",
    amount: 210000,
    date: "May 15, 2023",
    status: "upcoming",
    daysRemaining: 12,
  },
];

// Import for DollarSign icon
import { DollarSign } from "lucide-react";
