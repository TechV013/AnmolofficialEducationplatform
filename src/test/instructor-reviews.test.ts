import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    review: { findUnique: vi.fn(), update: vi.fn() },
    courseInstructor: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { updateReviewReply } from "@/app/(instructor)/instructor/reviews/actions";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";

describe("Instructor review reply security (Phase 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "instr-1", role: "INSTRUCTOR" } as any);
  });

  it("assigned instructor can reply to a review on their course", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValue({ courseId: "c1" } as any);
    vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue({ courseId: "c1", userId: "instr-1" } as any);
    vi.mocked(prisma.review.update).mockResolvedValue({} as any);

    await updateReviewReply("r1", "Thanks for the feedback!");

    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: expect.objectContaining({ reply: "Thanks for the feedback!", repliedById: "instr-1" })
    });
  });

  it("instructor not assigned to the course is denied", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValue({ courseId: "c1" } as any);
    vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue(null as any);

    await expect(updateReviewReply("r1", "hi")).rejects.toThrow("Forbidden");
    expect(prisma.review.update).not.toHaveBeenCalled();
  });

  it("clearing a reply removes reply, repliedAt and repliedById", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValue({ courseId: "c1" } as any);
    vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue({ courseId: "c1", userId: "instr-1" } as any);
    vi.mocked(prisma.review.update).mockResolvedValue({} as any);

    await updateReviewReply("r1", "   ");

    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { reply: null, repliedAt: null, repliedById: null }
    });
  });

  it("missing review is rejected", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValue(null as any);
    await expect(updateReviewReply("ghost", "hi")).rejects.toThrow("Review not found");
  });
});