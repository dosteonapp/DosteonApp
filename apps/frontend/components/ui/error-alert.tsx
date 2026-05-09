"use client";

import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/50 bg-destructive/10 px-2.5 py-2 text-xs text-destructive",
        className
      )}
      role="alert"
    >
      {message}
    </div>
  );
}
