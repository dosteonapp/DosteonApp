"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      
      // The `exchangeCodeForSession` happens automatically if we use getSession() 
      // when a code is present in the URL, but being explicit is safer for PKCE.
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error during auth callback:", error.message);
        router.push("/?error=callback_failed");
        return;
      }

      if (session) {
        const role = session.user.user_metadata?.role || "restaurant";
        // Redirect to role-specific dashboard
        router.push(`/dashboard/${role}`);
      } else {
        router.push("/");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-vh-100 bg-dark text-light">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
