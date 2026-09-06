import { Star } from "lucide-react";
import { testimonials } from "@/data/courses";

export default function SuccessStories() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EBF5FF]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">Their Stories. Their Success. Your Inspiration</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {t.name[0]}
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < t.rating ? "text-primary fill-primary" : "text-gray-300"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                ▶
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
