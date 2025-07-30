import type React from "react";
import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppGuard } from "@/components/app-guard";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
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
        className={`${figTree.className} ${inter.variable} ${figTree.variable}`}
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
                <AppGuard>{children}</AppGuard>
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
