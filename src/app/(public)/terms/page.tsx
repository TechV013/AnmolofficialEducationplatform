import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Anmolofficial",
  description: "Terms and conditions for using the Anmolofficial platform.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Use — Anmolofficial",
    description: "Terms and conditions for using the Anmolofficial platform.",
    type: "website",
    url: "https://www.anmolofficial.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-text mb-8">Terms of Use</h1>
        <p className="text-muted mb-10">Effective date: September 20, 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">1. Acceptance of terms</h2>
          <p className="text-muted leading-relaxed">
            By accessing or using Anmolofficial, you agree to be bound by these Terms of Use. If you do not agree, you may not use the platform. We may update these terms from time to time; continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">2. User responsibilities</h2>
          <p className="text-muted leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must not use the platform for unlawful purposes or to distribute harmful content.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">3. Intellectual property</h2>
          <p className="text-muted leading-relaxed">
            All content on this platform — text, images, video, course material, branding — is owned by Anmolofficial or its licensors and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without written permission.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">4. Course content and payments</h2>
          <p className="text-muted leading-relaxed">
            Course content is provided for learning purposes. Enrollments and payments are governed by the applicable pricing and refund policies at the time of purchase. We reserve the right to update course content and pricing.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">5. Limitation of liability</h2>
          <p className="text-muted leading-relaxed">
            Anmolofficial is not liable for indirect, incidental, or consequential damages arising from your use of the platform. We strive to keep the platform available but do not guarantee uninterrupted access.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">6. Termination</h2>
          <p className="text-muted leading-relaxed">
            We may suspend or terminate your account if you violate these terms or engage in prohibited conduct. You may request account deletion at any time by contacting support.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">7. Governing law</h2>
          <p className="text-muted leading-relaxed">
            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ahmedabad, Gujarat.
          </p>
        </section>
      </div>
    </div>
  );
}