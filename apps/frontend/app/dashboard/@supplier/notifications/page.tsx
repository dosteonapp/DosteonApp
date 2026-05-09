"use client";

import { useEffect, useState } from "react";
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
  Package,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

export default function SupplierNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await axiosInstance.get<Notification[]>("/notifications");
        setNotifications(data || []);
      } catch (err: any) {
        // axiosInstance already toasts errors globally; keep UI minimal here
        setError(
          err?.response?.data?.detail ||
            "We couldn't load your notifications. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const unreadNotifications = notifications.filter((n) => n.unread);
  const orderNotifications = notifications.filter((n) => n.type === "order");
  const inventoryNotifications = notifications.filter((n) => n.type === "inventory");
  const paymentNotifications = notifications.filter((n) => n.type === "payment");

  const renderEmptyState = () => (
    <div className="mt-8 flex flex-col items-center justify-center text-center gap-3 py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
      <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-1">
        <Bell className="h-5 w-5" />
      </div>
      <h2 className="text-base md:text-lg font-semibold text-slate-900">
        You're all caught up
      </h2>
      <p className="text-xs md:text-sm text-slate-500 max-w-sm">
        There are no notifications to show right now. New updates about orders,
        inventory and payments will appear here.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </header> */}
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
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-4">
            {isLoading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
            {!isLoading && notifications.length === 0 && renderEmptyState()}
            {!isLoading && notifications.length > 0 && (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="unread" className="space-y-4 mt-4">
            {isLoading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
            {!isLoading && unreadNotifications.length === 0 && renderEmptyState()}
            {!isLoading && unreadNotifications.length > 0 && (
              <div className="space-y-4">
                {unreadNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="orders" className="space-y-4 mt-4">
            {isLoading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
            {!isLoading && orderNotifications.length === 0 && renderEmptyState()}
            {!isLoading && orderNotifications.length > 0 && (
              <div className="space-y-4">
                {orderNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="inventory" className="space-y-4 mt-4">
            {isLoading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
            {!isLoading && inventoryNotifications.length === 0 && renderEmptyState()}
            {!isLoading && inventoryNotifications.length > 0 && (
              <div className="space-y-4">
                {inventoryNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="payments" className="space-y-4 mt-4">
            {isLoading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
            {!isLoading && paymentNotifications.length === 0 && renderEmptyState()}
            {!isLoading && paymentNotifications.length > 0 && (
              <div className="space-y-4">
                {paymentNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
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
    case "inventory":
      return <Package className="h-5 w-5 text-warning" />;
    case "order":
      return <CheckCircle className="h-5 w-5 text-success" />;
    case "payment":
      return <Clock className="h-5 w-5 text-primary" />;
    case "alert":
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
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

// Notifications are now fetched from the backend; no local mock data.
