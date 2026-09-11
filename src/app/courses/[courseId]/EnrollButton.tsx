"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { enroll } from "../actions";
import { createPaymentOrder, verifyPayment } from "../actions";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function EnrollButton({ courseId, isFree, isEnrolled }: { courseId: string, isFree: boolean, isEnrolled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(typeof window !== "undefined" && !!window.Razorpay);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
        const script = document.createElement("script");
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
      <button onClick={() => router.push(`/dashboard`)} className="w-full bg-blue text-white py-4 rounded-full font-bold text-lg hover:bg-blue-dark transition-colors shadow-lg">
        Continue Learning
      </button>
    );
  }

  const handleEnroll = async () => {
    setLoading(true);
    try {
        if (isFree) {
            await enroll(courseId);
            router.push("/dashboard");
            router.refresh();
        } else {
            const order = await createPaymentOrder(courseId);
            if (order && 'status' in order && order.status === "ALREADY_ENROLLED") {
                router.push("/dashboard");
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
                            formData.append("razorpay_payment_id", response.razorpay_payment_id);
                            formData.append("razorpay_order_id", response.razorpay_order_id);
                            formData.append("razorpay_signature", response.razorpay_signature);
                            formData.append("internal_order_id", order.internalOrderId);
                            
                            const result = await verifyPayment(formData);
                            if (result.success) {
                                router.push("/dashboard");
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
    <button onClick={handleEnroll} disabled={loading} className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
      {loading ? "Processing..." : isFree ? "Start Learning" : "Buy to Access"}
    </button>
  );
}
