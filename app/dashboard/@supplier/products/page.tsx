"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Menu,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddProductModal } from "@/components/add-product-modal";

export default function ProductsPage() {
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);
  const [productsList, setProductsList] = useState(products);

  const handleProductAdded = (newProduct: any) => {
    setProductsList([newProduct, ...productsList]);
  };

  // Calculate inventory health metrics
  const inventoryMetrics = {
    totalProducts: productsList.length,
    lowStockItems: productsList.filter(
      (p) => p.currentStock <= p.lowStockThreshold
    ).length,
    outOfStockItems: productsList.filter((p) => p.currentStock === 0).length,
    totalValue: productsList.reduce(
      (sum, p) => sum + p.price * p.currentStock,
      0
    ),
    averageRating:
      productsList.reduce((sum, p) => sum + p.rating, 0) / productsList.length,
    topPerformer: productsList.reduce(
      (top, p) => (p.orders > top.orders ? p : top),
      productsList[0]
    ),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Products</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog and inventory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setNewProductModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Inventory Health Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                RWF {inventoryMetrics.totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total stock value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryMetrics.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">Active products</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top Performer
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {inventoryMetrics.topPerformer?.name}
              </div>
              <p className="text-xs text-muted-foreground">
                {inventoryMetrics.topPerformer?.orders} orders this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-row items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {inventoryMetrics.lowStockItems}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Items need restocking
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-300"
                >
                  View Items
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {inventoryMetrics.averageRating.toFixed(1)}
                <Star className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground">
                Customer satisfaction
              </p>
            </CardContent>
          </Card> */}
        </div>

        {/* Inventory Health Alerts */}
        {/* {(inventoryMetrics.lowStockItems > 0 ||
          inventoryMetrics.outOfStockItems > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Inventory Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventoryMetrics.outOfStockItems > 0 && (
                  <div className="flex items-center justify-between p-2 bg-red-100 rounded">
                    <span className="text-red-800 text-sm">
                      {inventoryMetrics.outOfStockItems} product(s) are out of
                      stock
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-700 border-red-300"
                    >
                      View Items
                    </Button>
                  </div>
                )}
                {inventoryMetrics.lowStockItems > 0 && (
                  <div className="flex items-center justify-between p-2 bg-orange-100 rounded">
                    <span className="text-orange-800 text-sm">
                      {inventoryMetrics.lowStockItems} product(s) are running
                      low
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-700 border-orange-300"
                    >
                      Reorder Now
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )} */}

        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>View and manage all your products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 w-full md:w-[300px]"
                  />
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
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Orders (30d)</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsList.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        RWF {product.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span>
                            {product.currentStock} {product.unit}
                          </span>
                          {product.currentStock <=
                            product.lowStockThreshold && (
                            <Badge
                              variant="destructive"
                              className="text-xs mt-1"
                            >
                              {product.currentStock === 0
                                ? "Out of Stock"
                                : "Low Stock"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.orders}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            product.currentStock > product.lowStockThreshold
                              ? "default"
                              : "destructive"
                          }
                        >
                          {product.currentStock > product.lowStockThreshold
                            ? "Healthy"
                            : product.currentStock === 0
                            ? "Critical"
                            : "Warning"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/supplier/products/${product.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/supplier/products/${product.id}/edit`}
                            >
                              Edit
                            </Link>
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

      <AddProductModal
        open={newProductModalOpen}
        onOpenChange={setNewProductModalOpen}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
}

// Enhanced sample data with inventory information
const products = [
  {
    id: "prod-1",
    name: "Tomatoes",
    category: "Produce",
    price: 2990,
    unit: "kg",
    orders: 45,
    currentStock: 150,
    lowStockThreshold: 50,
    rating: 4.8,
  },
  {
    id: "prod-2",
    name: "Onions",
    category: "Produce",
    price: 1490,
    unit: "kg",
    orders: 30,
    currentStock: 25,
    lowStockThreshold: 30,
    rating: 4.5,
  },
  {
    id: "prod-3",
    name: "Potatoes",
    category: "Produce",
    price: 1990,
    unit: "kg",
    orders: 25,
    currentStock: 0,
    lowStockThreshold: 40,
    rating: 4.3,
  },
  {
    id: "prod-4",
    name: "Chicken Breast",
    category: "Meat & Poultry",
    price: 8990,
    unit: "kg",
    orders: 38,
    currentStock: 75,
    lowStockThreshold: 20,
    rating: 4.9,
  },
  {
    id: "prod-5",
    name: "Ground Beef",
    category: "Meat & Poultry",
    price: 7490,
    unit: "kg",
    orders: 22,
    currentStock: 15,
    lowStockThreshold: 25,
    rating: 4.6,
  },
  {
    id: "prod-6",
    name: "Milk",
    category: "Dairy",
    price: 3290,
    unit: "liter",
    orders: 32,
    currentStock: 200,
    lowStockThreshold: 50,
    rating: 4.7,
  },
  {
    id: "prod-7",
    name: "Cheese",
    category: "Dairy",
    price: 5990,
    unit: "kg",
    orders: 18,
    currentStock: 35,
    lowStockThreshold: 15,
    rating: 4.4,
  },
  {
    id: "prod-8",
    name: "Rice",
    category: "Dry Goods",
    price: 2490,
    unit: "kg",
    orders: 15,
    currentStock: 500,
    lowStockThreshold: 100,
    rating: 4.2,
  },
  {
    id: "prod-9",
    name: "Pasta",
    category: "Dry Goods",
    price: 1790,
    unit: "kg",
    orders: 12,
    currentStock: 80,
    lowStockThreshold: 30,
    rating: 4.1,
  },
  {
    id: "prod-10",
    name: "Olive Oil",
    category: "Dry Goods",
    price: 9990,
    unit: "liter",
    orders: 28,
    currentStock: 45,
    lowStockThreshold: 20,
    rating: 4.8,
  },
];
