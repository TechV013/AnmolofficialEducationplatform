import { prisma } from "@/lib/prisma";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { publishCourse, deleteModule, deleteLesson, createQuiz, deleteQuiz, createResource, updateResource, deleteResource } from "./actions";
import ModuleForm from "@/components/instructor/ModuleForm";
import LessonEditForm from "@/components/instructor/LessonEditForm";
import LessonCreateForm from "@/components/instructor/LessonCreateForm";
import ResourceForm from "@/components/instructor/ResourceForm";
import { QuizEditor } from "@/components/instructor/QuizEditor";
import Link from "next/link";

export default async function CourseManagementPage({ params }: { params: { courseId: string } }) {
    await requireCourseEditor(params.courseId);
    const course = await prisma.course.findUnique({
        where: { id: params.courseId },
        include: { modules: { include: { lessons: { include: { resources: true, quiz: true, assignment: true } } } } }
    });
    if (!course) return <div className="p-12 text-xl">Course not found</div>;
    const isDraft = course.status === "DRAFT";

    return (
        <div className="p-8 max-w-5xl mx-auto bg-background min-h-screen text-text">
            <header className="flex justify-between items-center mb-10 border-b pb-6 border-border">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted mt-1">Status: <span className={`font-bold ${isDraft ? 'text-amber-600' : 'text-green-600'}`}>{course.status}</span> {isDraft && <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded ml-2">DRAFT — not visible to students</span>}</p>
                </div>
                <form action={publishCourse.bind(null, course.id)}>
                    <button disabled={!isDraft} className={`px-6 py-2 rounded-full font-bold transition-all ${isDraft ? 'bg-primary hover:bg-primary-hover text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Publish Course</button>
                </form>
            </header>

            <div className="mb-6 flex gap-3">
                <Link href={`/courses/${course.slug}`} className="text-sm text-primary hover:underline">Preview Course (DRAFT)</Link>
            </div>

            <ModuleForm courseId={course.id} />

            <div className="space-y-6">
                {course.modules.sort((a,b) => a.position - b.position).map(module => (
                    <div key={module.id} className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{module.title}</h2>
                            <form action={deleteModule.bind(null, module.id, course.id)}>
                                <button className="text-red-500 text-sm hover:underline">Delete Module</button>
                            </form>
                        </div>

                        {/* Lesson creation form for this module */}
                        <div className="mb-4">
                          <LessonCreateForm moduleId={module.id} courseId={course.id} />
                        </div>

                        <div className="space-y-3">
                            {module.lessons.sort((a,b) => a.position - b.position).map(lesson => (
                                <div key={lesson.id} className="bg-background p-4 rounded-xl flex flex-col gap-3 border border-border/50">
                                    {/* Lesson edit form */}
                                    <LessonEditForm
                                        lessonId={lesson.id}
                                        courseId={course.id}
                                        initialTitle={lesson.title}
                                        initialDescription={lesson.description || ""}
                                        initialVideoUrl={lesson.videoUrl}
                                    />

                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{lesson.title}</span>
                                        <div className="flex gap-3 items-center">
                                            <span className="text-xs text-muted">{lesson.duration || '—'}</span>
                                            <form action={deleteLesson.bind(null, lesson.id, course.id)}>
                                                <button className="text-red-500 text-sm hover:underline">Delete Lesson</button>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted">Video URL: {lesson.videoUrl ? <a href={lesson.videoUrl} target="_blank" className="text-primary underline">Linked</a> : <span className="text-red-500">Not set</span>}</div>

                                    {/* Resources */}
                                    <div className="border-t border-border/30 pt-3">
                                      <h4 className="font-bold text-sm mb-2">Resources</h4>
                                      {lesson.resources && lesson.resources.length > 0 ? (
                                        <ul className="space-y-1">
                                          {lesson.resources.map(r => (
                                            <li key={r.id} className="text-sm text-muted flex justify-between items-center">
                                              <a href={r.url || '#'} className="text-primary hover:underline">{r.title} ({r.type})</a>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-xs text-muted italic">No resources.</p>
                                      )}
                                    </div>


                                    {/* Resources */}
                                    <div className="border-t border-border/30 pt-3">
                                       <h4 className="font-bold text-sm mb-2">Resources</h4>
                                       <ResourceForm lessonId={lesson.id} courseId={course.id} onSuccess={() => {}} />
                                    </div>
                                    <div className="space-y-1 mb-4">
                                          {lesson.resources.map((r: any) => (
                                              <div key={r.id} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                                <a href={r.url} target="_blank" className="text-primary hover:underline">{r.title} ({r.type})</a>
                                                <form action={deleteResource.bind(null, r.id, course.id)}>
                                                    <button className="text-red-500 hover:underline">Delete</button>
                                                </form>
                                              </div>
                                          ))}
                                    </div>
                                    {/* Quiz */}
                                    <div className="border-t border-border/30 pt-3">
                                      <h4 className="font-bold text-sm mb-2">Quiz</h4>
                                      {lesson.quiz ? (
                                        <QuizEditor quiz={lesson.quiz} courseId={course.id} />
                                      ) : (
                                        <form action={createQuiz.bind(null, lesson.id, course.id)} className="flex gap-2 items-center">
                                          <button className="bg-primary text-white px-3 py-1 rounded-lg text-sm">Create Quiz</button>
                                          <span className="text-xs text-muted">Create a new quiz for this lesson.</span>
                                        </form>
                                      )}
                                    </div>

                                    {/* Assignment */}
                                    <div className="border-t border-border/30 pt-3">
                                      <h4 className="font-bold text-sm mb-2">Assignment</h4>
                                      {lesson.assignment ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                          <p className="text-sm font-bold">Assignment Created</p>
                                          <p className="text-sm">Instructions: {lesson.assignment.instructions}</p>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-muted italic">No assignment.</div>
                                      )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}