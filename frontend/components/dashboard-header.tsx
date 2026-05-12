"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Menu,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { useSidebar } from "@/context/SidebarContext";
import { useBrand } from "@/context/BrandContext";
import { useUser } from "@/context/UserContext";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---------------------------------------------------------------------------
// Brand card avatar — brand logo or gradient initial fallback
// ---------------------------------------------------------------------------
function BrandAvatar({
  logoUrl,
  name,
  className,
}: {
  logoUrl: string | null | undefined;
  name: string;
  className?: string;
}) {
  return logoUrl ? (
    <img
      src={logoUrl}
      alt={name}
      className={cn("h-full w-full object-cover", className)}
    />
  ) : (
    <div
      className={cn(
        "h-full w-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center",
        className
      )}
    >
      <span className="text-white text-[14px] font-black leading-none">
        {name[0]?.toUpperCase() ?? "B"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main header
// ---------------------------------------------------------------------------
export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleSidebar } = useSidebar();
  const { activeBrand, brands, setActiveBrand } = useBrand();
  const { user } = useUser();
  const { isOpen } = useRestaurantDayLifecycle();


  // Real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  useEffect(() => {
    if (!notifOpen) return;
    setNotifLoading(true);
    restaurantOpsService.getNotifications({ limit: 10 })
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, [notifOpen]);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);

  // Strip workspace-slug prefix so comparisons work for any workspace URL
  const dashPath = (() => {
    const idx = pathname.indexOf("/dashboard");
    return idx >= 0 ? pathname.slice(idx) : pathname;
  })();

  const getBreadcrumbs = (): string[] => {
    // Home
    if (dashPath === "/dashboard") return ["Home"];

    // Sales — tab name from ?tab= search param
    if (dashPath === "/dashboard/sales") {
      const tab = searchParams.get("tab") ?? "log";
      const label: Record<string, string> = {
        log:     "Log Sales",
        history: "Today's Sales History",
        menu:    "Menu Management",
      };
      return ["Sales", label[tab] ?? "Log Sales"];
    }

    // Expenditure
    if (dashPath === "/dashboard/expenditure/history")
      return ["Expenditure", "Expenditure History"];
    if (dashPath.startsWith("/dashboard/expenditure"))
      return ["Expenditure"];

    // Inventory
    if (dashPath === "/dashboard/inventory/daily-stock-count")
      return ["Inventory", "Daily Stock Count"];
    if (dashPath === "/dashboard/inventory/new") {
      return ["Inventory", searchParams.get("edit") ? "Edit Item" : "Add New Item"];
    }
    if (dashPath === "/dashboard/inventory") {
      const tab = searchParams.get("tab") ?? "catalog";
      const label: Record<string, string> = {
        catalog: "Product Catalog",
        usage:   "Stock Usage",
      };
      return ["Inventory", label[tab] ?? "Product Catalog"];
    }
    if (dashPath.startsWith("/dashboard/inventory/"))
      return ["Inventory", "Item Details"];
    if (dashPath.startsWith("/dashboard/inventory"))
      return ["Inventory"];

    // Closing
    if (dashPath.startsWith("/dashboard/closing")) return ["Closing"];

    // Notifications
    if (dashPath.startsWith("/dashboard/notifications")) return ["Notifications"];

    // Settings
    if (dashPath.startsWith("/dashboard/settings")) {
      const parts = ["Settings"];
      if (dashPath.includes("/personal"))       parts.push("Personal Details");
      else if (dashPath.includes("/business"))  parts.push("Business Settings");
      else if (dashPath.includes("/notifications")) parts.push("Notification Settings");
      return parts;
    }

    return [];
  };

  const breadcrumbs = getBreadcrumbs();
  const isOwner = user?.role === "OWNER";
  const isMultiBrand = brands.length > 1;

  const brandDisplayName = activeBrand?.name ?? "My Restaurant";

  // Shared LIVE/CLOSED pill
  const livePill = (
    <span
      className={cn(
        "shrink-0 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide",
        isOpen
          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
          : "bg-slate-100 border-slate-300 text-slate-500"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        )}
      />
      {isOpen ? "LIVE" : "CLOSED"}
    </span>
  );

  // Small contained avatar + stacked text — used in both multi and single brand
  const brandCardBody = (
    <>
      {/* Avatar: small square with its own border, not spanning full card height */}
      <div className="h-8 w-8 rounded-[8px] overflow-hidden shrink-0 border border-slate-100 shadow-sm">
        <BrandAvatar logoUrl={activeBrand?.logo_url} name={brandDisplayName} />
      </div>

      {/* Stacked text */}
      <div className="flex flex-col justify-center min-w-[100px] max-w-[200px]">
        <span className="text-[13px] font-bold text-[#1E293B] truncate leading-tight">
          {brandDisplayName}
        </span>
        <div className="flex items-center gap-1.5 mt-[3px]">
          {livePill}
        </div>
      </div>
    </>
  );

  // Small square caret button — sits at the right edge, only for multi-brand
  const caretSection = (
    <div className="h-7 w-7 rounded-[7px] bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 transition-colors group-hover:bg-slate-200 [[data-state=open]_&]:bg-slate-200">
      <ChevronDown className="h-3.5 w-3.5 text-slate-600 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
    </div>
  );

  return (
    <div className="bg-white border-b border-slate-100 h-[72px] md:h-[88px] sticky top-0 z-40 font-figtree w-full">
      <div className="h-full px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4">

        {/* ── Left: hamburger + back + (non-owner brand pill) + breadcrumbs ── */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 lg:hidden shrink-0"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5 stroke-[2.5px]" />
          </Button>

          {breadcrumbs.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-[14px] hover:bg-slate-50 text-slate-400 hover:text-[#3B59DA] transition-all active:scale-95 border border-slate-100/50 shadow-sm hidden sm:flex shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5 stroke-[3px]" />
            </Button>
          )}

          {/* Non-owner static brand label */}
          {!isOwner && activeBrand && (
            <span className="hidden sm:inline-flex items-center rounded-xl px-3 py-1.5 text-[13px] font-bold text-[#3B59DA] bg-indigo-50 border border-indigo-100/80 shrink-0 max-w-[160px] truncate">
              {activeBrand.name}
            </span>
          )}

          {activeBrand && breadcrumbs.length > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-slate-200 stroke-[4px] shrink-0 hidden sm:block" />
          )}

          <div className="flex items-center gap-2 min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-200 stroke-[4px] shrink-0" />
                )}
                <span
                  className={cn(
                    "text-[15px] md:text-[16px] font-bold tracking-tight transition-colors font-figtree truncate",
                    idx === breadcrumbs.length - 1
                      ? "text-[#1E293B]"
                      : "text-slate-300 hover:text-slate-400 cursor-default hidden sm:block"
                  )}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Right: brand card → date/time → bell ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* ── Brand card — owner only ── */}
          {isOwner && (
            isMultiBrand ? (
              /* Multi-brand: entire card is the dropdown trigger */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center gap-2.5 h-[46px] bg-white border border-slate-200 rounded-[12px] shadow-sm px-2.5 hover:border-slate-300 hover:shadow-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B59DA]/25 active:scale-[0.98]">
                    {/* Mobile: avatar + name + small chevron */}
                    <div className="flex sm:hidden items-center gap-2">
                      <div className="h-7 w-7 rounded-[6px] overflow-hidden shrink-0 border border-slate-100">
                        <BrandAvatar logoUrl={activeBrand?.logo_url} name={brandDisplayName} />
                      </div>
                      <span className="text-[13px] font-bold text-[#1E293B] max-w-[90px] truncate">
                        {brandDisplayName}
                      </span>
                      <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
                    </div>
                    {/* sm+: full card body + caret */}
                    <div className="hidden sm:flex items-center gap-2.5">
                      {brandCardBody}
                      {caretSection}
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={6}
                  className="w-52 rounded-2xl border-slate-100 shadow-xl p-1.5 animate-in fade-in-0 zoom-in-95 duration-150"
                >
                  {brands.map((brand) => {
                    const isActive = activeBrand?.id === brand.id;
                    return (
                      <DropdownMenuItem
                        key={brand.id}
                        onClick={() => { if (!isActive) setActiveBrand(brand); }}
                        className={cn(
                          "rounded-xl gap-2 font-semibold text-[13px] px-3 py-2.5 cursor-pointer",
                          isActive
                            ? "text-[#3B59DA] bg-indigo-50/80 focus:bg-indigo-50/80 focus:text-[#3B59DA]"
                            : "text-slate-700"
                        )}
                      >
                        <span className="flex-1 truncate">{brand.name}</span>
                        {isActive && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#3B59DA] shrink-0" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Single brand: same visual card, no caret, not interactive */
              <div className="flex items-center gap-2.5 h-[46px] bg-white border border-slate-200 rounded-[12px] shadow-sm px-2.5 cursor-default select-none">
                {/* Mobile */}
                <div className="flex sm:hidden items-center gap-2">
                  <div className="h-7 w-7 rounded-[6px] overflow-hidden shrink-0 border border-slate-100">
                    <BrandAvatar logoUrl={activeBrand?.logo_url} name={brandDisplayName} />
                  </div>
                  <span className="text-[13px] font-bold text-[#1E293B] max-w-[90px] truncate">
                    {brandDisplayName}
                  </span>
                </div>
                {/* sm+: full card body */}
                <div className="hidden sm:flex items-center gap-2.5">
                  {brandCardBody}
                </div>
              </div>
            )
          )}

          {/* Date/time pill */}
          <div className="hidden lg:flex items-center gap-3 bg-indigo-50/30 px-4 py-2.5 rounded-[16px] border border-indigo-100/30 shadow-sm hover:bg-white hover:border-indigo-100 transition-all group cursor-default">
            <Calendar className="h-4 w-4 text-[#3B59DA] group-hover:scale-110 transition-transform stroke-[2.5px] shrink-0" />
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500 font-figtree">
              <span className="group-hover:text-slate-900 transition-colors uppercase hidden xl:block">
                {formatDate(currentTime)}
              </span>
              <span className="group-hover:text-slate-900 transition-colors uppercase xl:hidden">
                {formatDate(currentTime).split(",")[0]}
              </span>
              <div className="h-1 w-1 rounded-full bg-slate-200 group-hover:bg-[#3B59DA] transition-colors" />
              <span className="tabular-nums text-[#3B59DA]">{formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Notification bell */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 rounded-[14px] bg-white border border-slate-100 relative group shadow-sm hover:shadow-md hover:border-[#3B59DA]/20 transition-all active:scale-95 shrink-0"
              >
                <Bell className="h-5 w-5 text-slate-400 group-hover:text-[#3B59DA] transition-colors stroke-[2.5px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-[#EF4444] border-2 border-white rounded-full shadow-sm animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-80 p-0 rounded-[14px] border border-slate-100 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <span className="text-[14px] font-bold text-[#1E293B] font-figtree">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold text-white bg-[#EF4444] rounded-full px-2 py-0.5">{unreadCount} new</span>
                )}
              </div>
              <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
                {notifLoading ? (
                  <div className="py-10 text-center text-slate-400 text-[13px] font-figtree">Loading…</div>
                ) : notifications.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-[13px] font-figtree">No notifications</div>
                ) : notifications.map((n) => (
                  <div key={n.id} className="flex gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="shrink-0 mt-0.5">
                      {n.type === "alert" || n.type === "critical" ? (
                        <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                      ) : n.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Info className="h-4 w-4 text-[#3B59DA]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#1E293B] font-figtree leading-tight">{n.title}</p>
                      <p className="text-[12px] text-slate-400 font-figtree mt-0.5 leading-snug line-clamp-2">{n.description}</p>
                      <p className="text-[11px] text-slate-300 font-figtree mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </div>
  );
}
