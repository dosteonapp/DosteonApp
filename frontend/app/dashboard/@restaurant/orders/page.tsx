"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Menu, Calendar } from "lucide-react";
import Link from "next/link";
import { useRestaurantDayActionGuard } from "@/hooks/useRestaurantDayActionGuard";
import { NewOrderModal } from "@/components/new-order-modal";

export default function OrdersPage() {
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const { guard } = useRestaurantDayActionGuard();

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header ... */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-end">
          <Button onClick={() => guard(() => setNewOrderModalOpen(true), { actionName: "order creation" })}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">Current Orders</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Orders</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Orders</CardTitle>
                <CardDescription>
                  View and manage your active orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-8 w-full md:w-[300px]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        <SelectItem value="fresh-farms">
                          Fresh Farms Inc.
                        </SelectItem>
                        <SelectItem value="metro-meats">Metro Meats</SelectItem>
                        <SelectItem value="global-grocers">
                          Global Grocers
                        </SelectItem>
                        <SelectItem value="organic-supplies">
                          Organic Supplies Co.
                        </SelectItem>
                        <SelectItem value="dairy-delights">
                          Dairy Delights
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.supplier}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.totalItems}</TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={getOrderStatusVariant(order.status)}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/orders/${order.id}`}>
                                  View
                                </Link>
                              </Button>
                              {order.status === "Pending" && (
                                <Button size="sm" variant="outline" onClick={() => guard(() => console.log("Cancel order"), { actionName: "order cancellation" })}>
                                  Cancel
                                </Button>
                              )}
                              {order.status === "Delivered" && (
                                <Button size="sm" variant="outline" onClick={() => guard(() => console.log("Reorder"), { actionName: "reorder" })}>
                                  Reorder
                                </Button>
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

          <TabsContent value="scheduled" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Scheduled Orders</CardTitle>
                  <CardDescription>
                    Orders scheduled for future delivery
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => guard(() => setNewOrderModalOpen(true), { actionName: "scheduling order" })}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule New Order
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Time Slot</TableHead>
                        <TableHead>Total Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.supplier}</TableCell>
                          <TableCell>{order.scheduledDate}</TableCell>
                          <TableCell>{order.timeSlot}</TableCell>
                          <TableCell>{order.totalItems}</TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                              >
                                Cancel
                              </Button>
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

          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-8 w-full md:w-[300px]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        <SelectItem value="fresh-farms">
                          Fresh Farms Inc.
                        </SelectItem>
                        <SelectItem value="metro-meats">Metro Meats</SelectItem>
                        <SelectItem value="global-grocers">
                          Global Grocers
                        </SelectItem>
                        <SelectItem value="organic-supplies">
                          Organic Supplies Co.
                        </SelectItem>
                        <SelectItem value="dairy-delights">
                          Dairy Delights
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.supplier}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.totalItems}</TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={getOrderStatusVariant(order.status)}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => guard(() => console.log("Reorder"), { actionName: "reorder" })}>
                                Reorder
                              </Button>
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
        </Tabs>
      </main>

      <NewOrderModal
        open={newOrderModalOpen}
        onOpenChange={setNewOrderModalOpen}
      />
    </div>
  );
}

// Update the getOrderStatusVariant function to use the new color scheme
function getOrderStatusVariant(status: string) {
  switch (status) {
    case "Pending":
      return "bg-red-500 text-white hover:bg-red-600";
    case "Confirmed":
      return "bg-green-500 text-white hover:bg-green-600";
    case "In Transit":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "Delivered":
      return "bg-secondary-500 text-secondary-foreground hover:bg-secondary-500/90";
    case "Cancelled":
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    default:
      return "outline";
  }
}

// Sample data for current orders
const currentOrders = [
  {
    id: "ORD-7891",
    supplier: "Fresh Farms Inc.",
    date: "May 3, 2023",
    totalItems: 8,
    totalAmount: 245.5,
    status: "Pending",
  },
  {
    id: "ORD-7890",
    supplier: "Metro Meats",
    date: "May 2, 2023",
    totalItems: 5,
    totalAmount: 320.75,
    status: "Confirmed",
  },
  {
    id: "ORD-7889",
    supplier: "Global Grocers",
    date: "May 1, 2023",
    totalItems: 12,
    totalAmount: 178.25,
    status: "In Transit",
  },
];

// Sample data for scheduled orders
const scheduledOrders = [
  {
    id: "ORD-7895",
    supplier: "Fresh Farms Inc.",
    scheduledDate: "May 10, 2023",
    timeSlot: "Morning (8:00 AM - 12:00 PM)",
    totalItems: 10,
    totalAmount: 275.5,
  },
  {
    id: "ORD-7896",
    supplier: "Metro Meats",
    scheduledDate: "May 12, 2023",
    timeSlot: "Afternoon (12:00 PM - 4:00 PM)",
    totalItems: 6,
    totalAmount: 350.25,
  },
  {
    id: "ORD-7897",
    supplier: "Dairy Delights",
    scheduledDate: "May 15, 2023",
    timeSlot: "Morning (8:00 AM - 12:00 PM)",
    totalItems: 8,
    totalAmount: 180.75,
  },
];

// Sample data for order history
const historyOrders = [
  {
    id: "ORD-7888",
    supplier: "Organic Supplies Co.",
    date: "April 30, 2023",
    totalItems: 10,
    totalAmount: 210.0,
    status: "Delivered",
  },
  {
    id: "ORD-7887",
    supplier: "Dairy Delights",
    date: "April 29, 2023",
    totalItems: 6,
    totalAmount: 145.5,
    status: "Delivered",
  },
  {
    id: "ORD-7886",
    supplier: "Fresh Farms Inc.",
    date: "April 28, 2023",
    totalItems: 9,
    totalAmount: 267.8,
    status: "Delivered",
  },
  {
    id: "ORD-7885",
    supplier: "Metro Meats",
    date: "April 27, 2023",
    totalItems: 4,
    totalAmount: 189.25,
    status: "Cancelled",
  },
];
