"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";

export default function CreateAccountPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const passwordRequirements = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequirementsMet) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.push("/business-details");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button type="button" onClick={() => router.back()} className="flex items-center gap-2 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-base">Back</span>
            </button>
            <h1 className="text-xl font-semibold">Supplier Onboarding</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-xl flex flex-col items-center">
          {/* Logo and Title */}
          <div className="text-center mb-8 w-full">
            <img src="/images/logo-full.png" alt="Dosteon Logo" className="h-10 w-auto mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-gray-500 mb-2">Tell us about yourself and your business to get started.</p>
          </div>

          {/* Form */}
          <form className="space-y-6 w-full" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => handleInputChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => handleInputChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Password must be at least <b>8 Characters</b> and must contain at least a <b>Capital Letter</b>, a <b>Number</b> and a <b>Special Character</b>.
              </p>
            </div>
            <button
              type="submit"
              disabled={!allRequirementsMet || submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-base"
            >
              {submitting ? "Registering..." : "Register as a Supplier"}
            </button>
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">Login Here</a>
            </div>
            {/* Divider */}
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            {/* Social Login Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => alert('Google sign-in')}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => alert('Apple sign-in')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.04 0-.08 0-.12-.01-.02-.04-.03-.09-.03-.14 0-1.13.93-2.06 2.07-2.06.04 0 .08 0 .12.01.02.04.03.09.03.13zm2.52 4.13c-1.34-.08-2.47.77-3.11.77-.65 0-1.65-.75-2.72-.73-1.4.02-2.7.82-3.42 2.09-1.46 2.54-.37 6.3 1.05 8.36.7 1.01 1.53 2.14 2.62 2.1 1.06-.04 1.46-.68 2.74-.68 1.28 0 1.64.68 2.73.66 1.13-.02 1.84-1.03 2.53-2.04.8-1.18 1.13-2.32 1.14-2.38-.02-.01-2.19-.84-2.21-3.33-.02-2.08 1.7-3.07 1.78-3.12-1-.15-1.97.6-2.5.6-.53 0-1.34-.59-2.21-.57zm-2.6-3.36c.38-.46.64-1.1.57-1.74-.55.02-1.22.37-1.62.83-.36.41-.67 1.07-.55 1.7.59.05 1.21-.34 1.6-.79z"/></svg>
                Apple
              </button>
            </div>
            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-4">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Need help?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">Contact support</a>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Dosteon
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 