"use client";
import { createContext, useContext, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { User, UserContextType } from "@/types/user";
import axiosInstance from "@/lib/axios";
import { bypassAuth } from "@/lib/flags";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUserContext must be used within an UserProvider");
  }

  return context;
};

// MODULE LEVEL COMPONENT: prevents re-mounting on every Provider render
const UserContent: React.FC<{ children: React.ReactNode; queryClient: QueryClient }> = ({
  children,
  queryClient
}) => {
  const {
    data: user,
    isLoading: fetchingUser,
    isError: fetchUserError,
  } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      // 1. Bypass Auth Mode (Mock Data)
      if (bypassAuth) {
        try {
          // Attempt to get real profile if backend is alive
          const { data } = await axiosInstance.get("auth/me");
          return data;
        } catch (error) {
          const savedMock = localStorage.getItem('mock_user');
          if (savedMock) {
            try {
              return JSON.parse(savedMock) as User;
            } catch (e) {}
          }
          return {
            id: "mock-restaurant-id",
            email: "admin@therestaurant.com",
            first_name: "Sherry",
            last_name: "Harper",
            role: "MANAGER",
            created_at: new Date().toISOString(),
          } as User;
        }
      }
      
      // 2. Production Auth Mode (Session Check First)
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        if (!supabase) return null;

        const { data: { session } } = await supabase.auth.getSession();
        
        // No session = no point calling the backend auth/me
        if (!session) return null;
        
        // Fetch the backend profile now that we have a confirmed session
        const { data } = await axiosInstance.get("auth/me");
        return data;
      } catch (err: any) {
        // Only log if it's NOT a standard 401/404 (which we handle as 'No User')
        if (err.response?.status !== 401 && err.response?.status !== 404) {
          console.error("Error fetching user profile:", err);
        }
        return null; // Return null so React Query sees it as "Success: No User"
      }
    },
    retry: false,
    throwOnError: false, // Prevents secondary logging of caught rejections
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { mutateAsync: updateUser } = useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      if (bypassAuth) {
          const saved = localStorage.getItem('mock_user');
          if (saved) {
              const user = JSON.parse(saved);
              const updated = { ...user, ...profileData };
              localStorage.setItem('mock_user', JSON.stringify(updated));
          }
          return;
      }
      await axiosInstance.patch("auth/me", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    }
  });

  return (
    <UserContext.Provider
      value={{
        user,
        fetchUserError,
        fetchingUser,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <UserContent queryClient={queryClient}>{children}</UserContent>
    </QueryClientProvider>
  );
};
