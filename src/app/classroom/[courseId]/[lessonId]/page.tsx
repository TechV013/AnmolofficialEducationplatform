"use client";
import { Course, Module, Lesson } from "@/types/lms";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { courses } from "@/data/courses";
import { cn } from "@/lib/utils";
import { Play, ChevronLeft, ChevronRight, Check, FileText, Download, BookOpen, Save } from "lucide-react";

export default function ClassroomPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const course = courses.find((c) => c.id === courseId) as Course | undefined;

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [position, setPosition] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"resources" | "assignment" | "notes">("resources");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load progress
  useEffect(() => {
    if (!course || !lessonId) return;
    const saved = localStorage.getItem(`lms_progress_${courseId}_${lessonId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setPosition(data.position || 0);
      setCompleted(data.completed || false);
    }
    const lesson = course.modules.flatMap(m => m.lessons).find(l => l.id === lessonId);
    if (lesson) setCurrentLesson(lesson);
  }, [courseId, lessonId, course]);

  // Auto-save position
  const savePosition = useCallback(() => {
    if (!courseId || !lessonId || !videoRef.current) return;
    const pos = videoRef.current.currentTime;
    setPosition(pos);
    const totalDuration = videoRef.current.duration || 1;
    const isComplete = pos >= totalDuration * 0.9;
    if (isComplete) {
      setCompleted(true);
      localStorage.setItem(`lms_progress_${courseId}_${lessonId}`, JSON.stringify({ position: pos, completed: true }));
    } else {
      localStorage.setItem(`lms_progress_${courseId}_${lessonId}`, JSON.stringify({ position: pos, completed: false }));
    }
  }, [courseId, lessonId]);

  // Resume playback
  useEffect(() => {
    if (videoRef.current && position > 0 && !completed) {
      videoRef.current.currentTime = position;
    }
  }, []);

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  const currentModuleIndex = course!.modules.findIndex(m => m.lessons.some(l => l.id === lessonId));
  const currentLessonIndex = course!.modules[currentModuleIndex]?.lessons.findIndex(l => l.id === lessonId) || 0;
  const allLessons = course!.modules.flatMap(m => m.lessons);
  const isLastLesson = currentLessonIndex === allLessons.length - 1;
  const prevLesson = allLessons[Math.max(0, currentLessonIndex - 1)];
  const nextLesson = allLessons[Math.min(allLessons.length - 1, currentLessonIndex + 1)];

  const allCompleted = allLessons.filter(l => localStorage.getItem(`lms_progress_${courseId}_${l.id}`)).length;
  const progressPct = Math.round((allCompleted / allLessons.length) * 100);

  return (
    <main className="min-h-screen bg-light-gray">
      <div className="flex flex-col h-screen">
        {/* Top bar */}
        <div className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-sm sm:text-base">{course.title}</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
              {progressPct}% complete
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-primary text-sm font-semibold">
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Video Player */}
            <div className="bg-black relative aspect-video w-full">
              <video
                ref={videoRef}
                src={currentLesson.videoUrl || "/images/founder.png"}
                className="w-full h-full object-contain"
                onTimeUpdate={savePosition}
                onEnded={() => {
                  setCompleted(true);
                  if (courseId && lessonId) {
                    localStorage.setItem(`lms_progress_${courseId}_${lessonId}`, JSON.stringify({ position: videoRef.current?.duration || 0, completed: true }));
                  }
                }}
              />
              {!videoRef.current?.src && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                    <p className="text-lg font-bold">{currentLesson.title}</p>
                    <p className="text-sm opacity-70">{currentLesson.duration}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="p-4 sm:p-6 bg-white border-b">
              <h3 className="text-lg font-bold text-black">{currentLesson.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{currentLesson.description}</p>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => {
                    const video = videoRef.current;
                    if (video) video.currentTime = Math.max(0, video.currentTime - 10);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  ← 10s
                </button>
                {completed ? (
                  <button className="px-4 py-2 bg-blue text-white rounded-lg text-sm font-semibold">
                    <Check className="w-4 h-4 inline mr-1" /> Completed
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const video = videoRef.current;
                      if (video) video.play();
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
                  >
                    <Play className="w-4 h-4 inline mr-1" /> Play
                  </button>
                )}

                {!isLastLesson && (
                  <button
                    onClick={() => router.push(`/classroom/${courseId}/${nextLesson.id}`)}
                    className="px-4 py-2 bg-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-hover transition-colors ml-auto"
                  >
                    Next Lesson →
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white">
              <div className="flex border-b px-4 sm:px-6">
                {(["resources", "assignment", "notes"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-3 text-sm font-semibold border-b-2 transition-colors capitalize",
                      activeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {tab === "resources" && <><Download className="w-4 h-4 inline mr-1" /> Resources</>}
                    {tab === "assignment" && <><FileText className="w-4 h-4 inline mr-1" /> Assignment</>}
                    {tab === "notes" && <><Save className="w-4 h-4 inline mr-1" /> Notes</>}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === "resources" && (
                  <div className="space-y-3">
                    {currentLesson.resources.length > 0 ? currentLesson.resources.map((r: any) => (
                      <a key={r.id} href={r.url} className="flex items-center gap-3 p-3 bg-light-gray rounded-xl hover:bg-gray-200 transition-colors">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{r.title}</p>
                          <p className="text-xs text-gray-400 capitalize">{r.type}</p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 ml-auto" />
                      </a>
                    )) : (
                      <p className="text-gray-400 text-sm">No resources for this lesson.</p>
                    )}
                  </div>
                )}

                {activeTab === "assignment" && currentLesson.assignment && (
                  <div className="space-y-4">
                    <div className="p-4 bg-light-gray rounded-xl">
                      <h4 className="font-bold mb-2">{currentLesson.assignment.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{currentLesson.assignment.instructions}</p>
                      <p className="text-xs text-gray-400">Due: {currentLesson.assignment.dueDate}</p>
                    </div>
                    <textarea
                      placeholder="Describe your solution or paste your work here..."
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      rows={4}
                    />
                    <button className="bg-primary text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-primary-hover transition-colors">
                      Submit Assignment
                    </button>
                  </div>
                )}

                {activeTab === "assignment" && !currentLesson.assignment && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">No assignment for this lesson yet.</p>
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Take notes for this lesson... (auto-saved)"
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        localStorage.setItem(`lms_note_${courseId}_${lessonId}`, e.target.value);
                      }}
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      rows={6}
                    />
                    {localStorage.getItem(`lms_note_${courseId}_${lessonId}`) && (
                      <div className="p-4 bg-soft-cream rounded-xl">
                        <p className="text-xs text-gray-400 mb-1">Last saved note:</p>
                        <p className="text-sm">{localStorage.getItem(`lms_note_${courseId}_${lessonId}`)}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Save className="w-3 h-3" />
                      Notes are saved automatically in your browser.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Curriculum */}
          <div className="hidden lg:block w-72 bg-white border-l overflow-y-auto">
            <div className="p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-4 uppercase tracking-wider">Curriculum</h3>
              <div className="space-y-1">
                {course.modules.map((mod, modIdx) => (
                  <div key={mod.id}>
                    <div className="bg-primary/5 text-primary text-xs font-bold px-3 py-2 rounded-lg mt-2">
                      Module {modIdx + 1}: {mod.title}
                    </div>
                    {mod.lessons.map((lesson, lessonIdx) => {
                      const isActive = lesson.id === lessonId;
                      const isDone = localStorage.getItem(`lms_progress_${courseId}_${lesson.id}`);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => router.push(`/classroom/${courseId}/${lesson.id}`)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1",
                            isActive ? "bg-primary text-white font-semibold" : isDone ? "text-gray-500" : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          {isDone ? (
                            <Check className="w-4 h-4 text-blue flex-shrink-0" />
                          ) : isActive ? (
                            <div className="w-4 h-4 border-2 border-white rounded-full flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
