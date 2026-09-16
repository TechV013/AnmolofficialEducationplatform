"use client";
import { useState } from "react";
import { addQuestion } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

export function QuestionForm({ quizId, courseId }: { quizId: string, courseId: string }) {
  const [text, setText] = useState("");
  return (
    <form action={() => { addQuestion(quizId, text, courseId); setText(""); }} className="flex gap-2">
      <input value={text} onChange={e => setText(e.target.value)} placeholder="New Question" className="flex-1 px-3 py-2 rounded border" required />
      <button className="bg-primary text-white px-4 py-2 rounded">Add</button>
    </form>
  );
}