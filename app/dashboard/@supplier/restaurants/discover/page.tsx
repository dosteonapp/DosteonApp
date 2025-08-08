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
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDiscoverRestaurants, useAddToMyNetwork } from "@/hooks/network";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

export default function DiscoverRestaurantsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounce the search input with 500ms delay
  const debouncedSearch = useDebounce(searchInput, 500);

  const { toast } = useToast();

  // Use the real API hook with debounced search
  const {
    data: restaurantsResponse,
    isLoading,
    isError,
    error,
  } = useDiscoverRestaurants({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
  });

  const addToNetworkMutation = useAddToMyNetwork();

  const restaurants = restaurantsResponse?.data?.items || [];
  const pagination = restaurantsResponse?.data?.pagination;

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
                Error loading restaurants: {error?.message}
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
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/restaurants">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Discover New Restaurants
              </h1>
              <p className="text-muted-foreground">
                Find and connect with new restaurant partners
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Restaurants</CardTitle>
            <CardDescription>
              Browse and connect with restaurants looking for suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search restaurants..."
                    className="pl-8 w-full"
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant Name</TableHead>
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
                          <span>Loading restaurants...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : restaurants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No restaurants found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    restaurants.map((restaurant) => (
                      <TableRow key={restaurant._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {restaurant.firstname} {restaurant.lastname}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Member since:{" "}
                              {new Date(
                                restaurant.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{restaurant.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {restaurant.accountType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {restaurant.isInNetwork ? (
                            <Badge variant="secondary">Already Connected</Badge>
                          ) : (
                            <Badge variant="outline">Available</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/restaurants/${restaurant._id}`}
                              >
                                View
                              </Link>
                            </Button>
                            {restaurant.isInNetwork ? (
                              <Button size="sm" variant="secondary" disabled>
                                Already Connected
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleAddToNetwork(restaurant._id)
                                }
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
      </main>
    </div>
  );
}
