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

import { cn, formatUserName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";


import { useRestaurantDayLifecycle } from "./day/RestaurantDayLifecycleProvider";
import { isModuleLocked, shouldBlockModuleAccess } from "@/lib/dayLifecycle/restaurantModuleAccess";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";


export function RestaurantSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, isSidebarCollapsed, toggleCollapse } = useSidebar();
  const { status, isUserUnlocked } = useRestaurantDayLifecycle();
  const { user } = useUser();


  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isSidebarCollapsed ? '90px' : '300px');
  }, [isSidebarCollapsed]);

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
        "h-screen flex-col border-r border-slate-100 bg-white transition-all duration-500 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-[120] flex shrink-0",
        isSidebarCollapsed ? "w-[90px]" : "w-[300px]",
        "fixed inset-y-0 left-0 md:relative md:translate-x-0 transition-transform",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex h-[100px] items-center justify-between px-6 border-b border-slate-50 relative shrink-0 transition-all duration-500">
        {!isSidebarCollapsed ? (
          <Link
            href="/dashboard"
            className="flex items-center group transition-all duration-500 active:scale-95 px-4"
          >
            <img 
              src="/images/logo-full.png" 
              alt="Dosteon" 
              className="h-9 w-auto group-hover:drop-shadow-sm transition-all"
            />
          </Link>
        ) : (
          <div className="flex-1 flex justify-center py-2">
             <Link href="/dashboard" className="group transition-all duration-500 active:scale-95">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-50/80 to-white rounded-2xl flex items-center justify-center border border-indigo-100/50 overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                    <div className="w-10 h-10 relative overflow-hidden flex items-center justify-center">
                        <img 
                            src="/images/logo-full.png" 
                            alt="D" 
                            className="absolute left-0 h-10 w-auto max-w-none -translate-x-1.5 object-cover"
                        />
                    </div>
                </div>
              </Link>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-xl border border-slate-100 bg-white shadow-sm absolute -right-4 top-[36px] z-50 transition-all hover:shadow-md hover:border-indigo-100 active:scale-90 hidden md:flex", 
            isSidebarCollapsed && "static mt-0"
          )}
          onClick={toggleCollapse}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-[#3B59DA] stroke-[3px]" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-400 stroke-[3px]" />
          )}
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar py-10 px-6">
        {/* Tier 1: Operations Section */}
        <div className="space-y-4">
          {!isSidebarCollapsed && (
            <h3 className="px-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 font-figtree">
              Operations
            </h3>
          )}
          <div className="flex flex-col gap-2">
              {operationsRoutes.map((route) => (
              <SidebarLink 
                  key={route.href} 
                  route={route} 
                  pathname={pathname} 
                  collapsed={isSidebarCollapsed} 
                  isLocked={status ? (isModuleLocked(route.href, status.state) && !isUserUnlocked) : false}
                  shouldBlock={status ? (shouldBlockModuleAccess(route.href, status.state) && !isUserUnlocked) : false}
              />
              ))}
          </div>
        </div>

        {/* Tier 2: Administrative Section (Space shared equally) */}
        <div className="space-y-4">
          {!isSidebarCollapsed && (
            <h3 className="px-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 font-figtree">
              Systems
            </h3>
          )}
          <div className="flex flex-col gap-2">
              {systemsRoutes.map((route) => (

              <SidebarLink 
                  key={route.href} 
                  route={route} 
                  pathname={pathname} 
                  collapsed={isSidebarCollapsed} 
                  isLocked={status ? isModuleLocked(route.href, status.state) : false}
                  shouldBlock={status ? shouldBlockModuleAccess(route.href, status.state) : false}
              />
              ))}
          </div>
        </div>

        {/* Tier 3: User Section */}
        <div className="space-y-8 pt-6 border-t border-slate-50">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-4 px-2 group cursor-pointer transition-all hover:translate-x-1">
              <div className="h-12 w-12 rounded-2xl bg-[#3B59DA]/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  {user?.image_url ? (
                      <img 
                          src={user.image_url} 
                          alt="User" 
                          className="object-cover h-full w-full"
                      />
                  ) : (
                      <span className="text-[#3B59DA] font-bold text-lg uppercase tracking-wider">
                          {(user?.first_name?.[0] || "") + (user?.last_name?.[0] || "") || "ST"}
                      </span>
                  )}
              </div>

              <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-[#1E293B] truncate tracking-tight">
                    {formatUserName(user?.first_name, user?.last_name)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 capitalize flex items-center gap-1.5">
                      {user?.role || "Staff"}
                  </span>
              </div>

            </div>
          )}
          <LogoutButton
            variant="outline"
            redirectPath="/auth/restaurant/signin"
            className={cn(
              "h-14 rounded-[20px] transition-all font-bold text-sm group border-2",
              isSidebarCollapsed 
                  ? "w-full justify-center px-0 border-transparent text-slate-400 hover:text-red-500 hover:bg-red-50" 
                  : "w-full border-red-100 bg-white text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 justify-center shadow-lg shadow-red-500/5 transition-all duration-300"
            )}
          >
            <LogOut className={cn("h-5 w-5 transition-transform", !isSidebarCollapsed && "mr-3 group-hover:-translate-x-1")} />
            {!isSidebarCollapsed && "Log Out"}
          </LogoutButton>
        </div>
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
                    ? "bg-indigo-50 text-[#3B59DA]" 
                    : "text-slate-500 hover:text-[#3B59DA] hover:bg-indigo-50/50",
                collapsed && "justify-center px-0 mx-2",
                isLocked && "opacity-40 cursor-not-allowed grayscale-[0.5]"
            )}
            title={collapsed ? route.title : undefined}
        >
            {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#3B59DA] rounded-r-full" />
            )}
            <route.icon className={cn(
                "h-5 w-5 transition-colors duration-300 group-hover:scale-110", 
                isActive 
                    ? "text-[#3B59DA] stroke-[3px]" 
                    : "text-slate-400 stroke-[2px] group-hover:text-[#3B59DA]",
                isLocked && "text-slate-300"
            )} />
            {!collapsed && route.title}
            {isActive && !collapsed && (
                 <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                 >
                    <ChevronRight className="h-4 w-4 ml-auto text-[#3B59DA]/50 stroke-[3px]" />
                 </motion.div>
            )}
            {isLocked && !collapsed && (
              <LockIcon className="w-3.5 h-3.5 ml-auto text-slate-300" />
            )}
        </Link>
    );
}
