import Link from "next/link";
import { BookOpen, Target, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-4">ABOUT ANMLOFFICIAL</p>
          <h1 className="text-5xl font-bold text-text mb-6">Learning built around creativity,<br /> skills, and your future.</h1>
          <p className="text-muted max-w-2xl mx-auto text-lg mb-10">Anmolofficial is an online learning platform focused on structured, practical, and purpose-driven education in creative skill areas.</p>
          <Link href="/courses" className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-hover transition-all">Explore Courses</Link>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-text mb-6">Our Story</h2>
        <p className="text-muted text-lg leading-relaxed">Anmolofficial was founded with the belief that creative education should be accessible, structured, and focused on real-world application. We saw a gap between static tutorials and formal schooling, and built a platform that bridges it through project-based learning.</p>
      </section>

      {/* Values */}
      <section className="py-20 bg-soft-blue/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
            <div className="bg-surface p-8 rounded-3xl border border-border">
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-text mb-2">Structured Learning</h3>
                <p className="text-muted">Clear, logical progression designed to help you master complex creative concepts.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl border border-border">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-text mb-2">Practical Skills</h3>
                <p className="text-muted">Focused expertise meant for application, helping you build a professional creative portfolio.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl border border-border">
                <Zap className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-text mb-2">Purpose-Driven</h3>
                <p className="text-muted">We go beyond surface-level techniques, diving into why principles work.</p>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-text mb-6">Ready to start learning?</h2>
        <Link href="/courses" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-hover transition-all">Explore Courses</Link>
      </section>
    </main>
  );
}
