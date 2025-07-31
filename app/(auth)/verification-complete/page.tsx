"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerificationCompletePage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/create-account");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Email Verified!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Your email address has been successfully verified. You're one step closer to getting started with Dosteon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete your business profile</li>
              <li>• Set up your account preferences</li>
              <li>• Take a quick tour of the platform</li>
            </ul>
          </div>
          
          <Button 
            size="lg" 
            className="w-full" 
            onClick={handleContinue}
          >
            Continue to Account Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 