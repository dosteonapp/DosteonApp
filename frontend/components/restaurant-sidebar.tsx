"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Moon,
  Users,
  ShoppingCart,
  BarChart3,
  Wallet,
  Lock as LockIcon
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "./icons/Logo";

import { useRestaurantDayLifecycle } from "./day/RestaurantDayLifecycleProvider";
import { isModuleLocked, shouldBlockModuleAccess } from "@/lib/dayLifecycle/restaurantModuleAccess";
import { toast } from "sonner";

export function RestaurantSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { status, isUserUnlocked } = useRestaurantDayLifecycle();

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '80px' : '260px');
  }, [collapsed]);

  const operationsRoutes = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Home",
    },
    {
      href: "/dashboard/kitchen-service",
      icon: Utensils,
      title: "Kitchen Service",
    },
    {
      href: "/dashboard/inventory",
      icon: Package,
      title: "Inventory",
    },
    {
      href: "/dashboard/closing",
      icon: Moon,
      title: "Closing",
    },
  ];

  const systemsRoutes = [
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
        "flex h-full flex-col border-r bg-white transition-all duration-300 shadow-sm",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <div className="flex h-24 items-center justify-between px-8 border-b border-[#F1F5F9] relative">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <Logo className="w-8 h-8 text-[#4F46E5]" />
            <span className="text-[#1E293B] tracking-tighter font-black text-xl">DOSTEON</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <Logo className="w-8 h-8 text-[#4F46E5]" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-lg border border-slate-100 bg-white shadow-sm absolute -right-3.5 top-8 z-50 transition-transform active:scale-95", 
            collapsed && "static mt-2"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-6">
        <nav className="flex flex-col gap-8 px-6">
          {/* Operations Section */}
          <div className="space-y-4">
            {!collapsed && (
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                OPERATIONS
              </h3>
            )}
            <div className="flex flex-col gap-2">
                {operationsRoutes.map((route) => (
                <SidebarLink 
                    key={route.href} 
                    route={route} 
                    pathname={pathname} 
                    collapsed={collapsed} 
                    isLocked={status ? (isModuleLocked(route.href, status.state) && !isUserUnlocked) : false}
                    shouldBlock={status ? (shouldBlockModuleAccess(route.href, status.state) && !isUserUnlocked) : false}
                />
                ))}
            </div>
          </div>

          {/* Systems Section */}
          <div className="space-y-4">
            {!collapsed && (
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                SYSTEMS
              </h3>
            )}
            <div className="flex flex-col gap-2">
                {systemsRoutes.map((route) => (
                <SidebarLink 
                    key={route.href} 
                    route={route} 
                    pathname={pathname} 
                    collapsed={collapsed} 
                    isLocked={status ? isModuleLocked(route.href, status.state) : false}
                    shouldBlock={status ? shouldBlockModuleAccess(route.href, status.state) : false}
                />
                ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-6">
        {!collapsed && (
          <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-3xl border border-[#F1F5F9] shadow-sm">
            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=100" 
                    alt="User" 
                    className="object-cover h-full w-full"
                />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-black text-[#1E293B] truncate tracking-tight">Sherry Harper</span>
                <span className="text-[10px] font-bold text-slate-400 capitalize">Admin Manager</span>
            </div>
          </div>
        )}
        <LogoutButton
          variant="outline"
          redirectPath="/auth/restaurant/signin"
          className={cn(
            "h-14 rounded-2xl transition-all font-black text-sm",
            collapsed 
                ? "w-full justify-center px-0 border-transparent text-red-500 hover:bg-red-50" 
                : "w-full border-red-100 bg-white text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#DC2626] justify-center shadow-lg shadow-red-50"
          )}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
          {!collapsed && "Log Out"}
        </LogoutButton>
      </div>
    </div>
  );
}

function SidebarLink({ route, pathname, collapsed, isLocked, shouldBlock }: { route: any, pathname: string, collapsed: boolean, isLocked: boolean, shouldBlock: boolean }) {
    const isActive = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href));
    
    const handleClick = (e: React.MouseEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        toast.error("Module Locked", {
          description: "Open the day to access this module",
        });
      }
    };

    return (
        <Link
            href={route.href}
            onClick={handleClick}
            className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all text-sm group relative",
                isActive 
                    ? "bg-[#EEF2FF] text-[#4F46E5] font-black shadow-inner" 
                    : "text-slate-500 hover:text-[#4F46E5] hover:bg-slate-50/80 font-bold",
                collapsed && "justify-center px-0",
                isLocked && "opacity-50 cursor-not-allowed grayscale"
            )}
            title={collapsed ? route.title : undefined}
        >
            <route.icon className={cn(
                "h-5 w-5 transition-transform group-hover:scale-110", 
                isActive ? "text-[#4F46E5] stroke-[2.5px]" : "text-slate-400 stroke-[2px]",
                isLocked && "text-slate-300"
            )} />
            {!collapsed && route.title}
            {isLocked && !collapsed && (
              <LockIcon className="w-3 h-3 ml-auto text-slate-400" />
            )}
        </Link>
    );
}
