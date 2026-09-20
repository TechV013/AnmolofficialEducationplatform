import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Anmolofficial",
  description: "How we collect, use, and protect your personal data at Anmolofficial.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Anmolofficial",
    description: "How we collect, use, and protect your personal data at Anmolofficial.",
    type: "website",
    url: "https://www.anmolofficial.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-text mb-8">Privacy Policy</h1>
        <p className="text-muted mb-10">Effective date: September 20, 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">1. Information we collect</h2>
          <p className="text-muted leading-relaxed">
            We collect information you provide directly to us, such as your name, email address, payment details, and course activity. We also collect technical data like your IP address, browser type, device identifiers, and pages visited.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">2. How we use your information</h2>
          <p className="text-muted leading-relaxed">
            We use your information to operate and improve our platform, process enrollments and payments, send service-related updates, personalize your learning experience, and comply with legal obligations.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">3. Cookies and tracking</h2>
          <p className="text-muted leading-relaxed">
            We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the platform is used. You can control cookies through your browser settings.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">4. Sharing of information</h2>
          <p className="text-muted leading-relaxed">
            We do not sell your personal information. We share data only with service providers who help us operate the platform (hosting, payment processing, analytics) and when required by law.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">5. Your rights</h2>
          <p className="text-muted leading-relaxed">
            You may access, update, or delete your account information at any time. To request data export or deletion, contact us at privacy@anmolofficial.com.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">6. Contact us</h2>
          <p className="text-muted leading-relaxed">
            For questions about this Privacy Policy or our data practices, reach us at{" "}
            <a href="mailto:privacy@anmolofficial.com" className="text-primary hover:underline">privacy@anmolofficial.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}