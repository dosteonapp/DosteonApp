"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PersonalSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings/personal/profile");
  }, [router]);

  return null;
}
