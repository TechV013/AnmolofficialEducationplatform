import Link from "next/link";
import { BookOpen, Target, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-4">ABOUT ANMLOFFICIAL</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-6">रचनात्मकता को अवसर में बदलने की एक कोशिश</h1>
          <p className="text-muted max-w-2xl mx-auto text-base sm:text-lg mb-10">एक ऑनलाइन लर्निंग प्लेटफ़ॉर्म है, जहाँ रचनात्मक क्षेत्रों से जुड़े कौशल को आसान, व्यवस्थित और practical तरीके से सीखने का अवसर मिलता है। हमारा उद्देश्य ऐसी शिक्षा देना है</p>
          <Link href="/courses" className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-hover transition-all">Explore Courses</Link>
<p className="mt-6 text-muted max-w-2xl mx-auto text-base sm:text-lg">हमारा मानना है कि Creative Education महंगी, मुश्किल या सिर्फ classroom तक सीमित नहीं होनी चाहिए। हमारा मिशन बिल्कुल सरल है — बेहतरीन creative और design education को हर किसी के लिए affordable, accessible और practical बनाना।</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 text-muted text-lg leading-relaxed text-left">
          <p>
            हमारा platform उन लोगों के लिए एक ऐसी जगह है जहाँ वे अपनी creativity को explore कर सकें, नए skills सीख सकें और अपने career में आगे बढ़ सकें। चाहे आप design की दुनिया में अपना career शुरू करना चाहते हों, अपनी existing skills को बेहतर बनाना चाहते हों या बस कुछ नया सीखने की इच्छा रखते हों — हम आपके learning journey को थोड़ा आसान और ज्यादा meaningful बनाने के लिए यहाँ हैं।
          </p>
          <p>
            हम industry experts के साथ मिलकर creative design और उससे जुड़े क्षेत्रों के practical, expert-led online courses लेकर आते हैं। इन courses को इस तरह तैयार किया गया है कि आप सिर्फ सीखें ही नहीं, बल्कि उस knowledge को अपने काम और career में भी इस्तेमाल कर सकें।
          </p>
          <p className="text-2xl font-bold text-text text-center">सीखिए। बनाइए। आगे बढ़िए।</p>
          <p>
            हम एक ऐसी growing learning community बना रहे हैं जो मानती है कि learning की कोई expiry date नहीं होती।
          </p>
          <p>
            College खत्म होने या job शुरू होने के बाद या फिर किसी कारणवश जिन्हें स्कूल या कॉलेज से ब्रेक लेना पड़ा, या जो किसी वजह से स्कूल-कॉलेज की पढ़ाई जारी ही नहीं रख पाए ऐसे सभी लोगों का सीखना रुकना नहीं चाहिए। Creative industry लगातार बदल रही है, नए tools और ideas हर दिन सामने आ रहे हैं और ऐसे में खुद को सीखते और evolve करते रहना ही growth का हिस्सा है।
          </p>
          <p>
            इसी सोच के साथ हम online creative education को ज्यादा simple, flexible और accessible बनाने की कोशिश कर रहे हैं। ताकि आप अपनी सुविधा के अनुसार सीख सकें, अपने skills को upgrade कर सकें और अपने career के लिए नए opportunities तैयार कर सकें।
          </p>
          <p>
            क्योंकि हमारे लिए education सिर्फ certificates हासिल करने का नाम नहीं है।
          </p>
          <p className="font-semibold">
            यह उस confidence को पाने के बारे में है जो आपको कहने देता है &ldquo;मैं यह कर सकता हूँ। मैं कुछ नया बना सकता हूँ।&rdquo;
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-soft-blue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10">
            <div className="bg-surface p-8 rounded-3xl border border-border">
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-text mb-2">Structured Learning</h3>
                <p className="text-muted">Clear, logical progression designed to help you master complex creative concepts.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl border border-border">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-text mb-2">Practical Skills</h3>
                <p className="text-muted">Focused expertise meant for application, helping you build a professional creative portfolio.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl border border-border">
                <Zap className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-text mb-2">Purpose-Driven</h3>
                <p className="text-muted">We go beyond surface-level techniques, diving into why principles work.</p>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-6">Ready to start learning?</h2>
        <Link href="/courses" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-hover transition-all">Explore Courses</Link>
      </section>
    </div>
  );
}