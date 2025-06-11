"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Menu, Upload, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProductEditPageProps {
  params: {
    id: string
  }
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const { toast } = useToast()
  const [product, setProduct] = useState(getProductById(params.id))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState([
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
  ])

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">The product you're trying to edit doesn't exist.</p>
            <Button asChild>
              <Link href="/supplier/products">Back to Products</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const handleInputChange = (field: string, value: any) => {
    setProduct((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Product Updated",
        description: `${product.name} has been successfully updated.`,
      })
      setIsSubmitting(false)
    }, 1000)
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addImage = () => {
    setImages((prev) => [...prev, "/placeholder.svg?height=200&width=200"])
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Edit Product</h1>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/supplier/products/${params.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Product
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
              <p className="text-muted-foreground">{product.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/supplier/products/${params.id}`}>Cancel</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Units</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
              <TabsTrigger value="images">Images & Media</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>Basic information about your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={product.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g. Organic Tomatoes"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU/Product Code</Label>
                      <Input
                        id="sku"
                        value={product.sku}
                        onChange={(e) => handleInputChange("sku", e.target.value)}
                        placeholder="e.g. ORG-TOM-001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={product.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Produce">Produce</SelectItem>
                        <SelectItem value="Meat & Poultry">Meat & Poultry</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Dry Goods">Dry Goods</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                        <SelectItem value="Seafood">Seafood</SelectItem>
                        <SelectItem value="Bakery">Bakery</SelectItem>
                        <SelectItem value="Spices & Herbs">Spices & Herbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={product.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your product in detail..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin/Source</Label>
                      <Input
                        id="origin"
                        value={product.origin || ""}
                        onChange={(e) => handleInputChange("origin", e.target.value)}
                        placeholder="e.g. Local Farm, Rwanda"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={product.brand || ""}
                        onChange={(e) => handleInputChange("brand", e.target.value)}
                        placeholder="e.g. Fresh Valley"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Units</CardTitle>
                  <CardDescription>Set pricing and unit information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Unit Price (RWF) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value))}
                        placeholder="e.g. 2500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit of Measurement *</Label>
                      <Select value={product.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="g">Gram (g)</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="ml">Milliliter (ml)</SelectItem>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="carton">Carton</SelectItem>
                          <SelectItem value="dozen">Dozen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimumOrder">Minimum Order Quantity</Label>
                      <Input
                        id="minimumOrder"
                        type="number"
                        min="1"
                        value={product.minimumOrder || 1}
                        onChange={(e) => handleInputChange("minimumOrder", Number.parseInt(e.target.value))}
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wholesalePrice">Wholesale Price (Optional)</Label>
                      <Input
                        id="wholesalePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.wholesalePrice || ""}
                        onChange={(e) => handleInputChange("wholesalePrice", Number.parseFloat(e.target.value))}
                        placeholder="e.g. 2200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wholesaleMinimum">Wholesale Minimum Quantity</Label>
                      <Input
                        id="wholesaleMinimum"
                        type="number"
                        min="1"
                        value={product.wholesaleMinimum || ""}
                        onChange={(e) => handleInputChange("wholesaleMinimum", Number.parseInt(e.target.value))}
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Manage stock levels and inventory settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">Current Stock Quantity *</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        min="0"
                        value={product.currentStock}
                        onChange={(e) => handleInputChange("currentStock", Number.parseInt(e.target.value))}
                        placeholder="e.g. 150"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        min="0"
                        value={product.lowStockThreshold}
                        onChange={(e) => handleInputChange("lowStockThreshold", Number.parseInt(e.target.value))}
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorderPoint">Reorder Point</Label>
                      <Input
                        id="reorderPoint"
                        type="number"
                        min="0"
                        value={product.reorderPoint}
                        onChange={(e) => handleInputChange("reorderPoint", Number.parseInt(e.target.value))}
                        placeholder="e.g. 75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shelfLife">Shelf Life (Days)</Label>
                      <Input
                        id="shelfLife"
                        type="number"
                        min="1"
                        value={product.shelfLife || ""}
                        onChange={(e) => handleInputChange("shelfLife", Number.parseInt(e.target.value))}
                        placeholder="e.g. 7"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storageConditions">Storage Conditions</Label>
                      <Select
                        value={product.storageConditions || ""}
                        onValueChange={(value) => handleInputChange("storageConditions", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select storage type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="room-temperature">Room Temperature</SelectItem>
                          <SelectItem value="refrigerated">Refrigerated (2-8°C)</SelectItem>
                          <SelectItem value="frozen">Frozen (-18°C)</SelectItem>
                          <SelectItem value="dry-cool">Dry & Cool</SelectItem>
                          <SelectItem value="climate-controlled">Climate Controlled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="trackBatches"
                      checked={product.trackBatches || false}
                      onCheckedChange={(checked) => handleInputChange("trackBatches", checked)}
                    />
                    <Label htmlFor="trackBatches">Enable batch/lot tracking</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload and manage product images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="h-32 border-dashed" onClick={addImage}>
                      <Upload className="h-6 w-6 mb-2" />
                      Add Image
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload high-quality images of your product. The first image will be used as the main product image.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>Additional product configuration options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seasonality">Seasonality</Label>
                      <Select
                        value={product.seasonality || ""}
                        onValueChange={(value) => handleInputChange("seasonality", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select seasonality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="year-round">Available Year Round</SelectItem>
                          <SelectItem value="spring">Spring Only</SelectItem>
                          <SelectItem value="summer">Summer Only</SelectItem>
                          <SelectItem value="fall">Fall Only</SelectItem>
                          <SelectItem value="winter">Winter Only</SelectItem>
                          <SelectItem value="seasonal">Seasonal Availability</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leadTime">Lead Time (Days)</Label>
                      <Input
                        id="leadTime"
                        type="number"
                        min="0"
                        value={product.leadTime || ""}
                        onChange={(e) => handleInputChange("leadTime", Number.parseInt(e.target.value))}
                        placeholder="e.g. 2"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isOrganic"
                        checked={product.isOrganic || false}
                        onCheckedChange={(checked) => handleInputChange("isOrganic", checked)}
                      />
                      <Label htmlFor="isOrganic">Organic certified</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isLocallySourced"
                        checked={product.isLocallySourced || false}
                        onCheckedChange={(checked) => handleInputChange("isLocallySourced", checked)}
                      />
                      <Label htmlFor="isLocallySourced">Locally sourced</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={product.status === "active"}
                        onCheckedChange={(checked) => handleInputChange("status", checked ? "active" : "inactive")}
                      />
                      <Label htmlFor="isActive">Product is active and available for ordering</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={product.tags?.join(", ") || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "tags",
                          e.target.value.split(",").map((tag) => tag.trim()),
                        )
                      }
                      placeholder="e.g. fresh, organic, local, premium"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </main>
    </div>
  )
}

// Mock function to get product by ID for editing
function getProductById(id: string) {
  const products = {
    "prod-1": {
      id: "prod-1",
      name: "Organic Tomatoes",
      sku: "ORG-TOM-001",
      category: "Produce",
      price: 2500,
      unit: "kg",
      description:
        "Fresh organic tomatoes sourced from local farms. Perfect for salads, cooking, and sauces. Grown without pesticides or artificial fertilizers.",
      status: "active",
      currentStock: 150,
      lowStockThreshold: 50,
      reorderPoint: 75,
      minimumOrder: 5,
      wholesalePrice: 2200,
      wholesaleMinimum: 50,
      shelfLife: 7,
      storageConditions: "room-temperature",
      trackBatches: true,
      seasonality: "year-round",
      leadTime: 2,
      isOrganic: true,
      isLocallySourced: true,
      origin: "Local Farm, Rwanda",
      brand: "Fresh Valley",
      tags: ["fresh", "organic", "local", "premium"],
    },
  }

  return products[id as keyof typeof products] || null
}
