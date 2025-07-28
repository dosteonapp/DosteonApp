"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  Filter,
  Download,
  BarChart,
  Users,
  MessageSquare,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Filter customers based on search query and active tab
  const filteredCustomers = customers
    .filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.location.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((customer) => {
      if (activeTab === "all") return true
      if (activeTab === "active") return customer.status === "Active"
      if (activeTab === "pending") return customer.status === "Pending"
      if (activeTab === "inactive") return customer.status === "Inactive"
      if (activeTab === "high-value") return customer.value === "High"
      return true
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      if (sortBy === "lastOrder") {
        const dateA = getDateValue(a.lastOrder)
        const dateB = getDateValue(b.lastOrder)
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }
      if (sortBy === "value") {
        const valueMap = { High: 3, Medium: 2, Low: 1, Unknown: 0 }
        return sortOrder === "asc" ? valueMap[a.value] - valueMap[b.value] : valueMap[b.value] - valueMap[a.value]
      }
      return 0
    })

  function getDateValue(dateStr: string): number {
    if (dateStr === "Today") return Date.now()
    if (dateStr === "Yesterday") return Date.now() - 86400000
    if (dateStr === "Never") return 0

    if (dateStr.includes("days ago")) {
      const days = Number.parseInt(dateStr.split(" ")[0])
      return Date.now() - days * 86400000
    }
    if (dateStr.includes("week")) {
      const weeks = Number.parseInt(dateStr.split(" ")[0])
      return Date.now() - weeks * 7 * 86400000
    }
    if (dateStr.includes("month")) {
      const months = Number.parseInt(dateStr.split(" ")[0])
      return Date.now() - months * 30 * 86400000
    }

    return 0
  }

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your restaurant customers and their orders</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/supplier/customers/segments">
                <Users className="mr-2 h-4 w-4" />
                Segments
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/supplier/customers/insights">
                <BarChart className="mr-2 h-4 w-4" />
                Insights
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/supplier/customers/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <Button asChild>
              <Link href="/supplier/customers/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Restaurant Customers</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>You have {customers.length} total customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Customers</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="high-value">High Value</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="m-0">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="lastOrder">Last Order</SelectItem>
                        <SelectItem value="value">Customer Value</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("name")}>
                            Name
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <div
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => toggleSort("lastOrder")}
                          >
                            Last Order
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("value")}>
                            Value
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No customers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.type}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span>{customer.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{customer.location}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  customer.status === "Active"
                                    ? "default"
                                    : customer.status === "Pending"
                                      ? "outline"
                                      : "secondary"
                                }
                              >
                                {customer.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{customer.lastOrder}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  customer.value === "High"
                                    ? "default"
                                    : customer.value === "Medium"
                                      ? "outline"
                                      : "secondary"
                                }
                                className={
                                  customer.value === "High"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : customer.value === "Medium"
                                      ? "border-yellow-500 text-yellow-700"
                                      : ""
                                }
                              >
                                {customer.value}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Link href={`/supplier/customers/${customer.id}`} className="flex w-full">
                                      View details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Link href={`/supplier/orders/new?customer=${customer.id}`} className="flex w-full">
                                      Create order
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Link
                                      href={`/supplier/customers/messages?id=${customer.id}`}
                                      className="flex w-full"
                                    >
                                      Send message
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">Delete customer</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="active" className="m-0">
                {/* Same table structure as "all" but filtered for active customers */}
              </TabsContent>
              <TabsContent value="high-value" className="m-0">
                {/* Same table structure as "all" but filtered for high-value customers */}
              </TabsContent>
              <TabsContent value="pending" className="m-0">
                {/* Same table structure as "all" but filtered for pending customers */}
              </TabsContent>
              <TabsContent value="inactive" className="m-0">
                {/* Same table structure as "all" but filtered for inactive customers */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Sample data
const customers = [
  {
    id: "cust-001",
    name: "Bistro Bella",
    type: "Fine Dining",
    email: "manager@bistrobella.com",
    phone: "+250 78 123 4567",
    location: "Kimihurura, Kigali",
    status: "Active",
    lastOrder: "Today",
    value: "High",
  },
  {
    id: "cust-002",
    name: "Cafe Milano",
    type: "Cafe",
    email: "orders@cafemilano.com",
    phone: "+250 79 234 5678",
    location: "Kacyiru, Kigali",
    status: "Active",
    lastOrder: "Yesterday",
    value: "Medium",
  },
  {
    id: "cust-003",
    name: "The Green Plate",
    type: "Vegetarian",
    email: "info@greenplate.com",
    phone: "+250 78 345 6789",
    location: "Nyarutarama, Kigali",
    status: "Active",
    lastOrder: "3 days ago",
    value: "High",
  },
  {
    id: "cust-004",
    name: "Spice Garden",
    type: "Indian",
    email: "orders@spicegarden.com",
    phone: "+250 79 456 7890",
    location: "Kigali Heights",
    status: "Inactive",
    lastOrder: "2 weeks ago",
    value: "Low",
  },
  {
    id: "cust-005",
    name: "Taste of Asia",
    type: "Asian Fusion",
    email: "manager@tasteofasia.com",
    phone: "+250 78 567 8901",
    location: "Kigali City Tower",
    status: "Pending",
    lastOrder: "Never",
    value: "Unknown",
  },
  {
    id: "cust-006",
    name: "Ocean Delights",
    type: "Seafood",
    email: "orders@oceandelights.com",
    phone: "+250 78 678 9012",
    location: "Kibagabaga, Kigali",
    status: "Active",
    lastOrder: "1 week ago",
    value: "Medium",
  },
  {
    id: "cust-007",
    name: "Urban Bites",
    type: "Fast Casual",
    email: "info@urbanbites.com",
    phone: "+250 79 789 0123",
    location: "Remera, Kigali",
    status: "Active",
    lastOrder: "2 days ago",
    value: "High",
  },
  {
    id: "cust-008",
    name: "Sunset Grill",
    type: "Steakhouse",
    email: "reservations@sunsetgrill.com",
    phone: "+250 78 890 1234",
    location: "Gikondo, Kigali",
    status: "Pending",
    lastOrder: "Never",
    value: "Unknown",
  },
  {
    id: "cust-009",
    name: "Mountain View Restaurant",
    type: "Traditional",
    email: "info@mountainview.com",
    phone: "+250 79 901 2345",
    location: "Kicukiro Centre",
    status: "Active",
    lastOrder: "Yesterday",
    value: "Medium",
  },
  {
    id: "cust-010",
    name: "Fresh & Fast",
    type: "Health Food",
    email: "orders@freshandfast.com",
    phone: "+250 78 012 3456",
    location: "Nyamirambo, Kigali",
    status: "Inactive",
    lastOrder: "1 month ago",
    value: "Low",
  },
]
