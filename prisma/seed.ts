import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
const prisma = new PrismaClient();

async function seed() {
  const slugs = [
    "demo-creative-design-foundations",
    "demo-fullstack-web-essentials",
    "demo-python-beginners",
    "demo-3d-maya"
  ];
  for (const slug of slugs) {
    const exists = await prisma.course.findUnique({ where: { slug } });
    if (exists) { console.log("Skip existing:", slug); continue; }
    await prisma.course.create({
      data: {
        title: "DEMO - " + slug.replace("demo-", "").replace(/-/g, " "),
        slug,
        description: "Demo course for testing the LMS workflow.",
        category: "Demo",
        level: "Beginner",
        thumbnail: "/images/demo-course-1.jpg",
        price: new Decimal("0"),
        status: "DRAFT",
      }
    });
    console.log("Created demo:", slug);
  }
  console.log("Seed complete.");
}
seed().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
