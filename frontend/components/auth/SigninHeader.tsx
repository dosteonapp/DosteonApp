import Image from "next/image";
import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SigninHeaderProps {
  children?: React.ReactNode;
  role?: "restaurant" | "supplier";
  title?: string;
}

export const SigninHeader: React.FC<SigninHeaderProps> = ({ children, role, title }) => {
  const isSupplier = role === "supplier";
  const headerBg = isSupplier ? "bg-[#00a13e]" : "bg-blue-600";
  const defaultTitle = isSupplier ? "Supplier Onboarding" : "Restaurant Authentication";
  const displayTitle = title || defaultTitle;

  if (role) {
    return (
      <header className={`sticky top-0 z-50 ${headerBg} py-4 px-6 text-white mb-4 md:mb-8`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-semibold text-xs md:text-sm">Back</span>
          </Link>
          <span className="text-lg md:text-xl font-bold">{displayTitle}</span>
        </div>
      </header>
    );
  }


  return (
    <header className="p-3 md:p-5 sticky top-0 z-50 bg-[#F7F7F7]">
      <div className="flex max-w-7xl mx-auto items-center rounded-2xl justify-between p-3 md:p-5 bg-white shadow-lg">
        <Image
          src="/images/logo-full.png"
          alt="Dosteon Logo"
          width={100}
          height={24}
          className="w-auto h-6 md:h-8"
        />
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
    </header>
  );
};

