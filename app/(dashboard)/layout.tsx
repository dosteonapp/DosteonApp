"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import RoleProvider from "@/components/templates/RoleProvider";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";
import React from "react";

const DashboardLayout: React.FC<{
  onboarding: React.ReactNode;
  restaurant: React.ReactNode;
  supplier: React.ReactNode;
}> = ({ onboarding, restaurant, supplier }) => {
  const { user } = useUser();

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
