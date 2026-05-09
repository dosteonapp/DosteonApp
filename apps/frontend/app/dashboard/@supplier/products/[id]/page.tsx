"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Edit,
  TrendingUp,
  Package,
  ShoppingCart,
  Star,
  AlertTriangle,
  DollarSign,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailPage({ params }: any) {
  const { id } = params as { id: string };
  const [product] = useState(getProductById(id));

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/dashboard/products">Back to Products</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Product Details</h1>
        </div>
      </header> */}

      <main className="flex-1 space-y-4 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {product.name}
              </h1>
              <p className="text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
            <Badge
              variant={product.status === "active" ? "default" : "secondary"}
            >
              {product.status}
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                RWF {product.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +12% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{product.unitsSold}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +8% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Stock
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{product.currentStock}</div>
              <p className="text-xs text-muted-foreground">
                {product.currentStock < product.lowStockThreshold ? (
                  <span className="text-red-600 flex items-center">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Low stock alert
                  </span>
                ) : (
                  <span className="text-green-600">Stock level healthy</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customer Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {product.rating}
                <Star className="ml-1 h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {product.reviewCount} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Category
                      </p>
                      <p className="text-sm">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Unit
                      </p>
                      <p className="text-sm">{product.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Price
                      </p>
                      <p className="text-sm">
                        RWF {product.price.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Created
                      </p>
                      <p className="text-sm">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </p>
                    <p className="text-sm">{product.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sales Performance</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Customer Satisfaction</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Inventory Turnover</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Orders containing this product in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          {order.quantity} {product.unit}
                        </TableCell>
                        <TableCell>
                          RWF {order.total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(order.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Current Stock
                      </p>
                      <p className="text-2xl font-bold">
                        {product.currentStock} {product.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Low Stock Threshold
                      </p>
                      <p className="text-2xl font-bold">
                        {product.lowStockThreshold} {product.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Reorder Point
                      </p>
                      <p className="text-2xl font-bold">
                        {product.reorderPoint} {product.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Last Restocked
                      </p>
                      <p className="text-sm">
                        {new Date(product.lastRestocked).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Movement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.stockMovements.map((movement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{movement.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(movement.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              movement.quantity > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {movement.quantity > 0 ? "+" : ""}
                            {movement.quantity} {product.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {movement.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Month</span>
                      <span className="text-sm font-medium">
                        RWF {product.salesThisMonth.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Month</span>
                      <span className="text-sm font-medium">
                        RWF {product.salesLastMonth.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Growth Rate</span>
                      <span className="text-sm font-medium text-green-600">
                        +12%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.topCustomers.map((customer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.orders} orders
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          RWF {customer.total.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  Recent feedback from your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {review.customer}
                          </p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Mock function to get product by ID
function getProductById(id: string) {
  const products = {
    "prod-1": {
      id: "prod-1",
      name: "Organic Tomatoes",
      sku: "ORG-TOM-001",
      category: "Produce",
      price: 2500,
      unit: "kg",
      description:
        "Fresh organic tomatoes sourced from local farms. Perfect for salads, cooking, and sauces. Grown without pesticides or artificial fertilizers.",
      status: "active",
      currentStock: 150,
      lowStockThreshold: 50,
      reorderPoint: 75,
      lastRestocked: "2024-01-15",
      createdAt: "2023-06-15",
      totalRevenue: 125000,
      unitsSold: 450,
      rating: 4.8,
      reviewCount: 24,
      salesThisMonth: 45000,
      salesLastMonth: 40000,
      recentOrders: [
        {
          id: "ORD-001",
          customer: "Green Valley Restaurant",
          quantity: 25,
          total: 62500,
          date: "2024-01-20",
          status: "delivered",
        },
        {
          id: "ORD-002",
          customer: "Urban Bistro",
          quantity: 15,
          total: 37500,
          date: "2024-01-18",
          status: "delivered",
        },
        {
          id: "ORD-003",
          customer: "Farm Table",
          quantity: 30,
          total: 75000,
          date: "2024-01-16",
          status: "in-transit",
        },
      ],
      stockMovements: [
        {
          type: "Stock In",
          quantity: 100,
          date: "2024-01-15",
          reason: "Weekly delivery",
        },
        {
          type: "Sale",
          quantity: -25,
          date: "2024-01-20",
          reason: "Order ORD-001",
        },
        {
          type: "Sale",
          quantity: -15,
          date: "2024-01-18",
          reason: "Order ORD-002",
        },
      ],
      topCustomers: [
        {
          name: "Green Valley Restaurant",
          orders: 12,
          total: 180000,
        },
        {
          name: "Urban Bistro",
          orders: 8,
          total: 120000,
        },
        {
          name: "Farm Table",
          orders: 6,
          total: 90000,
        },
      ],
      reviews: [
        {
          customer: "Green Valley Restaurant",
          rating: 5,
          comment:
            "Excellent quality tomatoes. Always fresh and flavorful. Our customers love them!",
          date: "2024-01-10",
        },
        {
          customer: "Urban Bistro",
          rating: 4,
          comment:
            "Good quality, though sometimes the sizes vary. Overall satisfied with the product.",
          date: "2024-01-05",
        },
        {
          customer: "Farm Table",
          rating: 5,
          comment:
            "Perfect for our farm-to-table concept. Customers can taste the difference!",
          date: "2023-12-28",
        },
      ],
    },
  };

  return products[id as keyof typeof products] || null;
}
