"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CreditCard, Download, Menu, Wallet } from "lucide-react"
import Link from "next/link"

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const [paymentMethod, setPaymentMethod] = useState("dpo")
  const [splitPayment, setSplitPayment] = useState(false)
  const [firstPaymentAmount, setFirstPaymentAmount] = useState("50000")
  const [isProcessing, setIsProcessing] = useState(false)

  // In a real app, you would fetch the order data based on the ID
  const order = orders.find((o) => o.id === params.id) || orders[0]

  const handlePayment = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      // Redirect to confirmation page
      window.location.href = `/restaurant/orders/${params.id}/payment/confirmation`
    }, 2000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Order Payment</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/restaurant/orders/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment for Order #{order.id}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getOrderStatusVariant(order.status)}>{order.status}</Badge>
              <span className="text-muted-foreground">Invoice received on {order.invoiceDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href="#">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 border rounded-md p-4">
                    <RadioGroupItem value="dpo" id="dpo" />
                    <Label htmlFor="dpo" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      DPO Group (Credit/Debit Card)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-4">
                    <RadioGroupItem value="mtn" id="mtn" />
                    <Label htmlFor="mtn" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      MTN Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-4">
                    <RadioGroupItem value="airtel" id="airtel" />
                    <Label htmlFor="airtel" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Airtel Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-4">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank Transfer
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex items-center space-x-2 pt-4">
                  <Switch id="split-payment" checked={splitPayment} onCheckedChange={setSplitPayment} />
                  <Label htmlFor="split-payment">Split Payment</Label>
                </div>

                {splitPayment && (
                  <div className="mt-4 space-y-4 border rounded-md p-4 bg-muted/50">
                    <div>
                      <Label htmlFor="first-payment">First Payment Amount (RWF)</Label>
                      <Input
                        id="first-payment"
                        type="number"
                        value={firstPaymentAmount}
                        onChange={(e) => setFirstPaymentAmount(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Remaining: RWF {(order.total - Number.parseInt(firstPaymentAmount || "0")).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="payment-date">Second Payment Due Date</Label>
                      <Select defaultValue="3days">
                        <SelectTrigger id="payment-date" className="mt-1">
                          <SelectValue placeholder="Select due date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3days">3 Days (May 6, 2023)</SelectItem>
                          <SelectItem value="7days">7 Days (May 10, 2023)</SelectItem>
                          <SelectItem value="14days">14 Days (May 17, 2023)</SelectItem>
                          <SelectItem value="30days">30 Days (June 2, 2023)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Timeline</CardTitle>
                <CardDescription>Track your payment progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Order Placed</span>
                      <span>May 3, 2023</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Invoice Received</span>
                      <span>May 4, 2023</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Payment</span>
                      <span>Today</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Delivery</span>
                      <span>Scheduled: May 5, 2023</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Supplier</span>
                    <span>{order.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Invoice Number</span>
                    <span>{order.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Invoice Date</span>
                    <span>{order.invoiceDate}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>RWF {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>RWF {order.deliveryFee.toLocaleString()}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>RWF {order.tax.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>RWF {order.total.toLocaleString()}</span>
                  </div>
                </div>

                {splitPayment && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>First Payment</span>
                      <span>RWF {Number.parseInt(firstPaymentAmount || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Balance</span>
                      <span>RWF {(order.total - Number.parseInt(firstPaymentAmount || "0")).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing
                    ? "Processing..."
                    : splitPayment
                      ? `Pay RWF ${Number.parseInt(firstPaymentAmount || "0").toLocaleString()} Now`
                      : `Pay RWF ${order.total.toLocaleString()}`}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function to get badge variant based on order status
function getOrderStatusVariant(status: string) {
  switch (status) {
    case "Delivered":
      return "success"
    case "In Transit":
      return "warning"
    case "Confirmed":
      return "default"
    case "Pending":
      return "secondary"
    case "Invoice Received":
      return "outline"
    default:
      return "outline"
  }
}

// Sample data
const orders = [
  {
    id: "ORD-7891",
    status: "Invoice Received",
    supplier: "Fresh Farms Inc.",
    invoiceNumber: "INV-12345",
    invoiceDate: "May 4, 2023",
    subtotal: 97900,
    deliveryFee: 5000,
    tax: 0,
    total: 102900,
  },
  {
    id: "ORD-7890",
    status: "Invoice Received",
    supplier: "Metro Meats",
    invoiceNumber: "INV-67890",
    invoiceDate: "May 3, 2023",
    subtotal: 224500,
    deliveryFee: 5000,
    tax: 0,
    total: 229500,
  },
]
