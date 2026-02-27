import React, { Suspense } from "react";
import { RestaurantSidebar } from "@/components/restaurant-sidebar";
import { ToastContainer } from "@/components/toast-container";
import { Metadata } from "next";
import { RestaurantDayLifecycleProvider } from "@/components/day/RestaurantDayLifecycleProvider";
import { RestaurantDayLifecycleOverlay } from "@/components/day/RestaurantDayLifecycleOverlay";
import { RestaurantDayRouteGuard } from "@/components/day/RestaurantDayRouteGuard";
import { DashboardHeader } from "@/components/dashboard-header";

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
      <div className="flex h-screen overflow-hidden bg-[#F8FAFF]">
        <div className="h-full">
          <RestaurantSidebar />
        </div>
        <div className="flex-1 overflow-auto relative">
          <Suspense fallback={<div className="h-[100px] bg-white border-b border-[#F1F5F9]" />}>
            <DashboardHeader />
          </Suspense>
          <RestaurantDayLifecycleOverlay />
          <RestaurantDayRouteGuard>
            <div className="pt-4 px-6 pb-6 w-full">
                {children}
            </div>
          </RestaurantDayRouteGuard>
          <ToastContainer />
        </div>
      </div>
    </RestaurantDayLifecycleProvider>
  );
}
