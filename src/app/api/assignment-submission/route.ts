import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { assertCourseContentAccess, isCourseAccessError } from "@/services/courseAccessService";
import { detectKind, putFile, removeStoredFile, UploadError } from "@/lib/storage/uploadFile";

export async function POST(req: NextRequest) {
  let storedKey = "";
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const assignmentId = formData.get("assignmentId") as string | null;

    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Never trust the client-supplied assignmentId: resolve its course and
    // confirm the caller may actually reach that course content.
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: { include: { module: { include: { course: true } } } } }
    });
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await assertCourseContentAccess(user.id, assignment.lesson.module.courseId);

    const kind = detectKind(file.name);
    if (!kind) {
      return NextResponse.json({ error: `Unsupported file type: "${file.name}".` }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putFile({ filename: file.name, body: buffer, contentType: file.type, kind });
    storedKey = stored.storageKey;

    // Submission records are written by the submitAssignment server action so the
    // upsert and grading status stay in one place; this route only persists bytes.
    return NextResponse.json({ url: stored.url, fileName: file.name, size: stored.size });
  } catch (e) {
    if (storedKey) await removeStoredFile(storedKey);
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (isCourseAccessError(e)) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg.includes("Unauthorized")) return NextResponse.json({ error: msg }, { status: 401 });
    if (msg.includes("Forbidden") || msg.includes("enroll")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
