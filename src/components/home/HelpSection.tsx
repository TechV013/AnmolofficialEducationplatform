"use client";
import Image from "next/image";
import { team } from "@/data/team";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** sm and up show three cards per page; below that, one at a time. */
const DESKTOP_PAGE_SIZE = 3;
const MOBILE_PAGE_SIZE = 1;

/**
 * Card for one team member. Description is clamped to 3 lines and a
 * "Read more" link appears only when the text actually overflows, so
 * uneven bio lengths never leave a dead gap in the row.
 */
function InstructorCard({ member, basisClass }: { member: (typeof team)[number]; basisClass?: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`basis-full ${basisClass ?? "sm:basis-[calc((100%-2rem)/3)]"} max-w-[300px] sm:max-w-none mx-auto bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full shrink-0 sm:shrink`}>
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
      <div className="text-center flex flex-col">
        <div>
          <h3 className="font-bold text-sm text-[#111111] mb-1 min-h-[20px] flex items-center justify-center">{member.name}</h3>
          <div className="w-6 h-0.5 bg-[#0069E0] mx-auto my-2 rounded-full"></div>
          <p className="text-[#0069E0] text-[10px] font-bold uppercase tracking-wider mb-2 min-h-[28px] flex items-center justify-center">{member.role}</p>
        </div>
        <p className={`text-[11px] text-gray-500 leading-tight text-center ${expanded ? "" : "line-clamp-3"}`}>
          {member.description}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-[11px] font-semibold text-[#0069E0] hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      </div>
    </div>
  );
}

export default function HelpSection() {
  const [pageIndex, setPageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardsPerPage, setCardsPerPage] = useState(DESKTOP_PAGE_SIZE);

  // One card per page below sm so a leftover single card never spans the
  // whole screen; three per page from sm up.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => {
      setCardsPerPage(mq.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
      setPageIndex(0);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const pages: (typeof team)[] = [];
  for (let i = 0; i < team.length; i += cardsPerPage) {
    pages.push(team.slice(i, i + cardsPerPage));
  }
  const pageCount = pages.length;
  const current = pages[pageIndex % Math.max(1, pageCount)] ?? [];

  // A partial last page (fewer cards than cardsPerPage) would otherwise leave
  // dead space; let those cards share the full row instead of sitting at 1/3 width.
  const isPartialPage = current.length > 0 && current.length < cardsPerPage;
  const partialBasis =
    current.length === 1 ? "sm:basis-full" : "sm:basis-[calc((100%-1rem)/2)]";

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
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScClEiD72Q7fWOGmyLV-u5iiqgxRslAXsgWPoy5V0XqVwvNDw/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#111111] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#333333] transition-colors shadow-lg"
              >
                Register Now
              </a>
              <a
                href="/about-us"
                className="inline-flex items-center justify-center border-2 border-[#111111] text-[#111111] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#111111] hover:text-white transition-all shadow-lg"
              >
                Go for all Experts
              </a>
            </div>
          </div>

          <div className="lg:w-1/2 overflow-hidden relative min-h-[450px]">
            <motion.div
              className="h-full"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageIndex}
                  className="flex gap-4 h-full items-stretch justify-center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {current.map((member) => (
                    <InstructorCard
                      key={member.id}
                      member={member}
                      basisClass={isPartialPage ? partialBasis : undefined}
                    />
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
