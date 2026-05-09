"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast, ToastProvider, ToastTitle, ToastDescription } from "@/components/ui/toast"

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.type as "default" | "destructive"}>
          <div>
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
        </Toast>
      ))}
    </ToastProvider>
  )
}
