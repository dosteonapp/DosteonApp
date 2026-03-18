"use client";
import { useUser } from "@/context/UserContext";
import React from "react";

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
      return (
        <div className="flex h-screen w-full items-center justify-center bg-white p-10">
          <div className="max-w-md text-center space-y-6">
            <div className="h-20 w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h1 className="text-3xl font-black text-[#1E293B]">Access Restricted</h1>
            <p className="text-slate-500 font-bold leading-relaxed">
              We couldn't verify your session. Please try signing in again to access your dashboard.
            </p>
            <a href="/auth/restaurant/signin" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#4F46E5] px-8 text-sm font-black text-white shadow-lg shadow-indigo-100 hover:bg-[#4338CA] transition-all">
              Sign In
            </a>
          </div>
        </div>
      );
    }

    const isRestaurantSide = ["restaurant", "admin", "manager", "staff"].includes(user?.role || "");
    const isSupplierSide = user?.role === "supplier";

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
