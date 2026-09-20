import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  await requireAdmin();
  const { userId } = await params;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: UserRole.INSTRUCTOR }
  });

  return NextResponse.json(user);
}
