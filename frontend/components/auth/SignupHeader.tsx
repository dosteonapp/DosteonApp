"use client";
import React from "react";
import { Button } from "../ui/button";
import { LucideArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const SignupHeader: React.FC<{
  text: string;
}> = ({ text }) => {
  const router = useRouter();
  const goBack = () => {
    router.push("/");
  };
  return (
    <header className="sticky top-0 z-50 bg-primary-600 text-white">
      <div className="flex max-w-7xl mx-auto items-center rounded-2xl justify-between p-5">
        <Button variant="ghost" onClick={goBack}>
          <LucideArrowLeft className="mr-1 md:block hidden" />
          <span className="font-medium">Back</span>
        </Button>
        <span className="font-medium font-inter text-lg">{text}</span>
      </div>
    </header>
  );
};
