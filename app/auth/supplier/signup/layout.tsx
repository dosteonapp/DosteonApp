import Container from "@/components/auth/Container";
import { Metadata } from "next";
import Image from "next/image";
import React from "react";

export const metadata: Metadata = {
  title: "Supplier Signup",
};

const SignupLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <Container>{children}</Container>
    </>
  );
};

export default SignupLayout;
