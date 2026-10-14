import type { Metadata } from "next";
import { getPublishedTestimonials } from "@/services/testimonials/testimonial.service";
import TestimonialsClient from "@/components/testimonials/TestimonialsClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Student Testimonials — Design Vidya",
  description:
    "Real student feedback and success stories from Design Vidya learners mastering 3D, rigging, animation, and video editing.",
};

export default async function TestimonialsPage() {
  const testimonials = await getPublishedTestimonials();

  return <TestimonialsClient testimonials={testimonials} />;
}
