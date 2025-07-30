import Image from "next/image";
import React from "react";

export const SigninHeader: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <header className="p-5 sticky top-0 z-50 bg-[#F7F7F7]">
      <div className="flex items-center rounded-2xl justify-between p-5 bg-white shadow-lg">
        <Image
          src="/images/logo-full.png"
          alt="Dosteon Logo"
          width={120}
          height={20}
        />
        <>{children}</>
      </div>
    </header>
  );
};
