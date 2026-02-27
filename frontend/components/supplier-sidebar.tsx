"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  Bell,
  Settings,
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";


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
        "flex h-full flex-col border-r border-slate-100 bg-white transition-all duration-500 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50",
        collapsed ? "w-[90px]" : "w-[300px]"
      )}
    >
      <div className="flex h-24 items-center justify-between px-8 border-b border-slate-50 relative">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center group transition-transform active:scale-95"
          >
            <img 
              src="/images/logo-full.png" 
              alt="Dosteon" 
              className="h-10 w-auto group-hover:drop-shadow-sm transition-all"
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto group transition-transform active:scale-95">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100/50 overflow-hidden">
                <img 
                    src="/images/logo-full.png" 
                    alt="Dosteon" 
                    className="h-8 min-w-[80px] object-left object-cover ml-4"
                />
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-xl border border-slate-100 bg-white shadow-sm absolute -right-4 top-8 z-50 transition-all hover:shadow-md hover:border-indigo-100 active:scale-90", 
            collapsed && "static mt-2"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-[#3B59DA] stroke-[3px]" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-400 stroke-[3px]" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-8">
        <nav className="flex flex-col gap-2 px-6">
          {routes.map((route) => (
            <SidebarLink 
                key={route.href} 
                route={route} 
                pathname={pathname} 
                collapsed={collapsed} 
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-6 border-t border-slate-50">
        {!collapsed && (
          <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-[28px] border border-slate-100/50 transition-all hover:bg-indigo-50/30 group">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <div className="font-black text-[#3B59DA] text-lg">JS</div>
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-black text-[#1E293B] truncate tracking-tight">John Supplier</span>
                <span className="text-[10px] font-bold text-slate-400 capitalize flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Verified Partner
                </span>
            </div>
          </div>
        )}
        <LogoutButton
          variant="outline"
          redirectPath="/auth/supplier/signin"
          className={cn(
            "h-14 rounded-2xl transition-all font-black text-sm group",
            collapsed 
                ? "w-full justify-center px-0 border-transparent text-slate-400 hover:text-red-500 hover:bg-red-50" 
                : "w-full border-slate-100 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 justify-center shadow-sm hover:shadow-md"
          )}
        >
          <LogOut className={cn("h-5 w-5 transition-transform", !collapsed && "mr-3 group-hover:-translate-x-1")} />
          {!collapsed && "End Session"}
        </LogoutButton>
      </div>
    </div>
  );
}

function SidebarLink({ route, pathname, collapsed }: { route: any, pathname: string, collapsed: boolean }) {
    const isActive = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href));
    
    return (
        <Link
            href={route.href}
            className={cn(
                "flex items-center gap-4 rounded-2xl px-5 py-4 transition-all text-[15px] group relative font-semibold",
                isActive 
                    ? "bg-[#3B59DA] text-white shadow-xl shadow-indigo-100" 
                    : "text-slate-500 hover:text-[#3B59DA] hover:bg-indigo-50/50",
                collapsed && "justify-center px-0 mx-2"
            )}
            title={collapsed ? route.title : undefined}
        >
            <route.icon className={cn(
                "h-5 w-5 transition-colors duration-300 group-hover:scale-110", 
                isActive 
                    ? "text-white stroke-[3px]" 
                    : "text-slate-400 stroke-[2px] group-hover:text-[#3B59DA]"
            )} />
            {!collapsed && (
              <div className="flex items-center justify-between w-full">
                <span>{route.title}</span>
                {route.badge && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100/50 font-black text-[10px] py-0 h-5"
                  >
                    {route.badge}
                  </Badge>
                )}
              </div>
            )}
            {isActive && !collapsed && (
                 <ChevronRight className="h-4 w-4 ml-auto text-white/50 stroke-[3px]" />
            )}
        </Link>
    );
}
