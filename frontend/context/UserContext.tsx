"use client";
import { createContext, useContext, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { User, UserContextType } from "@/types/user";
import axiosInstance from "@/lib/axios";

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
  const queryClient = new QueryClient();

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
          // Check if we have a session first before calling the backend
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            return null;
          }

          const { data } = await axiosInstance.get("/auth/me");
          return data;
        } catch (error) {
          console.error("Error fetching user profile:", error);
          throw error;
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
