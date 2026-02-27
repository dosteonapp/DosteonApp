"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BusinessSettingsLayoutProps {
  children: React.ReactNode;
}

export default function BusinessSettingsLayout({ children }: BusinessSettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { name: "Restaurant Profile", href: "/dashboard/settings/business/profile" },
    { name: "Team Management", href: "/dashboard/settings/business/team" },
  ];

  const isMemberDetails = pathname.includes("/settings/business/team/") && pathname.split("/").length > 5;

  if (isMemberDetails) return <div>{children}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl w-fit border border-slate-100/50">
        {tabs.map((tab) => (
          <Button
            key={tab.href}
            variant="ghost"
            className={cn(
              "h-10 px-8 rounded-xl font-bold text-sm transition-all",
              pathname.includes(tab.href)
                ? "bg-white text-[#3B59DA] shadow-sm border-slate-100"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
            )}
            onClick={() => router.push(tab.href)}
          >
            {tab.name}
          </Button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
