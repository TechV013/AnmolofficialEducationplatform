import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/auth/helpers";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const MAX_SIZE = 1024 * 1024 * 1024; // 1GB
const UPLOAD_DIR = join(process.cwd(), "public/uploads");

export async function POST(req: NextRequest) {
  try {
    await requireInstructor();
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("video")) as File | null;
    const lessonId = formData.get("lessonId") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File exceeds 1GB limit" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    let fileUrl = `/uploads/${fileName}`;

    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(join(UPLOAD_DIR, fileName), buffer);
    } catch (fsErr) {
      // Vercel serverless read-only filesystem fallback: convert to base64 Data URI
      console.warn("Filesystem write failed (likely serverless read-only environment), falling back to data URI:", fsErr);
      const base64 = buffer.toString("base64");
      fileUrl = `data:${file.type || "application/octet-stream"};base64,${base64}`;
    }

    if (lessonId) {
      await prisma.lesson.update({
        where: { id: lessonId },
        data: { videoUrl: fileUrl }
      });
    }

    return NextResponse.json({ url: fileUrl, videoUrl: fileUrl, fileName });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg.includes("Forbidden")) return NextResponse.json({ error: msg }, { status: 403 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
