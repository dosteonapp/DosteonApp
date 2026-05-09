"use client";

import { useMocks } from "@/lib/flags";
import { AlertCircle } from "lucide-react";

export function MockWarningBanner() {
  if (!useMocks || process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 text-sm font-medium">
      <AlertCircle className="h-4 w-4" />
      <span>Mock Mode Enabled: Using hardcoded dummy data for specific features.</span>
    </div>
  );
}
