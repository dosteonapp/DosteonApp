import { DayState } from "./types";

export const dayModeStyles = {
  getAccentClass: (state: DayState) => 
    state === DayState.OPEN 
      ? "border-emerald-500/20 bg-emerald-50/10" 
      : "border-[#4F46E5]/10 bg-[#EEF2FF]/50",
  
  getCardClass: (state: DayState) => 
    state === DayState.OPEN 
      ? "bg-white border-slate-200" 
      : "bg-white/80 border-slate-100 opacity-90 backdrop-blur-sm",
  
  getButtonClass: (state: DayState, variant: "primary" | "secondary" = "primary") => {
    if (state === DayState.OPEN) {
      return variant === "primary" 
        ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white" 
        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50";
    }
    return "bg-slate-100 text-slate-400 cursor-not-allowed grayscale border-none shadow-none";
  },

  getStatusColors: (state: DayState) => 
    state === DayState.OPEN 
      ? { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500" }
      : { text: "text-[#4F46E5]", bg: "bg-[#EEF2FF]", border: "border-[#4F46E5]/20", dot: "bg-[#4F46E5]" }
};
