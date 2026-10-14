import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import CourseSection from "@/components/home/CourseSection";
import GuidanceSection from "@/components/home/GuidanceSection";
import SuccessStories from "@/components/home/SuccessStories";
import dynamic from "next/dynamic";
import { getPublishedTestimonials } from "@/services/testimonials/testimonial.service";

export const metadata: Metadata = {
  title: {
    absolute: "Design Vidya — Learn 3D, Animation, VFX & Video Editing Online",
  },
  description:
    "Design Vidya is an online learning platform for creative skills — master 3D modeling, animation, rigging, VFX and video editing with expert-led, affordable courses.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Design Vidya — Learn 3D, Animation, VFX & Video Editing Online",
    description:
      "Master 3D modeling, animation, rigging, VFX and video editing with expert-led, affordable courses.",
    url: "https://www.designvidya.com",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Design Vidya" }],
  },
};

export const revalidate = 300;

const HelpSection = dynamic(() => import("@/components/home/HelpSection"), {
  loading: () => <div className="py-20" />,
});

export default async function Home() {
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      <Hero />
      <CourseSection />
      <GuidanceSection />
      <SuccessStories testimonials={testimonials} />
      <HelpSection />
    </>
  );
}