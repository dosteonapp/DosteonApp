"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { identifyUser, trackEvent } from "@/lib/analytics";

export default function AuthCallbackPage() {
  const router = useRouter();
  const emailVerifiedFired = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (!supabase) {
        router.replace("/auth/restaurant/signin");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const type = params.get("type");
      const accountType = params.get("account_type");
      const nextParam = params.get("next");

      // Recovery flow (password reset)
      if (type === "recovery") {
        const targetPath =
          accountType === "supplier"
            ? "/auth/supplier/reset-password"
            : "/auth/restaurant/reset-password";
        router.replace(targetPath);
        return;
      }

      let session = null;

      // PKCE flow — code in query string
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
          router.replace("/auth/restaurant/signin");
          return;
        }
        session = data.session;
      } else {
        // Implicit flow — tokens are in the URL hash fragment
        // Parse manually and call setSession directly (avoids async timing issues)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error("[auth/callback] setSession failed:", error.message);
            router.replace("/auth/restaurant/signin");
            return;
          }
          session = data.session;
        }
      }

      if (!session) {
        console.error("[auth/callback] No session established");
        router.replace("/auth/restaurant/signin");
        return;
      }

      // Identify and track email verification once per callback
      if (!emailVerifiedFired.current) {
        emailVerifiedFired.current = true;
        const userId = session.user?.id;
        if (userId) {
          identifyUser(userId, { email: session.user?.email });
        }
        trackEvent("email_verified", {
          user_id: userId ?? null,
          method: "email/password",
        });
      }

      const metadata = session.user?.user_metadata ?? {};
      const isNewUser = !metadata.onboarding_completed;

      if (!isNewUser && nextParam?.startsWith("/")) {
        router.replace(nextParam);
      } else {
        router.replace(isNewUser ? "/onboarding" : "/dashboard");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B52D4] border-t-transparent mx-auto" />
        <p className="text-sm text-slate-500 font-figtree">Completing sign in...</p>
      </div>
    </div>
  );
}
