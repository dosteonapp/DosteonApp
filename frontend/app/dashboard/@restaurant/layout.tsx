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
          {/* Fixed Sidebar */}
          <RestaurantSidebar />
          
          {/* Spacer for fixed sidebar on desktop */}
          <div 
            className="hidden lg:block shrink-0 transition-all duration-500" 
            style={{ width: 'var(--sidebar-width, 300px)' }}
          />

          <main className="flex-1 overflow-auto relative flex flex-col">
            <Suspense fallback={<div className="h-[100px] bg-white border-b border-slate-100" />}>
              <DashboardHeader />
            </Suspense>
            <div className="p-8 space-y-8">
                <RestaurantDayLifecycleOverlay />
                <RestaurantDayRouteGuard>
                    {children}
                </RestaurantDayRouteGuard>
            </div>
            <ToastContainer />
          </main>
        </div>
      </SidebarProvider>
    </RestaurantDayLifecycleProvider>
  );
}
