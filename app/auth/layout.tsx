import Footer from "@/components/auth/Footer";
import React from "react";

const AuthLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <main className="flex bg-[#F7F7F7] flex-col min-h-screen overflow-auto">
      {children}
      <Footer />
    </main>
  );
};

export default AuthLayout;
