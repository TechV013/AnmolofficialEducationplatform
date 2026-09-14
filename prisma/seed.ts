import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
const prisma = new PrismaClient();

async function seed() {
  const courses = [
    {
      slug: "demo-creative-design-foundations",
      title: "DEMO — Creative Design Foundations",
      description: "A beginner-friendly introduction to visual composition, typography, color, layout, and practical digital design.",
      category: "Design",
      level: "Beginner",
      thumbnail: "/images/demo-course-1.jpg"
    },
    {
      slug: "demo-fullstack-web-essentials",
      title: "DEMO — Full-Stack Web Development Essentials",
      description: "Learn how modern web applications are structured, including frontend development, APIs, databases, authentication, deployment, and practical project workflows.",
      category: "Web Development",
      level: "Intermediate",
      thumbnail: "/images/demo-course-2.jpg"
    }
  ];

  for (const c of courses) {
    const existing = await prisma.course.findUnique({ where: { slug: c.slug } });
    if (existing) { console.log("Skip existing course:", c.slug); continue; }
    const course = await prisma.course.create({
      data: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        category: c.category,
        level: c.level,
        thumbnail: c.thumbnail,
        price: new Decimal("0"),
        status: "DRAFT"
      }
    });
    console.log("Created course:", course.slug, "id:", course.id);

    // Create module
    const module_ = await prisma.module.create({
      data: {
        courseId: course.id,
        title: "Getting Started",
        position: 0
      }
    });
    console.log("Created module:", module_.title);

    // Create lessons
    const lesson1 = await prisma.lesson.create({
      data: {
        moduleId: module_.id,
        title: "Introduction and Learning Goals",
        description: "Overview of the course and what you will learn.",
        duration: "10 min",
        position: 0,
        type: "VIDEO",
        videoUrl: null
      }
    });
    const lesson2 = await prisma.lesson.create({
      data: {
        moduleId: module_.id,
        title: "Core Concepts",
        description: "Fundamentals of visual design.",
        duration: "15 min",
        position: 1,
        type: "VIDEO",
        videoUrl: null
      }
    });
    console.log("Created lessons:", lesson1.title, lesson2.title);

    // Create resource
    await prisma.resource.create({
      data: {
        lessonId: lesson1.id,
        title: "Design Basics PDF",
        type: "PDF",
        url: "https://example.com/design-basics.pdf"
      }
    });
    console.log("Created resource for lesson 1");

    // Create quiz
    const quiz = await prisma.quiz.create({ data: { lessonId: lesson1.id } });
    console.log("Created quiz for lesson 1");

    // Create questions and options
    const q1 = await prisma.question.create({ data: { quizId: quiz.id, text: "What is the first principle of visual composition?" } });
    await prisma.option.createMany({ data: [
      { questionId: q1.id, text: "Balance", isCorrect: true },
      { questionId: q1.id, text: "Speed", isCorrect: false },
      { questionId: q1.id, text: "Complexity", isCorrect: false },
      { questionId: q1.id, text: "Color", isCorrect: false }
    ]});

    const q2 = await prisma.question.create({ data: { quizId: quiz.id, text: "Which element is NOT a primary color?" } });
    await prisma.option.createMany({ data: [
      { questionId: q2.id, text: "Red", isCorrect: false },
      { questionId: q2.id, text: "Blue", isCorrect: false },
      { questionId: q2.id, text: "Green", isCorrect: true },
      { questionId: q2.id, text: "Yellow", isCorrect: false }
    ]});
    console.log("Created questions and options");

    // Create assignment
    await prisma.assignment.create({
      data: {
        lessonId: lesson1.id,
        instructions: "Create a short visual design exercise demonstrating balance and contrast."
      }
    });
    console.log("Created assignment");
  }
  console.log("Demo content seed complete.");
}

seed().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
