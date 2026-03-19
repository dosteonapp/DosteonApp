"use client";
import { useUser } from "@/context/UserContext";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const RoleProvider = ({
  onboarding,
  restaurant,
  supplier,
}: {
  onboarding: React.ReactNode;
  restaurant: React.ReactNode;
  supplier: React.ReactNode;
}) => {
  const { user, fetchingUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If we've finished checking for a user and NONE is found, redirect immediately
    if (!fetchingUser && !user) {
        router.push("/");
    }
  }, [user, fetchingUser, router]);

  if (fetchingUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4F46E5] border-t-transparent" />
          <p className="font-bold text-slate-400 animate-pulse">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  const getRouteByUserStatus = () => {
    if (!user) {
        // While redirecting above, we show nothing to prevent a flicker
        return null;
    }

    const isRestaurantSide = ["OWNER", "MANAGER", "CHEF", "STAFF"].includes(user?.role || "");
    const isSupplierSide = user?.role === "SUPPLIER";

    if (isRestaurantSide) {
      // If the user hasn't set up an organization yet, show the onboarding flow
      if (!user.organization_id && !user.onboardingSkipped) {
        return onboarding;
      }
      return restaurant;
    } else if (isSupplierSide) {
      // Suppliers might have their own onboarding later, but for now redirect
      if (!user.organization_id && !user.onboardingSkipped) {
        return onboarding;
      }
      return supplier;
    } else {
      return <div className="p-20 text-center font-black text-slate-400">Unauthorized: Invalid Role</div>;
    }
  };


  return <>{getRouteByUserStatus()}</>;
};

export default RoleProvider;
