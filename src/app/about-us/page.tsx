import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Target } from "lucide-react";

export default function AboutUsPage() {
  const team = [
    { name: "Anmol", role: "Founder", image: "/images/founder.png" },
    { name: "Instructor 1", role: "Design Lead", image: "/images/instructor/instructor1.png" },
    { name: "Instructor 2", role: "Animation Expert", image: "/images/instructor/instructor2.png" },
  ];

  return (
    <main className="min-h-screen bg-background text-text">
      {/* Hero Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-4">ABOUT US</p>
          <h1 className="text-5xl font-bold mb-6">Meet the people behind Anmolofficial.</h1>
          <p className="text-muted max-w-2xl mx-auto text-lg">We are a dedicated team passionate about empowering learners with practical creative and digital skills through structured, hands-on learning.</p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3">
                <Image src="/images/founder.png" alt="Anmol - Founder" width={400} height={400} className="rounded-3xl shadow-lg" />
            </div>
            <div className="w-full md:w-2/3">
                <h2 className="text-3xl font-bold mb-4">Anmol</h2>
                <p className="text-lg font-semibold text-primary mb-6">Founder</p>
                <p className="text-muted leading-relaxed">Dedicated to building a platform that makes creative education accessible, structured, and focused on real-world application. Learning should not just be passive; it should be practical and skills-oriented.</p>
            </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {team.map((member) => (
                    <div key={member.name} className="bg-background p-6 rounded-3xl border border-border text-center">
                        <Image src={member.image} alt={member.name} width={200} height={200} className="rounded-full mx-auto mb-6 w-32 h-32 object-cover" />
                        <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                        <p className="text-primary font-semibold">{member.role}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">How We Work Together</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-bold mb-2">Collaboration</h3>
                <p className="text-muted text-sm">Our founder, instructors, and content creators work together to ensure curriculum quality.</p>
            </div>
            <div className="p-6">
                <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-bold mb-2">Curriculum Driven</h3>
                <p className="text-muted text-sm">Content is meticulously designed to bridge the gap between passion and professional skill.</p>
            </div>
            <div className="p-6">
                <Target className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-bold mb-2">Learner Focused</h3>
                <p className="text-muted text-sm">Every resource, quiz, and assignment is created to facilitate your growth.</p>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-text mb-6">Learn with us.</h2>
        <Link href="/courses" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-hover transition-all">Explore Courses</Link>
      </section>
    </main>
  );
}
