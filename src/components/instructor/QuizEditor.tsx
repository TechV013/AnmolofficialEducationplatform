"use client";
import { useState } from "react";
import { addQuestion, deleteQuestion, updateQuestion, addOption, deleteOption, updateOption } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export function QuizEditor({ quiz, courseId }: { quiz: Quiz, courseId: string }) {
  const [newQuestion, setNewQuestion] = useState("");

  return (
    <div className="space-y-4">
      {quiz.questions.map((q) => (
        <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
          <input defaultValue={q.text} className="w-full font-bold bg-transparent border-b p-1 mb-2" onBlur={(e) => updateQuestion(q.id, e.target.value, courseId)} />
          <div className="space-y-1">
            {q.options.map((o) => (
              <div key={o.id} className="flex gap-2 items-center">
                  <input type="checkbox" defaultChecked={o.isCorrect} onChange={(e) => updateOption(o.id, o.text, e.target.checked, courseId)} />
                  <input defaultValue={o.text} className="flex-1 p-1" onBlur={e => updateOption(o.id, e.target.value, o.isCorrect, courseId)} />
                  <button onClick={() => deleteOption(o.id, courseId)} className="text-red-500 text-xs">Del</button>
              </div>
            ))}
            <form action={async (formData) => {
                const text = formData.get("text") as string;
                await addOption(q.id, text, false, courseId);
            }} className="flex gap-2 mt-2">
                <input name="text" placeholder="New Option" className="flex-1 p-1 text-sm" required />
                <button className="text-xs bg-gray-200 px-2 py-1">+Opt</button>
            </form>
          </div>
          <button onClick={() => deleteQuestion(q.id, courseId)} className="text-red-500 text-xs mt-3">Delete Question</button>
        </div>
      ))}
      <form action={async (formData) => {
          const text = formData.get("text") as string;
          await addQuestion(quiz.id, text, courseId);
          setNewQuestion("");
      }} className="flex gap-2 p-4 border rounded-lg bg-white">
        <input name="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="New Question" className="flex-1 p-2 border rounded" required />
        <button className="bg-primary text-white px-4 py-2 rounded">Add Question</button>
      </form>
    </div>
  );
}