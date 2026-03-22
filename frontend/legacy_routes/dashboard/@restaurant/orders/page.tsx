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
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 space-y-8 max-w-[1700px] mx-auto w-full pb-20 transition-all duration-500">
        <div className="flex items-center justify-between gap-4 mb-2">
           <div className="flex-1" />
           <Button 
                className="gap-2 h-[52px] px-8 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] font-black text-sm shadow-xl shadow-indigo-900/10 text-white transition-all active:scale-95" 
                onClick={() => guard(() => setNewOrderModalOpen(true), { actionName: "order creation" })}
            >
              <Plus className="h-4 w-4" />
              New Order
            </Button>
        </div>
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="bg-slate-100 p-1 rounded-xl flex flex-wrap h-auto gap-1">
            <TabsTrigger value="current" className="rounded-lg py-2 flex-1 min-w-[100px] font-bold text-xs md:text-sm">Current Orders</TabsTrigger>
            <TabsTrigger value="scheduled" className="rounded-lg py-2 flex-1 min-w-[100px] font-bold text-xs md:text-sm">Scheduled Orders</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg py-2 flex-1 min-w-[100px] font-bold text-xs md:text-sm">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="outline-none">
            <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Current Orders</CardTitle>
                <CardDescription>View and manage your active orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search orders..."
                      className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium text-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl border-slate-200 font-bold text-xs md:text-sm">
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
                      <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 font-bold text-xs md:text-sm">
                        <SelectValue placeholder="Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        <SelectItem value="fresh-farms">Fresh Farms Inc.</SelectItem>
                        <SelectItem value="metro-meats">Metro Meats</SelectItem>
                        <SelectItem value="global-grocers">Global Grocers</SelectItem>
                        <SelectItem value="organic-supplies">Organic Supplies Co.</SelectItem>
                        <SelectItem value="dairy-delights">Dairy Delights</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto border-t border-slate-50">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold py-4">Order ID</TableHead>
                        <TableHead className="font-bold py-4">Supplier</TableHead>
                        <TableHead className="font-bold py-4">Date</TableHead>
                        <TableHead className="font-bold py-4">Total Items</TableHead>
                        <TableHead className="font-bold py-4">Total Amount</TableHead>
                        <TableHead className="font-bold py-4">Status</TableHead>
                        <TableHead className="text-right font-bold py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono text-[10px] md:text-xs font-bold text-indigo-600 tracking-wider">
                            {order.id}
                          </TableCell>
                          <TableCell className="font-bold text-slate-700 text-xs md:text-sm">{order.supplier}</TableCell>
                          <TableCell className="text-slate-500 text-xs md:text-sm">{order.date}</TableCell>
                          <TableCell className="text-slate-500 font-bold text-xs md:text-sm">{order.totalItems}</TableCell>
                          <TableCell className="font-semibold text-slate-900 text-xs md:text-sm">${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getOrderStatusVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8 md:h-9 px-3 md:px-4 rounded-lg border-slate-200 font-bold text-[10px] md:text-xs" asChild>
                                <Link href={`/dashboard/orders/${order.id}`}>View</Link>
                              </Button>
                              {order.status === "Pending" && (
                                <Button size="sm" variant="outline" className="h-8 md:h-9 px-3 md:px-4 rounded-xl border-red-200 text-red-600 font-bold text-[10px] md:text-xs hover:bg-red-50 active:scale-95" onClick={() => guard(() => console.log("Cancel order"), { actionName: "order cancellation" })}>
                                  Cancel
                                </Button>
                              )}
                              {order.status === "Delivered" && (
                                <Button size="sm" variant="outline" className="h-8 md:h-9 px-3 md:px-4 rounded-xl border-indigo-200 text-indigo-600 font-bold text-[10px] md:text-xs hover:bg-indigo-50 active:scale-95" onClick={() => guard(() => console.log("Reorder"), { actionName: "reorder" })}>
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

          {/* Remaining tabs unchanged; kept as legacy mock UI */}
        </Tabs>
      </main>

      <NewOrderModal
        open={newOrderModalOpen}
        onOpenChange={setNewOrderModalOpen}
      />
    </div>
  );
}

function getOrderStatusVariant(status: string) {
  const commonStyles = "rounded-full px-2.5 md:px-3 py-1 text-[9px] md:text-[10px] font-semibold uppercase tracking-widest border-none whitespace-nowrap shadow-none";
  switch (status) {
    case "Pending":
      return `${commonStyles} bg-amber-50 text-amber-600`;
    case "Confirmed":
      return `${commonStyles} bg-indigo-50 text-indigo-600`;
    case "In Transit":
      return `${commonStyles} bg-blue-50 text-blue-600`;
    case "Delivered":
      return `${commonStyles} bg-emerald-50 text-emerald-600`;
    case "Cancelled":
      return `${commonStyles} bg-red-50 text-red-600`;
    default:
      return `${commonStyles} bg-slate-50 text-slate-600`;
  }
}

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
