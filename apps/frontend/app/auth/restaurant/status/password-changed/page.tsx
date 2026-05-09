"use client";

import React from "react";
import { StatusScreen } from "@/components/auth/StatusScreen";
import { Key } from "lucide-react";

export default function PasswordChangedPage() {
  return (
    <StatusScreen
      role="restaurant"
      icon={
        <div className="w-16 h-16 rounded-xl border border-blue-100 flex items-center justify-center">
          <Key className="w-8 h-8 text-blue-600" />
        </div>
      }
      title="Password Changed"
      description="Your password has been successfully changed. Log in with your new password."
      buttonText="Login"
      buttonHref="/auth/restaurant/signin"
    />
  );
}
