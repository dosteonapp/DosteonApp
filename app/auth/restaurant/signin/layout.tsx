import Container from "@/components/auth/Container";
import { SigninHeader } from "@/components/auth/SigninHeader";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Restaurant Signin",
};

const SigninLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <SigninHeader>
        <Link
          className="bg-white border border-primary rounded px-4 py-2 font-medium hover:bg-gray-100 text-primary"
          href="/auth/restaurant/signup"
        >
          Signup
        </Link>
      </SigninHeader>
      <Container>{children}</Container>
    </>
  );
};

export default SigninLayout;
