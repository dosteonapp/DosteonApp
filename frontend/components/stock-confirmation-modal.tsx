"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, Edit2, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type StockItem = {
  id: string
  name: string
  category: string
  type: string
  unit: string
  minLevel: number
  openingStock: number
  closingStock: number
  previousClosingStock?: number
}

export type StockEdit = {
  id: string
  timestamp: Date
  itemId: string
  itemName: string
  field: string
  oldValue: number
  newValue: number
  reason?: string
}

type StockConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  stockItems: StockItem[]
  onConfirm: (items: StockItem[], edits: StockEdit[]) => void
  stockType: "opening" | "closing"
  previousItems?: StockItem[]
}

export function StockConfirmationModal({
  isOpen,
  onClose,
  stockItems,
  onConfirm,
  stockType,
  previousItems = [],
}: StockConfirmationModalProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [editReason, setEditReason] = useState<string>("")
  const [edits, setEdits] = useState<StockEdit[]>([])
  const [currentItems, setCurrentItems] = useState<StockItem[]>(stockItems)

  // Find items with changes
  const changedItems = currentItems.filter((item) => {
    const previousItem = previousItems.find((prev) => prev.id === item.id)
    if (!previousItem) return true

    return stockType === "opening"
      ? item.openingStock !== previousItem.openingStock
      : item.closingStock !== previousItem.closingStock
  })

  const handleEdit = (itemId: string) => {
    const item = currentItems.find((i) => i.id === itemId)
    if (!item) return

    setEditingItem(itemId)
    setEditValue(stockType === "opening" ? item.openingStock : item.closingStock)
    setEditReason("")
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    const itemIndex = currentItems.findIndex((i) => i.id === editingItem)
    if (itemIndex === -1) return

    const item = currentItems[itemIndex]
    const oldValue = stockType === "opening" ? item.openingStock : item.closingStock

    // Only record edit if value actually changed
    if (oldValue !== editValue) {
      // Create a new edit record
      const newEdit: StockEdit = {
        id: `edit-${Date.now()}`,
        timestamp: new Date(),
        itemId: editingItem,
        itemName: item.name,
        field: stockType,
        oldValue,
        newValue: editValue,
        reason: editReason,
      }

      setEdits([...edits, newEdit])

      // Update the item
      const updatedItems = [...currentItems]
      if (stockType === "opening") {
        updatedItems[itemIndex] = { ...item, openingStock: editValue }
      } else {
        updatedItems[itemIndex] = { ...item, closingStock: editValue }
      }

      setCurrentItems(updatedItems)
    }

    setEditingItem(null)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  const handleConfirm = () => {
    onConfirm(currentItems, edits)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Stock Level Changes</DialogTitle>
          <DialogDescription>
            Please review the following changes before saving. You can edit any values that need correction.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="text-lg font-medium mb-2">Summary of Changes</h3>
          {changedItems.length === 0 ? (
            <div className="flex items-center justify-center p-4 border rounded-md">
              <p className="text-muted-foreground">No changes detected</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Unit</TableHead>
                    {stockType === "opening" ? (
                      <>
                        <TableHead>Previous Opening</TableHead>
                        <TableHead>New Opening</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Previous Closing</TableHead>
                        <TableHead>New Closing</TableHead>
                      </>
                    )}
                    <TableHead>Difference</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changedItems.map((item) => {
                    const previousItem = previousItems.find((prev) => prev.id === item.id)
                    const previousValue = previousItem
                      ? stockType === "opening"
                        ? previousItem.openingStock
                        : previousItem.closingStock
                      : 0
                    const currentValue = stockType === "opening" ? item.openingStock : item.closingStock
                    const difference = currentValue - previousValue

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
                        <TableCell>{previousValue}</TableCell>
                        <TableCell>
                          {editingItem === item.id ? (
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(Number(e.target.value))}
                              className="w-20"
                              autoFocus
                            />
                          ) : (
                            currentValue
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(difference > 0 ? "text-green-600" : difference < 0 ? "text-red-600" : "")}
                          >
                            {difference > 0 ? `+${difference}` : difference}
                          </span>
                        </TableCell>
                        <TableCell>
                          {editingItem === item.id ? (
                            <div className="flex items-center space-x-2">
                              <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(item.id)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {editingItem && (
            <div className="mt-4 p-4 border rounded-md bg-muted/50">
              <h4 className="font-medium mb-2">Edit Reason (Optional)</h4>
              <Input
                placeholder="Reason for change..."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">Adding a reason helps track why changes were made</p>
            </div>
          )}

          {edits.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Edit History</h3>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {edits.map((edit) => (
                      <TableRow key={edit.id}>
                        <TableCell>{edit.timestamp.toLocaleTimeString()}</TableCell>
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
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-sm text-muted-foreground mr-4">This action cannot be undone</span>
            <Button onClick={handleConfirm}>Confirm & Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
