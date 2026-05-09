"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InriaHeading, FigtreeText, PrimarySurfaceCard, AppContainer } from "@/components/ui/dosteon-ui";
import { RotateCcw, Home, AlertOctagon } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <AppContainer className="flex flex-col items-center justify-center min-h-[80vh]">
        <PrimarySurfaceCard className="max-w-2xl w-full p-12 md:p-20 text-center space-y-10 shadow-2xl border-indigo-50">
            <div className="flex flex-col items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertOctagon className="h-12 w-12 text-red-500" />
                </div>
                <div className="space-y-4">
                    <InriaHeading className="text-[32px] md:text-[42px] font-bold text-slate-800 leading-tight">
                        Something went wrong!
                    </InriaHeading>
                    <FigtreeText className="text-slate-400 font-medium text-[16px] max-w-md mx-auto">
                        Don't worry, it's not you. We've encountered an unexpected issue on our side.
                    </FigtreeText>
                </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                    onClick={() => reset()}
                    className="h-14 px-8 rounded-xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold gap-3 transition-all min-w-[200px]"
                >
                    <RotateCcw className="h-5 w-5" /> Try Again
                </Button>
                <Button 
                    variant="outline"
                    className="h-14 px-8 rounded-xl border-slate-200 text-slate-600 font-bold gap-3 hover:bg-slate-50 min-w-[200px]"
                    asChild
                >
                    <Link href="/dashboard">
                        <Home className="h-5 w-5" /> Back to Dashboard
                    </Link>
                </Button>
            </div>

            <div className="pt-4">
                <FigtreeText className="text-[12px] text-slate-300 font-mono italic">
                    ID: {error.digest || "unknown_error"}
                </FigtreeText>
            </div>
        </PrimarySurfaceCard>
    </AppContainer>
  );
}
