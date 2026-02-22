import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = async (redirectPath: string = "/auth/signin") => {
    try {
      // 1. Sign out from Supabase (clears local session)
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // 2. Clear user data from react-query cache
      queryClient.removeQueries({ queryKey: ["user"] });
      
      // 3. Clear all other caches and mock data
      localStorage.removeItem('mock_user');
      queryClient.clear();
      
    } catch (error) {
      console.error("Logout process encountered an error:", error);
    } finally {
      // Always redirect to login
      router.push(redirectPath);
    }
  };

  return { logout };
};
