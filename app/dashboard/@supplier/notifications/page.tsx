import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Menu, Bell, AlertTriangle, CheckCircle, Clock, Settings, Package } from "lucide-react"
import Link from "next/link"

export default function SupplierNotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on important events</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/supplier/notifications/settings">
                <Settings className="mr-2 h-4 w-4" />
                Notification Settings
              </Link>
            </Button>
            <Button>Mark All as Read</Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread <Badge className="ml-2 bg-primary">8</Badge>
            </TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-4">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </TabsContent>
          <TabsContent value="unread" className="space-y-4 mt-4">
            {notifications
              .filter((notification) => notification.unread)
              .map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
          </TabsContent>
          <TabsContent value="orders" className="space-y-4 mt-4">
            {notifications
              .filter((notification) => notification.type === "order")
              .map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
          </TabsContent>
          <TabsContent value="inventory" className="space-y-4 mt-4">
            {notifications
              .filter((notification) => notification.type === "inventory")
              .map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
          </TabsContent>
          <TabsContent value="payments" className="space-y-4 mt-4">
            {notifications
              .filter((notification) => notification.type === "payment")
              .map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function NotificationCard({ notification }: { notification: Notification }) {
  const { id, title, message, time, type, unread, actionLink } = notification

  return (
    <Card className={unread ? "border-l-4 border-l-primary" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">{getNotificationIcon(type)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${unread ? "text-primary" : ""}`}>{title}</h3>
              <span className="text-sm text-muted-foreground">{time}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            {actionLink && (
              <div className="mt-3">
                <Button size="sm" variant="outline" asChild>
                  <Link href={actionLink.href}>{actionLink.text}</Link>
                </Button>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "inventory":
      return <Package className="h-5 w-5 text-warning" />
    case "order":
      return <CheckCircle className="h-5 w-5 text-success" />
    case "payment":
      return <Clock className="h-5 w-5 text-primary" />
    case "alert":
      return <AlertTriangle className="h-5 w-5 text-destructive" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

// Types
interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: string
  unread: boolean
  actionLink?: {
    href: string
    text: string
  }
}

// Sample data
const notifications: Notification[] = [
  {
    id: "1",
    title: "New Order Received",
    message: "Bistro Bella has placed a new order #ORD-7891.",
    time: "10 minutes ago",
    type: "order",
    unread: true,
    actionLink: {
      href: "/supplier/orders/ORD-7891",
      text: "View Order",
    },
  },
  {
    id: "2",
    title: "Low Stock Alert: Tomatoes",
    message: "Tomatoes are running low. Current stock: 25kg (below minimum threshold).",
    time: "1 hour ago",
    type: "inventory",
    unread: true,
    actionLink: {
      href: "/supplier/products?filter=low-stock",
      text: "View Inventory",
    },
  },
  {
    id: "3",
    title: "Payment Received",
    message: "Payment of RWF 320,750 received from Cafe Milano for order #ORD-7890.",
    time: "2 hours ago",
    type: "payment",
    unread: true,
    actionLink: {
      href: "/supplier/finance/transactions",
      text: "View Transaction",
    },
  },
  {
    id: "4",
    title: "Order Confirmed",
    message: "You've confirmed order #ORD-7890 for Cafe Milano.",
    time: "3 hours ago",
    type: "order",
    unread: true,
  },
  {
    id: "5",
    title: "New Order Received",
    message: "The Green Plate has placed a new order #ORD-7893.",
    time: "5 hours ago",
    type: "order",
    unread: true,
    actionLink: {
      href: "/supplier/orders/ORD-7893",
      text: "View Order",
    },
  },
  {
    id: "6",
    title: "Low Stock Alert: Onions",
    message: "Onions are running low. Current stock: 30kg (below minimum threshold).",
    time: "Yesterday",
    type: "inventory",
    unread: true,
    actionLink: {
      href: "/supplier/products?filter=low-stock",
      text: "View Inventory",
    },
  },
  {
    id: "7",
    title: "Order Marked as Delivered",
    message: "Order #ORD-7888 for Spice Garden has been marked as delivered.",
    time: "Yesterday",
    type: "order",
    unread: true,
  },
  {
    id: "8",
    title: "Payment Received",
    message: "Payment of RWF 210,000 received from Organic Supplies Co. for order #ORD-7888.",
    time: "Yesterday",
    type: "payment",
    unread: true,
    actionLink: {
      href: "/supplier/finance/transactions",
      text: "View Transaction",
    },
  },
  {
    id: "9",
    title: "New Customer Registration",
    message: "A new restaurant 'Taste of Asia' has registered and can now place orders.",
    time: "2 days ago",
    type: "alert",
    unread: false,
    actionLink: {
      href: "/supplier/customers",
      text: "View Customers",
    },
  },
  {
    id: "10",
    title: "Product Price Updated",
    message: "You've updated the price of 'Organic Chicken Breast' to RWF 9,500/kg.",
    time: "3 days ago",
    type: "inventory",
    unread: false,
  },
]
