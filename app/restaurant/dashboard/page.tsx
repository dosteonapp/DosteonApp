"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowUpRight, Package, ShoppingCart, TrendingUp, Menu } from "lucide-react"
import Link from "next/link"
import { DashboardOrderModal } from "@/components/dashboard-order-modal"

export default function RestaurantDashboard() {
  const [orderModalOpen, setOrderModalOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setOrderModalOpen(true)} className="bg-primary hover:bg-primary-600">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Inventory Card */}
          <Link href="/restaurant/inventory" className="group">
            <Card className="transition-all duration-200 hover:shadow-md hover:border-primary-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory Items</CardTitle>
                <Package className="h-4 w-4 text-primary-500 group-hover:text-primary-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">12 items low on stock</p>
                <ArrowUpRight className="absolute bottom-0 right-0 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 text-primary-500" />
              </CardContent>
            </Card>
          </Link>

          {/* Orders Card */}
          <Link href="/restaurant/orders" className="group">
            <Card className="transition-all duration-200 hover:shadow-md hover:border-primary-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary-500 group-hover:text-primary-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">3 pending confirmation</p>
                <ArrowUpRight className="absolute bottom-0 right-0 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 text-primary-500" />
              </CardContent>
            </Card>
          </Link>

          {/* Suppliers Card */}
          <Link href="/restaurant/suppliers" className="group">
            <Card className="transition-all duration-200 hover:shadow-md hover:border-secondary-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary-500 group-hover:text-secondary-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">5 new this month</p>
                <ArrowUpRight className="absolute bottom-0 right-0 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 text-secondary-500" />
              </CardContent>
            </Card>
          </Link>

          {/* Alerts Card */}
          <Link href="/restaurant/notifications" className="group">
            <Card className="transition-all duration-200 hover:shadow-md hover:border-destructive/30 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive group-hover:text-destructive/80" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">3 critical alerts</p>
                <ArrowUpRight className="absolute bottom-0 right-0 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 text-destructive" />
              </CardContent>
            </Card>
          </Link>
        </div>

        <Tabs
          defaultValue="low-stock"
          className="[&_[data-state=active]]:text-primary-500 [&_[data-state=active]]:border-b-primary-500"
        >
          <TabsList>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="upcoming-deliveries">Upcoming Deliveries</TabsTrigger>
          </TabsList>
          <TabsContent value="low-stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
                <CardDescription>Items that need to be reordered soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${getStockLevelColor(item.stockLevel)}`} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.currentStock} {item.unit} remaining
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOrderModalOpen(true)}
                        className="border-primary-500 text-primary-500 hover:bg-primary-50"
                      >
                        Reorder
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your most recent procurement orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.supplier} • {order.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getOrderStatusVariant(order.status)}>{order.status}</Badge>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/restaurant/orders/${order.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upcoming-deliveries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deliveries</CardTitle>
                <CardDescription>Orders that are scheduled for delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">Order #{delivery.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {delivery.supplier} • Expected: {delivery.expectedDate}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/restaurant/orders/${delivery.id}`}>
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

      {/* Order Modal */}
      <DashboardOrderModal open={orderModalOpen} onOpenChange={setOrderModalOpen} />
    </div>
  )
}

// Helper function to get color based on stock level
function getStockLevelColor(level: "critical" | "low" | "medium" | "good") {
  switch (level) {
    case "critical":
      return "bg-destructive"
    case "low":
      return "bg-orange-500"
    case "medium":
      return "bg-primary-300"
    case "good":
      return "bg-secondary-500"
    default:
      return "bg-gray-500"
  }
}

// Helper function to get badge variant based on order status
function getOrderStatusVariant(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-secondary-500 text-secondary-foreground hover:bg-secondary-500/90"
    case "In Transit":
      return "bg-blue-500 text-white hover:bg-blue-600"
    case "Confirmed":
      return "bg-green-500 text-white hover:bg-green-600"
    case "Pending":
      return "bg-red-500 text-white hover:bg-red-600"
    default:
      return "outline"
  }
}

// Sample data
const lowStockItems = [
  {
    id: "1",
    name: "Tomatoes",
    currentStock: 2.5,
    unit: "kg",
    stockLevel: "critical" as const,
  },
  {
    id: "2",
    name: "Onions",
    currentStock: 5,
    unit: "kg",
    stockLevel: "low" as const,
  },
  {
    id: "3",
    name: "Chicken Breast",
    currentStock: 8,
    unit: "kg",
    stockLevel: "low" as const,
  },
  {
    id: "4",
    name: "Olive Oil",
    currentStock: 1,
    unit: "liter",
    stockLevel: "medium" as const,
  },
  {
    id: "5",
    name: "Rice",
    currentStock: 10,
    unit: "kg",
    stockLevel: "medium" as const,
  },
]

const recentOrders = [
  {
    id: "ORD-7891",
    supplier: "Fresh Farms Inc.",
    date: "Today, 10:30 AM",
    status: "Pending",
  },
  {
    id: "ORD-7890",
    supplier: "Metro Meats",
    date: "Yesterday, 2:15 PM",
    status: "Confirmed",
  },
  {
    id: "ORD-7889",
    supplier: "Global Grocers",
    date: "May 2, 2023",
    status: "In Transit",
  },
  {
    id: "ORD-7888",
    supplier: "Organic Supplies Co.",
    date: "May 1, 2023",
    status: "Delivered",
  },
]

const upcomingDeliveries = [
  {
    id: "ORD-7889",
    supplier: "Global Grocers",
    expectedDate: "Tomorrow, 9:00 AM - 12:00 PM",
  },
  {
    id: "ORD-7890",
    supplier: "Metro Meats",
    expectedDate: "May 5, 2023, 1:00 PM - 3:00 PM",
  },
  {
    id: "ORD-7892",
    supplier: "Dairy Delights",
    expectedDate: "May 6, 2023, 10:00 AM - 2:00 PM",
  },
]
