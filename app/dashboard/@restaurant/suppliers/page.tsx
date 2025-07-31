import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Menu, Star, StarHalf } from "lucide-react"
import Link from "next/link"

export default function SuppliersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Suppliers</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground">Manage your supplier relationships</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/restaurant/suppliers/discover">Discover New Suppliers</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Suppliers</CardTitle>
            <CardDescription>View and manage your supplier relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search suppliers..." className="pl-8 w-full md:w-[300px]" />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="meat">Meat & Poultry</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="dry-goods">Dry Goods</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Fulfillment Rate</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Quality Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {supplier.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRatingVariant(supplier.fulfillmentRating)}>
                          {supplier.fulfillmentRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{supplier.responseTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {Array.from({ length: Math.floor(supplier.qualityRating) }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                          {supplier.qualityRating % 1 !== 0 && (
                            <StarHalf className="h-4 w-4 fill-primary text-primary" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/restaurant/suppliers/${supplier.id}`}>View</Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/restaurant/orders/new?supplier=${supplier.id}`}>Order</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Helper function to get badge variant based on rating
function getRatingVariant(rating: string) {
  switch (rating) {
    case "Excellent":
      return "success"
    case "Good":
      return "default"
    case "Fair":
      return "warning"
    case "Poor":
      return "destructive"
    default:
      return "outline"
  }
}

// Sample data
const suppliers = [
  {
    id: "supplier-1",
    name: "Fresh Farms Inc.",
    categories: ["Produce", "Dairy"],
    fulfillmentRate: 98,
    fulfillmentRating: "Excellent",
    responseTime: "30 min avg.",
    qualityRating: 4.5,
  },
  {
    id: "supplier-2",
    name: "Metro Meats",
    categories: ["Meat & Poultry"],
    fulfillmentRate: 92,
    fulfillmentRating: "Good",
    responseTime: "1.5 hrs avg.",
    qualityRating: 4,
  },
  {
    id: "supplier-3",
    name: "Global Grocers",
    categories: ["Produce", "Dry Goods", "Beverages"],
    fulfillmentRate: 88,
    fulfillmentRating: "Good",
    responseTime: "2 hrs avg.",
    qualityRating: 3.5,
  },
  {
    id: "supplier-4",
    name: "Organic Supplies Co.",
    categories: ["Produce", "Dry Goods"],
    fulfillmentRate: 95,
    fulfillmentRating: "Excellent",
    responseTime: "45 min avg.",
    qualityRating: 5,
  },
  {
    id: "supplier-5",
    name: "Dairy Delights",
    categories: ["Dairy"],
    fulfillmentRate: 90,
    fulfillmentRating: "Good",
    responseTime: "1 hr avg.",
    qualityRating: 4,
  },
  {
    id: "supplier-6",
    name: "Kigali Fresh Produce",
    categories: ["Produce"],
    fulfillmentRate: 97,
    fulfillmentRating: "Excellent",
    responseTime: "25 min avg.",
    qualityRating: 4.5,
  },
  {
    id: "supplier-7",
    name: "Rwanda Meat Suppliers",
    categories: ["Meat & Poultry"],
    fulfillmentRate: 85,
    fulfillmentRating: "Good",
    responseTime: "3 hrs avg.",
    qualityRating: 3.5,
  },
]
