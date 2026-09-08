"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#EBF5FF] min-h-[600px] flex items-center pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-[#111111] leading-[1.15] tracking-tight whitespace-nowrap">
              Your Imagination.<br />
              Our Expertise.<br />
              Unstoppable Learning
            </h1>
            <p className="mt-6 text-lg text-[#181D27] max-w-lg mx-auto lg:mx-0">
              With Anmolofficial, learn affordable creative skills with structured, purpose-driven courses that teach not just what to learn, but why it matters and how to solve real-world problems with it.
            </p>
            <div className="mt-10">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center bg-[#111111] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#333333] transition-all shadow-lg hover:scale-105"
              >
                Explore Courses
              </Link>
            </div>
          </motion.div>

          {/* Right - Founder Image (absolute to break out of container) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute right-0 bottom-0 w-1/2 h-[600px] flex justify-end items-end pointer-events-none"
          >
            <img
              src="/images/founder.png"
              alt="Founder"
              className="relative z-10 h-[580px] w-auto object-contain object-bottom translate-y-4"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
