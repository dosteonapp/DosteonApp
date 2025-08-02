import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Menu,
  FileText,
  Receipt,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function ExpenseDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // In a real app, you would fetch the expense data based on the ID
  const expense = expenses.find((e) => e.id === params.id) || expenses[0];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Expense Details</h1>
        </div>
      </header>
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
              Expense #{expense.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={
                  expense.status === "Paid"
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
                }
              >
                {expense.status}
              </Badge>
              <span className="text-muted-foreground">
                Date: {expense.date}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href="#">
                <Receipt className="h-4 w-4 mr-2" />
                View Receipt
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense Information</CardTitle>
              <CardDescription>Details about this expense</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{expense.description}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{expense.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    RWF {expense.amount.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium">{expense.paymentMethod}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Reference Number
                  </p>
                  <p className="font-medium">
                    {expense.referenceNumber || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Paid By</p>
                  <p className="font-medium">{expense.paidBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>Details about the vendor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vendor Name</p>
                <p className="font-medium">{expense.vendor.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{expense.vendor.contact}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{expense.vendor.address}</p>
              </div>
              {expense.vendor.taxId && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tax ID</p>
                  <p className="font-medium">{expense.vendor.taxId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tax & Accounting</CardTitle>
            <CardDescription>Tax and accounting information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Tax Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Tax Category:</span>
                  <span>{expense.taxInfo.category}</span>
                  <span className="text-muted-foreground">Tax Deductible:</span>
                  <span>{expense.taxInfo.deductible ? "Yes" : "No"}</span>
                  <span className="text-muted-foreground">VAT Amount:</span>
                  <span>RWF {expense.taxInfo.vatAmount.toLocaleString()}</span>
                  <span className="text-muted-foreground">VAT Rate:</span>
                  <span>{expense.taxInfo.vatRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Accounting Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Account:</span>
                  <span>{expense.accountingInfo.account}</span>
                  <span className="text-muted-foreground">Cost Center:</span>
                  <span>{expense.accountingInfo.costCenter}</span>
                  <span className="text-muted-foreground">Project:</span>
                  <span>{expense.accountingInfo.project || "N/A"}</span>
                  <span className="text-muted-foreground">Fiscal Year:</span>
                  <span>{expense.accountingInfo.fiscalYear}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm">
                {expense.notes || "No notes available."}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Attachments</h3>
              {expense.attachments.length > 0 ? (
                <div className="space-y-2">
                  {expense.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{attachment.name}</span>
                      <Button size="sm" variant="ghost" className="ml-auto">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No attachments available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expense.approvalHistory.map((event, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">{event.status}</div>
                    <div className="text-sm text-muted-foreground">
                      By {event.by} on {event.date}
                    </div>
                    {event.notes && (
                      <div className="text-sm mt-1">{event.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Sample data
const expenses = [
  {
    id: "exp-001",
    date: "May 5, 2023",
    description: "Warehouse rent",
    category: "Rent",
    amount: 850000,
    status: "Paid",
    paymentMethod: "Bank Transfer",
    referenceNumber: "TRX-12347",
    paidBy: "John Doe",
    vendor: {
      name: "Kigali Properties Ltd",
      contact: "+250 78 123 4567",
      address: "100 Commercial Ave, Kigali, Rwanda",
      taxId: "RW12345678",
    },
    taxInfo: {
      category: "Operating Expense",
      deductible: true,
      vatAmount: 129661,
      vatRate: 18,
    },
    accountingInfo: {
      account: "Rent Expense",
      costCenter: "Operations",
      project: null,
      fiscalYear: "2023",
    },
    notes: "Monthly warehouse rent payment for May 2023.",
    attachments: [
      {
        name: "Rent_Receipt_May_2023.pdf",
        url: "#",
      },
      {
        name: "Lease_Agreement.pdf",
        url: "#",
      },
    ],
    approvalHistory: [
      {
        status: "Submitted for Approval",
        by: "Jane Smith",
        date: "May 4, 2023, 9:30 AM",
        notes: null,
      },
      {
        status: "Approved",
        by: "John Doe",
        date: "May 4, 2023, 11:45 AM",
        notes: "Regular monthly payment, approved.",
      },
      {
        status: "Payment Processed",
        by: "Finance System",
        date: "May 5, 2023, 10:15 AM",
        notes: null,
      },
    ],
  },
  {
    id: "exp-002",
    date: "May 4, 2023",
    description: "Utility bills",
    category: "Utilities",
    amount: 120000,
    status: "Paid",
    paymentMethod: "Mobile Money",
    referenceNumber: "MM-56789",
    paidBy: "Jane Smith",
    vendor: {
      name: "Rwanda Energy Group",
      contact: "+250 78 234 5678",
      address: "200 Energy Blvd, Kigali, Rwanda",
      taxId: "RW87654321",
    },
    taxInfo: {
      category: "Operating Expense",
      deductible: true,
      vatAmount: 18305,
      vatRate: 18,
    },
    accountingInfo: {
      account: "Utilities Expense",
      costCenter: "Operations",
      project: null,
      fiscalYear: "2023",
    },
    notes: "Electricity and water bills for April 2023.",
    attachments: [
      {
        name: "Electricity_Bill_Apr_2023.pdf",
        url: "#",
      },
      {
        name: "Water_Bill_Apr_2023.pdf",
        url: "#",
      },
    ],
    approvalHistory: [
      {
        status: "Submitted for Approval",
        by: "Jane Smith",
        date: "May 3, 2023, 2:30 PM",
        notes: null,
      },
      {
        status: "Approved",
        by: "John Doe",
        date: "May 3, 2023, 4:15 PM",
        notes: "Utility bills verified and approved.",
      },
      {
        status: "Payment Processed",
        by: "Finance System",
        date: "May 4, 2023, 9:45 AM",
        notes: null,
      },
    ],
  },
];
