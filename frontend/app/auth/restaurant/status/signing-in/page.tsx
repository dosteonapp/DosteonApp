"use client";

import React from "react";
import { StatusScreen } from "@/components/auth/StatusScreen";
import { Loader2 } from "lucide-react";

export default function SigningInPage() {
  return (
    <StatusScreen
      role="restaurant"
      icon={
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      }
      title="Signing you in..."
      description="Please wait while we complete the authentication."
    />
  );
}
