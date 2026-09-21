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
import VideoPlayer from "@/components/video/VideoPlayer";
import Tabs from "@/components/ui/Tabs";
import NotesEditor from "./NotesEditor";
import { ArrowLeft, ArrowRight, Download, FileText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

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
  progressMap: Record<string, { completed: boolean; watchedSeconds: number }>;
  quiz?: QuizView | null;
  previousAttempts?: AttemptView[];
  assignment?: any;
  lessonResources: { id: string; title: string; type: string; url: string }[];
  noteContent?: string;
}

export default function ClassroomClient({
  course, lesson, initialProgress, courseId, prevLessonId, nextLessonId,
  progressMap, quiz, previousAttempts, assignment, lessonResources, noteContent,
}: Props) {
  const [completed, setCompleted] = useState(progressMap[lesson.id]?.completed || initialProgress.completed || false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const saveProgress = async (seconds: number, isComplete: boolean) => {
    try {
      await updateProgress(lesson.id, Math.floor(seconds), isComplete);
    } catch (e) {
      console.error("Failed to save progress:", e);
      toast("Progress not saved. Will retry...", "error");
    }
  };

  const handleTimeUpdate = (seconds: number) => {
    saveProgress(seconds, completed);
  };

  const handleVideoEnded = () => {
    setCompleted(true);
    saveProgress(0, true);
    router.refresh();
  };

  const handleMarkComplete = () => {
    setCompleted(true);
    saveProgress(videoRef.current?.currentTime || 0, true);
    router.refresh();
  };

  const prevLesson = prevLessonId
    ? course.modules
        .sort((a, b) => a.position - b.position)
        .flatMap(m => m.lessons.sort((a, b) => a.position - b.position))
        .find(l => l.id === prevLessonId)
    : null;

  const nextLesson = nextLessonId
    ? course.modules
        .sort((a, b) => a.position - b.position)
        .flatMap(m => m.lessons.sort((a, b) => a.position - b.position))
        .find(l => l.id === nextLessonId)
    : null;

  const tabItems = [
    {
      label: "Overview",
      content: (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-text">{lesson.title}</h1>
            <p className="text-muted mt-2 leading-relaxed">{lesson.description}</p>
          </div>
          <button
            onClick={handleMarkComplete}
            className={cn(
              "px-6 py-3 rounded-full font-bold text-white transition-colors",
              completed ? "bg-green-600" : "bg-primary hover:bg-primary-hover"
            )}
          >
            {completed ? "✓ Lesson Completed" : "Mark as Complete"}
          </button>
          {assignment && (
            <AssignmentBox assignment={assignment} />
          )}
        </div>
      ),
    },
    {
      label: "Notes",
      content: (
        <NotesEditor
          lessonId={lesson.id}
          initialContent={noteContent || ""}
        />
      ),
    },
    {
      label: "Resources",
      content: (
        <div>
          {lessonResources.length > 0 ? (
            <div className="space-y-2">
              {lessonResources.map(r => (
                <a
                  key={r.id}
                  href={r.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted shrink-0" />
                    <span className="font-medium text-text text-sm">{r.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary uppercase bg-soft-blue px-2.5 py-1 rounded-md">{r.type}</span>
                    <Download className="h-4 w-4 text-muted" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-surface rounded-2xl border border-border text-muted text-sm">
              No resources available for this lesson.
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Q&A",
      content: (
        <div className="p-6 bg-surface rounded-2xl border border-border text-center">
          <p className="text-muted text-sm">Q&A coming soon. Ask questions and discuss with fellow students.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden lg:block w-80 shrink-0">
        <Sidebar
          courseId={courseId}
          lessonId={lesson.id}
          modules={course.modules}
          progressMap={progressMap}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 bg-white border-b border-border flex items-center justify-between lg:hidden">
          <span className="font-bold text-sm truncate">{course.title}</span>
          <Link href="/my-learning" className="text-xs font-semibold text-primary">My Learning</Link>
        </div>

        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
          <VideoPlayer
            url={lesson.videoUrl || ""}
            title={lesson.title}
            mode="classroom"
            savedPosition={initialProgress.position}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
          />

          <div className="mt-6">
            <Tabs items={tabItems} />
          </div>

          {quiz && (
            <div className="mt-8">
              <QuizCard quiz={quiz} previousAttempts={previousAttempts || []} />
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            {prevLessonId ? (
              <Link
                href={`/classroom/${courseId}/${prevLessonId}`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-white text-sm font-bold text-text hover:bg-slate-50 transition-colors max-w-[45%]"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">{prevLesson?.title || "Previous Lesson"}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextLessonId ? (
              <Link
                href={`/classroom/${courseId}/${nextLessonId}`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary-hover transition-colors max-w-[45%]"
              >
                <span className="truncate">{nextLesson?.title || "Next Lesson"}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            ) : (
              <div className="px-4 py-3 rounded-xl bg-green-100 text-sm font-bold text-green-700">
                ✓ Course Complete
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
