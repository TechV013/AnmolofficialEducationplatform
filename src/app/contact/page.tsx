export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-text mb-6">Need help? We&apos;re here to help.</h1>
            <p className="text-muted text-lg mb-12">Reach out to our team for questions about courses, enrollment, payments, or technical support.</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-surface p-8 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg mb-2">General Questions</h3>
                    <p className="text-muted text-sm">For questions not covered in the FAQ.</p>
                </div>
                <div className="bg-surface p-8 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg mb-2">Enrollment & Payments</h3>
                    <p className="text-muted text-sm">For issues regarding course access or payment verification.</p>
                </div>
            </div>

            <div className="bg-surface p-8 rounded-2xl border border-border">
                <h2 className="font-bold text-xl mb-6">Contact Form</h2>
                <p className="text-muted mb-6">This contact form is currently under development. For urgent support, please use the WhatsApp chat link in our footer.</p>
                <div className="space-y-4 opacity-50 pointer-events-none">
                    <input placeholder="Name" className="w-full p-3 border rounded-xl" />
                    <input placeholder="Email" className="w-full p-3 border rounded-xl" />
                    <textarea placeholder="Message" className="w-full p-3 border rounded-xl h-32" />
                    <button className="bg-primary text-white px-6 py-3 rounded-full font-bold">Submit</button>
                </div>
            </div>
        </div>
    </main>
  );
}
