"use client";

import type React from "react";

import { useState } from "react";
import {
  Check,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Star,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardOrderModal({
  open,
  onOpenChange,
}: DashboardOrderModalProps) {
  const [step, setStep] = useState<"item" | "supplier" | "details" | "success">(
    "item"
  );
  const [formData, setFormData] = useState({
    item: "",
    itemName: "",
    category: "",
    quantity: "",
    unit: "kg",
    supplier: "",
    deliveryDate: "",
    notes: "",
  });

  const [warnings, setWarnings] = useState<{
    quantity?: string;
    deliveryDate?: string;
  }>({});

  // Sample inventory items
  const inventoryItems = [
    {
      id: "1",
      name: "Tomatoes",
      category: "Produce",
      unit: "kg",
      currentStock: 2.5,
      minLevel: 5,
    },
    {
      id: "2",
      name: "Onions",
      category: "Produce",
      unit: "kg",
      currentStock: 5,
      minLevel: 8,
    },
    {
      id: "3",
      name: "Chicken Breast",
      category: "Meat & Poultry",
      unit: "kg",
      currentStock: 8,
      minLevel: 10,
    },
    {
      id: "4",
      name: "Olive Oil",
      category: "Dry Goods",
      unit: "liter",
      currentStock: 5,
      minLevel: 2,
    },
    {
      id: "5",
      name: "Rice",
      category: "Dry Goods",
      unit: "kg",
      currentStock: 10,
      minLevel: 5,
    },
    {
      id: "6",
      name: "Milk",
      category: "Dairy",
      unit: "liter",
      currentStock: 4,
      minLevel: 6,
    },
    {
      id: "7",
      name: "Potatoes",
      category: "Produce",
      unit: "kg",
      currentStock: 15,
      minLevel: 10,
    },
    {
      id: "8",
      name: "Flour",
      category: "Dry Goods",
      unit: "kg",
      currentStock: 3,
      minLevel: 5,
    },
  ];

  // Suggested suppliers based on the item
  const suggestedSuppliers = [
    {
      name: "Kigali Farms",
      rating: 4.8,
      fulfillmentRate: "98%",
      responseTime: "30 min",
      priceCompetitiveness: "Low",
      deliveryFlexibility: "High",
      categories: ["Produce"],
    },
    {
      name: "Rwanda Meat Suppliers",
      rating: 4.5,
      fulfillmentRate: "95%",
      responseTime: "45 min",
      priceCompetitiveness: "Medium",
      deliveryFlexibility: "Medium",
      categories: ["Meat & Poultry"],
    },
    {
      name: "Nyarutarama Grocers",
      rating: 4.2,
      fulfillmentRate: "92%",
      responseTime: "1 hr",
      priceCompetitiveness: "High",
      deliveryFlexibility: "Medium",
      categories: ["Produce", "Dry Goods"],
    },
    {
      name: "Dairy Fresh",
      rating: 4.6,
      fulfillmentRate: "96%",
      responseTime: "25 min",
      priceCompetitiveness: "Medium",
      deliveryFlexibility: "High",
      categories: ["Dairy"],
    },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If selecting an item, update related fields
    if (field === "item") {
      const selectedItem = inventoryItems.find((item) => item.id === value);
      if (selectedItem) {
        setFormData((prev) => ({
          ...prev,
          itemName: selectedItem.name,
          category: selectedItem.category,
          unit: selectedItem.unit,
          quantity:
            selectedItem.currentStock < selectedItem.minLevel
              ? (selectedItem.minLevel - selectedItem.currentStock).toFixed(1)
              : "1",
        }));
      }
    }

    // Validate as user types
    validateField(field, value);
  };

  const validateField = (field: string, value: string) => {
    const newWarnings = { ...warnings };

    if (field === "quantity") {
      const quantity = Number.parseFloat(value);

      if (quantity <= 0) {
        newWarnings.quantity = "Quantity must be greater than zero";
      } else if (quantity > 100) {
        newWarnings.quantity =
          "Large order quantity. Please confirm this is correct.";
      } else {
        delete newWarnings.quantity;
      }
    }

    if (field === "deliveryDate") {
      const deliveryDate = new Date(value);
      const today = new Date();

      if (deliveryDate < today) {
        newWarnings.deliveryDate = "Delivery date cannot be in the past";
      } else {
        delete newWarnings.deliveryDate;
      }
    }

    setWarnings(newWarnings);
  };

  const handleNextStep = () => {
    if (step === "item" && formData.item) {
      setStep("supplier");
    } else if (step === "supplier" && formData.supplier) {
      setStep("details");
    }
  };

  const handlePreviousStep = () => {
    if (step === "supplier") {
      setStep("item");
    } else if (step === "details") {
      setStep("supplier");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Here you would typically send the order to your backend
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      setStep("success");
    }, 500);
  };

  const handleClose = () => {
    // Reset the form when closing
    setStep("item");
    setFormData({
      item: "",
      itemName: "",
      category: "",
      quantity: "",
      unit: "kg",
      supplier: "",
      deliveryDate: "",
      notes: "",
    });
    onOpenChange(false);
  };

  const getPriceIndicator = (level: string) => {
    switch (level) {
      case "Low":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "Medium":
        return null;
      case "High":
        return <TrendingDown className="h-4 w-4 text-secondary-500" />;
      default:
        return null;
    }
  };

  const getRelevantSuppliers = () => {
    if (!formData.category) return suggestedSuppliers;
    return suggestedSuppliers.filter((supplier) =>
      supplier.categories.includes(formData.category)
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case "item":
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Order - Select Item</DialogTitle>
              <DialogDescription>
                Select an item from your inventory to order
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search items..."
                    className="pl-8"
                  />
                </div>

                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Items</TabsTrigger>
                    <TabsTrigger value="low">Low Stock</TabsTrigger>
                    <TabsTrigger value="critical">Critical</TabsTrigger>
                  </TabsList>
                  <div className=" max-h">
                    <TabsContent value="all" className="space-y-2 mt-2">
                      {inventoryItems.map((item) => (
                        <Card
                          key={item.id}
                          className={`cursor-pointer border-2 ${
                            formData.item === item.id
                              ? "border-primary-500 bg-primary-50"
                              : ""
                          }`}
                          onClick={() => handleChange("item", item.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.category}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {item.currentStock} {item.unit}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Min: {item.minLevel} {item.unit}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    <TabsContent value="low" className="space-y-2 mt-2">
                      {inventoryItems
                        .filter(
                          (item) =>
                            item.currentStock < item.minLevel &&
                            item.currentStock > item.minLevel * 0.5
                        )
                        .map((item) => (
                          <Card
                            key={item.id}
                            className={`cursor-pointer border-2 ${
                              formData.item === item.id
                                ? "border-primary-500 bg-primary-50"
                                : ""
                            }`}
                            onClick={() => handleChange("item", item.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.category}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {item.currentStock} {item.unit}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Min: {item.minLevel} {item.unit}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </TabsContent>
                    <TabsContent value="critical" className="space-y-2 mt-2">
                      {inventoryItems
                        .filter(
                          (item) => item.currentStock <= item.minLevel * 0.5
                        )
                        .map((item) => (
                          <Card
                            key={item.id}
                            className={`cursor-pointer border-2 ${
                              formData.item === item.id
                                ? "border-primary-500 bg-primary-50"
                                : ""
                            }`}
                            onClick={() => handleChange("item", item.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.category}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {item.currentStock} {item.unit}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Min: {item.minLevel} {item.unit}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={!formData.item}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Next
              </Button>
            </DialogFooter>
          </>
        );
      case "supplier":
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Order - Select Supplier</DialogTitle>
              <DialogDescription>
                Choose a supplier for {formData.itemName}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <Label>Recommended Suppliers</Label>
                <div className="grid gap-3">
                  {getRelevantSuppliers().map((supplier) => (
                    <Card
                      key={supplier.name}
                      className={`cursor-pointer border-2 ${
                        formData.supplier === supplier.name
                          ? "border-primary-500 bg-primary-50"
                          : ""
                      }`}
                      onClick={() => handleChange("supplier", supplier.name)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{supplier.name}</div>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs ml-1">
                                {supplier.rating}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            {getPriceIndicator(supplier.priceCompetitiveness)}
                            Price: {supplier.priceCompetitiveness}
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            Fulfillment Rate: {supplier.fulfillmentRate}
                          </div>
                          <div>Response Time: {supplier.responseTime}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
              >
                Back
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={!formData.supplier}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Next
              </Button>
            </DialogFooter>
          </>
        );
      case "details":
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Order - Order Details</DialogTitle>
              <DialogDescription>
                Finalize your order for {formData.itemName} from{" "}
                {formData.supplier}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Quantity to Order ({formData.unit})
                    </Label>
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
                    <Label htmlFor="deliveryDate">
                      Requested Delivery Date
                    </Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) =>
                        handleChange("deliveryDate", e.target.value)
                      }
                      required
                    />
                    {warnings.deliveryDate && (
                      <Alert variant="warning" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {warnings.deliveryDate}
                        </AlertDescription>
                      </Alert>
                    )}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  Place Order
                </Button>
              </DialogFooter>
            </form>
          </>
        );
      case "success":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-secondary-500">
                <Check className="h-6 w-6" />
                Order Placed Successfully
              </DialogTitle>
              <DialogDescription>
                Your order for {formData.itemName} has been sent to{" "}
                {formData.supplier}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Item
                    </p>
                    <p>{formData.itemName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Quantity
                    </p>
                    <p>
                      {formData.quantity} {formData.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Supplier
                    </p>
                    <p>{formData.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Requested Delivery
                    </p>
                    <p>
                      {formData.deliveryDate
                        ? new Date(formData.deliveryDate).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                  {formData.notes && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Notes
                      </p>
                      <p>{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("item");
                  setFormData({
                    item: "",
                    itemName: "",
                    category: "",
                    quantity: "",
                    unit: "kg",
                    supplier: "",
                    deliveryDate: "",
                    notes: "",
                  });
                }}
              >
                Place Another Order
              </Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
