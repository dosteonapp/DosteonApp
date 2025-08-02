"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Menu,
  MessageSquare,
  Pin,
  PinOff,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SuppliersDashboardPage() {
  const [pinnedSuppliers, setPinnedSuppliers] = useState<string[]>([
    "supplier-1",
    "supplier-4",
  ]);

  const togglePin = (supplierId: string) => {
    if (pinnedSuppliers.includes(supplierId)) {
      setPinnedSuppliers(pinnedSuppliers.filter((id) => id !== supplierId));
    } else {
      setPinnedSuppliers([...pinnedSuppliers, supplierId]);
    }
  };

  // Sort suppliers to show pinned ones first
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    const aIsPinned = pinnedSuppliers.includes(a.id);
    const bIsPinned = pinnedSuppliers.includes(b.id);

    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Suppliers Dashboard</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Suppliers Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your supplier relationships
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/dashboard/suppliers/discover">
                Discover New Suppliers
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Suppliers</TabsTrigger>
                <TabsTrigger value="pinned">Preferred Suppliers</TabsTrigger>
                <TabsTrigger value="recent">Recent Orders</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <Switch id="show-delivery" />
                <Label htmlFor="show-delivery">Show upcoming deliveries</Label>
              </div>
            </div>

            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedSuppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    isPinned={pinnedSuppliers.includes(supplier.id)}
                    onTogglePin={() => togglePin(supplier.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pinned" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedSuppliers
                  .filter((supplier) => pinnedSuppliers.includes(supplier.id))
                  .map((supplier) => (
                    <SupplierCard
                      key={supplier.id}
                      supplier={supplier}
                      isPinned={true}
                      onTogglePin={() => togglePin(supplier.id)}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedSuppliers
                  .filter((supplier) => supplier.recentOrder)
                  .sort((a, b) => {
                    const dateA = new Date(a.recentOrder?.date || "").getTime();
                    const dateB = new Date(b.recentOrder?.date || "").getTime();
                    return dateB - dateA;
                  })
                  .map((supplier) => (
                    <SupplierCard
                      key={supplier.id}
                      supplier={supplier}
                      isPinned={pinnedSuppliers.includes(supplier.id)}
                      onTogglePin={() => togglePin(supplier.id)}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

interface SupplierCardProps {
  supplier: Supplier;
  isPinned: boolean;
  onTogglePin: () => void;
}

function SupplierCard({ supplier, isPinned, onTogglePin }: SupplierCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src={supplier.logo || "/placeholder.svg"}
              alt={supplier.name}
            />
            <AvatarFallback>
              {supplier.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{supplier.name}</CardTitle>
            <div className="flex flex-wrap gap-1 mt-1">
              {supplier.categories.slice(0, 2).map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {supplier.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{supplier.categories.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePin}
          className="h-8 w-8"
        >
          {isPinned ? (
            <Pin className="h-4 w-4 text-primary" />
          ) : (
            <PinOff className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {supplier.recentOrder && (
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium">Recent Order</div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{supplier.recentOrder.date}</span>
              </div>
              <Badge
                variant={getOrderStatusVariant(supplier.recentOrder.status)}
              >
                {supplier.recentOrder.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {supplier.recentOrder.summary}
            </div>
          </div>
        )}

        {supplier.nextDelivery && (
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium">Next Delivery</div>
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{supplier.nextDelivery}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/dashboard/orders/new?supplier=${supplier.id}`}>
            <ShoppingCart className="mr-1 h-3.5 w-3.5" />
            Order
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/dashboard/suppliers/${supplier.id}`}>
            <Truck className="mr-1 h-3.5 w-3.5" />
            Track
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/dashboard/suppliers/${supplier.id}?tab=order-history`}>
            <Clock className="mr-1 h-3.5 w-3.5" />
            History
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/dashboard/suppliers/${supplier.id}/chat`}>
            <MessageSquare className="mr-1 h-3.5 w-3.5" />
            Chat
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to get badge variant based on order status
function getOrderStatusVariant(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-secondary-500 text-secondary-foreground hover:bg-secondary-500/90";
    case "In Transit":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "Confirmed":
      return "bg-green-500 text-white hover:bg-green-600";
    case "Pending":
      return "bg-red-500 text-white hover:bg-red-600";
    case "Cancelled":
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    default:
      return "outline";
  }
}

// Types
interface Supplier {
  id: string;
  name: string;
  logo: string;
  categories: string[];
  recentOrder?: {
    date: string;
    status: string;
    summary: string;
  };
  nextDelivery?: string;
}

// Sample data
const suppliers: Supplier[] = [
  {
    id: "supplier-1",
    name: "Fresh Farms Inc.",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Produce", "Dairy"],
    recentOrder: {
      date: "Today, 10:30 AM",
      status: "Pending",
      summary: "10kg Tomatoes, 8kg Onions, 15kg Potatoes",
    },
    nextDelivery: "Tomorrow, 9:00 AM - 12:00 PM",
  },
  {
    id: "supplier-2",
    name: "Metro Meats",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Meat & Poultry"],
    recentOrder: {
      date: "Yesterday, 2:15 PM",
      status: "Confirmed",
      summary: "15kg Chicken Breast, 10kg Ground Beef",
    },
    nextDelivery: "May 5, 2023, 1:00 PM - 3:00 PM",
  },
  {
    id: "supplier-3",
    name: "Global Grocers",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Produce", "Dry Goods", "Beverages"],
    recentOrder: {
      date: "May 1, 2023",
      status: "In Transit",
      summary: "25kg Rice, 15kg Pasta, 5L Olive Oil",
    },
    nextDelivery: "Today, 1:00 PM - 3:00 PM",
  },
  {
    id: "supplier-4",
    name: "Organic Supplies Co.",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Produce", "Dry Goods"],
    recentOrder: {
      date: "April 30, 2023",
      status: "Delivered",
      summary: "8kg Organic Tomatoes, 10kg Organic Lettuce",
    },
  },
  {
    id: "supplier-5",
    name: "Dairy Delights",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Dairy"],
    nextDelivery: "May 6, 2023, 10:00 AM - 2:00 PM",
  },
  {
    id: "supplier-6",
    name: "Kigali Fresh Produce",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Produce"],
    recentOrder: {
      date: "April 28, 2023",
      status: "Delivered",
      summary: "12kg Tomatoes, 8kg Carrots, 5kg Bell Peppers",
    },
  },
  {
    id: "supplier-7",
    name: "Rwanda Meat Suppliers",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Meat & Poultry"],
    nextDelivery: "May 7, 2023, 9:00 AM - 11:00 AM",
  },
  {
    id: "supplier-8",
    name: "Bakery Essentials",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Flour", "Sugar", "Baking Supplies"],
    recentOrder: {
      date: "April 25, 2023",
      status: "Delivered",
      summary: "50kg Flour, 25kg Sugar, 10kg Butter",
    },
  },
  {
    id: "supplier-9",
    name: "Spice Traders",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Spices", "Herbs", "Seasonings"],
    nextDelivery: "May 10, 2023, 2:00 PM - 4:00 PM",
  },
  {
    id: "supplier-10",
    name: "Beverage Distributors",
    logo: "/placeholder.svg?height=40&width=40",
    categories: ["Beverages", "Soft Drinks", "Alcohol"],
    recentOrder: {
      date: "April 22, 2023",
      status: "Delivered",
      summary: "24 Bottles Soda, 12 Bottles Wine, 48 Bottles Water",
    },
  },
];
