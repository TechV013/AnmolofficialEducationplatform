import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Testimonial } from "@/types/lms";
import { testimonials as staticTestimonials } from "@/data/courses";

export const TESTIMONIALS_TAG = "testimonials";

const PUBLIC_SELECT = {
  id: true,
  name: true,
  role: true,
  category: true,
  courseTaken: true,
  rating: true,
  quote: true,
  videoUrl: true,
  thumbnail: true,
} as const;

/**
 * Cached published testimonials for public surfaces (home + /testimonials).
 * Tagged so admin mutations invalidate it on demand; also refreshes every 60s.
 * Falls back to the static catalog if the database is unreachable.
 */
export const getPublishedTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    try {
      return await prisma.testimonial.findMany({
        where: { isPublished: true },
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        select: { ...PUBLIC_SELECT },
      });
    } catch (e) {
      console.warn("getPublishedTestimonials: DB unreachable, falling back to static testimonials:", e);
      return staticTestimonials as Testimonial[];
    }
  },
  ["published-testimonials"],
  { tags: [TESTIMONIALS_TAG], revalidate: 60 }
);

/** Full list (including drafts) for the admin panel. Never cached. */
export const getAllTestimonials = async () => {
  return prisma.testimonial.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
};

/** Drop cached public testimonials immediately after an admin mutation. */
export const invalidateTestimonialsCache = () => {
  try {
    revalidateTag(TESTIMONIALS_TAG, { expire: 0 });
  } catch (e) {
    console.warn("invalidateTestimonialsCache: skipping (no request scope):", e);
  }
};
