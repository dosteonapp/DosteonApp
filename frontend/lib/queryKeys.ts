/**
 * Centralized React Query key definitions for Dosteon.
 *
 * Convention:
 *   Brand-scoped  — ["resourceName", brandId | "all", ...params]
 *   Org-scoped    — ["resourceName", orgId, ...params]
 *   Global        — ["resourceName", ...params]
 *
 * Keep this file as the single source of truth so invalidation predicates
 * stay in sync with the query keys that components actually use.
 */

// ---------------------------------------------------------------------------
// Brand-scoped query keys
// ---------------------------------------------------------------------------
// These MUST include brandId so:
//   1. React Query treats each brand as a separate cache entry
//   2. Smart invalidation can target only these on brand switch
//      (leaving org-scoped and global queries untouched)
// ---------------------------------------------------------------------------

// Org-scoped queries use orgId (day status, settings) because Dosteon's
// kitchen runs as one unit per org — the same day is open/closed regardless
// of which brand is active. Brand-scoped queries use brandId because sales,
// inventory levels, and activities differ per brand.

export const QK = {
  // ── Brand-scoped ──────────────────────────────────────────────────────────
  dashboardStats:   (brandId: string | null) => ["dashboardStats",   brandId ?? "all"] as const,
  recentActivities: (brandId: string | null) => ["recentActivities", brandId ?? "all"] as const,
  todayStats:       (brandId: string | null) => ["todayStats",       brandId ?? "all"] as const,
  salesHistory:     (brandId: string | null, ...params: unknown[]) =>
                      ["salesHistory",     brandId ?? "all", ...params] as const,
  menuItems:        (brandId: string | null) => ["menuItems",        brandId ?? "all"] as const,
  inventoryStats:   (brandId: string | null) => ["inventoryStats",   brandId ?? "all"] as const,
  kitchenLog:       (brandId: string | null) => ["kitchenLog",       brandId ?? "all"] as const,
  stockUsage:       (brandId: string | null) => ["stockUsage",       brandId ?? "all"] as const,
  closingStatus:    (brandId: string | null) => ["closingStatus",    brandId ?? "all"] as const,

  // ── Org-scoped ────────────────────────────────────────────────────────────
  // One kitchen, one day — these do not change when switching brands.
  dayStatus:   (orgId: string | null, date: string) => ["restaurantDayStatus",   orgId, date] as const,
  orgSettings: (orgId: string | null)               => ["restaurantSettings",    orgId] as const,
  systemState: (orgId: string | null)               => ["restaurantSystemState", orgId] as const,

  // ── Global ────────────────────────────────────────────────────────────────
  user:              () => ["user"] as const,
  catalog:           () => ["catalog-onboarding"] as const,
  productCategories: () => ["product-categories"] as const,
} as const;

/**
 * First key segment for every brand-scoped query.
 * Used by BrandContext to invalidate only brand data on brand switch —
 * org-scoped and global queries are left untouched.
 */
export const BRAND_SCOPED_KEYS: readonly string[] = [
  "dashboardStats",
  "recentActivities",
  "todayStats",
  "salesHistory",
  "menuItems",
  "inventoryStats",
  "kitchenLog",
  "stockUsage",
  "closingStatus",
];
