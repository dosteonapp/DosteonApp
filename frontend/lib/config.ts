/**
 * Central environment config for the frontend.
 *
 * Validates required Supabase variables at module load time so a missing var
 * causes an immediate build/runtime error instead of a silent broken page.
 *
 * API routing: requests go through the Next.js proxy (BACKEND_URL in
 * next.config.mjs → /api/v1/* rewrites). No NEXT_PUBLIC_API_URL needed.
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

// Warn during development if required vars are missing (don't throw — crashing the app is worse than the missing var).
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  for (const key of required) {
    if (!process.env[key]) {
      console.warn(
        `[config] Missing environment variable: ${key} — copy .env.example to .env.local and fill in the values.`
      );
    }
  }
}

type AppEnv = "development" | "staging" | "production";

const rawEnv = process.env.NEXT_PUBLIC_ENV ?? "development";
const appEnv = (["development", "staging", "production"].includes(rawEnv)
  ? rawEnv
  : "development") as AppEnv;

export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  env: appEnv,
  isProduction: appEnv === "production",
  isStaging: appEnv === "staging",
  isDevelopment: appEnv === "development",
} as const;
