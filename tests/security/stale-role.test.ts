import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { requireCourseEditor } from "@/lib/auth/authorizer";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    courseInstructor: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
}));

describe("Database-authoritative role authorization (Stale-role security)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies course editing if DB role is STUDENT even if session claims INSTRUCTOR", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "u-1", role: "INSTRUCTOR" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "STUDENT", isActive: true } as any);

    await expect(requireCourseEditor("course-1")).rejects.toThrow("Forbidden");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "u-1" },
      select: { role: true, isActive: true },
    });
  });

  it("denies course editing if user is deactivated in DB", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "u-1", role: "ADMIN" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN", isActive: false } as any);

    await expect(requireCourseEditor("course-1")).rejects.toThrow("Forbidden");
  });
});
