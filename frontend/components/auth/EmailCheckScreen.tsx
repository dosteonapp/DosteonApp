"use client";

import React from "react";
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
  const iconBorderColor = isSupplier ? "border-green-100 bg-green-50/30" : "border-blue-100 bg-blue-50/30";
  const iconTextColor = isSupplier ? "text-[#00a13e]" : "text-blue-600";

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-6 md:p-12 flex flex-col items-center mx-auto transition-all animate-in fade-in zoom-in duration-300">
      {/* Icon with role-based colors */}
      <div className={`w-16 h-16 rounded-xl border flex items-center justify-center mb-6 ${iconBorderColor}`}>
        <Mail className={`w-8 h-8 ${iconTextColor}`} />
      </div>

      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2 text-center">
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

      <p className="mt-6 text-sm text-gray-400 text-center">
        {onResend ? (
          <>
            Didn't receive the email?{" "}
            <button
              type="button"
              onClick={onResend}
              className="text-blue-600 hover:text-blue-700 font-medium underline-offset-2 hover:underline"
            >
              Resend verification email
            </button>
          </>
        ) : (
          <>Didn't receive the email? Check your spam folder.</>
        )}
      </p>
    </div>
  );
};
