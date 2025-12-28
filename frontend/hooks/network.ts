import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

// Types for the API responses
export interface NetworkUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "supplier" | "restaurant";
  active?: boolean;
  created_at: string;
}

export interface DiscoveryUser extends NetworkUser {
  isInNetwork: boolean;
}

export interface NetworkEntry {
  id: string;
  network_user_id: string;
  network_user_type: "supplier" | "restaurant";
  created_at: string;
  networkUser: NetworkUser;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: {
    items: T[];
    pagination: PaginationData;
  };
  success: boolean;
}

export interface NetworkParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Get the appropriate endpoint based on user type
const getEndpoint = (userType: "restaurant" | "supplier", action: string) => {
  return `/${userType}/${action}`;
};

// Discovery Hooks
export const useDiscoverUsers = (
  userType: "restaurant" | "supplier",
  params: NetworkParams = {}
) => {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: ["discover", userType, page, limit, search],
    queryFn: async (): Promise<ApiResponse<DiscoveryUser>> => {
      const endpoint = getEndpoint(userType, "discover");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const { data } = await axiosInstance.get(`${endpoint}?${queryParams}`);
      return data;
    },
  });
};

// Specific discovery endpoints for restaurants/suppliers
export const useDiscoverSuppliers = (params: NetworkParams = {}) => {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: ["discover-suppliers", page, limit, search],
    queryFn: async (): Promise<ApiResponse<DiscoveryUser>> => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const { data } = await axiosInstance.get(
        `/restaurant/network/available?${queryParams}`
      );
      return data;
    },
  });
};

export const useDiscoverRestaurants = (params: NetworkParams = {}) => {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: ["discover-restaurants", page, limit, search],
    queryFn: async (): Promise<ApiResponse<DiscoveryUser>> => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const { data } = await axiosInstance.get(
        `/supplier/network/available?${queryParams}`
      );
      return data;
    },
  });
};

// Network Management Hooks
export const useGetNetwork = (
  userType: "restaurant" | "supplier",
  params: NetworkParams = {}
) => {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: ["network", userType, page, limit, search],
    queryFn: async (): Promise<ApiResponse<NetworkEntry>> => {
      const endpoint = getEndpoint(userType, "network");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const { data } = await axiosInstance.get(`${endpoint}?${queryParams}`);
      return data;
    },
  });
};

// Add user to network
export const useAddToNetwork = (userType: "restaurant" | "supplier") => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const endpoint = getEndpoint(userType, "network/add");
      const { data } = await axiosInstance.post(endpoint, { userId });
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch network queries
      queryClient.invalidateQueries({ queryKey: ["network", userType] });
      queryClient.invalidateQueries({ queryKey: ["discover", userType] });
      queryClient.invalidateQueries({ queryKey: ["discover-suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["discover-restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["network-available"] });

      toast({
        title: "Success",
        description: data.message || "User added to network successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add user to network",
        variant: "destructive",
      });
    },
  });
};

// Remove user from network
export const useRemoveFromNetwork = (userType: "restaurant" | "supplier") => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const endpoint = getEndpoint(userType, `network/remove/${userId}`);
      const { data } = await axiosInstance.delete(endpoint);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch network queries
      queryClient.invalidateQueries({ queryKey: ["network", userType] });
      queryClient.invalidateQueries({ queryKey: ["discover", userType] });
      queryClient.invalidateQueries({ queryKey: ["discover-suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["discover-restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["network-available"] });

      toast({
        title: "Success",
        description: data.message || "User removed from network successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to remove user from network",
        variant: "destructive",
      });
    },
  });
};

// Get available users to add to network
export const useGetAvailableUsers = (
  userType: "restaurant" | "supplier",
  params: NetworkParams = {}
) => {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: ["network-available", userType, page, limit, search],
    queryFn: async (): Promise<ApiResponse<NetworkUser>> => {
      const endpoint = getEndpoint(userType, "network/available");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const { data } = await axiosInstance.get(`${endpoint}?${queryParams}`);
      return data;
    },
  });
};

// Helper hook to get user type from context or auth
export const useUserType = (): "restaurant" | "supplier" => {
  const { user } = useUser();

  if (!user?.role) {
    throw new Error("User role not available");
  }

  return user.role;
};

// Convenience hooks that automatically determine user type
export const useMyNetwork = (params: NetworkParams = {}) => {
  const userType = useUserType();
  return useGetNetwork(userType, params);
};

export const useMyDiscovery = (params: NetworkParams = {}) => {
  const userType = useUserType();
  return useDiscoverUsers(userType, params);
};

export const useAddToMyNetwork = () => {
  const userType = useUserType();
  return useAddToNetwork(userType);
};

export const useRemoveFromMyNetwork = () => {
  const userType = useUserType();
  return useRemoveFromNetwork(userType);
};

export const useMyAvailableUsers = (params: NetworkParams = {}) => {
  const userType = useUserType();
  return useGetAvailableUsers(userType, params);
};

// All types are already exported above
