"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export interface SummaryItem {
  label: string;
  value: string | number;
  variant?: "default" | "positive" | "negative" | "neutral";
  format?: (value: string | number) => string;
}

export interface ActionConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;

  // Content
  title: string;
  description?: string;
  summaryItems?: SummaryItem[];
  itemNames?: string[]; // Item names to display in small text

  // Customization
  variant?: "default" | "destructive" | "warning";
  icon?: React.ComponentType<{ className?: string }>;
  confirmText?: string;
  cancelText?: string;

  // State
  isLoading?: boolean;
  error?: string | null;
}

const variantStyles: Record<string, string> = {
  default: "bg-[#3B59DA] hover:bg-[#2D46B2]",
  destructive: "bg-red-600 hover:bg-red-700",
  warning: "bg-amber-600 hover:bg-amber-700",
};

const textColorMap: Record<string, string> = {
  default: "text-slate-700",
  positive: "text-emerald-600 font-semibold",
  negative: "text-red-600 font-semibold",
  neutral: "text-slate-500",
};

export function ActionConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  summaryItems = [],
  itemNames = [],
  variant = "default",
  icon: Icon,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  error = null,
}: ActionConfirmationDialogProps) {
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      {/* Overlay covers entire main content area - below navbar, to right of sidebar */}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed right-0 z-[110] bg-black/80",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            // Mobile: overlay from top of content to above bottom sidebar
            "bottom-20",
            // Desktop: overlay from top of content to bottom, starting after sidebar
            "md:bottom-0 md:left-[var(--sidebar-width)]"
          )}
          style={{
            top: "86px"
          }}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[110] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "gap-4 border bg-background p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "sm:rounded-lg"
          )}
          aria-describedby={undefined}
        >
        <DialogHeader>
          <div className="flex items-start gap-3">
            {Icon && (
              <Icon className="h-6 w-6 text-slate-400 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-slate-900">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-1 text-sm text-slate-600">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Summary Section */}
        {summaryItems.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-2.5 border border-slate-200">
            {summaryItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600 font-medium">
                  {item.label}
                </span>
                <span
                  className={
                    textColorMap[item.variant || "default"] || "text-slate-900"
                  }
                >
                  {item.format
                    ? item.format(item.value)
                    : String(item.value)}
                </span>
              </div>
            ))}

            {/* Item Names in small text */}
            {itemNames.length > 0 && (
              <div className="pt-2 border-t border-slate-200 mt-2.5">
                <p className="text-xs text-slate-500">
                  Items <span className="text-slate-400">({itemNames.join(", ")})</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

          {/* Footer with Actions */}
          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="sm:flex-1"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`sm:flex-1 text-white font-semibold transition-all ${variantStyles[variant]}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </DialogFooter>

          {/* Close button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
