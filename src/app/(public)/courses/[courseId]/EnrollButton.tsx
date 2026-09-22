"use client";
import { useState } from "react";
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
  const router = useRouter();

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
        } else if (order && "checkoutUrl" in order && order.checkoutUrl) {
          // PayU Hosted Checkout redirect
          window.location.assign(order.checkoutUrl);
        }
      }
    } catch (e: unknown) {
      console.error("Enrollment error:", e);
      alert(e instanceof Error ? e.message : "Enrollment failed.");
    } finally {
      setLoading(false);
    }
  };


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