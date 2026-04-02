import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Dosteon",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 font-medium">
            ← Back
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: April 2, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>By creating an account or using the Dosteon platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">2. Description of Service</h2>
            <p>Dosteon provides a restaurant and supplier operations platform including inventory management, daily stock counts, procurement tools, and related features. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">3. Account Registration</h2>
            <p>You must provide accurate and complete information when creating your account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorized use at support@dosteon.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">4. Acceptable Use</h2>
            <p>You agree not to use the Service to: (a) violate any applicable laws or regulations; (b) transmit harmful, fraudulent, or misleading content; (c) attempt to gain unauthorized access to any system; (d) interfere with the integrity or performance of the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">5. Data and Privacy</h2>
            <p>Your use of the Service is also governed by our <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">6. Intellectual Property</h2>
            <p>All content, features, and functionality of the Service are owned by Dosteon and are protected by applicable intellectual property laws. You may not copy, modify, or distribute any part of the Service without prior written consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Dosteon shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">8. Termination</h2>
            <p>We may terminate or suspend your account at any time for violations of these Terms. You may delete your account at any time from your account settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">9. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">10. Contact</h2>
            <p>Questions about these Terms? Email us at <a href="mailto:legal@dosteon.com" className="text-blue-600 hover:underline">legal@dosteon.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
