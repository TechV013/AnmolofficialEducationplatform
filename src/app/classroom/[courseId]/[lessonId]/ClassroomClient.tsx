"use client";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { updateProgress } from "../../actions";
import { useRouter } from "next/navigation";
import { Lesson, Resource, Course } from "@/types/lms";
import Sidebar from "@/components/classroom/Sidebar";
import Link from "next/link";
import QuizCard from "./QuizCard";
import AssignmentBox from "./AssignmentBox";

function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "html5"; embedUrl: string } {
  if (!url) return { type: "html5", embedUrl: "" };

  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  }

  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }

  return { type: "html5", embedUrl: url };
}

interface QuizView {
  id: string;
  questions: { id: string; text: string; options: { id: string; text: string }[] }[];
}

interface AttemptView {
  id: string;
  score: number;
  passed: boolean;
  attemptedAt: Date;
}

interface Props {
  course: Course;
  lesson: Lesson & { resources: Resource[] };
  initialProgress: { position: number; completed: boolean };
  courseId: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
  progressMap: Record<string, { completed: boolean; watchedSeconds: number; }>;
  quiz?: QuizView | null;
  previousAttempts?: AttemptView[];
  assignment?: any;
  lessonResources: { id: string; title: string; type: string; url: string }[];
}

export default function ClassroomClient({ course, lesson, initialProgress, courseId, prevLessonId, nextLessonId, progressMap, quiz, previousAttempts, assignment, lessonResources }: Props) {
  const [completed, setCompleted] = useState(progressMap[lesson.id]?.completed || initialProgress.completed || false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();

  const saveProgress = async (seconds: number, isComplete: boolean) => {
    try {
      await updateProgress(lesson.id, Math.floor(seconds), isComplete);
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  };

  const mediaInfo = getEmbedUrl(lesson.videoUrl || "");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden lg:block w-80 shrink-0">
        <Sidebar courseId={courseId} lessonId={lesson.id} modules={course.modules} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 bg-white border-b border-border flex items-center justify-between lg:hidden">
          <span className="font-bold text-sm truncate">{course.title}</span>
          <Link href="/my-learning" className="text-xs font-semibold text-primary">My Learning</Link>
        </div>

        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
           <div className="bg-black aspect-video w-full rounded-2xl overflow-hidden shadow-lg mb-6 flex items-center justify-center">
             {lesson.videoUrl ? (
               mediaInfo.type === "youtube" || mediaInfo.type === "vimeo" ? (
                 <iframe
                   src={mediaInfo.embedUrl}
                   title={lesson.title}
                   className="h-full w-full border-0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 />
               ) : (
                 <video
                   ref={videoRef}
                   src={lesson.videoUrl}
                   className="w-full h-full object-contain"
                   controls
                   playsInline
                   onTimeUpdate={() => {
                     if (videoRef.current && Math.floor(videoRef.current.currentTime) % 10 === 0) {
                       saveProgress(videoRef.current.currentTime, completed);
                     }
                   }}
                   onEnded={() => {
                     setCompleted(true);
                     saveProgress(videoRef.current?.currentTime || 0, true);
                     router.refresh();
                   }}
                 />
               )
             ) : (
               <div className="text-white text-center p-6">
                 <p className="text-lg font-bold">Video unavailable</p>
                 <p className="text-sm text-gray-300">This lesson does not yet have a video assigned.</p>
               </div>
             )}
           </div>
           
           <h1 className="text-3xl font-bold text-text">{lesson.title}</h1>
           <p className="text-muted mt-2">{lesson.description}</p>
           
           <button 
              onClick={() => { setCompleted(true); saveProgress(videoRef.current?.currentTime || 0, true); router.refresh(); }}
              className={cn("mt-6 px-6 py-3 rounded-full font-bold text-white transition-colors", completed ? "bg-green-600" : "bg-primary hover:bg-primary-hover")}
           >
              {completed ? "✓ Lesson Completed" : "Mark as Complete"}
           </button>
           
           {/* Quiz / Assignment */}
           {quiz && (
             <div className="mt-8">
               <QuizCard quiz={quiz} previousAttempts={previousAttempts || []} />
             </div>
           )}

           {assignment && (
             <div className="mt-8">
               <AssignmentBox assignment={assignment} />
             </div>
           )}

           {/* Resources */}
           <div className="mt-10">
             <h3 className="text-lg font-bold text-text mb-4">Downloadable Resources</h3>
             {lessonResources.length > 0 ? (
               <div className="space-y-2">
                 {lessonResources.map(r => (
                   <a key={r.id} href={r.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white rounded-xl border border-border hover:border-primary transition-colors">
                     <span className="font-medium text-text text-sm">{r.title}</span>
                     <span className="text-xs font-bold text-primary uppercase bg-soft-blue px-2.5 py-1 rounded-md">{r.type}</span>
                   </a>
                 ))}
               </div>
             ) : (
               <div className="p-6 bg-surface rounded-2xl border border-border text-muted text-sm">No resources available for this lesson.</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
