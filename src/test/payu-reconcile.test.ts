import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import {
  reconcilePendingOrder,
  reconcileLatestPendingOrder
} from "@/services/payments/payuReconcile.service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock("@/services/payments/paymentConfirmation.service", () => ({
  confirmPaidOrder: vi.fn()
}));

const KEY = "TESTKEY";
const SALT = "testsalt";
const originalEnv = { ...process.env };

const pendingOrder = {
  id: "order-1",
  providerOrderId: "PAYU_1_abc",
  status: "PENDING",
  currency: "INR",
  amount: "999",
  userId: "user-1",
  courseId: "course-1"
};

function payUResponse(record: Record<string, unknown>, status = 1) {
  return {
    ok: true,
    json: async () => ({
      status,
      msg: "1 out of 1 Transactions Fetched Successfully",
      transaction_details: { PAYU_1_abc: record }
    })
  };
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYU_MERCHANT_KEY = KEY;
  process.env.PAYU_MERCHANT_SECRET = SALT;
  process.env.PAYU_ENV = "TEST";
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(prisma.order.findUnique).mockResolvedValue(pendingOrder as never);
  vi.mocked(prisma.order.findFirst).mockResolvedValue(pendingOrder as never);
  vi.mocked(prisma.order.update).mockResolvedValue(pendingOrder as never);
  vi.mocked(confirmPaidOrder).mockResolvedValue({ success: true } as never);
  fetchMock.mockResolvedValue(
    payUResponse({ status: "success", unmappedstatus: "captured", amt: "999.00", mihpayid: "m1" })
  );
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("reconcilePendingOrder", () => {
  it("confirms a pending order when PayU reports success", async () => {
    await reconcilePendingOrder("order-1");

    expect(confirmPaidOrder).toHaveBeenCalledWith({
      orderId: "order-1",
      providerPaymentId: "m1",
      amountPaise: 99900,
      currency: "INR"
    });
  });

  it("marks the order FAILED when PayU reports failure", async () => {
    fetchMock.mockResolvedValue(
      payUResponse({ status: "failure", unmappedstatus: "failed", amt: "999.00" })
    );

    await reconcilePendingOrder("order-1");

    expect(confirmPaidOrder).not.toHaveBeenCalled();
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "FAILED" }
    });
  });

  it("does nothing when the order is already PAID", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...pendingOrder,
      status: "PAID"
    } as never);

    await reconcilePendingOrder("order-1");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  it("does nothing when the order is missing", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    await reconcilePendingOrder("order-1");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  it("leaves the order pending when the transaction is not found", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 1, msg: "0 out of 0 Transactions Fetched Successfully" })
    });

    await reconcilePendingOrder("order-1");

    expect(confirmPaidOrder).not.toHaveBeenCalled();
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("leaves the order pending when the amount cannot be parsed", async () => {
    fetchMock.mockResolvedValue(
      payUResponse({ status: "success", unmappedstatus: "captured", amt: "not-a-number", mihpayid: "m1" })
    );

    await reconcilePendingOrder("order-1");

    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  it("does not throw when verify_payment request fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(reconcilePendingOrder("order-1")).resolves.toBeUndefined();
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  it("does not throw when confirmPaidOrder rejects", async () => {
    vi.mocked(confirmPaidOrder).mockRejectedValue(new Error("boom"));

    await expect(reconcilePendingOrder("order-1")).resolves.toBeUndefined();
  });
});

describe("reconcileLatestPendingOrder", () => {
  it("reconciles the most recent pending order for the user and course", async () => {
    await reconcileLatestPendingOrder("user-1", "course-1");

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", courseId: "course-1", status: "PENDING" },
      orderBy: { createdAt: "desc" }
    });
    expect(confirmPaidOrder).toHaveBeenCalled();
  });

  it("does nothing when there is no pending order", async () => {
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

    await reconcileLatestPendingOrder("user-1", "course-1");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });
});
