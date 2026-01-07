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
}

export const EmailCheckScreen: React.FC<EmailCheckScreenProps> = ({
  title = "Check Your Email",
  description,
  buttonText,
  buttonHref,
  onButtonClick,
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-12 flex flex-col items-center mx-auto transition-all animate-in fade-in zoom-in duration-300">
      {/* Icon in blue-bordered box */}
      <div className="w-16 h-16 rounded-xl border border-blue-100 flex items-center justify-center mb-6 bg-blue-50/30">
        <Mail className="w-8 h-8 text-blue-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2 font-serif text-center">
        {title}
      </h1>
      <p className="text-gray-500 text-center mb-8 leading-relaxed">
        {description}
      </p>

      <div className="w-full">
        {buttonHref ? (
          <Link href={buttonHref} className="w-full">
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
              {buttonText}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onButtonClick}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {buttonText}
          </Button>
        )}
      </div>
      
      <p className="mt-6 text-sm text-gray-400">
        Didn't receive the email? Check your spam folder.
      </p>
    </div>
  );
};
