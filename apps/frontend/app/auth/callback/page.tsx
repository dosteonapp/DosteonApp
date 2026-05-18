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
      const { auth } = await import("@/lib/firebase");
      const { isSignInWithEmailLink, signInWithEmailLink } = await import("firebase/auth");
      
      const params = new URLSearchParams(window.location.search);
      const nextParam = params.get("next");

      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // If missing email, we could prompt the user for it, but for simplicity here we assume it's available or we fail gracefully
          setError("Session expired or missing email. Please try signing in again.");
          return;
        }

        try {
          const result = await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          
          if (!emailVerifiedFired.current) {
            emailVerifiedFired.current = true;
            const userId = result.user.uid;
            identifyUser(userId, { email: result.user.email });
            trackEvent("email_verified", {
              user_id: userId,
              method: "email/password",
            });
          }
          
          if (nextParam?.startsWith("/")) {
            router.replace(nextParam);
          } else {
            router.replace("/dashboard");
          }
        } catch (err: any) {
          console.error("Firebase sign in with link failed", err);
          setError("This link is invalid or has expired. Please request a new one.");
        }
      } else if (auth.currentUser) {
         router.replace(nextParam?.startsWith("/") ? nextParam : "/dashboard");
      } else {
         setError("This link is invalid or has already been used.");
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
