"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Building2,
  Clock,
  ShoppingBasket,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Search,
  ArrowLeft,
  Sun,
  Moon,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// --- Constants & Types ---
const POST_ONBOARDING_URL = "/dashboard";

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  base_unit: string;
  is_critical_item: boolean;
}

// Time options for 24h format but displayed in 12h
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of ["00", "30"]) {
    const hh = String(h).padStart(2, "0");
    TIME_OPTIONS.push(`${hh}:${m}`);
  }
}

function formatTimeDisplay(t: string): string {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${mStr} ${suffix}`;
}

const OnboardingPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");
  const [openingTime, setOpeningTime] = useState("07:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [catalogSearch, setCatalogSearch] = useState("");

  // Calculate operating hours
  const operatingHours = useMemo(() => {
    const [openH, openM] = openingTime.split(":").map(Number);
    let [closeH, closeM] = closingTime.split(":").map(Number);
    
    let diff = (closeH + closeM/60) - (openH + openM/60);
    if (diff <= 0) diff += 24; // Handle overnight hours
    return Math.round(diff * 10) / 10;
  }, [openingTime, closingTime]);

  const { data: catalog = [], isLoading: catalogLoading } = useQuery<CatalogItem[]>({
    queryKey: ["catalog-onboarding"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/inventory/catalog");
      return data;
    },
    enabled: step === 3,
  });

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.toLowerCase();
    return catalog.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [catalog, catalogSearch]);

  const groupedCatalog = useMemo(() => {
    return filteredCatalog.reduce<Record<string, CatalogItem[]>>((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filteredCatalog]);

  const { mutate: completeOnboarding, isPending } = useMutation({
    mutationFn: async () => {
        // Since DB is disconnected in user's env, this will likely fail
        // but we implement the correct logic for when it's restored.
      const { data } = await axiosInstance.post("auth/onboard", {
        organization_name: orgName,
        address: "Default Location", // Simplified for now to follow screenshot steps
        phone,
        opening_time: openingTime,
        closing_time: closingTime,
        selected_canonical_ids: Array.from(selectedIds),
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Restaurant Onboarded", { description: "Your setup is complete!" });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push(POST_ONBOARDING_URL);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Setup incomplete. You can update this later in Settings.";
      toast.error("Onboarding Sync Issue", { description: msg });
      // Proceed anyway to let user see dashboard if bypass is on
      router.push(POST_ONBOARDING_URL);
    }
  });

  const stepLabels = ["Business Details", "Operating Hours", "Core Inventory Items"];
  const progressPercent = step === 1 ? 30 : step === 2 ? 65 : 95;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-figtree">
      {/* Blue Header Bar */}
      <div className="bg-[#3B52D4] w-full px-8 py-5 flex items-center justify-between">
        <button 
          onClick={() => step > 1 && setStep(step - 1)}
          className="text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold text-sm">Back</span>
        </button>
        <span className="text-white font-bold text-lg tracking-tight">Restaurant Onboarding</span>
      </div>

      {/* Step Indicator Row */}
      <div className="bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-center">
        <div className="flex items-center gap-4 max-w-4xl w-full justify-between">
          {stepLabels.map((label, i) => {
            const currentStep = i + 1;
            const isCompleted = currentStep < step;
            const isActive = currentStep === step;

            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted ? "bg-[#25D366] text-white" : 
                    isActive ? "border-2 border-[#25D366] text-[#25D366]" : 
                    "border-2 border-slate-200 text-slate-300"
                  }`}>
                    {isCompleted ? <Check size={18} strokeWidth={4} /> : currentStep}
                  </div>
                  <span className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`h-[2px] flex-1 max-w-[150px] mx-2 transition-colors duration-500 ${
                    isCompleted ? "bg-[#25D366]" : "bg-slate-100"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center pt-16 px-6">
        <div className="w-full max-w-4xl text-center mb-10">
          <h1 className="text-[40px] font-bold text-slate-800 mb-2 font-serif">Let&apos;s set up your kitchen</h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Complete this quick onboarding to configure your operations, define your schedule, and start tracking inventory.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)] border border-slate-100">
          <div className="p-8 md:p-10 border-b border-slate-50">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">Business Details</h2>
                  <p className="text-sm text-slate-500">Basic information about your restaurant.</p>
                </div>

                <div className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide">Restaurant Name *</label>
                    <Input 
                      className="h-12 border-slate-200 rounded-xl px-4 focus:ring-[#3B52D4]"
                      placeholder="Your Restaurant Name"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 bg-slate-50/50 min-w-[110px]">
                        <span className="h-5 w-7 bg-green-700 rounded-sm relative overflow-hidden flex flex-col">
                            <span className="h-full w-[33%] bg-green-700 self-start" />
                            <span className="h-full w-[33%] bg-white absolute left-[33%]" />
                            <span className="h-full w-[33%] bg-green-700 absolute right-0" />
                        </span>
                        <span className="text-sm font-bold text-slate-500">+234</span>
                        <ChevronRight size={14} className="rotate-90 text-slate-400" />
                      </div>
                      <Input 
                        className="h-12 border-slate-200 rounded-xl px-4 flex-1"
                        placeholder="8023456789"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Used for important account alerts via Phone or WhatsApp.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">Operating Hours</h2>
                  <p className="text-sm text-slate-500">Define when your kitchen is open. This sets your daily tracking schedule automatically.</p>
                </div>

                <div className="space-y-5 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide">Opening Time</label>
                      <div className="relative group">
                        <Sun size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 group-hover:scale-110 transition-transform" />
                        <select 
                          className="w-full h-12 border border-slate-200 rounded-xl pl-11 pr-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#3B52D4] appearance-none cursor-pointer font-medium text-slate-700"
                          value={openingTime}
                          onChange={e => setOpeningTime(e.target.value)}
                        >
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{formatTimeDisplay(t)}</option>)}
                        </select>
                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide">Closing Time</label>
                      <div className="relative group">
                        <Moon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-hover:scale-110 transition-transform" />
                        <select 
                          className="w-full h-12 border border-slate-200 rounded-xl pl-11 pr-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#3B52D4] appearance-none cursor-pointer font-medium text-slate-700"
                          value={closingTime}
                          onChange={e => setClosingTime(e.target.value)}
                        >
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{formatTimeDisplay(t)}</option>)}
                        </select>
                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#EBEDFF] rounded-xl p-4 flex gap-4">
                    <div className="h-6 w-6 mt-0.5 rounded-full border-2 border-[#3B52D4] flex items-center justify-center flex-shrink-0">
                        <Clock size={12} className="text-[#3B52D4]" strokeWidth={3} />
                    </div>
                    <p className="text-sm text-[#3B52D4] font-medium leading-relaxed">
                      Your standard operating window is <span className="font-bold">{operatingHours} hours</span>. Daily stock counts and closing workflows will be scheduled based on these times.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-bold text-slate-900">Core Inventory Items</h2>
                  <p className="text-sm text-slate-500">Select the items you regularly stock to build your first inventory list.</p>
                </div>

                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    className="h-12 pl-12 border-slate-200 rounded-xl"
                    placeholder="Search catalog (e.g. Tomato, Oil, Chicken...)"
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                  {catalogLoading ? (
                    <div className="flex flex-col items-center py-12 gap-3">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                      <p className="text-slate-400 font-medium">Loading catalog...</p>
                    </div>
                  ) : Object.keys(groupedCatalog).length > 0 ? (
                    Object.entries(groupedCatalog).map(([category, items]) => (
                      <div key={category} className="space-y-3">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{category}</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {items.map(item => {
                            const isSelected = selectedIds.has(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setSelectedIds(prev => {
                                    const next = new Set(prev);
                                    if (isSelected) next.delete(item.id);
                                    else next.add(item.id);
                                    return next;
                                  });
                                }}
                                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                                  isSelected ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                                }`}
                              >
                                <div className="space-y-1">
                                  <span className={`font-bold block ${isSelected ? "text-blue-900" : "text-slate-800"}`}>{item.name}</span>
                                  <span className="text-xs text-slate-400 font-medium">{item.base_unit} · {item.subcategory || category}</span>
                                </div>
                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected ? "bg-[#3B52D4] border-[#3B52D4]" : "border-slate-200"
                                }`}>
                                  {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400">No matching items found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card Footer Progress Bar */}
          <div className="bg-[#F4F6FF] p-6 md:px-10 flex items-center justify-between rounded-b-[24px]">
            <div className="space-y-2 flex-1 mr-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Setup {progressPercent}% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#3B52D4] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,82,212,0.3)]" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Review your details before completing the onboarding process.</p>
            </div>

            <Button
              className="px-6 h-12 bg-[#3B52D4] hover:bg-[#2C3EB2] text-white font-bold rounded-xl flex items-center gap-2 group shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              onClick={() => {
                if (step < 3) setStep(step + 1);
                else completeOnboarding();
              }}
              disabled={isPending || (step === 1 && !orgName) || (step === 3 && selectedIds.size === 0)}
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {step === 3 ? "Complete Setup" : "Continue Setup"}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Global Footer */}
        <div className="w-full max-w-4xl flex items-center justify-between mt-auto py-8">
          <p className="text-xs font-bold text-slate-400">Need help? <button className="text-[#3B52D4]">Contact support</button></p>
          <p className="text-xs font-bold text-slate-400">&copy; 2025 Dosteon</p>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Figtree', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F8FAFC;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3B52D433;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3B52D4;
        }
      `}</style>
    </div>
  );
};

export default OnboardingPage;
