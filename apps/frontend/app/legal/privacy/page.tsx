import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Dosteon",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 font-medium">
            ← Back
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: April 2, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">1. Who We Are</h2>
            <p>Dosteon ("we", "our", "us") operates the restaurant and supplier operations platform available at app.dosteon.com. This Privacy Policy explains how we collect, use, and protect your personal data in accordance with the General Data Protection Regulation (GDPR) and other applicable laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account data:</strong> name, email address, password (hashed)</li>
              <li><strong>Business data:</strong> restaurant/supplier name, address, phone number, operating hours</li>
              <li><strong>Usage data:</strong> inventory records, stock events, onboarding choices</li>
              <li><strong>Technical data:</strong> IP address, browser type, session tokens</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the Service</li>
              <li>To send transactional emails (verification, alerts, password reset)</li>
              <li>To improve and develop new features</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">4. Legal Basis for Processing</h2>
            <p>We process your personal data on the following legal bases: (a) performance of a contract — to provide the Service you signed up for; (b) legitimate interests — to improve the Service and prevent fraud; (c) legal obligation — where required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">5. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. You may request deletion at any time. We will delete or anonymize your data within 30 days of a valid request, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">6. Your Rights</h2>
            <p>Under the GDPR, you have the right to: access, correct, or delete your personal data; object to or restrict processing; request data portability. To exercise these rights, email <a href="mailto:privacy@dosteon.com" className="text-blue-600 hover:underline">privacy@dosteon.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">7. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with service providers necessary to operate the platform (Supabase for authentication/database, Resend for email delivery, Render/Vercel for hosting). All providers are contractually bound to protect your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">8. Security</h2>
            <p>We use industry-standard measures including HTTPS, hashed passwords, JWT authentication, and role-based access controls. No system is perfectly secure — please use a strong, unique password for your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">9. Cookies</h2>
            <p>We use authentication cookies necessary to keep you signed in. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">10. Contact</h2>
            <p>For privacy questions or data requests, contact us at <a href="mailto:privacy@dosteon.com" className="text-blue-600 hover:underline">privacy@dosteon.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
