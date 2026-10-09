import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Target } from "lucide-react";
import { team } from "@/data/team";

export default function AboutUsPage() {
  return (
    <div className="bg-background text-text">
      {/* Hero Section */}
      <section className="py-10 sm:py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">ABOUT US</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Meet the people behind Design Vidya.</h1>
          <p className="text-muted max-w-2xl mx-auto text-base sm:text-lg">We are a dedicated team passionate about empowering learners with practical creative and digital skills through structured, hands-on learning.</p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-10 sm:py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Our Experts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {team.map((member) => (
                    <div 
                      key={member.id} 
                      className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 200px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center mt-auto flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="font-bold text-sm text-[#111111] mb-1 min-h-[20px] flex items-center justify-center">{member.name}</h3>
                          <div className="w-6 h-0.5 bg-[#0069E0] mx-auto my-2 rounded-full"></div>
                          <p className="text-[#0069E0] text-[10px] font-bold uppercase tracking-wider mb-2 min-h-[28px] flex items-center justify-center">{member.role}</p>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight min-h-[48px] flex items-center justify-center">{member.description}</p>
                      </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-muted text-sm sm:text-base mb-4">
                Have questions or need guidance choosing the right path? Connect with any of our expert instructors.
              </p>
              <Link 
                href="https://forms.gle/demo-booking-placeholder" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg"
              >
                Book a Consultation
              </Link>
            </div>
        </div>
      </section>

      {/* Trust & Final CTA Section */}
      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12">How We Work Together</h2>
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
      <section className="py-10 sm:py-14 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-6">Learn with us.</h2>
        <Link href="/courses" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-hover transition-all">Explore Courses</Link>
      </section>
    </div>
  );
}
