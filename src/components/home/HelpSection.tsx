"use client";
import Image from "next/image";
import { team } from "@/data/team";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 3;

export default function HelpSection() {
  const [pageIndex, setPageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const pages: (typeof team)[] = [];
  for (let i = 0; i < team.length; i += PAGE_SIZE) {
    pages.push(team.slice(i, i + PAGE_SIZE));
  }
  const pageCount = pages.length;
  const current = pages[pageIndex % Math.max(1, pageCount)] ?? [];

  // Auto-advance every 5 seconds. Keyed on pageIndex so a manual arrow click
  // restarts the full interval on the newly shown page.
  useEffect(() => {
    if (isPaused || pageCount <= 1) return;
    const timeout = setTimeout(() => {
      setPageIndex((prev) => (prev + 1) % pageCount);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [pageIndex, isPaused, pageCount]);

  const goNext = () => setPageIndex((prev) => (prev + 1) % pageCount);
  const goPrev = () =>
    setPageIndex((prev) => (prev - 1 + pageCount) % pageCount);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#111111] mb-6 tracking-tight">
              Happy to help you!
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Have More Questions? Still looking for clarity? Let&apos;s Talk.<br />
              Our expert practitioners are here to listen, understand your goals and patiently guide you through every question, so you can make the right decision with confidence.
            </p>
            <p className="text-[#111111] font-semibold mb-8">
              Your First Conversation Is On Us! completely <span className="font-bold">FREE</span>
            </p>
            <a
              href="https://wa.me/917073345025?text=Hi%2C%20I%20have%20questions%20and%20would%20like%20to%20connect%20with%20an%20expert."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#111111] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#333333] transition-colors shadow-lg"
            >
              Register Now
            </a>
          </div>

          <div className="lg:w-1/2 overflow-hidden relative h-[450px]">
            <motion.div
              className="h-full"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageIndex}
                  className="flex gap-4 h-full justify-center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {current.map((member) => (
                    <div
                      key={member.id}
                      className="basis-full sm:basis-[calc((100%-2rem)/3)] bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={200}
                          height={267}
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
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {pageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous team members"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full border border-gray-200 bg-white/90 p-2 shadow-md text-[#111111] hover:bg-white hover:shadow-lg transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next team members"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full border border-gray-200 bg-white/90 p-2 shadow-md text-[#111111] hover:bg-white hover:shadow-lg transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
