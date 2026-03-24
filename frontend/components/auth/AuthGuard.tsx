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
    if (bypassAuth) return;

    if (fetchingUser) return;

    if (!requireAuth && user) {
      router.replace(redirectTo || "/dashboard");
    }
  }, [user, fetchingUser, requireAuth, redirectTo, router]);

  // For protected routes, avoid redirecting to signin until we've
  // double-checked the Supabase session to prevent a bounce right
  // after a successful login when the user profile hasn't loaded yet.
  useEffect(() => {
    if (bypassAuth) return;

    if (!requireAuth) return;
    if (fetchingUser) return;
    if (user) return;

    let cancelled = false;

    const verifySessionAndRedirect = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        if (!supabase) {
          throw new Error("No Supabase client");
        }

        const { data: { session } } = await supabase.auth.getSession();

        // If there's still no session, then this is a true
        // unauthenticated state — safe to redirect.
        if (!session && !cancelled) {
          router.replace(redirectTo || "/auth/restaurant/signin");
        }
      } catch {
        if (!cancelled) {
          router.replace(redirectTo || "/auth/restaurant/signin");
        }
      }
    };

    void verifySessionAndRedirect();

    return () => {
      cancelled = true;
    };
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