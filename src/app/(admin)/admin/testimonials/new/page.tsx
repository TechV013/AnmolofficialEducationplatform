import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authorizeRole } from "@/lib/auth/guard";
import TestimonialForm from "@/components/admin/TestimonialForm";

export const metadata: Metadata = {
  title: "New Testimonial — Admin",
  robots: { index: false, follow: false },
};

export default async function NewTestimonialPage() {
  await authorizeRole("ADMIN");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Testimonials
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">New Testimonial</h1>
        <p className="text-sm text-slate-500">Add a student testimonial with an optional video and thumbnail.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <TestimonialForm />
      </div>
    </div>
  );
}
