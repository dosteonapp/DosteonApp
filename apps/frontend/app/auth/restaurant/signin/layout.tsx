import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Restaurant Signin",
};

const SigninLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <>{children}</>;
};

export default SigninLayout;
