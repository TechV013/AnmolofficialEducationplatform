import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { assertCourseContentAccess } from "@/services/courseAccessService";
import { submitAssignment } from "@/app/classroom/actions";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assignment: { findUnique: vi.fn() },
    assignmentSubmission: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    note: { upsert: vi.fn() },
    lesson: { findUnique: vi.fn() },
    userProgress: { findMany: vi.fn() }
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
  requireInstructor: vi.fn()
}));

vi.mock("@/services/courseAccessService", () => ({
  assertCourseContentAccess: vi.fn()
}));

vi.mock("@/services/progressService", () => ({
  getCourseCompletionStatus: vi.fn(),
  saveLessonProgress: vi.fn()
}));

vi.mock("@/services/certificates/certificate.service", () => ({
  issueCertificate: vi.fn(),
  getCertificate: vi.fn()
}));

const ASSIGNMENT_ID = "a1";
const COURSE_ID = "c1";
const USER_ID = "u1";

function signInAs(userId = USER_ID) {
  vi.mocked(getCurrentUser).mockResolvedValue({ id: userId } as any);
}

function assignmentExists(courseId = COURSE_ID) {
  vi.mocked(prisma.assignment.findUnique).mockResolvedValue({
    id: ASSIGNMENT_ID,
    lesson: { id: "l1", module: { courseId } }
  } as any);
}

describe("student assignment submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertCourseContentAccess).mockResolvedValue({ allowed: true } as any);
    vi.mocked(prisma.assignmentSubmission.create).mockResolvedValue({} as any);
    vi.mocked(prisma.assignmentSubmission.update).mockResolvedValue({} as any);
    signInAs();
    assignmentExists();
  });

  it("requires an authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);
    await expect(submitAssignment(ASSIGNMENT_ID, "answer")).rejects.toThrow(/Unauthorized/i);
    expect(prisma.assignmentSubmission.create).not.toHaveBeenCalled();
  });

  it("rejects an unknown assignment", async () => {
    vi.mocked(prisma.assignment.findUnique).mockResolvedValue(null as any);
    await expect(submitAssignment(ASSIGNMENT_ID, "answer")).rejects.toThrow(/not found/i);
  });

  it("checks course access resolved from the assignment, not the client", async () => {
    await submitAssignment(ASSIGNMENT_ID, "answer");
    expect(assertCourseContentAccess).toHaveBeenCalledWith(USER_ID, COURSE_ID);
  });

  it("propagates an access denial instead of writing a submission", async () => {
    vi.mocked(assertCourseContentAccess).mockRejectedValue(new Error("Purchase required to access this content"));
    await expect(submitAssignment(ASSIGNMENT_ID, "answer")).rejects.toThrow(/Purchase required/i);
    expect(prisma.assignmentSubmission.create).not.toHaveBeenCalled();
    expect(prisma.assignmentSubmission.update).not.toHaveBeenCalled();
  });

  it("creates a SUBMITTED row on first submission", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue(null as any);

    await submitAssignment(ASSIGNMENT_ID, "my answer");

    expect(prisma.assignmentSubmission.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        assignmentId: ASSIGNMENT_ID,
        userId: USER_ID,
        status: "SUBMITTED"
      })
    });
  });

  it("updates the existing row instead of creating a duplicate", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue({ id: "s1", status: "SUBMITTED" } as any);

    await submitAssignment(ASSIGNMENT_ID, "revised answer");

    expect(prisma.assignmentSubmission.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "s1" } })
    );
    expect(prisma.assignmentSubmission.create).not.toHaveBeenCalled();
  });

  it("scopes the lookup to the current user so students cannot overwrite each other", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue(null as any);
    await submitAssignment(ASSIGNMENT_ID, "answer");
    expect(prisma.assignmentSubmission.findFirst).toHaveBeenCalledWith({
      where: { assignmentId: ASSIGNMENT_ID, userId: USER_ID }
    });
  });

  it("persists a typed answer without mislabelling it as a file", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue(null as any);

    await submitAssignment(ASSIGNMENT_ID, "my typed answer");

    const arg = vi.mocked(prisma.assignmentSubmission.create).mock.calls[0][0] as any;
    expect(arg.data.fileUrl.startsWith("data:text/plain")).toBe(true);
    expect(decodeURIComponent(arg.data.fileUrl.split(",")[1])).toBe("my typed answer");
  });

  it("prefers the uploaded file URL over the typed answer", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue(null as any);

    await submitAssignment(ASSIGNMENT_ID, "see attached", "/uploads/1-work.pdf");

    const arg = vi.mocked(prisma.assignmentSubmission.create).mock.calls[0][0] as any;
    expect(arg.data.fileUrl).toBe("/uploads/1-work.pdf");
  });

  it("rejects an empty submission", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue(null as any);
    await expect(submitAssignment(ASSIGNMENT_ID, "   ", null)).rejects.toThrow(/Nothing to submit/i);
    expect(prisma.assignmentSubmission.create).not.toHaveBeenCalled();
  });

  it("keeps an instructor grade intact when a student resubmits", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue({ id: "s1", status: "REVIEWED" } as any);

    await submitAssignment(ASSIGNMENT_ID, "improved version");

    const arg = vi.mocked(prisma.assignmentSubmission.update).mock.calls[0][0] as any;
    expect(arg.data.status).toBe("REVIEWED");
    expect(arg.data).not.toHaveProperty("score");
  });

  it("resets an already-reviewed row to SUBMITTED only when it was never graded", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue({ id: "s1", status: "NOT_SUBMITTED" } as any);
    await submitAssignment(ASSIGNMENT_ID, "answer");
    const arg = vi.mocked(prisma.assignmentSubmission.update).mock.calls[0][0] as any;
    expect(arg.data.status).toBe("SUBMITTED");
  });
});
