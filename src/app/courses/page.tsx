import { getPublishedCourses } from "@/services/courses/courses.service";
import CourseCard from "@/components/home/CourseCard";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-black mb-8">Explore Courses</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <CourseCard course={course} />
            </Link>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
