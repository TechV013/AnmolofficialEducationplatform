import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
  CredentialsProvider: vi.fn(() => ({})),
}));

vi.mock("@/lib/auth/config", () => ({
  authConfig: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

import { requireRole } from "@/lib/auth/helpers";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

describe("Auth lifecycle: blocked / deactivated accounts (Phase 1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("active user with matching role passes requireRole", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", email: "a@a.com", name: "A", role: "STUDENT" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "STUDENT", isActive: true } as any);

    const user = await requireRole("STUDENT");
    expect(user.id).toBe("user-1");
  });

  it("deactivated user is rejected even with a valid session", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", email: "a@a.com", name: "A", role: "STUDENT" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "STUDENT", isActive: false } as any);

    await expect(requireRole("STUDENT")).rejects.toThrow("Forbidden: Account deactivated");
  });

  it("role mismatch still rejects when account is active", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", email: "a@a.com", name: "A", role: "STUDENT" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "STUDENT", isActive: true } as any);

    await expect(requireRole("ADMIN")).rejects.toThrow("Forbidden: Role mismatch");
  });

  it("missing user in DB is rejected", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-ghost", email: "g@a.com", name: "G", role: "STUDENT" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as any);

    await expect(requireRole("STUDENT")).rejects.toThrow("Forbidden: User not found in database");
  });

  it("unauthenticated session is rejected", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as any);
    await expect(requireRole("STUDENT")).rejects.toThrow("Unauthorized");
  });
});