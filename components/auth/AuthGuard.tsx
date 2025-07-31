"use client";

import { useUser } from "@/context/UserContext";
import { LoadingScreen } from "../ui/loading-screen";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = false,
  redirectTo,
}: AuthGuardProps) {
  const { user, fetchingUser } = useUser();

  if (fetchingUser) {
    return <LoadingScreen />;
  } else {
    if (requireAuth && !user) {
      if (redirectTo) {
        window.location.href = redirectTo;
      } else {
        window.location.href = "/supplier/signin";
      }
    }

    if (!requireAuth && user) {
      if (redirectTo) {
        window.location.href = redirectTo;
      } else {
        window.location.href = "/dashboard";
      }
    }
  }

  return <>{children}</>;
}
