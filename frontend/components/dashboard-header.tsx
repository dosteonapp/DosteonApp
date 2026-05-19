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
  Receipt,
  Plus,
  ClipboardList,
  Loader2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
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
  const { toggleSidebar, isSidebarCollapsed } = useSidebar();
  const { activeBrand, brands, setActiveBrand } = useBrand();
  const { user } = useUser();
  const { isOpen, canStartOpening, finishOpening } = useRestaurantDayLifecycle();

  // Quick-open action
  const [isQuickOpening, setIsQuickOpening] = useState(false);
  const skipsStockCount = user?.daily_stock_count === false;
  const homeHref = user?.workspace_slug ? `/${user.workspace_slug}/dashboard` : "/dashboard";

  const handleQuickOpen = async () => {
    if (!canStartOpening || isQuickOpening) return;
    setIsQuickOpening(true);
    try { await finishOpening(); }
    catch { }
    finally { setIsQuickOpening(false); }
  };

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

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);

  const formatShortDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);

  // Strip workspace-slug prefix so comparisons work for any workspace URL
  const dashPath = (() => {
    const idx = pathname.indexOf("/dashboard");
    return idx >= 0 ? pathname.slice(idx) : pathname;
  })();

  const getBreadcrumbs = (): string[] => {
    if (dashPath === "/dashboard") return ["Home"];

    // Sales — sub-tab from ?tab= query param
    if (dashPath === "/dashboard/sales") {
      const tab = searchParams.get("tab") ?? "log";
      const label: Record<string, string> = {
        log:     "Log Sales",
        history: "Today's Sales History",
        menu:    "Menu Management",
      };
      return ["Sales", label[tab] ?? "Log Sales"];
    }
    if (dashPath.startsWith("/dashboard/sales")) return ["Sales"];

    // Expenses
    if (dashPath.startsWith("/dashboard/expenses")) return ["Expenses"];

    // Expenditure
    if (dashPath === "/dashboard/expenditure/history") return ["Expenditure", "History"];
    if (dashPath.startsWith("/dashboard/expenditure")) return ["Expenditure"];

    // Inventory
    if (dashPath === "/dashboard/inventory/daily-stock-count")
      return ["Inventory", "Daily Stock Count"];
    if (dashPath === "/dashboard/inventory/new")
      return ["Inventory", searchParams.get("edit") ? "Edit Item" : "Add New Item"];
    if (dashPath === "/dashboard/inventory/items") return ["Inventory", "All Items"];
    if (dashPath === "/dashboard/inventory") {
      const tab = searchParams.get("tab") ?? "catalog";
      const label: Record<string, string> = { catalog: "Product Catalog", consumption: "Consumption" };
      return ["Inventory", label[tab] ?? "Product Catalog"];
    }
    if (/^\/dashboard\/inventory\/[^/]+$/.test(dashPath)) return ["Inventory", "Item Details"];
    if (dashPath.startsWith("/dashboard/inventory")) return ["Inventory"];

    // Closing / Opening
    if (dashPath.startsWith("/dashboard/closing")) return ["Closing"];
    if (dashPath.startsWith("/dashboard/opening")) return ["Opening"];

    // Activities
    if (dashPath.startsWith("/dashboard/activities")) return ["Activities"];

    // Kitchen & Operations
    if (dashPath.startsWith("/dashboard/kitchen-service")) return ["Kitchen Service"];
    if (dashPath.startsWith("/dashboard/stock-tracking")) return ["Stock Tracking"];
    if (dashPath.startsWith("/dashboard/schedule")) return ["Schedule"];
    if (dashPath.startsWith("/dashboard/petty-cash")) return ["Petty Cash"];
    if (dashPath.startsWith("/dashboard/logs")) return ["Logs"];

    // Orders
    if (/^\/dashboard\/orders\/[^/]+\/payment\/confirmation/.test(dashPath))
      return ["Orders", "Payment", "Confirmation"];
    if (/^\/dashboard\/orders\/[^/]+\/payment/.test(dashPath))
      return ["Orders", "Payment"];
    if (dashPath.startsWith("/dashboard/orders")) return ["Orders"];

    // Suppliers
    if (dashPath === "/dashboard/suppliers/discover") return ["Suppliers", "Discover"];
    if (dashPath === "/dashboard/suppliers/dashboard") return ["Suppliers", "Overview"];
    if (/^\/dashboard\/suppliers\/[^/]+\/chat$/.test(dashPath)) return ["Suppliers", "Chat"];
    if (/^\/dashboard\/suppliers\/[^/]+$/.test(dashPath)) return ["Suppliers", "Supplier Details"];
    if (dashPath.startsWith("/dashboard/suppliers")) return ["Suppliers"];

    // Notifications
    if (dashPath.startsWith("/dashboard/notifications")) return ["Notifications"];

    // Settings — full 3-level hierarchy
    if (dashPath.startsWith("/dashboard/settings")) {
      const parts: string[] = ["Settings"];

      if (dashPath.includes("/personal")) {
        parts.push("Personal");
        if (dashPath.includes("/profile")) parts.push("Profile");
        else if (dashPath.includes("/security")) parts.push("Security");
      } else if (dashPath.includes("/business")) {
        parts.push("Business Settings");
        if (dashPath.includes("/profile")) parts.push("Restaurant Profile");
        else if (/\/team\/[^/]+/.test(dashPath)) { parts.push("Team Management"); parts.push("Member Details"); }
        else if (dashPath.includes("/team")) parts.push("Team Management");
        else if (dashPath.includes("/menu")) parts.push("Menu Management");
        else if (dashPath.includes("/brands")) parts.push("Brands");
      } else if (dashPath.includes("/notifications")) {
        parts.push("Notification Settings");
      }

      return parts;
    }

    return [];
  };

  const breadcrumbs = getBreadcrumbs();
  const isOwner = user?.role === "OWNER";
  const isMultiBrand = brands.length > 1;

  const brandDisplayName = activeBrand?.name ?? "My Restaurant";
  const [orgLogoUrl, setOrgLogoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  useEffect(() => {
    restaurantOpsService.getSettings().then((s: any) => {
      if (s?.logo_url) setOrgLogoUrl(s.logo_url);
      if (s?.location) setLocation(s.location);
    }).catch(() => {});
  }, []);
  const brandLogoUrl = activeBrand?.logo_url ?? orgLogoUrl ?? null;

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

  // Shared brand card inner content (avatar + name + location + live pill)
  const brandCardInner = (
    <>
      <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-sm">
        <BrandAvatar logoUrl={brandLogoUrl} name={brandDisplayName} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[13px] font-bold text-[#1E293B] truncate leading-tight">
          {brandDisplayName}
        </span>
        {location && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            {location}
          </span>
        )}
        <div className="mt-1">
          {livePill}
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white border-b border-slate-100 h-[86px] sticky top-0 z-40 font-figtree w-full flex">

      {/* ── LEFT PANEL: fixed width matching sidebar ── */}
      <div className={cn(
        "hidden md:flex items-center border-r border-slate-100 shrink-0 transition-all duration-500 overflow-hidden",
        isSidebarCollapsed ? "w-[90px] justify-center" : "w-[280px] px-4 gap-2"
      )}>
        {isSidebarCollapsed ? (
          /* Collapsed: icon-only logo (same as collapsed sidebar) */
          <Link href={homeHref} className="group active:scale-95 transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-50/80 to-white rounded-xl flex items-center justify-center border border-indigo-100/50 overflow-hidden shadow-sm group-hover:shadow-md transition-all">
              <div className="w-8 h-8 relative overflow-hidden flex items-center justify-center">
                <img
                  src="/images/logo-full.png"
                  alt="D"
                  className="absolute left-0 h-8 w-auto max-w-none -translate-x-[3px] object-cover"
                />
              </div>
            </div>
          </Link>
        ) : (
          /* Expanded: logo icon + thin separator + brand card */
          <>
            <Link href={homeHref} className="shrink-0 group active:scale-95 transition-all">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100/50 overflow-hidden flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <div className="w-7 h-7 relative overflow-hidden flex items-center justify-center">
                  <img
                    src="/images/logo-full.png"
                    alt="D"
                    className="absolute left-0 h-7 w-auto max-w-none -translate-x-[3px] object-cover"
                  />
                </div>
              </div>
            </Link>

            <div className="h-8 w-px bg-slate-100 shrink-0" />

            {/* Brand card */}
            <div className="flex-1 min-w-0 rounded-xl border border-slate-100 bg-slate-50/60 shadow-sm">
              {isOwner && isMultiBrand ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group flex items-center gap-2.5 w-full py-2.5 px-3 hover:bg-slate-100/80 rounded-xl transition-all focus:outline-none active:scale-[0.98]">
                      {brandCardInner}
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 group-[[data-state=open]]:rotate-180" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={6}
                    className="w-56 rounded-2xl border-slate-100 shadow-xl p-1.5 animate-in fade-in-0 zoom-in-95 duration-150 z-[200]"
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
                <div className="flex items-center gap-2.5 py-2.5 px-3">
                  {brandCardInner}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT CONTENT: flex-1 ── */}
      <div className="flex-1 flex items-center justify-between px-4 sm:px-6 gap-4 min-w-0">

        {/* Left inner: mobile hamburger + back button + breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">

          {/* Mobile hamburger — hidden on md+ */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 md:hidden shrink-0"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5 stroke-[2.5px]" />
          </Button>

          {/* Back button */}
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

          {/* Breadcrumbs */}
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

        {/* Right inner: action buttons + date/time + bell */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Context-aware action buttons */}
          {user?.role && (
            <div className="hidden sm:flex items-center gap-2">
              {isOpen ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/expenses")}
                    className="h-9 gap-1.5 text-[13px] font-bold rounded-xl border-slate-200 text-slate-600 hidden lg:flex"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    Log Expenses
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push("/dashboard/sales")}
                    className="h-9 gap-1.5 text-[13px] font-bold rounded-xl bg-[#3B59DA] hover:bg-[#2d4bc8] text-white shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Log Sales
                  </Button>
                </>
              ) : skipsStockCount ? (
                <Button
                  size="sm"
                  onClick={handleQuickOpen}
                  disabled={isQuickOpening || !canStartOpening}
                  className="h-9 gap-1.5 text-[13px] font-bold rounded-xl bg-[#3B59DA] hover:bg-[#2d4bc8] text-white shadow-sm disabled:opacity-60"
                >
                  {isQuickOpening
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Plus className="h-3.5 w-3.5" />
                  }
                  Open Kitchen
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => router.push("/dashboard/inventory/daily-stock-count")}
                  className="h-9 gap-1.5 text-[13px] font-bold rounded-xl bg-[#3B59DA] hover:bg-[#2d4bc8] text-white shadow-sm"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Count Stock
                </Button>
              )}
            </div>
          )}

          {/* Date/time — two-line format */}
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-50/80 px-3.5 py-2 rounded-[14px] border border-slate-100 shadow-sm cursor-default">
            <Calendar className="h-4 w-4 text-[#3B59DA] shrink-0 stroke-[2.5px]" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                {formatShortDate(currentTime)}
              </span>
              <span className="text-[15px] font-black text-[#1E293B] tabular-nums mt-0.5">
                {formatTime(currentTime)}
              </span>
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
