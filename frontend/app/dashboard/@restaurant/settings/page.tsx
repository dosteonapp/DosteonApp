"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { isAdminRole } from "@/lib/permissions";

export default function SettingsRedirect() {
  const router = useRouter();
  const { user, fetchingUser } = useUser();

  useEffect(() => {
    if (fetchingUser) return;
    if (!isAdminRole(user?.role)) {
      router.replace("/dashboard");
      return;
    }
    router.replace("/dashboard/settings/business/profile");
  }, [router, user, fetchingUser]);

  return <div className="h-screen bg-white" />;
}
