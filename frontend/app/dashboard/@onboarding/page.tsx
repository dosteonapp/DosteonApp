"use client";
import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { 
  Building2, 
  ChevronRight, 
  LayoutDashboard, 
  MapPin, 
  Settings2,
  CheckCircle2,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const OnboardingPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [address, setAddress] = useState("");

  const { mutate: completeOnboarding, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/onboard", {
        organization_name: orgName,
        address: address // Can be used by organization_repo update later
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Workspace created successfully!");
      // Invalidate user to trigger RoleProvider reload
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      // Navigate immediately
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Onboarding failed");
    }
  });

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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Name your workspace</h1>
                <p className="text-slate-500 font-medium">This is usually your restaurant or company name.</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Restaurant Name</label>
                <Input 
                  placeholder="e.g. The Silver Spoon" 
                  className="h-14 rounded-2xl border-slate-200 text-lg font-medium px-6 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <Button 
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
                onClick={() => orgName && setStep(2)}
                disabled={!orgName}
              >
                Continue
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Location Details</h1>
                <p className="text-slate-500 font-medium tracking-tight">Where is {orgName} located?</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Street Address</label>
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
                >
                  Back
                </Button>
                <Button 
                  className="h-14 rounded-2xl flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  onClick={() => completeOnboarding()}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 size={24} className="animate-spin" /> : "Complete Setup"}
                </Button>
              </div>
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
        {/* Header/Logo */}
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

          {/* Side accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50/30 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />
        </div>

        {/* Footer info */}
        <div className="mt-12 flex items-center justify-center gap-6 text-slate-400 font-bold text-sm tracking-tight px-4">
           <div className="flex items-center gap-2">
             <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
               <CheckCircle2 size={12} className="text-slate-400" />
             </div>
             <span>Secure Session</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
               <CheckCircle2 size={12} className="text-slate-400" />
             </div>
             <span>Compliance Ready</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

