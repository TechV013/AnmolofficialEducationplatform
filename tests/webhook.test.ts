import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import { generatePayUResponseHash } from "@/services/payments/payu.service";
import { POST } from "@/app/api/payments/payu/webhook/route";

vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findUnique: vi.fn() } }
}));

vi.mock("@/services/payments/paymentConfirmation.service", () => ({
  confirmPaidOrder: vi.fn()
}));

const KEY = "JP***g";
const SALT = "abcdefghijklmnopqrst";
const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYU_MERCHANT_KEY = KEY;
  process.env.PAYU_MERCHANT_SECRET = SALT;
  process.env.PAYU_ENV = "TEST";
});

afterEach(() => {
  // PayU credentials are process-wide; leaking them into other test files would
  // let a suite pass against a gateway it should have seen as unconfigured.
  process.env = { ...originalEnv };
});

/** Builds a PayU postback, signing it with the given key/salt unless told not to. */
function postback(overrides: Record<string, string> = {}, signWith?: { key: string; salt: string }) {
  const fields: Record<string, string> = {
    key: KEY,
    txnid: "PAYU_1_abc",
    mihpayid: "3030403030403",
    status: "success",
    amount: "999.00",
    currency: "INR",
    firstname: "Asha",
    email: "asha@example.com",
    productinfo: "React",
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    ...overrides
  };
  const signer = signWith ?? { key: KEY, salt: SALT };
  fields.hash = generatePayUResponseHash(fields, signer.salt, signer.key);
  return fields;
}

function request(fields: Record<string, string>) {
  const body = new URLSearchParams(fields).toString();
  return new NextRequest("https://example.com/api/payments/payu/webhook", {
    method: "POST",
    body,
    headers: { "content-type": "application/x-www-form-urlencoded" }
  });
}

describe("PayU webhook signature verification", () => {
  test("1. Valid signature confirms the order", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "order-1",
      status: "PENDING",
      currency: "INR"
    } as any);

    const res = await POST(request(postback()));

    expect(res.status).toBe(200);
    expect(confirmPaidOrder).toHaveBeenCalledWith({
      orderId: "order-1",
      providerPaymentId: "3030403030403",
      amountPaise: 99900,
      currency: "INR",
      provider: "PAYU"
    });
  });

  test("2. Invalid hash is rejected and grants nothing", async () => {
    const fields = postback();
    fields.hash = crypto.createHash("sha512").update("forged").digest("hex");

    const res = await POST(request(fields));

    expect(res.status).toBe(400);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("3. Payload cannot substitute its own merchant key", async () => {
    // The realistic forgery: an attacker who has learned the salt signs with a
    // merchant key of their own choosing and asserts it in the payload. If the
    // handler hashes with data.key, its recomputation matches theirs exactly and
    // the forged enrolment is accepted.
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "order-1",
      status: "PENDING",
      currency: "INR"
    } as any);

    const fields = postback({ key: "ATTACKER1" }, { key: "ATTACKER1", salt: SALT });

    const res = await POST(request(fields));

    expect(res.status).toBe(400);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("4. Hash signed with the wrong salt is rejected", async () => {
    const fields = postback({}, { key: KEY, salt: "wrong-salt-value" });
    const res = await POST(request(fields));
    expect(res.status).toBe(400);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("5. Amount tampering after signing is rejected", async () => {
    const fields = postback();
    // Re-price the course from 999 to 1.00 without re-signing.
    fields.amount = "1.00";

    const res = await POST(request(fields));

    expect(res.status).toBe(400);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("6. Transaction id tampering is rejected", async () => {
    const fields = postback();
    fields.txnid = "PAYU_someone_elses_order";

    const res = await POST(request(fields));

    expect(res.status).toBe(400);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("7. Failed payments grant no enrolment", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: "order-1", status: "PENDING" } as any);

    const res = await POST(request(postback({ status: "failure" })));

    expect(res.status).toBe(200);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("8. Unknown transaction is reported as not found", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const res = await POST(request(postback()));

    expect(res.status).toBe(404);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("9. Duplicate webhook delivery is idempotent", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: "order-1", status: "PAID" } as any);

    const res = await POST(request(postback()));

    expect(res.status).toBe(200);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("10. Missing gateway configuration fails closed", async () => {
    delete process.env.PAYU_MERCHANT_SECRET;

    const res = await POST(request(postback()));

    expect(res.status).toBe(500);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("11. Empty body cannot crash the handler", async () => {
    const res = await POST(request({}));
    expect([400, 404, 500]).toContain(res.status);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("12. Non-numeric amount is rejected before persistence", async () => {
    const fields = postback();
    fields.amount = "not-a-number";

    const res = await POST(request(fields));

    expect(res.status).toBe(400);
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  test("13. Confirmation failure surfaces as a retryable error", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: "order-1", status: "PENDING" } as any);
    vi.mocked(confirmPaidOrder).mockRejectedValue(new Error("db down"));

    const res = await POST(request(postback()));

    expect(res.status).toBe(500);
  });

  test("14. Decimal amounts convert to paise without drift", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "order-1",
      status: "PENDING",
      currency: "INR"
    } as any);

    await POST(request(postback({ amount: "1090.33" })));

    expect(confirmPaidOrder).toHaveBeenCalledWith(expect.objectContaining({ amountPaise: 109033 }));
  });
});