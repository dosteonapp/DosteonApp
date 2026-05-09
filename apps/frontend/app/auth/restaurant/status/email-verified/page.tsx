"use client";

import React from "react";
import { StatusScreen } from "@/components/auth/StatusScreen";
import { CheckCircle2 } from "lucide-react";
import { useLogout } from "@/hooks/auth";

export default function EmailVerifiedPage() {
  const { logout } = useLogout();

  const handleContinue = async () => {
    // End the temporary Supabase session from the verification flow
    // and send the user to the restaurant signin page.
    await logout("/auth/restaurant/signin");
  };

  return (
    <StatusScreen
      role="restaurant"
      icon={
        <div className="relative">
          <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
        </div>
      }
      title="Email Verification Complete!"
      description="Your email has been verified successfully."
      buttonText="Continue to sign in"
      onButtonClick={handleContinue}
    />
  );
}
