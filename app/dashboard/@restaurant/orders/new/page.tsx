"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Trash2, Menu, Star, StarHalf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NewOrderPage() {
  const router = useRouter();
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItemToOrder = (item: Product) => {
    const existingItem = orderItems.find((i) => i.id === item.id);

    if (existingItem) {
      setOrderItems(
        orderItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: 1,
        },
      ]);
    }
  };

  const removeItemFromOrder = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0 || !selectedSupplier) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard/orders");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">New Order</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Order</h1>
            <p className="text-muted-foreground">
              Create a new procurement order
            </p>
          </div>
        </div>

        {!selectedSupplier && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Recommended Suppliers</CardTitle>
              <CardDescription>
                Based on your order history and inventory needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{supplier.name}</h3>
                        <div className="flex">
                          {Array.from({
                            length: Math.floor(supplier.rating),
                          }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-primary text-primary"
                            />
                          ))}
                          {supplier.rating % 1 !== 0 && (
                            <StarHalf className="h-4 w-4 fill-primary text-primary" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {supplier.reason}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {supplier.categories.map((category) => (
                          <Badge
                            key={category}
                            variant="outline"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedSupplier(supplier.id)}
                      >
                        Select Supplier
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Supplier</CardTitle>
                <CardDescription>
                  Choose a supplier for this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedSupplier}
                  onValueChange={setSelectedSupplier}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedSupplier && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Products</CardTitle>
                  <CardDescription>
                    Browse and add products to your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <div className="flex items-center justify-between mb-4">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="produce">Produce</TabsTrigger>
                        <TabsTrigger value="meat">Meat & Poultry</TabsTrigger>
                        <TabsTrigger value="dairy">Dairy</TabsTrigger>
                        <TabsTrigger value="dry-goods">Dry Goods</TabsTrigger>
                      </TabsList>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search products..."
                          className="pl-8 w-[200px]"
                        />
                      </div>
                    </div>

                    <TabsContent value="all" className="m-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <Card key={product.id} className="overflow-hidden">
                            <div className="flex items-center p-4">
                              <div className="flex-1">
                                <h3 className="font-medium">{product.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-muted-foreground">
                                    RWF {product.price.toLocaleString()} /{" "}
                                    {product.unit}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {product.category}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addItemToOrder(product)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Other tabs would filter products by category */}
                    <TabsContent value="produce" className="m-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products
                          .filter((p) => p.category === "Produce")
                          .map((product) => (
                            <Card key={product.id} className="overflow-hidden">
                              <div className="flex items-center p-4">
                                <div className="flex-1">
                                  <h3 className="font-medium">
                                    {product.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-muted-foreground">
                                      RWF {product.price.toLocaleString()} /{" "}
                                      {product.unit}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {product.category}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => addItemToOrder(product)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>

                    {/* Similar content for other tabs */}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Review your order before submitting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    ${item.price.toFixed(2)} / {item.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={() =>
                                      updateItemQuantity(
                                        item.id,
                                        item.quantity - 1
                                      )
                                    }
                                  >
                                    -
                                  </Button>
                                  <span className="w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={() =>
                                      updateItemQuantity(
                                        item.id,
                                        item.quantity + 1
                                      )
                                    }
                                  >
                                    +
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                ${(item.price * item.quantity).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeItemFromOrder(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>RWF {calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>RWF {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={
                    orderItems.length === 0 || !selectedSupplier || isSubmitting
                  }
                  onClick={handleSubmitOrder}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

// Sample data
const suppliers = [
  { id: "supplier-1", name: "Fresh Farms Inc." },
  { id: "supplier-2", name: "Metro Meats" },
  { id: "supplier-3", name: "Global Grocers" },
  { id: "supplier-4", name: "Organic Supplies Co." },
  { id: "supplier-5", name: "Dairy Delights" },
];

const products: Product[] = [
  {
    id: "prod-1",
    name: "Tomatoes",
    category: "Produce",
    price: 2.99,
    unit: "kg",
  },
  {
    id: "prod-2",
    name: "Onions",
    category: "Produce",
    price: 1.49,
    unit: "kg",
  },
  {
    id: "prod-3",
    name: "Potatoes",
    category: "Produce",
    price: 1.99,
    unit: "kg",
  },
  {
    id: "prod-4",
    name: "Chicken Breast",
    category: "Meat & Poultry",
    price: 8.99,
    unit: "kg",
  },
  {
    id: "prod-5",
    name: "Ground Beef",
    category: "Meat & Poultry",
    price: 7.49,
    unit: "kg",
  },
  { id: "prod-6", name: "Milk", category: "Dairy", price: 3.29, unit: "liter" },
  { id: "prod-7", name: "Cheese", category: "Dairy", price: 5.99, unit: "kg" },
  {
    id: "prod-8",
    name: "Rice",
    category: "Dry Goods",
    price: 2.49,
    unit: "kg",
  },
  {
    id: "prod-9",
    name: "Pasta",
    category: "Dry Goods",
    price: 1.79,
    unit: "kg",
  },
  {
    id: "prod-10",
    name: "Olive Oil",
    category: "Dry Goods",
    price: 9.99,
    unit: "liter",
  },
  {
    id: "prod-11",
    name: "Bell Peppers",
    category: "Produce",
    price: 3.49,
    unit: "kg",
  },
  {
    id: "prod-12",
    name: "Carrots",
    category: "Produce",
    price: 1.29,
    unit: "kg",
  },
];

// Sample data for recommended suppliers
const recommendedSuppliers = [
  {
    id: "supplier-1",
    name: "Fresh Farms Inc.",
    rating: 4.5,
    categories: ["Produce", "Dairy"],
    reason: "Low stock items: Tomatoes, Onions",
  },
  {
    id: "supplier-4",
    name: "Organic Supplies Co.",
    rating: 5.0,
    categories: ["Produce", "Dry Goods"],
    reason: "Highest quality rating for produce",
  },
  {
    id: "supplier-6",
    name: "Kigali Fresh Produce",
    rating: 4.5,
    categories: ["Produce"],
    reason: "Fast delivery, 25 min avg. response time",
  },
];
