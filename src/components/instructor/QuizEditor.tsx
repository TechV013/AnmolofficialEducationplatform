"use client";
import { useState } from "react";
import { addQuestion, deleteQuestion, deleteQuiz } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { QuestionForm } from "./QuestionForm";

export function QuizEditor({ quiz, courseId, lessonId }: { quiz: any, courseId: string, lessonId: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Quiz Editor</h3>
        <form action={() => deleteQuiz(quiz.id, courseId)}>
            <button className="text-red-500 text-sm">Delete Quiz</button>
        </form>
      </div>
      <div className="space-y-4">
        {quiz.questions.map((q: any) => (
            <div key={q.id} className="p-3 border rounded">
                <p className="font-medium">{q.text}</p>
                <form action={() => deleteQuestion(q.id, courseId)}><button className="text-red-500 text-xs">Delete Question</button></form>
            </div>
        ))}
        <QuestionForm quizId={quiz.id} courseId={courseId} />
      </div>
    </div>
  );
}