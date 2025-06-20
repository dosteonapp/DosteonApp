"use client";
import { createContext, useContext } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { User, UserContextType } from "@/types/user";
import axiosInstance from "@/lib/axios";
import { handleApiError } from "@/lib/utils";

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

  const {
    data: user,
    isLoading: fetchingUser,
    error,
  } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/user");
        if (!data || !data.success || !data.data) {
          throw new Error("User data not found");
        }
        return data.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    retry: 1, // Will retry once (total of 2 attempts)
    staleTime: Infinity, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider
          value={{
            user,
            fetchingUser,
          }}
        >
          {children}
        </UserContext.Provider>
      </QueryClientProvider>
    </>
  );
};
