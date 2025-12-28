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
  const { user } = useUser();

  const getRouteByUserStatus = () => {
    if (!user) {
      return <div>Unauthorized</div>;
    }
    // if (!user?.onboardingCompleted && !user?.onboardingSkipped) {
    //   return onboarding;
    // }

    if (user?.role === "restaurant") {
      return restaurant;
    } else if (user?.role === "supplier") {
      return supplier;
    } else {
      return <div>Unauthorized</div>;
    }
  };

  return <>{getRouteByUserStatus()}</>;
};

export default RoleProvider;
