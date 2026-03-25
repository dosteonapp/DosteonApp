"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import {
  Building2,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// After onboarding (or skip), redirect to an email verification
// completion screen before taking the user to signin.
const POST_ONBOARDING_URL = "/auth/restaurant/status/email-verified";
const SIGNIN_URL = "/auth/restaurant/signin";

const OnboardingPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [address, setAddress] = useState("");

  const { mutate: completeOnboarding, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/onboard", {
        organization_name: orgName,
        address: address,
      });
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Workspace set up",
        description: "Your workspace is ready.",
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push(POST_ONBOARDING_URL);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Onboarding failed",
        description: error.response?.data?.detail ||
          "Setup failed. You can update this in Settings later.",
      });
      // Even on error, let them proceed to signin
      router.push(SIGNIN_URL);
    },
  });

  // Skip — org name stays as default "{FirstName}'s Restaurant"
  // User can rename it anytime in Settings
  const handleSkip = () => {
    router.push(POST_ONBOARDING_URL);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
                <Building2 size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Name your workspace
                </h1>
                <p className="text-slate-500 font-medium">
                  This is usually your restaurant or company name.
                </p>
                <p className="text-xs text-slate-400">
                  You can always update this later in Settings.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Restaurant Name
                </label>
                <Input
                  placeholder="e.g. The Silver Spoon"
                  className="h-14 rounded-2xl border-slate-200 text-lg font-medium px-6 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <Button
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
                onClick={() => orgName.trim() && setStep(2)}
                disabled={!orgName.trim()}
              >
                Continue
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors flex items-center justify-center gap-1 py-2"
              >
                Skip for now — I&apos;ll set this up in Settings
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
                <MapPin size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Location Details
                </h1>
                <p className="text-slate-500 font-medium tracking-tight">
                  Where is <span className="text-slate-700 font-bold">{orgName}</span> located?
                </p>
                <p className="text-xs text-slate-400">
                  You can always update this later in Settings.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Street Address
                </label>
                <Input
                  placeholder="e.g. 123 Culinary Ave"
                  className="h-14 rounded-2xl border-slate-200 text-lg font-medium px-6 focus:ring-blue-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl flex-1 font-bold text-slate-600"
                  onClick={() => setStep(1)}
                  disabled={isPending}
                >
                  Back
                </Button>
                <Button
                  className="h-14 rounded-2xl flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  onClick={() => completeOnboarding()}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors flex items-center justify-center gap-1 py-2"
              >
                Skip for now — I&apos;ll set this up in Settings
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/images/logo-full.png"
            alt="Dosteon"
            width={180}
            height={45}
            className="h-10 w-auto opacity-90"
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-100/50 p-8 md:p-12 border border-slate-100 relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-12">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                  s <= step ? "bg-blue-600 shadow-sm" : "bg-slate-100"
                }`}
              />
            ))}
          </div>

          {renderStep()}

          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50/30 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />
        </div>

      </div>
    </div>
  );
};

export default OnboardingPage;