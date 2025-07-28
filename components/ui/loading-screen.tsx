import { LoaderCircle } from "lucide-react";
import { Logo } from "../icons/Logo";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        {/* <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p> */}
        <Logo className="w-10 h-10" />
      </div>
    </div>
  );
}
