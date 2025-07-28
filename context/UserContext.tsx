"use client";
import { createContext, useContext, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter, usePathname, redirect } from "next/navigation";
import { User, UserContextType } from "@/types/user";
import axiosInstance from "@/lib/axios";
import { handleApiError } from "@/lib/utils";
import { useAuth } from "./AuthContext";

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
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const {
      data: user,
      isLoading: fetchingUser,
      error,
      isError,
    } = useQuery<User>({
      queryKey: ["user"],
      queryFn: async () => {
        try {
          const { data } = await axiosInstance.get("/user");
          if (!data || !data.success || !data.data) {
            return redirect(
              "/auth/signin?redirect=" + encodeURIComponent(pathname)
            );
          }
          return data.data;
        } catch (error) {
          return redirect(
            "/auth/signin?redirect=" + encodeURIComponent(pathname)
          );
          // throw handleApiError(error);
        }
      },
      retry: 1, // Will retry once (total of 2 attempts)
      staleTime: Infinity, // Consider data fresh indefinitely
      refetchOnWindowFocus: false,
      // Always fetch user data on every route to know authentication status
    });

    // // Handle authentication and route protection
    // useEffect(() => {
    //   // Don't do anything while loading
    //   if (fetchingUser) return;

    //   // Define route types for clear logic
    //   const isAuthPage =
    //     pathname === "/login" || pathname === "/register" || pathname === "/";
    //   const isRestaurantRoute = pathname.startsWith("/restaurant");
    //   const isSupplierRoute = pathname.startsWith("/supplier");

    //   // If there's an error (user not authenticated)
    //   if (isError || !user) {
    //     // Only redirect to login if not already on auth pages
    //     if (!isAuthPage) {
    //       // Clear any cached user data
    //       queryClient.removeQueries({ queryKey: ["user"] });
    //       router.push("/login");
    //     }
    //     return;
    //   }

    //   // If user is authenticated
    //   if (user) {
    //     // If on auth pages, redirect to appropriate dashboard
    //     if (isAuthPage) {
    //       const dashboardRoute =
    //         user.accountType === "restaurant"
    //           ? "/restaurant/dashboard"
    //           : "/supplier/dashboard";
    //       router.push(dashboardRoute);
    //       return;
    //     }

    //     // Check if user is on wrong route type
    //     if (user.accountType === "restaurant" && isSupplierRoute) {
    //       router.push("/restaurant/dashboard");
    //       return;
    //     }

    //     if (user.accountType === "supplier" && isRestaurantRoute) {
    //       router.push("/supplier/dashboard");
    //       return;
    //     }

    //     // User is authenticated and on correct route - allow access
    //   }
    // }, [user, fetchingUser, isError, pathname, router, queryClient]);

    return (
      <UserContext.Provider
        value={{
          user,
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
