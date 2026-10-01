import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { assertCourseContentAccess, CourseAccessError } from "@/services/courseAccessService";
import { putFile } from "@/lib/storage/uploadFile";
import { POST as uploadRoute } from "@/app/api/upload/route";
import { POST as submissionUploadRoute } from "@/app/api/assignment-submission/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: { findFirst: vi.fn(), update: vi.fn() },
    assignment: { findUnique: vi.fn() }
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
  requireInstructor: vi.fn()
}));

// Keep the real CourseAccessError + type guard so the route's 403 mapping is
// genuinely exercised rather than asserted against a stub.
vi.mock("@/services/courseAccessService", async () => {
  const actual = await vi.importActual<typeof import("@/services/courseAccessService")>(
    "@/services/courseAccessService"
  );
  return { ...actual, assertCourseContentAccess: vi.fn() };
});

vi.mock("@/lib/storage/uploadFile", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storage/uploadFile")>("@/lib/storage/uploadFile");
  return { ...actual, putFile: vi.fn(), removeStoredFile: vi.fn() };
});

const USER_ID = "instr-1";
const COURSE_ID = "c1";

function formRequest(fields: Record<string, string | File>): NextRequest {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new NextRequest("http://localhost/api/upload", { method: "POST", body: fd });
}

function file(name = "clip.mp4", type = "video/mp4"): File {
  return new File([Buffer.alloc(64, 0x61)], name, { type });
}

describe("POST /api/upload authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: USER_ID } as any);
    vi.mocked(putFile).mockResolvedValue({
      url: "/uploads/1-clip.mp4",
      storageKey: "1-clip.mp4",
      size: 64,
      inlined: false
    });
    vi.mocked(prisma.lesson.update).mockResolvedValue({} as any);
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "lesson-1" } as any);
  });

  it("rejects an unauthenticated caller before reading the file", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);
    const res = await uploadRoute(formRequest({ file: file(), lessonId: "lesson-1" }));
    expect(res.status).toBe(401);
    expect(putFile).not.toHaveBeenCalled();
  });

  it("refuses to overwrite a lesson the caller does not own", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue(null as any);
    const res = await uploadRoute(formRequest({ file: file(), lessonId: "lesson-1" }));
    expect(res.status).toBe(403);
    expect(putFile).not.toHaveBeenCalled();
    expect(prisma.lesson.update).not.toHaveBeenCalled();
  });

  it("resolves lesson ownership through the instructor relationship", async () => {
    await uploadRoute(formRequest({ file: file(), lessonId: "lesson-1" }));
    expect(prisma.lesson.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "lesson-1" })
      })
    );
  });

  it("updates the owned lesson with the stored url", async () => {
    await uploadRoute(formRequest({ file: file(), lessonId: "lesson-1" }));
    expect(prisma.lesson.update).toHaveBeenCalledWith({
      where: { id: "lesson-1" },
      data: { videoUrl: "/uploads/1-clip.mp4" }
    });
  });

  it("does not touch any lesson when lessonId is absent", async () => {
    const res = await uploadRoute(formRequest({ file: file() }));
    expect(res.status).toBe(200);
    expect(prisma.lesson.update).not.toHaveBeenCalled();
  });

  it("rejects a disallowed file type with 415", async () => {
    const res = await uploadRoute(formRequest({ file: file("payload.exe", "application/octet-stream") }));
    expect(res.status).toBe(415);
    expect(putFile).not.toHaveBeenCalled();
  });

  it("rejects a request with no file", async () => {
    const res = await uploadRoute(formRequest({ lessonId: "lesson-1" }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/assignment-submission authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "student-1" } as any);
    vi.mocked(assertCourseContentAccess).mockResolvedValue({ allowed: true } as any);
    vi.mocked(putFile).mockResolvedValue({
      url: "/uploads/1-work.pdf",
      storageKey: "1-work.pdf",
      size: 64,
      inlined: false
    });
    vi.mocked(prisma.assignment.findUnique).mockResolvedValue({
      id: "a1",
      lesson: { id: "l1", module: { courseId: COURSE_ID } }
    } as any);
  });

  it("rejects an unauthenticated caller", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);
    const res = await submissionUploadRoute(
      formRequest({ file: file("work.pdf", "application/pdf"), assignmentId: "a1" })
    );
    expect(res.status).toBe(401);
  });

  it("requires an assignmentId", async () => {
    const res = await submissionUploadRoute(formRequest({ file: file("work.pdf", "application/pdf") }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown assignment", async () => {
    vi.mocked(prisma.assignment.findUnique).mockResolvedValue(null as any);
    const res = await submissionUploadRoute(
      formRequest({ file: file("work.pdf", "application/pdf"), assignmentId: "a1" })
    );
    expect(res.status).toBe(404);
  });

  it("denies a student without course access", async () => {
    vi.mocked(assertCourseContentAccess).mockRejectedValue(
      new CourseAccessError("PURCHASE_REQUIRED")
    );
    const res = await submissionUploadRoute(
      formRequest({ file: file("work.pdf", "application/pdf"), assignmentId: "a1" })
    );
    expect(res.status).toBe(403);
    expect(putFile).not.toHaveBeenCalled();
  });

  it("stores the file for an authorised student and returns the url", async () => {
    const res = await submissionUploadRoute(
      formRequest({ file: file("work.pdf", "application/pdf"), assignmentId: "a1" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe("/uploads/1-work.pdf");
    expect(assertCourseContentAccess).toHaveBeenCalledWith("student-1", COURSE_ID);
  });

  it("rejects a disallowed submission file type", async () => {
    const res = await submissionUploadRoute(
      formRequest({ file: file("payload.exe", "application/octet-stream"), assignmentId: "a1" })
    );
    expect(res.status).toBe(415);
    expect(putFile).not.toHaveBeenCalled();
  });
});
