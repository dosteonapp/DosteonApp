"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChefHat, Truck, Menu, X, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Footer from "@/components/auth/Footer";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const router = useRouter();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open mailto with pre-filled details as the lead capture mechanism
    const subject = encodeURIComponent("Supplier Interest - Dosteon");
    const body = encodeURIComponent(
      `Name: ${leadName}\nEmail: ${leadEmail}\n\nMessage:\n${leadMessage || "I'm interested in joining Dosteon as a supplier."}`
    );
    window.open(`mailto:hello@dosteon.com?subject=${subject}&body=${body}`);
    setLeadSent(true);
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

            {/* Desktop Navigation — Restaurant only */}
            <div className="hidden md:flex gap-4">
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
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/30" />
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
                  onClick={() => router.push("/auth/restaurant/signup")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-all duration-200"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Supplier Card — Coming Soon */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 relative overflow-hidden">
              {/* Coming Soon badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Coming Soon</span>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-100">
                  <Truck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  I'm a Supplier
                </h3>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                  The supplier platform is coming soon. Leave your details and
                  we'll reach out when it's ready for you.
                </p>
                <Button
                  onClick={() => setShowLeadModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-all duration-200"
                >
                  Contact Us
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowLeadModal(false); setLeadSent(false); } }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            {leadSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border-2 border-green-100">
                  <Send className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Thanks for reaching out!</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We've received your details and will be in touch when the supplier platform launches.
                </p>
                <Button
                  onClick={() => { setShowLeadModal(false); setLeadSent(false); setLeadName(""); setLeadEmail(""); setLeadMessage(""); }}
                  className="bg-[#3851DD] hover:bg-[#2c3fa0] text-white w-full rounded-xl font-bold mt-2"
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Get Early Access</h3>
                    <p className="text-sm text-gray-500 mt-1">Leave your details and we'll notify you when the supplier platform is live.</p>
                  </div>
                  <button onClick={() => setShowLeadModal(false)} className="text-gray-300 hover:text-gray-600 transition-colors ml-4 mt-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                    <Input
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Jane Doe"
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-gray-700">Business Email</Label>
                    <Input
                      required
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-gray-700">What do you supply? <span className="text-gray-400 font-normal">(optional)</span></Label>
                    <Input
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                      placeholder="e.g. Fresh produce, dry goods, beverages..."
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm mt-2"
                  >
                    Send Interest
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
