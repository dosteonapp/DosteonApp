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
  Mail,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function InvoiceDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // In a real app, you would fetch the invoice data based on the ID
  const invoice = invoices.find((i) => i.id === params.id) || invoices[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Invoice Details</h1>
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
              Invoice #{invoice.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={
                  invoice.status === "Paid"
                    ? "bg-green-500 text-white"
                    : invoice.status === "Pending"
                    ? "bg-blue-500 text-white"
                    : "bg-red-500 text-white"
                }
              >
                {invoice.status}
              </Badge>
              <span className="text-muted-foreground">
                Issued: {invoice.issueDate} • Due: {invoice.dueDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href="#">
                <Mail className="h-4 w-4 mr-2" />
                Send Reminder
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
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
              <div className="font-medium">{invoice.customer}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {invoice.customerContact}
              </div>
              <div className="text-sm text-muted-foreground">
                {invoice.customerAddress}
              </div>
              <Button size="sm" variant="link" className="px-0 mt-2" asChild>
                <Link href={`/dashboard/customers/${invoice.customerId}`}>
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
              <div className="font-medium">
                Payment Terms: {invoice.paymentTerms}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Payment Method: {invoice.paymentMethod}
              </div>
              {invoice.status === "Paid" && (
                <div className="text-sm text-muted-foreground">
                  Payment Date: {invoice.paymentDate}
                </div>
              )}
              {invoice.status === "Pending" && (
                <div className="text-sm text-green-600 font-medium mt-2">
                  {getDaysDifference(invoice.dueDate) > 0
                    ? `Due in ${getDaysDifference(invoice.dueDate)} days`
                    : "Due today"}
                </div>
              )}
              {invoice.status === "Overdue" && (
                <div className="text-sm text-red-600 font-medium mt-2">
                  {Math.abs(getDaysDifference(invoice.dueDate))} days overdue
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Invoice Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.timeline.map((event, index) => (
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
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>Products included in this invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
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
                <span>RWF {invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (18% VAT)</span>
                <span>RWF {invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>RWF {invoice.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>RWF {invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm">{invoice.notes}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Terms & Conditions</h3>
              <p className="text-sm">{invoice.terms}</p>
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
    case "Invoice Created":
      return <Clock className="h-5 w-5 text-muted-foreground" />;
    case "Invoice Sent":
      return <Mail className="h-5 w-5 text-blue-500" />;
    case "Payment Received":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

// Helper function to calculate days difference
function getDaysDifference(dateString: string): number {
  const today = new Date();
  const dueDate = new Date(dateString);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Sample data
const invoices = [
  {
    id: "INV-001",
    customer: "Bistro Bella",
    customerId: "customer-001",
    customerContact: "contact@bistrobella.com",
    customerAddress: "123 Main St, Kigali, Rwanda",
    issueDate: "May 3, 2023",
    dueDate: "Jun 2, 2023",
    amount: 245500,
    status: "Pending",
    paymentTerms: "Net 30",
    paymentMethod: "Bank Transfer",
    paymentDate: null,
    timeline: [
      {
        status: "Invoice Created",
        date: "May 3, 2023, 10:30 AM",
      },
      {
        status: "Invoice Sent",
        date: "May 3, 2023, 11:45 AM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Tomatoes",
        description: "Fresh Roma Tomatoes",
        unitPrice: 2500,
        quantity: 10,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Onions",
        description: "Red Onions",
        unitPrice: 1800,
        quantity: 8,
        unit: "kg",
      },
      {
        id: "item-3",
        name: "Potatoes",
        description: "Russet Potatoes",
        unitPrice: 2200,
        quantity: 15,
        unit: "kg",
      },
      {
        id: "item-4",
        name: "Milk",
        description: "Fresh Whole Milk",
        unitPrice: 1500,
        quantity: 20,
        unit: "liter",
      },
    ],
    subtotal: 97900,
    tax: 17622,
    deliveryFee: 5000,
    total: 120522,
    notes: "Thank you for your business. Please make payment by the due date.",
    terms:
      "Payment is due within 30 days. Late payments are subject to a 5% fee.",
  },
  {
    id: "INV-002",
    customer: "Cafe Milano",
    customerId: "customer-002",
    customerContact: "orders@cafemilano.com",
    customerAddress: "456 Park Ave, Kigali, Rwanda",
    issueDate: "May 2, 2023",
    dueDate: "Jun 1, 2023",
    amount: 320750,
    status: "Paid",
    paymentTerms: "Net 30",
    paymentMethod: "Mobile Money",
    paymentDate: "May 15, 2023",
    timeline: [
      {
        status: "Invoice Created",
        date: "May 2, 2023, 2:15 PM",
      },
      {
        status: "Invoice Sent",
        date: "May 2, 2023, 2:30 PM",
      },
      {
        status: "Payment Received",
        date: "May 15, 2023, 10:45 AM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Chicken Breast",
        description: "Fresh Boneless Chicken Breast",
        unitPrice: 9500,
        quantity: 15,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Ground Beef",
        description: "Premium Ground Beef, 80/20",
        unitPrice: 8200,
        quantity: 10,
        unit: "kg",
      },
    ],
    subtotal: 224500,
    tax: 40410,
    deliveryFee: 5000,
    total: 269910,
    notes: "Thank you for your prompt payment.",
    terms:
      "Payment is due within 30 days. Late payments are subject to a 5% fee.",
  },
];
