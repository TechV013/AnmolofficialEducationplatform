import { FAQ_DATA } from "@/data/faq";

export default function FAQPage() {
  return (
    <div className="bg-background px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-text mb-8">Frequently Asked Questions</h1>
            {FAQ_DATA.map(cat => (
                <div key={cat.category} className="mb-8">
                    <h2 className="text-2xl font-bold text-primary mb-4">{cat.category}</h2>
                    {cat.questions.map((item, i) => (
                        <details key={i} className="bg-surface p-4 rounded-xl border border-border mb-2">
                            <summary className="font-semibold cursor-pointer">{item.q}</summary>
                            <p className="text-muted mt-2">{item.a}</p>
                        </details>
                    ))}
                </div>
            ))}
        </div>
    </div>
  );
}
