import React from "react";
import Link from "next/link";

interface SigninFooterProps {
  role?: "restaurant" | "supplier";
}

export const SigninFooter: React.FC<SigninFooterProps> = ({ role = "restaurant" }) => {
  const isSupplier = role === "supplier";
  const linkColor = isSupplier ? "text-[#00a13e]" : "text-blue-600";

  return (
    <footer className="w-full bg-white p-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <span>Need help?</span>
          <Link href="/support" className={`${linkColor} font-medium hover:underline`}>
            Contact support
          </Link>
        </div>
        <div>
          © {new Date().getFullYear()} Dosteon. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

