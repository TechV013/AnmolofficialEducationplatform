import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  normalizeEmail,
  findUserByEmail,
  resolveGoogleUser,
} from "@/services/auth/googleAuth.service";

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });
});

describe("findUserByEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queries with the normalized email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as any);
    await findUserByEmail("  TEST@X.COM ");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@x.com" },
    });
  });
});

describe("resolveGoogleUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a STUDENT account when the email is new", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as any);
    vi.mocked(prisma.user.create).mockImplementation((async (args: any) => ({
      id: "u1",
      ...args.data,
    })) as any);

    const result = await resolveGoogleUser({
      email: "New@Gmail.com",
      name: "Nina Patel",
      image: "https://pic.example/img.jpg",
      googleId: "goog-1",
    });

    expect(result.created).toBe(true);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "new@gmail.com",
        name: "Nina Patel",
        image: "https://pic.example/img.jpg",
        role: "STUDENT",
        isActive: true,
        provider: "google",
        providerAccountId: "goog-1",
      }),
    });
    expect(result.user.role).toBe("STUDENT");
  });

  it("links an existing password account and keeps its role", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u1",
      email: "same@x.com",
      name: "Existing",
      image: null,
      role: "INSTRUCTOR",
      isActive: true,
      provider: "credentials",
      providerAccountId: null,
    } as any);
    vi.mocked(prisma.user.update).mockImplementation((async (args: any) => ({
      id: "u1",
      email: "same@x.com",
      name: "Existing",
      image: null,
      role: "INSTRUCTOR",
      isActive: true,
      ...args.data,
    })) as any);

    const result = await resolveGoogleUser({
      email: "same@x.com",
      name: "Existing",
      googleId: "goog-1",
    });

    expect(result.created).toBe(false);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({
        provider: "google",
        providerAccountId: "goog-1",
      }),
    });
    expect(result.user.role).toBe("INSTRUCTOR");
  });

  it("returns an already-linked account without updating", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u1",
      email: "same@x.com",
      name: "Existing",
      image: null,
      role: "STUDENT",
      isActive: true,
      provider: "google",
      providerAccountId: "goog-1",
    } as any);

    const result = await resolveGoogleUser({
      email: "same@x.com",
      googleId: "goog-1",
    });

    expect(result.created).toBe(false);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(result.user.id).toBe("u1");
  });
});