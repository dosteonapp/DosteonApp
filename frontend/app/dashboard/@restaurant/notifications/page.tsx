"use client";

import { useState } from "react";
import { 
  Bell, 
  User, 
  ShoppingCart, 
  Package, 
  Search, 
  ArrowRight,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Notification {
  id: string;
  type: "login" | "order" | "role" | "reminder";
  title: string;
  description: string;
  time: string;
  by?: string;
  unread: boolean;
  actionLabel?: string;
  actionHref?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "login",
    title: "Login History",
    description: "You logged in at 10:42 AM from Android",
    time: "2 hours ago",
    by: "@you",
    unread: true
  },
  {
    id: "2",
    type: "order",
    title: "Order Delivered",
    description: "Order #1234 marked as delivered by John. Check your inventory update.",
    time: "2 hours ago",
    unread: true,
    actionLabel: "Review Inventory",
    actionHref: "/dashboard/inventory"
  },
  {
    id: "3",
    type: "role",
    title: "Role Updated",
    description: "You changed Sarah Johnson's role from Kitchen Staff to Procurement Officer",
    time: "2 hours ago",
    by: "@you",
    unread: true
  },
  {
    id: "4",
    type: "reminder",
    title: "Stock Review Reminder",
    description: "Don't forget to confirm today's closing stock. This keeps your inventory accurate.",
    time: "2 hours ago",
    unread: true,
    actionLabel: "Review Inventory",
    actionHref: "/dashboard/closing"
  }
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState("Unread");
  const [search, setSearch] = useState("");

  const filters = ["All", "Unread", "Alerts", "Inventory"];

  return (
    <div className="space-y-10 max-w-5xl mx-auto w-full pb-20">

      {/* Tabs & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex bg-[#F1F5F9] p-1.5 rounded-2xl gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2 rounded-xl font-black text-sm transition-all",
                filter === f 
                  ? "bg-white text-[#4F46E5] shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {MOCK_NOTIFICATIONS.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  const Icon = {
    login: User,
    order: ShoppingCart,
    role: User,
    reminder: Package
  }[notification.type];

  return (
    <Card className={cn(
      "border-slate-100 shadow-sm transition-all rounded-[32px] overflow-hidden bg-white relative",
      notification.unread && "border-l-4 border-l-[#4F46E5]"
    )}>
      <CardContent className="p-8 flex items-center gap-8">
        {/* Icon Container */}
        <div className="h-14 w-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6 text-[#4F46E5]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-[#1E293B] text-lg tracking-tight">
              {notification.title}
            </h4>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-xs font-bold whitespace-nowrap">{notification.time}</span>
              <Bell className="h-4 w-4" />
            </div>
          </div>

          <p className="text-base font-bold text-slate-500 leading-relaxed opacity-80">
            {notification.type === 'order' || notification.type === 'reminder' ? '📦 ' : ''}
            {notification.description}
          </p>

          {notification.by && (
            <p className="text-xs font-black text-slate-400">
              by <span className="text-[#1E293B]">{notification.by}</span>
            </p>
          )}

          {notification.actionLabel && (
            <div className="pt-2">
              <Button 
                className="h-12 px-8 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs shadow-lg shadow-indigo-100 transition-all"
                asChild
              >
                <Link href={notification.actionHref || "#"}>
                  {notification.actionLabel}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
