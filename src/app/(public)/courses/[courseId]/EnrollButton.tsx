"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { enrollFree } from "./enrollment-actions";
import { createPaymentOrder, verifyPayment } from "./actions";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function EnrollButton({ courseId, isFree, isEnrolled, isSignedIn }: {
  courseId: string;
  isFree: boolean;
  isEnrolled: boolean;
  isSignedIn: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(typeof window !== "undefined" && !!window.Razorpay);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay && !document.getElementById("razorpay-checkout-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-checkout-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayReady(true);
      script.onerror = () => {
        setLoading(false);
        alert("Failed to load payment gateway.");
      };
      document.body.appendChild(script);
    }
  }, []);

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
        } else if (order) {
          if (!razorpayReady) {
            await new Promise<void>((resolve) => {
              const checkReady = () => {
                if (window.Razorpay) {
                  resolve();
                } else {
                  setTimeout(checkReady, 100);
                }
              };
              checkReady();
            });
          }

          const options = {
            key: order.key_id,
            amount: order.amount,
            currency: order.currency,
            name: "ANMLOFFICIAL",
            description: "Course Purchase",
            image: "/images/logo.png",
            order_id: order.order_id,
            handler: async function (response: RazorpayResponse) {
              try {
                const formData = new FormData();
                formData.append("razorpay_payment_id", response.razorpay_payment_id ?? "");
                formData.append("razorpay_order_id", response.razorpay_order_id ?? "");
                formData.append("razorpay_signature", response.razorpay_signature ?? "");
                if (order.internalOrderId) {
                  formData.append("internal_order_id", order.internalOrderId);
                }

                const result = await verifyPayment(formData);
                if (result.success) {
                  router.push("/my-learning");
                  router.refresh();
                } else {
                  throw new Error("Verification failed");
                }
              } catch (err) {
                console.error("Payment verification error:", err);
                alert("Payment verification failed. Please try again.");
              }
            },
            theme: {
              color: "#0069E0"
            }
          };
          new window.Razorpay(options).open();
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