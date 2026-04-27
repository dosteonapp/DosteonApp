"use client";
import React from "react";
import { useOnboarding } from "@/context/OnboardingContext";
import Step4aSelect from "./Step4aSelect";
import Step4bQuantities from "./Step4bQuantities";

/**
 * Step4Inventory — parent that switches between the two sub-screens:
 *   "select"        → Step4aSelect  (item browsing / selection grid)
 *   "set_quantities" → Step4bQuantities (opening stock table)
 *
 * If the user clicks Continue on 4a with 0 items selected, we still show 4b
 * (with an empty list and the "Complete Setup" button immediately visible).
 * The spec says: "If no items were selected in 4a, this screen is skipped
 * automatically and Complete Setup is called directly" — we handle that
 * inside Step4bQuantities: it renders the empty-state message and lets the
 * user click Complete Setup right away.
 */
export default function Step4Inventory() {
  const { state } = useOnboarding();
  const { sub_screen } = state.step4;

  if (sub_screen === "select") {
    return <Step4aSelect />;
  }

  return <Step4bQuantities />;
}
