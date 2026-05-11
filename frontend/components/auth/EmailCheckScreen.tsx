"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail } from "lucide-react";

interface EmailCheckScreenProps {
  title?: string;
  description: string;
  buttonText: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  role?: "restaurant" | "supplier";
  onResend?: () => void | Promise<void>;
}

export const EmailCheckScreen: React.FC<EmailCheckScreenProps> = ({
  title = "Check Your Email",
  description,
  buttonText,
  buttonHref,
  onButtonClick,
  role = "restaurant",
  onResend,
}) => {
  const isSupplier = role === "supplier";
  const primaryColor = isSupplier ? "bg-[#00a13e] hover:bg-[#008a35]" : "bg-blue-600 hover:bg-blue-700";
  const resendColor = isSupplier ? "text-[#00a13e]" : "text-blue-600";
  const iconBorderColor = isSupplier ? "border-green-100 bg-green-50/30" : "border-blue-100 bg-blue-50/30";
  const iconTextColor = isSupplier ? "text-[#00a13e]" : "text-blue-600";

  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "rate_limited">("idle");

  const handleResend = async () => {
    if (!onResend || resendState === "sending") return;
    setResendState("sending");
    try {
      await onResend();
      // onResend (resendVerification in AuthContext) catches errors internally
      // and shows a toast on failure — treat completion as success here
      setResendState("sent");
      setTimeout(() => setResendState("idle"), 4000);
    } catch {
      // Only fires if caller re-throws; show rate-limit message as safe fallback
      setResendState("rate_limited");
      setTimeout(() => setResendState("idle"), 6000);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-6 md:p-12 flex flex-col items-center mx-auto transition-all animate-in fade-in zoom-in duration-300">
      {/* Icon with role-based colors */}
      <div className={`w-16 h-16 rounded-xl border flex items-center justify-center mb-6 ${iconBorderColor}`}>
        <Mail className={`w-8 h-8 ${iconTextColor}`} />
      </div>

      <h1 className="text-2xl font-bold font-figtree text-gray-900 mb-2 text-center">
        {title}
      </h1>
      <p className="text-gray-500 text-center mb-8 leading-relaxed">
        {description}
      </p>

      <div className="w-full">
        {buttonHref ? (
          <Link href={buttonHref} className="w-full">
            <Button className={`w-full h-12 text-white font-semibold rounded-lg text-base transition-all hover:scale-[1.02] active:scale-[0.98] ${primaryColor}`}>
              {buttonText}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onButtonClick}
            className={`w-full h-12 text-white font-semibold rounded-lg text-base transition-all hover:scale-[1.02] active:scale-[0.98] ${primaryColor}`}
          >
            {buttonText}
          </Button>
        )}
      </div>

      {/* Inline resend feedback */}
      {resendState === "sent" && (
        <div className="mt-5 w-full px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-medium text-center">
          Email sent — check your inbox and spam folder.
        </div>
      )}
      {resendState === "rate_limited" && (
        <div className="mt-5 w-full px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-700 font-medium text-center">
          Please wait a moment before requesting another email.
        </div>
      )}

      {/* Resend + spam hint */}
      <div className="mt-6 text-sm text-gray-400 text-center space-y-1">
        {onResend && (
          <p>
            Didn't receive the email?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending" || resendState === "sent"}
              className={`font-medium underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${resendColor}`}
            >
              {resendState === "sending" ? "Sending…" : resendState === "sent" ? "Sent ✓" : "Resend verification email"}
            </button>
          </p>
        )}
        <p>Also check your spam or junk folder.</p>
      </div>
    </div>
  );
};
