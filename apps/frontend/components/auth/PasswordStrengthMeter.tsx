import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a capital letter", met: /[A-Z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const strengthCount = requirements.filter((req) => req.met).length;
  
  const getStrengthColor = () => {
    if (strengthCount === 0) return "bg-gray-200";
    if (strengthCount <= 1) return "bg-red-500";
    if (strengthCount <= 2) return "bg-orange-500";
    if (strengthCount <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return "";
    if (strengthCount <= 1) return "Weak";
    if (strengthCount <= 2) return "Fair";
    if (strengthCount <= 3) return "Good";
    return "Strong";
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-700">Password Strength</span>
        <span className={cn("text-xs font-bold", 
          strengthCount <= 1 ? "text-red-500" : 
          strengthCount <= 3 ? "text-yellow-600" : "text-green-600"
        )}>
          {getStrengthLabel()}
        </span>
      </div>
      
      {/* Strength Bar */}
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              "h-full flex-1 rounded-full transition-all duration-300",
              index <= strengthCount ? getStrengthColor() : "bg-gray-100"
            )}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={cn(
              "flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors",
              req.met ? "bg-green-100 text-green-600" : "bg-gray-50 text-gray-300"
            )}>
              {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </div>
            <span className={cn(
              "text-[11px] leading-tight transition-colors",
              req.met ? "text-gray-700 font-medium" : "text-gray-400"
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
