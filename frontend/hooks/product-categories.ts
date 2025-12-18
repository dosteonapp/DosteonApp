import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface ProductCategory {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function useProductCategories() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: async (): Promise<ProductCategory[]> => {
      const { data } = await axiosInstance.get("/general/product-categories");
      return data.data.items;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
