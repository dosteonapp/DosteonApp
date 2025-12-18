"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Mail, Phone, MoreHorizontal, Shield, Settings, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const restaurantRoles = [
  {
    id: "owner",
    name: "Restaurant Owner/Manager",
    description: "Top-level admin responsible for overall management and decision-making (Default Role)",
    permissions: [
      // Full access to all modules
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
    permissions: ["create_orders", "supplier_access", "inventory_management", "partial_payments"],
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "kitchen",
    name: "Kitchen Staff",
    description: "Manages daily food production and stock usage",
    permissions: ["view_inventory", "update_usage", "stock_requests", "delivery_notifications"],
    color: "bg-green-100 text-green-800",
  },
  {
    id: "cashier",
    name: "Cashier/Front-of-House",
    description: "Handles sales transactions and updates inventory for sold items",
    permissions: ["sales_transactions", "inventory_updates", "receipts", "low_stock_alerts"],
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "supervisor",
    name: "Shift Supervisor",
    description: "Oversees daily operations and monitors staff performance",
    permissions: ["staff_monitoring", "inventory_adjustments", "basic_reports", "messaging"],
    color: "bg-purple-100 text-purple-800",
  },
]

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
]

const permissionCategories = {
  Orders: ["create_orders", "view_orders", "update_orders", "approve_orders"],
  Inventory: ["view_inventory", "update_inventory", "inventory_management", "stock_requests"],
  Messaging: ["customer_chat", "internal_messaging", "notifications"],
  Payments: ["view_payments", "process_payments", "financial_data", "partial_payments"],
  Reports: ["basic_reports", "financial_reports", "analytics"],
  Administration: ["user_management", "role_assignment", "full_access"],
}

export default function RestaurantTeamPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  const getRoleInfo = (roleId: string) => {
    return restaurantRoles.find((role) => role.id === roleId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your restaurant team members and their permissions</p>
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
              <DialogDescription>Send an invitation to a new team member to join your restaurant.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input id="invite-email" type="email" placeholder="Enter email address" />
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
                <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                <Input id="invite-message" placeholder="Welcome to our team!" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsInviteOpen(false)}>Send Invitation</Button>
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
              <CardDescription>Manage your restaurant team members and their access levels</CardDescription>
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
                    const roleInfo = getRoleInfo(member.role)
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
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
                          <Badge className={roleInfo?.color}>{roleInfo?.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.lastActive}</TableCell>
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
                                  setSelectedMember(member)
                                  setIsRoleModalOpen(true)
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
                    )
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
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={role.color}>{teamMembers.filter((m) => m.role === role.id).length} members</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Permissions</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(permissionCategories).map(([category, permissions]) => (
                          <div key={category} className="space-y-2">
                            <h5 className="text-sm font-medium text-muted-foreground">{category}</h5>
                            {permissions.map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <Switch checked={role.permissions.includes(permission)} disabled size="sm" />
                                <span className="text-sm">{permission.replace(/_/g, " ")}</span>
                              </div>
                            ))}
                          </div>
                        ))}
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
              <CardDescription>Track team member actions and role changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Role Updated",
                    user: "John Smith",
                    details: "Changed Sarah Johnson's role from Kitchen Staff to Procurement Officer",
                    time: "2 hours ago",
                  },
                  {
                    action: "Member Invited",
                    user: "John Smith",
                    details: "Invited new team member: mike@bistrobella.com",
                    time: "1 day ago",
                  },
                  {
                    action: "Permission Modified",
                    user: "John Smith",
                    details: "Updated inventory permissions for Kitchen Staff role",
                    time: "3 days ago",
                  },
                  {
                    action: "Member Removed",
                    user: "John Smith",
                    details: "Removed inactive member: former@bistrobella.com",
                    time: "1 week ago",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
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
            <DialogDescription>Update the role for {selectedMember?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <div className="p-2 bg-muted rounded">{selectedMember && getRoleInfo(selectedMember.role)?.name}</div>
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
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsRoleModalOpen(false)}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
