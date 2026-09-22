"use server";

import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  title?: string;
  phone?: string;
  website?: string;
  image?: string;
}

export async function updateUserProfile(data: ProfileUpdateData) {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name !== undefined ? data.name.trim() : undefined,
      bio: data.bio !== undefined ? data.bio.trim() : undefined,
      title: data.title !== undefined ? data.title.trim() : undefined,
      phone: data.phone !== undefined ? data.phone.trim() : undefined,
      website: data.website !== undefined ? data.website.trim() : undefined,
      image: data.image !== undefined ? data.image.trim() : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      bio: true,
      title: true,
      phone: true,
      website: true,
    }
  });

  revalidatePath("/profile");
  revalidatePath("/instructor/profile");
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  revalidatePath("/instructor");

  return updatedUser;
}
