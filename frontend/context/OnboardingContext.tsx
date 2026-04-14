"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axiosInstance from "@/lib/axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DayKey = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export interface OperatingDay {
  day: DayKey;
  opening_time: string;  // "HH:MM"
  closing_time: string;  // "HH:MM"
  is_open: boolean;
}

export interface Dish {
  name: string;
  price: number;
  category: string;
}

export interface SelectedInventoryItem {
  canonical_product_id: string;
  name: string;
  category: string;
  base_unit: string;
  opening_quantity: number;
  unit: string;
}

export interface Step1State {
  name: string;
  phone: string;
  city: string;
  business_type: string;
  daily_stock_count: boolean | null;   // null = not yet chosen
  has_multiple_brands: boolean | null; // null = not yet chosen
  brands: string[];
}

export interface Step2State {
  operating_days: OperatingDay[];
}

export interface Step3State {
  dishes: Dish[];
}

export interface Step4State {
  selected_items: SelectedInventoryItem[];
  sub_screen: "select" | "set_quantities";
}

export interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4;
  step1: Step1State;
  step2: Step2State;
  step3: Step3State;
  step4: Step4State;
  isLoading: boolean;       // true while fetching progress on mount
  isSaving: boolean;        // true while a step API call is in flight
  isCompleted: boolean;     // true after POST /onboarding/complete succeeds
  completeSummary: OnboardingCompleteSummary | null;
}

// Summary returned by POST /onboarding/complete
export interface OnboardingCompleteSummary {
  onboarding_completed: boolean;
  organization_id: string;
  organization_name: string;
  phone: string | null;
  hours_display: string | null;
  operating_days_display: string | null;
  menu_dishes_count: number;
  inventory_items_count: number;
}

interface OnboardingContextValue {
  state: OnboardingState;
  // Navigation
  goToStep: (step: 1 | 2 | 3 | 4) => void;
  // Step 1 updaters
  setStep1Field: <K extends keyof Step1State>(key: K, value: Step1State[K]) => void;
  setBrand: (index: number, value: string) => void;
  addBrand: () => void;
  // Step 2 updaters
  toggleDay: (day: DayKey) => void;
  setDayTime: (day: DayKey, field: "opening_time" | "closing_time", value: string) => void;
  // Step 3 updaters
  setDish: (index: number, field: keyof Dish, value: string | number) => void;
  addDish: () => void;
  removeDish: (index: number) => void;
  // Step 4 updaters
  toggleInventoryItem: (item: Omit<SelectedInventoryItem, "opening_quantity">) => void;
  setInventoryQuantity: (canonical_product_id: string, qty: number) => void;
  setInventoryUnit: (canonical_product_id: string, unit: string) => void;
  removeInventoryItem: (canonical_product_id: string) => void;
  setStep4SubScreen: (screen: "select" | "set_quantities") => void;
  // API submission helpers (called by step Continue buttons)
  submitStep1: (phoneOverride?: string) => Promise<void>;
  submitStep2: () => Promise<void>;
  submitStep3: () => Promise<void>;
  submitStep4AndComplete: () => Promise<OnboardingCompleteSummary>;
  // Validation helpers
  step1Valid: boolean;
  step2Valid: boolean;
  step3Valid: boolean;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const ALL_DAYS: DayKey[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DEFAULT_OPEN_DAYS: DayKey[] = ["MON", "TUE", "WED", "THU", "FRI"];

function buildDefaultDays(): OperatingDay[] {
  return ALL_DAYS.map((day) => ({
    day,
    opening_time: "09:00",
    closing_time: "23:00",
    is_open: DEFAULT_OPEN_DAYS.includes(day),
  }));
}

function buildDefaultStep1(): Step1State {
  return {
    name: "",
    phone: "",
    city: "",
    business_type: "Restaurant",
    daily_stock_count: null,
    has_multiple_brands: null,
    brands: ["", ""],
  };
}

function buildDefaultState(): OnboardingState {
  return {
    currentStep: 1,
    step1: buildDefaultStep1(),
    step2: { operating_days: buildDefaultDays() },
    step3: { dishes: [{ name: "", price: 0, category: "Signature" }, { name: "", price: 0, category: "Signature" }, { name: "", price: 0, category: "Signature" }] },
    step4: { selected_items: [], sub_screen: "select" },
    isLoading: true,
    isSaving: false,
    isCompleted: false,
    completeSummary: null,
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(buildDefaultState);
  const hasFetched = useRef(false);

  // -------------------------------------------------------------------------
  // On mount: fetch existing progress and pre-fill
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const { data } = await axiosInstance.get("/onboarding/progress");

        setState((prev) => {
          const next = { ...prev, isLoading: false };

          // --- Step 1 ---
          const s1 = data.step1 ?? {};
          if (s1.name || s1.phone || s1.city) {
            next.step1 = {
              name: s1.name ?? "",
              phone: s1.phone ?? "",
              city: s1.city ?? "",
              business_type: s1.business_type ?? "Restaurant",
              daily_stock_count: s1.daily_stock_count ?? null,
              has_multiple_brands: s1.has_multiple_brands ?? null,
              brands: (s1.brands ?? []).length >= 2 ? s1.brands : ["", ""],
            };
          }

          // --- Step 2 ---
          const savedDays: OperatingDay[] = data.step2?.operating_days ?? [];
          if (savedDays.length === 7) {
            next.step2 = { operating_days: savedDays as OperatingDay[] };
          }

          // --- Step 3 ---
          const savedDishes: Dish[] = data.step3?.dishes ?? [];
          if (savedDishes.length > 0) {
            // Ensure at least 3 rows are always present
            const padded = [...savedDishes];
            while (padded.length < 3) {
              padded.push({ name: "", price: 0, category: "Signature" });
            }
            next.step3 = { dishes: padded };
          }

          // --- Resume step ---
          if (!s1.name) {
            next.currentStep = 1;
          } else if (savedDays.length === 0) {
            next.currentStep = 2;
          } else if (savedDishes.length < 3) {
            next.currentStep = 3;
          } else {
            next.currentStep = 4;
          }

          return next;
        });
      } catch {
        // Network or auth error — start fresh, don't block the UI
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  // -------------------------------------------------------------------------
  // Generic state setter
  // -------------------------------------------------------------------------
  const update = useCallback((updater: (prev: OnboardingState) => OnboardingState) => {
    setState(updater);
  }, []);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const goToStep = useCallback((step: 1 | 2 | 3 | 4) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  // -------------------------------------------------------------------------
  // Step 1 updaters
  // -------------------------------------------------------------------------
  const setStep1Field = useCallback(<K extends keyof Step1State>(key: K, value: Step1State[K]) => {
    update((prev) => ({ ...prev, step1: { ...prev.step1, [key]: value } }));
  }, [update]);

  const setBrand = useCallback((index: number, value: string) => {
    update((prev) => {
      const brands = [...prev.step1.brands];
      brands[index] = value;
      return { ...prev, step1: { ...prev.step1, brands } };
    });
  }, [update]);

  const addBrand = useCallback(() => {
    update((prev) => ({
      ...prev,
      step1: { ...prev.step1, brands: [...prev.step1.brands, ""] },
    }));
  }, [update]);

  // -------------------------------------------------------------------------
  // Step 2 updaters
  // -------------------------------------------------------------------------
  const toggleDay = useCallback((day: DayKey) => {
    update((prev) => ({
      ...prev,
      step2: {
        operating_days: prev.step2.operating_days.map((d) =>
          d.day === day ? { ...d, is_open: !d.is_open } : d
        ),
      },
    }));
  }, [update]);

  const setDayTime = useCallback((day: DayKey, field: "opening_time" | "closing_time", value: string) => {
    update((prev) => ({
      ...prev,
      step2: {
        operating_days: prev.step2.operating_days.map((d) =>
          d.day === day ? { ...d, [field]: value } : d
        ),
      },
    }));
  }, [update]);

  // -------------------------------------------------------------------------
  // Step 3 updaters
  // -------------------------------------------------------------------------
  const setDish = useCallback((index: number, field: keyof Dish, value: string | number) => {
    update((prev) => {
      const dishes = [...prev.step3.dishes];
      dishes[index] = { ...dishes[index], [field]: value };
      return { ...prev, step3: { dishes } };
    });
  }, [update]);

  const addDish = useCallback(() => {
    update((prev) => ({
      ...prev,
      step3: { dishes: [...prev.step3.dishes, { name: "", price: 0, category: "Signature" }] },
    }));
  }, [update]);

  const removeDish = useCallback((index: number) => {
    update((prev) => {
      const dishes = prev.step3.dishes.filter((_, i) => i !== index);
      // Keep at least 3 rows
      while (dishes.length < 3) dishes.push({ name: "", price: 0, category: "Signature" });
      return { ...prev, step3: { dishes } };
    });
  }, [update]);

  // -------------------------------------------------------------------------
  // Step 4 updaters
  // -------------------------------------------------------------------------
  const toggleInventoryItem = useCallback((item: Omit<SelectedInventoryItem, "opening_quantity">) => {
    update((prev) => {
      const exists = prev.step4.selected_items.some(
        (i) => i.canonical_product_id === item.canonical_product_id
      );
      const selected_items = exists
        ? prev.step4.selected_items.filter((i) => i.canonical_product_id !== item.canonical_product_id)
        : [...prev.step4.selected_items, { ...item, opening_quantity: 0 }];
      return { ...prev, step4: { ...prev.step4, selected_items } };
    });
  }, [update]);

  const setInventoryQuantity = useCallback((canonical_product_id: string, qty: number) => {
    update((prev) => ({
      ...prev,
      step4: {
        ...prev.step4,
        selected_items: prev.step4.selected_items.map((i) =>
          i.canonical_product_id === canonical_product_id ? { ...i, opening_quantity: qty } : i
        ),
      },
    }));
  }, [update]);

  const setInventoryUnit = useCallback((canonical_product_id: string, unit: string) => {
    update((prev) => ({
      ...prev,
      step4: {
        ...prev.step4,
        selected_items: prev.step4.selected_items.map((i) =>
          i.canonical_product_id === canonical_product_id ? { ...i, unit } : i
        ),
      },
    }));
  }, [update]);

  const removeInventoryItem = useCallback((canonical_product_id: string) => {
    update((prev) => ({
      ...prev,
      step4: {
        ...prev.step4,
        selected_items: prev.step4.selected_items.filter(
          (i) => i.canonical_product_id !== canonical_product_id
        ),
      },
    }));
  }, [update]);

  const setStep4SubScreen = useCallback((screen: "select" | "set_quantities") => {
    update((prev) => ({ ...prev, step4: { ...prev.step4, sub_screen: screen } }));
  }, [update]);

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  const step1Valid = (() => {
    const s = state.step1;
    if (!s.name.trim()) return false;
    if (s.daily_stock_count === null) return false;
    if (s.has_multiple_brands === null) return false;
    if (s.has_multiple_brands === true) {
      const filled = s.brands.filter((b) => b.trim()).length;
      if (filled < 2) return false;
    }
    return true;
  })();

  const step2Valid = state.step2.operating_days.some((d) => d.is_open);

  const step3Valid = state.step3.dishes.filter((d) => d.name.trim()).length >= 3;

  // -------------------------------------------------------------------------
  // API submission helpers
  // -------------------------------------------------------------------------
  const submitStep1 = useCallback(async (phoneOverride?: string) => {
    const { step1 } = state;
    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      await axiosInstance.patch("/onboarding/business", {
        name: step1.name,
        phone: (phoneOverride !== undefined ? phoneOverride : step1.phone) || null,
        city: step1.city || null,
        business_type: step1.business_type,
        daily_stock_count: step1.daily_stock_count ?? false,
        has_multiple_brands: step1.has_multiple_brands ?? false,
        brands: step1.brands.filter((b) => b.trim()),
      });
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [state]);

  const submitStep2 = useCallback(async () => {
    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      await axiosInstance.patch("/onboarding/hours", {
        operating_days: state.step2.operating_days,
      });
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [state]);

  const submitStep3 = useCallback(async () => {
    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      await axiosInstance.post("/onboarding/menu", {
        dishes: state.step3.dishes.filter((d) => d.name.trim()),
      });
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [state]);

  const submitStep4AndComplete = useCallback(async (): Promise<OnboardingCompleteSummary> => {
    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      // Save inventory (empty array is valid)
      await axiosInstance.post("/onboarding/inventory", {
        items: state.step4.selected_items.map((i) => ({
          canonical_product_id: i.canonical_product_id,
          opening_quantity: i.opening_quantity,
          unit: i.unit,
        })),
      });
      // Complete onboarding — returns summary for the completion screen
      const { data } = await axiosInstance.post("/onboarding/complete");
      const summary = data as OnboardingCompleteSummary;
      setState((prev) => ({
        ...prev,
        isSaving: false,
        isCompleted: true,
        completeSummary: summary,
      }));
      return summary;
    } catch (err) {
      setState((prev) => ({ ...prev, isSaving: false }));
      throw err;
    }
  }, [state]);

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------
  const value: OnboardingContextValue = {
    state,
    goToStep,
    setStep1Field,
    setBrand,
    addBrand,
    toggleDay,
    setDayTime,
    setDish,
    addDish,
    removeDish,
    toggleInventoryItem,
    setInventoryQuantity,
    setInventoryUnit,
    removeInventoryItem,
    setStep4SubScreen,
    submitStep1,
    submitStep2,
    submitStep3,
    submitStep4AndComplete,
    step1Valid,
    step2Valid,
    step3Valid,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
