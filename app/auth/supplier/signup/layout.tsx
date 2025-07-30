import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Supplier Signup",
};

const SignupLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <>{children}</>;
};

export default SignupLayout;
