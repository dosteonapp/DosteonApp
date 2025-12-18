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
    } = useQuery<User>({
      queryKey: ["user"],
      queryFn: async () => {
        const { data } = await axiosInstance.get("/user");
        if (!data || !data.success || !data.data) {
          throw new Error("User not authenticated or user data not found");
        }
        return data.data;
      },
      retry: 1,
      refetchOnWindowFocus: false,
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
