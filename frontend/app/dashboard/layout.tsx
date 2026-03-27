"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import RoleProvider from "@/components/templates/RoleProvider";
import { useUser } from "@/context/UserContext";
import { bypassAuth } from "@/lib/flags";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const DashboardLayout: React.FC<{
  onboarding: React.ReactNode;
  restaurant: React.ReactNode;
  supplier: React.ReactNode;
}> = ({ onboarding, restaurant, supplier }) => {
  const { user, fetchingUser } = useUser();
  const router = useRouter();

  // Enforce onboarding gate for restaurant-side dashboard in non-bypass mode.
  useEffect(() => {
    if (bypassAuth) return;
    if (fetchingUser) return;
    if (!user) return; // AuthGuard handles unauthenticated redirects

    const isSupplier = user.role === "SUPPLIER";
    if (!isSupplier && user.onboardingCompleted !== true) {
      router.replace("/onboarding");
    }
  }, [user, fetchingUser, router]);

  return (
    <>
      <AuthGuard requireAuth={true} redirectTo="/auth/restaurant/signin">
        <RoleProvider
          onboarding={onboarding}
          restaurant={restaurant}
          supplier={supplier}
        />
      </AuthGuard>
    </>
  );
};

export default DashboardLayout;
