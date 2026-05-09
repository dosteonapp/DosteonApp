"use client";

import type React from "react";
import { useState } from "react";
import { addInventoryItem, updateInventoryItem } from "@/lib/services/inventoryService";
import { useQueryClient } from "@tanstack/react-query";
import { useProductCategories } from "@/hooks/product-categories";
import { useToast } from "@/hooks/use-toast";
import { Check, AlertTriangle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InventoryItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: any;
}

export function InventoryItemModal({
  open,
  onOpenChange,
  mode,
  initialData,
}: InventoryItemModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    currentStock: initialData?.currentStock || "",
    unit: initialData?.unit || "",
    minimumLevel: initialData?.minimumLevel || "",
    preferredSuppliers: initialData?.preferredSuppliers || [],
    storageLocation: initialData?.storageLocation || "",
    expiryDate: initialData?.expiryDate || "",
  });

  const {
    data: categories,
    isLoading: loadingCategories,
    isError: errorCategories,
  } = useProductCategories();

  const [warnings, setWarnings] = useState<{
    minimumLevel?: string;
    currentStock?: string;
    expiryDate?: string;
  }>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field === "preferredSuppliers") {
        return { ...prev, [field]: value.split(",").map((s) => s.trim()) };
      }
      return { ...prev, [field]: value };
    });
    validateField(field, value);
  };

  const validateField = (field: string, value: string) => {
    const newWarnings = { ...warnings };

    if (field === "minimumLevel" && formData.currentStock) {
      const minimumLevel = Number.parseFloat(value);
      const currentStock = Number.parseFloat(formData.currentStock);
      if (minimumLevel > currentStock) {
        newWarnings.minimumLevel = "Minimum level is higher than current stock";
      } else {
        delete newWarnings.minimumLevel;
      }
    }

    if (field === "currentStock" && formData.minimumLevel) {
      const minimumLevel = Number.parseFloat(formData.minimumLevel);
      const currentStock = Number.parseFloat(value);
      if (minimumLevel > currentStock) {
        newWarnings.currentStock = "Current stock is lower than minimum level";
      } else {
        delete newWarnings.currentStock;
      }
    }

    if (field === "expiryDate") {
      const expiryDate = new Date(value);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      if (expiryDate < today) {
        newWarnings.expiryDate = "Expiry date is in the past";
      } else if (expiryDate < thirtyDaysFromNow) {
        newWarnings.expiryDate = "Item will expire within 30 days";
      } else {
        delete newWarnings.expiryDate;
      }
    }

    setWarnings(newWarnings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        currentStock: Number(formData.currentStock),
        unit: formData.unit,
        minimumLevel: Number(formData.minimumLevel),
        preferredSuppliers: formData.preferredSuppliers?.length
          ? formData.preferredSuppliers
          : undefined,
        storageLocation: formData.storageLocation || undefined,
        expiryDate: formData.expiryDate || undefined,
      };
      if (mode === "add") {
        await addInventoryItem(payload);
        toast({
          title: "Inventory Item Added",
          description: `${formData.name} has been added to your inventory.`,
        });
      } else if (mode === "edit" && initialData?._id) {
        await updateInventoryItem(initialData._id, payload);
        // Optimistically update cache
        queryClient.setQueryData(["inventory", ""], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) =>
                item._id === initialData._id ? { ...item, ...payload } : item
              ),
            })),
          };
        });
        toast({
          title: "Inventory Item Updated",
          description: `${formData.name} has been updated in your inventory.`,
        });
      }
      setStep("success");
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || (mode === "add" ? "Failed to add inventory item." : "Failed to update inventory item."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset the form when closing
    setStep("form");
    onOpenChange(false);
  };

  const resetAndClose = () => {
    setStep("form");
    setFormData({
      name: "",
      category: "",
      currentStock: "",
      unit: "",
      minimumLevel: "",
      preferredSuppliers: [],
      storageLocation: "",
      expiryDate: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {mode === "add"
                  ? "Add New Inventory Item"
                  : "Edit Inventory Item"}
              </DialogTitle>
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
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                      disabled={loadingCategories || errorCategories}
                    >
                      <SelectTrigger id="category">
                        <SelectValue
                          placeholder={
                            loadingCategories
                              ? "Loading..."
                              : errorCategories
                              ? "Failed to load"
                              : "Select category"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCategories && (
                          <SelectItem value="" disabled>
                            Loading...
                          </SelectItem>
                        )}
                        {errorCategories && (
                          <SelectItem value="" disabled>
                            Error loading categories
                          </SelectItem>
                        )}
                        {categories &&
                          categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
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
                      onChange={(e) =>
                        handleChange("currentStock", e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      required
                    />
                    {warnings.currentStock && (
                      <Alert variant="warning" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {warnings.currentStock}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => handleChange("unit", value)}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="g">Gram (g)</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="ml">Milliliter (ml)</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
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
                      value={formData.minimumLevel}
                      onChange={(e) =>
                        handleChange("minimumLevel", e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      required
                    />
                    {warnings.minimumLevel && (
                      <Alert variant="destructive" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {warnings.minimumLevel}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Preferred Supplier</Label>
                    <Input
                      id="preferredSuppliers"
                      value={formData.preferredSuppliers.join(", ")}
                      onChange={(e) =>
                        handleChange("preferredSuppliers", e.target.value)
                      }
                      placeholder="Comma separated supplier IDs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Storage Location</Label>
                    <Input
                      id="location"
                      value={formData.storageLocation}
                      onChange={(e) =>
                        handleChange("storageLocation", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">
                      Expiry Date (if applicable)
                    </Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        handleChange("expiryDate", e.target.value)
                      }
                    />
                    {warnings.expiryDate && (
                      <Alert variant="destructive" className="mt-2 py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {warnings.expiryDate}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Adding..."
                    : mode === "add"
                    ? "Add Item"
                    : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-secondary-500">
                <Check className="h-6 w-6" />
                {mode === "add"
                  ? "Item Added Successfully"
                  : "Item Updated Successfully"}
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
                    <p className="text-sm font-medium text-muted-foreground">
                      Item Name
                    </p>
                    <p>{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p>{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Stock
                    </p>
                    <p>
                      {formData.currentStock} {formData.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Minimum Level
                    </p>
                    <p>
                      {formData.minimumLevel} {formData.unit}
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
  );
}
