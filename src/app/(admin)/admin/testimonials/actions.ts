"use server";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import { revalidatePath } from "next/cache";
import { isValidVideoUrl } from "@/lib/video/validateUrl";
import { invalidateTestimonialsCache } from "@/services/testimonials/testimonial.service";

export interface TestimonialInput {
  name: string;
  role: string;
  category: string;
  courseTaken: string | null;
  rating: number;
  quote: string;
  videoUrl: string | null;
  thumbnail: string | null;
  isPublished: boolean;
}

function normalize(data: TestimonialInput) {
  const name = data.name.trim();
  const role = data.role.trim();
  const quote = data.quote.trim();
  const videoUrl = data.videoUrl?.trim() || null;
  const thumbnail = data.thumbnail?.trim() || null;

  if (!name) throw new Error("Name is required");
  if (!role) throw new Error("Role / specialization is required");
  if (!quote) throw new Error("Testimonial text is required");

  const parsedRating = Number(data.rating);
  const rating = Number.isFinite(parsedRating)
    ? Math.min(5, Math.max(1, Math.round(parsedRating)))
    : 5;
  if (videoUrl && !isValidVideoUrl(videoUrl)) {
    throw new Error("Video URL must be a YouTube, Vimeo, Google Drive, or direct MP4 link");
  }

  return {
    name,
    role,
    category: data.category.trim() || "General",
    courseTaken: data.courseTaken?.trim() || null,
    rating,
    quote,
    videoUrl,
    thumbnail,
    isPublished: Boolean(data.isPublished),
  };
}

function revalidateTestimonials() {
  invalidateTestimonialsCache();
  revalidatePath("/testimonials");
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function createTestimonial(data: TestimonialInput) {
  await authorizeRole("ADMIN");
  const normalized = normalize(data);

  const max = await prisma.testimonial.aggregate({ _max: { position: true } });

  const created = await prisma.testimonial.create({
    data: { ...normalized, position: (max._max.position ?? -1) + 1 },
  });

  revalidateTestimonials();
  return created.id;
}

export async function updateTestimonial(id: string, data: TestimonialInput) {
  await authorizeRole("ADMIN");
  const normalized = normalize(data);

  await prisma.testimonial.update({ where: { id }, data: normalized });

  revalidateTestimonials();
}

export async function deleteTestimonial(id: string) {
  await authorizeRole("ADMIN");
  await prisma.testimonial.delete({ where: { id } });
  revalidateTestimonials();
}

export async function toggleTestimonialPublished(id: string, isPublished: boolean) {
  await authorizeRole("ADMIN");
  await prisma.testimonial.update({ where: { id }, data: { isPublished } });
  revalidateTestimonials();
}

export async function moveTestimonial(id: string, direction: "up" | "down") {
  await authorizeRole("ADMIN");

  const all = await prisma.testimonial.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: { id: true, position: true },
  });

  const index = all.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Testimonial not found");

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= all.length) return;

  await prisma.$transaction(
    all.map((t, i) => {
      const targetIndex = i === index ? swapIndex : i === swapIndex ? index : i;
      return prisma.testimonial.update({
        where: { id: t.id },
        data: { position: targetIndex },
      });
    })
  );

  revalidateTestimonials();
}
