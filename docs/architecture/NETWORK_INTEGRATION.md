# Network Components Integration Guide

This guide shows how to integrate the network API hooks into your existing components. The hooks are now ready to use with real API endpoints.

## Available Hooks

### Discovery Hooks

- `useDiscoverUsers(userType, params)` - General discovery for any user type
- `useDiscoverSuppliers(params)` - For restaurants to discover suppliers
- `useDiscoverRestaurants(params)` - For suppliers to discover restaurants

### Network Management Hooks

- `useMyNetwork(params)` - Get current user's network
- `useAddToMyNetwork()` - Add user to network
- `useRemoveFromMyNetwork()` - Remove user from network
- `useMyAvailableUsers(params)` - Get available users to add

### Parameters

All hooks accept optional parameters:

```typescript
{
  page?: number;
  limit?: number;
  search?: string;
}
```

## Example Usage

### Basic Discovery Component

```tsx
import { useDiscoverSuppliers, useAddToMyNetwork } from "@/hooks/network";

export function DiscoveryComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useDiscoverSuppliers({
    page: currentPage,
    limit: 10,
    search: searchTerm,
  });

  const addToNetworkMutation = useAddToMyNetwork();

  const suppliers = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const handleAddToNetwork = async (userId: string) => {
    try {
      await addToNetworkMutation.mutateAsync(userId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Your component JSX here...
}
```

### Network Management Component

```tsx
import { useMyNetwork, useRemoveFromMyNetwork } from "@/hooks/network";

export function NetworkComponent() {
  const { data, isLoading } = useMyNetwork({ limit: 10 });
  const removeFromNetworkMutation = useRemoveFromMyNetwork();

  const networkUsers = data?.data?.items || [];

  const handleRemoveFromNetwork = async (userId: string) => {
    try {
      await removeFromNetworkMutation.mutateAsync(userId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Your component JSX here...
}
```

## Updated Pages

The following pages have been updated to use real API calls:

### Restaurant Pages

- `/dashboard/suppliers` - Network management for restaurants
- `/dashboard/suppliers/discover` - Discovery page for restaurants to find suppliers

### Supplier Pages

- `/dashboard/restaurants` - Network management for suppliers
- `/dashboard/restaurants/discover` - Discovery page for suppliers to find restaurants

## Data Structure

### Discovery Response

```typescript
{
  message: string;
  data: {
    items: DiscoveryUser[];
    pagination: PaginationData;
  };
  success: boolean;
}
```

### Network Response

```typescript
{
  message: string;
  data: {
    items: NetworkEntry[];
    pagination: PaginationData;
  };
  success: boolean;
}
```

### User Objects

```typescript
// Discovery User
interface DiscoveryUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  accountType: "supplier" | "restaurant";
  createdAt: string;
  isInNetwork: boolean; // Key field for showing connection status
}

// Network Entry
interface NetworkEntry {
  _id: string;
  networkUserId: string;
  networkUserType: "supplier" | "restaurant";
  createdAt: string;
  networkUser: NetworkUser; // Contains user details
}
```

## Error Handling

All hooks include built-in error handling with toast notifications. Errors are automatically displayed to the user, and you can access error state via the `isError` and `error` properties from the hooks.

## Loading States

All hooks provide `isLoading` state that you can use to show loading spinners or skeletons while data is being fetched.

## Pagination

The API returns pagination metadata that you can use to build pagination controls:

```typescript
interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

## Next Steps

1. **Remove all dummy data** from existing components
2. **Replace with API hooks** following the patterns shown above
3. **Add proper loading states** and error handling
4. **Implement pagination** where needed
5. **Add search functionality** using the search parameter

The network functionality is now fully integrated with the real API endpoints!
