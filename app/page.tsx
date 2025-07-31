"use client";

import { useState } from "react";
import { ChevronRight, ChefHat, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/auth/Footer";

export default function Home() {
  const [selectedUserType, setSelectedUserType] = useState<
    "restaurant" | "supplier" | null
  >(null);

  const handleGetStarted = (userType: "restaurant" | "supplier") => {
    setSelectedUserType(userType);
    // Navigate to the onboarding flow with the selected user type
    window.location.href = `/onboarding/welcome?role=${userType}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <img
                    src="/images/logo-full.png"
                    alt="Dosteon Logo"
                    className="h-8 w-auto mr-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="px-6 py-2 border-blue-900 text-gray-700 hover:bg-gray-50"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative text-white pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/background.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b via-black/50 to-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
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
                <Link
                  href={"/auth/restaurant/signin"} // Adjust the link to your restaurant sign-in page
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 group mx-auto transition-all duration-200"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Supplier Card */}
            <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-100">
                  <Truck className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  I'm a Supplier
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                  Connect with restaurants, showcase your products, and grow
                  your business.
                </p>
                <Link
                  href={"/auth/supplier/signin"} // Adjust the link to your supplier sign-in page
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 group mx-auto transition-all duration-200"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
