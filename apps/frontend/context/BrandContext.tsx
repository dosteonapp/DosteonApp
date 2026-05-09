"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axiosInstance from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { BRAND_SCOPED_KEYS } from "@/lib/queryKeys";

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
  /** Switch the active brand. Pass null to select all brands (aggregate view). */
  setActiveBrand: (brand: Brand | null) => void;
  /** True while the initial brand list is being fetched. */
  isLoading: boolean;
  /** Re-fetch the brands list. Useful after create/delete/update from settings. */
  refreshBrands: () => Promise<void>;
  /** True during the brief brand-switch transition (overlay visible). */
  isSwitching: boolean;
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
  const [isSwitching, setIsSwitching] = useState(false);

  // Stable ref so setActiveBrand can guard same-brand switches without
  // adding activeBrand to its dependency array (keeps the callback reference stable).
  const activeBrandRef = useRef<Brand | null>(null);
  activeBrandRef.current = activeBrand;

  // Holds the pending hide-overlay timeout so rapid switches cancel the previous one.
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBrands = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get<Brand[]>("/brands");
      const active = data.filter((b) => b.is_active && !b.deleted_at);
      setBrands(active);

      if (active.length === 0) return;

      const savedId =
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem(SESSION_KEY)
          : null;

      setActiveBrandState((prev) => {
        // If currently active brand is still in the refreshed list, keep it.
        const stillExists = prev ? active.find((b) => b.id === prev.id) : null;
        // Otherwise: restore from sessionStorage, or default (null for multi-brand, brand for single).
        const restored = !stillExists && savedId ? active.find((b) => b.id === savedId) : null;
        const next = stillExists ?? restored ?? (active.length > 1 ? null : active[0]);
        if (typeof sessionStorage !== "undefined") {
          if (next) sessionStorage.setItem(SESSION_KEY, next.id);
          else sessionStorage.removeItem(SESSION_KEY);
        }
        return next;
      });
    } catch (err) {
      console.error("[BrandContext] Failed to load brands:", err);
    }
  }, []);

  // On mount: fetch brands and restore active selection from sessionStorage.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      await loadBrands();
      if (!cancelled) setIsLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [loadBrands]);

  // Persist active brand ID in sessionStorage, show transition overlay,
  // and invalidate all queries so every component refetches for the new brand.
  const setActiveBrand = useCallback(
    (brand: Brand | null) => {
      // No-op when switching to the currently active brand.
      const currentId = activeBrandRef.current?.id ?? null;
      const nextId = brand?.id ?? null;
      if (currentId === nextId) return;

      // Cancel any pending overlay-hide from a previous rapid switch.
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

      setIsSwitching(true);
      setActiveBrandState(brand);

      if (typeof sessionStorage !== "undefined") {
        if (brand) sessionStorage.setItem(SESSION_KEY, brand.id);
        else sessionStorage.removeItem(SESSION_KEY);
      }

      // Invalidate only brand-scoped queries — org-scoped (day status, settings)
      // and global (user profile) queries are stable across brands and must not flicker.
      queryClient.invalidateQueries({
        predicate: (query) => {
          const first = Array.isArray(query.queryKey) ? query.queryKey[0] : "";
          return BRAND_SCOPED_KEYS.includes(first as string);
        },
      });

      // 600 ms gives the first critical refetch (stats, activities) time to land
      // before the overlay lifts, preventing a flash of stale brand data.
      switchTimerRef.current = setTimeout(() => {
        setIsSwitching(false);
        switchTimerRef.current = null;
      }, 600);
    },
    [queryClient]
  );

  return (
    <BrandContext.Provider value={{ brands, activeBrand, setActiveBrand, isLoading, refreshBrands: loadBrands, isSwitching }}>
      {children}
    </BrandContext.Provider>
  );
}
