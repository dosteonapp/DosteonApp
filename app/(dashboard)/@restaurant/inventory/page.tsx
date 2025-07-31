"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Menu, Edit, Trash2, AlertTriangle, QrCode } from "lucide-react"
import { InventoryItemModal } from "@/components/inventory-item-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
// Add import for OrderItemModal at the top with other imports
import { OrderItemModal } from "@/components/order-item-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryPage() {
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [editItemOpen, setEditItemOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  // Add state for order modal after other state declarations
  const [orderItemOpen, setOrderItemOpen] = useState(false)

  const handleAddItem = () => {
    setAddItemOpen(true)
  }

  const handleEditItem = (item: any) => {
    setSelectedItem(item)
    setEditItemOpen(true)
  }

  const handleDeleteItem = (item: any) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    // Here you would typically delete the item from your backend
    // For now, we'll just show a success toast
    toast({
      title: "Item Deleted",
      description: `${selectedItem.name} has been removed from your inventory.`,
      variant: "default",
    })
    setDeleteDialogOpen(false)
  }

  // Update the handleOrderItem function
  const handleOrderItem = (item: any) => {
    setSelectedItem(item)
    setOrderItemOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Inventory</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">Track and manage your restaurant's inventory</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList>
            <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
            <TabsTrigger value="daily-stock">Daily Stock Tracking</TabsTrigger>
          </TabsList>
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>View and manage all inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="search" placeholder="Search inventory..." className="pl-8 w-full md:w-[300px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="produce">Produce</SelectItem>
                        <SelectItem value="meat">Meat & Poultry</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="dry-goods">Dry Goods</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Stock Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Min. Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">
                            {item.currentStock} {item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.minLevel} {item.unit}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStockLevelVariant(item.stockLevel)}>{item.stockLevel}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.lastUpdated}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  item.stockLevel === "Critical" || item.stockLevel === "Low"
                                    ? "destructive"
                                    : "outline"
                                }
                                onClick={() => handleOrderItem(item)}
                              >
                                {item.stockLevel === "Critical" || item.stockLevel === "Low" ? (
                                  <AlertTriangle className="mr-1 h-4 w-4" />
                                ) : null}
                                Order
                              </Button>
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
          <TabsContent value="daily-stock">
            <Card>
              <CardHeader>
                <CardTitle>Daily Stock Tracking</CardTitle>
                <CardDescription>Track opening and closing stock levels for daily operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="search" placeholder="Search items..." className="pl-8 w-full md:w-[300px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select defaultValue="today">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="custom">Custom Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="flex-shrink-0">
                      <QrCode className="mr-2 h-4 w-4" />
                      Scan Barcode
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Opening Stock</TableHead>
                        <TableHead className="text-right">Closing Stock</TableHead>
                        <TableHead className="text-right">Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              defaultValue={item.currentStock}
                              className="w-20 text-right"
                              min="0"
                              step="0.1"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              defaultValue={Math.max(0, item.currentStock - Math.random() * 2).toFixed(1)}
                              className="w-20 text-right"
                              min="0"
                              step="0.1"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {(Math.random() * 2).toFixed(1)} {item.unit}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStockLevelVariant(item.stockLevel)}>{item.stockLevel}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              Save
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Item Modal */}
      <InventoryItemModal open={addItemOpen} onOpenChange={setAddItemOpen} mode="add" />

      {/* Edit Item Modal */}
      {selectedItem && (
        <InventoryItemModal open={editItemOpen} onOpenChange={setEditItemOpen} mode="edit" initialData={selectedItem} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedItem?.name} from your inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Item Modal */}
      {selectedItem && <OrderItemModal open={orderItemOpen} onOpenChange={setOrderItemOpen} item={selectedItem} />}

      <Toaster />
    </div>
  )
}

// Helper function to get badge variant based on stock level
function getStockLevelVariant(level: string) {
  switch (level) {
    case "Critical":
      return "destructive"
    case "Low":
      return "warning"
    case "Medium":
      return "secondary"
    case "Good":
      return "success"
    default:
      return "outline"
  }
}

// Sample data
const inventoryItems = [
  {
    id: "1",
    name: "Tomatoes",
    category: "Produce",
    currentStock: 2.5,
    unit: "kg",
    minLevel: 5,
    stockLevel: "Critical",
    lastUpdated: "Today, 8:30 AM",
    supplier: "Kigali Farms",
    location: "Cold Storage",
    expiryDate: "2023-05-15",
  },
  {
    id: "2",
    name: "Onions",
    category: "Produce",
    currentStock: 5,
    unit: "kg",
    minLevel: 8,
    stockLevel: "Low",
    lastUpdated: "Yesterday, 4:15 PM",
    supplier: "Nyarutarama Grocers",
    location: "Dry Storage",
    expiryDate: "2023-06-20",
  },
  {
    id: "3",
    name: "Chicken Breast",
    category: "Meat & Poultry",
    currentStock: 8,
    unit: "kg",
    minLevel: 10,
    stockLevel: "Low",
    lastUpdated: "Yesterday, 2:00 PM",
    supplier: "Rwanda Meat Suppliers",
    location: "Freezer",
    expiryDate: "2023-05-10",
  },
  {
    id: "4",
    name: "Olive Oil",
    category: "Dry Goods",
    currentStock: 5,
    unit: "liter",
    minLevel: 2,
    stockLevel: "Good",
    lastUpdated: "May 1, 2023",
    supplier: "Nyarutarama Grocers",
    location: "Pantry",
    expiryDate: "",
  },
  {
    id: "5",
    name: "Rice",
    category: "Dry Goods",
    currentStock: 10,
    unit: "kg",
    minLevel: 5,
    stockLevel: "Good",
    lastUpdated: "April 28, 2023",
    supplier: "Nyarutarama Grocers",
    location: "Dry Storage",
    expiryDate: "",
  },
  {
    id: "6",
    name: "Milk",
    category: "Dairy",
    currentStock: 4,
    unit: "liter",
    minLevel: 6,
    stockLevel: "Medium",
    lastUpdated: "Today, 9:00 AM",
    supplier: "Dairy Fresh",
    location: "Refrigerator",
    expiryDate: "2023-05-08",
  },
  {
    id: "7",
    name: "Potatoes",
    category: "Produce",
    currentStock: 15,
    unit: "kg",
    minLevel: 10,
    stockLevel: "Good",
    lastUpdated: "April 30, 2023",
    supplier: "Kigali Farms",
    location: "Dry Storage",
    expiryDate: "2023-06-15",
  },
  {
    id: "8",
    name: "Flour",
    category: "Dry Goods",
    currentStock: 3,
    unit: "kg",
    minLevel: 5,
    stockLevel: "Medium",
    lastUpdated: "May 2, 2023",
    supplier: "Nyarutarama Grocers",
    location: "Pantry",
    expiryDate: "",
  },
]
