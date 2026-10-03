"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { enrollFree } from "./enrollment-actions";
import { createPaymentOrder } from "./actions";

export default function EnrollButton({ courseId, isFree, isEnrolled, isSignedIn }: {
  courseId: string;
  isFree: boolean;
  isEnrolled: boolean;
  isSignedIn: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [checkout, setCheckout] = useState<{ url: string; params: Record<string, string> } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // PayU hosted checkout only accepts a form POST to /_payment. A plain redirect
  // drops every field including the hash, so the signed form is submitted on the
  // student's behalf once the server has signed it.
  useEffect(() => {
    if (checkout && formRef.current) formRef.current.submit();
  }, [checkout]);

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push("/my-learning")}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover"
      >
        <PlayCircle className="h-5 w-5" />
        Continue Learning
      </button>
    );
  }

  const handleEnroll = async () => {
    if (!isSignedIn) {
      router.push(`/login?next=/courses/${courseId}`);
      return;
    }
    setLoading(true);
    try {
      if (isFree) {
        await enrollFree(courseId);
        router.push("/my-learning");
        router.refresh();
      } else {
        const order = await createPaymentOrder(courseId);
        if (order && "status" in order && order.status === "ALREADY_ENROLLED") {
          router.push("/my-learning");
        } else if (order && "checkoutUrl" in order && order.checkoutUrl && order.params) {
          setCheckout({ url: order.checkoutUrl, params: order.params });
        }
      }
    } catch (e: unknown) {
      console.error("Enrollment error:", e);
      const message = e instanceof Error ? e.message : "";
      const isMaskedServerError = !message || /Minified React error|Server Components render|digest/i.test(message);
      alert(isMaskedServerError ? "We couldn't start checkout right now. Please try again in a moment." : message);
    } finally {
      setLoading(false);
    }
  };


  if (checkout) {
    return (
      <form ref={formRef} action={checkout.url} method="POST" className="space-y-2">
        {Object.entries(checkout.params).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} readOnly />
        ))}
        <noscript>
          <button type="submit" className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-white">
            Continue to payment
          </button>
        </noscript>
        <p className="text-center text-sm text-muted">Redirecting to secure payment…</p>
      </form>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover disabled:opacity-60"
    >
      {loading ? "Processing..." : isFree ? "Start Learning" : "Enroll Now"}
    </button>
  );
}