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
  
  // Determine if we are on a sign-in or sign-up page (or other)
  const isSignin = pathname?.endsWith("/signin");
  const isSignup = pathname?.endsWith("/signup");

  return (
    <SigninHeader>
      {isSignin ? (
        <Link href={`/auth/${role}/signup`}>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            Sign Up as a {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        </Link>
      ) : isSignup ? (
        <Link href={`/auth/${role}/signin`}>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            Sign In
          </Button>
        </Link>
      ) : (
        // Default for status pages, forgot password, etc.
        <Link href={`/auth/${role}/signin`}>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            Back to Login
          </Button>
        </Link>
      )}
    </SigninHeader>
  );
};
