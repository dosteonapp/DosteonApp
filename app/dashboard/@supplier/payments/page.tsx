"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Menu, Download, Clock, AlertTriangle, CheckCircle2, Send, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("may")

  // Sample data
  const paymentCalendar = [
    {
      id: "pay-1",
      customer: "Bistro Bella",
      invoiceId: "INV-001",
      amount: 245500,
      date: "May 10, 2023",
      status: "upcoming",
      daysRemaining: 7,
      paymentTerms: "Net 30",
      month: "may"
    },
    {
      id: "pay-2",
      customer: "Cafe Milano",
      invoiceId: "INV-002",
      amount: 320750,
      date: "May 3, 2023",
      status: "due-today",
      daysRemaining: 0,
      paymentTerms: "Net 15",
      month: "may"
    },
    {
      id: "pay-3",
      customer: "The Green Plate",
      invoiceId: "INV-003",
      amount: 178250,
      date: "May 1, 2023",
      status: "overdue",
      daysRemaining: -2,
      paymentTerms: "Net 15",
      month: "may"
    },
    {
      id: "pay-4",
      customer: "Spice Garden",
      invoiceId: "INV-004",
      amount: 210000,
      date: "May 15, 2023",
      status: "upcoming",
      daysRemaining: 12,
      paymentTerms: "Net 30",
      month: "may"
    },
    {
      id: "pay-5",
      customer: "Taste of Asia",
      invoiceId: "INV-005",
      amount: 145500,
      date: "April 29, 2023",
      status: "paid",
      paidDate: "April 28, 2023",
      paymentTerms: "Full Upfront",
      paymentMethod: "Bank Transfer",
      month: "may"
    },
    {
      id: "pay-6",
      customer: "Bistro Bella",
      invoiceId: "INV-006",
      amount: 265000,
      date: "June 5, 2023",
      status: "upcoming",
      daysRemaining: 33,
      paymentTerms: "Net 30",
      month: "june"
    },
    {
      id: "pay-7",
      customer: "Cafe Milano",
      invoiceId: "INV-007",
      amount: 310000,
      date: "June 12, 2023",
      status: "upcoming",
      daysRemaining: 40,
      paymentTerms: "Net 15",
      month: "june"
    },
  ]

  const invoices = [
    {
      id: "INV-001",
      customer: "Bistro Bella",
      issueDate: "April 10, 2023",
      dueDate: "May 10, 2023",
      amount: 245500,
      status: "Pending",
      paymentTerms: "Net 30"
    },
    {
      id: "INV-002",
      customer: "Cafe Milano",
      issueDate: "April 18, 2023",
      dueDate: "May 3, 2023",
      amount: 320750,
      status: "Pending",
      paymentTerms: "Net 15"
    },
    {
      id: "INV-003",
      customer: "The Green Plate",
      issueDate: "April 16, 2023",
      dueDate: "May 1, 2023",
      amount: 178250,
      status: "Overdue",
      paymentTerms: "Net 15"
    },
    {
      id: "INV-004",
      customer: "Spice Garden",
      issueDate: "April 15, 2023",
      dueDate: "May 15, 2023",
      amount: 210000,
      status: "Pending",
      paymentTerms: "Net 30"
    },
    {
      id: "INV-005",
      customer: "Taste of Asia",
      issueDate: "April 29, 2023",
      dueDate: "April 29, 2023",
      amount: 145500,
      status: "Paid",
      paymentTerms: "Full Upfront"
    },
    {
      id: "INV-006",
      customer: "Organic Eats",
      issueDate: "April 5, 2023",
      dueDate: "April 20, 2023",
      amount: 189000,
      status: "Paid",
      paymentTerms: "Net 15"
    },
    {
      id: "INV-007",
      customer: "Fresh Bites",
      issueDate: "April 8, 2023",
      dueDate: "April 23, 2023",
      amount: 225000,
      status: "Paid",
      paymentTerms: "Net 15"
    },
  ]

  const paymentTerms = [
    {
      id: "term-1",
      name: "Net 30",
      description: "Full payment due 30 days after invoice date",
      features: ["30-day payment window", "No upfront payment", "No fees"],
      isDefault: true,
      usage: 45
    },
    {
      id: "term-2",
      name: "Net 15",
      description: "Full payment due 15 days after invoice date",
      features: ["15-day payment window", "No upfront payment", "No fees"],
      isDefault: false,
      usage: 30
    },
    {
      id: "term-3",
      name: "Partial Upfront",
      description: "50% payment upfront, 50% due 15 days after delivery",
      features: ["Split payment", "Reduced risk", "15-day window for remainder"],
      isDefault: false,
      usage: 15
    },
    {
      id: "term-4",
      name: "Full Upfront",
      description: "100% payment required before order fulfillment",
      features: ["Immediate payment", "Discount eligible", "No credit risk"],
      isDefault: false,
      usage: 10
    },
    {
      id: "term-5",
      name: "Buy Now, Pay Later",
      description: "Full payment split into 4 equal installments over 6 weeks",
      features: ["No interest", "Powered by DPO Group", "Automatic installments"],
      isDefault: false,
      usage: 5
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Payments</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment Management</h1>
            <p className="text-muted-foreground">Track, manage, and optimize your payment collection</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/dashboard/payments/settings">
                <FileText className="mr-2 h-4 w-4" />
                Payment Terms
              </Link>
            </Button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 4,250,000</div>
              <p className="text-xs text-muted-foreground">Across 18 invoices</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 3,850,000</div>
              <p className="text-xs text-muted-foreground">12 invoices paid</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 1,250,000</div>
              <p className="text-xs text-muted-foreground">4 invoices due</p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF 750,000</div>
              <p className="text-xs text-muted-foreground">2 invoices overdue</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Payment Calendar</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payment-terms">Payment Terms</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Payment Calendar</h2>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="may">May 2023</SelectItem>
                  <SelectItem value="june">June 2023</SelectItem>
                  <SelectItem value="july">July 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Track payments due in the selected month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentCalendar
                    .filter(payment => payment.month === selectedMonth)
                    .map((payment) => (
                    <div key={payment.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-1 ${
                          payment.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 
                          payment.status === 'due-today' ? 'bg-amber-100 text-amber-700' : 
                          payment.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {payment.status === 'upcoming' ? 
                            <Clock className="h-3 w-3" /> : 
                            payment.status === 'due-today' ? 
                            <AlertTriangle className="h-3 w-3" /> : 
                            payment.status === 'overdue' ?
                            <AlertTriangle className="h-3 w-3" /> :
                            <CheckCircle2 className="h-3 w-3" />
                          }
                        </div>
                        <div>
                          <h3 className="font-medium">{payment.customer}</h3>
                          <p className="text-sm text-muted-foreground">
                            Invoice #{payment.invoiceId} • {payment.date}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {payment.paymentTerms}
                            </Badge>
                            {payment.paymentMethod && (
                              <Badge variant="outline" className="text-xs">
                                {payment.paymentMethod}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">RWF {payment.amount.toLocaleString()}</div>
                        <div className={`text-xs ${
                          payment.status === 'upcoming' ? 'text-blue-600' : 
                          payment.status === 'due-today' ? 'text-amber-600' : 
                          payment.status === 'overdue' ? 'text-red-600' :
                          'text-green-600'
                        }`}>
                          {payment.status === 'upcoming' ? 'Due in ' + payment.daysRemaining + ' days' : 
                           payment.status === 'due-today' ? 'Due today' : 
                           payment.status === 'overdue' ? 'Overdue by ' + Math.abs(payment.daysRemaining) + ' days' :
                           'Paid on ' + payment.paidDate}
                        </div>
                        {payment.status !== 'paid' && (
                          <div className="mt-2">
                            <Button size="sm  && (
                          <div className="mt-2\">
                            <Button size="sm" variant="outline" className="mr-2">
                              <Send className="mr-2 h-3 w-3" />
                              Send Reminder
                            </Button>
                            <Button size="sm">
                              Record Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Invoice Management</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input type="search" placeholder="Search invoices..." className="w-[250px]" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Terms</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices
                        .filter(invoice => statusFilter === "all" || invoice.status.toLowerCase() === statusFilter)
                        .map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.customer}</TableCell>
                          <TableCell>{invoice.issueDate}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell>RWF {invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {invoice.paymentTerms}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                invoice.status === "Paid" ? "outline" : 
                                invoice.status === "Pending" ? "outline" : 
                                "destructive"
                              }
                              className={
                                invoice.status === "Paid" ? "bg-green-50 text-green-700" : 
                                invoice.status === "Pending" ? "bg-blue-50 text-blue-700" : 
                                ""
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/payments/invoices/${invoice.id}`}>View</Link>
                              </Button>
                              {invoice.status !== "Paid" && (
                                <Button size="sm">Record Payment</Button>
                              )}
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

          <TabsContent value="payment-terms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Payment Terms</CardTitle>
                <CardDescription>Payment options you offer to your customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {paymentTerms.map((term) => (
                    <div key={term.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{term.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{term.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {term.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={term.isDefault ? "bg-green-50 text-green-700" : ""}
                        >
                          {term.isDefault ? "Default" : "Optional"}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span>Customer Usage</span>
                          <span>{term.usage}%</span>
                        </div>
                        <Progress value={term.usage} className="h-2 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/dashboard/payments/terms/new">
                    Add New Payment Term
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
                <CardDescription>Insights into your payment collection performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Average Days to Payment</h3>
                    <div className="text-3xl font-bold">18.5 days</div>
                    <p className="text-sm text-muted-foreground mt-1">-2.3 days from last month</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Collection Rate</h3>
                    <div className="text-3xl font-bold">94.2%</div>
                    <p className="text-sm text-muted-foreground mt-1">+1.5% from last month</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Payment Term Distribution</h3>
                    <div className="space-y-2 mt-4">
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>Net 30</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>Net 15</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>Partial Upfront</span>
                          <span>15%</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>Full Upfront</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Payment Method Distribution</h3>
                    <div className="space-y-2 mt-4">
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>Bank Transfer</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>Mobile Money</span>
                          <span>25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>Credit Card</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>BNPL</span>
                          <span>5%</span>
                        </div>
                        <Progress value={5} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
