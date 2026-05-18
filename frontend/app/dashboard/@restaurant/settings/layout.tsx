"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { MenuEditorProvider, useMenuEditor } from "@/context/MenuEditorContext";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

// Inner component so it can read the MenuEditorContext provided below
function SettingsLayoutInner({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, fetchingUser } = useUser();
  const { isEditorOpen } = useMenuEditor();

  const getActiveModule = () => {
    if (pathname.includes("/settings/personal")) return "personal";
    if (pathname.includes("/settings/business")) return "business";
    if (pathname.includes("/settings/notifications")) return "notifications";
    return "business";
  };

  const activeModule = getActiveModule();

  const moduleSettings = {
    personal: {
      title: "Personal Details",
      description: "Manage your personal account information, security credentials, and application preferences."
    },
    business: {
      title: "Business Settings",
      description: "Manage your restaurant's core details, operating schedule, workflow rules, and team management."
    },
    notifications: {
      title: "Notification Settings",
      description: "Control how and when your team receives alerts from Dosteon."
    }
  };

  const moduleInfo = moduleSettings[activeModule as keyof typeof moduleSettings] || moduleSettings.business;

  useEffect(() => {
    if (fetchingUser) return;
    if (!user) { router.replace("/dashboard"); return; }
    if (!["OWNER", "MANAGER"].includes(user.role)) router.replace("/dashboard");
  }, [user, fetchingUser, router]);

  if (fetchingUser || !user || !["OWNER", "MANAGER"].includes(user.role)) return null;

  const handleModuleChange = (value: string) => {
    if (value === "personal") router.push("/dashboard/settings/personal/profile");
    if (value === "business") router.push("/dashboard/settings/business/profile");
    if (value === "notifications") router.push("/dashboard/settings/notifications");
  };

  const isMemberDetails = pathname.includes("/settings/business/team/") && pathname.split("/").length > 5;
  const isMenuRoute = pathname.includes("/settings/business/menu");

  // Member details page bypasses all chrome
  if (isMemberDetails) return <div className="mt-2">{children}</div>;

  // Hide the chrome header section when the menu editor is open (not the grid)
  const hideChrome = isMenuRoute && isEditorOpen;

  return (
    <div className="flex flex-col gap-10 max-w-[1700px] mx-auto w-full pb-20 transition-all duration-500">
      <div className={cn("space-y-8 group", hideChrome && "hidden")}>
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="text-[28px] md:text-3xl lg:text-4xl font-black tracking-tight text-[#1E293B] group-hover:text-[#3B59DA] transition-colors duration-500">
            {moduleInfo.title}
          </h1>
          <p className="text-slate-400 font-medium text-[13px] md:text-[15px] lg:text-[17px] leading-relaxed max-w-2xl sm:border-l-4 sm:border-indigo-50 sm:pl-6 group-hover:border-indigo-100 transition-all">
            {moduleInfo.description}
          </p>
        </div>

        <Tabs value={activeModule} onValueChange={handleModuleChange} className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-xl flex flex-wrap h-auto gap-1 w-full sm:w-fit">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-white data-[state=active]:text-[#3B59DA] data-[state=active]:shadow-sm rounded-lg px-4 md:px-8 py-2 md:py-3.5 text-slate-500 font-bold text-xs md:text-sm transition-all flex-1 sm:flex-none"
            >
              Personal
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="data-[state=active]:bg-white data-[state=active]:text-[#3B59DA] data-[state=active]:shadow-md rounded-lg px-4 md:px-8 py-2 md:py-3.5 text-slate-500 font-bold text-xs md:text-sm transition-all flex-1 sm:flex-none"
            >
              Business
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-white data-[state=active]:text-[#3B59DA] data-[state=active]:shadow-md rounded-lg px-4 md:px-8 py-2 md:py-3.5 text-slate-500 font-bold text-xs md:text-sm transition-all flex-1 sm:flex-none"
            >
              Notifications
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-700", hideChrome && "mt-0")}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <MenuEditorProvider>
      <SettingsLayoutInner>{children}</SettingsLayoutInner>
    </MenuEditorProvider>
  );
}
