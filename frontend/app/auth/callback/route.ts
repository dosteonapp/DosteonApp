import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const type = requestUrl.searchParams.get("type");
    const accountType = requestUrl.searchParams.get("account_type");

    if (code) {
        const supabase = createClient(await cookies());
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Route based on Supabase link type.
    // - signup / magic link / oauth: keep existing onboarding flow
    // - recovery (password reset): send user to the appropriate
    //   reset-password screen (restaurant or supplier)
    if (type === "recovery") {
        const targetPath =
            accountType === "supplier"
                ? "/auth/supplier/reset-password"
                : "/auth/restaurant/reset-password";

        return NextResponse.redirect(new URL(targetPath, request.url));
    }

    // After email verification, go to onboarding.
    // Onboarding will redirect to signin with ?verified=true when done or skipped.
    return NextResponse.redirect(new URL("/onboarding", request.url));
}