"use client";

import React from "react";
import { ShoppingCart, Clock } from "lucide-react";
import { AppContainer, FigtreeText, InriaHeading } from "@/components/ui/dosteon-ui";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function POSSimulationPage() {
  return (
    <AppContainer className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">
      <div className="relative mb-10">
        <div className="h-32 w-32 bg-indigo-50 rounded-[40px] flex items-center justify-center border-2 border-indigo-100/50 shadow-sm relative z-10">
          <ShoppingCart className="h-12 w-12 text-[#3B59DA] stroke-[2.5px]" />
        </div>
        <div className="absolute -inset-4 bg-indigo-50/30 rounded-[48px] blur-2xl -z-0 animate-pulse" />
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
            <div className="px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#3B59DA]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3B59DA]">Implementation Pending</span>
            </div>
        </div>
        
        <InriaHeading className="text-[34px] md:text-[42px] font-bold text-[#1E293B] tracking-tight leading-tight">
          POS Simulation <br /> <span className="text-[#3B59DA]">Coming Soon</span>
        </InriaHeading>
        
        <FigtreeText className="text-[16px] md:text-[18px] text-slate-500 font-medium leading-relaxed px-4">
          The Point of Sale simulation module is currently under development. This feature will allow you to simulate customer orders and track automatic inventory deductions in real-time.
        </FigtreeText>
      </div>

      <div className="mt-12">
        <Button 
          variant="outline" 
          className="h-14 px-10 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
          asChild
        >
          <Link href="/dashboard">
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </AppContainer>
  );
}

