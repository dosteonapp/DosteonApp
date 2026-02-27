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


import { useRestaurantDayLifecycle } from "./day/RestaurantDayLifecycleProvider";
import { isModuleLocked, shouldBlockModuleAccess } from "@/lib/dayLifecycle/restaurantModuleAccess";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
        "flex h-full flex-col border-r border-slate-100 bg-white transition-all duration-500 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50",
        collapsed ? "w-[90px]" : "w-[300px]"
      )}
    >
      <div className="flex h-[101px] items-center justify-between px-10 border-b border-slate-50 relative shrink-0">
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
            "h-8 w-8 rounded-xl border border-slate-100 bg-white shadow-sm absolute -right-4 top-[38px] z-50 transition-all hover:shadow-md hover:border-indigo-100 active:scale-90", 
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
        <nav className="flex flex-col gap-10 px-6">
          {/* Operations Section */}
          <div className="space-y-6">
            {!collapsed && (
              <h3 className="px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400/80 font-outfit">
                Operations
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
          <div className="space-y-6">
            {!collapsed && (
              <h3 className="px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400/80 font-outfit">
                Systems
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

      <div className="mt-auto p-6 space-y-8 border-t border-slate-50">
        {!collapsed && (
          <div className="flex items-center gap-4 px-2 group cursor-pointer transition-all hover:translate-x-1">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=100" 
                    alt="User" 
                    className="object-cover h-full w-full"
                />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-black text-[#1E293B] truncate tracking-tight">Sherry Harper</span>
                <span className="text-[11px] font-bold text-slate-400 capitalize flex items-center gap-1.5">
                    Admin Manager
                </span>
            </div>
          </div>
        )}
        <LogoutButton
          variant="outline"
          redirectPath="/auth/restaurant/signin"
          className={cn(
            "h-14 rounded-2xl transition-all font-black text-sm group border-2",
            collapsed 
                ? "w-full justify-center px-0 border-transparent text-slate-400 hover:text-red-500 hover:bg-red-50" 
                : "w-full border-red-50 bg-white text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 justify-center shadow-lg shadow-red-500/5 transition-all duration-300"
          )}
        >
          <LogOut className={cn("h-5 w-5 transition-transform", !collapsed && "mr-3 group-hover:-translate-x-1")} />
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
          description: "Clear your opening prep to unlock this module.",
        });
      }
    };

    return (
        <Link
            href={route.href}
            onClick={handleClick}
            className={cn(
                "flex items-center gap-4 rounded-2xl px-5 py-4 transition-all text-[15px] group relative font-semibold",
                isActive 
                    ? "bg-[#3B59DA] text-white shadow-xl shadow-indigo-100" 
                    : "text-slate-500 hover:text-[#3B59DA] hover:bg-indigo-50/50",
                collapsed && "justify-center px-0 mx-2",
                isLocked && "opacity-40 cursor-not-allowed grayscale-[0.5]"
            )}
            title={collapsed ? route.title : undefined}
        >
            <route.icon className={cn(
                "h-5 w-5 transition-colors duration-300 group-hover:scale-110", 
                isActive 
                    ? "text-white stroke-[3px]" 
                    : "text-slate-400 stroke-[2px] group-hover:text-[#3B59DA]",
                isLocked && "text-slate-300"
            )} />
            {!collapsed && route.title}
            {isActive && !collapsed && (
                 <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                 >
                    <ChevronRight className="h-4 w-4 ml-auto text-white/50 stroke-[3px]" />
                 </motion.div>
            )}
            {isLocked && !collapsed && (
              <LockIcon className="w-3.5 h-3.5 ml-auto text-slate-300" />
            )}
        </Link>
    );
}
