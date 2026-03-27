import { createBrowserClient } from '@supabase/ssr'
import { bypassAuth } from '../flags'

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        if (process.env.NODE_ENV === "production" && bypassAuth) {
            throw new Error("bypassAuth cannot be used in production; Supabase environment variables are required.");
        }
        if (bypassAuth) {
            console.warn("Supabase environment variables are missing, but bypassAuth is enabled.");
            return null as any;
        }
        throw new Error("Supabase environment variables are missing");
    }

    return createBrowserClient(url, key);
}
