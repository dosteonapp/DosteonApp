"use client";

import { useEffect, useState } from "react";
import { initPostHog } from "@/lib/analytics";

const CONSENT_KEY = "cookie_consent";

export type ConsentValue = "accepted" | "declined";

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(CONSENT_KEY) as ConsentValue) ?? null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
      return;
    }
    // Consent already given in a previous visit — initialise PostHog immediately.
    if (stored === "accepted") initPostHog();
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    initPostHog();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-600 max-w-2xl">
          We use analytics cookies to understand how you use Dosteon and improve
          the experience. No personal data is sold or shared with third parties.{" "}
          <a href="/legal/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
