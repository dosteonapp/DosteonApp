"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import {
  Building2,
  MapPin,
  Clock,
  ShoppingBasket,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const POST_ONBOARDING_URL = "/auth/restaurant/status/email-verified";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  base_unit: string;
  is_critical_item: boolean;
}

// ─── Time options ─────────────────────────────────────────────────────────────

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of ["00", "30"]) {
    const hh = String(h).padStart(2, "0");
    TIME_OPTIONS.push(`${hh}:${m}`);
  }
}

function formatTime(t: string): string {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${suffix}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

const OnboardingPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [address, setAddress] = useState("");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [catalogSearch, setCatalogSearch] = useState("");

  // Fetch public catalog (needs auth token — user is signed in after signup)
  const { data: catalog = [], isLoading: catalogLoading } = useQuery<CatalogItem[]>({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/inventory/catalog");
      return data;
    },
    enabled: step === 5,
    staleTime: 5 * 60 * 1000,
  });

  const filteredCatalog = catalog.filter((item) => {
    const q = catalogSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.subcategory || "").toLowerCase().includes(q)
    );
  });

  // Group by category for display
  const grouped = filteredCatalog.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { mutate: completeOnboarding, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/onboard", {
        organization_name: orgName,
        address,
        opening_time: openingTime,
        closing_time: closingTime,
        selected_canonical_ids: Array.from(selectedIds),
      });
      return data;
    },
    onSuccess: () => {
      toast({ title: "Workspace ready", description: "Your restaurant is set up." });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push(POST_ONBOARDING_URL);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description:
          error.response?.data?.detail || "Something went wrong. Please try again.",
      });
    },
  });

  // ── Step renders ──────────────────────────────────────────────────────────

  const STEPS = 5;

  const stepConfig = [
    { icon: Building2, label: "Restaurant Name" },
    { icon: MapPin, label: "Location" },
    { icon: Clock, label: "Opening Time" },
    { icon: Clock, label: "Closing Time" },
    { icon: ShoppingBasket, label: "Inventory" },
  ];

  const renderStep = () => {
    switch (step) {
      // ── Step 1: Restaurant Name ──────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
                <Building2 size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Name your restaurant
                </h1>
                <p className="text-slate-500 font-medium">
                  This is how your workspace will be identified.
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Restaurant Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. The Silver Spoon"
                  className="h-14 rounded-2xl border-slate-200 text-lg font-medium px-6 focus:ring-blue-500 focus:border-blue-500"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && orgName.trim() && setStep(2)}
                  autoFocus
                />
              </div>
              <Button
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group"
                onClick={() => setStep(2)}
                disabled={!orgName.trim()}
              >
                Continue
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        );

      // ── Step 2: Address ───────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
                <MapPin size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Location
                </h1>
                <p className="text-slate-500 font-medium">
                  Where is{" "}
                  <span className="text-slate-700 font-bold">{orgName}</span> located?
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. 123 Culinary Ave, Paris"
                  className="h-14 rounded-2xl border-slate-200 text-lg font-medium px-6 focus:ring-blue-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && address.trim() && setStep(3)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl flex-1 font-bold text-slate-600"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft size={18} />
                  Back
                </Button>
                <Button
                  className="h-14 rounded-2xl flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  onClick={() => setStep(3)}
                  disabled={!address.trim()}
                >
                  Continue
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        );

      // ── Step 3: Opening Time ──────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
                <Clock size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Opening Time
                </h1>
                <p className="text-slate-500 font-medium">
                  What time does your restaurant open?
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Opens at <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-14 rounded-2xl border border-slate-200 text-lg font-medium px-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl flex-1 font-bold text-slate-600"
                  onClick={() => setStep(2)}
                >
                  <ChevronLeft size={18} />
                  Back
                </Button>
                <Button
                  className="h-14 rounded-2xl flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  onClick={() => setStep(4)}
                >
                  Continue
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        );

      // ── Step 4: Closing Time ──────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
                <Clock size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Closing Time
                </h1>
                <p className="text-slate-500 font-medium">
                  What time does your restaurant close?
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Closes at <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-14 rounded-2xl border border-slate-200 text-lg font-medium px-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl flex-1 font-bold text-slate-600"
                  onClick={() => setStep(3)}
                >
                  <ChevronLeft size={18} />
                  Back
                </Button>
                <Button
                  className="h-14 rounded-2xl flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  onClick={() => setStep(5)}
                >
                  Continue
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        );

      // ── Step 5: Select Inventory Items ────────────────────────────────────
      case 5:
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
                <ShoppingBasket size={40} />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Core Inventory
                </h1>
                <p className="text-slate-500 font-medium">
                  Select the items you regularly stock.
                </p>
                <p className="text-xs text-slate-400">
                  You can add more items anytime from the Inventory page.
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search items..."
                className="pl-10 h-11 rounded-2xl border-slate-200"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>

            {/* Selection summary */}
            {selectedIds.size > 0 && (
              <p className="text-sm font-semibold text-blue-600 text-center">
                {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected
              </p>
            )}

            {/* Catalog list */}
            <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
              {catalogLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={28} className="animate-spin text-slate-300" />
                </div>
              ) : Object.keys(grouped).length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-sm">No items found.</p>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                      {category}
                    </p>
                    <div className="space-y-1.5">
                      {items.map((item) => {
                        const selected = selectedIds.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left ${
                              selected
                                ? "bg-blue-50 border-blue-300 text-blue-800"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <div>
                              <span className="font-semibold text-sm">{item.name}</span>
                              {item.is_critical_item && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">
                                  critical
                                </span>
                              )}
                              <span className="block text-xs text-slate-400 mt-0.5">
                                {item.subcategory || item.category} · {item.base_unit}
                              </span>
                            </div>
                            <div
                              className={`h-6 w-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                                selected
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-slate-300"
                              }`}
                            >
                              {selected && <Check size={13} className="text-white" strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="h-14 rounded-2xl flex-1 font-bold text-slate-600"
                onClick={() => setStep(4)}
                disabled={isPending}
              >
                <ChevronLeft size={18} />
                Back
              </Button>
              <Button
                className="h-14 rounded-2xl flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                onClick={() => completeOnboarding()}
                disabled={isPending || selectedIds.size === 0}
              >
                {isPending ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <Check size={20} />
                  </>
                )}
              </Button>
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
          {/* Step progress bar */}
          <div className="flex gap-2 mb-10">
            {Array.from({ length: STEPS }, (_, i) => i + 1).map((s) => (
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50/30 rounded-full -ml-16 -mb-16 blur-3xl opacity-50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
