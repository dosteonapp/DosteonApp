"use client";
import React, { useCallback } from "react";
import { Check, ChevronDown, Clock } from "lucide-react";
import { useOnboarding, DayKey } from "@/context/OnboardingContext";
import OnboardingBottomBar from "./OnboardingBottomBar";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Time options — 30-min increments, 12-h display, 24-h value
// ---------------------------------------------------------------------------
interface TimeOption {
  value: string;   // "HH:MM" 24-h
  label: string;   // "hh:MM AM/PM"
}

function buildTimeOptions(): TimeOption[] {
  const opts: TimeOption[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const suffix = h < 12 ? "AM" : "PM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      opts.push({
        value: `${hh}:${mm}`,
        label: `${String(h12).padStart(2, "0")}:${mm} ${suffix}`,
      });
    }
  }
  return opts;
}

const TIME_OPTIONS = buildTimeOptions();

// ---------------------------------------------------------------------------
// Day row display labels
// ---------------------------------------------------------------------------
const DAY_LABELS: Record<DayKey, string> = {
  SUN: "Sun",
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thur",
  FRI: "Fri",
  SAT: "Sat",
};

const DAY_ORDER: DayKey[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// ---------------------------------------------------------------------------
// Time select sub-component
// ---------------------------------------------------------------------------
interface TimeSelectProps {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}

function TimeSelect({ value, onChange, disabled }: TimeSelectProps) {
  return (
    <div className="relative w-full sm:w-36">
      {/* Clock icon */}
      <Clock
        className={[
          "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5",
          disabled ? "text-gray-300" : "text-gray-400",
        ].join(" ")}
      />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full appearance-none rounded-lg border pl-8 pr-8 py-2.5 text-sm transition-colors",
          disabled
            ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
            : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 focus:border-[#3B4EFF] focus:outline-none focus:ring-1 focus:ring-[#3B4EFF]",
        ].join(" ")}
      >
        {TIME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={[
          "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4",
          disabled ? "text-gray-300" : "text-gray-400",
        ].join(" ")}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Step2Hours() {
  const {
    state,
    toggleDay,
    setDayTime,
    goToStep,
    submitStep2,
    step2Valid,
  } = useOnboarding();

  const { operating_days } = state.step2;

  const handleContinue = useCallback(async () => {
    if (!step2Valid) return;
    try {
      await submitStep2();
      goToStep(3);
    } catch {
      toast.error("Could not save operating hours. Please try again.");
    }
  }, [step2Valid, submitStep2, goToStep]);

  const handleBack = useCallback(() => goToStep(1), [goToStep]);

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Scrollable body ── */}
      <div className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-2xl">
        {/* Header */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3B4EFF] mb-1">
          Step 2: Operating Hours
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          What are your operating days &amp; hours
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          We&apos;ll use your hours to know when to prompt daily data entry.
        </p>

        {/* ── OPERATING DAYS AND TIMES ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Operating Days and Times
          </p>

          {/* Table card */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_160px] gap-0 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Select the days your restaurant is open for business.
              </span>
              <span className="hidden sm:block text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
                Opening Time
              </span>
              <span className="hidden sm:block text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
                Closing Time
              </span>
            </div>

            {/* Day rows */}
            {DAY_ORDER.map((dayKey, idx) => {
              const dayData = operating_days.find((d) => d.day === dayKey) ?? {
                day: dayKey,
                opening_time: "09:00",
                closing_time: "23:00",
                is_open: false,
              };
              const isOpen = dayData.is_open;
              const isLast = idx === DAY_ORDER.length - 1;

              return (
                <div
                  key={dayKey}
                  className={[
                    "grid grid-cols-1 sm:grid-cols-[1fr_160px_160px] items-start sm:items-center gap-2 sm:gap-0 px-4 py-3 sm:py-2.5 transition-colors",
                    !isLast ? "border-b border-gray-100" : "",
                    isOpen ? "bg-[#3B4EFF]" : "bg-white hover:bg-gray-50",
                  ].join(" ")}
                >
                  {/* Day toggle */}
                  <button
                    type="button"
                    onClick={() => toggleDay(dayKey)}
                    className="flex items-center gap-3 text-left w-full"
                  >
                    {/* Check circle */}
                    <span
                      className={[
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isOpen
                          ? "border-white bg-white"
                          : "border-gray-300 bg-transparent",
                      ].join(" ")}
                    >
                      {isOpen && (
                        <Check
                          className="h-3.5 w-3.5 text-[#3B4EFF]"
                          strokeWidth={2.5}
                        />
                      )}
                    </span>

                    <span
                      className={[
                        "text-sm font-medium",
                        isOpen ? "text-white" : "text-gray-700",
                      ].join(" ")}
                    >
                      {DAY_LABELS[dayKey]}
                    </span>
                  </button>

                  {/* Time selects — side by side on mobile (below day name), grid cells on sm+ */}
                  <div className="flex gap-2 sm:contents pl-9 sm:pl-0">
                    {/* Opening time */}
                    <div className="flex-1 sm:flex-none px-0 sm:px-2">
                      <TimeSelect
                        value={dayData.opening_time}
                        disabled={!isOpen}
                        onChange={(v) => setDayTime(dayKey, "opening_time", v)}
                      />
                    </div>

                    {/* Closing time */}
                    <div className="flex-1 sm:flex-none px-0 sm:px-2">
                      <TimeSelect
                        value={dayData.closing_time}
                        disabled={!isOpen}
                        onChange={(v) => setDayTime(dayKey, "closing_time", v)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Bottom bar ── */}
      <OnboardingBottomBar
        hint="Helps us send reminders only when you're open"
        onBack={handleBack}
        onContinue={handleContinue}
        disabled={!step2Valid}
      />
    </div>
  );
}
