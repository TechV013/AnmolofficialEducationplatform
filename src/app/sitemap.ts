import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.anmolofficial.com";

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/community`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic published course pages
  let publishedCourses: { id: string; updatedAt: Date }[] = [];
  try {
    publishedCourses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, updatedAt: true },
    });
  } catch (e) {
    console.warn("Sitemap: DB unreachable during build, using static routes only:", e);
  }

  const courseRoutes: MetadataRoute.Sitemap = publishedCourses.map((course) => ({
    url: `${baseUrl}/courses/${course.id}`,
    lastModified: course.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
