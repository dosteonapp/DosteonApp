"use client";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";
import React from "react";

const DashboardLayout: React.FC<{
  onboarding: React.ReactNode;
  restaurant: React.ReactNode;
  supplier: React.ReactNode;
}> = ({ onboarding, restaurant, supplier }) => {
  const { user } = useUser();

  if (!user) {
    return redirect("/auth/signin");
  }
  console.log("DashboardLayout user:", user);

  return (
    <div>
      {/* {children}
      {onboarding} */}
      {restaurant}
      {/* {supplier} */}
    </div>
  );
};

export default DashboardLayout;
