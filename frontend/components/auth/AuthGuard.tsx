"use client";
import { useUser } from "@/context/UserContext";
import { LoadingScreen } from "../ui/loading-screen";
import { bypassAuth } from "@/lib/flags";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    if (fetchingUser) return;

    if (requireAuth && !user) {
      router.replace(redirectTo || "/auth/restaurant/signin");
    }

    if (!requireAuth && user) {
      router.replace(redirectTo || "/dashboard");
    }
  }, [user, fetchingUser, requireAuth, redirectTo, router]);

  if (bypassAuth) {
    return <>{children}</>;
  }

  // Show loading while fetching user OR while a redirect is about to happen
  if (fetchingUser) {
    return <LoadingScreen />;
  }

  // About to redirect — show loading instead of flashing the wrong page
  if (requireAuth && !user) {
    return <LoadingScreen />;
  }

  if (!requireAuth && user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}