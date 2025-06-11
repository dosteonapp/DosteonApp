"use client"

import type React from "react"

import { useState } from "react"
import { Check, AlertTriangle } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InventoryItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  initialData?: any
}

export function InventoryItemModal({ open, onOpenChange, mode, initialData }: InventoryItemModalProps) {
  const [step, setStep] = useState<"form" | "success">("form")
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    currentStock: initialData?.currentStock || "",
    unit: initialData?.unit || "",
    minLevel: initialData?.minLevel || "",
    supplier: initialData?.supplier || "",
    location: initialData?.location || "",
    expiryDate: initialData?.expiryDate || "",
  })

  const [warnings, setWarnings] = useState<{
    minLevel?: string
    currentStock?: string
    expiryDate?: string
  }>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Validate as user types
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    const newWarnings = { ...warnings }

    if (field === "minLevel" && formData.currentStock) {
      const minLevel = Number.parseFloat(value)
      const currentStock = Number.parseFloat(formData.currentStock)

      if (minLevel > currentStock) {
        newWarnings.minLevel = "Minimum level is higher than current stock"
      } else {
        delete newWarnings.minLevel
      }
    }

    if (field === "currentStock" && formData.minLevel) {
      const minLevel = Number.parseFloat(formData.minLevel)
      const currentStock = Number.parseFloat(value)

      if (minLevel > currentStock) {
        newWarnings.currentStock = "Current stock is lower than minimum level"
      } else {
        delete newWarnings.currentStock
      }
    }

    if (field === "expiryDate") {
      const expiryDate = new Date(value)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      if (expiryDate < today) {
        newWarnings.expiryDate = "Expiry date is in the past"
      } else if (expiryDate < thirtyDaysFromNow) {
        newWarnings.expiryDate = "Item will expire within 30 days"
      } else {
        delete newWarnings.expiryDate
      }
    }

    setWarnings(newWarnings)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically send the data to your backend
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      setStep("success")
    }, 500)
  }

  const handleClose = () => {
    // Reset the form when closing
    setStep("form")
    onOpenChange(false)
  }

  const resetAndClose = () => {
    setStep("form")
    setFormData({
      name: "",
      category: "",
      currentStock: "",
      unit: "",
      minLevel: "",
      supplier: "",
      location: "",
      expiryDate: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>{mode === "add" ? "Add New Inventory Item" : "Edit Inventory Item"}</DialogTitle>
              <DialogDescription>
                {mode === "add"
                  ? "Add a new item to your inventory. Fill out the details below."
                  : "Update the details of this inventory item."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Produce">Produce</SelectItem>
                        <SelectItem value="Meat & Poultry">Meat & Poultry</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Dry Goods">Dry Goods</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      step="0.01"
                      value={formData.currentStock}
                      onChange={(e) => handleChange("currentStock", e.target.value)}
                      required
                    />
                    {warnings.currentStock && (
                      <Alert variant="warning" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warnings.currentStock}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleChange("unit", value)}>
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                        <SelectItem value="unit">unit</SelectItem>
                        <SelectItem value="box">box</SelectItem>
                        <SelectItem value="bag">bag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLevel">Minimum Level</Label>
                    <Input
                      id="minLevel"
                      type="number"
                      step="0.01"
                      value={formData.minLevel}
                      onChange={(e) => handleChange("minLevel", e.target.value)}
                      required
                    />
                    {warnings.minLevel && (
                      <Alert variant="warning" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warnings.minLevel}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Preferred Supplier</Label>
                    <Select value={formData.supplier} onValueChange={(value) => handleChange("supplier", value)}>
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kigali Farms">Kigali Farms</SelectItem>
                        <SelectItem value="Rwanda Meat Suppliers">Rwanda Meat Suppliers</SelectItem>
                        <SelectItem value="Dairy Fresh">Dairy Fresh</SelectItem>
                        <SelectItem value="Nyarutarama Grocers">Nyarutarama Grocers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Storage Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleChange("expiryDate", e.target.value)}
                    />
                    {warnings.expiryDate && (
                      <Alert variant="warning" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warnings.expiryDate}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-600">
                  {mode === "add" ? "Add Item" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-secondary-500">
                <Check className="h-6 w-6" />
                {mode === "add" ? "Item Added Successfully" : "Item Updated Successfully"}
              </DialogTitle>
              <DialogDescription>
                {mode === "add"
                  ? `${formData.name} has been added to your inventory.`
                  : `${formData.name} has been updated in your inventory.`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Item Name</p>
                    <p>{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p>{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                    <p>
                      {formData.currentStock} {formData.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Minimum Level</p>
                    <p>
                      {formData.minLevel} {formData.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={resetAndClose}>Close</Button>
              {mode === "add" && (
                <Button variant="outline" onClick={() => setStep("form")}>
                  Add Another Item
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
