import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn("Supabase environment variables are missing in server context");
        return createServerClient('', '', { cookies: {} as any }) as any;
    }

    return createServerClient(
        url,
        key,
        {
            cookies: {
                get(name: string) {
                    return cookies().get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookies().set({ name, value, ...options })
                    } catch (error) {
                        // Safe to ignore in some server contexts.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookies().set({ name, value: '', ...options })
                    } catch (error) {
                        // Safe to ignore in some server contexts.
                    }
                },
            },
        }
    )
}
