"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Download, FileText, BarChart, PieChart, TableIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface DailyReportsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "analytics" | "finance"
}

export function DailyReportsModal({ open, onOpenChange, type }: DailyReportsModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [reportFormat, setReportFormat] = useState<string>("pdf")
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = () => {
    if (selectedReports.length === 0) return

    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false)
      onOpenChange(false)
      // Reset form
      setSelectedReports([])
      setReportFormat("pdf")
    }, 1500)
  }

  const toggleReport = (report: string) => {
    if (selectedReports.includes(report)) {
      setSelectedReports(selectedReports.filter((r) => r !== report))
    } else {
      setSelectedReports([...selectedReports, report])
    }
  }

  const analyticsReports = [
    {
      id: "consumption",
      name: "Consumption Report",
      description: "Daily usage of inventory items",
      icon: <BarChart className="h-5 w-5 text-primary" />,
    },
    {
      id: "wastage",
      name: "Wastage Report",
      description: "Food waste and loss tracking",
      icon: <PieChart className="h-5 w-5 text-primary" />,
    },
    {
      id: "inventory-levels",
      name: "Inventory Levels",
      description: "End-of-day inventory status",
      icon: <TableIcon className="h-5 w-5 text-primary" />,
    },
  ]

  const financeReports = [
    {
      id: "daily-transactions",
      name: "Daily Transactions",
      description: "All financial transactions for the day",
      icon: <FileText className="h-5 w-5 text-primary" />,
    },
    {
      id: "expense-summary",
      name: "Expense Summary",
      description: "Breakdown of daily expenses by category",
      icon: <PieChart className="h-5 w-5 text-primary" />,
    },
    {
      id: "petty-cash",
      name: "Petty Cash Report",
      description: "Petty cash transactions and balance",
      icon: <TableIcon className="h-5 w-5 text-primary" />,
    },
  ]

  const reports = type === "analytics" ? analyticsReports : financeReports

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Daily Reports</DialogTitle>
          <DialogDescription>
            Generate and download daily {type === "analytics" ? "analytics" : "financial"} reports
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Report Format</Label>
            <Select value={reportFormat} onValueChange={setReportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Reports</Label>
            <div className="grid gap-2">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "flex items-center space-x-2 rounded-md border p-3 cursor-pointer",
                    selectedReports.includes(report.id) && "border-primary bg-primary/5",
                  )}
                  onClick={() => toggleReport(report.id)}
                >
                  <Checkbox
                    id={report.id}
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => toggleReport(report.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {report.icon}
                      <div>
                        <Label htmlFor={report.id} className="font-medium cursor-pointer">
                          {report.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {selectedReports.length > 0 ? (
                  <div className="space-y-1">
                    <p>
                      {selectedReports.length} report{selectedReports.length > 1 ? "s" : ""} selected for{" "}
                      {date ? format(date, "MMMM d, yyyy") : "today"}
                    </p>
                    <p className="text-sm">Click Generate to download your reports</p>
                  </div>
                ) : (
                  <p>Select at least one report to generate</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={selectedReports.length === 0 || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
