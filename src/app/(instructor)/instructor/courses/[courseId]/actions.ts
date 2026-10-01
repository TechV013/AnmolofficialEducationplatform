"use server";
import { prisma } from "@/lib/prisma";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { getCurrentUser } from "@/lib/auth/helpers";
import { Decimal } from "@prisma/client/runtime/library";
import { CourseStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
    isAllowedResourceExtension,
    isValidResourceUrl,
    type StudioResourceType
} from "@/lib/resource/validateResourceUrl";
import { findSwapTarget } from "@/lib/course-studio";

function revalidateCourse(course: { id: string; slug?: string }) {
  revalidatePath(`/instructor/courses/${course.id}`);
  revalidatePath("/instructor/courses");
  revalidatePath("/admin/courses");
  if (course.slug) {
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath(`/courses`);
  }
}

function checkAuth(courseId: string) {
    return requireCourseEditor(courseId);
}

async function validateOptionOwnership(courseId: string, optionId: string) {
  const option = await prisma.option.findFirst({
    where: {
      id: optionId,
      question: { quiz: { lesson: { module: { courseId } } } }
    }
  });
  if (!option) throw new Error("Forbidden: Option ownership validation failed");
}

async function validateQuestionOwnershipForAction(courseId: string, questionId: string) {
    const question = await prisma.question.findFirst({
        where: { id: questionId, quiz: { lesson: { module: { courseId } } } }
    });
    if (!question) throw new Error("Forbidden: Question ownership validation failed");
}

async function validateQuizOwnership(courseId: string, quizId: string) {
    const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, lesson: { module: { courseId } } }
    });
    if (!quiz) throw new Error("Forbidden: Quiz ownership validation failed");
}

// Module CRUD
export async function createModule(courseId: string, title: string) {
    await checkAuth(courseId);
    const max = await prisma.module.aggregate({ where: { courseId }, _max: { position: true } });
    await prisma.module.create({ data: { courseId, title, position: (max._max.position ?? -1) + 1 } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function updateModule(id: string, title: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.module.update({ where: { id }, data: { title } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteModule(id: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.module.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Lesson CRUD
export async function createLesson(moduleId: string, title: string, description: string, duration: string, videoUrl: string | null, courseId: string) {
    await checkAuth(courseId);
    const max = await prisma.lesson.aggregate({ where: { moduleId }, _max: { position: true } });
    const lesson = await prisma.lesson.create({ data: { moduleId, title, description, duration, videoUrl: videoUrl || null, position: (max._max.position ?? -1) + 1 } });
    revalidatePath(`/instructor/courses/${courseId}`);
    return lesson.id;
}
export async function updateLesson(id: string, title: string, description: string, videoUrl: string | null, courseId: string, duration?: string) {
    await checkAuth(courseId);
    await prisma.lesson.update({ where: { id }, data: { title, description, videoUrl: videoUrl || null, ...(duration !== undefined ? { duration } : {}) } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteLesson(id: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.lesson.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Resource Actions
async function validateResourceOwnership(courseId: string, resourceId: string) {
    const resource = await prisma.resource.findFirst({
        where: { id: resourceId, lesson: { module: { courseId } } }
    });
    if (!resource) throw new Error("Forbidden: Resource ownership validation failed");
}

function validateResourceInput(title: string, type: StudioResourceType, url: string) {
    if (!title || !title.trim()) throw new Error("Invalid resource: a title is required");
    if (!isValidResourceUrl(url)) {
        throw new Error("Invalid resource URL: use a full http(s) link or upload a file");
    }
    if (!isAllowedResourceExtension(type, url)) {
        throw new Error(`Invalid ${type} resource: the uploaded file type does not match`);
    }
}

export async function createResource(lessonId: string, title: string, type: StudioResourceType, url: string, courseId: string) {
    await checkAuth(courseId);
    const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, module: { courseId } }
    });
    if (!lesson) throw new Error("Forbidden: Lesson ownership validation failed");
    validateResourceInput(title, type, url);
    await prisma.resource.create({ data: { lessonId, title: title.trim(), type, url: url.trim() } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

export async function updateResource(id: string, title: string, type: StudioResourceType, url: string, courseId: string) {
    await checkAuth(courseId);
    await validateResourceOwnership(courseId, id);
    validateResourceInput(title, type, url);
    await prisma.resource.update({ where: { id }, data: { title: title.trim(), type, url: url.trim() } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

export async function deleteResource(id: string, courseId: string) {
    await checkAuth(courseId);
    await validateResourceOwnership(courseId, id);
    await prisma.resource.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Curriculum Ordering
// Modules and Lessons both persist an ascending `position` protected by a unique
// index (Module.courseId+position, Lesson.moduleId+position). A naive two-way
// swap violates that index because it is validated per statement, even inside a
// transaction, so the target is parked on a guaranteed-free sentinel slot first.
async function moveModule(courseId: string, moduleId: string, direction: -1 | 1) {
    await checkAuth(courseId);

    const owned = await prisma.module.findFirst({
        where: { id: moduleId, courseId },
        select: { id: true }
    });
    if (!owned) throw new Error("Forbidden: Module ownership validation failed");

    const ordered = await prisma.module.findMany({
        where: { courseId },
        orderBy: { position: "asc" },
        select: { id: true, position: true }
    });

    const plan = findSwapTarget(ordered, moduleId, direction);
    if (!plan) return { moved: false };

    await prisma.$transaction(async (tx) => {
        await tx.module.update({ where: { id: plan.target.id }, data: { position: plan.sentinel } });
        await tx.module.update({ where: { id: plan.current.id }, data: { position: plan.target.position } });
        await tx.module.update({ where: { id: plan.target.id }, data: { position: plan.current.position } });
    });

    revalidatePath(`/instructor/courses/${courseId}`);
    return { moved: true };
}

export async function moveModuleUp(courseId: string, moduleId: string) {
    return moveModule(courseId, moduleId, -1);
}

export async function moveModuleDown(courseId: string, moduleId: string) {
    return moveModule(courseId, moduleId, 1);
}

async function moveLesson(courseId: string, moduleId: string, lessonId: string, direction: -1 | 1) {
    await checkAuth(courseId);

    const ownedModule = await prisma.module.findFirst({
        where: { id: moduleId, courseId },
        select: { id: true }
    });
    if (!ownedModule) throw new Error("Forbidden: Module ownership validation failed");

    const ordered = await prisma.lesson.findMany({
        where: { moduleId },
        orderBy: { position: "asc" },
        select: { id: true, position: true }
    });
    if (!ordered.some((lesson) => lesson.id === lessonId)) {
        throw new Error("Forbidden: Lesson ownership validation failed");
    }

    const plan = findSwapTarget(ordered, lessonId, direction);
    if (!plan) return { moved: false };

    await prisma.$transaction(async (tx) => {
        await tx.lesson.update({ where: { id: plan.target.id }, data: { position: plan.sentinel } });
        await tx.lesson.update({ where: { id: plan.current.id }, data: { position: plan.target.position } });
        await tx.lesson.update({ where: { id: plan.target.id }, data: { position: plan.current.position } });
    });

    revalidatePath(`/instructor/courses/${courseId}`);
    return { moved: true };
}

export async function moveLessonUp(courseId: string, moduleId: string, lessonId: string) {
    return moveLesson(courseId, moduleId, lessonId, -1);
}

export async function moveLessonDown(courseId: string, moduleId: string, lessonId: string) {
    return moveLesson(courseId, moduleId, lessonId, 1);
}

// Assignment Actions
export async function createAssignment(lessonId: string, instructions: string, dueDate: string | null, courseId: string) {
    await checkAuth(courseId);

    const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, module: { courseId } }
    });
    if (!lesson) throw new Error("Forbidden: Lesson ownership validation failed");

    const existing = await prisma.assignment.findUnique({ where: { lessonId } });
    if (existing) throw new Error("This lesson already has an assignment.");

    await prisma.assignment.create({
        data: {
            lessonId,
            instructions,
            dueDate: dueDate ? new Date(dueDate) : null
        }
    });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Create a lesson and its 1:1 assignment atomically (no orphan lesson/assignment records)
export async function createAssignmentLesson(moduleId: string, title: string, description: string, instructions: string, dueDate: string | null, courseId: string) {
    await checkAuth(courseId);

    const courseModule = await prisma.module.findFirst({ where: { id: moduleId, courseId } });
    if (!courseModule) throw new Error("Forbidden: Module ownership validation failed");
    if (!instructions.trim()) throw new Error("Instructions are required");

    await prisma.$transaction(async (tx) => {
        const max = await tx.lesson.aggregate({ where: { moduleId }, _max: { position: true } });
        await tx.lesson.create({
            data: {
                moduleId,
                title: title.trim(),
                description,
                duration: "",
                videoUrl: null,
                position: (max._max.position ?? -1) + 1,
                assignment: { create: { instructions: instructions.trim(), dueDate: dueDate ? new Date(dueDate) : null } }
            }
        });
    });
    revalidatePath(`/instructor/courses/${courseId}`);
}

export async function updateAssignment(assignmentId: string, instructions: string, dueDate: string | null, courseId: string) {
    await checkAuth(courseId);

    const assignment = await prisma.assignment.findFirst({
        where: { id: assignmentId, lesson: { module: { courseId } } }
    });
    if (!assignment) throw new Error("Forbidden: Assignment ownership validation failed");

    await prisma.assignment.update({
        where: { id: assignmentId },
        data: { instructions: instructions.trim(), dueDate: dueDate ? new Date(dueDate) : null }
    });
    revalidatePath(`/instructor/courses/${courseId}`);
}

export async function deleteAssignment(id: string, courseId: string) {
    await checkAuth(courseId);

    const assignment = await prisma.assignment.findFirst({
        where: { id, lesson: { module: { courseId } } }
    });
    if (!assignment) throw new Error("Forbidden: Assignment ownership validation failed");

    await prisma.assignment.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Grade a student's assignment submission (private score + feedback)
export async function gradeSubmission(submissionId: string, courseId: string, score: number, feedback: string) {
    await checkAuth(courseId);

    const submission = await prisma.assignmentSubmission.findFirst({
        where: { id: submissionId, assignment: { lesson: { module: { courseId } } } }
    });
    if (!submission) throw new Error("Forbidden: Submission ownership validation failed");

    await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: { score, feedback, status: "REVIEWED", reviewedAt: new Date() }
    });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Status management with pre-validation for publish
export async function setCourseStatus(courseId: string, status: CourseStatus) {
    await checkAuth(courseId);

    if (status === "PUBLISHED") {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { modules: { include: { lessons: true } } }
        });
        if (!course) throw new Error("Course not found");
        if (!course.title || !course.description) throw new Error("Course needs title and description");
        const moduleCount = course.modules.length;
        if (moduleCount === 0) throw new Error("Add at least one module before publishing");
        const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        if (lessonCount === 0) throw new Error("Add at least one lesson before publishing");
    }

    const updated = await prisma.course.update({ where: { id: courseId }, data: { status } });
    revalidateCourse(updated);
}

export async function publishCourse(courseId: string) {
    return setCourseStatus(courseId, "PUBLISHED");
}

// Instructor (and admin) can create courses — the creator becomes the author/editor
export async function createCourse(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } });
    if (!dbUser || !dbUser.isActive || !["ADMIN", "INSTRUCTOR"].includes(dbUser.role)) {
        throw new Error("Forbidden: Role mismatch");
    }

    const data = Object.fromEntries(formData);
    const { title, description, price, category, level, thumbnail, slug, promoVideoUrl } = data as {
        title: string; description: string; price: string; category: string; level: string; thumbnail: string; slug: string; promoVideoUrl?: string;
    };
    if (!title || !title.trim()) throw new Error("Title is required");

    const cleanTitle = title.trim();
    const cleanSlug = slug.trim() || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!cleanSlug) throw new Error("Slug is required");
    const existing = await prisma.course.findUnique({ where: { slug: cleanSlug } });
    if (existing) throw new Error("A course with this slug already exists");

    const course = await prisma.course.create({
        data: {
            title: cleanTitle,
            description: description?.trim(),
            price: new Decimal(Math.max(0, parseFloat(price) || 0)),
            category: category?.trim() || "General",
            level: level?.trim() || "Beginner",
            thumbnail: thumbnail?.trim(),
            promoVideoUrl: promoVideoUrl?.trim() || null,
            slug: cleanSlug,
            status: "DRAFT"
        }
    });

    if (dbUser.role === "INSTRUCTOR") {
        await prisma.courseInstructor.create({ data: { courseId: course.id, userId: user.id } });
    }

    revalidatePath("/instructor/courses");
    revalidatePath("/admin/courses");
    return course.id;
}

// Course Intro Video (course-level preview, separate from curriculum lessons)
export async function updateCourseIntroVideo(courseId: string, promoVideoUrl: string | null) {
    await checkAuth(courseId);

    const updated = await prisma.course.update({
        where: { id: courseId },
        data: { promoVideoUrl: promoVideoUrl?.trim() || null }
    });
    revalidateCourse(updated);
    return updated.id;
}

// Edit course settings
export async function updateCourse(courseId: string, data: {
    title: string; description: string; category: string; level: string; thumbnail: string; slug: string; promoVideoUrl?: string | null;
}) {
    await checkAuth(courseId);

    const title = data.title.trim();
    const slug = data.slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!title) throw new Error("Title is required");
    if (!slug) throw new Error("Slug is required");

    const taken = await prisma.course.findFirst({ where: { slug, id: { not: courseId } } });
    if (taken) throw new Error("A course with this slug already exists");

    const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
            title,
            slug,
            description: data.description.trim(),
            category: data.category.trim() || "General",
            level: data.level.trim() || "Beginner",
            thumbnail: data.thumbnail.trim(),
            promoVideoUrl: data.promoVideoUrl?.trim() || null
        }
    });
    revalidateCourse(updated);
    return updated.id;
}

// Quiz Authoring Actions
export async function createQuiz(lessonId: string, courseId: string) {
    await checkAuth(courseId);

    const lesson = await prisma.lesson.findFirst({
        where: {
            id: lessonId,
            module: {
                courseId,
            },
        },
    });

    if (!lesson) {
        throw new Error("Forbidden: Lesson ownership validation failed");
    }

    const existingQuiz = await prisma.quiz.findUnique({
        where: { lessonId },
    });

    if (existingQuiz) {
        throw new Error("A quiz already exists for this lesson.");
    }

    await prisma.quiz.create({ data: { lessonId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteQuiz(quizId: string, courseId: string) {
    await checkAuth(courseId);
    await validateQuizOwnership(courseId, quizId);
    await prisma.quiz.delete({ where: { id: quizId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function addQuestion(quizId: string, text: string, courseId: string) {
    await checkAuth(courseId);
    await validateQuizOwnership(courseId, quizId);
    await prisma.question.create({ data: { quizId, text } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function updateQuestion(questionId: string, text: string, courseId: string) {
    await checkAuth(courseId);
    await validateQuestionOwnershipForAction(courseId, questionId);
    await prisma.question.update({ where: { id: questionId }, data: { text } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteQuestion(questionId: string, courseId: string) {
    await checkAuth(courseId);
    await validateQuestionOwnershipForAction(courseId, questionId);
    await prisma.question.delete({ where: { id: questionId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function addOption(questionId: string, text: string, isCorrect: boolean, courseId: string) {
    await checkAuth(courseId);
    await validateQuestionOwnershipForAction(courseId, questionId);
    await prisma.option.create({ data: { questionId, text, isCorrect } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function updateOption(optionId: string, text: string, isCorrect: boolean, courseId: string) {
    await checkAuth(courseId);
    await validateOptionOwnership(courseId, optionId);
    await prisma.option.update({ where: { id: optionId }, data: { text, isCorrect } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteOption(optionId: string, courseId: string) {
    await checkAuth(courseId);
    await validateOptionOwnership(courseId, optionId);
    await prisma.option.delete({ where: { id: optionId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
