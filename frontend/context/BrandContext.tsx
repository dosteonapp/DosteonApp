"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosInstance from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Brand {
  id: string;
  organization_id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
}

interface BrandContextValue {
  /** All active brands for the org (fetched once on mount). */
  brands: Brand[];
  /** The currently selected brand. null while loading. */
  activeBrand: Brand | null;
  /** Switch the active brand. Persists to sessionStorage and updates the axios header. */
  setActiveBrand: (brand: Brand) => void;
  /** True while the initial brand list is being fetched. */
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Storage key — sessionStorage only (clears on browser close)
// ---------------------------------------------------------------------------

const SESSION_KEY = "active_brand_id";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within a BrandProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrandState] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: fetch brands and restore active selection from sessionStorage.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await axiosInstance.get<Brand[]>("/brands");
        if (cancelled) return;

        const active = data.filter((b) => b.is_active && !b.deleted_at);
        setBrands(active);

        if (active.length === 0) {
          setIsLoading(false);
          return;
        }

        // Restore previously selected brand from sessionStorage (clears on tab close).
        const savedId =
          typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem(SESSION_KEY)
            : null;

        const restored = savedId ? active.find((b) => b.id === savedId) : null;
        setActiveBrandState(restored ?? active[0]);
      } catch {
        // Network failure — leave brands empty and show org-level data
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist active brand ID in sessionStorage and trigger a full data re-fetch.
  const setActiveBrand = useCallback(
    (brand: Brand) => {
      setActiveBrandState(brand);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, brand.id);
      }
      // Invalidate all queries so brand-scoped data reloads.
      // The axios interceptor (below) will pick up the new X-Brand-ID on the
      // next outgoing request automatically.
      queryClient.invalidateQueries();
    },
    [queryClient]
  );

  return (
    <BrandContext.Provider value={{ brands, activeBrand, setActiveBrand, isLoading }}>
      {children}
    </BrandContext.Provider>
  );
}
