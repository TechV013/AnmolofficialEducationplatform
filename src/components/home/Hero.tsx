"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Split headline with the founder image in the centre */}
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1fr_auto_1fr]">
          {/* Left clause */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center lg:text-right"
          >
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-6xl lg:text-7xl">
              Your<br />Imagination.
            </h1>
          </motion.div>

          {/* Founder image centre */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto h-72 w-full max-w-[260px] sm:h-80 sm:max-w-[300px] lg:h-[420px] lg:max-w-[360px]"
          >
            <div aria-hidden className="absolute -inset-8 rounded-full bg-primary/10 blur-2xl" />
            <Image
              src="/images/founder.png"
              alt="Founder"
              fill
              priority
              sizes="(max-width: 640px) 260px, (max-width: 1024px) 300px, 360px"
              className="relative z-10 object-contain object-bottom"
            />
          </motion.div>

          {/* Right clause */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-6xl lg:text-7xl">
              Our<br />Expertise.
            </h1>
          </motion.div>
        </div>

        {/* Punchline + subtext + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 text-center sm:mt-14"
        >
          <h2 className="text-3xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
            Unstoppable Learning
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
            With Anmolofficial, learn affordable creative skills with structured, purpose-driven courses that teach not just what to learn, but why it matters and how to solve real-world problems with it.
          </p>
          <div className="mt-8 sm:mt-10">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center bg-dark px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-dark-hover rounded-full"
            >
              Explore Courses
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}