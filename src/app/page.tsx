import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import CourseSection from "@/components/home/CourseSection";
import GuidanceSection from "@/components/home/GuidanceSection";
import SuccessStories from "@/components/home/SuccessStories";
import HelpSection from "@/components/home/HelpSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <CourseSection />
      <GuidanceSection />
      <SuccessStories />
      <HelpSection />
      <Footer />
    </>
  );
}
