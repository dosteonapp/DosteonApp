import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const type = requestUrl.searchParams.get("type");
    const accountType = requestUrl.searchParams.get("account_type");
    const nextParam = requestUrl.searchParams.get("next");

    console.log("[auth/callback] Incoming", {
        codePresent: !!code,
        type,
        accountType,
        nextParam,
    });

    let isNewUser = true;

    if (code) {
        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error || !data?.session) {
                console.error("[auth/callback] Session exchange failed", {
                    error,
                    hasSession: !!data?.session,
                });
                return new NextResponse("Authentication callback failed. Please try again.", {
                    status: 500,
                });
            }

            console.log("[auth/callback] Session exchange succeeded", {
                userId: data.session.user?.id,
                type,
                accountType,
            });

            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
                console.error("[auth/callback] getUser failed after session exchange", {
                    userError,
                });
            } else {
                const metadata = userData.user.user_metadata || {};
                isNewUser = !metadata.onboarding_completed;
                console.log("[auth/callback] Loaded user after exchange", {
                    userId: userData.user.id,
                    isNewUser,
                });
            }
        } catch (err) {
            console.error("[auth/callback] Unexpected error during session exchange", err);
            return new NextResponse("Authentication callback encountered an error.", {
                status: 500,
            });
        }
    }

    if (type === "recovery") {
        const targetPath =
                accountType === "supplier"
                    ? "/auth/supplier/reset-password"
                    : "/auth/restaurant/reset-password";

        console.log("[auth/callback] Redirecting for recovery", { targetPath });
        return NextResponse.redirect(new URL(targetPath, request.url));
    }

    // Route verified or magic-link users based on onboarding status.
    // New users go to onboarding; existing users go straight to dashboard.
    let targetPath = isNewUser ? "/onboarding" : "/dashboard";

    // If a safe `next` param is provided and we have an existing user,
    // allow overriding the default redirect for explicit flows.
    if (!isNewUser && nextParam && nextParam.startsWith("/")) {
        targetPath = nextParam;
    }

    console.log("[auth/callback] Final redirect", { targetPath, isNewUser });
    return NextResponse.redirect(new URL(targetPath, request.url));
}