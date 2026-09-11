import { prisma } from "@/lib/prisma";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { publishCourse, deleteModule, deleteLesson } from "./actions";
import ModuleForm from "@/components/instructor/ModuleForm";
import Link from "next/link";

export default async function CourseManagementPage({ params }: { params: { courseId: string } }) {
    await requireCourseEditor(params.courseId);
    const course = await prisma.course.findUnique({
        where: { id: params.courseId },
        include: { modules: { include: { lessons: { include: { resources: true, quiz: true, assignment: true } } } } }
    });

    if (!course) return <div>Course not found</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto bg-background min-h-screen text-text">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted">Status: <span className="font-bold text-primary">{course.status}</span></p>
                </div>
                <form action={publishCourse.bind(null, course.id)}>
                    <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold transition-all">Publish Course</button>
                </form>
            </header>

            <ModuleForm courseId={course.id} />
            
            <div className="space-y-6">
                {course.modules.sort((a,b) => a.position - b.position).map(module => (
                    <div key={module.id} className="bg-surface p-6 rounded-2xl border border-border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{module.title}</h2>
                            <form action={deleteModule.bind(null, module.id, course.id)}>
                                <button className="text-red-500 text-sm">Delete Module</button>
                            </form>
                        </div>
                        <div className="space-y-3">
                            {module.lessons.sort((a,b) => a.position - b.position).map(lesson => (
                                <div key={lesson.id} className="bg-background p-4 rounded-xl flex justify-between items-center">
                                    <span>{lesson.title}</span>
                                    <form action={deleteLesson.bind(null, lesson.id, course.id)}>
                                        <button className="text-red-500 text-sm">Delete Lesson</button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
