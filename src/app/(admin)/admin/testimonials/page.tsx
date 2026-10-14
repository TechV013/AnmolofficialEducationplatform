export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star, Video, Pencil } from "lucide-react";
import { authorizeRole } from "@/lib/auth/guard";
import { getAllTestimonials } from "@/services/testimonials/testimonial.service";
import Badge from "@/components/ui/Badge";
import TestimonialActions from "@/components/admin/TestimonialActions";

export const metadata: Metadata = {
  title: "Testimonials — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminTestimonialsPage() {
  await authorizeRole("ADMIN");

  const testimonials = await getAllTestimonials();
  const publishedCount = testimonials.filter((t) => t.isPublished).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Testimonials</h1>
          <p className="text-sm text-slate-500">Add, edit, publish and reorder student testimonials</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">{testimonials.length} Total</Badge>
          <Badge variant="success">{publishedCount} Published</Badge>
          <Link
            href="/admin/testimonials/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            New Testimonial
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Student</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Rating</th>
              <th className="px-6 py-3 text-center">Video</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No testimonials yet. Create your first one.
                </td>
              </tr>
            )}
            {testimonials.map((t, index) => (
              <tr key={t.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {t.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{t.category || "—"}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-slate-600">{t.rating}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {t.videoUrl ? (
                    <Video className="mx-auto h-4 w-4 text-primary" />
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={t.isPublished ? "success" : "warning"}>
                    {t.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/testimonials/${t.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <TestimonialActions
                      id={t.id}
                      isPublished={t.isPublished}
                      canMoveUp={index > 0}
                      canMoveDown={index < testimonials.length - 1}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
