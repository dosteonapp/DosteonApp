import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Printer,
  Download,
  ShoppingCart,
  Menu,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // In a real app, you would fetch the order data based on the ID
  const order = orders.find((o) => o.id === params.id) || orders[0];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Order Details</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getOrderStatusVariant(order.status)}>
                {order.status}
              </Badge>
              <span className="text-muted-foreground">
                Placed on {order.date}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href="#">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Link>
            </Button>
            {order.status === "Delivered" && (
              <Button asChild>
                <Link href={`/dashboard/orders/new?reorder=${order.id}`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Reorder
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-medium">{order.supplier}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {order.supplierContact}
              </div>
              <Button size="sm" variant="link" className="px-0 mt-2" asChild>
                <Link href={`/dashboard/suppliers/${order.supplierId}`}>
                  View Supplier
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-medium">{order.deliveryAddress}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Expected: {order.expectedDelivery}
              </div>
              {order.status === "In Transit" && (
                <div className="flex items-center gap-2 mt-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Estimated arrival: {order.estimatedArrival}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {getTimelineIcon(event.status)}
                    <div>
                      <div className="font-medium">{event.status}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Items included in this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        RWF {item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        RWF {(item.unitPrice * item.quantity).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-end">
            <div className="space-y-2 w-full max-w-[200px]">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>RWF {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span>RWF {order.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>RWF {order.total.toLocaleString()}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {order.status === "Delivered" && (
          <Card>
            <CardHeader>
              <CardTitle>Inventory Update</CardTitle>
              <CardDescription>
                This order has been added to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  Inventory was automatically updated on{" "}
                  {order.inventoryUpdateDate}
                </span>
              </div>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/inventory">View Inventory</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

// Update the getOrderStatusVariant function to use the new color scheme
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

// Helper function to get timeline icon
function getTimelineIcon(status: string) {
  switch (status) {
    case "Order Placed":
      return <ShoppingCart className="h-5 w-5 text-muted-foreground" />;
    case "Order Confirmed":
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    case "In Transit":
      return <Truck className="h-5 w-5 text-yellow-500" />;
    case "Delivered":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

// Sample data
const orders = [
  {
    id: "ORD-7891",
    date: "May 3, 2023",
    status: "Pending",
    supplier: "Fresh Farms Inc.",
    supplierId: "supplier-1",
    supplierContact: "+250 78 123 4567",
    deliveryAddress: "123 Restaurant Row, Kigali, Rwanda",
    expectedDelivery: "May 4, 2023, 9:00 AM - 12:00 PM",
    estimatedArrival: "N/A",
    timeline: [
      {
        status: "Order Placed",
        date: "May 3, 2023, 10:30 AM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Tomatoes",
        category: "Produce",
        unitPrice: 2500,
        quantity: 10,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Onions",
        category: "Produce",
        unitPrice: 1800,
        quantity: 8,
        unit: "kg",
      },
      {
        id: "item-3",
        name: "Potatoes",
        category: "Produce",
        unitPrice: 2200,
        quantity: 15,
        unit: "kg",
      },
      {
        id: "item-4",
        name: "Milk",
        category: "Dairy",
        unitPrice: 1500,
        quantity: 20,
        unit: "liter",
      },
    ],
    subtotal: 97900,
    deliveryFee: 5000,
    total: 102900,
    inventoryUpdateDate: "N/A",
  },
  {
    id: "ORD-7890",
    date: "May 2, 2023",
    status: "Confirmed",
    supplier: "Metro Meats",
    supplierId: "supplier-2",
    supplierContact: "+250 78 234 5678",
    deliveryAddress: "123 Restaurant Row, Kigali, Rwanda",
    expectedDelivery: "May 5, 2023, 1:00 PM - 3:00 PM",
    estimatedArrival: "N/A",
    timeline: [
      {
        status: "Order Placed",
        date: "May 2, 2023, 2:15 PM",
      },
      {
        status: "Order Confirmed",
        date: "May 2, 2023, 4:30 PM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Chicken Breast",
        category: "Meat & Poultry",
        unitPrice: 9500,
        quantity: 15,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Ground Beef",
        category: "Meat & Poultry",
        unitPrice: 8200,
        quantity: 10,
        unit: "kg",
      },
    ],
    subtotal: 224500,
    deliveryFee: 5000,
    total: 229500,
    inventoryUpdateDate: "N/A",
  },
  {
    id: "ORD-7889",
    date: "May 1, 2023",
    status: "In Transit",
    supplier: "Global Grocers",
    supplierId: "supplier-3",
    supplierContact: "+250 78 345 6789",
    deliveryAddress: "123 Restaurant Row, Kigali, Rwanda",
    expectedDelivery: "May 3, 2023, 9:00 AM - 12:00 PM",
    estimatedArrival: "May 3, 2023, 10:30 AM",
    timeline: [
      {
        status: "Order Placed",
        date: "May 1, 2023, 11:00 AM",
      },
      {
        status: "Order Confirmed",
        date: "May 1, 2023, 1:30 PM",
      },
      {
        status: "In Transit",
        date: "May 3, 2023, 8:15 AM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Rice",
        category: "Dry Goods",
        unitPrice: 2800,
        quantity: 25,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Pasta",
        category: "Dry Goods",
        unitPrice: 3200,
        quantity: 15,
        unit: "kg",
      },
      {
        id: "item-3",
        name: "Olive Oil",
        category: "Dry Goods",
        unitPrice: 12000,
        quantity: 5,
        unit: "liter",
      },
    ],
    subtotal: 178000,
    deliveryFee: 5000,
    total: 183000,
    inventoryUpdateDate: "N/A",
  },
  {
    id: "ORD-7888",
    date: "April 30, 2023",
    status: "Delivered",
    supplier: "Organic Supplies Co.",
    supplierId: "supplier-4",
    supplierContact: "+250 78 456 7890",
    deliveryAddress: "123 Restaurant Row, Kigali, Rwanda",
    expectedDelivery: "May 2, 2023, 9:00 AM - 12:00 PM",
    estimatedArrival: "Delivered",
    timeline: [
      {
        status: "Order Placed",
        date: "April 30, 2023, 9:45 AM",
      },
      {
        status: "Order Confirmed",
        date: "April 30, 2023, 10:30 AM",
      },
      {
        status: "In Transit",
        date: "May 2, 2023, 8:00 AM",
      },
      {
        status: "Delivered",
        date: "May 2, 2023, 11:15 AM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Organic Tomatoes",
        category: "Produce",
        unitPrice: 3500,
        quantity: 8,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Organic Lettuce",
        category: "Produce",
        unitPrice: 2800,
        quantity: 10,
        unit: "kg",
      },
      {
        id: "item-3",
        name: "Organic Carrots",
        category: "Produce",
        unitPrice: 2200,
        quantity: 12,
        unit: "kg",
      },
    ],
    subtotal: 83600,
    deliveryFee: 5000,
    total: 88600,
    inventoryUpdateDate: "May 2, 2023, 11:30 AM",
  },
];
