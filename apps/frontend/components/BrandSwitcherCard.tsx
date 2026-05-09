"use client";

import React, { useRef, useState, useEffect } from "react";
import { Check, ChevronDown, MapPin, LayoutGrid } from "lucide-react";
import { useBrand, Brand } from "@/context/BrandContext";
import { useUser } from "@/context/UserContext";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { cn } from "@/lib/utils";

const BRAND_PALETTE = [
  { bg: "from-[#3B59DA] to-[#6B7FED]", light: "bg-indigo-50",  text: "text-[#3B59DA]" },
  { bg: "from-[#F97316] to-[#FB923C]", light: "bg-orange-50",  text: "text-orange-500" },
  { bg: "from-[#8B5CF6] to-[#A78BFA]", light: "bg-violet-50",  text: "text-violet-600" },
  { bg: "from-[#0EA5E9] to-[#38BDF8]", light: "bg-sky-50",     text: "text-sky-500"    },
  { bg: "from-[#10B981] to-[#34D399]", light: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "from-[#EF4444] to-[#F87171]", light: "bg-rose-50",    text: "text-rose-500"   },
  { bg: "from-[#F59E0B] to-[#FBBF24]", light: "bg-amber-50",   text: "text-amber-600"  },
  { bg: "from-[#EC4899] to-[#F472B6]", light: "bg-pink-50",    text: "text-pink-500"   },
];

function brandColor(idx: number) {
  return BRAND_PALETTE[idx % BRAND_PALETTE.length];
}

function brandIndex(brands: Brand[], id: string): number {
  return brands.findIndex((b) => b.id === id);
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none",
        isOpen
          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
          : "border-slate-200 bg-slate-50 text-slate-500"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isOpen ? "bg-emerald-500" : "bg-slate-400"
        )}
      />
      {isOpen ? "LIVE" : "CLOSED"}
    </span>
  );
}

// ── Brand avatar ──────────────────────────────────────────────────────────────
function BrandAvatar({
  name,
  logoUrl,
  colorIdx,
  size = "lg",
}: {
  name: string;
  logoUrl: string | null | undefined;
  colorIdx: number;
  size?: "lg" | "sm";
}) {
  const dim = size === "lg" ? "h-10 w-10 rounded-xl" : "h-8 w-8 rounded-lg";
  const textSize = size === "lg" ? "text-sm font-black" : "text-[12px] font-black";
  const { bg } = brandColor(colorIdx);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={cn(dim, "object-cover shrink-0 shadow-sm shadow-indigo-900/10")}
      />
    );
  }
  return (
    <div
      className={cn(
        dim,
        "flex items-center justify-center text-white shrink-0",
        "bg-gradient-to-br shadow-sm shadow-indigo-900/10",
        textSize,
        bg
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function BrandSwitcherCard() {
  const { brands, activeBrand, setActiveBrand, isLoading } = useBrand();
  const { user } = useUser();
  const { isOpen } = useRestaurantDayLifecycle();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);
  const isMultiBrand = brands.length > 1;

  // Fetch restaurant location once
  useEffect(() => {
    restaurantOpsService.getSettings().then((s: any) => {
      if (s?.location) setLocation(s.location);
    }).catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-indigo-100/80 bg-gradient-to-r from-[#F4F6FF] to-white w-[260px] animate-pulse">
        <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-2 w-16 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  // No brands — show synthetic single-brand fallback
  if (!isLoading && brands.length === 0) {
    const fallbackName = user?.first_name
      ? `${user.first_name}'s Restaurant`
      : "My Restaurant";
    const { bg } = brandColor(0);
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border bg-gradient-to-r from-[#F4F6FF] to-white border-indigo-100/80 cursor-default">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 bg-gradient-to-br shadow-sm shadow-indigo-900/10", bg)}>
          {fallbackName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col text-left min-w-0 gap-1">
          <span className="text-[14px] font-bold text-[#1E293B] leading-tight tracking-tight truncate max-w-[160px]">
            {fallbackName}
          </span>
          <div className="flex items-center gap-2">
            {location && (
              <span className="text-[11px] text-slate-400 flex items-center gap-0.5 leading-none truncate max-w-[120px]">
                <MapPin className="h-3 w-3 shrink-0" />
                {location}
              </span>
            )}
            <StatusBadge isOpen={isOpen} />
          </div>
        </div>
      </div>
    );
  }

  // "All Brands" state — multi-brand with no active selection
  const isAllBrands = isMultiBrand && !activeBrand;

  // Determine display values for the trigger card
  const displayName = isAllBrands ? "All Brands" : (activeBrand?.name ?? "");
  const displayLogoUrl = isAllBrands ? null : (activeBrand?.logo_url ?? null);
  const displayColorIdx = isAllBrands
    ? 0
    : activeBrand
    ? brandIndex(brands, activeBrand.id)
    : 0;

  return (
    <div className="relative w-fit" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => isMultiBrand && setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-200 group",
          "bg-gradient-to-r from-[#F4F6FF] to-white border-indigo-100/80",
          isMultiBrand
            ? "hover:border-[#3B59DA]/30 hover:shadow-[0_4px_20px_rgba(59,89,218,0.08)] active:scale-[0.98] cursor-pointer"
            : "cursor-default"
        )}
        aria-haspopup={isMultiBrand ? "listbox" : undefined}
        aria-expanded={isMultiBrand ? open : undefined}
      >
        {/* Avatar */}
        {isAllBrands ? (
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
            "bg-gradient-to-br shadow-sm shadow-indigo-900/10 transition-transform duration-200",
            isMultiBrand && "group-hover:scale-105",
            brandColor(0).bg
          )}>
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className={cn(isMultiBrand && "group-hover:scale-105 transition-transform duration-200")}>
            <BrandAvatar
              name={displayName}
              logoUrl={displayLogoUrl}
              colorIdx={displayColorIdx}
              size="lg"
            />
          </div>
        )}

        {/* Text */}
        <div className="flex flex-col text-left min-w-0 gap-1">
          <span className="text-[14px] font-bold text-[#1E293B] leading-tight tracking-tight truncate max-w-[160px]">
            {displayName}
          </span>
          <div className="flex items-center gap-2">
            {location && (
              <span className="text-[11px] text-slate-400 flex items-center gap-0.5 leading-none truncate max-w-[120px]">
                <MapPin className="h-3 w-3 shrink-0" />
                {location}
              </span>
            )}
            <StatusBadge isOpen={isOpen} />
          </div>
        </div>

        {/* Chevron — multi-brand only */}
        {isMultiBrand && (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-300 shrink-0 transition-all duration-200 ml-1",
              "group-hover:text-[#3B59DA]",
              open && "rotate-180 text-[#3B59DA]"
            )}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {isMultiBrand && open && (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 top-[calc(100%+6px)] z-[200] min-w-[260px]",
            "bg-white border border-slate-100 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.12)]",
            "overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Switch Brand
            </p>
          </div>

          {/* Options */}
          <div className="py-1.5">
            {/* All Brands option */}
            <button
              role="option"
              aria-selected={isAllBrands}
              type="button"
              onClick={() => {
                setActiveBrand(null);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group/item",
                isAllBrands ? "bg-indigo-50/70" : "hover:bg-slate-50/80"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                "bg-gradient-to-br shadow-sm",
                brandColor(0).bg
              )}>
                <LayoutGrid className="h-3.5 w-3.5 text-white" />
              </div>
              <span className={cn(
                "flex-1 text-[13px] font-bold text-left truncate",
                isAllBrands ? "text-[#3B59DA]" : "text-slate-700 group-hover/item:text-[#1E293B]"
              )}>
                All Brands
              </span>
              {isAllBrands ? (
                <span className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", brandColor(0).light)}>
                  <Check className={cn("h-3 w-3 stroke-[3px]", brandColor(0).text)} />
                </span>
              ) : (
                <span className="h-5 w-5 rounded-full bg-slate-100/0 group-hover/item:bg-slate-100 flex items-center justify-center shrink-0 transition-colors" />
              )}
            </button>

            {/* Per-brand options */}
            {brands.map((brand, idx) => {
              const isActive = activeBrand?.id === brand.id;
              const { light, text } = brandColor(idx);
              return (
                <button
                  key={brand.id}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    setActiveBrand(brand);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group/item",
                    isActive ? "bg-indigo-50/70" : "hover:bg-slate-50/80"
                  )}
                >
                  <BrandAvatar
                    name={brand.name}
                    logoUrl={brand.logo_url}
                    colorIdx={idx}
                    size="sm"
                  />
                  <span className={cn(
                    "flex-1 text-[13px] font-bold text-left truncate",
                    isActive ? "text-[#3B59DA]" : "text-slate-700 group-hover/item:text-[#1E293B]"
                  )}>
                    {brand.name}
                  </span>
                  {isActive ? (
                    <span className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", light)}>
                      <Check className={cn("h-3 w-3 stroke-[3px]", text)} />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-slate-100/0 group-hover/item:bg-slate-100 flex items-center justify-center shrink-0 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
            <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">
              Each brand has its own sales, menu, and stats.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
