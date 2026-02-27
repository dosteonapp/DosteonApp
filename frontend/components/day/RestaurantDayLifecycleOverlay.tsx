"use client";

import React, { useEffect } from "react";
import { useRestaurantDayLifecycle } from "./RestaurantDayLifecycleProvider";
import { DayState, DayStep } from "@/lib/dayLifecycle/types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Sun, 
  Moon, 
  ClipboardList, 
  AlertCircle,
  PlayCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function RestaurantDayLifecycleOverlay() {
  const { 
    status, 
    startOpening, 
    completeOpeningStep, 
    finishOpening,
    startClosing,
    completeClosingStep,
    finishClosing,
    startNextDay
  } = useRestaurantDayLifecycle();

  // Prevent scroll ONLY when blocking overlay (checklists) is active
  useEffect(() => {
    const isBlocking = status?.state === DayState.OPENING_IN_PROGRESS || status?.state === DayState.CLOSING_IN_PROGRESS;
    if (isBlocking) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [status?.state]);

  if (!status) return null;

  // Only show full-screen overlay for the actual checklist flows
  const showOverlay = 
    status.state === DayState.PRE_OPEN ||
    status.state === DayState.OPENING_IN_PROGRESS || 
    status.state === DayState.CLOSING_IN_PROGRESS;
  
  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-md overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={status.state}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-[920px] max-h-[88vh] bg-white rounded-[48px] shadow-[0_32px_120px_rgba(15,23,42,0.15)] flex flex-col overflow-hidden"
        >
          {status.state === DayState.PRE_OPEN && (
            <PreOpenCard onStart={startOpening} />
          )}
          {status.state === DayState.OPENING_IN_PROGRESS && (
            <ChecklistCard 
              type="opening"
              title="Opening Checklist"
              description="Confirm These Steps To Start Taking Orders."
              steps={status.openingSteps}
              onCompleteStep={completeOpeningStep}
              onFinish={finishOpening}
              icon={Sun}
              iconContainerClass="bg-[#FFF3D6] text-amber-500"
            />
          )}
          {status.state === DayState.CLOSING_IN_PROGRESS && (
            <ChecklistCard 
              type="closing"
              title="Closing Checklist"
              description="Complete reconciliation and review before closing."
              steps={status.closingSteps}
              onCompleteStep={completeClosingStep}
              onFinish={finishClosing}
              icon={Moon}
              iconContainerClass="bg-[#E0E7FF] text-indigo-500"
            />
          )}
          {status.state === DayState.CLOSED && (
            <ClosedCard onStartNext={startNextDay} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PreOpenCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="p-16 flex flex-col items-center text-center space-y-10 relative overflow-hidden h-full justify-center">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
        
        <div className="h-28 w-28 rounded-[40px] bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
            <Sun className="h-14 w-14 stroke-[2.5px]" />
        </div>
        
        <div className="space-y-4">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Morning Shift Prep</h2>
            <p className="text-slate-500 font-bold text-xl max-w-md mx-auto leading-relaxed">
                The restaurant is currently pre-open. Ready to start your sequence and open the doors?
            </p>
        </div>

        <Button 
            onClick={onStart}
            size="lg" 
            className="h-20 px-16 rounded-[32px] bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-2xl gap-4 shadow-2xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95"
        >
            Start Current Day <PlayCircle className="h-8 w-8" />
        </Button>
    </div>
  );
}

function ClosedCard({ onStartNext }: { onStartNext: () => void }) {
    return (
      <div className="p-16 flex flex-col items-center text-center space-y-10 relative overflow-hidden h-full justify-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400" />
          
          <div className="h-28 w-28 rounded-[40px] bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner">
              <Lock className="h-14 w-14 stroke-[2.5px]" />
          </div>
          
          <div className="space-y-4">
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">Day is Finished</h2>
              <p className="text-slate-500 font-bold text-xl max-w-md mx-auto leading-relaxed">
                  All operations for today are successfully reconciled. We'll see you tomorrow!
              </p>
          </div>
  
          <Button 
              onClick={onStartNext}
              size="lg" 
              className="h-20 px-16 rounded-[32px] bg-slate-900 hover:bg-black text-white font-black text-2xl gap-4 shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95"
          >
              Prepare for Next Day <ArrowRight className="h-8 w-8" />
          </Button>
      </div>
    );
}

interface ChecklistProps {
  type: "opening" | "closing";
  title: string;
  description: string;
  steps: DayStep[];
  onCompleteStep: (id: string) => void;
  onFinish: () => void;
  icon: any;
  iconContainerClass: string;
}

function ChecklistCard({ title, description, steps, onCompleteStep, onFinish, icon: Icon, iconContainerClass }: ChecklistProps) {
  const currentStep = steps.find(s => !s.done);
  const allDone = steps.every(s => s.done);

  return (
    <>
      {/* Fixed Header */}
      <div className="px-10 py-8 shrink-0 flex items-center gap-6 border-b border-slate-100">
          <div className={cn("h-[52px] w-[52px] rounded-2xl flex items-center justify-center shadow-inner", iconContainerClass)}>
              <Icon className="h-6 w-6 stroke-[3px]" />
          </div>
          <div className="flex flex-col">
              <h2 className="text-[32px] font-[800] text-slate-900 tracking-tight leading-none">{title}</h2>
              <p className="text-[#64748B] font-bold text-[15px] mt-2 tracking-tight uppercase">
                {description}
              </p>
          </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 custom-scrollbar bg-[#FAFBFF]/30">
          {steps.map((step, index) => {
              const isNext = currentStep?.id === step.id;
              const isLocked = !step.done && !isNext;

              return (
                  <div 
                      key={step.id} 
                      className={cn(
                          "p-8 rounded-[32px] border-2 transition-all flex items-center gap-8 relative",
                          step.done ? "bg-white/50 border-slate-100 opacity-60" : 
                          isNext ? "bg-white border-[#4F46E5] shadow-xl shadow-indigo-100/50 scale-[1.01]" : 
                          "bg-slate-50 border-transparent opacity-40 grayscale pointer-events-none"
                      )}
                  >
                      {/* Step Number */}
                      <div className={cn(
                          "h-[56px] w-[56px] rounded-[18px] flex items-center justify-center text-xl font-black transition-all shrink-0",
                          step.done ? "bg-emerald-500 text-white" :
                          isNext ? "bg-[#4F46E5] text-white shadow-lg shadow-indigo-200" :
                          "bg-slate-200 text-slate-400"
                      )}>
                          {step.done ? <CheckCircle className="h-7 w-7" /> : index + 1}
                      </div>

                      {/* Title & Link */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className={cn(
                              "text-[22px] font-bold tracking-tight",
                              step.done ? "text-slate-400 line-through" : 
                              isNext ? "text-[#1E293B]" : "text-slate-300"
                          )}>
                              {step.title}
                          </h4>
                          {step.targetPath && (
                              <Link 
                                  href={step.targetPath}
                                  className={cn(
                                    "text-[11px] font-black flex items-center gap-1.5 transition-colors uppercase tracking-[0.15em] mt-2",
                                    isNext ? "text-[#4F46E5]/60 hover:text-[#4F46E5]" : "text-slate-300 pointer-events-none"
                                  )}
                              >
                                  REQUIRED SCREEN <ExternalLink className="h-3 w-3 stroke-[2.5px]" />
                              </Link>
                          )}
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 flex items-center">
                          {isNext && (
                            <Button 
                                onClick={() => onCompleteStep(step.id)}
                                className="h-[52px] px-8 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-sm shadow-xl shadow-indigo-100 transition-all hover:scale-[1.05] active:scale-95"
                            >
                                Mark Done
                            </Button>
                          )}
                          {step.done && (
                            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                              <CheckCircle2 className="h-6 w-6" />
                            </div>
                          )}
                      </div>
                  </div>
              );
          })}
      </div>

      {/* Fixed Footer */}
      <div className="px-10 py-8 border-t border-slate-100 bg-white flex shrink-0">
          <Button 
              onClick={onFinish}
              disabled={!allDone}
              size="lg"
              className={cn(
                  "w-full h-16 rounded-[22px] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl",
                  allDone 
                    ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-200" 
                    : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed shadow-none border-none"
              )}
          >
              {allDone ? (title.includes("Opening") ? "Finish Opening" : "Close Day") : "Complete All Steps First"}
              <CheckCircle2 className={cn("h-6 w-6 stroke-[3px]", allDone ? "text-white" : "text-[#94A3B8]")} />
          </Button>
      </div>
    </>
  );
}
