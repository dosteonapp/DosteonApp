"use client";

import React from "react";
import { StatusScreen } from "@/components/auth/StatusScreen";
import { XCircle } from "lucide-react";

export default function AuthFailedPage() {
  return (
    <StatusScreen
      role="restaurant"
      icon={
        <div className="relative">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <XCircle className="w-20 h-20 text-red-500 relative z-10" />
        </div>
      }
      title="Authentication Failed"
      description="Please try again."
      buttonText="Back to Sign In"
      buttonHref="/auth/restaurant/signin"
    />
  );
}
