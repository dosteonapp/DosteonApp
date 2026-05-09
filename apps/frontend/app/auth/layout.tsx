"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { usePathname } from "next/navigation";
import { SigninFooter } from "@/components/auth/SigninFooter";

const AuthLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const pathname = usePathname();
  const role = pathname?.includes("/supplier") ? "supplier" : "restaurant";

  return (
    <AuthGuard requireAuth={false}>
      <main className="flex bg-[#F7F7F7] flex-col min-h-screen overflow-auto">
        {children}
        <SigninFooter role={role} />
      </main>
    </AuthGuard>
  );
};



export default AuthLayout;
