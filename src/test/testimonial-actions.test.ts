import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/guard", () => ({ authorizeRole: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/services/testimonials/testimonial.service", () => ({
  invalidateTestimonialsCache: vi.fn(),
  TESTIMONIALS_TAG: "testimonials",
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    testimonial: {
      aggregate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { authorizeRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublished,
  moveTestimonial,
  type TestimonialInput,
} from "@/app/(admin)/admin/testimonials/actions";

const base: TestimonialInput = {
  name: "  Rakesh Sharma  ",
  role: "3D Artist",
  category: "3D & Animation",
  courseTaken: "",
  rating: 5,
  quote: " Great course ",
  videoUrl: "",
  thumbnail: "",
  isPublished: true,
};

describe("admin testimonial actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: "admin-1", role: "ADMIN" } as any);
    vi.mocked(prisma.testimonial.aggregate).mockResolvedValue({ _max: { position: 4 } } as any);
    vi.mocked(prisma.testimonial.create).mockResolvedValue({ id: "t-new" } as any);
    vi.mocked(prisma.testimonial.update).mockResolvedValue({} as any);
    vi.mocked(prisma.testimonial.delete).mockResolvedValue({} as any);
  });

  it("requires ADMIN authorization", async () => {
    await createTestimonial(base);
    expect(authorizeRole).toHaveBeenCalledWith("ADMIN");
  });

  it("normalizes input and appends at the next position", async () => {
    const id = await createTestimonial(base);
    expect(id).toBe("t-new");
    expect(prisma.testimonial.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Rakesh Sharma",
        quote: "Great course",
        category: "3D & Animation",
        courseTaken: null,
        videoUrl: null,
        thumbnail: null,
        position: 5,
        isPublished: true,
      }),
    });
  });

  it("rejects an invalid video URL", async () => {
    await expect(createTestimonial({ ...base, videoUrl: "not-a-url" })).rejects.toThrow(/Video URL/);
    expect(prisma.testimonial.create).not.toHaveBeenCalled();
  });

  it("rejects an empty name", async () => {
    await expect(createTestimonial({ ...base, name: "   " })).rejects.toThrow(/Name is required/);
  });

  it("clamps out-of-range ratings", async () => {
    await createTestimonial({ ...base, rating: 9 });
    expect(prisma.testimonial.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ rating: 5 }),
    });
    vi.clearAllMocks();
    vi.mocked(prisma.testimonial.aggregate).mockResolvedValue({ _max: { position: 0 } } as any);
    vi.mocked(prisma.testimonial.create).mockResolvedValue({ id: "t2" } as any);
    await createTestimonial({ ...base, rating: 0 });
    expect(prisma.testimonial.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ rating: 1 }),
    });
  });

  it("updates an existing testimonial", async () => {
    await updateTestimonial("t1", base);
    expect(prisma.testimonial.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: expect.objectContaining({ name: "Rakesh Sharma" }),
    });
  });

  it("toggles publish state", async () => {
    await toggleTestimonialPublished("t1", false);
    expect(prisma.testimonial.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { isPublished: false },
    });
  });

  it("deletes a testimonial", async () => {
    await deleteTestimonial("t1");
    expect(prisma.testimonial.delete).toHaveBeenCalledWith({ where: { id: "t1" } });
  });

  it("moves a testimonial up by swapping positions", async () => {
    vi.mocked(prisma.testimonial.findMany).mockResolvedValue([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
    ] as any);

    await moveTestimonial("b", "up");

    const calls = vi.mocked(prisma.testimonial.update).mock.calls;
    const byId = Object.fromEntries(calls.map(([arg]: any) => [arg.where.id, arg.data.position]));
    expect(byId).toEqual({ a: 1, b: 0, c: 2 });
  });

  it("does nothing when moving the first item up", async () => {
    vi.mocked(prisma.testimonial.findMany).mockResolvedValue([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
    ] as any);

    await moveTestimonial("a", "up");
    expect(prisma.testimonial.update).not.toHaveBeenCalled();
  });
});
