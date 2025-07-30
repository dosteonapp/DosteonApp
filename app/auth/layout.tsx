import Footer from "@/components/auth/Footer";
import React from "react";

const AuthLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <main className="bg-[#F7F7F7] flex-grow">{children}</main>
      <Footer />
    </>
  );
};

export default AuthLayout;
