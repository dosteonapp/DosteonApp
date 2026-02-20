import type React from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="h-full">
        <SupplierSidebar />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
