"use client";
import { createContext, useContext, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { User, UserContextType } from "@/types/user";
import { bypassAuth } from "@/lib/flags";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";

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
        const savedMock = localStorage.getItem('mock_user');
        if (savedMock) {
          try {
            return JSON.parse(savedMock) as User;
          } catch {
            // Silently fail mock parse
          }
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
      
      // 2. Production Auth Mode (Firebase)
      return new Promise<User | null>((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          unsubscribe(); // Just read the current state once for the query
          
          if (!firebaseUser) {
            resolve(null);
            return;
          }

          try {
            // Attempt to get custom claims for role
            const tokenResult = await firebaseUser.getIdTokenResult();
            const role = (tokenResult.claims.role as "OWNER" | "MANAGER" | "CHEF" | "STAFF" | "SUPPLIER") || "OWNER";

            resolve({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              first_name: firebaseUser.displayName?.split(" ")[0] || "",
              last_name: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
              role: role,
              created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
              emailVerified: firebaseUser.emailVerified,
              image_url: firebaseUser.photoURL || undefined,
              avatar_url: firebaseUser.photoURL || undefined,
              onboardingCompleted: true, // Defaulting to true since backend flow is stripped
            } as User);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            resolve(null);
          }
        }, reject);
      });
    },
    retry: false,
    throwOnError: false, // Prevents secondary logging of caught rejections
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30, // 30 seconds
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
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        const updates: any = {};
        if (profileData.first_name || profileData.last_name) {
          updates.displayName = `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();
        }
        if (profileData.avatar_url || profileData.image_url) {
          updates.photoURL = profileData.avatar_url || profileData.image_url;
        }
        
        if (Object.keys(updates).length > 0) {
          await updateProfile(currentUser, updates);
        }
      }
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
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 10 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <UserContent queryClient={queryClient}>{children}</UserContent>
    </QueryClientProvider>
  );
};
