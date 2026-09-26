import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types/lms";

export interface GoogleProfileInput {
  email: string;
  name?: string | null;
  image?: string | null;
  googleId?: string | null;
}

export interface ResolvedGoogleUser {
  ok: boolean;
  created: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: UserRole;
    isActive: boolean;
    provider: string;
    providerAccountId: string | null;
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
}

export async function resolveGoogleUser(
  input: GoogleProfileInput
): Promise<ResolvedGoogleUser> {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (!existing.providerAccountId && input.googleId) {
      const linked = await prisma.user.update({
        where: { id: existing.id },
        data: {
          provider: "google",
          providerAccountId: input.googleId,
          ...(existing.image ? {} : { image: input.image ?? null }),
        },
      });
      return { ok: true, created: false, user: linked };
    }
    return { ok: true, created: false, user: existing };
  }

  const created = await prisma.user.create({
    data: {
      email,
      name: input.name ?? null,
      image: input.image ?? null,
      role: "STUDENT",
      isActive: true,
      provider: "google",
      providerAccountId: input.googleId ?? null,
    },
  });

  return { ok: true, created: true, user: created };
}