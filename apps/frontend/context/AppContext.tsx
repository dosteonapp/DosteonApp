"use client";
import { createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextType } from "@/types/app";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
};

const queryClient = new QueryClient();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{}}>{children}</AppContext.Provider>
      </QueryClientProvider>
    </>
  );
};
