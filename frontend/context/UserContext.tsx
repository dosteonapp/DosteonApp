"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = useState(() => new QueryClient());

  const UserContent: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const {
      data: user,
      isLoading: fetchingUser,
      isError: fetchUserError,
    } = useQuery<User | null>({
      queryKey: ["user"],
      queryFn: async () => {
        try {
          // If bypassAuth is true, axios will use the dev token.
          // We hit the backend to get the real profile (e.g. gatetejules1@gmail.com)
          const { data } = await axiosInstance.get("/auth/me");
          return data;
        } catch (error) {
          if (bypassAuth) {
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
              role: "restaurant",
              created_at: new Date().toISOString(),
            } as User;
          }
          
          // Non-bypass mode: check session
          try {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            if (!supabase) return null;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            
            const { data } = await axiosInstance.get("/auth/me");
            return data;
          } catch (err) {
            console.error("Error fetching user profile:", err);
            return null;
          }
        }
      },
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
      <UserContext.Provider
        value={{
          user,
          fetchUserError,
          fetchingUser,
        }}
      >
        {children}
      </UserContext.Provider>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <UserContent>{children}</UserContent>
    </QueryClientProvider>
  );
};
