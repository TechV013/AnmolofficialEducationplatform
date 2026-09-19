import Hero from "@/components/home/Hero";
import CourseSection from "@/components/home/CourseSection";
import GuidanceSection from "@/components/home/GuidanceSection";
import SuccessStories from "@/components/home/SuccessStories";
import HelpSection from "@/components/home/HelpSection";

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