"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Edit, MoreHorizontal, Plus, Search, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function CustomerSegmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter segments based on search query and active tab
  const filteredSegments = segments
    .filter(
      (segment) =>
        segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        segment.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((segment) => {
      if (activeTab === "all") return true
      if (activeTab === "auto") return segment.type === "Automatic"
      if (activeTab === "manual") return segment.type === "Manual"
      return true
    })

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <Link href="/supplier/customers" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customer Segments</h1>
            <p className="text-muted-foreground">Group your customers based on behavior, value, and other criteria</p>
          </div>
          <Button asChild>
            <Link href="/supplier/customers/segments/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Segment
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Segments</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search segments..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>Organize your customers into targeted groups</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Segments</TabsTrigger>
                <TabsTrigger value="auto">Automatic</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="m-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSegments.map((segment) => (
                    <Card key={segment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{segment.name}</CardTitle>
                            <CardDescription>{segment.description}</CardDescription>
                          </div>
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
                                <Link href={`/supplier/customers/segments/${segment.id}`} className="flex w-full">
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/supplier/customers/segments/${segment.id}/edit`} className="flex w-full">
                                  Edit segment
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Export customers</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Delete segment</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{segment.customerCount} customers</span>
                          </div>
                          <Badge variant={segment.type === "Automatic" ? "outline" : "secondary"}>{segment.type}</Badge>
                        </div>
                        <Progress value={(segment.customerCount / totalCustomers) * 100} className="h-2" />
                      </CardContent>
                      <CardFooter>
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/supplier/customers/segments/${segment.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/supplier/customers/segments/${segment.id}/edit`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center h-full py-8">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">Create Segment</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Group customers based on behavior, value, or other criteria
                      </p>
                      <Button asChild>
                        <Link href="/supplier/customers/segments/create">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Segment
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="auto" className="m-0">
                {/* Same structure as "all" but filtered for automatic segments */}
              </TabsContent>
              <TabsContent value="manual" className="m-0">
                {/* Same structure as "all" but filtered for manual segments */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Sample data
const totalCustomers = 120

const segments = [
  {
    id: "seg-001",
    name: "High-Value Customers",
    description: "Customers with average order value above 200,000 RWF",
    type: "Automatic",
    customerCount: 28,
    criteria: "Average order value > 200,000 RWF",
  },
  {
    id: "seg-002",
    name: "Frequent Buyers",
    description: "Customers who order at least once a week",
    type: "Automatic",
    customerCount: 42,
    criteria: "Order frequency > 4 per month",
  },
  {
    id: "seg-003",
    name: "New Customers",
    description: "Customers who joined in the last 30 days",
    type: "Automatic",
    customerCount: 15,
    criteria: "Account created < 30 days ago",
  },
  {
    id: "seg-004",
    name: "Kigali City Center",
    description: "Restaurants located in Kigali city center",
    type: "Manual",
    customerCount: 35,
    criteria: "Manually selected",
  },
  {
    id: "seg-005",
    name: "Vegetarian Restaurants",
    description: "Restaurants with primarily vegetarian menus",
    type: "Manual",
    customerCount: 12,
    criteria: "Manually selected",
  },
  {
    id: "seg-006",
    name: "At Risk",
    description: "Customers who haven't ordered in over 30 days",
    type: "Automatic",
    customerCount: 18,
    criteria: "Last order > 30 days ago",
  },
  {
    id: "seg-007",
    name: "Premium Clients",
    description: "VIP customers with special pricing",
    type: "Manual",
    customerCount: 8,
    criteria: "Manually selected",
  },
]
