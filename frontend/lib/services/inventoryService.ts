import axiosInstance from "@/lib/axios";

export async function deleteInventoryItem(id: string) {
  const response = await axiosInstance.delete(`/restaurant/inventory/${id}`);
  return response.data;
}
export async function updateInventoryItem(
  id: string,
  data: {
    name?: string;
    category?: string;
    currentStock?: number;
    unit?: string;
    minimumLevel?: number;
    preferredSuppliers?: string[];
    storageLocation?: string;
    expiryDate?: string;
  }
) {
  const response = await axiosInstance.patch(
    `/restaurant/inventory/${id}`,
    data
  );
  return response.data;
}


export async function addInventoryItem(data: {
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minimumLevel: number;
  preferredSuppliers?: string[];
  storageLocation?: string;
  expiryDate?: string;
}) {
  const response = await axiosInstance.post("/restaurant/inventory", data);
  return response.data;
}

export async function getInventoryItem(id: string) {
  const response = await axiosInstance.get(`/restaurant/inventory/${id}`);
  return response.data;
}
