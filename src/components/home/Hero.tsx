import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#EBF5FF] min-h-[600px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Text Content */}
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111] leading-[1.1] tracking-tight">
              Your Imagination.<br />
              Our Expertise. Your Future
            </h1>
            <p className="mt-6 text-lg text-[#181D27] max-w-lg">
              Step into the world of design, animation, VFX, filmmaking and digital creativity.
            </p>
            <div className="mt-10">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center bg-[#111111] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#333333] transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          </div>

          {/* Right - Founder with Circles */}
          <div className="relative flex justify-end items-center h-[600px] mr-10">

            {/* Founder image centered on circles */}
            <img
              src="/images/founder.png"
              alt="Founder"
              className="relative bottom-[-90px] absolute right-[-280px] z-10 h-[1000px] w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
