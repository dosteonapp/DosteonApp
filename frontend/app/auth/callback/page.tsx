"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { identifyUser, trackEvent } from "@/lib/analytics";

export default function AuthCallbackPage() {
  const router = useRouter();
  const emailVerifiedFired = useRef(false);
  const [error, setError] = useState<string | null>(null);

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
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");
      const accountType = params.get("account_type");
      const nextParam = params.get("next");

      // Supabase passes errors as query params on some flows (e.g. expired link)
      if (errorParam) {
        const msg =
          errorDescription?.replace(/\+/g, " ") ??
          "This link is invalid or has expired. Please request a new one.";
        setError(msg);
        return;
      }

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
        const { data, error: exchError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchError) {
          console.error("[auth/callback] exchangeCodeForSession failed:", exchError.message);
          const isExpired =
            exchError.message.toLowerCase().includes("expired") ||
            exchError.message.toLowerCase().includes("invalid");
          setError(
            isExpired
              ? "This verification link has expired or already been used. Please request a new one."
              : "Sign in could not be completed. Please try again."
          );
          return;
        }
        session = data.session;
      } else {
        // Implicit flow — tokens are in the URL hash fragment
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const hashError = hashParams.get("error");
        const hashErrorDesc = hashParams.get("error_description");

        if (hashError) {
          setError(
            hashErrorDesc?.replace(/\+/g, " ") ??
            "This link is invalid or has expired. Please request a new one."
          );
          return;
        }

        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            console.error("[auth/callback] setSession failed:", sessionError.message);
            setError("Sign in could not be completed. Please try again.");
            return;
          }
          session = data.session;
        }
      }

      if (!session) {
        // No code, no hash tokens — link is malformed, expired, or already used.
        setError(
          "This link is invalid or has already been used. Please sign in or request a new verification email."
        );
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Link Unavailable</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <a
            href="/auth/restaurant/signin"
            className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B52D4] border-t-transparent mx-auto" />
        <p className="text-sm text-slate-500 font-figtree">Completing sign in...</p>
      </div>
    </div>
  );
}
