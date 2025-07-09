"use client";

import { useUser } from "@/context/UserContext";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface AppGuardProps {
  children: React.ReactNode;
}

export function AppGuard({ children }: AppGuardProps) {
  const { fetchingUser } = useUser();

  // Show loading while fetching user data
  if (fetchingUser) {
    return <LoadingScreen message="Loading..." />;
  }

  // UserContext handles all the routing logic
  return <>{children}</>;
}
