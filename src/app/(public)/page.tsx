import Hero from "@/components/home/Hero";
import CourseSection from "@/components/home/CourseSection";
import GuidanceSection from "@/components/home/GuidanceSection";
import SuccessStories from "@/components/home/SuccessStories";
import dynamic from "next/dynamic";

const HelpSection = dynamic(() => import("@/components/home/HelpSection"), {
  loading: () => <div className="py-20" />,
});

export default function Home() {
  return (
    <>
      <Hero />
      <CourseSection />
      <GuidanceSection />
      <SuccessStories />
      <HelpSection />
    </>
  );
}