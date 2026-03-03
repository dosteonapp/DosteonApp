"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChefHat, Truck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/auth/Footer";

export default function Home() {
  const [selectedUserType, setSelectedUserType] = useState<"restaurant" | "supplier" | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleGetStarted = (userType: "restaurant" | "supplier") => {
    if (userType === "restaurant") {
      router.push("/auth/restaurant/signup");
    } else if (userType === "supplier") {
      router.push("/auth/supplier/signup");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-3 rounded-xl left-3 right-3 z-50 bg-white shadow-md border border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <Link href="/">
                <img
                  src="/images/logo-full.png"
                  alt="Dosteon Logo"
                  className="h-6 sm:h-8 w-auto"
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-4">
              <Button
                className="bg-[#00a13e] hover:bg-[#00a13e] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-none transition-all active:scale-95"
                asChild
              >
                <Link href="/auth/supplier/signin">Supplier Login</Link>
              </Button>

              <Button
                className="bg-[#3851DD] hover:bg-[#2c3fa0] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-none transition-all active:scale-95"
                asChild
              >
                <Link href="/auth/restaurant/signin">Restaurant Login</Link>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 rounded-b-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col p-4 gap-3">
              <Button
                className="bg-[#00a13e] hover:bg-[#00a13e] text-white w-full py-6 rounded-xl text-base font-bold shadow-none"
                onClick={() => setIsMenuOpen(false)}
                asChild
              >
                <Link href="/auth/supplier/signin">Supplier Login</Link>
              </Button>

              <Button
                className="bg-[#3851DD] hover:bg-[#2c3fa0] text-white w-full py-6 rounded-xl text-base font-bold shadow-none"
                onClick={() => setIsMenuOpen(false)}
                asChild
              >
                <Link href="/auth/restaurant/signin">Restaurant Login</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative text-white pt-24 sm:pt-32 flex-1">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/background.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              Welcome to Dosteon
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed">
              Where restaurants and suppliers cut waste, restock faster, and
              grow together.
            </p>
          </div>
        </div>
      </section>

      {/* Choice Section */}
      <section className="bg-gray-50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Choose which best describes you to get started!
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Restaurant Card */}
            <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-100">
                  <ChefHat className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  I'm a Restaurant
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                  Find suppliers, manage orders and inventory, and streamline
                  your kitchen operations.
                </p>
                <Button
                  onClick={() => handleGetStarted("restaurant")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-all duration-200"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Supplier Card */}
            <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-100">
                  <Truck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  I'm a Supplier
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                  Connect with restaurants, showcase your products, and grow
                  your business.
                </p>
                <Button
                  onClick={() => handleGetStarted("supplier")}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-all duration-200"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}