import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  CourseNotFoundError,
  CoursePublishValidationError,
  publishCourse,
  setCourseStatus as serviceSetCourseStatus,
  togglePublish,
  unpublishCourse,
  validateCourseForPublish
} from "@/services/courses/instructor.service";
import {
  publishCourse as studioPublishCourse,
  setCourseStatus as studioSetCourseStatus
} from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { POST as publishRoute } from "@/app/api/courses/[courseId]/publish/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findUnique: vi.fn(), update: vi.fn() },
    courseInstructor: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() }
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

const COURSE_ID = "c1";
const INSTRUCTOR_ID = "instr-1";

interface CourseFixture {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  slug: string;
  modules: { id: string; lessons: { id: string }[] }[];
}

function courseFixture(
  moduleCount: number,
  lessonsPerModule: number,
  overrides: Partial<CourseFixture> = {}
): CourseFixture {
  return {
    id: COURSE_ID,
    title: "React Mastery",
    description: "Learn React from scratch",
    status: "DRAFT",
    slug: "react-mastery",
    modules: Array.from({ length: moduleCount }, (_, i) => ({
      id: `m${i}`,
      lessons: Array.from({ length: lessonsPerModule }, (_, j) => ({ id: `l${i}-${j}` }))
    })),
    ...overrides
  };
}

/** Session identity only; the DB record is the authority for role and isActive. */
function signIn(id: string | null, db: { role: string; isActive: boolean } | null) {
  vi.mocked(getCurrentUser).mockResolvedValue((id ? { id, role: db?.role } : null) as any);
  vi.mocked(prisma.user.findUnique).mockResolvedValue(db as any);
}

function signInAsAssignedInstructor() {
  signIn(INSTRUCTOR_ID, { role: "INSTRUCTOR", isActive: true });
  vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue({
    courseId: COURSE_ID,
    userId: INSTRUCTOR_ID
  } as any);
}

function publishRequest(body?: unknown) {
  return new NextRequest(`http://localhost/api/courses/${COURSE_ID}/publish`, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" }
  });
}

function routeParams() {
  return { params: Promise.resolve({ courseId: COURSE_ID }) };
}

async function body(res: Response) {
  return (await res.json()) as { error?: string };
}

describe("canonical publish validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAsAssignedInstructor();
    vi.mocked(prisma.course.update).mockResolvedValue({
      id: COURSE_ID,
      status: "PUBLISHED",
      slug: "react-mastery"
    } as any);
  });

  it("publishes a valid course", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    await publishCourse(COURSE_ID);

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "PUBLISHED" }
    });
  });

  it("publishes a course with multiple modules and lessons", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(3, 4) as any);

    await publishCourse(COURSE_ID);

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "PUBLISHED" }
    });
  });

  it("rejects a course with zero modules and never writes PUBLISHED", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0) as any);

    await expect(publishCourse(COURSE_ID)).rejects.toBeInstanceOf(CoursePublishValidationError);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("rejects a course whose modules have zero lessons and never writes PUBLISHED", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(2, 0) as any);

    await expect(publishCourse(COURSE_ID)).rejects.toThrow(/at least one lesson/i);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("rejects a course missing title or description", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(
      courseFixture(1, 1, { description: null }) as any
    );

    await expect(publishCourse(COURSE_ID)).rejects.toBeInstanceOf(CoursePublishValidationError);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("rejects a course that does not exist", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

    await expect(publishCourse(COURSE_ID)).rejects.toBeInstanceOf(CourseNotFoundError);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("validateCourseForPublish returns the validated course", async () => {
    const course = courseFixture(1, 2);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(course as any);

    await expect(validateCourseForPublish(COURSE_ID)).resolves.toMatchObject({ id: COURSE_ID });
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("setCourseStatus(PUBLISHED) routes through the same canonical validation", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0) as any);

    await expect(serviceSetCourseStatus(COURSE_ID, "PUBLISHED")).rejects.toBeInstanceOf(
      CoursePublishValidationError
    );
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("the retired unvalidated toggle path can no longer publish an invalid course", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0, { status: "DRAFT" }) as any);

    await expect(togglePublish(COURSE_ID)).rejects.toBeInstanceOf(CoursePublishValidationError);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });
});

describe("publish authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.course.update).mockResolvedValue({
      id: COURSE_ID,
      status: "PUBLISHED",
      slug: "react-mastery"
    } as any);
  });

  it("denies a user whose database role is not an editor", async () => {
    signIn("student-1", { role: "STUDENT", isActive: true });
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(403);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("denies an instructor who is not assigned to the course", async () => {
    signIn("instr-2", { role: "INSTRUCTOR", isActive: true });
    vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(403);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("denies a stale session whose database role was demoted", async () => {
    signIn("instr-1", { role: "STUDENT", isActive: true });
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(403);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("denies an inactive editor", async () => {
    signIn(INSTRUCTOR_ID, { role: "INSTRUCTOR", isActive: false });
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(403);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("denies an unauthenticated caller", async () => {
    signIn(null, null);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(401);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("Course Studio rejects an unauthorized publish without writing", async () => {
    signIn("instr-2", { role: "INSTRUCTOR", isActive: true });
    vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    await expect(studioPublishCourse(COURSE_ID)).rejects.toThrow(/Forbidden/i);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });
});

describe("Course Studio publish uses the canonical validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAsAssignedInstructor();
    vi.mocked(prisma.course.update).mockResolvedValue({
      id: COURSE_ID,
      status: "PUBLISHED",
      slug: "react-mastery"
    } as any);
  });

  it("publishes a valid course and revalidates the studio paths", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(2, 2) as any);

    await studioPublishCourse(COURSE_ID);

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "PUBLISHED" }
    });
  });

  it("rejects a course with zero modules", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0) as any);

    await expect(studioPublishCourse(COURSE_ID)).rejects.toThrow(/at least one module/i);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("rejects a course whose modules have zero lessons", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 0) as any);

    await expect(studioSetCourseStatus(COURSE_ID, "PUBLISHED")).rejects.toThrow(/at least one lesson/i);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("does not duplicate the validation query in the action layer", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    await studioPublishCourse(COURSE_ID);

    expect(prisma.course.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe("publish API route shares the same validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAsAssignedInstructor();
    vi.mocked(prisma.course.update).mockResolvedValue({
      id: COURSE_ID,
      status: "PUBLISHED",
      slug: "react-mastery"
    } as any);
  });

  it("publishes a valid course", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(200);
    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "PUBLISHED" }
    });
  });

  it("returns 422 and never publishes a course with zero modules", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0) as any);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(422);
    expect(await body(res)).toMatchObject({ error: expect.stringMatching(/at least one module/i) });
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("returns 422 and never publishes a course whose modules have zero lessons", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(2, 0) as any);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(422);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("returns 404 for a course that does not exist", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

    const res = await publishRoute(publishRequest({ action: "publish" }), routeParams());

    expect(res.status).toBe(404);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("rejects an unsupported action", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1) as any);

    const res = await publishRoute(publishRequest({ action: "destroy" }), routeParams());

    expect(res.status).toBe(400);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });
});

describe("unpublish and already-published behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAsAssignedInstructor();
    vi.mocked(prisma.course.update).mockResolvedValue({
      id: COURSE_ID,
      status: "DRAFT",
      slug: "react-mastery"
    } as any);
  });

  it("unpublishes without requiring modules or lessons", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0) as any);

    await unpublishCourse(COURSE_ID);

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "DRAFT" }
    });
  });

  it("Course Studio can move a published course back to DRAFT", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0, { status: "PUBLISHED" }) as any);

    await studioSetCourseStatus(COURSE_ID, "DRAFT");

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "DRAFT" }
    });
  });

  it("the API unpublish action moves a published course to DRAFT", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0, { status: "PUBLISHED" }) as any);

    const res = await publishRoute(publishRequest({ action: "unpublish" }), routeParams());

    expect(res.status).toBe(200);
    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "DRAFT" }
    });
  });

  it("toggling an already published course unpublishes it instead of failing validation", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0, { status: "PUBLISHED" }) as any);

    const res = await publishRoute(publishRequest(), routeParams());

    expect(res.status).toBe(200);
    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "DRAFT" }
    });
  });

  it("republishing an already published course revalidates and stays PUBLISHED", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(1, 1, { status: "PUBLISHED" }) as any);

    await publishCourse(COURSE_ID);

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { status: "PUBLISHED" }
    });
  });

  it("republishing an already published course that lost its content is rejected", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(courseFixture(0, 0, { status: "PUBLISHED" }) as any);

    await expect(publishCourse(COURSE_ID)).rejects.toBeInstanceOf(CoursePublishValidationError);
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("toggling an unknown course returns null without writing", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

    await expect(togglePublish(COURSE_ID)).resolves.toBeNull();
    expect(prisma.course.update).not.toHaveBeenCalled();
  });
});