"use client";

import { config } from "@/lib/config";

/**
 * Renders a fixed banner at the top of the page on non-production environments.
 * - Staging:     amber bar
 * - Development: blue bar
 * - Production:  renders nothing
 */
export function EnvironmentBanner() {
  if (config.isProduction || config.isStaging || process.env.NODE_ENV !== 'development') return null;

  const background = config.isStaging ? "#f59e0b" : "#3b82f6";
  const label = config.isStaging
    ? "STAGING — NOT PRODUCTION · staging.dosteon.com"
    : "DEVELOPMENT — NOT PRODUCTION";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background,
        color: "white",
        textAlign: "center",
        padding: "3px 0",
        fontSize: "11px",
        fontWeight: "bold",
        letterSpacing: "0.05em",
        fontFamily: "monospace",
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  );
}
