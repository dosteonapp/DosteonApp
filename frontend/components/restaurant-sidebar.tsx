"use client";

import { useEffect } from "react";
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
  TrendingUp,
  Moon,
  Lock as LockIcon,
  ReceiptText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";


import { useRestaurantDayLifecycle } from "./day/RestaurantDayLifecycleProvider";
import { isModuleLocked, shouldBlockModuleAccess } from "@/lib/dayLifecycle/restaurantModuleAccess";
import { isAdminRole } from "@/lib/permissions";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import { useBrand } from "@/context/BrandContext";
import { QK } from "@/lib/queryKeys";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";


export function RestaurantSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleCollapse } = useSidebar();
  const { status, isUserUnlocked } = useRestaurantDayLifecycle();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? null;

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isSidebarCollapsed ? '90px' : '300px');
  }, [isSidebarCollapsed]);

  const workspaceSlug = user?.workspace_slug;
  const base = workspaceSlug ? `/${workspaceSlug}` : '';
  const homeHref = `${base}/dashboard`;

  const prefetchRoute = (href: string) => {
    if (href === homeHref) {
      queryClient.prefetchQuery({
        queryKey: QK.dashboardStats(brandId),
        queryFn: () => restaurantOpsService.getStats(),
        staleTime: 60_000,
      });
      queryClient.prefetchQuery({
        queryKey: QK.recentActivities(brandId),
        queryFn: () => restaurantOpsService.getRecentActivities({ offset: 0, limit: 5 }),
        staleTime: 30_000,
      });
    }
  };



  const operationsRoutes = [
    {
      href: homeHref,
      icon: Home,
      title: "Home",
    },
    {
      href: `${base}/dashboard/sales`,
      icon: TrendingUp,
      title: "Sales",
    },
    {
      href: `${base}/dashboard/expenditure`,
      icon: ReceiptText,
      title: "Expenditure",
    },
    {
      href: `${base}/dashboard/inventory`,
      icon: Package,
      title: "Inventory",
    },
    {
      href: `${base}/dashboard/closing`,
      icon: Moon,
      title: "Closing",
    },
  ];

  const systemsRoutes = [
    {
      href: `${base}/dashboard/notifications`,
      icon: Bell,
      title: "Notifications",
    },
    // Settings is only visible to Owner/Manager roles
    ...(user && isAdminRole(user.role)
      ? [
          {
            href: `${base}/dashboard/settings`,
            icon: Settings,
            title: "Settings",
          } as const,
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        "bg-white transition-all duration-500 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-[120] flex shrink-0 relative",
        // Mobile: bottom navigation
        "fixed bottom-0 left-0 right-0 h-20 border-t flex flex-row items-center justify-around",
        // Desktop: left sidebar (touches navbar, no overlap)
        "md:fixed md:top-[86px] md:bottom-0 md:left-0 md:h-auto md:flex-col md:border-r md:border-slate-100 md:border-t-0 md:w-auto",
        isSidebarCollapsed ? "md:w-[90px]" : "md:w-[280px]"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-xl border border-slate-100 bg-white shadow-sm absolute -right-4 top-4 z-50 transition-all hover:shadow-md hover:border-indigo-100 active:scale-90 hidden md:flex"
        onClick={toggleCollapse}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="h-4 w-4 text-[#3B59DA] stroke-[3px]" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-slate-400 stroke-[3px]" />
        )}
      </Button>

<div className="flex-1 flex flex-row md:flex-col items-center md:items-stretch justify-around md:justify-start md:overflow-y-auto overflow-x-hidden md:overflow-x-visible no-scrollbar py-1 md:py-6 px-2 md:px-6 gap-0 md:gap-0">
        {/* Tier 1: Operations Section */}
        <div className="space-y-2 md:space-y-4 flex-1 md:flex-none">
          {!isSidebarCollapsed && (
            <h3 className="hidden md:block px-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 font-figtree">
              Operations
            </h3>
          )}
          <div className="flex flex-row md:flex-col gap-1 md:gap-2 flex-1">
              {operationsRoutes.map((route) => (
                <SidebarLink
                  key={route.href}
                  route={route}
                  pathname={pathname}
                  collapsed={isSidebarCollapsed}
                  isLocked={status ? (isModuleLocked(route.href, status.state) && !isUserUnlocked) : false}
                  shouldBlock={status ? (shouldBlockModuleAccess(route.href, status.state) && !isUserUnlocked) : false}
                  onPrefetch={() => prefetchRoute(route.href)}
                />
              ))}
          </div>
        </div>

        {/* Tier 2: Administrative Section (Space shared equally) */}
        <div className="space-y-2 md:space-y-4 flex-1 md:flex-none">
          {!isSidebarCollapsed && (
            <h3 className="hidden md:block px-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 font-figtree">
              Systems
            </h3>
          )}
          <div className="flex flex-row md:flex-col gap-1 md:gap-2 flex-1">
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
                  {user?.avatar_url || user?.image_url ? (
                      <img
                          src={(user.avatar_url || user.image_url) as string}
                          alt="User"
                          className="object-cover h-full w-full"
                      />
                  ) : (
                      <span className="text-[#3B59DA] font-bold text-lg uppercase tracking-wider">
                          {activeBrand?.name?.[0]?.toUpperCase() ?? "B"}
                      </span>
                  )}
              </div>

              <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-[#1E293B] truncate tracking-tight">
                    {activeBrand?.name ?? "My Restaurant"}
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

type SidebarRoute = {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
};

function SidebarLink({ route, pathname, collapsed, isLocked, shouldBlock, onPrefetch }: { route: SidebarRoute, pathname: string, collapsed: boolean, isLocked: boolean, shouldBlock: boolean, onPrefetch?: () => void }) {
    // A route is "home" when there is nothing after "/dashboard" in its href.
    // Use prefix-match for all other routes (e.g. /dashboard/sales matches /dashboard/sales/*)
    const dashboardSuffix = route.href.split('/dashboard')[1] ?? '';
    const isHomeRoute = dashboardSuffix === '';
    const isActive = pathname === route.href || (!isHomeRoute && pathname.startsWith(route.href));
    
    const handleClick = (e: React.MouseEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        toast({
          variant: "destructive",
          title: "Module locked",
          description: "Complete Opening Stock to start the day.",
        });
      }
    };

    return (
        <Link
            href={route.href}
            onClick={handleClick}
            onMouseEnter={onPrefetch}
            className={cn(
                "flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 rounded-lg md:rounded-2xl px-3 md:px-5 py-3 md:py-4 transition-all text-[10px] md:text-[15px] group relative font-semibold flex-1 md:flex-none",
                isActive
                    ? "bg-indigo-50 text-[#3B59DA]"
                    : "text-slate-500 hover:text-[#3B59DA] hover:bg-indigo-50/50",
                collapsed && "md:justify-center md:px-0 md:mx-2",
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
