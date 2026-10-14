import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authorizeRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import TestimonialForm from "@/components/admin/TestimonialForm";

export const metadata: Metadata = {
  title: "Edit Testimonial — Admin",
  robots: { index: false, follow: false },
};

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await authorizeRole("ADMIN");
  const { id } = await params;

  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

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
        <h1 className="text-2xl font-bold text-slate-800">Edit Testimonial</h1>
        <p className="text-sm text-slate-500">Update the details, video, thumbnail or publish state.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <TestimonialForm
          testimonial={{
            id: testimonial.id,
            name: testimonial.name,
            role: testimonial.role,
            category: testimonial.category,
            courseTaken: testimonial.courseTaken,
            rating: testimonial.rating,
            quote: testimonial.quote,
            videoUrl: testimonial.videoUrl,
            thumbnail: testimonial.thumbnail,
            isPublished: testimonial.isPublished,
          }}
        />
      </div>
    </div>
  );
}
