"use client";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { updateProgress } from "../../actions";
import { useRouter } from "next/navigation";
import { Lesson, Resource, Course } from "@/types/lms";
import Sidebar from "@/components/classroom/Sidebar";
import Link from "next/link";

interface Props {
  course: Course;
  lesson: Lesson & { resources: Resource[] };
  initialProgress: { position: number; completed: boolean } | null;
  courseId: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
}

export default function ClassroomClient({ course, lesson, initialProgress, courseId, prevLessonId, nextLessonId }: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialProgress?.completed || false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const saveProgress = async (seconds: number, isComplete: boolean) => {
    await updateProgress(lesson.id, Math.floor(seconds), isComplete);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar courseId={courseId} lessonId={lesson.id} modules={course.modules} />
      
      <main className="flex-1 h-screen overflow-y-auto">
        <header className="bg-surface border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
          <Link href="/dashboard" className="text-primary font-medium hover:underline">← Back to Dashboard</Link>
          <h1 className="font-bold text-text">{course.title}</h1>
          <div />
        </header>

        <div className="p-6 md:p-8 max-w-4xl mx-auto">
           {lesson.videoUrl && (
               <div className="bg-black aspect-video w-full rounded-2xl overflow-hidden shadow-lg mb-6">
                 <video ref={videoRef} src={lesson.videoUrl} className="w-full h-full" controls />
               </div>
           )}
           
           <h1 className="text-3xl font-bold text-text">{lesson.title}</h1>
           <p className="text-muted mt-2">{lesson.description}</p>
           
           <button 
                 onClick={() => { setCompleted(true); saveProgress(0, true); router.refresh(); }}
                 className={cn("mt-6 px-6 py-3 rounded-full font-bold text-white transition-colors", completed ? "bg-green-600" : "bg-primary hover:bg-primary-hover")}
              >
                 {completed ? "✓ Lesson Completed" : "Mark as Complete"}
           </button>
           
           {/* Resources */}
           {lesson.resources.length > 0 && (
             <div className="mt-10 p-6 bg-surface rounded-2xl border border-border">
                <h2 className="font-bold text-text text-lg mb-4">Resources</h2>
                {lesson.resources.map(r => <a key={r.id} href={r.url} className="block text-primary hover:underline hover:text-primary-hover mb-2">{r.title} ({r.type})</a>)}
             </div>
           )}

           <div className="mt-8 flex justify-between border-t border-border pt-8">
              {prevLessonId ? (
                  <Link href={`/classroom/${courseId}/${prevLessonId}`} className="text-text hover:text-primary font-medium">← Previous Lesson</Link>
              ) : <div />}
              {nextLessonId ? (
                  <Link href={`/classroom/${courseId}/${nextLessonId}`} className="text-primary font-bold hover:text-primary-hover">Next Lesson →</Link>
              ) : <div />}
           </div>
        </div>
      </main>
    </div>
  );
}
