import Container from "@/components/auth/Container";
import { DynamicHeader } from "@/components/auth/DynamicHeader";
import React from "react";

const SupplierAuthLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <DynamicHeader role="supplier" />
      <Container>{children}</Container>
    </>
  );
};

export default SupplierAuthLayout;
