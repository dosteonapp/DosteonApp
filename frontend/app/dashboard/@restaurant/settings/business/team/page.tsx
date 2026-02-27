"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  User, 
  Building2, 
  UtensilsCrossed,
  Search,
  X,
  Check,
  Mail,
  Loader2,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const teamMembers = [
  // ... (keep teamMembers as is)
  {
    id: 1,
    name: "John Smith",
    email: "john@business.com",
    role: "Business Owner/Manager",
    roleIcon: <User className="h-3 w-3" />,
    roleColor: "bg-indigo-50 text-indigo-700",
    status: "Active",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Luca Modric",
    email: "john@business.com",
    role: "Procurement Officer",
    roleIcon: <Building2 className="h-3 w-3" />,
    roleColor: "bg-purple-50 text-purple-700",
    status: "Active",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg",
  },
  {
    id: 3,
    name: "John Smith",
    email: "john@business.com",
    role: "Kitchen Staff",
    roleIcon: <UtensilsCrossed className="h-3 w-3" />,
    roleColor: "bg-amber-50 text-amber-700",
    status: "Active",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg",
  },
];

const roles = [
  { id: "owner", name: "Business Owner/Manager", icon: <User className="h-4 w-4" /> },
  { id: "procurement", name: "Procurement Officer", icon: <Building2 className="h-4 w-4" /> },
  { id: "kitchen", name: "Kitchen Staff", icon: <UtensilsCrossed className="h-4 w-4" /> },
];

export default function TeamManagementPage() {
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteStep, setInviteStep] = React.useState<"form" | "sending" | "success">("form");

  const handleInvite = () => {
    setInviteStep("sending");
    // Simulate API call
    setTimeout(() => {
      setInviteStep("success");
    }, 1500);
  };

  const resetInvite = () => {
    setIsInviteOpen(false);
    setTimeout(() => setInviteStep("form"), 500);
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden">
        <CardContent className="p-10 space-y-10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Team Management</h2>
                <p className="text-sm text-slate-400 font-medium">Manage your restaurant staff, their roles, and system access.</p>
            </div>
            
            <Dialog open={isInviteOpen} onOpenChange={(open) => {
              if (!open) resetInvite();
              setIsInviteOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button className="h-12 px-8 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-bold rounded-xl gap-3 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                    <UserPlus className="h-5 w-5" />
                    Invite member
                </Button>
              </DialogTrigger>
              <DialogContent className={cn(
                "p-0 overflow-hidden border-none rounded-[32px] gap-0 outline-none",
                inviteStep === "success" ? "sm:max-w-[500px]" : "sm:max-w-[650px]"
              )}>
                {inviteStep === "form" || inviteStep === "sending" ? (
                  <>
                    <div className="p-10 space-y-2 relative">
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Invite Team Member</h2>
                      <p className="text-[15px] text-slate-400 font-medium">Add a new member to your team and define their access level.</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={resetInvite}
                        className="absolute right-8 top-10 h-10 w-10 text-slate-300 hover:text-slate-900 rounded-full"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                    
                    <div className="p-10 border-t border-slate-100 space-y-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-slate-500">Full Name</Label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                            <Input 
                              placeholder="e.g. Hilmi Yusuf"
                              className="h-14 pl-12 rounded-2xl border-slate-200 focus:ring-indigo-500 font-medium text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-slate-500">Email Address</Label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                            <Input 
                              type="email"
                              placeholder="e.g. hilmi@example.com"
                              className="h-14 pl-12 rounded-2xl border-slate-200 focus:ring-indigo-500 font-medium text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-slate-500">Assign Role</Label>
                          <Select defaultValue="owner">
                            <SelectTrigger className="h-14 rounded-2xl border-slate-200 focus:ring-indigo-500 font-bold text-slate-800 px-5">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-2">
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id} className="rounded-xl h-11 px-4 font-bold text-slate-700 focus:bg-slate-50 focus:text-[#3B59DA]">
                                  <div className="flex items-center gap-3">
                                    {role.icon}
                                    {role.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="p-10 bg-slate-50/50 flex items-center justify-end gap-4 border-t border-slate-100">
                      <Button 
                        variant="ghost" 
                        onClick={resetInvite}
                        className="h-14 px-8 rounded-2xl text-slate-500 font-bold hover:bg-white hover:text-slate-800 transition-all"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleInvite}
                        disabled={inviteStep === "sending"}
                        className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all min-w-[200px]"
                      >
                        {inviteStep === "sending" ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Invitation"
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-16 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-300">
                    <div className="relative h-24 w-24 flex items-center justify-center">
                      <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse opacity-50" />
                      <div className="absolute inset-2 bg-emerald-200/50 rounded-full animate-ping" />
                      <div className="relative h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 border-4 border-white">
                        <Check className="h-10 w-10 text-white stroke-[4px]" />
                      </div>
                    </div>
                    
                    <div className="space-y-4 px-4">
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Invitation Sent!</h2>
                      <p className="text-[17px] text-slate-500 font-medium leading-relaxed">
                        We've sent an email invitation to the new member. <br />
                        They can join your team by clicking the link in the email.
                      </p>
                    </div>

                    <Button 
                      onClick={resetInvite}
                      className="h-14 px-16 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all mt-4 w-full"
                    >
                      Done
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="py-5 px-10 font-black text-slate-400 text-[11px] uppercase tracking-wider">Member</TableHead>
                  <TableHead className="py-5 font-black text-slate-400 text-[11px] uppercase tracking-wider">Role</TableHead>
                  <TableHead className="py-5 font-black text-slate-400 text-[11px] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="py-5 font-black text-slate-400 text-[11px] uppercase tracking-wider">Last Active</TableHead>
                  <TableHead className="py-5 px-10 font-black text-slate-400 text-[11px] uppercase tracking-wider text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                    <TableCell className="py-6 px-10">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 rounded-xl border-2 border-slate-50 group-hover:border-white transition-all">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-slate-100 text-[#3B59DA] font-bold text-xs uppercase">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-800 text-[15px] group-hover:text-slate-900 transition-colors">{member.name}</p>
                          <p className="text-xs text-slate-400 font-medium tracking-tight">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 font-bold text-slate-600 text-[13px]">
                      <div className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-bold text-[11px] whitespace-nowrap shadow-sm", member.roleColor)}>
                          {member.roleIcon}
                          {member.role}
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[13px] font-bold text-emerald-600">{member.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-slate-400 text-[13px] font-bold">
                        {member.lastActive}
                    </TableCell>
                    <TableCell className="py-6 px-10 text-right">
                      <Button 
                        variant="outline" 
                        className="h-10 px-6 rounded-xl border-slate-200 text-slate-500 font-bold text-xs bg-white hover:bg-slate-50 hover:text-[#3B59DA] hover:border-[#3B59DA] transition-all active:scale-95 shadow-sm"
                        onClick={() => router.push(`/dashboard/settings/business/team/${member.id}`)}
                      >
                          View Member
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="pb-20"></div>
    </div>
  );
}

