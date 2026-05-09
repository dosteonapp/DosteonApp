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
import { Search, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMyNetwork, useRemoveFromMyNetwork } from "@/hooks/network";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RestaurantsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce the search input with 500ms delay
  const debouncedSearch = useDebounce(searchInput, 500);

  const { toast } = useToast();

  // Use the real API hook with debounced search
  const {
    data: networkResponse,
    isLoading,
    isError,
    error,
  } = useMyNetwork({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
  });

  const removeFromNetworkMutation = useRemoveFromMyNetwork();

  const restaurants = networkResponse?.data?.items || [];
  const pagination = networkResponse?.data?.pagination;

  // Reset to first page when search changes
  useEffect(() => {
    if (debouncedSearch !== searchInput) return; // Only reset when debounced value changes
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleRemoveFromNetwork = async (userId: string) => {
    try {
      await removeFromNetworkMutation.mutateAsync(userId);
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
                Error loading network: {error?.message}
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
            <p className="text-muted-foreground">
              Manage your restaurant partnerships
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/dashboard/restaurants/discover">
                Discover New Restaurants
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Restaurant Partners</CardTitle>
            <CardDescription>
              View and manage your restaurant partnerships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search restaurants..."
                    className="pl-8 w-full md:w-[300px]"
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
                    <TableHead>Connection Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading your network...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : restaurants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <p>No restaurants in your network yet</p>
                          <Button asChild>
                            <Link href="/dashboard/restaurants/discover">
                              Discover Restaurants
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    restaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">
                              {restaurant.networkUser.first_name}{" "}
                              {restaurant.networkUser.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {restaurant.networkUser.active
                                ? "Active"
                                : "Inactive"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{restaurant.networkUser.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {restaurant.network_user_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(restaurant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/restaurants/${restaurant.networkUser.id}`}
                              >
                                View
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove Restaurant
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove{" "}
                                    {restaurant.networkUser.first_name}{" "}
                                    {restaurant.networkUser.last_name} from your
                                    network? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveFromNetwork(
                                        restaurant.networkUser.id
                                      )
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {removeFromNetworkMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Remove"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
