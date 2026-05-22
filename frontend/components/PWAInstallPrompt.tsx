"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X, Smartphone } from "lucide-react";

// Standard type definition for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // 1. Check if the user has dismissed this banner recently (within the last 7 days)
    const lastDismissed = localStorage.getItem("dosteon-pwa-dismissed");
    if (lastDismissed) {
      const parsedTime = parseInt(lastDismissed, 10);
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsedTime < sevenDaysInMs) {
        return; // Don't show if dismissed within 7 days
      }
    }

    // 2. Check if the app is already running as standalone (installed)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    
    if (isStandalone) return;

    // 3. Listen for browser's PWA install qualification event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser's default bar from showing immediately
      e.preventDefault();
      
      // Store the event so we can trigger it later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Slide in the prompt after a slight delay for better UX
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser's native install prompt
    await deferredPrompt.prompt();

    // Wait for the user to make a choice
    const choiceResult = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to installation: ${choiceResult.outcome}`);

    // We no longer need the prompt, reset state
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    // Save current timestamp to defer prompting for 7 days
    localStorage.setItem("dosteon-pwa-dismissed", Date.now().toString());
    setIsVisible(false);
  };

  if (!isMounted || !isVisible || !deferredPrompt) return null;

  const bannerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 999999,
    width: "calc(100% - 2rem)",
    maxWidth: "440px",
  };

  return createPortal(
    <div style={bannerStyle} className="animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-md flex gap-4 items-start relative overflow-hidden">
        {/* Subtle decorative color bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#3851DD]" />

        {/* Icon wrapper */}
        <div className="bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded-xl text-[#3851DD] shrink-0 mt-0.5">
          <Smartphone className="w-6 h-6" />
        </div>

        {/* Text and Actions */}
        <div className="flex-1">
          <h3 className="font-bold text-slate-950 dark:text-slate-50 text-base leading-tight">
            Install Dosteon App
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4 leading-normal">
            Install Dosteon on your device home screen for offline access, instant load times, and a full-screen app experience.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center justify-center gap-1.5 bg-[#3851DD] hover:bg-[#273bb6] text-white text-sm font-semibold px-4 py-2 rounded-xl transition duration-150 shadow-sm shrink-0"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium px-3 py-2 rounded-xl transition duration-150"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Small dismiss button */}
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 absolute top-3 right-3"
          aria-label="Close installation prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
