"use client";

import { useState } from "react";
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
  UserPlus,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  Settings,
  Trash2,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const supplierRoles = [
  {
    id: "owner",
    name: "Supplier Owner/Manager",
    description:
      "Primary administrator with complete control over operations and team management (Default Role)",
    permissions: [
      "full_access",
      "user_management",
      "financial_data",
      "role_assignment",
      "order_management",
      "order_fulfillment",
      "order_history",
      "order_confirmation",
      "inventory_management",
      "stock_alerts",
      "batch_updates",
      "product_updates",
      "customer_chat",
      "customer_support",
      "internal_messaging",
      "financial_management",
      "invoice_generation",
      "payment_tracking",
      "financial_reports",
      "sales_reports",
      "analytics",
      "performance_metrics",
      "issue_tracking",
    ],
    color: "bg-red-100 text-red-800",
    isDefault: true,
  },
  {
    id: "sales",
    name: "Sales Representative",
    description: "Handles customer relations, order processing, and updates",
    permissions: [
      "order_management",
      "customer_chat",
      "invoice_generation",
      "product_updates",
    ],
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "warehouse",
    name: "Warehouse Staff",
    description: "Manages stock and handles order fulfillment",
    permissions: [
      "inventory_management",
      "order_fulfillment",
      "stock_alerts",
      "batch_updates",
    ],
    color: "bg-green-100 text-green-800",
  },
  {
    id: "finance",
    name: "Accounts/Finance",
    description: "Manages invoices, payments, and financial reporting",
    permissions: [
      "financial_management",
      "invoice_generation",
      "payment_tracking",
      "financial_reports",
    ],
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "support",
    name: "Customer Support",
    description:
      "Assists with order issues, customer inquiries, and resolution tracking",
    permissions: [
      "customer_support",
      "order_history",
      "issue_tracking",
      "customer_chat",
    ],
    color: "bg-purple-100 text-purple-800",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "David Wilson",
    email: "david@freshfarms.com",
    phone: "+1 (555) 987-6543",
    role: "owner",
    status: "active",
    lastActive: "1 hour ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Emma Thompson",
    email: "emma@freshfarms.com",
    phone: "+1 (555) 876-5432",
    role: "sales",
    status: "active",
    lastActive: "30 minutes ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Carlos Martinez",
    email: "carlos@freshfarms.com",
    phone: "+1 (555) 765-4321",
    role: "warehouse",
    status: "active",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Rachel Green",
    email: "rachel@freshfarms.com",
    phone: "+1 (555) 654-3210",
    role: "finance",
    status: "active",
    lastActive: "4 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Tom Anderson",
    email: "tom@freshfarms.com",
    phone: "+1 (555) 543-2109",
    role: "support",
    status: "inactive",
    lastActive: "2 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const permissionCategories = {
  Orders: [
    "order_management",
    "order_fulfillment",
    "order_history",
    "order_confirmation",
  ],
  Inventory: [
    "inventory_management",
    "stock_alerts",
    "batch_updates",
    "product_updates",
  ],
  Messaging: ["customer_chat", "customer_support", "internal_messaging"],
  Payments: [
    "financial_management",
    "invoice_generation",
    "payment_tracking",
    "financial_reports",
  ],
  Reports: [
    "sales_reports",
    "financial_reports",
    "analytics",
    "performance_metrics",
  ],
  Administration: [
    "user_management",
    "role_assignment",
    "full_access",
    "issue_tracking",
  ],
};

export default function SupplierSettingsPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const getRoleInfo = (roleId: string) => {
    return supplierRoles.find((role) => role.id === roleId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            {/* <TabsTrigger value="team">Team</TabsTrigger> */}
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {/* <TabsTrigger value="payment">Payment Options</TabsTrigger> */}
            {/* <TabsTrigger value="billing">Billing</TabsTrigger> */}
          </TabsList>

          <TabsContent value="account" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your supplier account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="Fresh Farms Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="contact@freshfarms.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue="+1 (555) 987-6543"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      defaultValue="456 Farm Rd, Countryside, CA 54321"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <PasswordInput id="current-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput id="new-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <PasswordInput id="confirm-password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Team Management
                </h2>
                <p className="text-muted-foreground">
                  Manage your supplier team members and their permissions
                </p>
              </div>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite New Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to a new team member to join your
                      supplier organization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select defaultValue="owner">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {supplierRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name} {role.isDefault && "(Default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-message">
                        Personal Message (Optional)
                      </Label>
                      <Input
                        id="invite-message"
                        placeholder="Welcome to our supplier team!"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsInviteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsInviteOpen(false)}>
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="members" className="space-y-4">
              <TabsList>
                <TabsTrigger value="members">Team Members</TabsTrigger>
                <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members ({teamMembers.length})</CardTitle>
                    <CardDescription>
                      Manage your supplier team members and their access levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member) => {
                          const roleInfo = getRoleInfo(member.role);
                          return (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={member.avatar || "/placeholder.svg"}
                                    />
                                    <AvatarFallback>
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {member.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      {member.email}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Phone className="h-3 w-3" />
                                      {member.phone}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={roleInfo?.color}>
                                  {roleInfo?.name}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    member.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {member.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {member.lastActive}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedMember(member);
                                        setIsRoleModalOpen(true);
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Role
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Settings className="mr-2 h-4 w-4" />
                                      Permissions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove
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

              <TabsContent value="roles" className="space-y-4">
                <div className="grid gap-4">
                  {supplierRoles.map((role) => (
                    <Card key={role.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-primary" />
                            <div>
                              <CardTitle className="text-lg">
                                {role.name}
                              </CardTitle>
                              <CardDescription>
                                {role.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={role.color}>
                            {
                              teamMembers.filter((m) => m.role === role.id)
                                .length
                            }{" "}
                            members
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Permissions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {Object.entries(permissionCategories).map(
                                ([category, permissions]) => (
                                  <div key={category} className="space-y-2">
                                    <h5 className="text-sm font-medium text-muted-foreground">
                                      {category}
                                    </h5>
                                    {permissions.map((permission) => (
                                      <div
                                        key={permission}
                                        className="flex items-center space-x-2"
                                      >
                                        <Switch
                                          checked={role.permissions.includes(
                                            permission
                                          )}
                                          disabled
                                          size="sm"
                                        />
                                        <span className="text-sm">
                                          {permission.replace(/_/g, " ")}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Track team member actions and role changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          action: "Role Updated",
                          user: "David Wilson",
                          details:
                            "Changed Emma Thompson's permissions for customer chat access",
                          time: "1 hour ago",
                        },
                        {
                          action: "Member Invited",
                          user: "David Wilson",
                          details:
                            "Invited new team member: support@freshfarms.com",
                          time: "2 days ago",
                        },
                        {
                          action: "Permission Modified",
                          user: "David Wilson",
                          details: "Updated financial access for Accounts role",
                          time: "1 week ago",
                        },
                        {
                          action: "Member Activated",
                          user: "David Wilson",
                          details:
                            "Activated Carlos Martinez's warehouse access",
                          time: "2 weeks ago",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 rounded-lg border"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {activity.action}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {activity.time}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.details}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              by {activity.user}
                            </p>
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
                        {supplierRoles.map((role) => (
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

          <TabsContent value="products" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
                <CardDescription>
                  Configure your product preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Select defaultValue="rwf">
                    <SelectTrigger id="default-currency">
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rwf">Rwandan Franc (RWF)</SelectItem>
                      <SelectItem value="usd">US Dollar (USD)</SelectItem>
                      <SelectItem value="eur">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low-stock-threshold">
                    Low Stock Alert Threshold
                  </Label>
                  <Input
                    id="low-stock-threshold"
                    type="number"
                    defaultValue="10"
                  />
                  <p className="text-sm text-muted-foreground">
                    You will be alerted when products fall below this quantity
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-restock">
                    Auto-Restock Notifications
                  </Label>
                  <Switch id="auto-restock" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
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
                      <Label htmlFor="email-orders">New Orders</Label>
                      <Switch id="email-orders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-inventory">Low Stock Alerts</Label>
                      <Switch id="email-inventory" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-payments">Payment Received</Label>
                      <Switch id="email-payments" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-promotions">
                        Marketing & Promotions
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
                      <Label htmlFor="sms-orders">New Orders</Label>
                      <Switch id="sms-orders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-inventory">Low Stock Alerts</Label>
                      <Switch id="sms-inventory" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-payments">Payment Received</Label>
                      <Switch id="sms-payments" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
                <CardDescription>
                  Manage your payment methods for receiving payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Accepted Payment Methods
                  </h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="accept-bank-transfer">
                        Bank Transfer
                      </Label>
                      <Switch id="accept-bank-transfer" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="accept-credit-card">
                        Credit/Debit Card
                      </Label>
                      <Switch id="accept-credit-card" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="accept-mobile-money">Mobile Money</Label>
                      <Switch id="accept-mobile-money" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="accept-cash">Cash on Delivery</Label>
                      <Switch id="accept-cash" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Payment Account Details
                  </h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input id="bank-name" defaultValue="Bank of Kigali" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input id="account-number" defaultValue="1234567890" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-money">Mobile Money Number</Label>
                      <Input
                        id="mobile-money"
                        defaultValue="+250 78 123 4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Terms</h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="payment-terms">
                        Default Payment Terms
                      </Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="payment-terms">
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cod">Cash on Delivery</SelectItem>
                          <SelectItem value="7">Net 7 Days</SelectItem>
                          <SelectItem value="15">Net 15 Days</SelectItem>
                          <SelectItem value="30">Net 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-reminders">
                        Automatic Payment Reminders
                      </Label>
                      <Switch id="auto-reminders" defaultChecked />
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
                    <span className="font-medium">Business Plan</span>
                    <Badge>Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    $99.99/month, billed monthly
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <div className="flex items-center gap-2">
                    <span>Mastercard ending in 8765</span>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-address">Billing Address</Label>
                  <Input
                    id="billing-address"
                    defaultValue="456 Farm Rd, Countryside, CA 54321"
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
