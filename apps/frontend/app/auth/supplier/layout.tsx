import Container from "@/components/auth/Container";
import { DynamicHeader } from "@/components/auth/DynamicHeader";
import { SigninFooter } from "@/components/auth/SigninFooter";
import React from "react";


const SupplierAuthLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <DynamicHeader role="supplier" />
      <Container>{children}</Container>
    </div>
  );
};

export default SupplierAuthLayout;
