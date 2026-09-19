import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    enrollment: { deleteMany: vi.fn() },
    order: { deleteMany: vi.fn() },
    quizAttempt: { deleteMany: vi.fn() },
    assignmentSubmission: { deleteMany: vi.fn() },
    lessonProgress: { deleteMany: vi.fn() },
    note: { deleteMany: vi.fn() },
    review: { deleteMany: vi.fn() },
    courseInstructor: { deleteMany: vi.fn() },
    certificate: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth/helpers", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { updateUserRole, toggleBlockUser } from "@/app/(admin)/admin/users/actions";
import { ADMIN_EMAIL } from "@/lib/auth/admin";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";

vi.mocked(prisma.$transaction).mockImplementation(((cb: unknown) =>
  (cb as (tx: unknown) => Promise<unknown>)({ user: prisma.user })) as never);

describe("Admin single-role enforcement (Phase 5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ id: "admin-1", role: "ADMIN" } as never);
  });

  it("rejects ADMIN as an assignable role", async () => {
    await expect(updateUserRole("u1", "ADMIN" as never)).rejects.toThrow(
      "Only Student and Instructor roles can be assigned."
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("admin cannot change their own role", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "admin-1", role: "ADMIN" } as never);
    await expect(updateUserRole("admin-1", "INSTRUCTOR")).rejects.toThrow(
      "Cannot change your own role."
    );
  });

  it("cannot demote the canonical admin account by email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u7", role: "STUDENT", email: ADMIN_EMAIL
    } as never);
    await expect(updateUserRole("u7", "INSTRUCTOR")).rejects.toThrow(
      "The Admin account role is fixed and cannot be changed."
    );
  });

  it("cannot change a role to or from ADMIN", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u8", role: "ADMIN", email: "someone@else.com"
    } as never);
    await expect(updateUserRole("u8", "STUDENT")).rejects.toThrow(
      "The Admin account role is fixed and cannot be changed."
    );
  });

  it("switches a student to instructor", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u5", role: "STUDENT", email: "learner@example.com"
    } as never);
    await updateUserRole("u5", "INSTRUCTOR");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u5" },
      data: { role: "INSTRUCTOR" }
    });
  });

  it("cannot block the canonical admin account", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u7", role: "STUDENT", email: ADMIN_EMAIL, isActive: true
    } as never);
    await expect(toggleBlockUser("u7")).rejects.toThrow(
      "The Admin account cannot be blocked."
    );
  });
});