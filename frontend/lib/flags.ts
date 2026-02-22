/**
 * Feature flags for the application.
 * Currently supports a mock mode to use hardcoded data instead of API calls.
 */

export const FLAGS = {
  useMocks: true,
  bypassAuth: true,
};

export const useMocks = FLAGS.useMocks;
export const bypassAuth = FLAGS.bypassAuth;
