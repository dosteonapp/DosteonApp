"use client";

import { useState, useEffect } from "react";
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
import { Search, ArrowLeft, Star, Filter, MapPin, Loader2 } from "lucide-react";
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
import { useDiscoverSuppliers, useAddToMyNetwork } from "@/hooks/network";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

export default function DiscoverSuppliersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState([50]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  // Debounce the search input with 500ms delay
  const debouncedSearch = useDebounce(searchInput, 500);

  const { toast } = useToast();

  // Use the real API hook with debounced search
  const {
    data: suppliersResponse,
    isLoading,
    isError,
    error,
  } = useDiscoverSuppliers({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
  });

  const addToNetworkMutation = useAddToMyNetwork();

  const suppliers = suppliersResponse?.data?.items || [];
  const pagination = suppliersResponse?.data?.pagination;

  // Reset to first page when search changes
  useEffect(() => {
    if (debouncedSearch !== searchInput) return; // Only reset when debounced value changes
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleAddToNetwork = async (userId: string) => {
    try {
      await addToNetworkMutation.mutateAsync(userId);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handlePlaceOrder = (supplier: any) => {
    setSelectedSupplier(supplier);
    setOrderModalOpen(true);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isError) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 space-y-4 p-4 md:p-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-500">
                Error loading suppliers: {error?.message}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <ArrowLeft className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Discover Suppliers</h1>
        </div>
      </header> */}
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
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
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
                    <TableHead>Email</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading suppliers...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No suppliers found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {supplier.firstname} {supplier.lastname}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Member since:{" "}
                              {new Date(
                                supplier.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {supplier.accountType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {supplier.isInNetwork ? (
                            <Badge variant="secondary">Already Connected</Badge>
                          ) : (
                            <Badge variant="outline">Available</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/suppliers/${supplier._id}`}
                              >
                                View
                              </Link>
                            </Button>
                            {supplier.isInNetwork ? (
                              <Button size="sm" variant="secondary" disabled>
                                Already Connected
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleAddToNetwork(supplier._id)}
                                disabled={addToNetworkMutation.isPending}
                              >
                                {addToNetworkMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Add to Network"
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(pagination.currentPage * 10, pagination.totalItems)}{" "}
                  of {pagination.totalItems} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
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
