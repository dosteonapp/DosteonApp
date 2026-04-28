"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { useProductCategories } from "@/hooks/product-categories";
import { Checkbox } from "@/components/ui/checkbox";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded?: (product: any) => void;
}

export function AddProductModal({
  open,
  onOpenChange,
  onProductAdded,
}: AddProductModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedCanonical, setSelectedCanonical] = useState<string>("");
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: "",
    unit: "kg",
    minimumLevel: "",
    preferredSuppliers: "",
    storageLocation: "",
    expiryDate: "",
    sku: "",
  });

  const {
    data: categories,
    isLoading: loadingCategories,
    isError: errorCategories,
  } = useProductCategories();

  useEffect(() => {
    if (open) {
        setCatalogLoading(true);
        restaurantOpsService.getCanonicalCatalog().then(data => {
            setCatalogItems(data || []);
            setCatalogLoading(false);
        }).catch(() => setCatalogLoading(false));
    }
  }, [open]);

  const handleCanonicalSelect = (canonicalId: string) => {
    setSelectedCanonical(canonicalId);
    // Reset custom flag when a canonical item is chosen
    if (canonicalId) {
      setIsCustomProduct(false);
    }
    if (!canonicalId) return;

    const item = catalogItems.find((i) => i.id === canonicalId);
    if (item) {
      setFormData((prev) => ({
        ...prev,
        name: item.name,
        category: item.category,
        unit: item.base_unit || "kg",
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce search-before-create: either a canonical must be
    // selected, or the user must explicitly confirm creating a
    // brand-new custom product.
    if (!selectedCanonical && !isCustomProduct) {
      toast({
        title: "Select a standard item or confirm custom",
        description:
          "Please choose a product from the catalog, or tick the custom product checkbox if this item truly does not exist in the catalog.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category || undefined,
        currentStock: formData.currentStock ? Number(formData.currentStock) : undefined,
        unit: formData.unit || undefined,
        location: formData.storageLocation || undefined,
        imageUrl: undefined,
        canonicalId: selectedCanonical || undefined,
      };

      const res = await restaurantOpsService.addItem(payload);
      if (onProductAdded && res.item) {
        onProductAdded(res.item);
      }
      toast({
        title: "Inventory Item Added",
        description: `${formData.name} has been added to your inventory.`,
      });
      setFormData({
        name: "",
        category: "",
        currentStock: "",
        unit: "kg",
        minimumLevel: "",
        preferredSuppliers: "",
        storageLocation: "",
        expiryDate: "",
        sku: "",
      });
      setSelectedCanonical("");
      setIsCustomProduct(false);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to add inventory item.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          
          {/* Canonical Selector */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                  <Label className="text-indigo-900 font-bold flex items-center gap-2">
                    <Search className="h-4 w-4" /> Kigali Seed Catalog
                  </Label>
                  <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-200">Auto-fill</Badge>
              </div>
              <p className="text-xs text-indigo-700/70">Select a standard item to automatically fill in details, or explicitly confirm that you are creating a brand new product.</p>
              
              <Select value={selectedCanonical} onValueChange={handleCanonicalSelect}>
                <SelectTrigger className="bg-white border-indigo-200 focus:ring-indigo-500/20 shadow-sm h-11">
                  <SelectValue placeholder={catalogLoading ? "Loading catalog..." : "Search for standard products..."} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {catalogItems.length === 0 && !catalogLoading ? (
                    <div className="p-4 text-center text-sm text-slate-500">No catalog items available</div>
                  ) : (
                    catalogItems.map(item => (
                      <SelectItem key={item.id} value={item.id} className="py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1E293B]">{item.name}</span>
                          <span className="text-xs text-slate-500">{item.category}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="custom-product"
                  checked={isCustomProduct}
                  onCheckedChange={(checked) =>
                    setIsCustomProduct(Boolean(checked))
                  }
                />
                <Label
                  htmlFor="custom-product"
                  className="text-xs text-indigo-800"
                >
                  This product is not in the catalog – create as a custom item.
                </Label>
              </div>
          </div>

          <div className="grid gap-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Organic Tomatoes"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                  required
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
                <Label htmlFor="currentStock">Current Stock *</Label>
                <Input
                  id="currentStock"
                  name="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={handleChange}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. 100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                  required
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
                <Label htmlFor="minimumLevel">Minimum Level *</Label>
                <Input
                  id="minimumLevel"
                  name="minimumLevel"
                  type="number"
                  min="0"
                  value={formData.minimumLevel}
                  onChange={handleChange}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. 10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredSuppliers">
                  Preferred Suppliers (comma separated IDs)
                </Label>
                <Input
                  id="preferredSuppliers"
                  name="preferredSuppliers"
                  value={formData.preferredSuppliers}
                  onChange={handleChange}
                  placeholder="e.g. 64a1b2c3d4e5f6789012345b,64a1b2c3d4e5f6789012345e"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storageLocation">Storage Location</Label>
                <Input
                  id="storageLocation"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  placeholder="e.g. Cold Storage Room A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Removed stockQuantity and sku fields as per new API */}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
