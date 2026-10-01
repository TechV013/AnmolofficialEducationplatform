import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  moveModuleUp,
  moveModuleDown,
  moveLessonUp,
  moveLessonDown,
  createModule,
  createLesson,
  createAssignmentLesson,
  updateLesson,
  deleteLesson,
  deleteModule
} from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { findSwapTarget } from "@/lib/course-studio";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseInstructor: { findUnique: vi.fn() },
    module: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    lesson: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

const COURSE = "c1";
const MODULE = "m1";

interface TxMock {
  update: ReturnType<typeof vi.fn>;
}

function makeTx(): TxMock {
  return { update: vi.fn().mockResolvedValue({}) };
}

function signInAsEditor() {
  vi.mocked(getCurrentUser).mockResolvedValue({ id: "instr-1", role: "INSTRUCTOR" } as any);
  vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue({ courseId: COURSE, userId: "instr-1" } as any);
}

/** Records the ordered `where/data` pairs each transactional update produced. */
function captureUpdates() {
  const calls: { id: string; position: number }[] = [];
  const tx = makeTx();
  tx.update.mockImplementation(async ({ where, data }: any) => {
    calls.push({ id: where.id, position: data.position });
    return {};
  });
  vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({ module: tx, lesson: tx }));
  return calls;
}

function modulesInOrder() {
  vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: MODULE } as any);
  vi.mocked(prisma.module.findMany).mockResolvedValue([
    { id: "m1", position: 0 },
    { id: "m2", position: 1 },
    { id: "m3", position: 2 }
  ] as any);
}

function lessonsInOrder(ids = ["l1", "l2", "l3"]) {
  vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: MODULE } as any);
  vi.mocked(prisma.lesson.findMany).mockResolvedValue(ids.map((id, index) => ({ id, position: index })) as any);
}

describe("Curriculum ordering — module moves", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAsEditor();
  });

  it("moves a middle module up by swapping with the module above", async () => {
    modulesInOrder();
    const calls = captureUpdates();

    const result = await moveModuleUp(COURSE, "m2");

    expect(result).toEqual({ moved: true });
    // target parked on a free sentinel (max position 2 + 1), then positions exchanged
    expect(calls).toEqual([
      { id: "m1", position: 3 },
      { id: "m2", position: 0 },
      { id: "m1", position: 1 }
    ]);
  });

  it("moves a middle module down by swapping with the module below", async () => {
    modulesInOrder();
    const calls = captureUpdates();

    const result = await moveModuleDown(COURSE, "m2");

    expect(result).toEqual({ moved: true });
    expect(calls).toEqual([
      { id: "m3", position: 3 },
      { id: "m2", position: 2 },
      { id: "m3", position: 1 }
    ]);
  });

  it("does nothing when moving the first module up", async () => {
    modulesInOrder();
    const calls = captureUpdates();

    const result = await moveModuleUp(COURSE, "m1");

    expect(result).toEqual({ moved: false });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });

  it("does nothing when moving the last module down", async () => {
    modulesInOrder();
    const calls = captureUpdates();

    const result = await moveModuleDown(COURSE, "m3");

    expect(result).toEqual({ moved: false });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });

  it("does nothing when the course has a single module", async () => {
    vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: MODULE } as any);
    vi.mocked(prisma.module.findMany).mockResolvedValue([{ id: "m1", position: 0 }] as any);

    expect(await moveModuleUp(COURSE, "m1")).toEqual({ moved: false });
    expect(await moveModuleDown(COURSE, "m1")).toEqual({ moved: false });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("never parks the sentinel on a position that is still occupied", async () => {
    // positions are not assumed to be contiguous (gaps after deletions)
    vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: "m2" } as any);
    vi.mocked(prisma.module.findMany).mockResolvedValue([
      { id: "m1", position: 0 },
      { id: "m2", position: 7 },
      { id: "m3", position: 12 }
    ] as any);
    const calls = captureUpdates();

    await moveModuleUp(COURSE, "m2");

    const sentinel = calls[0].position;
    expect(sentinel).toBe(13);
    expect([0, 7, 12]).not.toContain(sentinel);
  });

  it("denies moving a module that belongs to another course", async () => {
    vi.mocked(prisma.module.findFirst).mockResolvedValue(null);

    await expect(moveModuleUp(COURSE, "m-other")).rejects.toThrow("Forbidden");
    await expect(moveModuleDown(COURSE, "m-other")).rejects.toThrow("Forbidden");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("Curriculum ordering — lesson moves", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAsEditor();
  });

  it("moves a middle lesson up within its module", async () => {
    lessonsInOrder();
    const calls = captureUpdates();

    const result = await moveLessonUp(COURSE, MODULE, "l2");

    expect(result).toEqual({ moved: true });
    expect(calls).toEqual([
      { id: "l1", position: 3 },
      { id: "l2", position: 0 },
      { id: "l1", position: 1 }
    ]);
  });

  it("moves a middle lesson down within its module", async () => {
    lessonsInOrder();
    const calls = captureUpdates();

    const result = await moveLessonDown(COURSE, MODULE, "l2");

    expect(result).toEqual({ moved: true });
    expect(calls).toEqual([
      { id: "l3", position: 3 },
      { id: "l2", position: 2 },
      { id: "l3", position: 1 }
    ]);
  });

  it("does nothing when moving the first lesson up", async () => {
    lessonsInOrder();
    const calls = captureUpdates();

    expect(await moveLessonUp(COURSE, MODULE, "l1")).toEqual({ moved: false });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });

  it("does nothing when moving the last lesson down", async () => {
    lessonsInOrder();
    const calls = captureUpdates();

    expect(await moveLessonDown(COURSE, MODULE, "l3")).toEqual({ moved: false });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });

  it("does nothing when the module has a single lesson", async () => {
    lessonsInOrder(["only"]);
    const calls = captureUpdates();

    expect(await moveLessonUp(COURSE, MODULE, "only")).toEqual({ moved: false });
    expect(await moveLessonDown(COURSE, MODULE, "only")).toEqual({ moved: false });
    expect(calls).toEqual([]);
  });

  it("orders lessons per module, not per course", async () => {
    // module m2 has its own 0..n-1 sequence
    vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: "m2" } as any);
    vi.mocked(prisma.lesson.findMany).mockResolvedValue([
      { id: "l9", position: 0 },
      { id: "l8", position: 1 }
    ] as any);
    const calls = captureUpdates();

    await moveLessonUp(COURSE, "m2", "l8");

    expect(vi.mocked(prisma.lesson.findMany).mock.calls[0][0]).toEqual({
      where: { moduleId: "m2" },
      orderBy: { position: "asc" },
      select: { id: true, position: true }
    });
    expect(calls).toEqual([
      { id: "l9", position: 2 },
      { id: "l8", position: 0 },
      { id: "l9", position: 1 }
    ]);
  });

  it("denies a lesson that belongs to a different module", async () => {
    lessonsInOrder(["l1", "l2", "l3"]);
    const calls = captureUpdates();

    await expect(moveLessonUp(COURSE, MODULE, "l-from-other-module")).rejects.toThrow("Forbidden");
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });

  it("denies a module that does not belong to the supplied course", async () => {
    vi.mocked(prisma.module.findFirst).mockResolvedValue(null);

    await expect(moveLessonUp(COURSE, "m-other", "l1")).rejects.toThrow("Forbidden");
    await expect(moveLessonDown(COURSE, "m-other", "l1")).rejects.toThrow("Forbidden");
    expect(prisma.lesson.findMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("Curriculum ordering — authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies another instructor's course", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "instr-2", role: "INSTRUCTOR" } as any);
    vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue(null);

    await expect(moveModuleUp(COURSE, "m1")).rejects.toThrow("Forbidden");
    await expect(moveLessonDown(COURSE, MODULE, "l1")).rejects.toThrow("Forbidden");
    expect(prisma.module.findMany).not.toHaveBeenCalled();
    expect(prisma.lesson.findMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("denies a student", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "student-1", role: "STUDENT" } as any);

    await expect(moveModuleDown(COURSE, "m1")).rejects.toThrow("Forbidden");
    await expect(moveLessonUp(COURSE, MODULE, "l1")).rejects.toThrow("Forbidden");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("denies an unauthenticated request", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(moveModuleUp(COURSE, "m1")).rejects.toThrow("Unauthorized");
    await expect(moveLessonDown(COURSE, MODULE, "l1")).rejects.toThrow("Unauthorized");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("allows an admin", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "admin-1", role: "ADMIN" } as any);
    modulesInOrder();
    const calls = captureUpdates();

    expect(await moveModuleUp(COURSE, "m2")).toEqual({ moved: true });
    expect(calls).toHaveLength(3);
  });
});

describe("findSwapTarget (pure ordering logic)", () => {
  const three = [
    { id: "a", position: 0 },
    { id: "b", position: 1 },
    { id: "c", position: 2 }
  ];

  it("plans an upward swap", () => {
    expect(findSwapTarget(three, "b", -1)).toEqual({ current: three[1], target: three[0], sentinel: 3 });
  });

  it("plans a downward swap", () => {
    expect(findSwapTarget(three, "b", 1)).toEqual({ current: three[1], target: three[2], sentinel: 3 });
  });

  it("returns null at the boundaries", () => {
    expect(findSwapTarget(three, "a", -1)).toBeNull();
    expect(findSwapTarget(three, "c", 1)).toBeNull();
  });

  it("returns null for a single item and an empty list", () => {
    expect(findSwapTarget([{ id: "a", position: 0 }], "a", -1)).toBeNull();
    expect(findSwapTarget([], "a", 1)).toBeNull();
  });

  it("returns null for an id that is not in the list", () => {
    expect(findSwapTarget(three, "zzz", -1)).toBeNull();
  });

  it("puts the sentinel above every position, including negative ones", () => {
    const items = [
      { id: "a", position: -2 },
      { id: "b", position: 4 }
    ];
    expect(findSwapTarget(items, "b", -1)?.sentinel).toBe(5);
  });

  it("never produces a sentinel equal to a live position", () => {
    const sparse = [
      { id: "a", position: 0 },
      { id: "b", position: 3 },
      { id: "c", position: 9 },
      { id: "d", position: 10 }
    ];
    for (const id of ["b", "c", "d"]) {
      for (const direction of [-1, 1] as const) {
        const plan = findSwapTarget(sparse, id, direction);
        if (!plan) continue;
        expect(sparse.some((item) => item.position === plan.sentinel)).toBe(false);
      }
    }
  });
});

describe("Regression — existing create/update/delete still work", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAsEditor();
  });

  it("createModule appends after the highest existing position", async () => {
    vi.mocked(prisma.module.aggregate).mockResolvedValue({ _max: { position: 3 } } as any);
    vi.mocked(prisma.module.create).mockResolvedValue({} as any);

    await createModule(COURSE, "New Module");

    expect(prisma.module.create).toHaveBeenCalledWith({ data: { courseId: COURSE, title: "New Module", position: 4 } });
  });

  it("createModule starts at zero for an empty course", async () => {
    vi.mocked(prisma.module.aggregate).mockResolvedValue({ _max: { position: null } } as any);
    vi.mocked(prisma.module.create).mockResolvedValue({} as any);

    await createModule(COURSE, "First Module");

    expect(prisma.module.create).toHaveBeenCalledWith({ data: { courseId: COURSE, title: "First Module", position: 0 } });
  });

  it("createLesson appends after the highest existing position", async () => {
    vi.mocked(prisma.lesson.aggregate).mockResolvedValue({ _max: { position: 7 } } as any);
    vi.mocked(prisma.lesson.create).mockResolvedValue({ id: "l-new" } as any);

    const id = await createLesson(MODULE, "Lesson", "d", "5:00", null, COURSE);

    expect(id).toBe("l-new");
    expect(prisma.lesson.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ position: 8 }) })
    );
  });

  it("createAssignmentLesson appends after the highest existing position", async () => {
    vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: MODULE, courseId: COURSE } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
      cb({
        lesson: {
          aggregate: vi.fn().mockResolvedValue({ _max: { position: 4 } }),
          create: vi.fn().mockResolvedValue({ id: "l-a" })
        }
      })
    );

    await createAssignmentLesson(MODULE, "Task", "d", "Do it", null, COURSE);

    const tx = vi.mocked(prisma.$transaction).mock.calls[0][0] as any;
    const calls: any[] = [];
    // re-run through the same callback to capture the payload
    await tx({
      lesson: {
        aggregate: vi.fn().mockResolvedValue({ _max: { position: 4 } }),
        create: vi.fn((args: any) => {
          calls.push(args);
          return { id: "l-a" };
        })
      }
    });
    expect(calls[0].data.position).toBe(5);
  });

  it("updateLesson is unaffected", async () => {
    vi.mocked(prisma.lesson.update).mockResolvedValue({} as any);

    await updateLesson("l1", "Renamed", "desc", null, COURSE);

    expect(prisma.lesson.update).toHaveBeenCalledWith({
      where: { id: "l1" },
      data: { title: "Renamed", description: "desc", videoUrl: null }
    });
  });

  it("deleteLesson and deleteModule are unaffected", async () => {
    vi.mocked(prisma.lesson.delete).mockResolvedValue({} as any);
    vi.mocked(prisma.module.delete).mockResolvedValue({} as any);

    await deleteLesson("l1", COURSE);
    await deleteModule("m1", COURSE);

    expect(prisma.lesson.delete).toHaveBeenCalledWith({ where: { id: "l1" } });
    expect(prisma.module.delete).toHaveBeenCalledWith({ where: { id: "m1" } });
  });
});
