"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  StarHalf,
  StarOff,
  ShoppingCart,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [customer] = useState(() => {
    return customers.find((c) => c.id === params.id) || customers[0];
  });

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <Badge
            variant={
              customer.status === "Active"
                ? "default"
                : customer.status === "New"
                ? "secondary"
                : "outline"
            }
          >
            {customer.status}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.contact}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+250 78 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>123 Main St, Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Customer since: January 15, 2023</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderRating(customer.rating)}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({customer.rating} out of 5)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{customer.orders}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Lifetime Value
                  </p>
                  <p className="text-2xl font-bold">
                    RWF {customer.lifetimeValue.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Avg. Order Value
                  </p>
                  <p className="text-2xl font-bold">
                    RWF{" "}
                    {customer.orders > 0
                      ? Math.round(
                          customer.lifetimeValue / customer.orders
                        ).toLocaleString()
                      : 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Order</p>
                  <p className="text-2xl font-bold">3 days ago</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild>
                  <Link href={`/dashboard/orders/new?customer=${customer.id}`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Create Order
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/customers/${customer.id}/chat`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>
                          RWF {order.total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "Delivered"
                                ? "default"
                                : order.status === "In Transit"
                                ? "secondary"
                                : order.status === "Confirmed"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <ShoppingCart className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Trends</CardTitle>
                <CardDescription>
                  Customer ordering patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    orders: {
                      label: "Orders",
                      color: "hsl(var(--chart-1))",
                    },
                    value: {
                      label: "Order Value",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={orderTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="orders"
                        stroke="var(--color-orders)"
                        name="Orders"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-value)"
                        name="Order Value (RWF)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Ordered Products</CardTitle>
                <CardDescription>Most frequently ordered items</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Last Ordered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          {product.quantity} {product.unit}
                        </TableCell>
                        <TableCell>{product.lastOrdered}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Preferences</CardTitle>
                <CardDescription>
                  Specific requirements and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Delivery Preferences</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Preferred delivery time: 8:00 AM - 10:00 AM</li>
                    <li>Requires temperature-controlled transport for dairy</li>
                    <li>Delivery contact: Chef Maria (+250 78 987 6543)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Product Specifications</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tomatoes: Prefers Roma variety, medium ripeness</li>
                    <li>Chicken: Free-range only</li>
                    <li>Herbs: Organic certification required</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Payment Terms</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Net 15 days</li>
                    <li>Prefers bank transfer</li>
                    <li>Requires detailed invoice with item codes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
                <CardDescription>
                  Internal notes about this customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerNotes.map((note, index) => (
                  <div
                    key={index}
                    className="border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{note.author}</span>
                      <span className="text-sm text-muted-foreground">
                        {note.date}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <Button>Add Note</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function renderRating(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-primary text-primary" />
      ))}
      {hasHalfStar && (
        <StarHalf className="h-4 w-4 fill-primary text-primary" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarOff key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
      ))}
    </div>
  );
}

// Types
interface Customer {
  id: string;
  name: string;
  contact: string;
  orders: number;
  lifetimeValue: number;
  status: "Active" | "New" | "Inactive";
  rating: number;
}

interface Order {
  id: string;
  date: string;
  items: number;
  total: number;
  status: "Pending" | "Confirmed" | "In Transit" | "Delivered";
}

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastOrdered: string;
}

interface Note {
  author: string;
  date: string;
  content: string;
}

// Sample data
const customers: Customer[] = [
  {
    id: "cust-001",
    name: "Bistro Bella",
    contact: "contact@bistrobella.com",
    orders: 45,
    lifetimeValue: 4500000,
    status: "Active",
    rating: 4.5,
  },
  {
    id: "cust-002",
    name: "Cafe Milano",
    contact: "orders@cafemilano.com",
    orders: 32,
    lifetimeValue: 3200000,
    status: "Active",
    rating: 5,
  },
  {
    id: "cust-003",
    name: "The Green Plate",
    contact: "info@greenplate.com",
    orders: 28,
    lifetimeValue: 2800000,
    status: "Active",
    rating: 4,
  },
  {
    id: "cust-004",
    name: "Spice Garden",
    contact: "orders@spicegarden.com",
    orders: 20,
    lifetimeValue: 1800000,
    status: "Active",
    rating: 3.5,
  },
  {
    id: "cust-005",
    name: "Taste of Asia",
    contact: "hello@tasteofasia.com",
    orders: 2,
    lifetimeValue: 180000,
    status: "New",
    rating: 4,
  },
];

const customerOrders: Order[] = [
  {
    id: "ORD-7891",
    date: "May 3, 2023",
    items: 12,
    total: 245500,
    status: "Pending",
  },
  {
    id: "ORD-7880",
    date: "Apr 28, 2023",
    items: 8,
    total: 180000,
    status: "Delivered",
  },
  {
    id: "ORD-7865",
    date: "Apr 21, 2023",
    items: 15,
    total: 320000,
    status: "Delivered",
  },
  {
    id: "ORD-7850",
    date: "Apr 14, 2023",
    items: 10,
    total: 210000,
    status: "Delivered",
  },
  {
    id: "ORD-7835",
    date: "Apr 7, 2023",
    items: 14,
    total: 275000,
    status: "Delivered",
  },
];

const orderTrends = [
  { month: "Jan", orders: 5, value: 450000 },
  { month: "Feb", orders: 7, value: 580000 },
  { month: "Mar", orders: 8, value: 650000 },
  { month: "Apr", orders: 12, value: 985000 },
  { month: "May", orders: 13, value: 1050000 },
];

const topProducts = [
  {
    id: "prod-1",
    name: "Tomatoes",
    category: "Produce",
    quantity: 85,
    unit: "kg",
    lastOrdered: "May 3, 2023",
  },
  {
    id: "prod-4",
    name: "Chicken Breast",
    category: "Meat",
    quantity: 60,
    unit: "kg",
    lastOrdered: "May 3, 2023",
  },
  {
    id: "prod-2",
    name: "Onions",
    category: "Produce",
    quantity: 45,
    unit: "kg",
    lastOrdered: "Apr 28, 2023",
  },
  {
    id: "prod-6",
    name: "Milk",
    category: "Dairy",
    quantity: 40,
    unit: "liter",
    lastOrdered: "Apr 28, 2023",
  },
  {
    id: "prod-10",
    name: "Olive Oil",
    category: "Dry Goods",
    quantity: 25,
    unit: "liter",
    lastOrdered: "Apr 21, 2023",
  },
];

const customerNotes = [
  {
    author: "John Smith",
    date: "May 2, 2023",
    content:
      "Customer requested a meeting to discuss potential bulk ordering discounts for next quarter.",
  },
  {
    author: "Sarah Johnson",
    date: "Apr 15, 2023",
    content:
      "Bistro Bella is expanding their menu next month and will likely increase their produce orders by 20%.",
  },
  {
    author: "Michael Wong",
    date: "Mar 28, 2023",
    content:
      "Customer complained about quality of last tomato delivery. We've arranged for premium selection on their next order.",
  },
];
