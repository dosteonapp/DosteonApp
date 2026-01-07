"use client";

import React from "react";
import { StatusScreen } from "@/components/auth/StatusScreen";
import { CheckCircle2 } from "lucide-react";

export default function EmailVerifiedPage() {
  return (
    <StatusScreen
      role="supplier"
      icon={
        <div className="relative">
          <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
        </div>
      }
      title="Email Verification Complete!"
      description="Your email has been verified successfully."
      buttonText="Continue to your dashboard"
      buttonHref="/dashboard"
    />
  );
}
