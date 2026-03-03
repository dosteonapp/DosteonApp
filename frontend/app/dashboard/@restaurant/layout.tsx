import React, { Suspense } from "react";
import { RestaurantSidebar } from "@/components/restaurant-sidebar";
import { ToastContainer } from "@/components/toast-container";
import { Metadata } from "next";
import { RestaurantDayLifecycleProvider } from "@/components/day/RestaurantDayLifecycleProvider";
import { RestaurantDayLifecycleOverlay } from "@/components/day/RestaurantDayLifecycleOverlay";
import { RestaurantDayRouteGuard } from "@/components/day/RestaurantDayRouteGuard";
import { DashboardHeader } from "@/components/dashboard-header";

import { SidebarProvider } from "@/context/SidebarContext";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dosteon - Restaurant Dashboard",
    description: "Manage your restaurant operations efficiently",
  };
}

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RestaurantDayLifecycleProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
          <RestaurantSidebar />
          <main className="flex-1 min-w-0 relative flex flex-col overflow-hidden">
            <Suspense fallback={<div className="h-[100px] bg-white border-b border-slate-100" />}>
              <DashboardHeader />
            </Suspense>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="p-8 space-y-8">
                    <RestaurantDayLifecycleOverlay />
                    <RestaurantDayRouteGuard>
                        {children}
                    </RestaurantDayRouteGuard>
                </div>
            </div>
            <ToastContainer />
          </main>
        </div>
      </SidebarProvider>
    </RestaurantDayLifecycleProvider>
  );
}
