"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import RoleProvider from "@/components/templates/RoleProvider";
import { useUser } from "@/context/UserContext";
import { bypassAuth } from "@/lib/flags";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const DashboardLayout: React.FC<{
  onboarding: React.ReactNode;
  restaurant: React.ReactNode;
  supplier: React.ReactNode;
}> = ({ onboarding, restaurant, supplier }) => {
  const { user, fetchingUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Defense-in-depth: if an authenticated user somehow reaches /dashboard
  // without having completed onboarding (e.g. abandoned mid-flow and signed
  // in again later), redirect them back to /onboarding.
  // Primary enforcement is in AuthContext.login + auth/callback, but this
  // catches any edge case where those gates were bypassed.
  useEffect(() => {
    if (bypassAuth) return;
    if (fetchingUser) return;
    if (!user) return; // AuthGuard handles unauthenticated redirects
    if (user.onboardingCompleted === false) {
      router.replace("/onboarding");
    }
  }, [user, fetchingUser, router]);

  // Inject workspace slug into bare /dashboard/* URLs so the browser always
  // shows /{slug}/dashboard/... The rewrite in next.config.mjs serves the
  // same /dashboard/* file tree from either URL form.
  useEffect(() => {
    if (bypassAuth) return;
    if (fetchingUser) return;
    if (!user?.workspace_slug) return;
    if (pathname.startsWith('/dashboard')) {
      router.replace(`/${user.workspace_slug}${pathname}`);
    }
  }, [user?.workspace_slug, fetchingUser, pathname, router]);

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
