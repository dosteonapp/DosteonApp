"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import AuthFooter from "@/components/auth/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Clock,
  ChevronRight,
  Check,
  Loader2,
  Search,
  ArrowLeft,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
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
  const [countryCode, setCountryCode] = useState("+250");
  const [phone, setPhone] = useState("");
  const [openingTime, setOpeningTime] = useState("07:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [catalogSearch, setCatalogSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All Items");
  const [stockStep, setStockStep] = useState<"select" | "quantities">("select");
  const [openingQuantities, setOpeningQuantities] = useState<Record<string, string>>({});

  const handleCountryCodeChange = (raw: string) => {
    let value = raw.replace(/\s+/g, "");

    if (!value.startsWith("+")) {
      value = "+" + value;
    }

    const digits = value.slice(1).replace(/\D/g, "");
    setCountryCode("+" + digits);
  };

  const handlePhoneChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, "");
    setPhone(digitsOnly);
  };

  // Calculate operating hours
  const operatingHours = useMemo(() => {
    const [openH, openM] = openingTime.split(":").map(Number);
    const [closeH, closeM] = closingTime.split(":").map(Number);
    
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of catalog) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [catalog]);

  const categoryList = useMemo(
    () => Object.entries(categoryCounts).sort((a, b) => a[0].localeCompare(b[0])),
    [categoryCounts],
  );

  const visibleItems = useMemo(
    () =>
      filteredCatalog.filter((item) =>
        activeCategory === "All Items" ? true : item.category === activeCategory,
      ),
    [filteredCatalog, activeCategory],
  );

  const selectedItems = useMemo(
    () => catalog.filter((item) => selectedIds.has(item.id)),
    [catalog, selectedIds],
  );

  const { mutate: completeOnboarding, isPending } = useMutation({
    mutationFn: async () => {
      const opening_quantities: Record<string, number> = {};
      selectedIds.forEach((id) => {
        const raw = openingQuantities[id];
        if (raw === undefined || raw === "") return;
        const value = parseFloat(raw);
        if (!Number.isNaN(value) && value >= 0) {
          opening_quantities[id] = value;
        }
      });

      const { data } = await axiosInstance.post("auth/onboard", {
        organization_name: orgName,
        address: "Default Location", // Placeholder until address step is added
        phone: `${countryCode}${phone}`,
        opening_time: openingTime,
        closing_time: closingTime,
        selected_canonical_ids: Array.from(selectedIds),
        opening_quantities,
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
    }
  });

  const stepLabels = ["Business Details", "Operating Hours", "Core Inventory Items"];
  const progressPercent = step === 1 ? 30 : step === 2 ? 65 : 95;

  const stepMeta = [
    {
      stepLabel: "STEP 1 OF 3",
      title: "Set up your kitchen",
      subtitle:
        "Write your restaurant name and phone number. We'll send stock alerts and daily reminders via WhatsApp.",
    },
    {
      stepLabel: "STEP 2 OF 3",
      title: "When are you open?",
      subtitle: "Dosteon uses this to schedule your daily stock checks.",
    },
    {
      stepLabel: "STEP 3 OF 3",
      title: "What does your kitchen stock?",
      subtitle:
        "Select the ingredients you track every day. These become your core inventory for Daily Stock Count, Kitchen Service, and Inventory.",
    },
  ] as const;

  const currentMeta = stepMeta[step - 1];
  const normalizedCode = countryCode.replace(/\s+/g, "");
  const flagPalette: Array<{ prefix: string; colors: [string, string, string] }> = [
    // East Africa
    { prefix: "+250", colors: ["#00A1DE", "#FAD201", "#20603D"] }, // Rwanda
    { prefix: "+254", colors: ["#000000", "#BB0000", "#006600"] }, // Kenya (approx.)
    { prefix: "+256", colors: ["#000000", "#FFCD00", "#D90012"] }, // Uganda (approx.)
    { prefix: "+255", colors: ["#1EB53A", "#FCD116", "#000000"] }, // Tanzania (approx.)

    // West Africa
    { prefix: "+234", colors: ["#008753", "#FFFFFF", "#008753"] }, // Nigeria
    { prefix: "+233", colors: ["#CE1126", "#FCD116", "#006B3F"] }, // Ghana
    { prefix: "+221", colors: ["#00853F", "#FDEF42", "#E31B23"] }, // Senegal (approx.)
    { prefix: "+225", colors: ["#F77F00", "#FFFFFF", "#009E60"] }, // Cote d'Ivoire (approx.)

    // Southern Africa
    { prefix: "+27", colors: ["#007749", "#FFB81C", "#002395"] }, // South Africa (approx.)

    // North Africa
    { prefix: "+212", colors: ["#C1272D", "#C1272D", "#C1272D"] }, // Morocco
    { prefix: "+213", colors: ["#FFFFFF", "#FFFFFF", "#007A3D"] }, // Algeria (approx.)

    // Europe
    { prefix: "+44", colors: ["#00247D", "#FFFFFF", "#CF142B"] }, // UK (approx.)
    { prefix: "+33", colors: ["#0055A4", "#FFFFFF", "#EF4135"] }, // France
    { prefix: "+49", colors: ["#000000", "#DD0000", "#FFCE00"] }, // Germany

    // Americas & others
    { prefix: "+1", colors: ["#3C3B6E", "#FFFFFF", "#B22234"] }, // US/Canada (approx.)
    { prefix: "+55", colors: ["#009C3B", "#FFDF00", "#002776"] }, // Brazil

    // Asia
    { prefix: "+91", colors: ["#FF9933", "#FFFFFF", "#138808"] }, // India (approx.)
  ];

  const match = flagPalette.find(({ prefix }) => normalizedCode.startsWith(prefix));
  const flagColors: [string, string, string] = match
    ? match.colors
    : ["#CBD5F5", "#E5E7EB", "#CBD5F5"]; // Generic fallback

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-figtree">
      {/* Top Navigation with Logo + Stepper + Back */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Link href="/">
              <img
                src="/images/logo-full.png"
                alt="Dosteon Logo"
                className="h-7 w-auto"
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-4 max-w-xl w-full justify-between">
              {stepLabels.map((label, i) => {
                const currentStep = i + 1;
                const isCompleted = currentStep < step;
                const isActive = currentStep === step;

                return (
                  <React.Fragment key={label}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isActive
                            ? "border border-emerald-500 text-emerald-600 bg-white"
                            : "border border-slate-300 text-slate-400 bg-white"
                        }`}
                      >
                        {isCompleted ? <Check size={16} strokeWidth={3} /> : currentStep}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div
                        className={`h-px flex-1 max-w-[140px] mx-2 transition-colors ${
                          isCompleted ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                router.push("/auth/restaurant/signin");
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center pt-12 px-6">
        <div className="w-full max-w-5xl mb-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
            {currentMeta.stepLabel}
          </p>
          <h1 className="mt-2 text-[32px] md:text-[36px] font-semibold text-slate-900 font-serif">
            {currentMeta.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Steps 1–2: Centered card layout */}
        {step !== 3 && (
          <div className="w-full max-w-5xl bg-white rounded-[24px] shadow-[0_10px_40px_-15px_rgba(15,23,42,0.3)] border border-slate-100">
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
                        onChange={(e) => setOrgName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide">Phone Number</label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 bg-slate-50/50 min-w-[130px]">
                          <span className="h-5 w-7 rounded-sm relative overflow-hidden flex flex-col">
                            <span className="h-2/4 w-full" style={{ backgroundColor: flagColors[0] }} />
                            <span className="h-1/4 w-full" style={{ backgroundColor: flagColors[1] }} />
                            <span className="h-1/4 w-full" style={{ backgroundColor: flagColors[2] }} />
                          </span>
                          <input
                            className="w-16 bg-transparent border-none outline-none text-sm font-bold text-slate-600"
                            value={countryCode}
                            onChange={(e) => handleCountryCodeChange(e.target.value)}
                            placeholder="+250"
                          />
                        </div>
                        <Input
                          className="h-12 border-slate-200 rounded-xl px-4 flex-1"
                          type="tel"
                          inputMode="numeric"
                          placeholder="781234567"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
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
                            onChange={(e) => setOpeningTime(e.target.value)}
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {formatTimeDisplay(t)}
                              </option>
                            ))}
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
                            onChange={(e) => setClosingTime(e.target.value)}
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {formatTimeDisplay(t)}
                              </option>
                            ))}
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
                    style={{ width: progressPercent + "%" }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                  Review your details before completing the onboarding process.
                </p>
              </div>

              <Button
                className="px-8 h-12 bg-[#2155FF] hover:bg-[#1a46c7] text-white font-semibold rounded-xl flex items-center gap-2 group shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                onClick={() => {
                  if (step < 3) {
                    setStep(step + 1);
                  }
                }}
                disabled={isPending || (step === 1 && !orgName)}
              >
                {isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Continue
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Full overlay-style layout */}
        {step === 3 && (
          <section className="w-full max-w-6xl mt-4 flex flex-col gap-6">
            {stockStep === "select" ? (
              <>
                <div className="space-y-1">
                  <h2 className="text-[22px] md:text-[24px] font-bold text-slate-900">
                    What does your kitchen stock?
                  </h2>
                  <p className="text-sm text-slate-500 max-w-3xl">
                    Select every item you use. These choices power your Daily Stock Count, Kitchen Service,
                    and Inventory views. You can always add more later.
                  </p>
                </div>

                <div className="mt-2 flex gap-8 items-start">
                  {/* Categories Sidebar */}
                  <aside className="w-60 border-r border-slate-100 pr-6 hidden md:block">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.18em] mb-3">
                      Categories
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setActiveCategory("All Items")}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                          activeCategory === "All Items"
                            ? "bg-[#F3F4FF] text-slate-900"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <span>All Items</span>
                        <span className="inline-flex h-5 min-w-[24px] items-center justify-center rounded-full bg-white px-2 text-[10px] font-semibold text-slate-500 shadow-sm">
                          {catalog.length}
                        </span>
                      </button>

                      {categoryList.map(([category, count]) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                            activeCategory === category
                              ? "bg-[#F3F4FF] text-slate-900"
                              : "text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{category}</span>
                          <span className="inline-flex h-5 min-w-[24px] items-center justify-center rounded-full bg-white px-2 text-[10px] font-semibold text-slate-500 shadow-sm">
                            {count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </aside>

                  {/* Catalog Grid */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="space-y-3">
                      <div className="relative">
                        <Search
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <Input
                          className="h-12 pl-11 border-slate-200 rounded-xl"
                          placeholder="Search for ingredients (e.g., Tomatoes, Beef)..."
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">All Items</h3>
                          <p className="text-xs text-slate-500">
                            Select items to add them to your core inventory draft. You can set opening
                            quantities next.
                          </p>
                        </div>
                        <p className="text-xs font-medium text-slate-500 whitespace-nowrap">
                          {selectedIds.size} item{selectedIds.size === 1 ? "" : "s"} selected
                        </p>
                      </div>
                    </div>

                    <div className="max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                      {catalogLoading ? (
                        <div className="flex flex-col items-center py-12 gap-3">
                          <Loader2 className="animate-spin text-indigo-500" size={32} />
                          <p className="text-slate-400 font-medium">Loading catalog...</p>
                        </div>
                      ) : visibleItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {visibleItems.map((item) => {
                            const isSelected = selectedIds.has(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setSelectedIds((prev) => {
                                    const next = new Set(prev);
                                    if (isSelected) next.delete(item.id);
                                    else next.add(item.id);
                                    return next;
                                  });
                                }}
                                className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all ${
                                  isSelected
                                    ? "border-[#2155FF] bg-[#F5F7FF] shadow-[0_6px_18px_-10px_rgba(37,99,235,0.6)]"
                                    : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-[11px] font-semibold text-slate-400">
                                    {item.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <p
                                      className={`truncate text-sm font-semibold ${
                                        isSelected ? "text-slate-900" : "text-slate-800"
                                      }`}
                                    >
                                      {item.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">
                                      {item.base_unit} · {item.subcategory || item.category}
                                    </p>
                                  </div>
                                </div>
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                                    isSelected
                                      ? "border-[#2155FF] bg-[#2155FF] text-white"
                                      : "border-slate-300 bg-white text-slate-500"
                                  }`}
                                >
                                  {isSelected ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                          No matching items found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-emerald-500 uppercase tracking-[0.18em]">
                    Almost done
                  </p>
                  <h2 className="mt-1 text-[22px] md:text-[24px] font-bold text-slate-900">
                    How much do you have right now?
                  </h2>
                  <p className="text-sm text-slate-500 max-w-3xl">
                    Enter your current stock. These opening quantities seed your first Daily Stock Count.
                    Skip any you&apos;re unsure about; you can update later.
                  </p>
                </div>

                <div className="mt-4 space-y-6 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedItems.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No items selected. Go back and add items to set opening quantities.
                    </p>
                  ) : (
                    Object.entries(
                      selectedItems.reduce<Record<string, CatalogItem[]>>((acc, item) => {
                        const key = item.category;
                        acc[key] = acc[key] || [];
                        acc[key].push(item);
                        return acc;
                      }, {}),
                    ).map(([category, items]) => (
                      <div key={category} className="space-y-3">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                          {category}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((item) => {
                            const value = openingQuantities[item.id] ?? "";
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-[11px] font-semibold text-slate-400">
                                    {item.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate">
                                      {item.subcategory || item.category}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.16em]">
                                      Opening Qty
                                    </span>
                                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                                      <input
                                        type="number"
                                        min={0}
                                        className="w-16 border-0 bg-transparent text-right text-sm font-medium text-slate-900 focus:outline-none"
                                        value={value}
                                        onChange={(e) =>
                                          setOpeningQuantities((prev) => ({
                                            ...prev,
                                            [item.id]: e.target.value,
                                          }))
                                        }
                                      />
                                      <span className="text-[11px] text-slate-400 font-medium">
                                        {item.base_unit}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="text-slate-300 hover:text-slate-500 text-xs font-medium"
                                    onClick={() => {
                                      setSelectedIds((prev) => {
                                        const next = new Set(prev);
                                        next.delete(item.id);
                                        return next;
                                      });
                                      setOpeningQuantities((prev) => {
                                        const { [item.id]: _, ...rest } = prev;
                                        return rest;
                                      });
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Bottom action bar for step 3 */}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <div className="text-xs text-slate-500">
                {stockStep === "select" ? (
                  <span>
                    {selectedIds.size === 0
                      ? "Select at least one ingredient to create your core inventory."
                      : `${selectedIds.size} item${selectedIds.size === 1 ? "" : "s"} selected`}
                  </span>
                ) : (
                  <span>You can update these any time from the inventory screen.</span>
                )}
              </div>

              <Button
                className="px-8 h-12 bg-[#2155FF] hover:bg-[#1a46c7] text-white font-semibold rounded-xl flex items-center gap-2 group shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                onClick={() => {
                  if (stockStep === "select") {
                    setOpeningQuantities((prev) => {
                      const next = { ...prev };
                      selectedIds.forEach((id) => {
                        if (next[id] === undefined) next[id] = "";
                      });
                      return next;
                    });
                    setStockStep("quantities");
                    return;
                  }
                  completeOnboarding();
                }}
                disabled={isPending || (stockStep === "select" && selectedIds.size === 0)}
              >
                {isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {stockStep === "select" ? "Set opening quantities" : "Finish Setup"}
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </section>
        )}

        {/* Global Footer (hidden on step 3 overlay) */}
        {step !== 3 && (
          <div className="w-full mt-12 md:mt-16">
            <AuthFooter />
          </div>
        )}
      </main>
    </div>
  );
};

export default OnboardingPage;
