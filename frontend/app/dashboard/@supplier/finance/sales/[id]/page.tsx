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
  Menu,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function SaleDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // In a real app, you would fetch the sale data based on the ID
  const sale = sales.find((s) => s.id === params.id) || sales[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Sale Details</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/finance">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Finance
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sale #{sale.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={
                  sale.status === "Completed"
                    ? "bg-green-500 text-white"
                    : sale.status === "Processing"
                    ? "bg-blue-500 text-white"
                    : "bg-red-500 text-white"
                }
              >
                {sale.status}
              </Badge>
              <span className="text-muted-foreground">
                Order #{sale.orderId} • {sale.date}
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
            <Button variant="outline" asChild>
              <Link href="#">
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-medium">{sale.customer}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {sale.customerContact}
              </div>
              <Button size="sm" variant="link" className="px-0 mt-2" asChild>
                <Link href={`/dashboard/customers/${sale.customerId}`}>
                  View Customer
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-medium">{sale.paymentMethod}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Transaction ID: {sale.transactionId}
              </div>
              <div className="text-sm text-muted-foreground">
                Payment Date: {sale.paymentDate || "Pending"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Sale Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sale.timeline.map((event, index) => (
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
            <CardTitle>Sale Items</CardTitle>
            <CardDescription>Products included in this sale</CardDescription>
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
                  {sale.items.map((item) => (
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
                <span>RWF {sale.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (18% VAT)</span>
                <span>RWF {sale.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>RWF {sale.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>RWF {sale.total.toLocaleString()}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
            <CardDescription>
              Detailed financial information for this sale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Revenue Breakdown</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Gross Revenue:
                    </span>
                    <span>RWF {sale.subtotal.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      Tax Collected:
                    </span>
                    <span>RWF {sale.tax.toLocaleString()}</span>
                    <span className="text-muted-foreground">Net Revenue:</span>
                    <span className="font-medium">
                      RWF {(sale.subtotal + sale.tax).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Cost Breakdown</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Product Cost:</span>
                    <span>RWF {sale.productCost.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      Delivery Cost:
                    </span>
                    <span>RWF {sale.deliveryCost.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      Transaction Fees:
                    </span>
                    <span>RWF {sale.transactionFees.toLocaleString()}</span>
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-medium">
                      RWF {sale.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Profit:</span>
                  <span className="font-bold text-lg text-green-600">
                    RWF {(sale.netRevenue - sale.totalCost).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">
                    Profit Margin:
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(
                      ((sale.netRevenue - sale.totalCost) / sale.netRevenue) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="mt-3 p-3 bg-muted/30 rounded-md text-sm">
                  <h4 className="font-medium mb-1">
                    How Profit is Calculated:
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span>Net Revenue:</span>
                    <span>RWF {sale.netRevenue.toLocaleString()}</span>
                    <span>- Total Cost:</span>
                    <span>RWF {sale.totalCost.toLocaleString()}</span>
                    <span className="font-medium">= Profit:</span>
                    <span className="font-medium">
                      RWF {(sale.netRevenue - sale.totalCost).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    Net Revenue includes product subtotal and tax collected.
                    Total Cost includes product cost, delivery cost, and
                    transaction fees.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Helper function to get timeline icon
function getTimelineIcon(status: string) {
  switch (status) {
    case "Order Received":
      return <Clock className="h-5 w-5 text-muted-foreground" />;
    case "Payment Confirmed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "Order Processed":
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    case "Delivered":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

// Sample data
const sales = [
  {
    id: "sale-001",
    date: "May 3, 2023",
    customer: "Bistro Bella",
    customerId: "customer-001",
    customerContact: "+250 78 123 4567",
    orderId: "ORD-7891",
    amount: 245500,
    status: "Processing",
    paymentMethod: "Bank Transfer",
    transactionId: "TRX-12345",
    paymentDate: null,
    timeline: [
      {
        status: "Order Received",
        date: "May 3, 2023, 10:30 AM",
      },
      {
        status: "Order Processed",
        date: "May 3, 2023, 11:45 AM",
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
    tax: 17622,
    deliveryFee: 5000,
    total: 120522,
    netRevenue: 97900 + 17622, // subtotal + tax
    productCost: 65000,
    deliveryCost: 3500,
    transactionFees: 2058,
    totalCost: 70558,
  },
  {
    id: "sale-002",
    date: "May 2, 2023",
    customer: "Cafe Milano",
    customerId: "customer-002",
    customerContact: "+250 78 234 5678",
    orderId: "ORD-7890",
    amount: 320750,
    status: "Completed",
    paymentMethod: "Mobile Money",
    transactionId: "TRX-12346",
    paymentDate: "May 2, 2023, 5:30 PM",
    timeline: [
      {
        status: "Order Received",
        date: "May 2, 2023, 2:15 PM",
      },
      {
        status: "Payment Confirmed",
        date: "May 2, 2023, 2:30 PM",
      },
      {
        status: "Order Processed",
        date: "May 2, 2023, 3:45 PM",
      },
      {
        status: "Delivered",
        date: "May 2, 2023, 5:30 PM",
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
    tax: 40410,
    deliveryFee: 5000,
    total: 269910,
    netRevenue: 224500 + 40410, // subtotal + tax
    productCost: 152000,
    deliveryCost: 3500,
    transactionFees: 4590,
    totalCost: 160090,
  },
];
