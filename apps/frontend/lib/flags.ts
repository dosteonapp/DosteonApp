/**
 * Feature flags for the application.
 *
 * - NEXT_PUBLIC_USE_MOCKS: enables centralized mock data instead of API calls.
 * - NEXT_PUBLIC_BYPASS_AUTH: injects a dev token and skips Supabase auth.
 */

const rawUseMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const rawBypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

// Hard-disable auth bypass in production builds
if (process.env.NODE_ENV === "production" && rawBypassAuth) {
  throw new Error(
    "bypassAuth cannot be enabled in production. Check NEXT_PUBLIC_BYPASS_AUTH."
  );
}

export const FLAGS = {
  useMocks: rawUseMocks,
  bypassAuth: rawBypassAuth,
};

// Convenience re-exports
export const useMocks = FLAGS.useMocks;
export const bypassAuth = FLAGS.bypassAuth;
