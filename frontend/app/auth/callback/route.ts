import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") || "/dashboard";

    if (code) {
        const supabase = createClient(await cookies());
        await supabase.auth.exchangeCodeForSession(code);
    }

    // URL to redirect to after sign in process completes
    // The user requested redirecting to sign-in before going to dashboard
    const redirectUrl = new URL(`/auth/restaurant/signin?verified=true`, request.url);
    return NextResponse.redirect(redirectUrl);

}
