import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Menu,
  ArrowLeft,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  StarHalf,
  DollarSign,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplierDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  // In a real app, you would fetch the supplier data based on the ID
  const supplier = suppliers.find((s) => s.id === id) || suppliers[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Supplier Details</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/suppliers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Suppliers
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {supplier.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {Array.from({ length: Math.floor(supplier.qualityRating) }).map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  )
                )}
                {supplier.qualityRating % 1 !== 0 && (
                  <StarHalf className="h-4 w-4 fill-primary text-primary" />
                )}
              </div>
              <span className="text-muted-foreground">
                ({supplier.totalReviews} reviews)
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {supplier.categories.map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href={`tel:${supplier.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/orders/new?supplier=${supplier.id}`}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Place Order
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Order Fulfillment Rate
              </CardTitle>
              <CardDescription>
                Successfully fulfilled orders / total orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {supplier.metrics.fulfillmentRate}%
                </div>
                <Badge
                  variant={getRatingVariant(supplier.metrics.fulfillmentRating)}
                >
                  {supplier.metrics.fulfillmentRating}
                </Badge>
              </div>
              <Progress
                value={supplier.metrics.fulfillmentRate}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {supplier.metrics.totalOrders} orders,{" "}
                {supplier.metrics.fulfilledOrders} fulfilled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Response Rate
              </CardTitle>
              <CardDescription>
                Average time between order receipt and confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {supplier.metrics.responseTime}
                </div>
                <Badge
                  variant={getRatingVariant(supplier.metrics.responseRating)}
                >
                  {supplier.metrics.responseRating}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Last response: {supplier.metrics.lastResponseTime}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Quality Consistency
              </CardTitle>
              <CardDescription>
                Deliveries meeting quality standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {supplier.metrics.qualityRate}%
                </div>
                <Badge
                  variant={getRatingVariant(supplier.metrics.qualityRating)}
                >
                  {supplier.metrics.qualityRating}
                </Badge>
              </div>
              <Progress value={supplier.metrics.qualityRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Based on your quality checks and returns
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Price Competitiveness
              </CardTitle>
              <CardDescription>
                Supplier price ÷ Market average price
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {supplier.metrics.priceIndex}x
                </div>
                <Badge variant={getPriceVariant(supplier.metrics.priceIndex)}>
                  {supplier.metrics.priceIndex < 1
                    ? "Below Market"
                    : supplier.metrics.priceIndex === 1
                    ? "At Market"
                    : "Above Market"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Last updated: {supplier.metrics.priceLastUpdated}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Delivery Flexibility
              </CardTitle>
              <CardDescription>
                Special delivery requests accommodated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {supplier.metrics.flexibilityRate}%
                </div>
                <Badge
                  variant={getFlexibilityVariant(
                    supplier.metrics.flexibilityRate
                  )}
                >
                  {getFlexibilityRating(supplier.metrics.flexibilityRate)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {supplier.metrics.specialRequests} special requests,{" "}
                  {supplier.metrics.accommodatedRequests} accommodated
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="order-history">Order History</TabsTrigger>
            <TabsTrigger value="contact">Contact Information</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>
                  Products offered by this supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier.products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            RWF {product.price.toLocaleString()}
                          </TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell>
                            <div className="flex">
                              {Array.from({
                                length: Math.floor(product.quality),
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-primary text-primary"
                                />
                              ))}
                              {product.quality % 1 !== 0 && (
                                <StarHalf className="h-4 w-4 fill-primary text-primary" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" asChild>
                              <Link href="#">Order</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="order-history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  Your past orders with this supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier.orderHistory.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>
                            RWF {order.total.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getOrderStatusVariant(order.status)}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" disabled>
                                View
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
          </TabsContent>
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Ways to reach this supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{supplier.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{supplier.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">
                        {supplier.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-muted-foreground">
                        {supplier.businessHours}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Helper function to get badge variant based on rating
function getRatingVariant(rating: string): "default" | "destructive" | "outline" | "secondary" | "warning" | "success" | "info" | "pending" {
  switch (rating) {
    case "Excellent":
      return "success";
    case "Good":
      return "default";
    case "Fair":
      return "warning";
    case "Poor":
      return "destructive";
    default:
      return "outline";
  }
}

// Helper function to get badge variant based on price index
function getPriceVariant(priceIndex: number): "default" | "destructive" | "outline" | "secondary" | "warning" | "success" | "info" | "pending" {
  if (priceIndex < 0.95) return "success";
  if (priceIndex <= 1.05) return "default";
  if (priceIndex <= 1.15) return "warning";
  return "destructive";
}

// Helper function to get badge variant based on flexibility rate
function getFlexibilityVariant(rate: number): "default" | "destructive" | "outline" | "secondary" | "warning" | "success" | "info" | "pending" {
  if (rate >= 90) return "success";
  if (rate >= 75) return "default";
  if (rate >= 60) return "warning";
  return "destructive";
}

// Helper function to get flexibility rating text
function getFlexibilityRating(rate: number) {
  if (rate >= 90) return "Very Flexible";
  if (rate >= 75) return "Flexible";
  if (rate >= 60) return "Somewhat Flexible";
  return "Not Flexible";
}

// Helper function to get badge variant based on order status
function getOrderStatusVariant(status: string): "default" | "destructive" | "outline" | "secondary" | "warning" | "success" | "info" | "pending" {
  switch (status) {
    case "Delivered":
      return "secondary";
    case "In Transit":
      return "info";
    case "Confirmed":
      return "success";
    case "Pending":
      return "pending";
    case "Cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

// Sample data
const suppliers = [
  {
    id: "supplier-1",
    name: "Fresh Farms Inc.",
    qualityRating: 4.5,
    totalReviews: 128,
    categories: ["Produce", "Dairy"],
    phone: "+250 78 123 4567",
    email: "contact@freshfarms.rw",
    address: "KG 123 St, Kigali, Rwanda",
    businessHours: "Mon-Sat: 7:00 AM - 6:00 PM, Sun: 8:00 AM - 2:00 PM",
    metrics: {
      fulfillmentRate: 98,
      fulfillmentRating: "Excellent",
      totalOrders: 245,
      fulfilledOrders: 240,
      responseTime: "30 min",
      responseRating: "Excellent",
      lastResponseTime: "Today, 9:15 AM",
      qualityRate: 96,
      qualityRating: "Excellent",
      priceIndex: 0.92,
      priceLastUpdated: "Last week",
      flexibilityRate: 95,
      specialRequests: 42,
      accommodatedRequests: 40,
    },
    products: [
      {
        id: "prod-1",
        name: "Tomatoes",
        category: "Produce",
        price: 2500,
        unit: "kg",
        quality: 4.5,
      },
      {
        id: "prod-2",
        name: "Onions",
        category: "Produce",
        price: 1800,
        unit: "kg",
        quality: 4.0,
      },
      {
        id: "prod-3",
        name: "Potatoes",
        category: "Produce",
        price: 2200,
        unit: "kg",
        quality: 4.5,
      },
      {
        id: "prod-6",
        name: "Milk",
        category: "Dairy",
        price: 1500,
        unit: "liter",
        quality: 5.0,
      },
      {
        id: "prod-7",
        name: "Cheese",
        category: "Dairy",
        price: 8000,
        unit: "kg",
        quality: 4.5,
      },
    ],
    orderHistory: [
      {
        id: "ORD-7891",
        date: "May 3, 2023",
        items: 8,
        total: 245500,
        status: "Pending",
      },
      {
        id: "ORD-7880",
        date: "Apr 30, 2023",
        items: 6,
        total: 189250,
        status: "Delivered",
      },
      {
        id: "ORD-7865",
        date: "Apr 25, 2023",
        items: 10,
        total: 320750,
        status: "Delivered",
      },
      {
        id: "ORD-7850",
        date: "Apr 18, 2023",
        items: 5,
        total: 156750,
        status: "Delivered",
      },
    ],
  },
  {
    id: "supplier-2",
    name: "Metro Meats",
    qualityRating: 4.0,
    totalReviews: 96,
    categories: ["Meat & Poultry"],
    phone: "+250 78 234 5678",
    email: "orders@metromeats.rw",
    address: "KN 5 Ave, Kigali, Rwanda",
    businessHours: "Mon-Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 12:00 PM",
    metrics: {
      fulfillmentRate: 92,
      fulfillmentRating: "Good",
      totalOrders: 185,
      fulfilledOrders: 170,
      responseTime: "1.5 hrs",
      responseRating: "Good",
      lastResponseTime: "Yesterday, 2:30 PM",
      qualityRate: 90,
      qualityRating: "Good",
      priceIndex: 1.05,
      priceLastUpdated: "Last month",
      flexibilityRate: 80,
      specialRequests: 35,
      accommodatedRequests: 28,
    },
    products: [
      {
        id: "prod-4",
        name: "Chicken Breast",
        category: "Meat & Poultry",
        price: 9500,
        unit: "kg",
        quality: 4.0,
      },
      {
        id: "prod-5",
        name: "Ground Beef",
        category: "Meat & Poultry",
        price: 8200,
        unit: "kg",
        quality: 4.0,
      },
    ],
    orderHistory: [
      {
        id: "ORD-7890",
        date: "May 2, 2023",
        items: 5,
        total: 320750,
        status: "Confirmed",
      },
      {
        id: "ORD-7870",
        date: "Apr 28, 2023",
        items: 4,
        total: 189250,
        status: "Delivered",
      },
    ],
  },
];
