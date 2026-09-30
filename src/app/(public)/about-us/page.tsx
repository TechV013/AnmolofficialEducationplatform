import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Target } from "lucide-react";

export default function AboutUsPage() {
  const team = [
    { id: "1", name: "Dr. Rajesh Sharma", role: "Animation Lead", description: "Specializes in character animation, rigging, and dynamic physics workflows.", image: "/images/instructor/instructor1.png" },
    { id: "2", name: "Dr. Priya Mehta", role: "3D Modeling Expert", description: "Expert in organic sculpture, hard-surface detailing, and asset topology.", image: "/images/instructor/instructor2.png" },
    { id: "3", name: "Prof. Arjun Nair", role: "VFX Specialist", description: "Brings years of visual effects, particles, and compositing experience.", image: "/images/instructor/instructor3.png" },
    { id: "4", name: "Shubham Kumar", role: "Video Editing Mentor", description: "Professional editor focused on commercial workflows and premiere design.", image: "/images/instructor/instructor4.png" },
    { id: "5", name: "Neha Mishra", role: "Character Rigging Pro", description: "Builds production-ready character skeletons and custom IK/FK controls.", image: "/images/instructor/instructor5.png" },
    { id: "6", name: "Kamal Kashyap", role: "Post-Production Lead", description: "Specializes in color science, Davinci grading, and mastering workflows.", image: "/images/instructor/instructor6.png" },
    { id: "7", name: "Ananya Sen", role: "UI/UX Specialist", description: "Teaches responsive digital product design, wireframing, and Figma prototyping.", image: "/images/instructor/instructor1.png" },
    { id: "8", name: "Aarav Kapoor", role: "Game Design Mentor", description: "Expert in Unreal Engine environment building, blueprint systems, and gameplay.", image: "/images/instructor/instructor2.png" },
    { id: "9", name: "Vikram Rathore", role: "Motion Graphics Expert", description: "Focuses on vector animation, kinetic typography, and After Effects workflows.", image: "/images/instructor/instructor3.png" },
    { id: "10", name: "Meera Joshi", role: "Texturing Specialist", description: "Creates procedural materials, substance painting, and PBR lighting setups.", image: "/images/instructor/instructor4.png" }
  ];

  return (
    <div className="bg-background text-text">
      {/* Hero Section */}
      <section className="py-10 sm:py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">ABOUT US</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Meet the people behind Anmolofficial.</h1>
          <p className="text-muted max-w-2xl mx-auto text-base sm:text-lg">We are a dedicated team passionate about empowering learners with practical creative and digital skills through structured, hands-on learning.</p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-10 sm:py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/4 shrink-0">
                <Image src="/images/founder.png" alt="Anmol - Founder" width={400} height={400} className="rounded-3xl shadow-lg" />
            </div>
            <div className="w-full md:w-3/4">
                <h2 className="text-3xl font-bold mb-3">Anmol</h2>
                <p className="text-lg font-semibold text-primary mb-4">Founder</p>
                <p className="text-muted leading-relaxed">Dedicated to building a platform that makes creative education accessible, structured, and focused on real-world application. Learning should not just be passive; it should be practical and skills-oriented.</p>
            </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-10 sm:py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Our Team</h2>
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
        </div>
      </section>

      {/* Trust Section */}
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
