"use client";
import Link from "next/link";
import { instructors } from "@/data/courses";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HelpSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate every 5 seconds (changed to 5 as requested)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % instructors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Show a set of 3 instructors starting from currentIndex
  const getVisibleInstructors = () => {
    return instructors;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#111111] mb-6 tracking-tight">
              Happy to help you!
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Have More Questions? Still looking for clarity? Let's Talk.<br />
              Our expert practitioners are here to listen, understand your goals and patiently guide you through every question, so you can make the right decision with confidence.
            </p>
            <p className="text-[#111111] font-semibold mb-8">
              Your First Conversation Is On Us! completely <span className="font-bold">FREE</span>
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center bg-[#111111] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#333333] transition-colors shadow-lg"
            >
              Register Now
            </Link>
          </div>

          <div className="lg:w-1/2 overflow-hidden relative h-[450px]">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentIndex}
                  className="col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {getVisibleInstructors().slice(currentIndex, currentIndex + 3).concat(
                    getVisibleInstructors().slice(0, Math.max(0, 3 - (getVisibleInstructors().length - currentIndex)))
                  ).map((instructor) => (
                    <div 
                      key={instructor.id} 
                      className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl mb-4 overflow-hidden">
                      <img
                        src={`/images/instructor/instructor${instructor.id}.png`}
                        alt={instructor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/founder.png';
                        }}
                      />
                      </div>
                      <div className="text-center mt-auto">
                        <h4 className="font-bold text-sm text-[#111111] mb-1">{instructor.name}</h4>
                        <div className="w-6 h-0.5 bg-[#0069E0] mx-auto my-2 rounded-full"></div>
                        <p className="text-[#0069E0] text-[10px] font-bold uppercase tracking-wider mb-2">{instructor.role}</p>
                        <p className="text-[11px] text-gray-500 leading-tight">{instructor.description}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
