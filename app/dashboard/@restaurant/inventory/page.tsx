"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
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
import {
  Search,
  Plus,
  Menu,
  Edit,
  Trash2,
  AlertTriangle,
  QrCode,
} from "lucide-react";
import { InventoryItemModal } from "@/components/inventory-item-modal";
import { LogUsageModal } from "@/components/log-usage-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
// Add import for OrderItemModal at the top with other imports
import { OrderItemModal } from "@/components/order-item-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ResponseWithPagination } from "@/types/pagination";
import { Inventory } from "@/types/restaurant";
import axiosInstance from "@/lib/axios";
import { deleteInventoryItem } from "@/lib/services/inventoryService";
import { validateApiResponse } from "@/lib/utils";

// Infinite query for inventory
type InventoryApiResponse = {
  items: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [orderItemOpen, setOrderItemOpen] = useState(false);

  // Search, filter, and pagination state
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [category, setCategory] = useState("all");
  const [stockLevel, setStockLevel] = useState("all");

  // For log usage modal
  const [logUsageOpen, setLogUsageOpen] = useState(false);
  const [logUsageItem, setLogUsageItem] = useState<any>(null);

  // Dummy daily stock log data
  const dummyStockLogs = [
    {
      itemId: "1",
      name: "Tomatoes",
      logs: [
        { date: "2025-08-07", opening: 100, used: 20, closing: 80 },
        { date: "2025-08-08", opening: 80, used: 10, closing: 70 },
        { date: "2025-08-09", opening: 70, used: 15, closing: 55 },
      ],
      unit: "kg",
    },
    {
      itemId: "2",
      name: "Cheese",
      logs: [
        { date: "2025-08-08", opening: 50, used: 5, closing: 45 },
        { date: "2025-08-09", opening: 45, used: 7, closing: 38 },
      ],
      unit: "kg",
    },
  ];

  // Use the user's infinite query style, but debounce the search param
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
  } = useInfiniteQuery<ResponseWithPagination<Inventory, "items">>({
    queryKey: ["inventory", debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = { page: pageParam };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await axiosInstance.get("/restaurant/inventory", {
        params,
      });
      return validateApiResponse(data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      return lastPage?.pagination?.hasNextPage
        ? lastPage?.pagination?.currentPage + 1
        : undefined;
    },
  });

  // Flatten paginated items from infinite query
  const inventoryItems = data?.pages?.flatMap((page) => page.items) || [];
  const pagination = data?.pages?.[data.pages.length - 1]?.pagination;

  const handleAddItem = () => setAddItemOpen(true);

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setEditItemOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const confirmDelete = async () => {
    if (!selectedItem?._id) return;
    setIsDeleting(true);
    try {
      await deleteInventoryItem(selectedItem._id);
      // Optimistically update cache
      queryClient.setQueryData(["inventory", debouncedSearch], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.filter((item: any) => item._id !== selectedItem._id),
          })),
        };
      });
      toast({
        title: "Item Deleted",
        description: `${selectedItem.name} has been removed from your inventory.`,
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete inventory item.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Update the handleOrderItem function
  const handleOrderItem = (item: any) => {
    setSelectedItem(item);
    setOrderItemOpen(true);
  };

  // Handler for log usage
  const handleLogUsage = (item: any) => {
    setLogUsageItem(item);
    setLogUsageOpen(true);
  };

  // Find dummy logs for daily stock tab
  const getLogsForItem = (item: any) => {
    return dummyStockLogs.find((log) => log.name === item.name);
  };

  // For demo, use dummyStockLogs for daily stock tab
  const allStockLogs = dummyStockLogs;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Inventory Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage your restaurant's inventory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
            <CardDescription>
              View and manage all inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search inventory..."
                    className="pl-8 w-full md:w-[300px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {isLoading || isFetching ? (
              <div className="flex justify-center items-center py-10">
                <span className="text-muted-foreground">
                  Loading inventory...
                </span>
              </div>
            ) : isError ? (
              <div className="flex justify-center items-center py-10">
                <span className="text-destructive">
                  Error loading inventory.
                </span>
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <span className="text-muted-foreground">
                  No inventory items found.
                </span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">
                        Current Stock
                      </TableHead>
                      <TableHead className="text-right">Min. Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                      <TableHead className="text-right">Log Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item: any) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.currentStock} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.minimumLevel} {item.unit}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStockLevelVariant(getStockLevel(item)) as any
                            }
                          >
                            {getStockLevel(item)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteItem(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                getStockLevel(item) === "Critical" ||
                                getStockLevel(item) === "Low"
                                  ? "destructive"
                                  : "outline"
                              }
                              onClick={() => handleOrderItem(item)}
                            >
                              {getStockLevel(item) === "Critical" ||
                              getStockLevel(item) === "Low" ? (
                                <AlertTriangle className="mr-1 h-4 w-4" />
                              ) : null}
                              Order
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleLogUsage(item)}
                          >
                            Log Usage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination Controls */}
                {hasNextPage && (
                  <div className="flex justify-center py-4">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="outline"
                    >
                      {isFetchingNextPage ? "Loading more..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* End of inventory card/table */}
      </main>

      {/* Add Item Modal */}
      <InventoryItemModal
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        mode="add"
      />

      {/* Edit Item Modal */}
      {selectedItem && (
        <InventoryItemModal
          open={editItemOpen}
          onOpenChange={setEditItemOpen}
          mode="edit"
          initialData={selectedItem}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedItem?.name} from your
              inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Deleting...</span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Item Modal */}
      {selectedItem && (
        <OrderItemModal
          open={orderItemOpen}
          onOpenChange={setOrderItemOpen}
          item={selectedItem}
        />
      )}

      {/* Log Usage Modal */}
      {logUsageItem && (
        <LogUsageModal
          open={logUsageOpen}
          onOpenChange={setLogUsageOpen}
          item={logUsageItem}
          onSave={(log) => {
            setLogUsageOpen(false);
            // In real app, update logs here
          }}
          latestDate={
            getLogsForItem(logUsageItem)?.logs?.[
              getLogsForItem(logUsageItem)?.logs.length - 1
            ]?.date || "2025-08-09"
          }
          currentLevel={
            getLogsForItem(logUsageItem)?.logs?.[
              getLogsForItem(logUsageItem)?.logs.length - 1
            ]?.closing || 0
          }
        />
      )}
      <Toaster />
    </div>
  );
}

// Helper: get badge variant based on stock level
function getStockLevelVariant(level: string) {
  switch (level) {
    case "Critical":
      return "destructive";
    case "Low":
      return "outline";
    case "Medium":
      return "secondary";
    case "Good":
      return "success";
    default:
      return "outline";
  }
}

// Helper: derive stock level from item (basic logic, adjust as needed)
function getStockLevel(item: any): string {
  if (
    typeof item.currentStock === "number" &&
    typeof item.minimumLevel === "number"
  ) {
    if (item.currentStock <= 0) return "Critical";
    if (item.currentStock < item.minimumLevel) return "Low";
    if (item.currentStock < item.minimumLevel * 2) return "Medium";
    return "Good";
  }
  return "Unknown";
}
