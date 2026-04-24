"use client";
import React, { useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import OnboardingBottomBar from "./OnboardingBottomBar";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Country codes
// ---------------------------------------------------------------------------
const COUNTRY_CODES = [
  { code: "+250", flag: "🇷🇼", label: "Rwanda" },
  { code: "+254", flag: "🇰🇪", label: "Kenya" },
  { code: "+256", flag: "🇺🇬", label: "Uganda" },
  { code: "+255", flag: "🇹🇿", label: "Tanzania" },
  { code: "+243", flag: "🇨🇩", label: "DR Congo" },
  { code: "+234", flag: "🇳🇬", label: "Nigeria" },
  { code: "+233", flag: "🇬🇭", label: "Ghana" },
  { code: "+27",  flag: "🇿🇦", label: "South Africa" },
  { code: "+251", flag: "🇪🇹", label: "Ethiopia" },
  { code: "+212", flag: "🇲🇦", label: "Morocco" },
  { code: "+20",  flag: "🇪🇬", label: "Egypt" },
  { code: "+1",   flag: "🇺🇸", label: "USA / Canada" },
  { code: "+44",  flag: "🇬🇧", label: "UK" },
  { code: "+33",  flag: "🇫🇷", label: "France" },
  { code: "+49",  flag: "🇩🇪", label: "Germany" },
  { code: "+91",  flag: "🇮🇳", label: "India" },
  { code: "+86",  flag: "🇨🇳", label: "China" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+966", flag: "🇸🇦", label: "Saudi Arabia" },
  { code: "+55",  flag: "🇧🇷", label: "Brazil" },
];

const BUSINESS_TYPES = ["Restaurant", "Café", "Bar", "Fast Food", "Cloud Kitchen", "Bakery", "Other"];

// Lettered labels for brand inputs (A, B, C …)
const BRAND_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Orange shades cycle for brand letter badges
const BRAND_COLORS = ["#F97316", "#EF4444", "#8B5CF6", "#0EA5E9", "#10B981"];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CheckCardProps {
  checked: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  subHint?: string;
}

function CheckCard({ checked, onClick, title, subtitle, subHint }: CheckCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        className={[
          "flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all w-full",
          checked
            ? "border-[#3B4EFF] bg-[#EEF0FF]"
            : "border-gray-200 bg-white hover:border-gray-300",
        ].join(" ")}
      >
        {/* Checkbox indicator */}
        <span
          className={[
            "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
            checked
              ? "border-[#3B4EFF] bg-[#3B4EFF]"
              : "border-gray-300 bg-white",
          ].join(" ")}
        >
          {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </span>

        {/* Text */}
        <span>
          <span className={["text-sm font-medium", checked ? "text-[#3B4EFF]" : "text-gray-800"].join(" ")}>
            {title}
          </span>
          {subtitle && (
            <span className="block text-xs text-gray-500 mt-0.5">{subtitle}</span>
          )}
          {/* Sub-hint inside the card when selected */}
          {checked && subHint && (
            <span className="block text-xs text-gray-500 mt-1">{subHint}</span>
          )}
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Step1Business() {
  const { state, setStep1Field, setBrand, addBrand, removeBrand, goToStep, submitStep1, step1Valid } =
    useOnboarding();
  const { step1 } = state;

  const [countryCode, setCountryCode] = useState("+250");
  const [ccOpen, setCcOpen] = useState(false);
  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  const handlePhoneChange = (raw: string) => {
    // Only digits
    setStep1Field("phone", raw.replace(/\D/g, ""));
  };

  const handleContinue = async () => {
    if (!step1Valid) return;
    try {
      // Assemble the full phone string (country code + digits) and pass it
      // directly to submitStep1 to avoid a stale-closure race where the context
      // state update hasn't propagated yet when submitStep1 fires.
      const rawPhone = step1.phone.startsWith(countryCode)
        ? step1.phone
        : step1.phone
        ? `${countryCode}${step1.phone}`
        : "";
      await submitStep1(rawPhone || undefined);
      // Keep context state in sync so Back navigation shows the full number.
      if (rawPhone && rawPhone !== step1.phone) {
        setStep1Field("phone", rawPhone);
      }
      goToStep(2);
    } catch {
      toast.error("Could not save business details. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Scrollable body ── */}
      <div className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-2xl">
        {/* Header */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3B4EFF] mb-1">
          Step 1: Your Business
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Tell us about your food business
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Business details, structure, and brands, all in one place. This configures your entire account.
        </p>

        {/* ── YOUR DETAILS ── */}
        <section className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Your Details
          </p>

          {/* Row 1: Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Restaurant Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Restaurant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Your Restaurant Name"
                value={step1.name}
                onChange={(e) => setStep1Field("name", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Phone Number
              </label>
              <div className="flex gap-1.5">
                {/* Country code picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCcOpen((o) => !o)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-2.5 text-sm text-gray-700 bg-white hover:border-gray-300 focus:outline-none min-w-[80px]"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="font-medium">{countryCode}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-0.5" />
                  </button>

                  {ccOpen && (
                    <div className="absolute left-0 top-full mt-1 z-50 w-52 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(c.code);
                            setCcOpen(false);
                          }}
                          className={[
                            "flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50",
                            c.code === countryCode ? "bg-blue-50 text-[#3B4EFF] font-medium" : "text-gray-700",
                          ].join(" ")}
                        >
                          <span>{c.flag}</span>
                          <span>{c.label}</span>
                          <span className="ml-auto text-gray-400">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  placeholder="8023456789"
                  value={step1.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Used for important account alerts via Phone or WhatsApp
              </p>
            </div>
          </div>

          {/* Row 2: City + Business Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
              <input
                type="text"
                placeholder="Your Restaurant Name"
                value={step1.city}
                onChange={(e) => setStep1Field("city", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Business Type</label>
              <div className="relative">
                <select
                  value={step1.business_type}
                  onChange={(e) => setStep1Field("business_type", e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 pr-8 text-sm text-gray-900 bg-white focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
                >
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </section>

        {/* ── DAILY INVENTORY STOCK COUNT ── */}
        <section className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Daily Inventory Stock Count
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Do you currently count your opening and closing stock? Select Yes or No
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CheckCard
              checked={step1.daily_stock_count === true}
              onClick={() => setStep1Field("daily_stock_count", true)}
              title="Yes, I count my inventory stock daily"
            />
            <CheckCard
              checked={step1.daily_stock_count === false}
              onClick={() => setStep1Field("daily_stock_count", false)}
              title="No, I don't"
              subHint="You can enable this anytime in settings as your team grows"
            />
          </div>
        </section>

        {/* ── BUSINESS STRUCTURE ── */}
        <section className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Business Structure
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Do you operate multiple brands or restaurant concepts?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CheckCard
              checked={step1.has_multiple_brands === true}
              onClick={() => setStep1Field("has_multiple_brands", true)}
              title="Yes, multiple brands"
              subtitle="Same brand, different branches or delivery kitchens"
            />
            <CheckCard
              checked={step1.has_multiple_brands === false}
              onClick={() => setStep1Field("has_multiple_brands", false)}
              title="No, just one brand"
              subtitle="One business name, one identity"
            />
          </div>

          {/* YOUR BRANDS — revealed when multiple brands selected */}
          {step1.has_multiple_brands === true && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Your Brands
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Add each brand. Each one gets its own dashboard, P&L, and sales log, all with a shared billing under your organization.
              </p>

              <div className="space-y-2.5">
                {step1.brands.map((brand, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {/* Lettered badge */}
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}
                    >
                      {BRAND_LETTERS[idx] ?? idx + 1}
                    </span>

                    <input
                      type="text"
                      placeholder="Brand name e.g., Mr. Chef Restaurant"
                      value={brand}
                      onChange={(e) => setBrand(idx, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]"
                    />

                    {/* Remove brand — only when more than 2 brands exist */}
                    {step1.brands.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeBrand(idx)}
                        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove brand"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addBrand}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#3B4EFF] hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add another brand
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── Bottom bar ── */}
      <OnboardingBottomBar
        hint=""
        onContinue={handleContinue}
        disabled={!step1Valid}
        hideBack
      />
    </div>
  );
}
