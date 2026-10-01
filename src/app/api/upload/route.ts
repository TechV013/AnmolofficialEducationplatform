import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { detectKind, putFile, removeStoredFile, UploadError } from "@/lib/storage/uploadFile";

export async function POST(req: NextRequest) {
  let storedKey = "";
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("video")) as File | null;
    const lessonId = formData.get("lessonId") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Verify lesson ownership from the lesson itself; never trust a client id.
    let ownedLesson: { id: string } | null = null;
    if (lessonId) {
      ownedLesson = await prisma.lesson.findFirst({
        where: { id: lessonId, module: { course: { instructors: { some: { userId: user.id } } } } },
        select: { id: true }
      });
      if (!ownedLesson) {
        return NextResponse.json({ error: "Forbidden: lesson ownership validation failed" }, { status: 403 });
      }
    }

    const kind = detectKind(file.name);
    if (!kind) {
      return NextResponse.json({ error: `Unsupported file type: "${file.name}".` }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putFile({ filename: file.name, body: buffer, contentType: file.type, kind });
    storedKey = stored.storageKey;

    if (ownedLesson) {
      try {
        await prisma.lesson.update({
          where: { id: ownedLesson.id },
          data: { videoUrl: stored.url }
        });
      } catch (dbErr) {
        // Do not leave an orphaned file behind when the lesson write fails.
        await removeStoredFile(stored.storageKey);
        storedKey = "";
        throw dbErr;
      }
    }

    return NextResponse.json({
      url: stored.url,
      videoUrl: stored.url,
      fileName: file.name,
      size: stored.size
    });
  } catch (e) {
    if (storedKey) await removeStoredFile(storedKey);
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg.includes("Forbidden")) return NextResponse.json({ error: msg }, { status: 403 });
    if (msg.includes("Unauthorized")) return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
