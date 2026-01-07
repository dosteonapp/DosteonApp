import Container from "@/components/auth/Container";
import { DynamicHeader } from "@/components/auth/DynamicHeader";
import React from "react";

const RestaurantAuthLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <DynamicHeader role="restaurant" />
      <Container>{children}</Container>
    </>
  );
};

export default RestaurantAuthLayout;
