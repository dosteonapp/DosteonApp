"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { LoaderCircleIcon } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  authOnly?: boolean;
  guestOnly?: boolean;
}

export function AuthGuard({
  children,
  authOnly = false,
  guestOnly = false,
}: AuthGuardProps) {
  const { user, fetchingUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (fetchingUser) return;

    // Auth-only route with no user - redirect to login
    if (authOnly && !user) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/signin?returnUrl=${returnUrl}`);
      return;
    }

    // Auth-only route with user - check onboarding status
    if (authOnly && user) {
      if (!user.onboardingCompleted && !user.onboardingSkipped) {
        router.push("/onboarding");
        return;
      }
      // User is onboarded, continue to the requested page (no redirect needed)
      return;
    }

    // Guest-only route with user - check onboarding and redirect appropriately
    if (guestOnly && user) {
      if (!user.onboardingCompleted && !user.onboardingSkipped) {
        router.push("/onboarding");
        return;
      }
      // User is onboarded, redirect to dashboard or return URL
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get("returnUrl");
      router.push(returnUrl ? decodeURIComponent(returnUrl) : "/dashboard");
      return;
    }
  }, [fetchingUser, user, authOnly, guestOnly, router, pathname]);

  if (fetchingUser) {
    return (
      <div className="flex items-center justify-center bg-background z-[9999999] fixed inset-0">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircleIcon className="w-8 h-8 animate-pulse" />
        </div>
      </div>
    );
  }

  // Don't render anything if user shouldn't see this route
  if ((authOnly && !user) || (guestOnly && user)) {
    return null;
  }

  return <>{children}</>;
}
