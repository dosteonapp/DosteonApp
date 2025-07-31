import axiosInstance from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      // Call logout endpoint if available
      await axiosInstance.get("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      // Clear user data from cache
      queryClient.removeQueries({ queryKey: ["user"] });
      // Redirect to login
      redirect("/auth/signin");
    }
  };

  return { logout };
};
