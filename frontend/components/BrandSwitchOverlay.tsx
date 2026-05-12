"use client";

import { useBrand } from "@/context/BrandContext";
import { cn } from "@/lib/utils";

function Avatar({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
  return logoUrl ? (
    <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
  ) : (
    <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
      <span className="text-white text-[22px] font-black leading-none select-none">
        {name[0]?.toUpperCase() ?? "B"}
      </span>
    </div>
  );
}

/**
 * Covers the content area (not the topbar) during a brand switch.
 * Positioned absolute inside <main> at z-[35]; the header sits at z-40 above it.
 * Fades in immediately on switch, fades out after 350 ms when isSwitching → false.
 */
export function BrandSwitchOverlay() {
  const { isSwitching, activeBrand } = useBrand();
  const name = activeBrand?.name ?? "Workspace";

  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 z-[35] flex items-center justify-center",
        "bg-white/85 backdrop-blur-[3px]",
        "transition-opacity duration-200 ease-in-out",
        isSwitching ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col items-center gap-5 select-none">
        {/* Brand avatar */}
        <div className="h-[72px] w-[72px] rounded-[18px] overflow-hidden shadow-[0_8px_32px_rgba(59,89,218,0.18)] ring-4 ring-white">
          <Avatar logoUrl={activeBrand?.logo_url} name={name} />
        </div>

        {/* Brand info */}
        <div className="text-center space-y-1">
          <p className="text-[16px] font-bold text-[#1E293B] font-figtree">{name}</p>
          <p className="text-[12px] font-medium text-slate-400 font-figtree">
            Switching workspace…
          </p>
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#3B59DA] animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
