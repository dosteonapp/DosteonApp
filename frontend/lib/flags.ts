/**
 * Feature flags for the application.
 * Currently supports a mock mode to use hardcoded data instead of API calls.
 */

export const FLAGS = {
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
  bypassAuth: process.env.NEXT_PUBLIC_BYPASS_AUTH === "true",
};

export const useMocks = FLAGS.useMocks;
export const bypassAuth = FLAGS.bypassAuth;
