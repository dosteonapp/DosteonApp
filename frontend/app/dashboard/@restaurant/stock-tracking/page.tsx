"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Menu, QrCode, Save, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { StockConfirmationModal, type StockEdit, type StockItem } from "@/components/stock-confirmation-modal"
import { useToast } from "@/hooks/use-toast"

export default function StockTrackingPage() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [stockType, setStockType] = useState("closing")
  const [productType, setProductType] = useState("all")
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems)
  const [previousItems, setPreviousItems] = useState<StockItem[]>([...initialStockItems])
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [editHistory, setEditHistory] = useState<StockEdit[]>([])

  const handleStockChange = (id: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setStockItems(
      stockItems.map((item) =>
        item.id === id ? { ...item, [stockType === "opening" ? "openingStock" : "closingStock"]: numValue } : item,
      ),
    )
  }

  const handleSaveClick = () => {
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSave = (confirmedItems: StockItem[], newEdits: StockEdit[]) => {
    // Save the confirmed items
    setStockItems(confirmedItems)

    // Update previous items for future comparisons
    setPreviousItems([...confirmedItems])

    // Add new edits to history
    setEditHistory([...editHistory, ...newEdits])

    // Show success toast
    toast({
      title: "Stock levels saved",
      description: `Successfully saved ${stockType} stock levels for ${format(date, "MMMM d, yyyy")}`,
    })
  }

  const handleResetValues = () => {
    setStockItems([...previousItems])
    toast({
      title: "Values reset",
      description: "Stock levels have been reset to previous values",
    })
  }

  // Filter items based on product type
  const filteredItems = stockItems.filter((item) => {
    if (productType === "all") return true
    return item.type === productType
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Daily Stock Tracking</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Stock Tracking</h1>
            <p className="text-muted-foreground">Track your opening and closing inventory</p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
            <Button onClick={handleSaveClick}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockItems.length}</div>
              <p className="text-xs text-muted-foreground">
                {stockItems.filter((item) => item.type === "raw").length} raw materials,{" "}
                {stockItems.filter((item) => item.type === "resale").length} resale products
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockItems.filter((item) => item.closingStock < item.minLevel).length}
              </div>
              <p className="text-xs text-muted-foreground">Items below minimum level</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockItems.reduce((total, item) => {
                  const usage = item.openingStock - item.closingStock
                  return total + (usage > 0 ? usage : 0)
                }, 0)}{" "}
                units
              </div>
              <p className="text-xs text-muted-foreground">Across all products</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Today, 6:30 PM</div>
              <p className="text-xs text-muted-foreground">By John Doe</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Stock Tracking</CardTitle>
                <CardDescription>
                  {stockType === "opening"
                    ? "Record opening stock levels for the day"
                    : "Record closing stock levels for the day"}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Tabs value={stockType} onValueChange={setStockType} className="w-full sm:w-[200px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="opening">Opening</TabsTrigger>
                    <TabsTrigger value="closing">Closing</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Product Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="raw">Raw Materials</SelectItem>
                    <SelectItem value="resale">Resale Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search products..." className="pl-8" />
              </div>
              <Button variant="outline" className="flex-shrink-0">
                <QrCode className="mr-2 h-4 w-4" />
                Scan Barcode
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Min Level</TableHead>
                    <TableHead>Opening Stock</TableHead>
                    <TableHead>Closing Stock</TableHead>
                    <TableHead>Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const usage = item.openingStock - item.closingStock
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <Badge variant={item.type === "raw" ? "outline" : "secondary"}>
                            {item.type === "raw" ? "Raw Material" : "Resale Product"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.minLevel}</TableCell>
                        <TableCell>
                          {stockType === "opening" ? (
                            <Input
                              type="number"
                              value={item.openingStock}
                              onChange={(e) => handleStockChange(item.id, e.target.value)}
                              className="w-20"
                            />
                          ) : (
                            item.openingStock
                          )}
                        </TableCell>
                        <TableCell>
                          {stockType === "closing" ? (
                            <Input
                              type="number"
                              value={item.closingStock}
                              onChange={(e) => handleStockChange(item.id, e.target.value)}
                              className="w-20"
                            />
                          ) : (
                            item.closingStock
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={cn(usage > 0 ? "text-green-600" : usage < 0 ? "text-red-600" : "")}>
                            {usage > 0 ? `+${usage}` : usage}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleResetValues}>
              Reset to Previous Values
            </Button>
            <Button onClick={handleSaveClick}>Save Stock Levels</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock History</CardTitle>
            <CardDescription>View historical stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="trends">Usage Trends</TabsTrigger>
                <TabsTrigger value="edits">Edit History</TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Select defaultValue="week">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="quarter">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {stockItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Opening</TableHead>
                        <TableHead>Closing</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Updated By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {
                          date: "May 3, 2023",
                          product: "Flour",
                          opening: 50,
                          closing: 42,
                          usage: 8,
                          updatedBy: "John Doe",
                        },
                        {
                          date: "May 2, 2023",
                          product: "Flour",
                          opening: 60,
                          closing: 50,
                          usage: 10,
                          updatedBy: "Jane Smith",
                        },
                        {
                          date: "May 1, 2023",
                          product: "Flour",
                          opening: 75,
                          closing: 60,
                          usage: 15,
                          updatedBy: "John Doe",
                        },
                        {
                          date: "May 3, 2023",
                          product: "Sugar",
                          opening: 30,
                          closing: 25,
                          usage: 5,
                          updatedBy: "John Doe",
                        },
                        {
                          date: "May 2, 2023",
                          product: "Sugar",
                          opening: 35,
                          closing: 30,
                          usage: 5,
                          updatedBy: "Jane Smith",
                        },
                      ].map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.product}</TableCell>
                          <TableCell>{record.opening}</TableCell>
                          <TableCell>{record.closing}</TableCell>
                          <TableCell>{record.usage}</TableCell>
                          <TableCell>{record.updatedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="trends" className="mt-4">
                <div className="flex items-center justify-center p-8 text-center">
                  <div className="space-y-2">
                    <p>Usage trend visualization will be displayed here</p>
                    <p className="text-sm text-muted-foreground">
                      Showing daily/weekly usage patterns for selected products
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="edits" className="mt-4">
                {editHistory.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-center border rounded-md">
                    <div className="space-y-2">
                      <p>No edit history available</p>
                      <p className="text-sm text-muted-foreground">
                        Edit history will be displayed here once changes are made
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Old Value</TableHead>
                          <TableHead>New Value</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editHistory.map((edit) => (
                          <TableRow key={edit.id}>
                            <TableCell>{edit.timestamp.toLocaleString()}</TableCell>
                            <TableCell>{edit.itemName}</TableCell>
                            <TableCell className="capitalize">{edit.field} Stock</TableCell>
                            <TableCell>{edit.oldValue}</TableCell>
                            <TableCell>{edit.newValue}</TableCell>
                            <TableCell>{edit.reason || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <StockConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        stockItems={stockItems}
        previousItems={previousItems}
        stockType={stockType as "opening" | "closing"}
        onConfirm={handleConfirmSave}
      />
    </div>
  )
}

// Sample data
const initialStockItems: StockItem[] = [
  {
    id: "item-1",
    name: "Flour",
    category: "Baking Supplies",
    type: "raw",
    unit: "kg",
    minLevel: 20,
    openingStock: 50,
    closingStock: 42,
  },
  {
    id: "item-2",
    name: "Sugar",
    category: "Baking Supplies",
    type: "raw",
    unit: "kg",
    minLevel: 15,
    openingStock: 30,
    closingStock: 25,
  },
  {
    id: "item-3",
    name: "Butter",
    category: "Dairy",
    type: "raw",
    unit: "kg",
    minLevel: 10,
    openingStock: 15,
    closingStock: 8,
  },
  {
    id: "item-4",
    name: "Eggs",
    category: "Dairy",
    type: "raw",
    unit: "dozen",
    minLevel: 5,
    openingStock: 10,
    closingStock: 3,
  },
  {
    id: "item-5",
    name: "Chocolate Cake",
    category: "Cakes",
    type: "resale",
    unit: "piece",
    minLevel: 5,
    openingStock: 12,
    closingStock: 4,
  },
  {
    id: "item-6",
    name: "Vanilla Cupcakes",
    category: "Cupcakes",
    type: "resale",
    unit: "piece",
    minLevel: 10,
    openingStock: 24,
    closingStock: 6,
  },
  {
    id: "item-7",
    name: "Baguette",
    category: "Bread",
    type: "resale",
    unit: "piece",
    minLevel: 8,
    openingStock: 20,
    closingStock: 2,
  },
  {
    id: "item-8",
    name: "Croissant",
    category: "Pastries",
    type: "resale",
    unit: "piece",
    minLevel: 12,
    openingStock: 30,
    closingStock: 5,
  },
  {
    id: "item-9",
    name: "Milk",
    category: "Dairy",
    type: "raw",
    unit: "liter",
    minLevel: 10,
    openingStock: 20,
    closingStock: 12,
  },
  {
    id: "item-10",
    name: "Chocolate Chips",
    category: "Baking Supplies",
    type: "raw",
    unit: "kg",
    minLevel: 5,
    openingStock: 8,
    closingStock: 6,
  },
]
