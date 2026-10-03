export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/helpers";
import NotesList from "./NotesList";

export const metadata: Metadata = { title: "My Notes", robots: { index: false, follow: false } };

export default async function NotesPage() {
  const user = await requireStudent();

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      lesson: { include: { module: { include: { course: { select: { id: true, title: true } } } } } }
    }
  });

  const items = notes.map((n) => ({
    id: n.id,
    content: n.content,
    updatedAt: n.updatedAt.toISOString(),
    lessonId: n.lessonId,
    lessonTitle: n.lesson.title,
    courseId: n.lesson.module.courseId,
    courseTitle: n.lesson.module.course.title
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Notes</h1>
        <p className="text-sm text-slate-500">Notes you have saved from lessons across your courses</p>
      </div>
      <NotesList notes={items} />
    </div>
  );
}
