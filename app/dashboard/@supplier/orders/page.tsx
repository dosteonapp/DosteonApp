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
import { Search, Menu } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Orders</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage incoming orders from restaurants
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>View and manage all your orders</CardDescription>
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
                    <SelectValue placeholder="Restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Restaurants</SelectItem>
                    <SelectItem value="bistro-bella">Bistro Bella</SelectItem>
                    <SelectItem value="cafe-milano">Cafe Milano</SelectItem>
                    <SelectItem value="green-plate">The Green Plate</SelectItem>
                    <SelectItem value="spice-garden">Spice Garden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.restaurant}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.totalItems}</TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getOrderStatusVariant(order.status)}>
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
                            <Button size="sm" variant="outline">
                              Confirm
                            </Button>
                          )}
                          {order.status === "Confirmed" && (
                            <Button size="sm" variant="outline">
                              Ship
                            </Button>
                          )}
                          {order.status === "In Transit" && (
                            <Button size="sm" variant="outline">
                              Deliver
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
      </main>
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

// Sample data
const orders = [
  {
    id: "ORD-7891",
    restaurant: "Bistro Bella",
    date: "May 3, 2023",
    totalItems: 8,
    totalAmount: 245.5,
    status: "Pending",
  },
  {
    id: "ORD-7892",
    restaurant: "Cafe Milano",
    date: "May 3, 2023",
    totalItems: 6,
    totalAmount: 178.25,
    status: "Pending",
  },
  {
    id: "ORD-7885",
    restaurant: "Bistro Bella",
    date: "May 2, 2023",
    totalItems: 5,
    totalAmount: 156.75,
    status: "Confirmed",
  },
  {
    id: "ORD-7886",
    restaurant: "Cafe Milano",
    date: "May 2, 2023",
    totalItems: 7,
    totalAmount: 210.3,
    status: "Confirmed",
  },
  {
    id: "ORD-7887",
    restaurant: "The Green Plate",
    date: "May 1, 2023",
    totalItems: 9,
    totalAmount: 267.8,
    status: "In Transit",
  },
  {
    id: "ORD-7888",
    restaurant: "Spice Garden",
    date: "May 1, 2023",
    totalItems: 4,
    totalAmount: 145.5,
    status: "In Transit",
  },
  {
    id: "ORD-7880",
    restaurant: "Bistro Bella",
    date: "April 30, 2023",
    totalItems: 6,
    totalAmount: 189.25,
    status: "Delivered",
  },
  {
    id: "ORD-7881",
    restaurant: "Cafe Milano",
    date: "April 30, 2023",
    totalItems: 8,
    totalAmount: 234.6,
    status: "Delivered",
  },
];
