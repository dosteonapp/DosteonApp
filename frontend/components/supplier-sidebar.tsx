"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  Package,
  ShoppingCart,
  Bell,
  Settings,
  LogOut,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "./icons/Logo";

export function SupplierSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Dashboard",
    },
    {
      href: "/dashboard/products",
      icon: Package,
      title: "Products",
    },
    {
      href: "/dashboard/orders",
      icon: ShoppingCart,
      title: "Orders",
    },
    {
      href: "/dashboard/customers",
      icon: Users,
      title: "Customers",
      badge: "New",
    },
    {
      href: "/dashboard/restaurants",
      icon: Users,
      title: "Restaurants",
    },
    // {
    //   href: "/dashboard/analytics",
    //   icon: BarChart3,
    //   title: "Analytics",
    // },
    // {
    //   href: "/dashboard/finance",
    //   icon: DollarSign,
    //   title: "Finance",
    // },
    {
      href: "/dashboard/notifications",
      icon: Bell,
      title: "Notifications",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-[70px]" : "w-full"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Logo className="w-5 h-5" />

            <span>Dosteon</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <Logo className="w-5 h-5" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === route.href && "bg-muted text-primary",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? route.title : undefined}
            >
              <route.icon className="h-4 w-4" />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>{route.title}</span>
                  {route.badge && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                    >
                      {route.badge}
                    </Badge>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <LogoutButton
          variant="outline"
          redirectPath="/auth/supplier/signin"
          className={cn(
            "w-full",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "Logout"}
        </LogoutButton>
      </div>
    </div>
  );
}
