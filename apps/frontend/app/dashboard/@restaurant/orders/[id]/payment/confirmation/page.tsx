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
import { CheckCircle, Download, Home, Printer } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PaymentConfirmationPage({
  params,
}: PageProps) {
  const { id } = await params;

  // In a real app, you would fetch the order and payment data based on the ID
  const order = {
    id,
    supplier: "Fresh Farms Inc.",
    invoiceNumber: "INV-12345",
    paymentAmount: 102900,
    paymentDate: "May 4, 2023",
    paymentMethod: "DPO Group (Credit Card)",
    transactionId: "TXN-987654321",
    deliveryDate: "May 5, 2023",
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier</span>
                <span className="font-medium">{order.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number</span>
                <span className="font-medium">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">
                  RWF {order.paymentAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Date</span>
                <span className="font-medium">{order.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-medium">{order.transactionId}</span>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Expected Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryDate}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Confirmed
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
