"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background min-h-[600px] flex items-center pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-text leading-[1.15] tracking-tight">
              Your Imagination.<br />
              Our Expertise.<br />
              Unstoppable Learning
            </h1>
            <p className="mt-6 text-lg text-muted max-w-lg mx-auto lg:mx-0">
              With Anmolofficial, learn affordable creative skills with structured, purpose-driven courses that teach not just what to learn, but why it matters and how to solve real-world problems with it.
            </p>
            <div className="mt-10">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center bg-dark text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-dark-hover transition-all shadow-lg hover:scale-105"
              >
                Explore Courses
              </Link>
            </div>
          </motion.div>

          {/* Right - Founder Image (in-flow below text on mobile/tablet, absolute bottom-right bleed on desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center items-end pointer-events-none lg:absolute lg:right-0 lg:bottom-0 lg:w-1/2 lg:h-[600px]"
          >
            <div aria-hidden className="absolute -inset-6 rounded-full bg-primary/10 blur-2xl lg:hidden" />
            <Image
              src="/images/founder.png"
              alt="Founder"
              width={500}
              height={580}
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 60vw, 500px"
              className="relative z-10 h-72 w-auto object-contain object-bottom sm:h-96 lg:h-[580px] lg:translate-y-4"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}