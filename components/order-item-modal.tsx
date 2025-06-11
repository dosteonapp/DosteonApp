"use client"

import type React from "react"

import { useState } from "react"
import { Check, AlertTriangle, TrendingUp, TrendingDown, Star } from "lucide-react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OrderItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
}

export function OrderItemModal({ open, onOpenChange, item }: OrderItemModalProps) {
  const [step, setStep] = useState<"form" | "success">("form")
  const [formData, setFormData] = useState({
    quantity: item?.currentStock < item?.minLevel ? (item?.minLevel - item?.currentStock).toFixed(1) : "1",
    supplier: item?.supplier || "",
    deliveryDate: "",
    notes: "",
  })

  const [warnings, setWarnings] = useState<{
    quantity?: string
    deliveryDate?: string
  }>({})

  // Suggested suppliers based on the item
  const suggestedSuppliers = [
    {
      name: "Kigali Farms",
      rating: 4.8,
      fulfillmentRate: "98%",
      responseTime: "30 min",
      priceCompetitiveness: "Low",
      deliveryFlexibility: "High",
    },
    {
      name: "Rwanda Meat Suppliers",
      rating: 4.5,
      fulfillmentRate: "95%",
      responseTime: "45 min",
      priceCompetitiveness: "Medium",
      deliveryFlexibility: "Medium",
    },
    {
      name: "Nyarutarama Grocers",
      rating: 4.2,
      fulfillmentRate: "92%",
      responseTime: "1 hr",
      priceCompetitiveness: "High",
      deliveryFlexibility: "Medium",
    },
    {
      name: "Dairy Fresh",
      rating: 4.6,
      fulfillmentRate: "96%",
      responseTime: "25 min",
      priceCompetitiveness: "Medium",
      deliveryFlexibility: "High",
    },
  ]

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Validate as user types
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    const newWarnings = { ...warnings }

    if (field === "quantity") {
      const quantity = Number.parseFloat(value)

      if (quantity <= 0) {
        newWarnings.quantity = "Quantity must be greater than zero"
      } else if (quantity > 100) {
        newWarnings.quantity = "Large order quantity. Please confirm this is correct."
      } else {
        delete newWarnings.quantity
      }
    }

    if (field === "deliveryDate") {
      const deliveryDate = new Date(value)
      const today = new Date()

      if (deliveryDate < today) {
        newWarnings.deliveryDate = "Delivery date cannot be in the past"
      } else {
        delete newWarnings.deliveryDate
      }
    }

    setWarnings(newWarnings)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically send the order to your backend
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
      quantity: "",
      supplier: "",
      deliveryDate: "",
      notes: "",
    })
    onOpenChange(false)
  }

  const getPriceIndicator = (level: string) => {
    switch (level) {
      case "Low":
        return <TrendingUp className="h-4 w-4 text-destructive" />
      case "Medium":
        return null
      case "High":
        return <TrendingDown className="h-4 w-4 text-secondary-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Order {item?.name}</DialogTitle>
              <DialogDescription>
                Create a new order for this item. Current stock: {item?.currentStock} {item?.unit}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to Order ({item?.unit})</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => handleChange("quantity", e.target.value)}
                      required
                    />
                    {warnings.quantity && (
                      <Alert variant="warning" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warnings.quantity}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Requested Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleChange("deliveryDate", e.target.value)}
                      required
                    />
                    {warnings.deliveryDate && (
                      <Alert variant="warning" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warnings.deliveryDate}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Suggested Suppliers</Label>
                  <div className="grid gap-3">
                    {suggestedSuppliers.map((supplier) => (
                      <Card
                        key={supplier.name}
                        className={`cursor-pointer border-2 ${
                          formData.supplier === supplier.name ? "border-primary-500 bg-primary-50" : ""
                        }`}
                        onClick={() => handleChange("supplier", supplier.name)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{supplier.name}</div>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs ml-1">{supplier.rating}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getPriceIndicator(supplier.priceCompetitiveness)}
                              Price: {supplier.priceCompetitiveness}
                            </Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>Fulfillment Rate: {supplier.fulfillmentRate}</div>
                            <div>Response Time: {supplier.responseTime}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any special instructions for this order"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-600">
                  Place Order
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-secondary-500">
                <Check className="h-6 w-6" />
                Order Placed Successfully
              </DialogTitle>
              <DialogDescription>
                Your order for {item?.name} has been sent to {formData.supplier}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Item</p>
                    <p>{item?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                    <p>
                      {formData.quantity} {item?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                    <p>{formData.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requested Delivery</p>
                    <p>{new Date(formData.deliveryDate).toLocaleDateString()}</p>
                  </div>
                  {formData.notes && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p>{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={resetAndClose}>Close</Button>
              <Button variant="outline" asChild>
                <a href="/restaurant/orders">View All Orders</a>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
