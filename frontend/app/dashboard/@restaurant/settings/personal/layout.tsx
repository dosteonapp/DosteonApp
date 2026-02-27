"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PersonalSettingsLayoutProps {
  children: React.ReactNode;
}

export default function PersonalSettingsLayout({ children }: PersonalSettingsLayoutProps) {
  // We're simplifying based on the user's latest design which shows a single consolidated page for personal details
  return <div className="animate-in fade-in duration-500">{children}</div>;
}
