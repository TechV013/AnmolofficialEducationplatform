import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    course: { findUnique: vi.fn(), create: vi.fn() },
    courseInstructor: { upsert: vi.fn() },
  },
}));

vi.mock("@/lib/auth/helpers", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/auth/guard", () => ({
  authorizeRole: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { toggleBlockUser } from "@/app/(admin)/admin/users/actions";
import { createCourse } from "@/app/(admin)/admin/courses/actions";
import { requireAdmin } from "@/lib/auth/helpers";
import { authorizeRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";

describe("Admin block toggle (Phase 2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ id: "admin-1", role: "ADMIN" } as any);
  });

  it("admin can block a student (sets isActive false)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "s1", role: "STUDENT", isActive: true } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    await toggleBlockUser("s1");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "s1" }, data: { isActive: false } })
    );
  });

  it("unblock toggles isActive back to true", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "s1", role: "STUDENT", isActive: false } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    await toggleBlockUser("s1");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: true } })
    );
  });

  it("admin cannot block themselves", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "admin-1", role: "ADMIN", isActive: true } as any);
    await expect(toggleBlockUser("admin-1")).rejects.toThrow("Cannot block yourself.");
  });

  it("admin cannot block the admin account", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "admin-2", role: "ADMIN", isActive: true } as any);
    await expect(toggleBlockUser("admin-2")).rejects.toThrow("Cannot block the Admin.");
  });
});

describe("Admin course creation (Phase 2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: "admin-1", role: "ADMIN" } as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null as any);
    vi.mocked(prisma.course.create).mockImplementation(({ data }: any) => Promise.resolve({ id: "c1", ...data }) as any);
  });

  it("creates course as DRAFT with numeric price", async () => {
    await createCourse({ title: "Design 101", description: "d", category: "Design", level: "Beginner", price: 499, thumbnail: "", slug: "" });

    expect(prisma.course.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: "Design 101", status: CourseStatus.DRAFT, price: 499 })
    });
  });

  it("auto-generates a slug from the title when empty", async () => {
    await createCourse({ title: "My Great Course!", description: "d", category: "General", level: "Beginner", price: 0, thumbnail: "", slug: "" });

    const data = vi.mocked(prisma.course.create).mock.calls[0][0].data as any;
    expect(data.slug).toBe("my-great-course");
  });

  it("rejects duplicate slugs", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: "existing", slug: "design-101" } as any);

    await expect(createCourse({ title: "Design 101", description: "d", category: "Design", level: "Beginner", price: 0, thumbnail: "", slug: "design-101" }))
      .rejects.toThrow("already exists");
    expect(prisma.course.create).not.toHaveBeenCalled();
  });

  it("rejects when not an admin", async () => {
    vi.mocked(authorizeRole).mockRejectedValue(new Error("Forbidden: Role mismatch"));
    await expect(createCourse({ title: "X", description: "d", category: "General", level: "Beginner", price: 0, thumbnail: "", slug: "" }))
      .rejects.toThrow("Forbidden");
  });
});