import type React from "react";
import type { Metadata } from "next";
import { Figtree, Inria_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/context/AuthContext";
// import { AppGuard } from "@/components/app-guard";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/sonner";
import { MockWarningBanner } from "@/components/mock-warning-banner";

const inria = Inria_Serif({ 
  subsets: ["latin"], 
  weight: ["300", "400", "700"],
  variable: "--font-inria" 
});
const figTree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Dosteon - Restaurant & Supplier Platform",
  description:
    "Real-time procurement & inventory platform for restaurants and suppliers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${figTree.className} ${inria.variable} ${figTree.variable}`}
        suppressHydrationWarning
      >
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider>
              {/* <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}> */}
              <AuthProvider>
                <MockWarningBanner />
                {children}
                <Toaster />
              </AuthProvider>
              {/* </GoogleOAuthProvider> */}
            </UserProvider>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
