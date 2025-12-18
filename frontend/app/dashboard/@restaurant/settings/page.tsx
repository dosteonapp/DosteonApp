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
} from "lucide-react";
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
  const [selectedMember, setSelectedMember] = useState(null);

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
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            {/* <TabsTrigger value="team">Team</TabsTrigger> */}
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            {/* <TabsTrigger value="payment">Payment Options</TabsTrigger> */}
            {/* <TabsTrigger value="billing">Billing</TabsTrigger> */}
          </TabsList>

          <TabsContent value="account" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input id="restaurant-name" defaultValue="Bistro Bella" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="contact@bistrobella.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      defaultValue="123 Main St, Anytown, CA 12345"
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Team Management
                </h2>
                <p className="text-muted-foreground">
                  Manage your restaurant team members and their permissions
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
                      restaurant.
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
                          {restaurantRoles.map((role) => (
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
                        placeholder="Welcome to our team!"
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
                      Manage your restaurant team members and their access
                      levels
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
                  {restaurantRoles.map((role) => (
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
                          user: "John Smith",
                          details:
                            "Changed Sarah Johnson's role from Kitchen Staff to Procurement Officer",
                          time: "2 hours ago",
                        },
                        {
                          action: "Member Invited",
                          user: "John Smith",
                          details:
                            "Invited new team member: mike@bistrobella.com",
                          time: "1 day ago",
                        },
                        {
                          action: "Permission Modified",
                          user: "John Smith",
                          details:
                            "Updated inventory permissions for Kitchen Staff role",
                          time: "3 days ago",
                        },
                        {
                          action: "Member Removed",
                          user: "John Smith",
                          details:
                            "Removed inactive member: former@bistrobella.com",
                          time: "1 week ago",
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
