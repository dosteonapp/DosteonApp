"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Building2, 
  Edit2,
  Check,
  Bell,
  User,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MemberDetailsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("role");

  const permissions = [
    { id: "orders", label: "Create and Update Orders", checked: true },
    { id: "messaging", label: "Moderate Messaging with Suppliers", checked: true },
    { id: "inventory", label: "Manage Inventory (Add, Update, View)", checked: true },
    { id: "finance", label: "Access to Financial Reports", checked: false },
    { id: "supplier", label: "Access Supplier Directory", checked: true },
    { id: "user-mgmt", label: "User Management", checked: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 font-bold p-0 bg-transparent hover:bg-transparent -ml-2"
        onClick={() => router.push("/dashboard/settings/business/team")}
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        Back to Team Management
      </Button>

      {/* Profile Header Card */}
      <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-10">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 rounded-full border-4 border-slate-50 shadow-sm ring-1 ring-slate-100/50">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-slate-100 font-black text-[#3B59DA] text-2xl">LM</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Luca Modric</h2>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-indigo-50 border border-indigo-100 text-[#3B59DA] font-bold text-[11px]">
                  <Building2 className="h-3 w-3" />
                  Procurement Officer
                </div>
                <p className="text-xs text-slate-400 font-bold ml-1">Last active 2 hours ago</p>
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-slate-100 mx-4" />

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-bold text-slate-400 w-28 uppercase tracking-widest">Email Address:</span>
                <span className="text-[15px] font-bold text-slate-800 tracking-tight">luca@email.com</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-bold text-slate-400 w-28 uppercase tracking-widest">Phone Number:</span>
                <span className="text-[15px] font-bold text-slate-800 tracking-tight">+250 781 234 832</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl w-fit border border-slate-100/50 shadow-sm">
          <Button
            variant="ghost"
            className={cn(
              "h-10 px-8 rounded-xl font-bold text-sm transition-all",
              activeTab === "role" 
                ? "bg-white text-[#3B59DA] shadow-sm ring-1 ring-slate-200/20" 
                : "text-slate-400 hover:text-slate-600 hover:bg-white"
            )}
            onClick={() => setActiveTab("role")}
          >
            Role & Permissions
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "h-10 px-8 rounded-xl font-bold text-sm transition-all",
              activeTab === "activity" 
                ? "bg-white text-[#3B59DA] shadow-sm ring-1 ring-slate-200/20" 
                : "text-slate-400 hover:text-slate-600 hover:bg-white"
            )}
            onClick={() => setActiveTab("activity")}
          >
            Activity Log
          </Button>
        </div>

        {activeTab === "role" ? (
          <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden">
            <CardContent className="p-10 space-y-10">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Role</h3>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-indigo-100 text-[#3B59DA] font-bold text-xs bg-indigo-50/30">
                  <Building2 className="h-4 w-4" />
                  Procurement Officer
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Permissions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-4 group cursor-pointer border border-transparent hover:bg-slate-50/50 p-2 rounded-xl transition-all -ml-2">
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all p-0.5",
                        perm.checked 
                          ? "bg-[#3B59DA] border-[#3B59DA] shadow-sm shadow-indigo-100" 
                          : "bg-white border-slate-200 group-hover:border-slate-300"
                      )}>
                        {perm.checked && <Check className="h-4 w-4 text-white stroke-[3px]" />}
                      </div>
                      <span className={cn(
                        "text-[15px] font-bold tracking-tight transition-colors",
                        perm.checked ? "text-slate-700" : "text-slate-300"
                      )}>
                        {perm.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  variant="outline" 
                  className="h-14 px-8 rounded-2xl border-slate-200 text-slate-700 font-black text-sm bg-white hover:bg-slate-50 gap-3 shadow-sm hover:border-slate-300 transition-all active:scale-95"
                >
                  <Edit2 className="h-4 w-4" />
                  Change Role
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
            <CardContent className="p-10 space-y-10">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Activity</h3>
                <p className="text-sm text-slate-400 font-medium">Track team member actions and role changes</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                {[
                  {
                    id: 1,
                    icon: <User className="h-4 w-4 text-indigo-500" />,
                    title: "Role Updated",
                    description: "You changed Sarah Johnson's role from Kitchen Staff to Procurement Officer",
                    time: "2 hours ago",
                    by: "@you"
                  },
                  {
                    id: 2,
                    icon: <UserPlus className="h-4 w-4 text-indigo-500" />,
                    title: "Member Removed",
                    description: "You removed inactive member: former@bistrobella.com",
                    time: "2 hours ago",
                    by: "@you"
                  },
                  {
                    id: 3,
                    icon: <User className="h-4 w-4 text-indigo-500" />,
                    title: "Login History",
                    description: "You logged in at 10:42 AM from Android",
                    time: "2 hours ago",
                    by: "@you"
                  }
                ].map((item) => (
                  <div key={item.id} className="p-8 rounded-[24px] border border-slate-100 flex flex-col gap-4 relative group hover:bg-slate-50/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-[15px] text-slate-800">{item.title}</h4>
                          <p className="text-[15px] font-medium text-slate-500 leading-relaxed">{item.description}</p>
                          <p className="text-sm text-slate-400 font-bold tracking-tight mt-1">by <span className="text-slate-900">{item.by}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300">{item.time}</span>
                        <Bell className="h-3 w-3 text-slate-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="pb-20" />
    </div>
  );
}
