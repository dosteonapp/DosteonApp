import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
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
            <p className="text-muted-foreground">
              Stay updated on important events
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" asChild>
              <Link href="/dashboard/notifications/settings">
                <Settings className="mr-2 h-4 w-4" />
                Notification Settings
              </Link>
            </Button>
            <Button>Mark All as Read</Button> */}
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread <Badge className="ml-2 bg-primary">7</Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </TabsContent>
          <TabsContent value="unread" className="space-y-4 mt-4">
            {notifications
              .filter((notification) => notification.unread)
              .map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
          </TabsContent>
          <TabsContent value="alerts" className="space-y-4 mt-4">
            {notifications
              .filter((notification) => notification.type === "alert")
              .map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
          </TabsContent>
          <TabsContent value="orders" className="space-y-4 mt-4">
            {notifications
              .filter((notification) => notification.type === "order")
              .map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
          </TabsContent>
          <TabsContent value="inventory" className="space-y-4 mt-4">
            {notifications
              .filter((notification) => notification.type === "inventory")
              .map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  const { id, title, message, time, type, unread, actionLink } = notification;

  return (
    <Card className={unread ? "border-l-4 border-l-primary" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">{getNotificationIcon(type)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${unread ? "text-primary" : ""}`}>
                {title}
              </h3>
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
  );
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "alert":
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case "order":
      return <CheckCircle className="h-5 w-5 text-success" />;
    case "inventory":
      return <Clock className="h-5 w-5 text-warning" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  unread: boolean;
  actionLink?: {
    href: string;
    text: string;
  };
}

// Sample data
const notifications: Notification[] = [
  {
    id: "1",
    title: "Low Stock Alert: Tomatoes",
    message:
      "Tomatoes are running low. Current stock: 2.5kg (below minimum threshold of 5kg).",
    time: "10 minutes ago",
    type: "alert",
    unread: true,
    actionLink: {
      href: "/dashboard/orders/new?item=1",
      text: "Order Now",
    },
  },
  {
    id: "2",
    title: "Order Confirmed",
    message: "Your order #ORD-7890 from Metro Meats has been confirmed.",
    time: "1 hour ago",
    type: "order",
    unread: true,
  },
  {
    id: "3",
    title: "Order Out for Delivery",
    message: "Your order #ORD-7889 from Global Grocers is out for delivery.",
    time: "3 hours ago",
    type: "order",
    unread: true,
  },
  {
    id: "4",
    title: "Low Stock Alert: Chicken Breast",
    message:
      "Chicken Breast is running low. Current stock: 8kg (below minimum threshold of 10kg).",
    time: "5 hours ago",
    type: "alert",
    unread: true,
    actionLink: {
      href: "/dashboard/orders/new?item=3",
      text: "Order Now",
    },
  },
  {
    id: "5",
    title: "Order Delivered",
    message:
      "Your order #ORD-7888 from Organic Supplies Co. has been delivered.",
    time: "Yesterday",
    type: "order",
    unread: true,
  },
  {
    id: "6",
    title: "Inventory Updated",
    message:
      "Your inventory has been updated based on the delivery of order #ORD-7888.",
    time: "Yesterday",
    type: "inventory",
    unread: true,
    actionLink: {
      href: "/dashboard/inventory",
      text: "View Inventory",
    },
  },
  {
    id: "7",
    title: "Low Stock Alert: Onions",
    message:
      "Onions are running low. Current stock: 5kg (below minimum threshold of 8kg).",
    time: "Yesterday",
    type: "alert",
    unread: true,
    actionLink: {
      href: "/dashboard/orders/new?item=2",
      text: "Order Now",
    },
  },
  {
    id: "8",
    title: "Order Delivered",
    message: "Your order #ORD-7887 from Dairy Delights has been delivered.",
    time: "2 days ago",
    type: "order",
    unread: false,
  },
  {
    id: "9",
    title: "Inventory Updated",
    message:
      "Your inventory has been updated based on the delivery of order #ORD-7887.",
    time: "2 days ago",
    type: "inventory",
    unread: false,
    actionLink: {
      href: "/dashboard/inventory",
      text: "View Inventory",
    },
  },
  {
    id: "10",
    title: "Order Placed",
    message:
      "Your order #ORD-7886 to Fresh Farms Inc. has been placed successfully.",
    time: "3 days ago",
    type: "order",
    unread: false,
  },
];
