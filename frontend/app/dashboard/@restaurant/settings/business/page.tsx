"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BusinessSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings/business/profile");
  }, [router]);

  return null;
}
