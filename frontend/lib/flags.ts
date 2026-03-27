/**
 * Feature flags for the application.
 * Currently supports a mock mode to use hardcoded data instead of API calls.
 */

const rawBypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

// Hard-disable auth bypass in production builds
if (process.env.NODE_ENV === "production" && rawBypassAuth) {
  throw new Error(
    "bypassAuth cannot be enabled in production. Check NEXT_PUBLIC_BYPASS_AUTH."
  );
}

export const FLAGS = {
  useMocks: false,
  bypassAuth: rawBypassAuth,
};

// Convenience re-exports
export const useMocks = FLAGS.useMocks;
export const bypassAuth = FLAGS.bypassAuth;
