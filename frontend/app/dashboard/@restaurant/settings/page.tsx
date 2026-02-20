"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Menu,
  CreditCard,
  Wallet,
  Building,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  Settings,
  Edit,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const restaurantRoles = [
  {
    id: "owner",
    name: "Restaurant Owner/Manager",
    description:
      "Top-level admin responsible for overall management and decision-making (Default Role)",
    permissions: [
      "full_access",
      "user_management",
      "financial_data",
      "role_assignment",
      "create_orders",
      "view_orders",
      "update_orders",
      "approve_orders",
      "view_inventory",
      "update_inventory",
      "inventory_management",
      "stock_requests",
      "customer_chat",
      "internal_messaging",
      "notifications",
      "view_payments",
      "process_payments",
      "partial_payments",
      "basic_reports",
      "financial_reports",
      "analytics",
    ],
    color: "bg-red-100 text-red-800",
    isDefault: true,
  },
  {
    id: "procurement",
    name: "Procurement Officer",
    description: "Handles ordering and maintaining supplier relationships",
    permissions: [
      "create_orders",
      "supplier_access",
      "inventory_management",
      "partial_payments",
    ],
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "kitchen",
    name: "Kitchen Staff",
    description: "Manages daily food production and stock usage",
    permissions: [
      "view_inventory",
      "update_usage",
      "stock_requests",
      "delivery_notifications",
    ],
    color: "bg-green-100 text-green-800",
  },
  {
    id: "cashier",
    name: "Cashier/Front-of-House",
    description:
      "Handles sales transactions and updates inventory for sold items",
    permissions: [
      "sales_transactions",
      "inventory_updates",
      "receipts",
      "low_stock_alerts",
    ],
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "supervisor",
    name: "Shift Supervisor",
    description: "Oversees daily operations and monitors staff performance",
    permissions: [
      "staff_monitoring",
      "inventory_adjustments",
      "basic_reports",
      "messaging",
    ],
    color: "bg-purple-100 text-purple-800",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "John Smith",
    email: "john@bistrobella.com",
    phone: "+1 (555) 123-4567",
    role: "owner",
    status: "active",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@bistrobella.com",
    phone: "+1 (555) 234-5678",
    role: "procurement",
    status: "active",
    lastActive: "1 day ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike@bistrobella.com",
    phone: "+1 (555) 345-6789",
    role: "kitchen",
    status: "active",
    lastActive: "3 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Lisa Rodriguez",
    email: "lisa@bistrobella.com",
    phone: "+1 (555) 456-7890",
    role: "cashier",
    status: "inactive",
    lastActive: "1 week ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const permissionCategories = {
  Orders: ["create_orders", "view_orders", "update_orders", "approve_orders"],
  Inventory: [
    "view_inventory",
    "update_inventory",
    "inventory_management",
    "stock_requests",
  ],
  Messaging: ["customer_chat", "internal_messaging", "notifications"],
  Payments: [
    "view_payments",
    "process_payments",
    "financial_data",
    "partial_payments",
  ],
  Reports: ["basic_reports", "financial_reports", "analytics"],
  Administration: ["user_management", "role_assignment", "full_access"],
};

export default function SettingsPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<(typeof teamMembers[0]) | null>(null);

  const getRoleInfo = (roleId: string) => {
    return restaurantRoles.find((role) => role.id === roleId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4">

        <Tabs defaultValue="account">
          <TabsList className="bg-transparent border-b border-slate-100 w-full justify-start h-auto p-0 gap-8 mb-8 overflow-x-auto no-scrollbar">
            <TabsTrigger value="account" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B59DA] rounded-none px-0 pb-4 text-slate-400 font-bold tracking-tight text-[15px]">Account</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B59DA] rounded-none px-0 pb-4 text-slate-400 font-bold tracking-tight text-[15px]">System & Operations</TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B59DA] rounded-none px-0 pb-4 text-slate-400 font-bold tracking-tight text-[15px]">Team Management</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B59DA] rounded-none px-0 pb-4 text-slate-400 font-bold tracking-tight text-[15px]">Notifications</TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B59DA] rounded-none px-0 pb-4 text-slate-400 font-bold tracking-tight text-[15px]">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <CardTitle className="text-2xl font-bold tracking-tight font-inria italic">Restaurant Profile</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Update your restaurant's visible identity and contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="restaurant-name" className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Restaurant Brand Name</Label>
                        <Input id="restaurant-name" defaultValue="Bistro Bella" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#3B59DA] transition-all" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Primary Admin Email</Label>
                        <Input id="email" type="email" defaultValue="contact@bistrobella.com" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#3B59DA] transition-all" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Contact Number</Label>
                        <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#3B59DA] transition-all" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="address" className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Physical Location</Label>
                        <Input id="address" defaultValue="123 Main St, Anytown, CA 12345" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#3B59DA] transition-all" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 p-8 flex justify-end">
                    <Button className="h-12 px-10 bg-[#3B59DA] hover:bg-[#2F47AF] transition-all rounded-xl font-bold">Save Profile Changes</Button>
                  </CardFooter>
                </Card>

                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <CardTitle className="text-2xl font-bold tracking-tight font-inria italic">Security & Access</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Keep your administrative access secure with modern credentials</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="current-password" title="Enter current password" className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Current Authorization Key</Label>
                        <PasswordInput id="current-password" placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="new-password" title="Enter new password" className="text-[13px] font-bold uppercase tracking-widest text-slate-400">New Password</Label>
                          <PasswordInput id="new-password" placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="confirm-password" title="Confirm new password" className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Confirm Password</Label>
                          <PasswordInput id="confirm-password" placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 p-8 flex justify-end">
                    <Button variant="outline" className="h-12 px-10 border-slate-200 hover:bg-slate-100 transition-all rounded-xl font-bold">Update Credentials</Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden border-t-4 border-t-[#3B59DA]">
                  <CardHeader className="p-8">
                    <div className="h-20 w-20 rounded-2xl bg-[#3B59DA]/10 flex items-center justify-center mb-4">
                      <Avatar className="h-16 w-16 rounded-xl">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-2xl font-bold text-[#3B59DA]">BB</AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Bistro Bella</CardTitle>
                    <CardDescription className="font-medium text-indigo-600">Premium Restaurant Account</CardDescription>
                    <p className="text-sm text-slate-400 mt-2">Member since Oct 2023</p>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-4">
                    <Separator className="bg-slate-100" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Daily Transactions</span>
                      <span className="font-bold text-slate-700">128</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Active Team</span>
                      <span className="font-bold text-slate-700">12 Members</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">System Health</span>
                      <span className="font-bold text-emerald-500">Excellent</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 bg-slate-50 mt-4">
                    <Button variant="ghost" className="w-full text-destructive hover:bg-red-50 hover:text-red-600 font-bold rounded-xl h-12">
                      Request Account Deletion
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6 mt-0">
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight font-inria italic">Operating Times</CardTitle>
                    </div>
                    <CardDescription className="text-slate-500 font-medium ml-14">Configure the smart window for stock updates and report generation</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Closing Stock Window</Label>
                        <Select defaultValue="19:00">
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Select closing time" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="17:00">05:00 PM</SelectItem>
                             <SelectItem value="18:00">06:00 PM</SelectItem>
                             <SelectItem value="19:00">07:00 PM</SelectItem>
                             <SelectItem value="20:00">08:00 PM</SelectItem>
                             <SelectItem value="21:00">09:00 PM</SelectItem>
                             <SelectItem value="22:00">10:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-400 font-medium">Dashboard transitions to closing state at this hour</p>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Opening Prep Unlock</Label>
                        <Select defaultValue="08:00">
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Select opening time" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="06:00">06:00 AM</SelectItem>
                             <SelectItem value="07:00">07:00 AM</SelectItem>
                             <SelectItem value="08:00">08:00 AM</SelectItem>
                             <SelectItem value="09:00">09:00 AM</SelectItem>
                             <SelectItem value="10:00">10:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-400 font-medium">Inventory items are ready for morning verification</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="space-y-1">
                            <p className="font-bold text-indigo-900 text-sm italic font-inria">Auto-Lock System</p>
                            <p className="text-xs text-indigo-600 font-medium">Enable automatic locking after 4 hours of inactivity</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#3B59DA]" />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 p-8 flex justify-end">
                    <Button className="h-12 px-10 bg-[#3B59DA] hover:bg-[#2F47AF] transition-all rounded-xl font-bold shadow-lg shadow-[#3B59DA]/20">Update Operations</Button>
                  </CardFooter>
                </Card>

                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-indigo-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight font-inria italic">Smart System Integrity</CardTitle>
                    </div>
                    <CardDescription className="text-slate-500 font-medium ml-14">Configure automated guardrails and intelligent system behavior</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all cursor-default group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield className="h-5 w-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">Anti-Theft Variance Alert</p>
                                    <p className="text-xs text-slate-400 font-medium">Alert if stock count varies more than 5% from POS</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all cursor-default group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Building className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">Multi-Store Synchronization</p>
                                    <p className="text-xs text-slate-400 font-medium">Sync inventory across primary and backup storage</p>
                                </div>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all cursor-default group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Edit className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">AI Stock Prediction</p>
                                    <p className="text-xs text-slate-400 font-medium">Suggest quantities based on weekly consumption trends</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 p-8 flex justify-end">
                    <Button variant="outline" className="h-12 px-10 border-slate-200 hover:bg-slate-100 transition-all rounded-xl font-bold">Manage Integrations</Button>
                  </CardFooter>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6 mt-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight font-inria italic text-[#1E293B]">
                  Team Management
                </h2>
                <p className="text-slate-500 font-medium">
                  Construct your high-performance restaurant team and define smart access permissions
                </p>
              </div>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#3B59DA] hover:bg-[#2F47AF] h-12 px-8 rounded-xl font-bold shadow-lg shadow-[#3B59DA]/20 shrink-0">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Invite Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[32px] p-0 overflow-hidden border-none max-w-md">
                  <DialogHeader className="bg-[#3B59DA] text-white p-8 pb-10">
                    <DialogTitle className="text-2xl font-bold font-inria italic">Invite Member</DialogTitle>
                    <DialogDescription className="text-indigo-100 font-medium">
                      Grant new access keys to your restaurant dashboard
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 space-y-6 -mt-6 bg-white rounded-t-[32px]">
                    <div className="space-y-3">
                      <Label htmlFor="invite-email" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Electronic Mail Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="invite-role" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Primary Assignment</Label>
                      <Select defaultValue="owner">
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurantRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name} {role.isDefault && "(Default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      onClick={() => setIsInviteOpen(false)}
                      className="font-bold text-slate-500"
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsInviteOpen(false)} className="bg-[#3B59DA] hover:bg-[#2F47AF] font-bold rounded-xl px-8 h-12 shadow-md">
                      Dispatch Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="members" className="space-y-6">
              <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl w-fit h-auto inline-flex gap-1">
                <TabsTrigger value="members" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-sm text-slate-500 data-[state=active]:text-[#3B59DA]">Team Members</TabsTrigger>
                <TabsTrigger value="roles" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-sm text-slate-500 data-[state=active]:text-[#3B59DA]">Role Architecture</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-sm text-slate-500 data-[state=active]:text-[#3B59DA]">Audit Log</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-6 mt-0">
                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/80">
                        <TableRow className="border-b border-slate-100 hover:bg-transparent">
                          <TableHead className="font-bold text-slate-400 py-6 px-8 text-[11px] uppercase tracking-widest">Digital Identity</TableHead>
                          <TableHead className="font-bold text-slate-400 py-6 text-[11px] uppercase tracking-widest">Assignment</TableHead>
                          <TableHead className="font-bold text-slate-400 py-6 text-[11px] uppercase tracking-widest">Presence</TableHead>
                          <TableHead className="font-bold text-slate-400 py-6 text-[11px] uppercase tracking-widest">Last Synced</TableHead>
                          <TableHead className="text-right py-6 px-8 font-bold text-slate-400 text-[11px] uppercase tracking-widest">Tools</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member) => {
                          const roleInfo = getRoleInfo(member.role);
                          return (
                            <TableRow key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <TableCell className="py-6 px-8">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-12 w-12 rounded-xl ring-2 ring-slate-100 ring-offset-2">
                                    <AvatarImage
                                      src={member.avatar || "/placeholder.svg"}
                                    />
                                    <AvatarFallback className="bg-[#3B59DA] text-white">
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-bold text-slate-700">
                                      {member.name}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-6">
                                <Badge className={cn("rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase shadow-sm border-none", roleInfo?.color || "bg-slate-100 text-slate-600")}>
                                  {roleInfo?.name}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-6">
                                <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-tight">
                                    <div className={cn("w-2 h-2 rounded-full", member.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300')} />
                                    <span className={member.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}>{member.status}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 text-slate-400 text-sm font-medium">
                                {member.lastActive}
                              </TableCell>
                              <TableCell className="text-right py-6 px-8">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100">
                                      <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[180px]">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedMember(member);
                                        setIsRoleModalOpen(true);
                                      }}
                                      className="rounded-xl flex items-center p-3 font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 transition-all"
                                    >
                                      <Edit className="mr-3 h-4 w-4" />
                                      Adjust Scope
                                    </DropdownMenuItem>
                                    <Separator className="my-1 bg-slate-50" />
                                    <DropdownMenuItem className="rounded-xl flex items-center p-3 font-bold text-red-500 focus:bg-red-50 focus:text-red-600 transition-all">
                                      <Trash2 className="mr-3 h-4 w-4" />
                                      Terminate Access
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roles" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {restaurantRoles.map((role) => (
                    <Card key={role.id} className="border-slate-100 shadow-sm rounded-3xl overflow-hidden hover:border-[#3B59DA]/30 transition-all">
                      <CardHeader className="p-8 pb-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                       <Shield className="h-5 w-5 text-[#3B59DA]" />
                                    </div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-slate-800">
                                        {role.name}
                                    </CardTitle>
                                </div>
                                <CardDescription className="font-medium text-slate-500">
                                    {role.description}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge className={cn("rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase border-none", role.color)}>
                                    {teamMembers.filter((m) => m.role === role.id).length} Active
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-8 text-[#3B59DA] font-bold text-xs hover:bg-indigo-50 p-0 px-2 lg:px-4">Configure</Button>
                            </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 pt-0">
                        <div className="space-y-4">
                           <Separator className="bg-slate-50" />
                           <div className="flex flex-wrap gap-2">
                               {role.permissions.slice(0, 5).map(p => (
                                   <Badge key={p} variant="secondary" className="bg-slate-50 text-slate-400 border-none font-bold text-[9px] uppercase tracking-tighter">
                                       {p.replace(/_/g, ' ')}
                                   </Badge>
                               ))}
                               {role.permissions.length > 5 && (
                                   <Badge variant="secondary" className="bg-indigo-50 text-indigo-500 border-none font-bold text-[9px] uppercase tracking-tighter">
                                       +{role.permissions.length - 5} More
                                   </Badge>
                               )}
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                   <Card className="border-dashed border-2 border-slate-200 shadow-none rounded-3xl flex flex-col items-center justify-center p-8 bg-slate-50/20 hover:bg-slate-50 hover:border-[#3B59DA]/50 transition-all cursor-pointer group">
                        <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <UserPlus className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-400">Architect New Role</p>
                        <p className="text-xs text-slate-300 font-medium mt-1">Define custom scope and permissions</p>
                   </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-0">
                <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {[
                        {
                          action: "Administrative Key Rotated",
                          user: "John Smith",
                          details: "Refreshed primary access keys and verified multi-store sync protocol",
                          time: "2 hours ago",
                          type: "security"
                        },
                        {
                          action: "Architecture Scope Mutation",
                          user: "John Smith",
                          details: "Extended Kitchen Staff scope to include automated stock tracking modules",
                          time: "1 day ago",
                          type: "config"
                        },
                        {
                          action: "Intelligent Guardrail Trigger",
                          user: "System AI",
                          details: "Automatically adjusted low stock thresholds based on weekend surge patterns",
                          time: "3 days ago",
                          type: "smart"
                        }
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="group relative flex items-start gap-6 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all"
                        >
                          <div className={cn("mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", 
                            activity.type === 'security' ? 'bg-red-50 text-red-500' : 
                            activity.type === 'smart' ? 'bg-teal-50 text-teal-500' : 'bg-blue-50 text-blue-500'
                          )}>
                             <Shield className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700 tracking-tight">
                                {activity.action}
                              </span>
                              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                                {activity.time}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">
                              {activity.details}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-[8px] bg-slate-100 font-bold">JS</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">Triggered by {activity.user}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Role Assignment Modal */}
            <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Role</DialogTitle>
                  <DialogDescription>
                    Update the role for {selectedMember?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Role</Label>
                    <div className="p-2 bg-muted rounded">
                      {selectedMember && getRoleInfo(selectedMember.role)?.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new role" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurantRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsRoleModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsRoleModalOpen(false)}>
                    Update Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-orders">Order Updates</Label>
                      <Switch id="email-orders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-inventory">Inventory Alerts</Label>
                      <Switch id="email-inventory" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-promotions">
                        Promotions and News
                      </Label>
                      <Switch id="email-promotions" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    SMS/WhatsApp Notifications
                  </h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-orders">Order Updates</Label>
                      <Switch id="sms-orders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-inventory">Inventory Alerts</Label>
                      <Switch id="sms-inventory" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-promotions">
                        Promotions and News
                      </Label>
                      <Switch id="sms-promotions" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Settings</CardTitle>
                <CardDescription>
                  Configure your inventory preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="low-stock-threshold">
                    Low Stock Alert Threshold (%)
                  </Label>
                  <Input
                    id="low-stock-threshold"
                    type="number"
                    defaultValue="20"
                  />
                  <p className="text-sm text-muted-foreground">
                    Items will be marked as low stock when they fall below this
                    percentage of their minimum level
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="critical-stock-threshold">
                    Critical Stock Alert Threshold (%)
                  </Label>
                  <Input
                    id="critical-stock-threshold"
                    type="number"
                    defaultValue="10"
                  />
                  <p className="text-sm text-muted-foreground">
                    Items will be marked as critical when they fall below this
                    percentage of their minimum level
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-unit">Default Unit</Label>
                  <Select defaultValue="kg">
                    <SelectTrigger id="default-unit">
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="g">Gram (g)</SelectItem>
                      <SelectItem value="l">Liter (l)</SelectItem>
                      <SelectItem value="ml">Milliliter (ml)</SelectItem>
                      <SelectItem value="unit">Unit (each)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
                <CardDescription>
                  Manage your payment methods for invoices and transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Default Payment Method
                  </h3>
                  <Separator />
                  <RadioGroup defaultValue="bank-transfer">
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem
                        value="bank-transfer"
                        id="bank-transfer"
                      />
                      <Label
                        htmlFor="bank-transfer"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Bank Transfer</p>
                            <p className="text-sm text-muted-foreground">
                              Pay directly from your bank account
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label
                        htmlFor="credit-card"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-sm text-muted-foreground">
                              Pay with Visa, Mastercard, or other cards
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="mobile-money" id="mobile-money" />
                      <Label
                        htmlFor="mobile-money"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Mobile Money</p>
                            <p className="text-sm text-muted-foreground">
                              Pay using MTN Mobile Money or Airtel Money
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Saved Payment Methods</h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-muted-foreground">
                            Expires 12/2025
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Default</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Bank of Kigali</p>
                          <p className="text-sm text-muted-foreground">
                            Account ending in 7890
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">Add New Payment Method</Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Preferences</h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-pay">
                        Automatic Payments for Recurring Invoices
                      </Label>
                      <Switch id="auto-pay" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="payment-reminders">
                        Payment Reminders
                      </Label>
                      <Switch id="payment-reminders" defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminder-days">
                        Reminder Days Before Due Date
                      </Label>
                      <Select defaultValue="3">
                        <SelectTrigger id="reminder-days">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Payment Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your billing details and subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Current Plan</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Professional Plan</span>
                    <Badge>Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    $49.99/month, billed monthly
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <div className="flex items-center gap-2">
                    <span>Visa ending in 4242</span>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-address">Billing Address</Label>
                  <Input
                    id="billing-address"
                    defaultValue="123 Main St, Anytown, CA 12345"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">View Billing History</Button>
                <Button>Update Billing Info</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
