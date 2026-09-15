import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function seedDemo() {
  // Demo users — passwords must be set from env or manual step (NOT hardcoded)
  const demoUsers = [
    { email: "student.demo@anmolofficial.com", name: "Demo Student", role: "STUDENT" as const, passwordEnv: "DEMO_STUDENT_PASSWORD" },
    { email: "instructor.demo@anmolofficial.com", name: "Demo Instructor", role: "INSTRUCTOR" as const, passwordEnv: "DEMO_INSTRUCTOR_PASSWORD" },
    { email: "admin.demo@anmolofficial.com", name: "Demo Admin", role: "ADMIN" as const, passwordEnv: "DEMO_ADMIN_PASSWORD" },
  ];

  for (const u of demoUsers) {
    const pw = process.env[u.passwordEnv];
    if (!pw) {
      console.log("SKIP", u.email, "— set", u.passwordEnv, "in env (not hardcoded)");
      continue;
    }
    const hash = await bcrypt.hash(pw, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash: hash },
      create: { email: u.email, name: u.name, role: u.role, passwordHash: hash },
    });
    console.log("Upserted demo user:", u.email, "role:", u.role);
  }

  // 4 demo courses (already defined in prior seed; reuse slug-check logic)
  const demoSlugs = [
    "demo-creative-design-foundations",
    "demo-fullstack-web-essentials",
    "demo-python-beginners",
    "demo-3d-maya",
  ];
  for (const slug of demoSlugs) {
    const exists = await prisma.course.findUnique({ where: { slug } });
    if (exists) { console.log("Skip existing course:", slug); continue; }
    await prisma.course.create({
      data: {
        title: "DEMO — " + slug.replace("demo-", "").replace(/-/g, " "),
        slug,
        description: "Demo course for testing.",
        category: "Demo",
        level: "Beginner",
        thumbnail: "/images/demo-course-1.jpg",
        price: 0,
        status: "DRAFT",
      },
    });
    console.log("Created demo course:", slug);
  }

  // Assign instructor to first 2 demo courses (if instructor exists)
  const instructor = await prisma.user.findUnique({ where: { email: "instructor.demo@anmolofficial.com" } });
  if (instructor) {
    const courses = await prisma.course.findMany({ where: { slug: { in: ["demo-creative-design-foundations", "demo-fullstack-web-essentials"] } } });
    for (const c of courses) {
      await prisma.courseInstructor.upsert({
        where: { courseId_userId: { courseId: c.id, userId: instructor.id } },
        update: {},
        create: { courseId: c.id, userId: instructor.id },
      });
      console.log("Assigned instructor to:", c.slug);
    }
  }

  console.log("Role/demo seed complete.");
}

seedDemo().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
