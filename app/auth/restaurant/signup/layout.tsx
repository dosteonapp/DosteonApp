import Container from "@/components/auth/Container";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Restaurant Signup",
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
