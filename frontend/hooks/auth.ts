import axiosInstance from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = async (redirectPath: string = "/auth/signin") => {
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
      router.push(redirectPath);
    }
  };

  return { logout };
};
