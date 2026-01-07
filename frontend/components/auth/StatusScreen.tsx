"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StatusScreenProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  role: "restaurant" | "supplier";
}

export const StatusScreen: React.FC<StatusScreenProps> = ({
  icon,
  title,
  description,
  buttonText,
  buttonHref,
  onButtonClick,
  role,
}) => {
  const signupLink = role === "supplier" ? "/auth/supplier/signup" : "/auth/restaurant/signup";
  const roleDisplay = role === "supplier" ? "Supplier" : "Restaurant";

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-12 flex flex-col items-center mx-auto">
      <div className="mb-6">
        {icon}
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2 font-serif">{title}</h1>
      <p className="text-gray-500 text-center mb-8">
        {description}
      </p>

      {buttonText && (
        <div className="w-full">
          {buttonHref ? (
            <Link href={buttonHref}>
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base transition-colors">
                {buttonText}
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={onButtonClick}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base transition-colors"
            >
              {buttonText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
