"use client";

import { SigninHeader } from "./SigninHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface DynamicHeaderProps {
  role: "restaurant" | "supplier";
}

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({ role }) => {
  const pathname = usePathname();
  
  const isSignin = pathname?.endsWith("/signin");
  const isSignup = pathname?.endsWith("/signup");

  const isSupplier = role === "supplier";
  
  // Determine title based on role and path
  let title = isSupplier ? "Supplier Onboarding" : "Restaurant Authentication";
  
  if (pathname) {
    if (isSignin) {
      title = isSupplier ? "Supplier Onboarding" : "Restaurant Sign In";
    } else if (isSignup) {
      title = isSupplier ? "Supplier Onboarding" : "Restaurant Sign Up";
    } else if (pathname.includes("/forgot-password")) {
      title = isSupplier ? "Supplier Onboarding" : "Restaurant Forgot Password";
    } else if (pathname.includes("/reset-password")) {
      title = isSupplier ? "Supplier Onboarding" : "Restaurant Reset Password";
    } else if (pathname.includes("/status")) {
      title = isSupplier ? "Supplier Onboarding" : "Account Status";
    }
  }

  const buttonStyle = isSupplier 
    ? "border-[#00a13e] text-[#00a13e] hover:bg-green-50" 
    : "border-blue-600 text-blue-600 hover:bg-blue-50";

  return (
    <SigninHeader role={role} title={title}>
      {isSignin ? (
        <Link href={`/auth/${role}/signup`}>
          <Button variant="outline" className={buttonStyle}>
            Sign Up as a {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        </Link>
      ) : isSignup ? (
        <Link href={`/auth/${role}/signin`}>
          <Button variant="outline" className={buttonStyle}>
            Sign In
          </Button>
        </Link>
      ) : (
        // Default for status pages, forgot password, etc.
        <Link href={`/auth/${role}/signin`}>
          <Button variant="outline" className={buttonStyle}>
            Back to Login
          </Button>
        </Link>
      )}
    </SigninHeader>
  );
};
