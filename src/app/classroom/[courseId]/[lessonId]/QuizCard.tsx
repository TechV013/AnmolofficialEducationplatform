"use client";
import { useState } from "react";
import { submitQuiz } from "../../actions";

interface QuizQuestionView {
  id: string;
  text: string;
  options: { id: string; text: string }[];
}

interface AttemptView {
  id: string;
  score: number;
  passed: boolean;
  attemptedAt: Date;
}

export default function QuizCard({ quiz, previousAttempts }: {
  quiz: { id: string; questions: QuizQuestionView[] };
  previousAttempts: AttemptView[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (quiz.questions.length === 0) {
    return (
      <div className="mt-10 p-6 bg-surface rounded-2xl border border-border">
        <h2 className="font-bold text-text text-lg mb-2">Quiz</h2>
        <p className="text-muted text-sm">This quiz has no questions yet.</p>
      </div>
    );
  }

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const payload = Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId }));
      if (payload.length !== quiz.questions.length) {
        throw new Error("Answer all questions before submitting.");
      }
      const res = await submitQuiz(quiz.id, payload);
      setResult({ score: res.score, total: res.total });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 p-6 bg-surface rounded-2xl border border-border">
      <h2 className="font-bold text-text text-lg mb-1">Quiz</h2>

      {previousAttempts.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted mb-1">Previous attempts:</p>
          <div className="flex gap-2 flex-wrap">
            {previousAttempts.map(a => (
              <span key={a.id} className={`text-xs px-2 py-1 rounded-full font-semibold ${a.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {a.score}/{quiz.questions.length} · {new Date(a.attemptedAt).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {quiz.questions.map((q, qi) => (
        <div key={q.id} className="mb-6">
          <p className="font-semibold text-sm mb-3">{qi + 1}. {q.text}</p>
          <div className="space-y-2">
            {q.options.map(o => {
              const selected = answers[q.id] === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: o.id }))}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                    selected ? "bg-primary text-white border-primary" : "bg-white border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  {o.text}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {result ? (
        <div className={`p-4 rounded-xl text-sm font-bold ${result.score === result.total ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {result.score === result.total
            ? `Perfect score! ${result.score}/${result.total} correct.`
            : `You scored ${result.score}/${result.total}.`}
        </div>
      ) : (
        <>
          <button onClick={submit} disabled={busy} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-60">
            {busy ? "Submitting..." : "Submit Quiz"}
          </button>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}