"use client";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "917073345025";

export default function GuidanceSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Course Selection");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = encodeURIComponent(
      `Hi Anmol! I'd like to book a session.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nTopic: ${topic}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="bg-dark rounded-[2rem] p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8 text-white">
          <div className="lg:w-1/2">
            <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2">Get Expert Guidance</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">A Conversation with the Founder</h2>
            <p className="opacity-90 leading-relaxed mb-8">
              Connect with me and catch the energy! Get personalized career guidance, course recommendations and skill-based direction. My mentorship helps creatives gain clarity, confidence and industry-ready skills. Fill out the Form. If shortlisted, I&apos;ll get in touch with you. One conversation can change your direction.
            </p>
            <div>
              <div className="text-4xl font-bold">2.3K+</div>
              <p className="text-sm opacity-80">Students mentored and counting</p>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <form onSubmit={handleSubmit} className="bg-white text-text p-8 rounded-2xl shadow-xl space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Select a topic"
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
              >
                <option>Course Selection</option>
                <option>Career Guidance</option>
                <option>Project Feedback</option>
                <option>Other</option>
              </select>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Book Session via WhatsApp
              </button>
              <p className="text-xs text-muted text-center">
                Opens WhatsApp with your details prefilled — we&apos;ll take it from there.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}