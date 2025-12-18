"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { CalendarIcon, Check, Plus, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface NewOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewOrderModal({ open, onOpenChange }: NewOrderModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<"supplier" | "items" | "details" | "schedule" | "review">("supplier")
  const [orderType, setOrderType] = useState<"immediate" | "scheduled">("immediate")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [selectedItems, setSelectedItems] = useState<{ id: string; name: string; quantity: number; price: number }[]>(
    [],
  )
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddItem = (item: { id: string; name: string; price: number }) => {
    const existingItem = selectedItems.find((i) => i.id === item.id)
    if (existingItem) {
      setSelectedItems(selectedItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
    }
  }

  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id))
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id)
      return
    }
    setSelectedItems(selectedItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false)
      // Reset form
      setStep("supplier")
      setSelectedSupplier("")
      setSelectedItems([])
      setDate(undefined)
      setTimeSlot("")
      setOrderType("immediate")
      // Navigate or show success message
    }, 1000)
  }

  const handleNext = () => {
    if (step === "supplier" && selectedSupplier) {
      setStep("items")
    } else if (step === "items" && selectedItems.length > 0) {
      setStep("details")
    } else if (step === "details") {
      if (orderType === "scheduled") {
        setStep("schedule")
      } else {
        setStep("review")
      }
    } else if (step === "schedule" && date && timeSlot) {
      setStep("review")
    }
  }

  const handleBack = () => {
    if (step === "items") {
      setStep("supplier")
    } else if (step === "details") {
      setStep("items")
    } else if (step === "schedule") {
      setStep("details")
    } else if (step === "review") {
      if (orderType === "scheduled") {
        setStep("schedule")
      } else {
        setStep("details")
      }
    }
  }

  // Sample data
  const suppliers = [
    { id: "supplier-1", name: "Fresh Farms Inc.", categories: ["Produce", "Dairy"] },
    { id: "supplier-2", name: "Metro Meats", categories: ["Meat & Poultry"] },
    { id: "supplier-3", name: "Global Grocers", categories: ["Produce", "Dry Goods"] },
    { id: "supplier-4", name: "Organic Supplies Co.", categories: ["Produce", "Dry Goods"] },
    { id: "supplier-5", name: "Dairy Delights", categories: ["Dairy"] },
  ]

  const products = [
    { id: "prod-1", name: "Tomatoes", category: "Produce", price: 2.99 },
    { id: "prod-2", name: "Onions", category: "Produce", price: 1.49 },
    { id: "prod-3", name: "Potatoes", category: "Produce", price: 1.99 },
    { id: "prod-4", name: "Chicken Breast", category: "Meat & Poultry", price: 8.99 },
    { id: "prod-5", name: "Ground Beef", category: "Meat & Poultry", price: 7.49 },
    { id: "prod-6", name: "Milk", category: "Dairy", price: 3.29 },
    { id: "prod-7", name: "Cheese", category: "Dairy", price: 5.99 },
    { id: "prod-8", name: "Rice", category: "Dry Goods", price: 2.49 },
  ]

  const renderStepContent = () => {
    switch (step) {
      case "supplier":
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Order - Select Supplier</DialogTitle>
              <DialogDescription>Choose a supplier for your order</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search suppliers..." className="pl-8" />
              </div>
              <div className="grid gap-2">
                {suppliers.map((supplier) => (
                  <Card
                    key={supplier.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      selectedSupplier === supplier.id && "border-2 border-primary",
                    )}
                    onClick={() => setSelectedSupplier(supplier.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{supplier.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {supplier.categories.map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {selectedSupplier === supplier.id && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!selectedSupplier}>
                Next
              </Button>
            </DialogFooter>
          </>
        )

      case "items":
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Order - Select Items</DialogTitle>
              <DialogDescription>
                Add items to your order from {suppliers.find((s) => s.id === selectedSupplier)?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search products..." className="pl-8" />
              </div>

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="produce">Produce</TabsTrigger>
                  <TabsTrigger value="meat">Meat</TabsTrigger>
                  <TabsTrigger value="dairy">Dairy</TabsTrigger>
                  <TabsTrigger value="dry">Dry Goods</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-2">
                  <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">RWF {product.price.toFixed(2)}</p>
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleAddItem(product)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                {/* Other tabs would filter by category */}
              </Tabs>

              {selectedItems.length > 0 && (
                <div className="border rounded-md p-3 mt-4">
                  <h3 className="font-medium mb-2">Selected Items</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p>{item.name}</p>
                          <p className="text-sm text-muted-foreground">RWF {item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">RWF {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={selectedItems.length === 0}>
                Next
              </Button>
            </DialogFooter>
          </>
        )

      case "details":
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Order - Order Details</DialogTitle>
              <DialogDescription>Specify order details and delivery preferences</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Order Type</Label>
                <RadioGroup
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as "immediate" | "scheduled")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate" className="cursor-pointer">
                      Immediate Order
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled" className="cursor-pointer">
                      Schedule for Later
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes</Label>
                <Input id="notes" placeholder="Any special instructions for this order" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="urgent" />
                  <Label htmlFor="urgent">Mark as Urgent</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>{orderType === "scheduled" ? "Set Schedule" : "Review Order"}</Button>
            </DialogFooter>
          </>
        )

      case "schedule":
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Order - Schedule Delivery</DialogTitle>
              <DialogDescription>Choose when you'd like this order to be delivered</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Delivery Date</Label>
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
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today || date > addDays(today, 14)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-slot">Preferred Time Slot</Label>
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger id="time-slot">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12:00 PM - 4:00 PM)</SelectItem>
                    <SelectItem value="evening">Evening (4:00 PM - 8:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="reminder" defaultChecked />
                  <Label htmlFor="reminder">Send reminder 2 days before delivery</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!date || !timeSlot}>
                Review Order
              </Button>
            </DialogFooter>
          </>
        )

      case "review":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Review Your Order</DialogTitle>
              <DialogDescription>Please confirm your order details before submitting</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Supplier</h3>
                <p>{suppliers.find((s) => s.id === selectedSupplier)?.name}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Items</h3>
                <div className="border rounded-md divide-y">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between p-2">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-sm text-muted-foreground">RWF {item.price.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p>
                          {item.quantity} x RWF {item.price.toFixed(2)}
                        </p>
                        <p className="font-medium">RWF {(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>RWF {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Delivery</h3>
                <p>
                  {orderType === "immediate"
                    ? "Immediate delivery (as soon as possible)"
                    : `Scheduled for ${date ? format(date, "PPP") : ""}, ${
                        timeSlot === "morning"
                          ? "Morning (8:00 AM - 12:00 PM)"
                          : timeSlot === "afternoon"
                            ? "Afternoon (12:00 PM - 4:00 PM)"
                            : "Evening (4:00 PM - 8:00 PM)"
                      }`}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </DialogFooter>
          </>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">{renderStepContent()}</DialogContent>
    </Dialog>
  )
}
