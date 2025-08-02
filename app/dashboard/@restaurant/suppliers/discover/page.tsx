"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Star, Filter, MapPin } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { NewSupplierOrderModal } from "@/components/new-supplier-order-modal";

// Sample data for discover suppliers
const discoverSuppliers = [
  {
    id: "new-supplier-1",
    name: "Organic Harvest Co.",
    description: "Specializing in locally grown organic produce and herbs",
    categories: ["Produce", "Specialty"],
    distance: 12,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: "new-supplier-2",
    name: "Premium Meats Rwanda",
    description: "High-quality, ethically raised meats from local farms",
    categories: ["Meat & Poultry"],
    distance: 8,
    rating: 4.5,
    reviewCount: 87,
  },
  {
    id: "new-supplier-3",
    name: "Kigali Bakery Supplies",
    description: "Fresh breads, pastries, and baking ingredients",
    categories: ["Bakery", "Dry Goods"],
    distance: 5,
    rating: 4.2,
    reviewCount: 56,
  },
  {
    id: "new-supplier-4",
    name: "Lake Kivu Seafood",
    description: "Fresh fish and seafood from Lake Kivu and imported options",
    categories: ["Seafood"],
    distance: 35,
    rating: 4.7,
    reviewCount: 92,
  },
  {
    id: "new-supplier-5",
    name: "Rwanda Coffee Collective",
    description: "Premium Rwandan coffee beans and specialty beverages",
    categories: ["Beverages", "Specialty"],
    distance: 15,
    rating: 4.9,
    reviewCount: 143,
  },
  {
    id: "new-supplier-6",
    name: "Nyamirambo Dairy Cooperative",
    description:
      "Fresh milk, cheese, and other dairy products from local farms",
    categories: ["Dairy"],
    distance: 18,
    rating: 4.3,
    reviewCount: 78,
  },
  {
    id: "new-supplier-7",
    name: "East African Imports",
    description: "Specialty ingredients and dry goods from across East Africa",
    categories: ["Dry Goods", "Specialty"],
    distance: 22,
    rating: 4.1,
    reviewCount: 64,
  },
  {
    id: "new-supplier-8",
    name: "Green Valley Farms",
    description: "Sustainable farming with a wide range of fresh produce",
    categories: ["Produce"],
    distance: 30,
    rating: 4.6,
    reviewCount: 112,
  },
  {
    id: "new-supplier-9",
    name: "Craft Beverage Distributors",
    description: "Local craft beers, wines, and non-alcoholic specialty drinks",
    categories: ["Beverages"],
    distance: 14,
    rating: 4.4,
    reviewCount: 89,
  },
  {
    id: "new-supplier-10",
    name: "Spice Route Trading",
    description: "Premium spices, herbs, and specialty ingredients",
    categories: ["Dry Goods", "Specialty"],
    distance: 25,
    rating: 4.7,
    reviewCount: 103,
  },
];

export default function DiscoverSuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState([50]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  // Filter suppliers based on search term and filters
  const filteredSuppliers = discoverSuppliers.filter((supplier) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.categories.some((cat) =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      supplier.categories.some((cat) => selectedCategories.includes(cat));

    // Distance filter
    const matchesDistance = supplier.distance <= selectedDistance[0];

    // Rating filter
    const matchesRating = supplier.rating >= selectedRating;

    return matchesSearch && matchesCategory && matchesDistance && matchesRating;
  });

  const handlePlaceOrder = (supplier: any) => {
    setSelectedSupplier(supplier);
    setOrderModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <ArrowLeft className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Discover Suppliers</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/suppliers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Discover New Suppliers
              </h1>
              <p className="text-muted-foreground">
                Find and connect with new suppliers in your area
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Suppliers</CardTitle>
            <CardDescription>
              Browse and filter suppliers that match your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search suppliers..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Suppliers</SheetTitle>
                      <SheetDescription>
                        Narrow down suppliers based on your requirements
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Categories</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Produce",
                            "Meat & Poultry",
                            "Dairy",
                            "Dry Goods",
                            "Beverages",
                            "Seafood",
                            "Bakery",
                            "Specialty",
                          ].map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={category}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCategories([
                                      ...selectedCategories,
                                      category,
                                    ]);
                                  } else {
                                    setSelectedCategories(
                                      selectedCategories.filter(
                                        (c) => c !== category
                                      )
                                    );
                                  }
                                }}
                              />
                              <Label htmlFor={category}>{category}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Distance (km)</h3>
                        <Slider
                          defaultValue={[50]}
                          max={100}
                          step={5}
                          value={selectedDistance}
                          onValueChange={setSelectedDistance}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0 km</span>
                          <span>{selectedDistance[0]} km</span>
                          <span>100 km</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Minimum Rating</h3>
                        <Select
                          value={selectedRating.toString()}
                          onValueChange={(value) =>
                            setSelectedRating(Number(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any Rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Any Rating</SelectItem>
                            <SelectItem value="3">3+ Stars</SelectItem>
                            <SelectItem value="4">4+ Stars</SelectItem>
                            <SelectItem value="4.5">4.5+ Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedCategories([]);
                          setSelectedDistance([50]);
                          setSelectedRating(0);
                        }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Select defaultValue="distance">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No suppliers found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {supplier.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {supplier.categories.map((category) => (
                              <Badge
                                key={category}
                                variant="outline"
                                className="text-xs"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            {supplier.distance} km
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {Array.from({
                              length: Math.floor(supplier.rating),
                            }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-primary text-primary"
                              />
                            ))}
                            {supplier.rating % 1 !== 0 && (
                              <Star className="h-4 w-4 fill-primary text-primary opacity-50" />
                            )}
                            <span className="ml-1 text-sm">
                              ({supplier.reviewCount})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/suppliers/discover/${supplier.id}`}
                              >
                                View
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handlePlaceOrder(supplier)}
                            >
                              Place Order
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {selectedSupplier && (
          <NewSupplierOrderModal
            open={orderModalOpen}
            onOpenChange={setOrderModalOpen}
            supplier={selectedSupplier}
          />
        )}
      </main>
    </div>
  );
}
