import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import NavMenu from "@/components/nav/StudentNavMenu";
import Link from "next/link";
import { getStudentEnrollmentsForMyLearning } from "@/services/enrollmentService";
import { getCourseProgress } from "@/services/progressService";
import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";

export default async function MyLearningPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "STUDENT") {
    return redirect("/login");
  }
  
  const enrollments = await getStudentEnrollmentsForMyLearning(user.id);
  
  // Compute progress server-side for all enrolled courses (no client-side computation)
  const progressResults = await Promise.all(
    enrollments.map(async (enrollment) => ({
      enrollment,
      progress: await getCourseProgress(user.id, enrollment.courseId)
    }))
  );
  
  return (
    <>
      <WorkspaceHeader user={{ name: user.name || "User" }} />
      <div className="min-h-screen bg-light-gray py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8">My Learning</h1>
          
          {progressResults.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">No courses yet</h2>
              <p className="text-gray-600 mb-6">You haven&apos;t enrolled in any courses yet. Start learning by exploring our course catalog.</p>
              <Link href="/courses" className="inline-block bg-blue text-white py-3 px-6 rounded font-medium hover:bg-blue-dark transition-colors">
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {progressResults.map(({ enrollment, progress }) => {
                const course = enrollment.course;
                const firstLesson = course.modules?.[0]?.lessons?.[0] || null;
                
                return (
                  <Link key={enrollment.id} href={firstLesson ? `/classroom/${course.id}/${firstLesson.id}` : `/classroom/${course.id}`} className="group block">
                    <div className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                            <div className="text-center"><div className="text-2xl">📚</div><p className="mt-2 text-sm text-gray-500">Course Thumbnail</p></div>
                          </div>
                        )}
                        
                        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                        
                        {course.instructors?.[0]?.user?.name && (
                          <p className="text-sm text-gray-600 mb-2">By {course.instructors[0].user.name}</p>
                        )}
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-bold text-primary">{progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description || "Course description coming soon."}</p>
                        
                        <div className="mt-6">
                          <button className="w-full bg-blue text-white py-3 px-4 rounded font-medium hover:bg-blue-dark transition-colors flex items-center justify-center gap-2">Continue Learning <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}