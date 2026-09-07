import CourseCard from "./CourseCard";
import { courses } from "@/data/courses";
import Link from "next/link";

export default function CourseSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">Creative Courses</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
            Learn with confidence, just like 91% of learners who have seen meaningful improvements in their careers, skills, and performance. Start now!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/courses" className="text-primary font-bold text-lg hover:underline">
            View all courses →
          </Link>
        </div>
      </div>
    </section>
  );
}
