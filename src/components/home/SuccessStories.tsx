import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/courses";

export default function SuccessStories() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-text">Their Stories. Their Success. Your Inspiration</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col border border-border">
              <Quote className="w-6 h-6 text-primary/40 mb-4" />
              <p className="text-text leading-relaxed text-sm flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 pt-5 border-t border-border flex items-center">
                <div className="w-11 h-11 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {t.name[0]}
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-sm text-text">{t.name}</h4>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-3 h-3 ${j < t.rating ? "text-primary fill-primary" : "text-gray-300"}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}