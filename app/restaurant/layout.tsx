import type React from "react"
import { RestaurantSidebar } from "@/components/restaurant-sidebar"
import { ToastContainer } from "@/components/toast-container"

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="h-full">
        <RestaurantSidebar />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
        <ToastContainer />
      </div>
    </div>
  )
}
