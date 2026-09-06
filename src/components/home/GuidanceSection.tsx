import Link from "next/link";

export default function GuidanceSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EBF5FF]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#181D27] rounded-[2rem] p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8 text-white">
          <div className="lg:w-1/2">
            <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2">Get Expert Guidance</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">A Conversation with the Founder</h2>
            <p className="opacity-90 leading-relaxed mb-8">
              Connect one-on-one with our founder and industry expert. Get personalized career advice, course recommendations, and answers to your questions. Our mentorship program has helped 40K+ students build successful careers in creative fields.
            </p>
            <div>
              <div className="text-4xl font-bold">40K+</div>
              <p className="text-sm opacity-80">Students mentored and counting</p>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <form className="bg-white text-black p-8 rounded-2xl shadow-xl space-y-4">
              <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              <input type="tel" placeholder="Phone Number" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              <input type="email" placeholder="Email Address" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              <select className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                <option>What would you like to discuss?</option>
                <option>Course Selection</option>
                <option>Career Guidance</option>
                <option>Project Feedback</option>
                <option>Other</option>
              </select>
              <button
                type="button"
                className="w-full bg-blue text-white py-3 rounded-lg font-bold hover:bg-blue-hover transition-colors"
              >
                Book Session
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
