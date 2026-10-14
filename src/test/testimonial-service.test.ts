import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { testimonial: { findMany: vi.fn() } },
}));

import { revalidateTag } from "next/cache";
import { getPublishedTestimonials, getAllTestimonials, invalidateTestimonialsCache } from "@/services/testimonials/testimonial.service";
import { prisma } from "@/lib/prisma";

const rows = [
  { id: "t1", name: "Rakesh Sharma", role: "3D Artist", category: "3D & Animation", courseTaken: null, rating: 5, quote: "Great", videoUrl: null, thumbnail: null },
  { id: "t2", name: "Neha Kumari Mishra", role: "VFX Artist", category: "Rigging", courseTaken: "Rigging", rating: 5, quote: "Loved it", videoUrl: "https://youtu.be/x", thumbnail: null },
];

describe("testimonial service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns database testimonials when the DB responds", async () => {
    vi.mocked(prisma.testimonial.findMany).mockResolvedValue(rows as any);
    const result = await getPublishedTestimonials();
    expect(result).toBe(rows);
    expect(prisma.testimonial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isPublished: true } })
    );
  });

  it("falls back to the static catalog when the DB is unreachable", async () => {
    vi.mocked(prisma.testimonial.findMany).mockRejectedValue(new Error("db down"));
    const result = await getPublishedTestimonials();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
  });

  it("getAllTestimonials is uncached and ordered by position then createdAt", async () => {
    vi.mocked(prisma.testimonial.findMany).mockResolvedValue(rows as any);
    await getAllTestimonials();
    expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  });

  it("invalidateTestimonialsCache revalidates the testimonials tag", () => {
    invalidateTestimonialsCache();
    expect(revalidateTag).toHaveBeenCalledWith("testimonials", { expire: 0 });
  });
});
