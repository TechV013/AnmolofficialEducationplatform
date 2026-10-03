import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import { GET, POST } from "@/app/api/payu/callback/route";
import { generatePayUResponseHash } from "@/services/payments/payu.service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn() }
  }
}));

vi.mock("@/services/payments/paymentConfirmation.service", () => ({
  confirmPaidOrder: vi.fn()
}));

const KEY = "JP***g";
const SALT = "abcdefghijklmnopqrst";
const originalEnv = { ...process.env };

const order = {
  id: "order-1",
  status: "PENDING",
  currency: "INR",
  course: { id: "course-1" }
};

const fields = {
  status: "success",
  txnid: "PAYU_1_abc",
  amount: "999.00",
  currency: "INR",
  mihpayid: "403993715537565049",
  productinfo: "React",
  firstname: "Asha",
  email: "asha@example.com",
  key: KEY
};

function sign(overrides: Record<string, string> = {}) {
  const postback = { ...fields, ...overrides };
  return { ...postback, hash: generatePayUResponseHash(postback, SALT, KEY) };
}

function getRequest(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost:3000/api/payu/callback");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

function postRequest(params: Record<string, string>): NextRequest {
  const body = new URLSearchParams(params).toString();
  return new NextRequest("http://localhost:3000/api/payu/callback", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
}

function location(res: Response): string {
  return res.headers.get("location") ?? "";
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYU_MERCHANT_KEY = KEY;
  process.env.PAYU_MERCHANT_SECRET = SALT;
  process.env.PAYU_ENV = "TEST";
  vi.mocked(prisma.order.findUnique).mockResolvedValue(order as any);
  vi.mocked(confirmPaidOrder).mockResolvedValue({ success: true } as any);
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("PayU callback (POST form body)", () => {
  it("confirms the order for a correctly signed success response", async () => {
    const res = await POST(postRequest(sign()));
    expect(location(res)).toContain("payment=success");
    expect(confirmPaidOrder).toHaveBeenCalledWith({
      orderId: "order-1",
      providerPaymentId: "403993715537565049",
      amountPaise: 99900,
      currency: "INR",
      provider: "PAYU"
    });
  });

  it("rejects an amount that does not match its own signature", async () => {
    // Signed for 999.00 but posted as 1.00: the hash no longer covers the body.
    const signed = sign();
    const res = await POST(postRequest({ ...signed, amount: "1.00" }));
    expect(location(res)).toContain("payment=failed");
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  it("rejects a response whose status is not success", async () => {
    const res = await POST(postRequest(sign({ status: "failure" })));
    expect(location(res)).toContain("payment=failed");
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  it("reports an unknown transaction without granting anything", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null as any);
    const res = await POST(postRequest(sign()));
    expect(location(res)).toContain("payment=not_found");
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });
});

describe("PayU callback (GET query parameters)", () => {
  // Regression: GET used to call req.formData(), which is empty on a GET, so
  // the hash never matched and every PayU return landed on payment=failed.
  it("confirms the order from query parameters alone", async () => {
    const res = await GET(getRequest(sign()));
    expect(location(res)).toContain("payment=success");
    expect(confirmPaidOrder).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "order-1", amountPaise: 99900 })
    );
  });

  it("does not confirm when the signed amount does not match the postback", async () => {
    const signed = sign();
    const res = await GET(
      getRequest({ ...signed, amount: signed.amount, hash: sign({ amount: "1.00" }).hash })
    );
    expect(location(res)).toContain("payment=failed");
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  it("fails closed when no parameters are sent at all", async () => {
    const res = await GET(getRequest({}));
    expect(location(res)).toContain("payment=failed");
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });

  it("reports an unknown transaction from a GET return", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null as any);
    const res = await GET(getRequest(sign()));
    expect(location(res)).toContain("payment=not_found");
  });

  it("skips re-confirmation for an order that is already paid", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ ...order, status: "PAID" } as any);
    const res = await GET(getRequest(sign()));
    expect(location(res)).toContain("payment=success");
    expect(confirmPaidOrder).not.toHaveBeenCalled();
  });
});
