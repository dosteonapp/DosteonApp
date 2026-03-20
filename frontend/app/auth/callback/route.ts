import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = createClient(await cookies());
        await supabase.auth.exchangeCodeForSession(code);
    }

    // After email verification, go to onboarding.
    // Onboarding will redirect to signin with ?verified=true when done or skipped.
    return NextResponse.redirect(new URL("/onboarding", request.url));
}