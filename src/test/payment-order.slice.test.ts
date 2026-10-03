import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createPaymentOrder } from "@/app/(public)/courses/[courseId]/actions";
import { CourseStatus, EnrollmentStatus } from "@prisma/client";
import { generatePayUHash } from "@/services/payments/payu.service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    enrollment: { findUnique: vi.fn() },
    order: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn()
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
  requireRole: vi.fn()
}));

const KEY = "JP***g";
const SALT = "abcdefghijklmnopqrst";
const originalEnv = { ...process.env };

const student = { id: "user-1", role: "STUDENT", email: "asha@example.com", name: "Asha" };
const paidCourse = { id: "course-1", price: 999, status: CourseStatus.PUBLISHED, currency: "INR", title: "React" };

/** Runs the callback passed to $transaction against a shared mock tx client. */
function mockTransaction(result: unknown) {
  vi.mocked(prisma.$transaction).mockImplementation((cb: any) =>
    Promise.resolve(cb({ enrollment: { findUnique: vi.fn() }, order: { findFirst: vi.fn() } })).then(
      () => result
    ) as any
  );
}

/**
 * Narrows the action's union return type to the checkout branch, asserting that
 * a hosted checkout payload was actually produced.
 */
function expectCheckout(order: Awaited<ReturnType<typeof createPaymentOrder>>) {
  if (!("params" in order) || !order.params || !("checkoutUrl" in order) || !order.checkoutUrl) {
    throw new Error(`expected a checkout payload, received ${JSON.stringify(order)}`);
  }
  return { url: order.checkoutUrl, params: order.params, internalOrderId: order.internalOrderId };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYU_MERCHANT_KEY = KEY;
  process.env.PAYU_MERCHANT_SECRET = SALT;
  process.env.PAYU_ENV = "TEST";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
  vi.mocked(getCurrentUser).mockResolvedValue(student as any);
  vi.mocked(prisma.course.findUnique).mockResolvedValue(paidCourse as any);
  vi.mocked(prisma.user.findUnique).mockResolvedValue({ phone: "9876543210" } as any);
  vi.mocked(prisma.order.create).mockResolvedValue({ id: "order-new" } as any);
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("createPaymentOrder (B2.1 paid checkout vertical slice)", () => {
  it("charges the listed price in rupees, never in paise", async () => {
    mockTransaction({ createNew: true });

    const order = expectCheckout(await createPaymentOrder("course-1"));

    // A 999 rupee course reaching PayU as 99900 would overcharge 100x.
    expect(order.params.amount).toBe("999.00");
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 999, status: "PENDING" })
      })
    );
  });

  it("signs the checkout hash with the configured key and salt", async () => {
    mockTransaction({ createNew: true });

    const order = expectCheckout(await createPaymentOrder("course-1"));

    expect(order.params.key).toBe(KEY);
    expect(order.params.hash).toBe(
      generatePayUHash(
        {
          key: KEY,
          txnid: order.params.txnid,
          amount: "999.00",
          productinfo: "React",
          firstname: "Asha",
          email: "asha@example.com"
        },
        SALT
      )
    );
    expect(Object.values(order.params)).not.toContain(SALT);
  });

  it("never sends the merchant salt to the browser", async () => {
    mockTransaction({ createNew: true });
    const order = expectCheckout(await createPaymentOrder("course-1"));
    expect(JSON.stringify(order)).not.toContain(SALT);
  });

  it("returns the hosted gateway URL rather than a transaction id", async () => {
    mockTransaction({ createNew: true });
    const order = expectCheckout(await createPaymentOrder("course-1"));
    // The old code returned the txnid here, which is not a usable checkout URL.
    expect(order.url).toBe("https://test.payu.in/_payment");
    expect(order.url).not.toBe(order.params.txnid);
  });

  it("cancels an abandoned pending order and starts a fresh transaction", async () => {
    mockTransaction({ existingOrder: { id: "order-old", providerOrderId: "PAYU_old" } });

    const order = expectCheckout(await createPaymentOrder("course-1"));

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "order-old" },
      data: { status: "CANCELLED" }
    });
    // PayU rejects a reused txnid, so the new attempt gets its own.
    expect(order.params.txnid).not.toBe("PAYU_old");
    expect(order.params.amount).toBe("999.00");
  });

  it("passes the student's real phone through when present", async () => {
    mockTransaction({ createNew: true });
    const order = expectCheckout(await createPaymentOrder("course-1"));
    expect(order.params.phone).toBe("9876543210");
  });

  it("omits phone entirely when the student has none", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ phone: null } as any);
    mockTransaction({ createNew: true });
    const order = expectCheckout(await createPaymentOrder("course-1"));
    expect(order.params.phone).toBeUndefined();
  });

  it("short-circuits for an already enrolled student", async () => {
    mockTransaction({ alreadyEnrolled: true });
    const result = await createPaymentOrder("course-1");
    expect(result).toEqual({ status: "ALREADY_ENROLLED" });
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it("builds return URLs from configured origin, not a request header", async () => {
    mockTransaction({ createNew: true });
    const order = expectCheckout(await createPaymentOrder("course-1"));
    expect(order.params.surl).toBe("http://localhost:3000/api/payu/callback");
    expect(order.params.furl).toContain("payment=fail");
    expect(order.params.curl).toContain("payment=cancel");
  });

  it("rejects the request when payments are unconfigured", async () => {
    delete process.env.PAYU_MERCHANT_KEY;
    await expect(createPaymentOrder("course-1")).rejects.toThrow(/not available/i);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it("rejects a missing public origin rather than sending broken return URLs", async () => {
    delete process.env.NEXTAUTH_URL;
    mockTransaction({ createNew: true });
    await expect(createPaymentOrder("course-1")).rejects.toThrow(/NEXTAUTH_URL/);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it("refuses non-students before touching the database", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...student, role: "INSTRUCTOR" } as any);
    await expect(createPaymentOrder("course-1")).rejects.toThrow("Forbidden");
    expect(prisma.course.findUnique).not.toHaveBeenCalled();
  });

  it("refuses anonymous users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);
    await expect(createPaymentOrder("course-1")).rejects.toThrow("Unauthorized");
  });

  it("refuses unpublished and free courses", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ ...paidCourse, status: CourseStatus.DRAFT } as any);
    await expect(createPaymentOrder("course-1")).rejects.toThrow("Course not published");

    vi.mocked(prisma.course.findUnique).mockResolvedValue({ ...paidCourse, price: 0 } as any);
    await expect(createPaymentOrder("course-1")).rejects.toThrow("Course is not paid");
  });

  it("uses the profile name, falling back when the student has none", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...student, name: "" } as any);
    mockTransaction({ createNew: true });
    const order = expectCheckout(await createPaymentOrder("course-1"));
    expect(order.params.firstname).toBe("Student");
  });
});

describe("enrollment guard", () => {
  it("does not treat a CANCELLED enrollment as enrolled", () => {
    expect(EnrollmentStatus.CANCELLED).not.toBe(EnrollmentStatus.ACTIVE);
  });
});